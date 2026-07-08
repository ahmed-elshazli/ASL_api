import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResultDto {
  @ApiPropertyOptional({
    description: 'Result description',
    example: 'Before and after treatment.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
 
  @MaxLength(2000)
  description?: string;
}