import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { LoggerService } from '../../core/logger/logger.service';
import { RedisService } from '../../core/redis/redis.service';

// DTOs
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private loggerService: LoggerService,
    private redisService: RedisService,
  ) {}

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(userId)
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { ...updateProfileDto, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logUserActivity('profile_updated', userId, updateProfileDto);

    return user;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // TODO: Implement file upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll return a placeholder
    const avatarUrl = `https://example.com/avatars/${userId}-${Date.now()}.jpg`;

    await this.userModel
      .findByIdAndUpdate(userId, { avatar: avatarUrl, updatedAt: new Date() })
      .exec();

    this.loggerService.logUserActivity('avatar_uploaded', userId);

    return { avatarUrl };
  }

  /**
   * Update reading preferences
   */
  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdatePreferencesDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { ...updatePreferencesDto, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logUserActivity('preferences_updated', userId, updatePreferencesDto);

    return user;
  }

  /**
   * Get user reading statistics
   */
  async getReadingStats(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('totalReadingTime totalAyahsRead totalSurahsCompleted totalJuzCompleted quranCompletions currentStreak longestStreak rewardPoints level experience')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get additional stats from Redis if available
    const todayReadingTime = await this.redisService.get(`user:${userId}:today_reading_time`) || '0';
    const weeklyReadingTime = await this.redisService.get(`user:${userId}:weekly_reading_time`) || '0';

    return {
      ...user.toObject(),
      todayReadingTime: parseInt(todayReadingTime),
      weeklyReadingTime: parseInt(weeklyReadingTime),
    };
  }

  /**
   * Connect Solana wallet
   */
  async connectWallet(userId: string, connectWalletDto: ConnectWalletDto): Promise<{ message: string }> {
    const { walletAddress, signature } = connectWalletDto;

    // TODO: Verify wallet signature
    // For now, we'll just store the wallet address

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          walletAddress,
          walletConnected: true,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logBlockchainTransaction('wallet_connected', userId, undefined, {
      walletAddress,
    });

    return { message: 'Wallet connected successfully' };
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(userId: string): Promise<{ message: string }> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          walletConnected: false,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logBlockchainTransaction('wallet_disconnected', userId);

    return { message: 'Wallet disconnected successfully' };
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId: string): Promise<{ badges: string[] }> {
    const user = await this.userModel
      .findById(userId)
      .select('badges')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { badges: user.badges };
  }

  /**
   * Get friends list
   */
  async getFriends(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate('friends', 'name email avatar level rewardPoints')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const friendRequests = await this.userModel
      .find({ _id: { $in: user.friendRequests } })
      .select('name email avatar')
      .exec();

    return {
      friends: user.friends,
      pendingRequests: friendRequests,
    };
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(userId: string, targetUserId: string): Promise<{ message: string }> {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const [user, targetUser] = await Promise.all([
      this.userModel.findById(userId).exec(),
      this.userModel.findById(targetUserId).exec(),
    ]);

    if (!user || !targetUser) {
      throw new NotFoundException('User not found');
    }

    if (user.friends.includes(targetUserId)) {
      throw new ConflictException('Already friends with this user');
    }

    if (targetUser.friendRequests.includes(userId)) {
      throw new ConflictException('Friend request already sent');
    }

    targetUser.friendRequests.push(userId);
    await targetUser.save();

    this.loggerService.logUserActivity('friend_request_sent', userId, { targetUserId });

    return { message: 'Friend request sent successfully' };
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(userId: string, friendUserId: string): Promise<{ message: string }> {
    const [user, friendUser] = await Promise.all([
      this.userModel.findById(userId).exec(),
      this.userModel.findById(friendUserId).exec(),
    ]);

    if (!user || !friendUser) {
      throw new NotFoundException('User not found');
    }

    if (!user.friendRequests.includes(friendUserId)) {
      throw new BadRequestException('No pending friend request from this user');
    }

    // Add to friends lists
    user.friends.push(friendUserId);
    friendUser.friends.push(userId);

    // Remove from friend requests
    user.friendRequests = user.friendRequests.filter(id => id !== friendUserId);

    await Promise.all([user.save(), friendUser.save()]);

    this.loggerService.logUserActivity('friend_request_accepted', userId, { friendUserId });

    return { message: 'Friend request accepted' };
  }

  /**
   * Reject friend request
   */
  async rejectFriendRequest(userId: string, friendUserId: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.friendRequests.includes(friendUserId)) {
      throw new BadRequestException('No pending friend request from this user');
    }

    user.friendRequests = user.friendRequests.filter(id => id !== friendUserId);
    await user.save();

    this.loggerService.logUserActivity('friend_request_rejected', userId, { friendUserId });

    return { message: 'Friend request rejected' };
  }

  /**
   * Remove friend
   */
  async removeFriend(userId: string, friendUserId: string): Promise<{ message: string }> {
    const [user, friendUser] = await Promise.all([
      this.userModel.findById(userId).exec(),
      this.userModel.findById(friendUserId).exec(),
    ]);

    if (!user || !friendUser) {
      throw new NotFoundException('User not found');
    }

    if (!user.friends.includes(friendUserId)) {
      throw new BadRequestException('Not friends with this user');
    }

    // Remove from both friends lists
    user.friends = user.friends.filter(id => id !== friendUserId);
    friendUser.friends = friendUser.friends.filter(id => id !== userId);

    await Promise.all([user.save(), friendUser.save()]);

    this.loggerService.logUserActivity('friend_removed', userId, { friendUserId });

    return { message: 'Friend removed successfully' };
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    userId: string,
    updateNotificationSettingsDto: UpdateNotificationSettingsDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { ...updateNotificationSettingsDto, updatedAt: new Date() },
        { new: true }
      )
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logUserActivity('notification_settings_updated', userId, updateNotificationSettingsDto);

    return user;
  }

  /**
   * Search users
   */
  async searchUsers(query: GetUsersQueryDto, currentUserId: string): Promise<any> {
    const { q, limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const searchQuery: any = {
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { isActive: true },
        { profilePublic: true },
      ],
    };

    if (q) {
      searchQuery.$and.push({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      });
    }

    const users = await this.userModel
      .find(searchQuery)
      .select('name email avatar level rewardPoints')
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.userModel.countDocuments(searchQuery);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(type: 'points' | 'reading_time' | 'level', limit: number): Promise<any> {
    const cacheKey = `leaderboard:${type}:${limit}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const sortField = type === 'points' ? 'rewardPoints' : 
                     type === 'reading_time' ? 'totalReadingTime' : 'level';

    const users = await this.userModel
      .find({ 
        isActive: true, 
        showOnLeaderboard: true,
        [sortField]: { $gt: 0 }
      })
      .select('name avatar level rewardPoints totalReadingTime')
      .sort({ [sortField]: -1 })
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
      value: user[sortField],
    }));

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(leaderboard), 300);

    return leaderboard;
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
        }
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logUserActivity('account_deleted', userId);

    return { message: 'Account deleted successfully' };
  }
}