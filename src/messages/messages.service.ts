import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageType } from './schemas/message.schema';
import { Conversation } from '../conversations/schemas/conversation.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { BuildQueryDto } from 'src/common/dto/base-query.dto';
import { ApiFeatures } from 'src/common/utils/api-features';
import { UploadService } from 'src/common/storage/upload.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<Message>,

    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
     private readonly uploadService: UploadService,
  ) {}

async sendMessage(
  userId: string,
  dto: SendMessageDto,
  file?: Express.Multer.File,
) {



  const { conversationId, content } = dto;

  const conversation = await this.conversationModel.findById(
    conversationId,
  );

  if (!conversation) {
    throw new BadRequestException(
      'Conversation not found',
    );
  }

  const isParticipant =
    conversation.participants.some(
      (participant: Types.ObjectId) =>
        participant.toString() === userId.toString(),
    );

  if (!isParticipant) {
    throw new ForbiddenException(
      'You are not part of this conversation',
    );
  }


  if (!content?.trim() && !file) {
    throw new BadRequestException(
      'Message content or file is required',
    );
  }

  let fileUrl: string | undefined;
  let type = MessageType.TEXT;

  if (file) {
    fileUrl =
      await this.uploadService.uploadChatFile(
        file,
      );

    type = file.mimetype.startsWith(
      'image/',
    )
      ? MessageType.IMAGE
      : MessageType.FILE;
  }

  const message =
    await this.messageModel.create({
      conversationId:
        new Types.ObjectId(
          conversationId,
        ),
      senderId: new Types.ObjectId(
        userId,
      ),

      content: content?.trim(),

      type,

      fileUrl,
      fileName: file?.originalname,
      fileSize: file?.size,
      mimeType: file?.mimetype,
    });

// Increase unread count for all participants except sender

const unreadUpdates: Record<string, number> = {};

for (const participant of conversation.participants) {
  const participantId = participant.toString();


  if (participantId === userId.toString()) {
    continue;
  }

  unreadUpdates[
    `unreadCount.${participantId}`
  ] = 1;
}

await this.conversationModel.findByIdAndUpdate(
  conversationId,
  {
    $inc: unreadUpdates,

    lastMessage: message._id,
    lastMessageAt: new Date(),
  },
);

  return message;
}

async getMessages(
  userId: string,
  query: BuildQueryDto,
) {
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

async deleteMessage(
  messageId: string,
  userId: string,
) {
  const message = await this.messageModel.findById(
    messageId,
  );

  if (!message) {
    throw new NotFoundException(
      'Message not found',
    );
  }

  const conversation =
    await this.conversationModel.findById(
      message.conversationId,
    );

  if (!conversation) {
    throw new NotFoundException(
      'Conversation not found',
    );
  }

  const isMessageOwner =
    message.senderId.toString() ===
    userId.toString();

  const isGroupOwner =
    conversation.owner?.toString() ===
    userId.toString();

  if (!isMessageOwner && !isGroupOwner) {
    throw new ForbiddenException(
      'You are not allowed to delete this message',
    );
  }

  await message.deleteOne();

  // لو الرسالة المحذوفة هي آخر رسالة
  if (
    conversation.lastMessage?.toString() ===
    messageId
  ) {
    const lastMessage =
      await this.messageModel
        .findOne({
          conversationId:
            conversation._id,
        })
        .sort({
          createdAt: -1,
        });

    await this.conversationModel.findByIdAndUpdate(
      conversation._id,
      {
        lastMessage:
          lastMessage?._id ?? null,

        lastMessageAt:
          lastMessage?.createdAt ??
          null,
      },
    );
  }

  return {
    message:
      'Message deleted successfully',
  };
}


}
