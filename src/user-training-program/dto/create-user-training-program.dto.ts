import { IsMongoId, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignProgramDto {
  @ApiProperty({ example: '64a7f9b2c3d4e5f6a7b8c9d0' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: '64a7f9b2c3d4e5f6a7b8c9d1' })
  @IsMongoId()
  programId: string;

  @ApiProperty({ example: 30, description: 'Total duration of the program in days' })
  @IsInt()
  @Min(1)
  durationInDays: number;

  @ApiProperty({ example: 3, description: 'How many times the full program will be repeated' })
  @IsInt()
  @Min(1)
  repeatCount: number;
}