export interface Reward {
  _id: string;
  userId: string;
  type: RewardType;
  amount: number;
  description: string;
  sourceActivity: string;
  metadata?: RewardMetadata;
  status: RewardStatus;
  createdAt: Date;
  processedAt?: Date;
}

export interface RewardMetadata {
  surahNumber?: number;
  juzNumber?: number;
  readingDuration?: number;
  streakCount?: number;
  achievementId?: string;
  multiplier?: number;
}

export interface RewardTransaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  blockchainTxHash?: string;
  walletAddress?: string;
  status: TransactionStatus;
  createdAt: Date;
  processedAt?: Date;
  failureReason?: string;
}

export interface UserBalance {
  userId: string;
  totalEarned: number;
  totalSpent: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingBalance: number;
  lastUpdated: Date;
}

export interface RewardRule {
  _id: string;
  type: RewardType;
  name: string;
  description: string;
  baseAmount: number;
  multipliers?: RewardMultiplier[];
  conditions?: RewardCondition[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardMultiplier {
  condition: string;
  value: number;
  description: string;
}

export interface RewardCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  description: string;
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  requirements: BadgeRequirement[];
  rewardAmount: number;
  rarity: BadgeRarity;
  isActive: boolean;
  createdAt: Date;
}

export interface BadgeRequirement {
  type: RequirementType;
  value: number;
  description: string;
}

export interface UserBadge {
  _id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  progress?: BadgeProgress;
}

export interface BadgeProgress {
  current: number;
  required: number;
  percentage: number;
}

export interface Leaderboard {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profilePicture?: string;
  score: number;
  change: number; // position change from previous period
  badges: string[];
}

export interface WithdrawalRequest {
  _id: string;
  userId: string;
  amount: number;
  walletAddress: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;
  blockchainTxHash?: string;
  adminNotes?: string;
  failureReason?: string;
}

export interface RewardSummary {
  totalUsers: number;
  totalRewardsDistributed: number;
  totalTokensInCirculation: number;
  pendingRewards: number;
  averageUserBalance: number;
  topEarners: LeaderboardEntry[];
}

export enum RewardType {
  READING_COMPLETION = 'reading_completion',
  SURAH_COMPLETION = 'surah_completion',
  JUZ_COMPLETION = 'juz_completion',
  DAILY_STREAK = 'daily_streak',
  WEEKLY_STREAK = 'weekly_streak',
  MONTHLY_STREAK = 'monthly_streak',
  BADGE_EARNED = 'badge_earned',
  REFERRAL = 'referral',
  QUIZ_COMPLETION = 'quiz_completion',
  PERFECT_RECITATION = 'perfect_recitation',
  FIRST_TIME_BONUS = 'first_time_bonus'
}

export enum RewardStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DISTRIBUTED = 'distributed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  WITHDRAWN = 'withdrawn',
  REFUND = 'refund',
  BONUS = 'bonus',
  PENALTY = 'penalty'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IN = 'in',
  NOT_IN = 'not_in'
}

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum RequirementType {
  TOTAL_AYAHS_READ = 'total_ayahs_read',
  TOTAL_SURAHS_COMPLETED = 'total_surahs_completed',
  TOTAL_JUZ_COMPLETED = 'total_juz_completed',
  CONSECUTIVE_DAYS = 'consecutive_days',
  TOTAL_READING_TIME = 'total_reading_time',
  PERFECT_RECITATIONS = 'perfect_recitations',
  REFERRALS_MADE = 'referrals_made'
}

export enum LeaderboardType {
  POINTS = 'points',
  READING_TIME = 'reading_time',
  AYAHS_READ = 'ayahs_read',
  STREAK = 'streak',
  BADGES = 'badges'
}

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time'
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  FAILED = 'failed'
}