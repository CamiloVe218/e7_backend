import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  afterInit(server: Server) {
    console.log('🔌 WebSocket Gateway iniciado');
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.userSockets.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`Usuario ${userId} desconectado`);
      }
    });
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, data: { userId: string }) {
    this.userSockets.set(data.userId, client.id);
    client.emit('registered', { success: true, userId: data.userId });
    console.log(`Usuario ${data.userId} registrado con socket ${client.id}`);
  }

  notifyUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  notifyAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  notifyRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
