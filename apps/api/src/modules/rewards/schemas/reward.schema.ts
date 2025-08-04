import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RewardDocument = Reward & Document;

export enum RewardType {
  READING = 'reading',
  COMPLETION = 'completion',
  STREAK = 'streak',
  MILESTONE = 'milestone',
  REFERRAL = 'referral',
  DAILY_BONUS = 'daily_bonus',
  ACHIEVEMENT = 'achievement',
  QUIZ = 'quiz',
  SOCIAL = 'social',
}

export enum RewardStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Schema({
  timestamps: true,
  collection: 'rewards',
})
export class Reward {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: RewardType })
  type: RewardType;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true, enum: RewardStatus, default: RewardStatus.PENDING })
  status: RewardStatus;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  reason?: string;

  // Activity that triggered the reward
  @Prop({ required: false })
  activityId?: string; // reading session, completion, etc.

  @Prop({ required: false })
  activityType?: string; // 'reading_session', 'surah_completion', etc.

  // Metadata for specific reward types
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  // Processing information
  @Prop({ required: false })
  processedAt?: Date;

  @Prop({ required: false })
  claimedAt?: Date;

  @Prop({ required: false })
  expiresAt?: Date;

  // Blockchain transaction info (when claimed)
  @Prop({ required: false })
  transactionId?: string;

  @Prop({ required: false })
  transactionHash?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);

// Indexes
RewardSchema.index({ userId: 1 });
RewardSchema.index({ status: 1 });
RewardSchema.index({ type: 1 });
RewardSchema.index({ createdAt: -1 });
RewardSchema.index({ expiresAt: 1 });
RewardSchema.index({ userId: 1, status: 1 });
RewardSchema.index({ userId: 1, createdAt: -1 });