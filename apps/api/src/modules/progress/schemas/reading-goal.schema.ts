import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReadingGoalDocument = ReadingGoal & Document;

export enum GoalType {
  DAILY_TIME = 'daily_time',
  DAILY_AYAHS = 'daily_ayahs',
  DAILY_PAGES = 'daily_pages',
  WEEKLY_TIME = 'weekly_time',
  WEEKLY_AYAHS = 'weekly_ayahs',
  WEEKLY_SURAHS = 'weekly_surahs',
  MONTHLY_JUZ = 'monthly_juz',
  MONTHLY_QURAN = 'monthly_quran',
  ANNUAL_QURAN = 'annual_quran',
  STREAK_DAYS = 'streak_days',
  COMPLETE_SURAH = 'complete_surah',
  COMPLETE_JUZ = 'complete_juz',
  MEMORIZATION = 'memorization',
  CUSTOM = 'custom',
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum GoalPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ONE_TIME = 'one_time',
}

@Schema({
  timestamps: true,
  collection: 'reading_goals',
})
export class ReadingGoal {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: GoalType })
  type: GoalType;

  @Prop({ required: true, enum: GoalStatus, default: GoalStatus.ACTIVE })
  status: GoalStatus;

  @Prop({ required: true, enum: GoalPeriod })
  period: GoalPeriod;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  // Goal targets
  @Prop({ required: true })
  targetValue: number; // The goal target (time in minutes, ayahs count, etc.)

  @Prop({ required: false })
  targetUnit?: string; // 'minutes', 'ayahs', 'pages', 'surahs', 'juz'

  @Prop({ required: true, default: 0 })
  currentProgress: number;

  @Prop({ required: false })
  progressPercentage?: number; // Calculated field

  // Time boundaries
  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: false })
  endDate?: Date; // For time-bound goals

  @Prop({ required: false })
  deadline?: Date; // Specific deadline

  // Specific content goals (if applicable)
  @Prop({ required: false })
  targetSurah?: number;

  @Prop({ required: false })
  targetJuz?: number;

  @Prop({ type: Object, required: false })
  targetAyahRange?: {
    startSurah: number;
    startAyah: number;
    endSurah: number;
    endAyah: number;
  };

  // Recurrence settings (for repeating goals)
  @Prop({ required: true, default: false })
  isRecurring: boolean;

  @Prop({ type: Object, required: false })
  recurrencePattern?: {
    frequency: string; // 'daily', 'weekly', 'monthly'
    interval: number; // Every N days/weeks/months
    daysOfWeek?: number[]; // For weekly goals
    dayOfMonth?: number; // For monthly goals
  };

  // Progress tracking
  @Prop({ type: [Object], required: true, default: [] })
  progressHistory: {
    date: Date;
    value: number;
    sessionId?: string;
    notes?: string;
  }[];

  @Prop({ required: false })
  lastProgressUpdate?: Date;

  @Prop({ required: false })
  completedAt?: Date;

  // Streak tracking (for daily/weekly goals)
  @Prop({ required: true, default: 0 })
  currentStreak: number;

  @Prop({ required: true, default: 0 })
  bestStreak: number;

  @Prop({ required: false })
  lastCompletionDate?: Date;

  // Motivation and reminders
  @Prop({ required: false })
  motivationalMessage?: string;

  @Prop({ required: true, default: true })
  reminderEnabled: boolean;

  @Prop({ required: false })
  reminderTime?: string; // Time of day for reminders (HH:MM)

  @Prop({ required: false })
  reminderDays?: number[]; // Days of week for reminders

  // Social and sharing
  @Prop({ required: true, default: true })
  isPrivate: boolean;

  @Prop({ required: false })
  sharedWith?: string[]; // Array of user IDs

  @Prop({ required: true, default: false })
  allowFriendsToSee: boolean;

  // Achievement and rewards
  @Prop({ required: false })
  rewardPoints?: number; // Points earned upon completion

  @Prop({ required: false })
  badgeEarned?: string; // Badge ID earned upon completion

  @Prop({ required: false })
  celebrationMessage?: string;

  // Analytics
  @Prop({ required: true, default: 0 })
  totalTimeSpent: number; // Total time spent working on this goal

  @Prop({ required: true, default: 0 })
  sessionsCount: number; // Number of reading sessions contributing to this goal

  @Prop({ required: false })
  averageSessionTime?: number;

  @Prop({ required: false })
  averageDailyProgress?: number;

  // Difficulty and challenge level
  @Prop({ required: false })
  difficultyLevel?: string; // 'easy', 'medium', 'hard', 'expert'

  @Prop({ required: false })
  challengeRating?: number; // 1-10 scale

  // Metadata
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  // Goal categories and tags
  @Prop({ required: false })
  category?: string;

  @Prop({ required: false })
  tags?: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const ReadingGoalSchema = SchemaFactory.createForClass(ReadingGoal);

// Indexes for efficient querying
ReadingGoalSchema.index({ userId: 1 });
ReadingGoalSchema.index({ type: 1 });
ReadingGoalSchema.index({ status: 1 });
ReadingGoalSchema.index({ period: 1 });
ReadingGoalSchema.index({ userId: 1, status: 1 });
ReadingGoalSchema.index({ userId: 1, type: 1 });
ReadingGoalSchema.index({ userId: 1, period: 1 });
ReadingGoalSchema.index({ userId: 1, createdAt: -1 });
ReadingGoalSchema.index({ startDate: 1 });
ReadingGoalSchema.index({ endDate: 1 });
ReadingGoalSchema.index({ deadline: 1 });
ReadingGoalSchema.index({ reminderEnabled: 1, reminderTime: 1 });

// Compound indexes for common queries
ReadingGoalSchema.index({ userId: 1, status: 1, period: 1 });
ReadingGoalSchema.index({ userId: 1, type: 1, status: 1 });