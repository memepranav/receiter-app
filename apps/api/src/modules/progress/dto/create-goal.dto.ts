import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { GoalType, GoalPeriod } from '../schemas/reading-goal.schema';

export class CreateGoalDto {
  @ApiProperty({ enum: GoalType })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiProperty({ enum: GoalPeriod })
  @IsEnum(GoalPeriod)
  period: GoalPeriod;

  @ApiProperty({ description: 'Goal title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Goal description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Target value' })
  @IsNumber()
  targetValue: number;

  @ApiProperty({ description: 'Target unit', required: false })
  @IsOptional()
  @IsString()
  targetUnit?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Is recurring goal', required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ description: 'Reminder enabled', required: false })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiProperty({ description: 'Reminder time (HH:MM)', required: false })
  @IsOptional()
  @IsString()
  reminderTime?: string;
}