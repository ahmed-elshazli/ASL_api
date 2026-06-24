import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParticipantActionDto {
  @ApiProperty({
    description: 'The ID of the participant to add or remove',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @IsMongoId()
  participantId: string;
}