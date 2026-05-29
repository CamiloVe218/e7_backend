import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

const mockUser = {
  id: 'u1', email: 'test@test.com', name: 'Test', role: 'CLIENTE',
  phone: '9511234567', isSuspended: false,
  street: 'Av. Independencia', extNumber: '123',
  state: 'Oaxaca', city: 'Oaxaca de Juárez', zipCode: '68000',
};

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
    it('returns user with all profile fields when token is valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate({ sub: 'u1', email: 'test@test.com', role: 'CLIENTE' });

      expect(result).toEqual(mockUser);
    });

    it('queries DB with extended select including address and profile fields', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await strategy.validate({ sub: 'u1', email: 'test@test.com', role: 'CLIENTE' });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: {
          id: true, email: true, name: true, role: true,
          phone: true, isSuspended: true,
          street: true, extNumber: true, state: true, city: true, zipCode: true,
        },
      });
    });

    it('result includes address fields for downstream GET /auth/me', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate({ sub: 'u1', email: 'test@test.com', role: 'CLIENTE' });

      expect(result.street).toBe('Av. Independencia');
      expect(result.city).toBe('Oaxaca de Juárez');
      expect(result.zipCode).toBe('68000');
      expect(result.isSuspended).toBe(false);
    });

    it('result includes null address fields when user has none', async () => {
      const noAddressUser = { ...mockUser, street: null, city: null, state: null, zipCode: null, extNumber: null };
      mockPrisma.user.findUnique.mockResolvedValue(noAddressUser);

      const result = await strategy.validate({ sub: 'u1', email: 'test@test.com', role: 'CLIENTE' });

      expect(result.street).toBeNull();
      expect(result.city).toBeNull();
    });

    it('throws UnauthorizedException when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: 'nonexistent', email: 'no@one.com', role: 'CLIENTE' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
