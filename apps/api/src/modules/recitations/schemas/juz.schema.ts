import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JuzDocument = Juz & Document;

export interface JuzSurah {
  surahNumber: number;
  surahName: string;
  englishName: string;
  startAyah: number;
  endAyah: number;
}

@Schema({
  timestamps: true,
  collection: 'juz',
})
export class Juz {
  @Prop({ required: true, unique: true })
  number: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  englishName: string;

  @Prop({ required: true })
  surahs: JuzSurah[];

  @Prop({ required: true })
  totalAyahs: number;

  @Prop({ required: true })
  startPage: number;

  @Prop({ required: true })
  endPage: number;

  // Hizb and Rub information (4 Hizb per Juz, 8 Rub per Juz)
  @Prop({ required: true })
  hizbs: number[]; // Array of 4 hizb numbers

  @Prop({ required: true })
  rubs: number[]; // Array of 8 rub numbers

  createdAt: Date;
  updatedAt: Date;
}

export const JuzSchema = SchemaFactory.createForClass(Juz);

// Indexes
JuzSchema.index({ number: 1 });
JuzSchema.index({ name: 1 });