import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from 'src/conversations/schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';

import { StorageModule } from 'src/common/storage/storage.module';


@Module({
    imports: [
    MongooseModule.forFeature([
       {
        name: Message.name,
        schema: MessageSchema,
      },

      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
    ]),
    StorageModule,
   
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
