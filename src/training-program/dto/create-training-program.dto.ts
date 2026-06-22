import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { ProgramCategory } from '../enums/program-category.enum';
import { ProgramLevel } from '../enums/program-level.enum';
import { ProgramExerciseDto } from './program-exercise.dto';

export class CreateTrainingProgramDto {
  @ApiProperty({
    example: 'Fat Burning Program',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'An intensive cardio program to burn calories and improve fitness',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    enum: ProgramCategory,
    example: ProgramCategory.CARDIO,
    description: 'Program category',
  })
  @IsEnum(ProgramCategory)
  category: ProgramCategory;

  @ApiProperty({
    enum: ProgramLevel,
    example: ProgramLevel.BEGINNER,
    description: 'Program difficulty level',
  })
  @IsEnum(ProgramLevel)
  level: ProgramLevel;

  @ApiProperty({
    example: 30,
    minimum: 1,
    description: 'Program duration in minutes',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({
    example: 300,
    minimum: 0,
    description: 'Minimum calories burned',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minCalories: number;

  @ApiProperty({
    example: 400,
    minimum: 0,
    description: 'Maximum calories burned',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxCalories: number;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Whether the program requires a premium subscription',
  })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether the program is active and visible to users',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    type: [ProgramExerciseDto],
    description: 'List of exercises included in the program',
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProgramExerciseDto)
  exercises: ProgramExerciseDto[];
}