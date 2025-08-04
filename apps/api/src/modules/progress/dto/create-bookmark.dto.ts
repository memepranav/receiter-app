import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { BookmarkType, BookmarkCategory } from '../schemas/bookmark.schema';

export class CreateBookmarkDto {
  @ApiProperty({ enum: BookmarkType })
  @IsEnum(BookmarkType)
  type: BookmarkType;

  @ApiProperty({ enum: BookmarkCategory, required: false })
  @IsOptional()
  @IsEnum(BookmarkCategory)
  category?: BookmarkCategory;

  @ApiProperty({ description: 'Surah number' })
  @IsNumber()
  surahNumber: number;

  @ApiProperty({ description: 'Ayah number', required: false })
  @IsOptional()
  @IsNumber()
  ayahNumber?: number;

  @ApiProperty({ description: 'Juz number', required: false })
  @IsOptional()
  @IsNumber()
  juzNumber?: number;

  @ApiProperty({ description: 'Bookmark title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Personal notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

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