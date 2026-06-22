import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CompleteExerciseDto {
  @IsMongoId()
  @IsNotEmpty()
  exerciseId: string;
}