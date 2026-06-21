
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ProgramExerciseDto {
  @IsMongoId()
  exerciseId: string;

  @IsNumber()
  @Min(1)
  order: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sets?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  repsOrDuration?: string;
}