import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { ReadingSession, ReadingSessionDocument } from '../progress/schemas/reading-session.schema';
import { Reward, RewardDocument } from '../rewards/schemas/reward.schema';
import { Transaction, TransactionDocument } from '../rewards/schemas/transaction.schema';
import { AnalyticsEvent, AnalyticsEventDocument } from '../analytics/schemas/analytics-event.schema';

import { LoggerService } from '../../core/logger/logger.service';
import { RedisService } from '../../core/redis/redis.service';
import { RecitationsService } from '../recitations/recitations.service';

// DTOs
import { AdminUserUpdateDto } from './dto/admin-user-update.dto';
import { AdminRewardDto } from './dto/admin-reward.dto';
import { AdminQueryDto } from './dto/admin-query.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ReadingSession.name) private readingSessionModel: Model<ReadingSessionDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(AnalyticsEvent.name) private analyticsEventModel: Model<AnalyticsEventDocument>,
    private loggerService: LoggerService,
    private redisService: RedisService,
    private recitationsService: RecitationsService,
  ) {}

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(): Promise<any> {
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      totalSessions,
      activeSessionsToday,
      totalRewards,
      pendingRewards,
      totalTransactions,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ isActive: true }).exec(),
      this.getUsersRegisteredToday(),
      this.readingSessionModel.countDocuments().exec(),
      this.getActiveSessionsToday(),
      this.rewardModel.countDocuments().exec(),
      this.rewardModel.countDocuments({ status: 'pending' }).exec(),
      this.transactionModel.countDocuments().exec(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
      },
      sessions: {
        total: totalSessions,
        activeToday: activeSessionsToday,
      },
      rewards: {
        total: totalRewards,
        pending: pendingRewards,
      },
      transactions: {
        total: totalTransactions,
      },
    };
  }

  /**
   * Get recent users
   */
  async getRecentUsers(limit: number = 10): Promise<any> {
    const users = await this.userModel
      .find()
      .select('-password -googleId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // Get stats for summary
    const [totalUsers, activeUsers, totalPointsResult] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ isActive: true }).exec(),
      this.userModel.aggregate([
        { $group: { _id: null, totalPoints: { $sum: "$rewardPoints" } } }
      ]).exec()
    ]);

    return {
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name || 'Unknown User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'Unknown',
        status: user.isActive ? 'active' : 'inactive',
        points: user.rewardPoints || 0,
        juzCompleted: user.totalJuzCompleted || 0,
        country: user.metadata?.country || 'Unknown',
        authProvider: user.authProvider || 'local',
        isEmailVerified: user.isEmailVerified || false,
        lastLoginAt: user.lastLoginAt || null
      })),
      stats: {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        totalPoints: totalPointsResult[0]?.totalPoints || 0
      }
    };
  }

  /**
   * Get users with pagination and filters
   */
  async getUsers(query: AdminQueryDto): Promise<any> {
    const { page = 1, limit = 20, search, status, role } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.isActive = status === 'active';
    if (role) filter.role = role;

    const [users, total, totalUsers, activeUsers, totalPointsResult] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -googleId')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ isActive: true }).exec(),
      this.userModel.aggregate([
        { $group: { _id: null, totalPoints: { $sum: "$rewardPoints" } } }
      ]).exec()
    ]);

    return {
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name || 'Unknown User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'Unknown',
        status: user.isActive ? 'active' : 'inactive',
        points: user.rewardPoints || 0,
        juzCompleted: user.totalJuzCompleted || 0,
        country: user.metadata?.country || 'Unknown',
        authProvider: user.authProvider || 'local',
        isEmailVerified: user.isEmailVerified || false,
        lastLoginAt: user.lastLoginAt || null
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        totalPoints: totalPointsResult[0]?.totalPoints || 0
      }
    };
  }

  /**
   * Get specific user
   */
  async getUser(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get additional user data
    const [sessionCount, rewardCount, lastSession] = await Promise.all([
      this.readingSessionModel.countDocuments({ userId }).exec(),
      this.rewardModel.countDocuments({ userId }).exec(),
      this.readingSessionModel
        .findOne({ userId })
        .sort({ createdAt: -1 })
        .exec(),
    ]);

    return {
      ...user.toObject(),
      stats: {
        totalSessions: sessionCount,
        totalRewards: rewardCount,
        lastSession: lastSession?.createdAt,
      },
    };
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateDto: AdminUserUpdateDto, adminId: string): Promise<any> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateDto, { new: true })
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logUserActivity('admin_user_updated', adminId, {
      targetUserId: userId,
      updates: updateDto,
    });

    return user;
  }

  /**
   * Suspend user
   */
  async suspendUser(userId: string, reason: string, adminId: string): Promise<any> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          isActive: false,
          suspendedAt: new Date(),
          suspendedReason: reason,
        },
        { new: true }
      )
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logUserActivity('admin_user_suspended', adminId, {
      targetUserId: userId,
      reason,
    });

    return { message: 'User suspended successfully', user };
  }

  /**
   * Activate user
   */
  async activateUser(userId: string, adminId: string): Promise<any> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          isActive: true,
          $unset: { suspendedAt: 1, suspendedReason: 1 },
        },
        { new: true }
      )
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.loggerService.logUserActivity('admin_user_activated', adminId, {
      targetUserId: userId,
    });

    return { message: 'User activated successfully', user };
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, adminId: string): Promise<any> {
    const user = await this.userModel.findByIdAndDelete(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Clean up user data in other collections

    this.loggerService.logUserActivity('admin_user_deleted', adminId, {
      targetUserId: userId,
      userEmail: user.email,
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(query: AdminQueryDto): Promise<any> {
    const dateRange = this.getDateRange(query.period || 'month');

    const analytics = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          registrations: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]).exec();

    return { period: query.period || 'month', data: analytics };
  }

  /**
   * Get reading analytics
   */
  async getReadingAnalytics(query: AdminQueryDto): Promise<any> {
    const dateRange = this.getDateRange(query.period || 'month');

    const analytics = await this.readingSessionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          sessions: { $sum: 1 },
          totalReadingTime: { $sum: '$activeReadingTime' },
          totalAyahs: { $sum: '$totalAyahs' },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          _id: 1,
          sessions: 1,
          totalReadingTime: 1,
          totalAyahs: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]).exec();

    return { period: query.period || 'month', data: analytics };
  }

  /**
   * Get rewards analytics
   */
  async getRewardsAnalytics(query: AdminQueryDto): Promise<any> {
    const dateRange = this.getDateRange(query.period || 'month');

    const analytics = await this.rewardModel.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            status: '$status',
          },
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]).exec();

    return { period: query.period || 'month', data: analytics };
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(type: string, format: string, adminId: string): Promise<any> {
    // TODO: Implement data export functionality
    this.loggerService.logUserActivity('admin_export_requested', adminId, {
      type,
      format,
    });

    return { message: 'Export initiated', exportId: `export_${Date.now()}` };
  }

  /**
   * Get pending rewards
   */
  async getPendingRewards(query: AdminQueryDto): Promise<any> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const rewards = await this.rewardModel
      .find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.rewardModel.countDocuments({ status: 'pending' }).exec();

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
   * Process rewards
   */
  async processRewards(rewardIds: string[], adminId: string): Promise<any> {
    const result = await this.rewardModel
      .updateMany(
        { _id: { $in: rewardIds }, status: 'pending' },
        { status: 'processed', processedAt: new Date() }
      )
      .exec();

    this.loggerService.logUserActivity('admin_rewards_processed', adminId, {
      rewardIds,
      processedCount: result.modifiedCount,
    });

    return {
      message: `${result.modifiedCount} rewards processed successfully`,
      processedCount: result.modifiedCount,
    };
  }

  /**
   * Manual reward adjustment
   */
  async manualRewardAdjustment(dto: AdminRewardDto, adminId: string): Promise<any> {
    // TODO: Implement manual reward adjustment logic
    this.loggerService.logUserActivity('admin_reward_adjusted', adminId, dto);

    return { message: 'Reward adjustment completed' };
  }

  /**
   * Get transactions
   */
  async getTransactions(query: AdminQueryDto): Promise<any> {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;

    const transactions = await this.transactionModel
      .find(filter)
      .populate('userId', 'name email')
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
   * Get app settings
   */
  async getSettings(): Promise<any> {
    // Return current system configuration from environment variables
    return {
      jwt: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      },
      cors: {
        origins: process.env.CORS_ORIGINS || '',
      },
      rateLimit: {
        window: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      },
      upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
        uploadDir: process.env.UPLOAD_DIR || './uploads',
      },
      email: {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: parseInt(process.env.SMTP_PORT) || 587,
        smtpUser: process.env.SMTP_USER || '',
      },
      solana: {
        network: process.env.SOLANA_NETWORK || 'devnet',
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      },
      app: {
        name: process.env.APP_NAME || 'Quran Reciter API',
        version: process.env.APP_VERSION || '1.0.0',
      },
    };
  }

  /**
   * Update app settings
   */
  async updateSettings(settings: Record<string, any>, adminId: string): Promise<any> {
    try {
      this.loggerService.logUserActivity('admin_settings_updated', adminId, settings);

      // Note: In a production environment, you would typically:
      // 1. Store these in a database settings collection
      // 2. Update environment variables through a secure configuration management system
      // 3. Apply changes through a deployment process
      
      // For now, we'll return the updated settings but note that environment variables
      // would need to be updated manually and the application restarted
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        updatedBy: adminId,
      };

      // Log configuration change
      this.loggerService.log(
        `Admin ${adminId} updated system configuration: ${JSON.stringify(settings)}`,
        'AdminService'
      );

      return { 
        message: 'Configuration updated successfully. Note: Some settings may require application restart to take effect.',
        settings: updatedSettings,
        warning: 'Environment variables need to be updated manually on the server for changes to persist.'
      };
    } catch (error) {
      this.loggerService.error(
        `Failed to update settings: ${error.message}`,
        error.stack,
        'AdminService'
      );
      throw error;
    }
  }

  /**
   * Get Quran content for admin
   */
  async getQuranContent(query: any): Promise<any> {
    const { juz, hizb, quarter } = query;

    // If no parameters, return structure overview
    if (!juz && !hizb && !quarter) {
      return this.recitationsService.getQuranStructure();
    }

    // If only juz is specified, return hizb list for that juz
    if (juz && !hizb) {
      return this.recitationsService.getHizbsForJuz(parseInt(juz), 'admin-user');
    }

    // If juz and hizb are specified but no quarter, return quarters for that hizb
    if (juz && hizb && !quarter) {
      return this.recitationsService.getQuartersForHizb(parseInt(juz), parseInt(hizb), 'admin-user');
    }

    // If all parameters are specified, return ayahs for that quarter
    if (juz && hizb && quarter) {
      return this.recitationsService.getQuarter(
        parseInt(juz), 
        parseInt(hizb), 
        parseInt(quarter), 
        { includeText: true }, 
        'admin-user'
      );
    }

    return { error: 'Invalid parameters' };
  }

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<any> {
    // TODO: Implement content statistics
    return {
      totalSurahs: 114,
      totalAyahs: 6236,
      totalReciters: 15,
      totalTranslations: 25,
    };
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<any> {
    try {
      // Check database
      const dbHealth = await this.userModel.findOne().exec();
      
      // Check Redis
      const redisHealth = await this.redisService.ping();

      return {
        status: 'healthy',
        database: dbHealth ? 'connected' : 'disconnected',
        redis: redisHealth === 'PONG' ? 'connected' : 'disconnected',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get system logs
   */
  async getSystemLogs(query: AdminQueryDto): Promise<any> {
    // TODO: Implement log retrieval
    return {
      logs: [],
      message: 'Log retrieval not yet implemented',
    };
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(enabled: boolean, message: string, adminId: string): Promise<any> {
    // TODO: Implement maintenance mode toggle
    this.loggerService.logUserActivity('admin_maintenance_toggled', adminId, {
      enabled,
      message,
    });

    return {
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      maintenanceMode: enabled,
      maintenanceMessage: message,
    };
  }

  /**
   * Helper: Get users registered today
   */
  private async getUsersRegisteredToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.userModel
      .countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      })
      .exec();
  }

  /**
   * Helper: Get active sessions today
   */
  private async getActiveSessionsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.readingSessionModel
      .countDocuments({
        startTime: { $gte: today, $lt: tomorrow },
      })
      .exec();
  }

  /**
   * Helper: Get date range for period
   */
  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  }
}