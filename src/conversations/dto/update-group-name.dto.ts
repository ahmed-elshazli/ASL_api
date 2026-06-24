import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupNameDto {
  @ApiProperty({
    description: 'The new name for the group conversation',
    minLength: 3,
    maxLength: 50,
    example: 'Team Alpha',
  })
  @IsString()
  @Length(3, 50)
  groupName: string;
}