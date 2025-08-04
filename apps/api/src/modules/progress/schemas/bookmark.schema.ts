import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookmarkDocument = Bookmark & Document;

export enum BookmarkType {
  AYAH = 'ayah',
  SURAH = 'surah',
  JUZ = 'juz',
  RANGE = 'range', // Range of ayahs
}

export enum BookmarkCategory {
  FAVORITE = 'favorite',
  TO_READ = 'to_read',
  REFLECTION = 'reflection',
  MEMORIZATION = 'memorization',
  STUDY = 'study',
  CUSTOM = 'custom',
}

@Schema({
  timestamps: true,
  collection: 'bookmarks',
})
export class Bookmark {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: BookmarkType })
  type: BookmarkType;

  @Prop({ required: true, enum: BookmarkCategory, default: BookmarkCategory.FAVORITE })
  category: BookmarkCategory;

  @Prop({ required: true })
  surahNumber: number;

  @Prop({ required: false })
  ayahNumber?: number; // Not required for surah/juz bookmarks

  @Prop({ required: false })
  juzNumber?: number;

  // For range bookmarks
  @Prop({ required: false })
  endSurahNumber?: number;

  @Prop({ required: false })
  endAyahNumber?: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  notes?: string;

  @Prop({ required: false })
  reflection?: string;

  // Ayah text (cached for quick access)
  @Prop({ required: false })
  ayahText?: string;

  @Prop({ required: false })
  translationText?: string;

  @Prop({ required: false })
  translationId?: string;

  // Organization
  @Prop({ required: false })
  tags?: string[];

  @Prop({ required: false })
  color?: string; // Color coding for organization

  @Prop({ required: false })
  customCategory?: string; // User-defined category

  // Privacy and sharing
  @Prop({ required: true, default: true })
  isPrivate: boolean;

  @Prop({ required: false })
  sharedWith?: string[]; // Array of user IDs

  // Usage tracking
  @Prop({ required: true, default: 0 })
  viewCount: number;

  @Prop({ required: false })
  lastViewedAt?: Date;

  @Prop({ required: false })
  lastReadAt?: Date;

  // Reading context when bookmark was created
  @Prop({ required: false })
  sessionId?: string;

  @Prop({ required: false })
  readingMode?: string;

  @Prop({ required: false })
  deviceType?: string;

  // Reminder and notifications
  @Prop({ required: false })
  reminderTime?: Date;

  @Prop({ required: true, default: false })
  reminderEnabled: boolean;

  @Prop({ required: false })
  reminderFrequency?: string; // 'once', 'daily', 'weekly', 'monthly'

  // Metadata for future extensions
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  // Display order (for custom sorting)
  @Prop({ required: true, default: 0 })
  displayOrder: number;

  createdAt: Date;
  updatedAt: Date;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

// Indexes for efficient querying
BookmarkSchema.index({ userId: 1 });
BookmarkSchema.index({ type: 1 });
BookmarkSchema.index({ category: 1 });
BookmarkSchema.index({ surahNumber: 1 });
BookmarkSchema.index({ userId: 1, category: 1 });
BookmarkSchema.index({ userId: 1, type: 1 });
BookmarkSchema.index({ userId: 1, surahNumber: 1 });
BookmarkSchema.index({ userId: 1, createdAt: -1 });
BookmarkSchema.index({ userId: 1, displayOrder: 1 });
BookmarkSchema.index({ reminderTime: 1, reminderEnabled: 1 });

// Text search index for notes and descriptions
BookmarkSchema.index({ 
  title: 'text', 
  description: 'text', 
  notes: 'text', 
  reflection: 'text' 
});