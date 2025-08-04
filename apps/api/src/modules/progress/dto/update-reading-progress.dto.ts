import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsArray } from 'class-validator';

export class ReadingProgressDto {
  @ApiProperty({ description: 'Surah number' })
  @IsNumber()
  surahNumber: number;

  @ApiProperty({ description: 'Ayah number' })
  @IsNumber()
  ayahNumber: number;

  @ApiProperty({ description: 'Reading time for this ayah in milliseconds' })
  @IsNumber()
  readingTime: number;
}

export class UpdateReadingProgressDto {
  @ApiProperty({ description: 'Current Surah number', required: false })
  @IsOptional()
  @IsNumber()
  currentSurah?: number;

  @ApiProperty({ description: 'Current Ayah number', required: false })
  @IsOptional()
  @IsNumber()
  currentAyah?: number;

  @ApiProperty({ description: 'Ayahs read in this update', type: [ReadingProgressDto], required: false })
  @IsOptional()
  @IsArray()
  ayahsRead?: ReadingProgressDto[];

  @ApiProperty({ description: 'Additional reading time in milliseconds', required: false })
  @IsOptional()
  @IsNumber()
  additionalReadingTime?: number;

  @ApiProperty({ description: 'Goal progress update', required: false })
  @IsOptional()
  @IsNumber()
  goalProgress?: number;
}