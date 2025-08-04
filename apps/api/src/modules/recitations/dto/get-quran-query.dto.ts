import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetQuranQueryDto {
  @ApiProperty({
    description: 'Translation identifier to include with the content',
    example: 'sahih-international',
    required: false,
  })
  @IsOptional()
  @IsString()
  translation?: string;

  @ApiProperty({
    description: 'Reciter identifier for audio content',
    example: 'abdul-basit',
    required: false,
  })
  @IsOptional()
  @IsString()
  reciter?: string;

  @ApiProperty({
    description: 'Text format preference',
    example: 'uthmani',
    enum: ['uthmani', 'indopak', 'simple'],
    required: false,
  })
  @IsOptional()
  @IsString()
  textFormat?: 'uthmani' | 'indopak' | 'simple';
}