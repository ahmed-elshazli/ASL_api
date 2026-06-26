import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MessagesService } from '../messages/messages.service';
import { Conversation } from '../conversations/schemas/conversation.schema';
import { User } from '../users/schema/users.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  @WebSocketServer()
  server: Server;

  // userId -> Set<socketId>
  private onlineUsers = new Map<string, Set<string>>();

  // =========================
  // HELPERS
  // =========================

  private getUserId(client: Socket): string {
    return client.data.user._id.toString();
  }

  private addOnlineUser(userId: string, socketId: string): void {
    const sockets = this.onlineUsers.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.onlineUsers.set(userId, sockets);
  }

  private removeOnlineUser(userId: string, socketId: string): void {
    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);

    if (!sockets.size) {
      this.onlineUsers.delete(userId);
    }
  }

  private broadcastOnlineUsers(): void {
    this.server.emit('onlineUsers', {
      users: Array.from(this.onlineUsers.keys()),
    });
  }

  // =========================
  // CONNECTION
  // =========================

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('jwt.access.secret'),
      });

      const user = await this.userModel
        .findById(payload.sub)
        .select('_id email role isActive passwordChangedAt')
        .lean();

      if (!user || !user.isActive) {
        client.disconnect();
        return;
      }

      if (user.passwordChangedAt) {
        const changedTimestamp = Math.floor(
          user.passwordChangedAt.getTime() / 1000,
        );

        if (changedTimestamp > payload.iat) {
          client.disconnect();
          return;
        }
      }

      client.data.user = user;

      const userId = user._id.toString();

      this.addOnlineUser(userId, client.id);

      this.broadcastOnlineUsers();

      console.log(`Socket Connected: ${userId}`);
    } catch {
      client.disconnect();
    }
  }

  // =========================
  // DISCONNECT
  // =========================

  async handleDisconnect(client: Socket) {
    const user = client.data?.user;

    if (!user) return;

    const userId = user._id.toString();

    this.removeOnlineUser(userId, client.id);

    this.broadcastOnlineUsers();

    console.log(`Socket Disconnected: ${userId}`);
  }

  // =========================
  // JOIN CONVERSATION
  // =========================

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    const userId = this.getUserId(client);

    const conversation = await this.conversationModel.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: new Types.ObjectId(userId),
    });

    if (!conversation) {
      throw new WsException('Access denied');
    }

    await client.join(conversationId);

    await this.conversationModel.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${userId}`]: 0 },
    });

    return {
      event: 'joinedConversation',
      conversationId,
    };
  }

  // =========================
  // LEAVE CONVERSATION
  // =========================

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    await client.leave(conversationId);

    return {
      event: 'leftConversation',
      conversationId,
    };
  }

  // =========================
  // SEND MESSAGE
  // =========================

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId: string;
      content: string;
    },
  ) {
    if (!payload?.conversationId || !payload?.content?.trim()) {
      throw new WsException('conversationId and content are required');
    }

    const userId = this.getUserId(client);

    const message = await this.messagesService.sendMessage(userId, {
      conversationId: payload.conversationId,
      content: payload.content,
    });

    this.server.to(payload.conversationId).emit('newMessage', message);

    return message;
  }

  // =========================
  // TYPING
  // =========================

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    if (!conversationId) return;

    client.to(conversationId).emit('typing', {
      conversationId,
      userId: client.data.user._id,
    });
  }

  // =========================
  // STOP TYPING
  // =========================

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    if (!conversationId) return;

    client.to(conversationId).emit('stopTyping', {
      conversationId,
      userId: client.data.user._id,
    });
  }

  // =========================
  // MESSAGE SEEN
  // =========================

  @SubscribeMessage('messageSeen')
  handleMessageSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId: string;
      messageId: string;
    },
  ) {
    if (!payload?.conversationId || !payload?.messageId) {
      throw new WsException('conversationId and messageId are required');
    }

    client.to(payload.conversationId).emit('messageSeen', {
      messageId: payload.messageId,
      userId: client.data.user._id,
    });
  }

  // =========================
  // ONLINE USERS
  // =========================

  @SubscribeMessage('getOnlineUsers')
  getOnlineUsers() {
    return {
      users: Array.from(this.onlineUsers.keys()),
    };
  }
}