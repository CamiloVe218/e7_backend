import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from '../notifications.gateway';
import { Server, Socket } from 'socket.io';

function makeSocket(id: string, token?: string): Socket {
  return {
    id,
    data: {} as Record<string, unknown>,
    handshake: { auth: token ? { token } : {} },
    emit: jest.fn(),
    disconnect: jest.fn(),
  } as unknown as Socket;
}

const mockServer = {
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
} as unknown as Server;

const mockJwtService = {
  verify: jest.fn(),
};

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    jest.clearAllMocks();
    (mockServer.to as jest.Mock).mockReturnThis();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    gateway.server = mockServer;
  });

  // ── handleConnection ──────────────────────────────────────────────────────────

  describe('handleConnection', () => {
    it('registers user when JWT is valid', () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      const client = makeSocket('socket-abc', 'valid-token');

      gateway.handleConnection(client);

      expect(client.data.userId).toBe('user-1');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('disconnects client when no token is provided', () => {
      const client = makeSocket('socket-abc');

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('disconnects client when JWT verification fails', () => {
      mockJwtService.verify.mockImplementation(() => { throw new Error('invalid'); });
      const client = makeSocket('socket-abc', 'bad-token');

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  // ── handleDisconnect ──────────────────────────────────────────────────────────

  describe('handleDisconnect', () => {
    it('removes the disconnected socket from userSockets map', () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      const client = makeSocket('socket-abc', 'valid-token');
      gateway.handleConnection(client);

      const emitSpy = jest.fn();
      (mockServer.to as jest.Mock).mockReturnValue({ emit: emitSpy });

      gateway.handleDisconnect(client);
      gateway.notifyUser('user-1', 'test:event', {});

      expect(mockServer.to).not.toHaveBeenCalled();
    });

    it('handles disconnect for unauthenticated clients gracefully', () => {
      const client = makeSocket('socket-xyz');

      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  // ── notifyUser ────────────────────────────────────────────────────────────────

  describe('notifyUser', () => {
    beforeEach(() => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      const client = makeSocket('socket-abc', 'valid-token');
      gateway.handleConnection(client);
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

  // ── multi-tab: multiple sockets per user ──────────────────────────────────────

  describe('multi-tab support', () => {
    it('notifies all sockets for a user', () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      const clientA = makeSocket('socket-A', 'valid-token');
      const clientB = makeSocket('socket-B', 'valid-token');
      gateway.handleConnection(clientA);
      gateway.handleConnection(clientB);

      const emitSpy = jest.fn();
      (mockServer.to as jest.Mock).mockReturnValue({ emit: emitSpy });

      gateway.notifyUser('user-1', 'test:event', { x: 1 });

      expect(mockServer.to).toHaveBeenCalledWith('socket-A');
      expect(mockServer.to).toHaveBeenCalledWith('socket-B');
    });
  });

  // ── lifecycle ─────────────────────────────────────────────────────────────────

  describe('afterInit', () => {
    it('does not throw', () => {
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
