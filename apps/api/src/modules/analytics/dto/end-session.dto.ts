import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

export class FinalMetricsDto {
  @ApiProperty({ description: 'Total reading time in milliseconds', required: false })
  @IsOptional()
  @IsNumber()
  readingTime?: number;

  @ApiProperty({ description: 'Total ayahs read', required: false })
  @IsOptional()
  @IsNumber()
  ayahsRead?: number;

  @ApiProperty({ description: 'Total events tracked', required: false })
  @IsOptional()
  @IsNumber()
  eventCount?: number;

  @ApiProperty({ description: 'Number of errors occurred', required: false })
  @IsOptional()
  @IsNumber()
  errorCount?: number;
}

export class EndSessionDto {
  @ApiProperty({
    description: 'Session identifier to end',
    example: 'session-123-abc',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Reason for session termination',
    example: 'user_logout',
    required: false,
  })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @ApiProperty({
    description: 'Final session metrics',
    type: FinalMetricsDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  finalMetrics?: FinalMetricsDto;
}