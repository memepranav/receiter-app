import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuranAyahDocument = QuranAyah & Document;

@Schema({
  collection: 'quran_ayahs',
  timestamps: false,
})
export class QuranAyah {
  @Prop({ required: true, unique: true })
  _id: string; // Format: "sura_number:ayah_number" e.g., "1:1"

  @Prop({ required: true })
  sura_number: number;

  @Prop({ required: true })
  sura_name_arabic: string;

  @Prop({ required: true })
  ayah_number: number;

  @Prop({ required: true })
  ayah_text_arabic: string;

  @Prop({ required: true })
  juz_number: number;

  @Prop({ required: true })
  hizb_number: number;

  @Prop({ required: true })
  quarter_hizb_segment: string;

  @Prop({ required: true, default: false })
  is_bismillah: boolean;
}

export const QuranAyahSchema = SchemaFactory.createForClass(QuranAyah);

// Indexes for better performance
QuranAyahSchema.index({ sura_number: 1, ayah_number: 1 });
QuranAyahSchema.index({ juz_number: 1 });
QuranAyahSchema.index({ hizb_number: 1 });
QuranAyahSchema.index({ sura_number: 1 });
QuranAyahSchema.index({ quarter_hizb_segment: 1 });