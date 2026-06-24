import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'The ID of the conversation to send the message to',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @IsMongoId()
  conversationId: string;

  @ApiPropertyOptional({
    description: 'Text content of the message',
    minLength: 1,
    example: 'Hello, how are you?',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}