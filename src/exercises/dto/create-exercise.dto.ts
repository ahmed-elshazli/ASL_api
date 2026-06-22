import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({
    example: 'Running in Place',
    minLength: 2,
    maxLength: 100,
    description: 'Exercise title',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    example: 'A light cardio exercise for warm-up',
    maxLength: 500,
    description: 'Exercise description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 5,
    minimum: 1,
    description: 'Duration in minutes',
  })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({
    example: 50,
    minimum: 0,
    description: 'Calories burned',
  })
  @IsNumber()
  @Min(0)
  calories: number;
}