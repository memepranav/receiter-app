import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { BookmarkCategory } from '../schemas/bookmark.schema';

export class UpdateBookmarkDto {
  @ApiProperty({ enum: BookmarkCategory, required: false })
  @IsOptional()
  @IsEnum(BookmarkCategory)
  category?: BookmarkCategory;

  @ApiProperty({ description: 'Bookmark title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Personal notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Reflection', required: false })
  @IsOptional()
  @IsString()
  reflection?: string;

  @ApiProperty({ description: 'Tags', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: 'Color coding', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Is private', required: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}