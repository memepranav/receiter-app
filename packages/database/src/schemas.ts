/**
 * Database schemas and Prisma models for the Quran reading app
 */

// User Schema Types
export interface UserSchema {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber?: string;
  profilePicture?: string;
  bio?: string;
  isActive: boolean;
  emailVerified: boolean;
  walletAddress?: string;
  role: 'user' | 'admin' | 'moderator';
  preferences: UserPreferences;
  statistics: UserStatistics;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

export interface UserPreferences {
  language: string;
  defaultTranslation: string;
  defaultReciter: string;
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  darkMode: boolean;
  autoPlay: boolean;
  playbackSpeed: number;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  arabicFont: 'uthmanic' | 'indopak' | 'simple';
  showTransliteration: boolean;
  highlightCurrentAyah: boolean;
  enableVibration: boolean;
  keepScreenOn: boolean;
}

export interface UserStatistics {
  totalJuzCompleted: number;
  totalSurahCompleted: number;
  totalAyahRead: number;
  currentStreak: number;
  longestStreak: number;
  totalReadingTime: number;
  totalPoints: number;
  currentLevel: number;
  badgesEarned: string[];
  lastReadingDate?: Date;
  weeklyGoal?: number;
  monthlyGoal?: number;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends_only' | 'private';
  showReadingStats: boolean;
  showBadges: boolean;
  allowFriendRequests: boolean;
  showInLeaderboard: boolean;
  dataCollection: boolean;
  marketingEmails: boolean;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  readingReminders: boolean;
  rewardNotifications: boolean;
  badgeNotifications: boolean;
  friendRequests: boolean;
  leaderboardUpdates: boolean;
  systemAnnouncements: boolean;
  weeklyProgress: boolean;
  monthlyReport: boolean;
}

// Reading Session Schema
export interface ReadingSessionSchema {
  _id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  totalDuration: number;
  surahsRead: ReadingSurah[];
  totalAyahsRead: number;
  points: number;
  completed: boolean;
  metadata?: {
    deviceType?: string;
    appVersion?: string;
    connectionType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingSurah {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  completedAyahs: number[];
  timeSpent: number;
  accuracy?: number;
  translationUsed?: string;
  reciterUsed?: string;
}

// Bookmark Schema
export interface BookmarkSchema {
  _id: string;
  userId: string;
  surahNumber: number;
  ayahNumber: number;
  note?: string;
  tags: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reward Schema
export interface RewardSchema {
  _id: string;
  userId: string;
  type: RewardType;
  amount: number;
  description: string;
  sourceActivity: string;
  metadata?: RewardMetadata;
  status: 'pending' | 'approved' | 'distributed' | 'failed' | 'cancelled';
  createdAt: Date;
  processedAt?: Date;
  expiresAt?: Date;
}

export interface RewardMetadata {
  surahNumber?: number;
  juzNumber?: number;
  readingDuration?: number;
  streakCount?: number;
  achievementId?: string;
  multiplier?: number;
  sessionId?: string;
}

export type RewardType = 
  | 'reading_completion'
  | 'surah_completion'
  | 'juz_completion'
  | 'daily_streak'
  | 'weekly_streak'
  | 'monthly_streak'
  | 'badge_earned'
  | 'referral'
  | 'quiz_completion'
  | 'perfect_recitation'
  | 'first_time_bonus';

// Transaction Schema
export interface TransactionSchema {
  _id: string;
  userId: string;
  type: 'earned' | 'spent' | 'withdrawn' | 'refund' | 'bonus' | 'penalty';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  blockchainTxHash?: string;
  walletAddress?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  createdAt: Date;
  processedAt?: Date;
  failureReason?: string;
}

// User Balance Schema
export interface UserBalanceSchema {
  _id: string;
  userId: string;
  totalEarned: number;
  totalSpent: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingBalance: number;
  stakedBalance: number;
  lastUpdated: Date;
}

// Badge Schema
export interface BadgeSchema {
  _id: string;
  name: string;
  description: string;
  icon: string;
  requirements: BadgeRequirement[];
  rewardAmount: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  isActive: boolean;
  totalEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BadgeRequirement {
  type: 'total_ayahs_read' | 'total_surahs_completed' | 'total_juz_completed' | 'consecutive_days' | 'total_reading_time' | 'perfect_recitations' | 'referrals_made';
  value: number;
  description: string;
}

// User Badge Schema (Join table)
export interface UserBadgeSchema {
  _id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
}

// Analytics Event Schema
export interface AnalyticsEventSchema {
  _id: string;
  userId: string;
  eventType: 'user_action' | 'system_event' | 'error_event' | 'performance_event' | 'business_event';
  eventName: string;
  properties: Record<string, any>;
  sessionId?: string;
  deviceInfo: {
    platform: 'ios' | 'android' | 'web' | 'desktop';
    deviceModel?: string;
    osVersion?: string;
    appVersion: string;
    screenResolution?: string;
    userAgent?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    ip?: string;
  };
  timestamp: Date;
}

// Friendship Schema
export interface FriendshipSchema {
  _id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

// Notification Schema
export interface NotificationSchema {
  _id: string;
  userId: string;
  type: 'reward_earned' | 'badge_earned' | 'streak_milestone' | 'friend_request' | 'leaderboard_update' | 'reading_reminder' | 'withdrawal_status' | 'system_announcement';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  isActionable: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

// Withdrawal Request Schema
export interface WithdrawalRequestSchema {
  _id: string;
  userId: string;
  amount: number;
  walletAddress: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  blockchainTxHash?: string;
  adminNotes?: string;
  failureReason?: string;
  fees?: number;
}

// App Settings Schema
export interface AppSettingsSchema {
  _id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  category: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Schema
export interface AuditLogSchema {
  _id: string;
  userId?: string;
  adminId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Error Log Schema
export interface ErrorLogSchema {
  _id: string;
  userId?: string;
  error: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  timestamp: Date;
}

// Leaderboard Cache Schema
export interface LeaderboardCacheSchema {
  _id: string;
  type: 'points' | 'reading_time' | 'ayahs_read' | 'streak' | 'badges';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  data: LeaderboardEntry[];
  lastUpdated: Date;
  expiresAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profilePicture?: string;
  score: number;
  change: number;
  badges: string[];
}

// Database connection types
export interface DatabaseConfig {
  url: string;
  name: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    family?: number;
    bufferMaxEntries?: number;
    bufferCommands?: boolean;
  };
}

// Aggregation pipeline types
export interface AggregationPipeline {
  $match?: Record<string, any>;
  $group?: Record<string, any>;
  $sort?: Record<string, number>;
  $limit?: number;
  $skip?: number;
  $project?: Record<string, any>;
  $lookup?: {
    from: string;
    localField: string;
    foreignField: string;
    as: string;
  };
  $unwind?: string | { path: string; preserveNullAndEmptyArrays?: boolean };
  $addFields?: Record<string, any>;
}

// Query options
export interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  select?: string | Record<string, 1 | 0>;
  populate?: string | string[];
}

