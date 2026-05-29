import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  private userSockets = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway iniciado');
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.userId = payload.sub;

      const sockets = this.userSockets.get(payload.sub) ?? new Set<string>();
      sockets.add(client.id);
      this.userSockets.set(payload.sub, sockets);

      this.logger.debug(`Usuario ${payload.sub} conectado (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId as string | undefined;
    if (!userId) return;

    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.debug(`Usuario ${userId} desconectado (${client.id})`);
  }

  private emitToUser(userId: string, event: string, payload: unknown) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    sockets.forEach(socketId => {
      this.server.to(socketId).emit(event, payload);
    });
  }

  notifyUser(userId: string, event: string, data: unknown) {
    this.emitToUser(userId, event, data);
  }

  notifyAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  notifyRoom(room: string, event: string, data: unknown) {
    this.server.to(room).emit(event, data);
  }
}
