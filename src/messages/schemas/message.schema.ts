import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}
@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversationId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  senderId: Types.ObjectId;

  @Prop({trim:true, required: false,})
  content?: string;

  @Prop({
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Prop({ required: false,})
  fileUrl?: string;

  @Prop()
  fileName?: string;

  @Prop()
  fileSize?: number;

  @Prop()
  mimeType?: string;
 @Prop({ default: Date.now})
  createdAt: Date;

 @Prop({
  default: false,
})
isDeleted: boolean;

@Prop({
  default: null,
})
deletedAt?: Date;

@Prop({
  type: Types.ObjectId,
  ref: 'User',
  default: null,
})
deletedBy?: Types.ObjectId;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });