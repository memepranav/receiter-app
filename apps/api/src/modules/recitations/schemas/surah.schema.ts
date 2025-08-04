import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SurahDocument = Surah & Document;

export interface Ayah {
  number: number;
  text: string;
  textUthmani: string;
  textIndopak?: string;
  juz: number;
  hizb: number;
  rub: number;
  page: number;
  manzil: number;
  sajda?: boolean;
}

@Schema({
  timestamps: true,
  collection: 'surahs',
})
export class Surah {
  @Prop({ required: true, unique: true })
  number: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  englishName: string;

  @Prop({ required: true })
  englishNameTranslation: string;

  @Prop({ required: true })
  numberOfAyahs: number;

  @Prop({ required: true, enum: ['Meccan', 'Medinan'] })
  revelationType: 'Meccan' | 'Medinan';

  @Prop({ required: true })
  ayahs: Ayah[];

  // Additional metadata
  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  bismillahPre?: boolean;

  @Prop({ required: false })
  revelationOrder?: number;

  createdAt: Date;
  updatedAt: Date;
}

export const SurahSchema = SchemaFactory.createForClass(Surah);

// Indexes
SurahSchema.index({ number: 1 });
SurahSchema.index({ name: 1 });
SurahSchema.index({ englishName: 1 });
SurahSchema.index({ revelationType: 1 });