import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsObject, IsDateString } from 'class-validator';
import { EventType } from '../schemas/analytics-event.schema';

export class DeviceInfoDto {
  @ApiProperty({ description: 'Device ID', example: 'device-123', required: false })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ description: 'Platform', example: 'ios', required: false })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ description: 'Device type', example: 'mobile', required: false })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiProperty({ description: 'App version', example: '1.0.0', required: false })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({ description: 'OS version', example: '15.0', required: false })
  @IsOptional()
  @IsString()
  osVersion?: string;

  @ApiProperty({ description: 'User agent', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ description: 'Country', example: 'US', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Region', example: 'CA', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: 'City', example: 'San Francisco', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Timezone', example: 'America/Los_Angeles', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Connection type', example: 'wifi', required: false })
  @IsOptional()
  @IsString()
  connectionType?: string;
}

export class TrackEventDto {
  @ApiProperty({
    description: 'Event type',
    enum: EventType,
    example: EventType.AYAH_READ,
  })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({
    description: 'Human-readable event name',
    example: 'Ayah Read',
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    description: 'Event properties/metadata',
    example: { surahNumber: 1, ayahNumber: 1, readingTime: 5000 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @ApiProperty({
    description: 'Session ID',
    example: 'session-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    description: 'Device information',
    type: DeviceInfoDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  deviceInfo?: DeviceInfoDto;

  @ApiProperty({
    description: 'Client timestamp (ISO string)',
    example: '2023-12-01T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}