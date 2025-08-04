import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class StartReadingSessionDto {
  @ApiProperty({ description: 'Unique session identifier' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Starting Surah number', required: false })
  @IsOptional()
  @IsNumber()
  startSurah?: number;

  @ApiProperty({ description: 'Starting Ayah number', required: false })
  @IsOptional()
  @IsNumber()
  startAyah?: number;

  @ApiProperty({ description: 'Reading mode', required: false })
  @IsOptional()
  @IsString()
  readingMode?: string;

  @ApiProperty({ description: 'Selected reciter', required: false })
  @IsOptional()
  @IsString()
  reciter?: string;

  @ApiProperty({ description: 'Selected translation', required: false })
  @IsOptional()
  @IsString()
  translation?: string;

  @ApiProperty({ description: 'Audio enabled', required: false })
  @IsOptional()
  @IsBoolean()
  audioEnabled?: boolean;

  @ApiProperty({ description: 'Translation enabled', required: false })
  @IsOptional()
  @IsBoolean()
  translationEnabled?: boolean;

  @ApiProperty({ description: 'Goal type', required: false })
  @IsOptional()
  @IsString()
  goalType?: string;

  @ApiProperty({ description: 'Goal target', required: false })
  @IsOptional()
  @IsNumber()
  goalTarget?: number;

  @ApiProperty({ description: 'Device type', required: false })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiProperty({ description: 'Platform', required: false })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ description: 'App version', required: false })
  @IsOptional()
  @IsString()
  appVersion?: string;
}