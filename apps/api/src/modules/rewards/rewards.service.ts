import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Reward, RewardDocument, RewardType, RewardStatus } from './schemas/reward.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from './schemas/transaction.schema';
import { Badge, BadgeDocument } from './schemas/badge.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

import { LoggerService } from '../../core/logger/logger.service';
import { RedisService } from '../../core/redis/redis.service';
import { BlockchainService } from './blockchain.service';

// DTOs
import { ClaimRewardsDto } from './dto/claim-rewards.dto';
import { WithdrawTokensDto } from './dto/withdraw-tokens.dto';
import { GetRewardsQueryDto } from './dto/get-rewards-query.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Badge.name) private badgeModel: Model<BadgeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private loggerService: LoggerService,
    private redisService: RedisService,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * Get user reward balance
   */
  async getBalance(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pendingRewards = await this.rewardModel
      .countDocuments({ userId, status: RewardStatus.PENDING })
      .exec();

    const pendingPoints = await this.rewardModel
      .aggregate([
        { $match: { userId: user._id, status: RewardStatus.PENDING } },
        { $group: { _id: null, total: { $sum: '$points' } } },
      ])
      .exec();

    return {
      totalPoints: user.rewardPoints,
      availablePoints: user.rewardPoints,
      pendingRewards: pendingRewards,
      pendingPoints: pendingPoints[0]?.total || 0,
      claimedRewards: user.claimedRewards,
      level: user.level,
      experience: user.experience,
      walletConnected: user.walletConnected,
      walletAddress: user.walletAddress,
    };
  }

  /**
   * Get user reward history
   */
  async getRewardHistory(userId: string, query: GetRewardsQueryDto): Promise<any> {
    const { limit = 20, page = 1, type, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = { userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const rewards = await this.rewardModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.rewardModel.countDocuments(filter).exec();

    return {
      rewards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get pending rewards
   */
  async getPendingRewards(userId: string): Promise<any> {
    const pendingRewards = await this.rewardModel
      .find({ userId, status: RewardStatus.PENDING })
      .sort({ createdAt: -1 })
      .exec();

    const totalPending = pendingRewards.reduce((sum, reward) => sum + reward.points, 0);

    return {
      rewards: pendingRewards,
      totalRewards: pendingRewards.length,
      totalPoints: totalPending,
    };
  }

  /**
   * Claim rewards
   */
  async claimRewards(userId: string, claimRewardsDto: ClaimRewardsDto): Promise<any> {
    const { rewardIds, claimAll = false } = claimRewardsDto;

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let query: any = { userId, status: RewardStatus.PENDING };
    if (!claimAll && rewardIds?.length) {
      query._id = { $in: rewardIds };
    }

    const rewards = await this.rewardModel.find(query).exec();

    if (!rewards.length) {
      throw new BadRequestException('No pending rewards found');
    }

    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);

    // Update rewards status
    await this.rewardModel
      .updateMany(
        query,
        {
          status: RewardStatus.CLAIMED,
          claimedAt: new Date(),
        }
      )
      .exec();

    // Update user points
    await this.userModel
      .findByIdAndUpdate(userId, {
        $inc: { 
          rewardPoints: totalPoints,
          totalEarnedPoints: totalPoints,
        },
        updatedAt: new Date(),
      })
      .exec();

    // Clear cached balance
    await this.redisService.del(`user:${userId}:balance`);

    this.loggerService.logRewardEvent('rewards_claimed', userId, totalPoints, {
      rewardCount: rewards.length,
      rewardIds: rewards.map(r => r._id.toString()),
    });

    return {
      message: 'Rewards claimed successfully',
      claimedRewards: rewards.length,
      pointsEarned: totalPoints,
      newBalance: user.rewardPoints + totalPoints,
    };
  }

  /**
   * Withdraw tokens to wallet
   */
  async withdrawTokens(userId: string, withdrawTokensDto: WithdrawTokensDto): Promise<any> {
    const { amount, walletAddress } = withdrawTokensDto;

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.walletConnected || !user.walletAddress) {
      throw new BadRequestException('Wallet not connected');
    }

    if (user.rewardPoints < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create withdrawal transaction
    const transaction = new this.transactionModel({
      userId,
      type: TransactionType.WITHDRAWAL,
      amount,
      status: TransactionStatus.PENDING,
      walletAddress: walletAddress || user.walletAddress,
      description: `Withdrawal of ${amount} tokens`,
      metadata: {
        initiatedBy: userId,
        userBalance: user.rewardPoints,
      },
    });

    await transaction.save();

    // Deduct points from user (hold in escrow)
    await this.userModel
      .findByIdAndUpdate(userId, {
        $inc: { rewardPoints: -amount },
        updatedAt: new Date(),
      })
      .exec();

    // Process blockchain transaction
    try {
      const txHash = await this.blockchainService.withdrawTokens(
        walletAddress || user.walletAddress,
        amount,
      );

      // Update transaction with blockchain info
      transaction.transactionHash = txHash;
      transaction.status = TransactionStatus.PROCESSING;
      transaction.processedAt = new Date();
      await transaction.save();

      this.loggerService.logBlockchainTransaction('withdrawal_initiated', userId, txHash, {
        amount,
        walletAddress: walletAddress || user.walletAddress,
        transactionId: transaction._id.toString(),
      });

      return {
        message: 'Withdrawal initiated successfully',
        transactionId: transaction._id.toString(),
        transactionHash: txHash,
        amount,
        status: 'processing',
      };
    } catch (error) {
      // Refund points if blockchain transaction fails
      await this.userModel
        .findByIdAndUpdate(userId, {
          $inc: { rewardPoints: amount },
          updatedAt: new Date(),
        })
        .exec();

      transaction.status = TransactionStatus.FAILED;
      transaction.failedAt = new Date();
      transaction.failureReason = error.message;
      await transaction.save();

      throw new BadRequestException(`Withdrawal failed: ${error.message}`);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, query: GetTransactionsQueryDto): Promise<any> {
    const { limit = 20, page = 1, type, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = { userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const transactions = await this.transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.transactionModel.countDocuments(filter).exec();

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get specific transaction
   */
  async getTransaction(userId: string, transactionId: string): Promise<any> {
    const transaction = await this.transactionModel
      .findOne({ _id: transactionId, userId })
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get rewards leaderboard
   */
  async getLeaderboard(period: string, limit: number): Promise<any> {
    const cacheKey = `leaderboard:rewards:${period}:${limit}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // For now, we'll use total points. In future, implement period-specific logic
    const users = await this.userModel
      .find({ 
        isActive: true, 
        showOnLeaderboard: true,
        rewardPoints: { $gt: 0 }
      })
      .select('name avatar level rewardPoints totalEarnedPoints')
      .sort({ rewardPoints: -1 })
      .limit(limit)
      .exec();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
      },
      points: user.rewardPoints,
      totalEarned: user.totalEarnedPoints,
    }));

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(leaderboard), 300);

    return leaderboard;
  }

  /**
   * Get available badges
   */
  async getAvailableBadges(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allBadges = await this.badgeModel
      .find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .exec();

    const earnedBadgeIds = user.badges || [];

    const badges = allBadges.map(badge => ({
      ...badge.toObject(),
      earned: earnedBadgeIds.includes(badge.identifier),
      progress: this.calculateBadgeProgress(badge, user),
    }));

    return { badges };
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const earnedBadgeIds = user.badges || [];

    if (!earnedBadgeIds.length) {
      return { badges: [] };
    }

    const badges = await this.badgeModel
      .find({ identifier: { $in: earnedBadgeIds }, isActive: true })
      .sort({ displayOrder: 1 })
      .exec();

    return { badges };
  }

  /**
   * Claim badge
   */
  async claimBadge(userId: string, badgeId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const badge = await this.badgeModel.findOne({ identifier: badgeId, isActive: true }).exec();
    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    if (user.badges?.includes(badgeId)) {
      throw new ConflictException('Badge already claimed');
    }

    // Check if user meets badge requirements
    const meetsRequirements = this.checkBadgeRequirements(badge, user);
    if (!meetsRequirements) {
      throw new BadRequestException('Badge requirements not met');
    }

    // Add badge to user
    await this.userModel
      .findByIdAndUpdate(userId, {
        $push: { badges: badgeId },
        updatedAt: new Date(),
      })
      .exec();

    // Update badge statistics
    await this.badgeModel
      .findByIdAndUpdate(badge._id, {
        $inc: { totalEarned: 1 },
        firstEarnedAt: badge.firstEarnedAt || new Date(),
        firstEarnedBy: badge.firstEarnedBy || userId,
        updatedAt: new Date(),
      })
      .exec();

    // Award badge points if specified
    if (badge.rewardPoints && badge.rewardPoints > 0) {
      await this.awardPoints(userId, badge.rewardPoints, RewardType.ACHIEVEMENT, {
        badgeId,
        badgeName: badge.name,
      });
    }

    this.loggerService.logUserActivity('badge_claimed', userId, {
      badgeId,
      badgeName: badge.name,
      rewardPoints: badge.rewardPoints,
    });

    return {
      message: `Badge "${badge.name}" claimed successfully!`,
      badge: badge.toObject(),
      rewardPoints: badge.rewardPoints || 0,
    };
  }

  /**
   * Get reward statistics
   */
  async getRewardStats(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      totalRewards,
      totalTransactions,
      lifetimeEarned,
      badgeCount,
    ] = await Promise.all([
      this.rewardModel.countDocuments({ userId }).exec(),
      this.transactionModel.countDocuments({ userId }).exec(),
      this.rewardModel.aggregate([
        { $match: { userId: user._id, status: { $in: [RewardStatus.CLAIMED, RewardStatus.PROCESSED] } } },
        { $group: { _id: null, total: { $sum: '$points' } } },
      ]).exec(),
      this.badgeModel.countDocuments({ identifier: { $in: user.badges || [] } }).exec(),
    ]);

    return {
      totalRewards,
      totalTransactions,
      lifetimeEarned: lifetimeEarned[0]?.total || 0,
      badgeCount,
      currentLevel: user.level,
      currentExperience: user.experience,
      totalEarnedPoints: user.totalEarnedPoints,
      claimedRewards: user.claimedRewards,
    };
  }

  /**
   * Get referral information
   */
  async getReferralInfo(userId: string): Promise<any> {
    // TODO: Implement referral system
    return {
      referralCode: `USER${userId.slice(-6).toUpperCase()}`,
      referralCount: 0,
      referralRewards: 0,
      referralLink: `https://quranapp.com/invite/${userId}`,
    };
  }

  /**
   * Process referral
   */
  async processReferral(userId: string, referralCode: string): Promise<any> {
    // TODO: Implement referral processing
    throw new BadRequestException('Referral system not yet implemented');
  }

  /**
   * Award points to user (internal method)
   */
  async awardPoints(
    userId: string,
    points: number,
    type: RewardType,
    metadata: any = {},
    description?: string,
  ): Promise<RewardDocument> {
    const reward = new this.rewardModel({
      userId,
      type,
      points,
      status: RewardStatus.PENDING,
      description: description || `${type} reward`,
      metadata,
    });

    await reward.save();

    this.loggerService.logRewardEvent('points_awarded', userId, points, {
      type,
      rewardId: reward._id.toString(),
      ...metadata,
    });

    return reward;
  }

  /**
   * Helper: Calculate badge progress
   */
  private calculateBadgeProgress(badge: BadgeDocument, user: UserDocument): any {
    const { type, value } = badge.requirements;

    let currentValue = 0;
    let progress = 0;

    switch (type) {
      case 'reading_time':
        currentValue = user.totalReadingTime;
        break;
      case 'surahs_completed':
        currentValue = user.totalSurahsCompleted;
        break;
      case 'streak_days':
        currentValue = user.currentStreak;
        break;
      case 'total_points':
        currentValue = user.totalEarnedPoints;
        break;
      case 'level':
        currentValue = user.level;
        break;
      default:
        currentValue = 0;
    }

    progress = Math.min((currentValue / value) * 100, 100);

    return {
      current: currentValue,
      required: value,
      progress: Math.round(progress),
      completed: currentValue >= value,
    };
  }

  /**
   * Helper: Check if user meets badge requirements
   */
  private checkBadgeRequirements(badge: BadgeDocument, user: UserDocument): boolean {
    const progress = this.calculateBadgeProgress(badge, user);
    return progress.completed;
  }
}