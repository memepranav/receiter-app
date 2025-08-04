import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ReadingGoal } from '../schemas/user.schema';

export class UpdatePreferencesDto {
  @ApiProperty({
    description: 'Preferred language for Quran text',
    example: 'arabic',
    required: false,
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({
    description: 'Preferred reciter ID',
    example: 'abdul-basit',
    required: false,
  })
  @IsOptional()
  @IsString()
  preferredReciter?: string;

  @ApiProperty({
    description: 'Preferred script type',
    example: 'uthmani',
    required: false,
  })
  @IsOptional()
  @IsString()
  preferredScript?: string;

  @ApiProperty({
    description: 'Show translation alongside Arabic text',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showTranslation?: boolean;

  @ApiProperty({
    description: 'Preferred translation ID',
    example: 'sahih-international',
    required: false,
  })
  @IsOptional()
  @IsString()
  preferredTranslation?: string;

  @ApiProperty({
    description: 'Reading goal type',
    enum: ReadingGoal,
    example: ReadingGoal.DAILY,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReadingGoal)
  readingGoal?: ReadingGoal;

  @ApiProperty({
    description: 'Reading goal amount (pages, juz, etc.)',
    example: 2,
    minimum: 1,
    maximum: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  readingGoalAmount?: number;

  @ApiProperty({
    description: 'Daily reminder time (HH:MM format)',
    example: '08:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  reminderTime?: string;
}