"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let NotificationsGateway = class NotificationsGateway {
    constructor() {
        this.userSockets = new Map();
    }
    afterInit(server) {
        console.log('🔌 WebSocket Gateway iniciado');
    }
    handleConnection(client) {
        console.log(`Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        this.userSockets.forEach((socketId, userId) => {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                console.log(`Usuario ${userId} desconectado`);
            }
        });
    }
    handleRegister(client, data) {
        this.userSockets.set(data.userId, client.id);
        client.emit('registered', { success: true, userId: data.userId });
        console.log(`Usuario ${data.userId} registrado con socket ${client.id}`);
    }
    notifyUser(userId, event, data) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
        }
    }
    notifyAll(event, data) {
        this.server.emit(event, data);
    }
    notifyRoom(room, event, data) {
        this.server.to(room).emit(event, data);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleRegister", null);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/',
    })
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map