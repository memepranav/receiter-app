import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export enum ReadingGoal {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: false }) // Not required for OAuth users
  password?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  phoneNumber?: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Prop({ required: false }) // For Google OAuth
  googleId?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  lastLoginAt?: Date;

  // Quran Reading Preferences
  @Prop({ default: 'arabic' })
  preferredLanguage: string;

  @Prop({ required: false })
  preferredReciter?: string;

  @Prop({ default: 'uthmani' })
  preferredScript: string; // uthmani, indo-pak, etc.

  @Prop({ default: false })
  showTranslation: boolean;

  @Prop({ required: false })
  preferredTranslation?: string;

  // Reading Goals and Progress
  @Prop({ enum: ReadingGoal, default: ReadingGoal.DAILY })
  readingGoal: ReadingGoal;

  @Prop({ default: 1 }) // Number of pages/juz/etc based on goal
  readingGoalAmount: number;

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ default: new Date() })
  lastReadingDate: Date;

  // Statistics
  @Prop({ default: 0 })
  totalReadingTime: number; // in minutes

  @Prop({ default: 0 })
  totalAyahsRead: number;

  @Prop({ default: 0 })
  totalSurahsCompleted: number;

  @Prop({ default: 0 })
  totalJuzCompleted: number;

  @Prop({ default: 0 })
  quranCompletions: number; // Full Quran completions

  // Rewards and Gamification
  @Prop({ default: 0 })
  rewardPoints: number;

  @Prop({ default: 0 })
  totalEarnedPoints: number;

  @Prop({ default: [] })
  badges: string[]; // Array of badge IDs

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  experience: number;

  // Blockchain Integration
  @Prop({ required: false })
  walletAddress?: string;

  @Prop({ default: false })
  walletConnected: boolean;

  @Prop({ default: 0 })
  pendingRewards: number; // Rewards waiting to be claimed

  @Prop({ default: 0 })
  claimedRewards: number; // Total rewards claimed to wallet

  // Social Features
  @Prop({ default: [] })
  friends: string[]; // Array of user IDs

  @Prop({ default: [] })
  friendRequests: string[]; // Pending friend request user IDs

  @Prop({ default: false })
  profilePublic: boolean;

  @Prop({ default: true })
  allowFriendRequests: boolean;

  // Notification Settings
  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: true })
  pushNotifications: boolean;

  @Prop({ default: true })
  readingReminders: boolean;

  @Prop({ required: false })
  reminderTime?: string; // e.g., "08:00"

  // Privacy Settings
  @Prop({ default: true })
  shareReadingStats: boolean;

  @Prop({ default: true })
  showOnLeaderboard: boolean;

  // Device and Session Info
  @Prop({ required: false })
  lastDeviceInfo?: {
    platform: string;
    version: string;
    deviceId: string;
  };

  @Prop({ required: false })
  timezone?: string;

  // Account Status
  @Prop({ required: false })
  suspendedAt?: Date;

  @Prop({ required: false })
  suspendedReason?: string;

  @Prop({ required: false })
  deletedAt?: Date; // Soft delete

  // Metadata
  @Prop({ type: Map, of: String, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ rewardPoints: -1 }); // For leaderboards
UserSchema.index({ totalReadingTime: -1 }); // For leaderboards
UserSchema.index({ level: -1 }); // For leaderboards
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ createdAt: -1 });