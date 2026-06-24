import { IsArray, ArrayMinSize, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'List of participant user IDs',
    type: [String],
    minItems: 1,
    example: ['64f1a2b3c4d5e6f7a8b9c0d1', '64f1a2b3c4d5e6f7a8b9c0d2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  participants: string[];
}