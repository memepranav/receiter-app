import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

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

  @ApiProperty({
    description: 'Include Arabic text in the response (for performance optimization)',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeText?: boolean;
}