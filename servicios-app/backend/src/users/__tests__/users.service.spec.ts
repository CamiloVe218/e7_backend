import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all users ordered by createdAt desc', async () => {
      const users = [
        { id: 'u1', email: 'a@test.com', name: 'Alice', role: 'CLIENTE' },
        { id: 'u2', email: 'b@test.com', name: 'Bob',   role: 'PROVEEDOR' },
      ];
      mockPrisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('returns empty array when no users exist', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns user when found', async () => {
      const user = { id: 'u1', email: 'a@test.com', name: 'Alice', role: 'CLIENTE' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('u1');
      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('queries by the provided id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u42' });
      await service.findOne('u42');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u42' } }),
      );
    });
  });

  // ── findByEmail ──────────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('returns user when email matches', async () => {
      const user = { id: 'u1', email: 'test@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(user);
    });

    it('returns null when email not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findByEmail('nobody@test.com');
      expect(result).toBeNull();
    });
  });

  // ── updateMe ─────────────────────────────────────────────────────────────────

  describe('updateMe', () => {
    it('updates name and phone', async () => {
      const updated = { id: 'u1', name: 'New Name', phone: '9999' };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.updateMe('u1', { name: 'New Name', phone: '9999' });
      expect(result).toEqual(updated);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
    });

    it('omits name from update when not provided', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', phone: '1111' });

      await service.updateMe('u1', { phone: '1111' });

      const callData = mockPrisma.user.update.mock.calls[0][0].data;
      expect(callData).not.toHaveProperty('name');
      expect(callData).toHaveProperty('phone', '1111');
    });
  });

  // ── getStats ─────────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns counts broken down by role', async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60)  // CLIENTE
        .mockResolvedValueOnce(35)  // PROVEEDOR
        .mockResolvedValueOnce(5);  // ADMIN

      const stats = await service.getStats();

      expect(stats).toEqual({
        totalUsers: 100,
        totalClients: 60,
        totalProviders: 35,
        totalAdmins: 5,
      });
    });

    it('runs all four count queries in parallel', async () => {
      mockPrisma.user.count.mockResolvedValue(0);
      await service.getStats();
      expect(mockPrisma.user.count).toHaveBeenCalledTimes(4);
    });
  });
});
