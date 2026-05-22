import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('WebSocket origin not allowed'));
      }
    },
    credentials: true,
  },
  namespace: '/',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string>();

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway iniciado');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.userSockets.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.debug(`Usuario ${userId} desconectado`);
      }
    });
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, data: { userId: string }) {
    if (!data?.userId) return;
    this.userSockets.set(data.userId, client.id);
    client.emit('registered', { success: true, userId: data.userId });
  }

  notifyUser(userId: string, event: string, data: unknown) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  notifyAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  notifyRoom(room: string, event: string, data: unknown) {
    this.server.to(room).emit(event, data);
  }
}
