import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

const mockUser = { id: 'u1', email: 'test@test.com', name: 'Test', role: 'CLIENTE' };

const mockPrisma = {
  user: { findUnique: jest.fn() },
};

const mockConfig = {
  get: jest.fn().mockReturnValue('test-secret-64-chars-long-abcdefghijklmnopqrstuvwxyz1234567890'),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(
      mockPrisma as unknown as PrismaService,
      mockConfig as unknown as ConfigService,
    );
  });

  describe('validate', () => {
    it('returns user when token payload sub matches a user in DB', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate({ sub: 'u1', email: 'test@test.com', role: 'CLIENTE' });

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: { id: true, email: true, name: true, role: true },
      });
    });

    it('throws UnauthorizedException when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: 'nonexistent', email: 'no@one.com', role: 'CLIENTE' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
