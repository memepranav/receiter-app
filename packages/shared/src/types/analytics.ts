export interface AnalyticsEvent {
  _id: string;
  userId: string;
  eventType: EventType;
  eventName: string;
  properties: Record<string, any>;
  sessionId?: string;
  deviceInfo: DeviceInfo;
  location?: LocationInfo;
  timestamp: Date;
}

export interface DeviceInfo {
  platform: Platform;
  deviceModel?: string;
  osVersion?: string;
  appVersion: string;
  screenResolution?: string;
  userAgent?: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  ip?: string;
}

export interface UserEngagement {
  userId: string;
  totalSessions: number;
  totalTimeSpent: number; // in minutes
  averageSessionDuration: number; // in minutes
  daysActive: number;
  lastActiveDate: Date;
  retentionRate: number;
  conversionEvents: number;
}

export interface ReadingAnalytics {
  userId: string;
  totalReadingSessions: number;
  totalReadingTime: number; // in minutes
  averageSessionLength: number; // in minutes
  favoriteReadingTime: string; // hour of day
  mostReadSurahs: SurahReadingStats[];
  readingProgress: ReadingProgressStats;
  completionRate: number;
}

export interface SurahReadingStats {
  surahNumber: number;
  surahName: string;
  timesRead: number;
  totalTimeSpent: number; // in minutes
  completionRate: number;
  averageAccuracy?: number;
}

export interface ReadingProgressStats {
  juzCompleted: number;
  surahCompleted: number;
  totalAyahsRead: number;
  currentStreak: number;
  longestStreak: number;
  progressPercentage: number;
}

export interface AppUsageMetrics {
  totalUsers: number;
  activeUsers: DailyActiveUsers;
  userRetention: RetentionMetrics;
  featureUsage: FeatureUsageStats;
  performanceMetrics: PerformanceMetrics;
  errorMetrics: ErrorMetrics;
}

export interface DailyActiveUsers {
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  growth: GrowthMetrics;
}

export interface GrowthMetrics {
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

export interface RetentionMetrics {
  day1: number;
  day7: number;
  day30: number;
  cohortAnalysis: CohortData[];
}

export interface CohortData {
  cohortMonth: string;
  totalUsers: number;
  retention: RetentionData[];
}

export interface RetentionData {
  period: number;
  percentage: number;
  users: number;
}

export interface FeatureUsageStats {
  readingFeature: FeatureMetrics;
  bookmarksFeature: FeatureMetrics;
  audioFeature: FeatureMetrics;
  translationFeature: FeatureMetrics;
  rewardsFeature: FeatureMetrics;
  socialFeature: FeatureMetrics;
}

export interface FeatureMetrics {
  totalUsers: number;
  activeUsers: number;
  usageFrequency: number;
  averageTimeSpent: number;
  satisfactionScore?: number;
}

export interface PerformanceMetrics {
  averageLoadTime: number;
  apiResponseTime: number;
  crashRate: number;
  memoryUsage: number;
  batteryImpact: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  topErrors: ErrorStats[];
  criticalErrors: number;
  resolvedErrors: number;
}

export interface ErrorStats {
  errorType: string;
  errorMessage: string;
  frequency: number;
  lastOccurred: Date;
  affectedUsers: number;
}

export interface UserJourney {
  userId: string;
  journeySteps: JourneyStep[];
  conversionFunnel: FunnelStep[];
  dropOffPoints: DropOffPoint[];
  totalJourneyTime: number;
}

export interface JourneyStep {
  stepName: string;
  timestamp: Date;
  timeSpent: number;
  completionRate: number;
  nextStep?: string;
}

export interface FunnelStep {
  stepName: string;
  usersEntered: number;
  usersCompleted: number;
  conversionRate: number;
  averageTimeToComplete: number;
}

export interface DropOffPoint {
  stepName: string;
  dropOffRate: number;
  commonReasons: string[];
  improvementSuggestions: string[];
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenuePerUser: number;
  conversionRate: number;
  subscriptionMetrics: SubscriptionMetrics;
  rewardDistribution: RewardDistributionStats;
}

export interface SubscriptionMetrics {
  totalSubscribers: number;
  newSubscribers: number;
  churned: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
}

export interface RewardDistributionStats {
  totalRewardsDistributed: number;
  averageRewardPerUser: number;
  topRewardEarners: number;
  rewardRedemptionRate: number;
  costPerReward: number;
}

export interface DashboardMetrics {
  kpis: KPIMetrics;
  trends: TrendData[];
  alerts: Alert[];
  insights: Insight[];
}

export interface KPIMetrics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  userRetentionRate: number;
  averageSessionDuration: number;
  totalReadingTime: number;
  rewardDistributed: number;
  userSatisfactionScore: number;
}

export interface TrendData {
  metric: string;
  data: DataPoint[];
  trend: TrendDirection;
  changePercentage: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  isRead: boolean;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: InsightType;
  impact: InsightImpact;
  actionItems: string[];
  timestamp: Date;
}

export enum EventType {
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  ERROR_EVENT = 'error_event',
  PERFORMANCE_EVENT = 'performance_event',
  BUSINESS_EVENT = 'business_event'
}

export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
  DESKTOP = 'desktop'
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}

export enum AlertType {
  PERFORMANCE = 'performance',
  ERROR = 'error',
  BUSINESS = 'business',
  SECURITY = 'security'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum InsightType {
  USER_BEHAVIOR = 'user_behavior',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
  TECHNICAL = 'technical'
}

export enum InsightImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}