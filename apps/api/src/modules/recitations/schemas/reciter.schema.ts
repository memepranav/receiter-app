import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReciterDocument = Reciter & Document;

@Schema({
  timestamps: true,
  collection: 'reciters',
})
export class Reciter {
  @Prop({ required: true, unique: true })
  identifier: string; // e.g., 'abdul-basit', 'mishary-alafasy'

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  englishName: string;

  @Prop({ required: false })
  arabicName?: string;

  @Prop({ required: false })
  style?: string; // e.g., 'Mujawwad', 'Murattal'

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: 0 })
  popularity: number; // For sorting popular reciters

  // Audio file information
  @Prop({ required: true, default: 'mp3' })
  audioFormat: string;

  @Prop({ required: true, default: 128 })
  audioBitrate: number;

  @Prop({ required: false })
  audioBaseUrl?: string; // Base URL for audio files

  // Availability information
  @Prop({ required: true, default: [] })
  availableSurahs: number[]; // Array of surah numbers available

  @Prop({ required: true, default: false })
  isComplete: boolean; // Whether all 114 surahs are available

  createdAt: Date;
  updatedAt: Date;
}

export const ReciterSchema = SchemaFactory.createForClass(Reciter);

// Indexes
ReciterSchema.index({ identifier: 1 });
ReciterSchema.index({ name: 1 });
ReciterSchema.index({ englishName: 1 });
ReciterSchema.index({ isActive: 1 });
ReciterSchema.index({ popularity: -1 });
ReciterSchema.index({ isComplete: 1 });