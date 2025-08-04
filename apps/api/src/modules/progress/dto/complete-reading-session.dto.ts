import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CompleteReadingSessionDto {
  @ApiProperty({ description: 'Ending Surah number', required: false })
  @IsOptional()
  @IsNumber()
  endSurah?: number;

  @ApiProperty({ description: 'Ending Ayah number', required: false })
  @IsOptional()
  @IsNumber()
  endAyah?: number;

  @ApiProperty({ description: 'Session notes', required: false })
  @IsOptional()
  @IsString()
  sessionNotes?: string;

  @ApiProperty({ description: 'Personal reflection', required: false })
  @IsOptional()
  @IsString()
  reflection?: string;

  @ApiProperty({ description: 'Session rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}