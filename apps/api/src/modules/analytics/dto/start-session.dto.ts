import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class LocationInfoDto {
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
}

export class ReferrerInfoDto {
  @ApiProperty({ description: 'Referrer URL', required: false })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiProperty({ description: 'Campaign name', required: false })
  @IsOptional()
  @IsString()
  campaign?: string;

  @ApiProperty({ description: 'Source', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

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

  @ApiProperty({ description: 'Connection type', example: 'wifi', required: false })
  @IsOptional()
  @IsString()
  connectionType?: string;
}

export class StartSessionDto {
  @ApiProperty({
    description: 'Unique session identifier',
    example: 'session-123-abc',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Device information',
    type: DeviceInfoDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  deviceInfo?: DeviceInfoDto;

  @ApiProperty({
    description: 'Location information',
    type: LocationInfoDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  location?: LocationInfoDto;

  @ApiProperty({
    description: 'Referrer information',
    type: ReferrerInfoDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  referrer?: ReferrerInfoDto;
}