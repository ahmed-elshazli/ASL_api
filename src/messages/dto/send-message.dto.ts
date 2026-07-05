import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../schemas/message.schema';


export class SendMessageDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @IsMongoId()
  conversationId: string;

  @ApiPropertyOptional({
    description: 'Message content',
    example: 'Hello',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @ApiPropertyOptional({
    enum: MessageType,
    example: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/demo/image/upload/v123/chat/image.jpg',
  })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiPropertyOptional({
    example: 'image.jpg',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    example: 123456,
  })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;
}