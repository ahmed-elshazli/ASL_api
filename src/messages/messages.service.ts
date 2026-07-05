import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Message,
  MessageDocument,
  MessageType,
} from './schemas/message.schema';
import {
  Conversation,
  ConversationDocument,
} from '../conversations/schemas/conversation.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<Message>,

    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}
  
  async sendMessage(
    userId: string,
    dto: SendMessageDto,
  ): Promise<MessageDocument> {
    const conversation = await this.validateConversation(
      dto.conversationId,
      userId,
    );

    this.validateMessagePayload(dto);

    const message = await this.createMessage(userId, dto);

    await this.updateConversationAfterMessage(
      conversation,
      message._id,
      userId,
    );

    return message;
  }

  async getMessages(userId: string, query: BuildQueryDto) {
    const conversation = await this.conversationModel.findOne({
      _id: query.conversationId,
      participants: new Types.ObjectId(userId),
    });

    if (!conversation) {
      throw new ForbiddenException(
        'You are not allowed to view these messages',
      );
    }

    const baseQuery = this.messageModel
      .find({
        conversationId: new Types.ObjectId(query.conversationId),
      })
      .populate('senderId', 'fullName email');

    const features = new ApiFeatures(baseQuery, query)
      .filter()
      .search(['content']);

    const total = await features.count();

    features.sort().limitFields().paginate(total);

    const data = await features.exec();

    return {
      results: data.length,
      pagination: features.paginationResult,
      data,
    };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const conversation = await this.conversationModel.findById(
      message.conversationId,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isMessageOwner = message.senderId.toString() === userId.toString();

    const isGroupOwner = conversation.owner?.toString() === userId.toString();

    if (!isMessageOwner && !isGroupOwner) {
      throw new ForbiddenException(
        'You are not allowed to delete this message',
      );
    }

    await message.deleteOne();

    if (conversation.lastMessage?.toString() === messageId) {
      const lastMessage = await this.messageModel
        .findOne({
          conversationId: conversation._id,
        })
        .sort({
          createdAt: -1,
        });

      await this.conversationModel.findByIdAndUpdate(conversation._id, {
        lastMessage: lastMessage?._id ?? null,

        lastMessageAt: lastMessage?.createdAt ?? null,
      });
    }
    message.isDeleted = true;
    await message.save();

    return {
      message: 'Message deleted successfully',
    };
  }

  private async validateConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDocument> {
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return conversation;
  }

  private async createMessage(
    userId: string,
    dto: SendMessageDto,
  ): Promise<MessageDocument> {
    return this.messageModel.create({
      conversationId: new Types.ObjectId(dto.conversationId),
      senderId: new Types.ObjectId(userId),

      content: dto.content?.trim(),

      type: dto.type ?? MessageType.TEXT,

      fileUrl: dto.fileUrl,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
    });
  }

  private async updateConversationAfterMessage(
    conversation: ConversationDocument,
    messageId: Types.ObjectId,
    senderId: string,
  ): Promise<void> {
    const unreadUpdates: Record<string, number> = {};

    for (const participant of conversation.participants) {
      const participantId = participant.toString();

      if (participantId === senderId) {
        continue;
      }

      unreadUpdates[`unreadCount.${participantId}`] = 1;
    }

    await this.conversationModel.findByIdAndUpdate(conversation._id, {
      $inc: unreadUpdates,
      lastMessage: messageId,
      lastMessageAt: new Date(),
    });
  }

  private validateMessagePayload(dto: SendMessageDto): void {
    if (!dto.content?.trim() && !dto.fileUrl) {
      throw new BadRequestException('Message content or file is required');
    }
  }
}
