import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { RewardType, RewardStatus } from '../schemas/reward.schema';

export class GetRewardsQueryDto {
  @ApiProperty({
    description: 'Filter by reward type',
    enum: RewardType,
    example: RewardType.READING,
    required: false,
  })
  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @ApiProperty({
    description: 'Filter by reward status',
    enum: RewardStatus,
    example: RewardStatus.CLAIMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(RewardStatus)
  status?: RewardStatus;

  @ApiProperty({
    description: 'Number of results per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;
}