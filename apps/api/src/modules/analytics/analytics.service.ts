import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AnalyticsEvent, AnalyticsEventDocument, EventType } from './schemas/analytics-event.schema';
import { UserSession, UserSessionDocument } from './schemas/user-session.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

import { LoggerService } from '../../core/logger/logger.service';
import { RedisService } from '../../core/redis/redis.service';

// DTOs
import { TrackEventDto } from './dto/track-event.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { GetAnalyticsQueryDto } from './dto/get-analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(AnalyticsEvent.name) private analyticsEventModel: Model<AnalyticsEventDocument>,
    @InjectModel(UserSession.name) private userSessionModel: Model<UserSessionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private loggerService: LoggerService,
    private redisService: RedisService,
  ) {}

  /**
   * Track user event
   */
  async trackEvent(userId: string, trackEventDto: TrackEventDto): Promise<any> {
    const {
      eventType,
      eventName,
      properties = {},
      sessionId,
      deviceInfo,
      timestamp,
    } = trackEventDto;

    const event = new this.analyticsEventModel({
      userId,
      eventType,
      eventName,
      properties,
      sessionId,
      platform: deviceInfo?.platform,
      deviceType: deviceInfo?.deviceType,
      appVersion: deviceInfo?.appVersion,
      osVersion: deviceInfo?.osVersion,
      userAgent: deviceInfo?.userAgent,
      country: deviceInfo?.country,
      region: deviceInfo?.region,
      city: deviceInfo?.city,
      timezone: deviceInfo?.timezone,
      connectionType: deviceInfo?.connectionType,
      serverTimestamp: new Date(),
      clientTimestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await event.save();

    // Update session if sessionId provided
    if (sessionId) {
      await this.updateSessionActivity(sessionId, eventType, properties);
    }

    // Update real-time metrics in Redis
    await this.updateRealTimeMetrics(userId, eventType, properties);

    this.loggerService.logUserActivity('event_tracked', userId, {
      eventType,
      eventName,
      sessionId,
    });

    return { success: true, eventId: event._id };
  }

  /**
   * Start user session
   */
  async startSession(userId: string, startSessionDto: StartSessionDto): Promise<any> {
    const { sessionId, deviceInfo, location, referrer } = startSessionDto;

    // End any existing active sessions for this user
    await this.userSessionModel
      .updateMany(
        { userId, isActive: true },
        { 
          isActive: false,
          endTime: new Date(),
          terminationReason: 'new_session_started',
        }
      )
      .exec();

    const session = new this.userSessionModel({
      sessionId,
      userId,
      startTime: new Date(),
      deviceId: deviceInfo?.deviceId,
      platform: deviceInfo?.platform,
      deviceType: deviceInfo?.deviceType,
      appVersion: deviceInfo?.appVersion,
      osVersion: deviceInfo?.osVersion,
      userAgent: deviceInfo?.userAgent,
      country: location?.country,
      region: location?.region,
      city: location?.city,
      timezone: location?.timezone,
      connectionType: deviceInfo?.connectionType,
      referrer: referrer?.referrer,
      campaign: referrer?.campaign,
      source: referrer?.source,
      isActive: true,
    });

    await session.save();

    // Track session start event
    await this.trackEvent(userId, {
      eventType: EventType.APP_OPENED,
      eventName: 'Session Started',
      sessionId,
      properties: {
        platform: deviceInfo?.platform,
        appVersion: deviceInfo?.appVersion,
      },
      deviceInfo,
    });

    this.loggerService.logUserActivity('session_started', userId, {
      sessionId,
      platform: deviceInfo?.platform,
    });

    return { 
      success: true, 
      sessionId: session.sessionId,
      message: 'Session started successfully' 
    };
  }

  /**
   * End user session
   */
  async endSession(userId: string, endSessionDto: EndSessionDto): Promise<any> {
    const { sessionId, terminationReason, finalMetrics } = endSessionDto;

    const session = await this.userSessionModel
      .findOne({ sessionId, userId, isActive: true })
      .exec();

    if (!session) {
      throw new NotFoundException('Active session not found');
    }

    const endTime = new Date();
    const duration = endTime.getTime() - session.startTime.getTime();

    // Update session
    session.endTime = endTime;
    session.duration = duration;
    session.isActive = false;
    session.terminationReason = terminationReason;

    if (finalMetrics) {
      session.readingTime = finalMetrics.readingTime || session.readingTime;
      session.ayahsRead = finalMetrics.ayahsRead || session.ayahsRead;
      session.eventCount = finalMetrics.eventCount || session.eventCount;
      session.errorCount = finalMetrics.errorCount || session.errorCount;
    }

    await session.save();

    // Track session end event
    await this.trackEvent(userId, {
      eventType: EventType.APP_CLOSED,
      eventName: 'Session Ended',
      sessionId,
      properties: {
        duration,
        terminationReason,
        readingTime: session.readingTime,
        ayahsRead: session.ayahsRead,
      },
    });

    this.loggerService.logUserActivity('session_ended', userId, {
      sessionId,
      duration,
      terminationReason,
    });

    return { 
      success: true, 
      duration,
      message: 'Session ended successfully' 
    };
  }

  /**
   * Update session activity
   */
  async updateSession(userId: string, updateData: any): Promise<any> {
    const { sessionId, ...updates } = updateData;

    const session = await this.userSessionModel
      .findOne({ sessionId, userId, isActive: true })
      .exec();

    if (!session) {
      throw new NotFoundException('Active session not found');
    }

    // Update session fields
    Object.keys(updates).forEach(key => {
      if (session[key] !== undefined) {
        session[key] = updates[key];
      }
    });

    await session.save();

    return { success: true, message: 'Session updated successfully' };
  }

  /**
   * Get user analytics dashboard
   */
  async getUserDashboard(userId: string, query: GetAnalyticsQueryDto): Promise<any> {
    const { period = 'month' } = query;
    const dateRange = this.getDateRange(period);

    const [
      totalEvents,
      readingSessions,
      totalReadingTime,
      uniqueDays,
      topEvents,
    ] = await Promise.all([
      this.analyticsEventModel.countDocuments({
        userId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      }).exec(),

      this.userSessionModel.countDocuments({
        userId,
        startTime: { $gte: dateRange.start, $lte: dateRange.end },
      }).exec(),

      this.userSessionModel.aggregate([
        {
          $match: {
            userId: userId,
            startTime: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        { $group: { _id: null, total: { $sum: '$readingTime' } } },
      ]).exec(),

      this.analyticsEventModel.distinct('createdAt', {
        userId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      }).then(dates => new Set(dates.map(d => d.toDateString())).size),

      this.analyticsEventModel.aggregate([
        {
          $match: {
            userId: userId,
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]).exec(),
    ]);

    return {
      period,
      metrics: {
        totalEvents,
        readingSessions,
        totalReadingTime: totalReadingTime[0]?.total || 0,
        activeDays: uniqueDays,
        averageSessionTime: readingSessions > 0 ? (totalReadingTime[0]?.total || 0) / readingSessions : 0,
      },
      topEvents: topEvents.map(event => ({
        eventType: event._id,
        count: event.count,
      })),
    };
  }

  /**
   * Get reading insights
   */
  async getReadingInsights(userId: string, period: string): Promise<any> {
    const dateRange = this.getDateRange(period);

    const [
      readingEvents,
      sessionStats,
      popularSurahs,
      readingPatterns,
    ] = await Promise.all([
      this.analyticsEventModel.find({
        userId,
        eventType: { $in: [EventType.READING_SESSION_STARTED, EventType.AYAH_READ, EventType.SURAH_COMPLETED] },
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      }).sort({ createdAt: 1 }).exec(),

      this.userSessionModel.aggregate([
        {
          $match: {
            userId: userId,
            startTime: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalReadingTime: { $sum: '$readingTime' },
            totalAyahsRead: { $sum: '$ayahsRead' },
            averageSessionTime: { $avg: '$readingTime' },
          },
        },
      ]).exec(),

      this.analyticsEventModel.aggregate([
        {
          $match: {
            userId: userId,
            eventType: EventType.AYAH_READ,
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        { $group: { _id: '$properties.surahNumber', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).exec(),

      this.getReadingPatternsByHour(userId, dateRange),
    ]);

    return {
      period,
      summary: sessionStats[0] || {
        totalSessions: 0,
        totalReadingTime: 0,
        totalAyahsRead: 0,
        averageSessionTime: 0,
      },
      popularSurahs: popularSurahs.map(surah => ({
        surahNumber: surah._id,
        readCount: surah.count,
      })),
      readingPatterns,
      timeline: this.processReadingTimeline(readingEvents),
    };
  }

  /**
   * Get activity timeline
   */
  async getActivityTimeline(userId: string, query: GetAnalyticsQueryDto): Promise<any> {
    const { period = 'week', limit = 50 } = query;
    const dateRange = this.getDateRange(period);

    const events = await this.analyticsEventModel
      .find({
        userId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('eventType eventName properties createdAt')
      .exec();

    return {
      period,
      events: events.map(event => ({
        eventType: event.eventType,
        eventName: event.eventName,
        properties: event.properties,
        timestamp: event.createdAt,
      })),
    };
  }

  /**
   * Get streak information
   */
  async getStreakInfo(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get reading activity for the last 90 days to calculate streak
    const last90Days = new Date();
    last90Days.setDate(last90Days.getDate() - 90);

    const dailyActivity = await this.analyticsEventModel.aggregate([
      {
        $match: {
          userId: userId,
          eventType: { $in: [EventType.READING_SESSION_STARTED, EventType.AYAH_READ] },
          createdAt: { $gte: last90Days },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
    ]).exec();

    const streakData = this.calculateStreak(dailyActivity);

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakData,
      lastReadingDate: user.lastReadingDate,
    };
  }

  /**
   * Get reading habits
   */
  async getReadingHabits(userId: string, period: string): Promise<any> {
    const dateRange = this.getDateRange(period);

    const [
      dailyPatterns,
      weeklyPatterns,
      preferredTimes,
    ] = await Promise.all([
      this.getReadingPatternsByDay(userId, dateRange),
      this.getReadingPatternsByWeekday(userId, dateRange),
      this.getPreferredReadingTimes(userId, dateRange),
    ]);

    return {
      period,
      dailyPatterns,
      weeklyPatterns,
      preferredTimes,
    };
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId: string, query: GetAnalyticsQueryDto): Promise<any> {
    const { limit = 20, page = 1 } = query;
    const skip = (page - 1) * limit;

    const sessions = await this.userSessionModel
      .find({ userId })
      .sort({ startTime: -1 })
      .limit(limit)
      .skip(skip)
      .select('sessionId startTime endTime duration platform readingTime ayahsRead eventCount')
      .exec();

    const total = await this.userSessionModel.countDocuments({ userId }).exec();

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
   * Get feature usage statistics
   */
  async getFeatureUsage(userId: string, period: string): Promise<any> {
    const dateRange = this.getDateRange(period);

    const featureUsage = await this.analyticsEventModel.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec();

    return {
      period,
      features: featureUsage.map(feature => ({
        feature: feature._id,
        usageCount: feature.count,
      })),
    };
  }

  /**
   * Get progress metrics
   */
  async getProgressMetrics(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentProgress = await this.analyticsEventModel.aggregate([
      {
        $match: {
          userId: userId,
          eventType: { $in: [EventType.SURAH_COMPLETED, EventType.JUZ_COMPLETED] },
          createdAt: { $gte: last30Days },
        },
      },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]).exec();

    return {
      overall: {
        totalReadingTime: user.totalReadingTime,
        totalAyahsRead: user.totalAyahsRead,
        totalSurahsCompleted: user.totalSurahsCompleted,
        totalJuzCompleted: user.totalJuzCompleted,
        quranCompletions: user.quranCompletions,
        level: user.level,
        experience: user.experience,
      },
      recent: {
        surahsCompleted: recentProgress.find(p => p._id === EventType.SURAH_COMPLETED)?.count || 0,
        juzCompleted: recentProgress.find(p => p._id === EventType.JUZ_COMPLETED)?.count || 0,
      },
    };
  }

  /**
   * Helper: Update session activity
   */
  private async updateSessionActivity(sessionId: string, eventType: EventType, properties: any): Promise<void> {
    const update: any = { $inc: { eventCount: 1 } };

    if (eventType === EventType.AYAH_READ) {
      update.$inc.ayahsRead = 1;
      if (properties.readingTime) {
        update.$inc.readingTime = properties.readingTime;
      }
      if (properties.surahNumber) {
        update.$addToSet = { surahsVisited: properties.surahNumber };
      }
    }

    await this.userSessionModel.updateOne({ sessionId }, update).exec();
  }

  /**
   * Helper: Update real-time metrics
   */
  private async updateRealTimeMetrics(userId: string, eventType: EventType, properties: any): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    if (eventType === EventType.AYAH_READ) {
      await this.redisService.incr(`user:${userId}:daily_ayahs:${today}`);
      await this.redisService.expire(`user:${userId}:daily_ayahs:${today}`, 86400 * 7); // 7 days
      
      if (properties.readingTime) {
        const currentTime = await this.redisService.get(`user:${userId}:daily_reading_time:${today}`) || '0';
        await this.redisService.set(
          `user:${userId}:daily_reading_time:${today}`,
          (parseInt(currentTime) + properties.readingTime).toString(),
          86400 * 7
        );
      }
    }
  }

  /**
   * Helper: Get date range for period
   */
  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
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

  /**
   * Helper: Get reading patterns by hour
   */
  private async getReadingPatternsByHour(userId: string, dateRange: any): Promise<any[]> {
    return this.analyticsEventModel.aggregate([
      {
        $match: {
          userId: userId,
          eventType: EventType.READING_SESSION_STARTED,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]).exec();
  }

  /**
   * Helper: Get reading patterns by day
   */
  private async getReadingPatternsByDay(userId: string, dateRange: any): Promise<any[]> {
    return this.analyticsEventModel.aggregate([
      {
        $match: {
          userId: userId,
          eventType: EventType.READING_SESSION_STARTED,
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
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]).exec();
  }

  /**
   * Helper: Get reading patterns by weekday
   */
  private async getReadingPatternsByWeekday(userId: string, dateRange: any): Promise<any[]> {
    return this.analyticsEventModel.aggregate([
      {
        $match: {
          userId: userId,
          eventType: EventType.READING_SESSION_STARTED,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]).exec();
  }

  /**
   * Helper: Get preferred reading times
   */
  private async getPreferredReadingTimes(userId: string, dateRange: any): Promise<any> {
    const hourlyData = await this.getReadingPatternsByHour(userId, dateRange);
    
    if (!hourlyData.length) return null;

    const sortedHours = hourlyData.sort((a, b) => b.count - a.count);
    return {
      mostActiveHour: sortedHours[0]._id,
      leastActiveHour: sortedHours[sortedHours.length - 1]._id,
      peakTimes: sortedHours.slice(0, 3).map(h => ({ hour: h._id, count: h.count })),
    };
  }

  /**
   * Helper: Calculate streak from daily activity
   */
  private calculateStreak(dailyActivity: any[]): any {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Sort by date descending
    dailyActivity.sort((a, b) => {
      const dateA = new Date(a._id.year, a._id.month - 1, a._id.day);
      const dateB = new Date(b._id.year, b._id.month - 1, b._id.day);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate current streak
    for (let i = 0; i < dailyActivity.length; i++) {
      const activityDate = new Date(
        dailyActivity[i]._id.year,
        dailyActivity[i]._id.month - 1,
        dailyActivity[i]._id.day
      );

      if (i === 0) {
        // Check if today or yesterday
        const isToday = activityDate.toDateString() === today.toDateString();
        const isYesterday = activityDate.toDateString() === yesterday.toDateString();
        
        if (isToday || isYesterday) {
          currentStreak = 1;
          tempStreak = 1;
        } else {
          break;
        }
      } else {
        const prevDate = new Date(
          dailyActivity[i - 1]._id.year,
          dailyActivity[i - 1]._id.month - 1,
          dailyActivity[i - 1]._id.day
        );
        
        const dayDiff = (prevDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 0;
    for (let i = 0; i < dailyActivity.length; i++) {
      tempStreak++;
      
      if (i < dailyActivity.length - 1) {
        const currentDate = new Date(
          dailyActivity[i]._id.year,
          dailyActivity[i]._id.month - 1,
          dailyActivity[i]._id.day
        );
        const nextDate = new Date(
          dailyActivity[i + 1]._id.year,
          dailyActivity[i + 1]._id.month - 1,
          dailyActivity[i + 1]._id.day
        );
        
        const dayDiff = (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff !== 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }

    return {
      current: currentStreak,
      longest: longestStreak,
      recentActivity: dailyActivity.slice(0, 30), // Last 30 days
    };
  }

  /**
   * Helper: Process reading timeline
   */
  private processReadingTimeline(events: any[]): any[] {
    return events.map(event => ({
      date: event.createdAt.toISOString().split('T')[0],
      eventType: event.eventType,
      properties: event.properties,
    }));
  }
}