import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userSockets;
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(client: Socket, data: {
        userId: string;
    }): void;
    notifyUser(userId: string, event: string, data: any): void;
    notifyAll(event: string, data: any): void;
    notifyRoom(room: string, event: string, data: any): void;
}
