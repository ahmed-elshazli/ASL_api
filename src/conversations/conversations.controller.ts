import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ConversationsService } from './conversations.service';

import { CreateConversationDto } from './dto/create-conversation.dto';
import { ParticipantActionDto } from './dto/participant-action.dto';
import { UpdateGroupNameDto } from './dto/update-group-name.dto';

import { CurrentUserId } from 'src/common/decorators/current-user.decorator';

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiCreatedResponse({ description: 'Conversation created successfully' })
  createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.conversationsService.createConversation(dto.participants, currentUserId);
  }

  @Post('find-or-create')
  @ApiOperation({ summary: 'Find existing conversation or create a new one' })
  @ApiOkResponse({ description: 'Conversation found or created successfully' })
  findOrCreateConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.conversationsService.findOrCreateConversation(dto.participants, currentUserId);
  }

  @Get('user-conversations')
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  @ApiOkResponse({ description: 'List of user conversations' })
  getUserConversations(@CurrentUserId() currentUserId: string) {
    return this.conversationsService.getUserConversations(currentUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiOkResponse({ description: 'Conversation details' })
  getConversationById(
    @Param('id') conversationId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.conversationsService.getConversationById(conversationId, currentUserId);
  }

  @Patch(':id/last-message')
  @ApiOperation({ summary: 'Update the last message of a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiBody({ schema: { properties: { messageId: { type: 'string' } }, required: ['messageId'] } })
  @ApiOkResponse({ description: 'Last message updated successfully' })
  updateLastMessage(
    @Param('id') conversationId: string,
    @Body('messageId') messageId: string,
  ) {
    return this.conversationsService.updateLastMessage(conversationId, messageId);
  }


  @Patch(':id/add-participant')
  @ApiOperation({ summary: 'Add a participant to a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiOkResponse({ description: 'Participant added successfully' })
  addParticipant(
    @Param('id') conversationId: string,
    @Body() dto: ParticipantActionDto,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.conversationsService.addParticipant(conversationId, dto.participantId, currentUserId);
  }

  @Patch(':id/remove-participant')
  @ApiOperation({ summary: 'Remove a participant from a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiOkResponse({ description: 'Participant removed successfully' })
  removeParticipant(
    @Param('id') conversationId: string,
    @Body() dto: ParticipantActionDto,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.conversationsService.removeParticipant(conversationId, dto.participantId, currentUserId);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiOkResponse({ description: 'Conversation archived successfully' })
  archiveConversation(
    @Param('id') conversationId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.conversationsService.archiveConversation(conversationId, currentUserId);
  }

  @Patch(':id/group-name')
  @ApiOperation({ summary: 'Update the group name of a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiOkResponse({ description: 'Group name updated successfully' })
  updateGroupName(
    @Param('id') conversationId: string,
    @Body() dto: UpdateGroupNameDto,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.conversationsService.updateGroupName(conversationId, dto.groupName, currentUserId);
  }

  @Patch(':id/leave')
  @ApiOperation({ summary: 'Leave a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiOkResponse({ description: 'Left conversation successfully' })
  leaveConversation(
    @Param('id') conversationId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.conversationsService.leaveConversation(conversationId, currentUserId);
  }


  @Patch(':id/read')
  markAsRead(
    @Param('id') conversationId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.conversationsService.markAsRead(
      conversationId,
      userId,
    );
  }
}