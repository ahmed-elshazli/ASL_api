import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { ChatGateway } from './chat.gateway';

import {
  Message,
  MessageSchema,
} from '../messages/schemas/message.schema';

import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversation.schema';

import {
  User,
  UserSchema,
} from '../users/schema/users.schema';

import { MessagesService } from '../messages/messages.service';
import { UploadService } from '../common/storage/upload.service';

@Module({
  imports: [
    JwtModule,

    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  providers: [
    ChatGateway,
    MessagesService,
    UploadService,
  ],

  exports: [ChatGateway],
})
export class ChatModule {}