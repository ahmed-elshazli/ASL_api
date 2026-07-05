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
import { UploadService } from 'src/common/storage/upload.service';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Send a message with an optional file attachment' })
  @ApiConsumes('multipart/form-data')

  sendMessage(
  
    @UploadedFile() file: Express.Multer.File,
   
  ) {
    return this.uploadService.uploadChatFile(file);
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