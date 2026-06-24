import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
 
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Send a message with an optional file attachment' })
  @ApiConsumes('multipart/form-data')

  sendMessage(
    @Body() dto: SendMessageDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserId() userId: string,
  ) {
    return this.messagesService.sendMessage(userId, dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get messages with pagination and filters' })
  getMessages(
    @CurrentUserId() userId: string,
    @Query() query: BuildQueryDto,
  ) {
    return this.messagesService.getMessages(userId, query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message by ID' })
  deleteMessage(
    @Param('id') messageId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.messagesService.deleteMessage(messageId, userId);
  }
}