import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserSessionDocument = UserSession & Document;

@Schema({
  timestamps: true,
  collection: 'user_sessions',
})
export class UserSession {
  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: false })
  endTime?: Date;

  @Prop({ required: true, default: 0 })
  duration: number; // in milliseconds

  // Device information
  @Prop({ required: false })
  deviceId?: string;

  @Prop({ required: false })
  platform?: string; // 'ios', 'android', 'web'

  @Prop({ required: false })
  deviceType?: string; // 'mobile', 'tablet', 'desktop'

  @Prop({ required: false })
  appVersion?: string;

  @Prop({ required: false })
  osVersion?: string;

  @Prop({ required: false })
  userAgent?: string;

  // Location (if available)
  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  region?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  timezone?: string;

  // Network information
  @Prop({ required: false })
  connectionType?: string;

  @Prop({ required: false })
  ipAddress?: string; // Hashed for privacy

  // Session activities
  @Prop({ required: true, default: 0 })
  eventCount: number;

  @Prop({ required: true, default: 0 })
  readingTime: number; // Time spent reading in milliseconds

  @Prop({ required: true, default: 0 })
  ayahsRead: number;

  @Prop({ required: true, default: [] })
  surahsVisited: number[];

  @Prop({ required: true, default: [] })
  featuresUsed: string[]; // Array of feature names used

  // Performance metrics
  @Prop({ required: false })
  averageLoadTime?: number;

  @Prop({ required: false })
  errorCount?: number;

  @Prop({ required: false })
  crashOccurred?: boolean;

  // Session quality metrics
  @Prop({ required: false })
  engagement?: number; // Calculated engagement score

  @Prop({ required: false })
  bounceRate?: number; // Time to leave after first interaction

  // Referral information
  @Prop({ required: false })
  referrer?: string;

  @Prop({ required: false })
  campaign?: string;

  @Prop({ required: false })
  source?: string;

  // Session status
  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: false })
  terminationReason?: string; // 'user_logout', 'timeout', 'app_close', etc.

  createdAt: Date;
  updatedAt: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);

// Indexes
UserSessionSchema.index({ sessionId: 1 });
UserSessionSchema.index({ userId: 1 });
UserSessionSchema.index({ startTime: -1 });
UserSessionSchema.index({ userId: 1, startTime: -1 });
UserSessionSchema.index({ platform: 1 });
UserSessionSchema.index({ isActive: 1 });
UserSessionSchema.index({ userId: 1, isActive: 1 });

// TTL index to automatically clean up old sessions (after 30 days)
UserSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });