import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteExerciseDto {
  @ApiProperty({ example: '64a7f9b2c3d4e5f6a7b8c9d0' })
  @IsMongoId()
  @IsNotEmpty()
  exerciseId: string;
}