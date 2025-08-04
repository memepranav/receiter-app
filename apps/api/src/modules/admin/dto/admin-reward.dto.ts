import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum } from 'class-validator';
import { RewardType } from '../../rewards/schemas/reward.schema';

export class AdminRewardDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Reward type', enum: RewardType })
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({ description: 'Reward points' })
  @IsNumber()
  points: number;

  @ApiProperty({ description: 'Adjustment reason' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Admin notes' })
  @IsString()
  adminNotes: string;
}