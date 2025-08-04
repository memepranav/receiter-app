import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddFriendDto {
  @ApiProperty({
    description: 'User ID to send friend request to',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  userId: string;
}