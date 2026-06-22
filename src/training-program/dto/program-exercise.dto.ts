import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProgramExerciseDto {
  @ApiProperty({
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
    description: 'Exercise MongoDB ID',
  })
  @IsMongoId()
  exerciseId: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    description: 'Exercise order within the program',
  })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiPropertyOptional({
    example: 3,
    minimum: 1,
    description: 'Number of sets',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  sets?: number;

  @ApiPropertyOptional({
    example: '15-20 reps',
    maxLength: 50,
    description: 'Reps count or duration (e.g. "15-20 reps" or "30 seconds")',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  repsOrDuration?: string;
}