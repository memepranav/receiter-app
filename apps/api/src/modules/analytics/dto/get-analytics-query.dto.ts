import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAnalyticsQueryDto {
  @ApiProperty({
    description: 'Time period for analytics',
    example: 'month',
    enum: ['day', 'week', 'month', 'year'],
    required: false,
  })
  @IsOptional()
  @IsString()
  period?: 'day' | 'week' | 'month' | 'year';

  @ApiProperty({
    description: 'Number of results to return',
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
    description: 'Page number for pagination',
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