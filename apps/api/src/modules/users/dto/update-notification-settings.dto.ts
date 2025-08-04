import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiProperty({
    description: 'Enable email notifications',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({
    description: 'Enable push notifications',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiProperty({
    description: 'Enable reading reminders',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  readingReminders?: boolean;

  @ApiProperty({
    description: 'Share reading statistics publicly',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  shareReadingStats?: boolean;

  @ApiProperty({
    description: 'Show user on leaderboards',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showOnLeaderboard?: boolean;

  @ApiProperty({
    description: 'Allow friend requests from other users',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowFriendRequests?: boolean;

  @ApiProperty({
    description: 'Make profile public',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  profilePublic?: boolean;
}