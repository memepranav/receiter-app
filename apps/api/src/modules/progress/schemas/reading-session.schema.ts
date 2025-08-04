import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReadingSessionDocument = ReadingSession & Document;

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export interface ReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  timestamp: Date;
  readingTime: number; // Time spent on this ayah in milliseconds
}

@Schema({
  timestamps: true,
  collection: 'reading_sessions',
})
export class ReadingSession {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ required: true, enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: false })
  endTime?: Date;

  @Prop({ required: true, default: 0 })
  duration: number; // Total session duration in milliseconds

  @Prop({ required: true, default: 0 })
  activeReadingTime: number; // Time actively reading (excluding pauses)

  // Reading context
  @Prop({ required: false })
  startSurah?: number;

  @Prop({ required: false })
  startAyah?: number;

  @Prop({ required: false })
  currentSurah?: number;

  @Prop({ required: false })
  currentAyah?: number;

  @Prop({ required: false })
  endSurah?: number;

  @Prop({ required: false })
  endAyah?: number;

  // Progress tracking
  @Prop({ required: true, default: [] })
  ayahsRead: ReadingProgress[];

  @Prop({ required: true, default: 0 })
  totalAyahs: number;

  @Prop({ required: true, default: [] })
  surahsVisited: number[];

  @Prop({ required: true, default: [] })
  surahsCompleted: number[];

  @Prop({ required: true, default: [] })
  juzVisited: number[];

  @Prop({ required: true, default: [] })
  juzCompleted: number[];

  // Reading mode and preferences
  @Prop({ required: false })
  readingMode?: string; // 'sequential', 'random', 'bookmark', 'juz', etc.

  @Prop({ required: false })
  reciter?: string;

  @Prop({ required: false })
  translation?: string;

  @Prop({ required: true, default: false })
  audioEnabled: boolean;

  @Prop({ required: true, default: false })
  translationEnabled: boolean;

  // Session goals
  @Prop({ required: false })
  goalType?: string; // 'time', 'ayahs', 'pages', 'surah', 'juz'

  @Prop({ required: false })
  goalTarget?: number;

  @Prop({ required: true, default: 0 })
  goalProgress: number;

  @Prop({ required: true, default: false })
  goalAchieved: boolean;

  // Device and context
  @Prop({ required: false })
  deviceType?: string;

  @Prop({ required: false })
  platform?: string;

  @Prop({ required: false })
  appVersion?: string;

  // Interruptions and pauses
  @Prop({ required: true, default: 0 })
  pauseCount: number;

  @Prop({ required: true, default: 0 })
  totalPauseTime: number;

  @Prop({ required: false })
  pauseReasons?: string[]; // Array of pause reasons

  // Quality metrics
  @Prop({ required: false })
  averageAyahTime?: number; // Average time per ayah

  @Prop({ required: false })
  readingSpeed?: number; // Ayahs per minute

  @Prop({ required: false })
  focusScore?: number; // Calculated based on pauses and consistency

  // Bookmarks created during session
  @Prop({ required: true, default: [] })
  bookmarksCreated: string[]; // Array of bookmark IDs

  // Notes and reflections
  @Prop({ required: false })
  sessionNotes?: string;

  @Prop({ required: false })
  reflection?: string;

  @Prop({ required: false })
  rating?: number; // User's rating of the session (1-5)

  // Rewards earned
  @Prop({ required: true, default: 0 })
  pointsEarned: number;

  @Prop({ required: true, default: [] })
  badgesEarned: string[];

  // Metadata
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const ReadingSessionSchema = SchemaFactory.createForClass(ReadingSession);

// Indexes for efficient querying
ReadingSessionSchema.index({ userId: 1 });
ReadingSessionSchema.index({ sessionId: 1 });
ReadingSessionSchema.index({ status: 1 });
ReadingSessionSchema.index({ startTime: -1 });
ReadingSessionSchema.index({ userId: 1, status: 1 });
ReadingSessionSchema.index({ userId: 1, startTime: -1 });
ReadingSessionSchema.index({ userId: 1, status: 1, startTime: -1 });

// TTL index to clean up old completed sessions (after 1 year)
ReadingSessionSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 365 * 24 * 60 * 60,
  partialFilterExpression: { status: { $in: [SessionStatus.COMPLETED, SessionStatus.ABANDONED] } }
});