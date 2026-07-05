import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { ChatGateway } from './chat.gateway';

import { Message, MessageSchema } from '../messages/schemas/message.schema';

import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversation.schema';

import { User, UserSchema } from '../users/schema/users.schema';

import { MessagesModule } from 'src/messages/messages.module';
import { StorageModule } from 'src/common/storage/storage.module';

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
    MessagesModule,
    StorageModule,
  ],

  providers: [ChatGateway],

  exports: [ChatGateway],
})
export class ChatModule {}
