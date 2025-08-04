import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ReadingSession, ReadingSessionDocument, SessionStatus } from './schemas/reading-session.schema';
import { Bookmark, BookmarkDocument } from './schemas/bookmark.schema';
import { ReadingGoal, ReadingGoalDocument, GoalStatus } from './schemas/reading-goal.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

import { LoggerService } from '../../core/logger/logger.service';
import { RedisService } from '../../core/redis/redis.service';

// DTOs
import { StartReadingSessionDto } from './dto/start-reading-session.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { CompleteReadingSessionDto } from './dto/complete-reading-session.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(ReadingSession.name) private readingSessionModel: Model<ReadingSessionDocument>,
    @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
    @InjectModel(ReadingGoal.name) private readingGoalModel: Model<ReadingGoalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private loggerService: LoggerService,
    private redisService: RedisService,
  ) {}

  /**
   * Start reading session
   */
  async startReadingSession(userId: string, startSessionDto: StartReadingSessionDto): Promise<any> {
    // End any existing active sessions
    await this.readingSessionModel
      .updateMany(
        { userId, status: SessionStatus.ACTIVE },
        { status: SessionStatus.ABANDONED, endTime: new Date() }
      )
      .exec();

    const session = new this.readingSessionModel({
      userId,
      sessionId: startSessionDto.sessionId,
      startTime: new Date(),
      startSurah: startSessionDto.startSurah,
      startAyah: startSessionDto.startAyah,
      currentSurah: startSessionDto.startSurah,
      currentAyah: startSessionDto.startAyah,
      readingMode: startSessionDto.readingMode,
      reciter: startSessionDto.reciter,
      translation: startSessionDto.translation,
      audioEnabled: startSessionDto.audioEnabled || false,
      translationEnabled: startSessionDto.translationEnabled || false,
      goalType: startSessionDto.goalType,
      goalTarget: startSessionDto.goalTarget,
      deviceType: startSessionDto.deviceType,
      platform: startSessionDto.platform,
      appVersion: startSessionDto.appVersion,
    });

    await session.save();

    this.loggerService.logReadingSession('session_started', userId, session.sessionId, {
      startSurah: startSessionDto.startSurah,
      startAyah: startSessionDto.startAyah,
      readingMode: startSessionDto.readingMode,
    });

    return { 
      sessionId: session.sessionId, 
      message: 'Reading session started successfully' 
    };
  }

  /**
   * Update reading progress
   */
  async updateReadingProgress(
    userId: string, 
    sessionId: string, 
    updateProgressDto: UpdateReadingProgressDto
  ): Promise<any> {
    const session = await this.readingSessionModel
      .findOne({ userId, sessionId, status: SessionStatus.ACTIVE })
      .exec();

    if (!session) {
      throw new NotFoundException('Active reading session not found');
    }

    // Update current position
    if (updateProgressDto.currentSurah) {
      session.currentSurah = updateProgressDto.currentSurah;
    }
    if (updateProgressDto.currentAyah) {
      session.currentAyah = updateProgressDto.currentAyah;
    }

    // Add ayahs read
    if (updateProgressDto.ayahsRead && updateProgressDto.ayahsRead.length > 0) {
      session.ayahsRead.push(...updateProgressDto.ayahsRead);
      session.totalAyahs += updateProgressDto.ayahsRead.length;

      // Update visited surahs
      updateProgressDto.ayahsRead.forEach(ayah => {
        if (!session.surahsVisited.includes(ayah.surahNumber)) {
          session.surahsVisited.push(ayah.surahNumber);
        }
      });
    }

    // Update reading time
    if (updateProgressDto.additionalReadingTime) {
      session.activeReadingTime += updateProgressDto.additionalReadingTime;
    }

    // Update goal progress
    if (updateProgressDto.goalProgress !== undefined) {
      session.goalProgress = updateProgressDto.goalProgress;
    }

    await session.save();

    // Update user's daily progress in Redis
    await this.updateDailyProgress(userId, updateProgressDto);

    this.loggerService.logReadingSession('progress_updated', userId, sessionId, {
      currentSurah: session.currentSurah,
      currentAyah: session.currentAyah,
      totalAyahs: session.totalAyahs,
    });

    return { message: 'Reading progress updated successfully' };
  }

  /**
   * Complete reading session
   */
  async completeReadingSession(
    userId: string, 
    sessionId: string, 
    completeSessionDto: CompleteReadingSessionDto
  ): Promise<any> {
    const session = await this.readingSessionModel
      .findOne({ userId, sessionId, status: SessionStatus.ACTIVE })
      .exec();

    if (!session) {
      throw new NotFoundException('Active reading session not found');
    }

    const endTime = new Date();
    session.endTime = endTime;
    session.duration = endTime.getTime() - session.startTime.getTime();
    session.status = SessionStatus.COMPLETED;

    // Final updates
    if (completeSessionDto.endSurah) session.endSurah = completeSessionDto.endSurah;
    if (completeSessionDto.endAyah) session.endAyah = completeSessionDto.endAyah;
    if (completeSessionDto.sessionNotes) session.sessionNotes = completeSessionDto.sessionNotes;
    if (completeSessionDto.reflection) session.reflection = completeSessionDto.reflection;
    if (completeSessionDto.rating) session.rating = completeSessionDto.rating;

    // Calculate metrics
    if (session.totalAyahs > 0) {
      session.averageAyahTime = session.activeReadingTime / session.totalAyahs;
      session.readingSpeed = (session.totalAyahs / session.activeReadingTime) * 60000; // ayahs per minute
    }

    await session.save();

    // Update user statistics
    await this.updateUserStats(userId, session);

    // Update reading goals
    await this.updateGoalProgress(userId, session);

    this.loggerService.logReadingSession('session_completed', userId, sessionId, {
      duration: session.duration,
      totalAyahs: session.totalAyahs,
      surahsVisited: session.surahsVisited.length,
    });

    return {
      message: 'Reading session completed successfully',
      duration: session.duration,
      totalAyahs: session.totalAyahs,
      pointsEarned: session.pointsEarned,
    };
  }

  /**
   * Get active session
   */
  async getActiveSession(userId: string): Promise<any> {
    const session = await this.readingSessionModel
      .findOne({ userId, status: SessionStatus.ACTIVE })
      .exec();

    return session;
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId: string, options: any = {}): Promise<any> {
    const { limit = 20, page = 1 } = options;
    const skip = (page - 1) * limit;

    const sessions = await this.readingSessionModel
      .find({ userId, status: { $ne: SessionStatus.ACTIVE } })
      .sort({ startTime: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await this.readingSessionModel
      .countDocuments({ userId, status: { $ne: SessionStatus.ACTIVE } })
      .exec();

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get bookmarks
   */
  async getBookmarks(userId: string, filters: any = {}): Promise<any> {
    const query: any = { userId };
    
    if (filters.category) query.category = filters.category;
    if (filters.surah) query.surahNumber = filters.surah;

    const bookmarks = await this.bookmarkModel
      .find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();

    return { bookmarks };
  }

  /**
   * Create bookmark
   */
  async createBookmark(userId: string, createBookmarkDto: CreateBookmarkDto): Promise<any> {
    const bookmark = new this.bookmarkModel({
      userId,
      ...createBookmarkDto,
    });

    await bookmark.save();

    this.loggerService.logUserActivity('bookmark_created', userId, {
      bookmarkId: bookmark._id.toString(),
      surahNumber: bookmark.surahNumber,
      ayahNumber: bookmark.ayahNumber,
    });

    return bookmark;
  }

  /**
   * Update bookmark
   */
  async updateBookmark(userId: string, bookmarkId: string, updateBookmarkDto: UpdateBookmarkDto): Promise<any> {
    const bookmark = await this.bookmarkModel
      .findOneAndUpdate(
        { _id: bookmarkId, userId },
        updateBookmarkDto,
        { new: true }
      )
      .exec();

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  /**
   * Delete bookmark
   */
  async deleteBookmark(userId: string, bookmarkId: string): Promise<any> {
    const bookmark = await this.bookmarkModel
      .findOneAndDelete({ _id: bookmarkId, userId })
      .exec();

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return { message: 'Bookmark deleted successfully' };
  }

  /**
   * Get goals
   */
  async getGoals(userId: string, filters: any = {}): Promise<any> {
    const query: any = { userId };
    
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;

    const goals = await this.readingGoalModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return { goals };
  }

  /**
   * Create goal
   */
  async createGoal(userId: string, createGoalDto: CreateGoalDto): Promise<any> {
    const goal = new this.readingGoalModel({
      userId,
      ...createGoalDto,
      startDate: createGoalDto.startDate || new Date(),
    });

    await goal.save();

    this.loggerService.logUserActivity('goal_created', userId, {
      goalId: goal._id.toString(),
      type: goal.type,
      targetValue: goal.targetValue,
    });

    return goal;
  }

  /**
   * Update goal
   */
  async updateGoal(userId: string, goalId: string, updateGoalDto: UpdateGoalDto): Promise<any> {
    const goal = await this.readingGoalModel
      .findOneAndUpdate(
        { _id: goalId, userId },
        updateGoalDto,
        { new: true }
      )
      .exec();

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  /**
   * Delete goal
   */
  async deleteGoal(userId: string, goalId: string): Promise<any> {
    const goal = await this.readingGoalModel
      .findOneAndDelete({ _id: goalId, userId })
      .exec();

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return { message: 'Goal deleted successfully' };
  }

  /**
   * Get progress overview
   */
  async getProgressOverview(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      activeSession,
      recentSessions,
      bookmarksCount,
      activeGoals,
      todayProgress,
    ] = await Promise.all([
      this.readingSessionModel.findOne({ userId, status: SessionStatus.ACTIVE }).exec(),
      this.readingSessionModel.find({ userId, status: SessionStatus.COMPLETED })
        .sort({ startTime: -1 }).limit(5).exec(),
      this.bookmarkModel.countDocuments({ userId }).exec(),
      this.readingGoalModel.find({ userId, status: GoalStatus.ACTIVE }).exec(),
      this.getTodayProgress(userId),
    ]);

    return {
      user: {
        totalReadingTime: user.totalReadingTime,
        totalAyahsRead: user.totalAyahsRead,
        totalSurahsCompleted: user.totalSurahsCompleted,
        totalJuzCompleted: user.totalJuzCompleted,
        currentStreak: user.currentStreak,
        level: user.level,
      },
      activeSession,
      recentSessions,
      bookmarksCount,
      activeGoals: activeGoals.length,
      todayProgress,
    };
  }

  /**
   * Get reading statistics
   */
  async getReadingStats(userId: string, period: string): Promise<any> {
    const dateRange = this.getDateRange(period);

    const stats = await this.readingSessionModel.aggregate([
      {
        $match: {
          userId: userId,
          status: SessionStatus.COMPLETED,
          startTime: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalTime: { $sum: '$activeReadingTime' },
          totalAyahs: { $sum: '$totalAyahs' },
          averageSessionTime: { $avg: '$activeReadingTime' },
          uniqueSurahs: { $addToSet: '$surahsVisited' },
        },
      },
    ]).exec();

    return {
      period,
      stats: stats[0] || {
        totalSessions: 0,
        totalTime: 0,
        totalAyahs: 0,
        averageSessionTime: 0,
        uniqueSurahs: [],
      },
    };
  }

  /**
   * Helper: Update daily progress in Redis
   */
  private async updateDailyProgress(userId: string, updateProgressDto: UpdateReadingProgressDto): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    if (updateProgressDto.additionalReadingTime) {
      await this.redisService.incr(`user:${userId}:daily_reading_time:${today}`);
      await this.redisService.expire(`user:${userId}:daily_reading_time:${today}`, 86400 * 7);
    }

    if (updateProgressDto.ayahsRead) {
      await this.redisService.incr(`user:${userId}:daily_ayahs:${today}`);
      await this.redisService.expire(`user:${userId}:daily_ayahs:${today}`, 86400 * 7);
    }
  }

  /**
   * Helper: Update user statistics
   */
  private async updateUserStats(userId: string, session: ReadingSessionDocument): Promise<void> {
    const updates: any = {
      $inc: {
        totalReadingTime: session.activeReadingTime,
        totalAyahsRead: session.totalAyahs,
      },
      lastReadingDate: session.endTime,
    };

    // Add unique surahs to completed list if applicable
    if (session.surahsCompleted && session.surahsCompleted.length > 0) {
      updates.$inc.totalSurahsCompleted = session.surahsCompleted.length;
    }

    await this.userModel.findByIdAndUpdate(userId, updates).exec();
  }

  /**
   * Helper: Update goal progress
   */
  private async updateGoalProgress(userId: string, session: ReadingSessionDocument): Promise<void> {
    // TODO: Implement goal progress updates based on session data
    // This would check active goals and update their progress based on the completed session
  }

  /**
   * Helper: Get today's progress
   */
  private async getTodayProgress(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySession = await this.readingSessionModel.findOne({
      userId,
      startTime: { $gte: today, $lt: tomorrow },
      status: { $in: [SessionStatus.ACTIVE, SessionStatus.COMPLETED] },
    }).exec();

    return todaySession ? {
      readingTime: todaySession.activeReadingTime,
      ayahsRead: todaySession.totalAyahs,
      surahsVisited: todaySession.surahsVisited.length,
    } : {
      readingTime: 0,
      ayahsRead: 0,
      surahsVisited: 0,
    };
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