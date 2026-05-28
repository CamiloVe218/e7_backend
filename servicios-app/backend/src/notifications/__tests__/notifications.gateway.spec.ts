import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from '../notifications.gateway';
import { Server, Socket } from 'socket.io';

const mockSocket = {
  id: 'socket-abc',
  emit: jest.fn(),
} as unknown as Socket;

const mockServer = {
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
} as unknown as Server;

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsGateway],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    // Inject mock server
    gateway.server = mockServer;
  });

  // ── handleRegister ────────────────────────────────────────────────────────────

  describe('handleRegister', () => {
    it('maps userId to socketId and emits registered event', () => {
      gateway.handleRegister(mockSocket, { userId: 'user-1' });

      expect(mockSocket.emit).toHaveBeenCalledWith('registered', {
        success: true,
        userId: 'user-1',
      });
    });

    it('does nothing when userId is missing', () => {
      gateway.handleRegister(mockSocket, { userId: '' });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('does nothing when data is null/undefined', () => {
      gateway.handleRegister(mockSocket, null as any);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  // ── handleDisconnect ──────────────────────────────────────────────────────────

  describe('handleDisconnect', () => {
    it('removes the disconnected socket from userSockets map', () => {
      // Register first
      gateway.handleRegister(mockSocket, { userId: 'user-1' });

      // Now disconnect
      gateway.handleDisconnect(mockSocket);

      // notifyUser should no longer find a socketId
      const emitSpy = jest.fn();
      (mockServer.to as jest.Mock).mockReturnValue({ emit: emitSpy });

      gateway.notifyUser('user-1', 'test:event', {});

      // server.to() should not be called because socket was removed
      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });

  // ── notifyUser ────────────────────────────────────────────────────────────────

  describe('notifyUser', () => {
    beforeEach(() => {
      gateway.handleRegister(mockSocket, { userId: 'user-1' });
      (mockServer.to as jest.Mock).mockReturnValue({ emit: jest.fn() });
    });

    it('emits event to the registered user socket', () => {
      gateway.notifyUser('user-1', 'request:accepted', { id: 'req-1' });

      expect(mockServer.to).toHaveBeenCalledWith('socket-abc');
    });

    it('does nothing when userId is not registered', () => {
      gateway.notifyUser('unknown-user', 'request:accepted', {});

      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });

  // ── handleConnection / handleDisconnect lifecycle ────────────────────────────

  describe('connection lifecycle', () => {
    it('handleConnection logs the client id without throwing', () => {
      expect(() => gateway.handleConnection(mockSocket)).not.toThrow();
    });

    it('afterInit logs gateway started without throwing', () => {
      expect(() => gateway.afterInit(mockServer)).not.toThrow();
    });
  });

  // ── notifyAll ─────────────────────────────────────────────────────────────────

  describe('notifyAll', () => {
    it('broadcasts event to all connected sockets', () => {
      const payload = { id: 'req-1', status: 'PENDIENTE' };

      gateway.notifyAll('request:new', payload);

      expect(mockServer.emit).toHaveBeenCalledWith('request:new', payload);
    });
  });
});
