import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BadgeDocument = Badge & Document;

export enum BadgeCategory {
  READING = 'reading',
  COMPLETION = 'completion',
  STREAK = 'streak',
  SOCIAL = 'social',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
}

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

@Schema({
  timestamps: true,
  collection: 'badges',
})
export class Badge {
  @Prop({ required: true, unique: true })
  identifier: string; // e.g., 'first-surah', 'streak-7-days'

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: BadgeCategory })
  category: BadgeCategory;

  @Prop({ required: true, enum: BadgeRarity, default: BadgeRarity.COMMON })
  rarity: BadgeRarity;

  @Prop({ required: false })
  iconUrl?: string;

  @Prop({ required: false })
  iconColor?: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  // Requirements to earn this badge
  @Prop({ type: Object, required: true })
  requirements: {
    type: string; // 'reading_time', 'surahs_completed', 'streak_days', etc.
    value: number;
    period?: string; // 'daily', 'weekly', 'monthly', 'all_time'
  };

  // Reward given when badge is earned
  @Prop({ required: false })
  rewardPoints?: number;

  @Prop({ required: false })
  bonusRewards?: {
    type: string;
    value: number;
  }[];

  // Display information
  @Prop({ required: true, default: 0 })
  displayOrder: number;

  @Prop({ required: false })
  unlockMessage?: string;

  // Statistics
  @Prop({ required: true, default: 0 })
  totalEarned: number; // How many users have earned this badge

  @Prop({ required: false })
  firstEarnedAt?: Date;

  @Prop({ required: false, type: String })
  firstEarnedBy?: string; // User ID

  // Metadata for complex badge logic
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);

// Indexes
BadgeSchema.index({ identifier: 1 });
BadgeSchema.index({ category: 1 });
BadgeSchema.index({ rarity: 1 });
BadgeSchema.index({ isActive: 1 });
BadgeSchema.index({ displayOrder: 1 });
BadgeSchema.index({ totalEarned: -1 });