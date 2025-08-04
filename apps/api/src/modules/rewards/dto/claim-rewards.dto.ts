import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsBoolean, IsString } from 'class-validator';

export class ClaimRewardsDto {
  @ApiProperty({
    description: 'Specific reward IDs to claim (if not claiming all)',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rewardIds?: string[];

  @ApiProperty({
    description: 'Claim all pending rewards',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  claimAll?: boolean;
}