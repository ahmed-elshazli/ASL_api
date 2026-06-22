import {  IsMongoId } from 'class-validator';

export class AssignProgramDto {
  
  @IsMongoId()
  userId: string;

  @IsMongoId()
  programId: string;
}
