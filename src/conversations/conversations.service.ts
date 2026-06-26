import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Conversation } from './schemas/conversation.schema';
import { User } from 'src/users/schema/users.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  // ==================================================
  // HELPERS
  // ==================================================

  private async findConversationOrThrow(
    conversationId: string,
  ): Promise<Conversation> {
    const conversation =
      await this.conversationModel.findById(
        conversationId,
      );

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    return conversation;
  }

  private ensureParticipant(
    conversation: Conversation,
    userId: string,
  ): void {
    const isParticipant =
      conversation.participants.some(
        (participant) =>
          participant.toString() ===
          userId.toString(),
      );

    if (!isParticipant) {
      throw new ForbiddenException(
        'Access denied',
      );
    }
  }

  private ensureGroup(
    conversation: Conversation,
  ): void {
    if (!conversation.isGroup) {
      throw new BadRequestException(
        'Operation allowed only for groups',
      );
    }
  }

  private ensureOwner(
    conversation: Conversation,
    userId: string,
  ): void {
    this.ensureGroup(conversation);

    if (
      conversation.owner?.toString() !==
      userId.toString()
    ) {
      throw new ForbiddenException(
        'Only group owner can perform this action',
      );
    }
  }

  // ==================================================
  // CREATE CONVERSATION
  // ==================================================

  async createConversation(
    participants: string[],
    currentUserId: string,
  ) {
    const uniqueIds = [
      ...new Set([
        currentUserId,
        ...participants,
      ]),
    ];

    const objectIds = uniqueIds.map(
      (id) => new Types.ObjectId(id),
    );

    const users = await this.userModel.find({
      _id: { $in: objectIds },
      isActive: true,
    });

    if (users.length !== objectIds.length) {
      throw new BadRequestException(
        'Some users not found or inactive',
      );
    }

    const existing =
      await this.conversationModel.findOne({
        participants: { $all: objectIds },
        $expr: {
          $eq: [
            { $size: '$participants' },
            objectIds.length,
          ],
        },
      });

    if (existing) {
      return existing;
    }

    const isGroup = objectIds.length > 2;

    return this.conversationModel.create({
      participants: objectIds,
      isGroup,
      owner: isGroup
        ? new Types.ObjectId(currentUserId)
        : undefined,
    });
  }

  // ==================================================
  // FIND OR CREATE
  // ==================================================

  async findOrCreateConversation(
    participants: string[],
    currentUserId: string,
  ) {
    const uniqueIds = [
      ...new Set([
        currentUserId,
        ...participants,
      ]),
    ];

    const objectIds = uniqueIds.map(
      (id) => new Types.ObjectId(id),
    );

    const existing =
      await this.conversationModel.findOne({
        participants: { $all: objectIds },
        $expr: {
          $eq: [
            { $size: '$participants' },
            objectIds.length,
          ],
        },
      });

    if (existing) {
      return existing;
    }

    return this.createConversation(
      participants,
      currentUserId,
    );
  }

  // ==================================================
  // GET USER CONVERSATIONS
  // ==================================================

  async getUserConversations(
    userId: string,
  ) {
    return this.conversationModel
      .find({
        participants:
          new Types.ObjectId(userId),
      })
      .sort({
        lastMessageAt: -1,
      })
      .populate(
        'participants',
        'fullName email role phone',
      )
      .populate({
        path: 'lastMessage',
        select:
          'senderId content createdAt fileUrl',
      });
  }

  // ==================================================
  // GET CONVERSATION
  // ==================================================

  async getConversationById(
    conversationId: string,
    currentUserId: string,
  ) {
    const conversation =
      await this.conversationModel
        .findById(conversationId)
        .populate(
          'participants',
          'fullName email role phone',
        )
        .populate({
          path: 'lastMessage',
          select:
            'senderId content createdAt',
          populate: {
            path: 'senderId',
            select:
              'fullName phone role',
          },
        });

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    const isParticipant =
      conversation.participants.some(
        (participant: any) =>
          participant._id.toString() ===
          currentUserId.toString(),
      );

    if (!isParticipant) {
      throw new ForbiddenException(
        'Access denied',
      );
    }

    return conversation;
  }

  // ==================================================
  // LAST MESSAGE
  // ==================================================

  async updateLastMessage(
    conversationId: string,
    messageId: string,
  ) {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: messageId,
        lastMessageAt: new Date(),
      },
      {
        new: true,
      },
    );
  }

  // ==================================================
  // UNREAD COUNT
  // ==================================================

  async increaseUnreadCount(
    conversationId: string,
    userId: string,
  ) {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        $inc: {
          [`unreadCount.${userId}`]: 1,
        },
      },
      {
        new: true,
      },
    );
  }

  async resetUnreadCount(
    conversationId: string,
    userId: string,
  ) {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          [`unreadCount.${userId}`]: 0,
        },
      },
      {
        new: true,
      },
    );
  }

  // ==================================================
  // GROUP MANAGEMENT
  // ==================================================

  async addParticipant(
    conversationId: string,
    participantId: string,
    currentUserId: string,
  ) {
    const conversation =
      await this.findConversationOrThrow(
        conversationId,
      );

    this.ensureOwner(
      conversation,
      currentUserId,
    );

    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: {
          participants:
            new Types.ObjectId(
              participantId,
            ),
        },
      },
      {
        new: true,
      },
    );
  }

  async removeParticipant(
    conversationId: string,
    participantId: string,
    currentUserId: string,
  ) {
    const conversation =
      await this.findConversationOrThrow(
        conversationId,
      );

    this.ensureOwner(
      conversation,
      currentUserId,
    );

    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        $pull: {
          participants:
            new Types.ObjectId(
              participantId,
            ),
        },
      },
      {
        new: true,
      },
    );
  }

  // ==================================================
  // ARCHIVE
  // ==================================================

  async archiveConversation(
    conversationId: string,
    currentUserId: string,
  ) {
    const conversation =
      await this.findConversationOrThrow(
        conversationId,
      );

    this.ensureParticipant(
      conversation,
      currentUserId,
    );

    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          [`archivedBy.${currentUserId}`]:
            true,
        },
      },
      {
        new: true,
      },
    );
  }



async updateGroupName(
  conversationId: string,
  groupName: string,
  currentUserId: string,
) {
  const conversation =
    await this.findConversationOrThrow(
      conversationId,
    );

  this.ensureOwner(
    conversation,
    currentUserId,
  );

  const trimmedName = groupName.trim();

  if (!trimmedName) {
    throw new BadRequestException(
      'Group name is required',
    );
  }

  return this.conversationModel.findByIdAndUpdate(
    conversationId,
    {
      groupName: trimmedName,
    },
    {
      new: true,
    },
  );
}



async leaveConversation(
  conversationId: string,
  currentUserId: string,
) {
  const conversation =
    await this.findConversationOrThrow(
      conversationId,
    );

  this.ensureGroup(conversation);

  this.ensureParticipant(
    conversation,
    currentUserId,
  );

  const remainingParticipants =
    conversation.participants.filter(
      (participant) =>
        participant.toString() !==
        currentUserId.toString(),
    );

  if (remainingParticipants.length === 0) {
    await this.conversationModel.findByIdAndDelete(
      conversationId,
    );

    return {
      message: 'Group deleted',
    };
  }

  const updateData: any = {
    participants: remainingParticipants,
  };

  if (
    conversation.owner?.toString() ===
    currentUserId.toString()
  ) {
    updateData.owner =
      remainingParticipants[0];
  }

  return this.conversationModel.findByIdAndUpdate(
    conversationId,
    updateData,
    {
      new: true,
    },
  );
}

async markAsRead(
  conversationId: string,
  userId: string,
) {
  const conversation =
    await this.findConversationOrThrow(
      conversationId,
    );

  this.ensureParticipant(
    conversation,
    userId,
  );

  return this.resetUnreadCount(
    conversationId,
    userId,
  );
}
}