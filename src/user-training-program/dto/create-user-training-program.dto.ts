import { IsArray, ArrayNotEmpty, IsMongoId } from 'class-validator';
import { Exists } from 'src/common/validators/id-exists.validator';

export class AssignProgramDto {
  @IsMongoId()
  @Exists('User', { message: 'User with the given ID does not exist' })
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  @Exists('TrainingProgram', { message: 'One or more training programs with the given IDs do not exist' })      
  programIds: string[];
}
