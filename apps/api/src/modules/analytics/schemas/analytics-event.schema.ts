import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnalyticsEventDocument = AnalyticsEvent & Document;

export enum EventType {
  // User Events
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PROFILE_UPDATED = 'profile_updated',
  
  // Reading Events
  READING_SESSION_STARTED = 'reading_session_started',
  READING_SESSION_ENDED = 'reading_session_ended',
  AYAH_READ = 'ayah_read',
  SURAH_COMPLETED = 'surah_completed',
  JUZ_COMPLETED = 'juz_completed',
  BOOKMARK_ADDED = 'bookmark_added',
  BOOKMARK_REMOVED = 'bookmark_removed',
  
  // Audio Events
  AUDIO_PLAYED = 'audio_played',
  AUDIO_PAUSED = 'audio_paused',
  AUDIO_COMPLETED = 'audio_completed',
  RECITER_CHANGED = 'reciter_changed',
  
  // Translation Events
  TRANSLATION_VIEWED = 'translation_viewed',
  TRANSLATION_CHANGED = 'translation_changed',
  
  // Search Events
  SEARCH_PERFORMED = 'search_performed',
  SEARCH_RESULT_CLICKED = 'search_result_clicked',
  
  // Social Events
  FRIEND_REQUEST_SENT = 'friend_request_sent',
  FRIEND_REQUEST_ACCEPTED = 'friend_request_accepted',
  LEADERBOARD_VIEWED = 'leaderboard_viewed',
  
  // Reward Events
  REWARD_EARNED = 'reward_earned',
  REWARD_CLAIMED = 'reward_claimed',
  BADGE_EARNED = 'badge_earned',
  WALLET_CONNECTED = 'wallet_connected',
  TOKENS_WITHDRAWN = 'tokens_withdrawn',
  
  // App Events
  APP_OPENED = 'app_opened',
  APP_BACKGROUNDED = 'app_backgrounded',
  APP_CLOSED = 'app_closed',
  NOTIFICATION_RECEIVED = 'notification_received',
  NOTIFICATION_CLICKED = 'notification_clicked',
  
  // Error Events
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',
  CRASH_REPORTED = 'crash_reported',
}

@Schema({
  timestamps: true,
  collection: 'analytics_events',
})
export class AnalyticsEvent {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: EventType })
  eventType: EventType;

  @Prop({ required: true })
  eventName: string;

  @Prop({ type: Object, default: {} })
  properties: Record<string, any>;

  // Session information
  @Prop({ required: false })
  sessionId?: string;

  @Prop({ required: false })
  deviceId?: string;

  // Device and platform info
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

  // Location info (if available and permitted)
  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  region?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  timezone?: string;

  // Network info
  @Prop({ required: false })
  connectionType?: string; // 'wifi', 'cellular', 'unknown'

  // Performance metrics
  @Prop({ required: false })
  duration?: number; // Event duration in milliseconds

  @Prop({ required: false })
  loadTime?: number; // Page/screen load time

  @Prop({ required: false })
  memoryUsage?: number;

  // Attribution
  @Prop({ required: false })
  referrer?: string;

  @Prop({ required: false })
  campaign?: string;

  @Prop({ required: false })
  source?: string;

  // Timestamp (server time)
  @Prop({ required: false })
  serverTimestamp?: Date;

  // Client timestamp (may differ from server)
  @Prop({ required: false })
  clientTimestamp?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent);

// Indexes for efficient querying
AnalyticsEventSchema.index({ userId: 1 });
AnalyticsEventSchema.index({ eventType: 1 });
AnalyticsEventSchema.index({ createdAt: -1 });
AnalyticsEventSchema.index({ userId: 1, eventType: 1 });
AnalyticsEventSchema.index({ userId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });
AnalyticsEventSchema.index({ platform: 1 });
AnalyticsEventSchema.index({ eventType: 1, createdAt: -1 });

// Compound indexes for common queries
AnalyticsEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ platform: 1, eventType: 1, createdAt: -1 });