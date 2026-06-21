import { PartialType } from '@nestjs/swagger';
import { AssignProgramDto } from './create-user-training-program.dto';

export class UpdateUserTrainingProgramDto extends PartialType(AssignProgramDto) {}
