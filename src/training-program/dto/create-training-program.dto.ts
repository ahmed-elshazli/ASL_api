import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProgramCategory } from '../enums/program-category.enum';
import { ProgramLevel } from '../enums/program-level.enum';
import { ProgramExerciseDto } from './program-exercise.dto';

export class CreateTrainingProgramDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;


  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;


  @IsEnum(ProgramCategory)
  category: ProgramCategory;


  @IsEnum(ProgramLevel)
  level: ProgramLevel;


  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration: number;


  @Type(() => Number)
  @IsInt()
  @Min(0)
  minCalories: number;


  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxCalories: number;


  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;


  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProgramExerciseDto)
  exercises: ProgramExerciseDto[];


 
}
