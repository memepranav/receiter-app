import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranslationDocument = Translation & Document;

export interface TranslatedAyah {
  surahNumber: number;
  ayahNumber: number;
  text: string;
}

@Schema({
  timestamps: true,
  collection: 'translations',
})
export class Translation {
  @Prop({ required: true, unique: true })
  identifier: string; // e.g., 'sahih-international', 'pickthall'

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  englishName: string;

  @Prop({ required: true })
  language: string; // e.g., 'en', 'ar', 'ur', 'id'

  @Prop({ required: true })
  languageName: string; // e.g., 'English', 'Arabic', 'Urdu'

  @Prop({ required: false })
  translator?: string;

  @Prop({ required: false })
  source?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: 0 })
  popularity: number; // For sorting popular translations

  // Translation content - can be stored as separate collection or embedded
  @Prop({ required: false })
  ayahs?: TranslatedAyah[];

  @Prop({ required: true, default: false })
  isComplete: boolean; // Whether all ayahs are translated

  @Prop({ required: false })
  version?: string; // Version of the translation

  @Prop({ required: false })
  publishDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const TranslationSchema = SchemaFactory.createForClass(Translation);

// Indexes
TranslationSchema.index({ identifier: 1 });
TranslationSchema.index({ language: 1 });
TranslationSchema.index({ isActive: 1 });
TranslationSchema.index({ popularity: -1 });
TranslationSchema.index({ isComplete: 1 });