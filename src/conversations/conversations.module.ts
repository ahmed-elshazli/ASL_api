import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { User, UserSchema } from 'src/users/schema/users.schema';


@Module({
   imports: [
    MongooseModule.forFeature([
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

  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}