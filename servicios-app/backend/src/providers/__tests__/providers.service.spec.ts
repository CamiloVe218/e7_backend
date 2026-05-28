import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProvidersService } from '../providers.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockProvider = {
  id: 'prov-1',
  userId: 'user-1',
  bio: 'Plomero experto',
  rating: 4.5,
  isAvailable: true,
  lat: 17.06,
  lng: -96.72,
  serviceType: ['Plomería'],
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user-1', name: 'Juan', email: 'juan@test.com', phone: '123' },
  ratingsReceived: [{ score: 4 }, { score: 5 }],
};

const mockPrisma = {
  provider: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('ProvidersService', () => {
  let service: ProvidersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all available providers when no geo filter', async () => {
      mockPrisma.provider.findMany.mockResolvedValue([mockProvider]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockPrisma.provider.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isAvailable: true } }),
      );
    });

    it('returns all providers when lat/lng provided without radius', async () => {
      mockPrisma.provider.findMany.mockResolvedValue([mockProvider]);

      const result = await service.findAll(17.06, -96.72);

      // No geo filter applied without radius
      expect(result).toHaveLength(1);
    });

    it('filters providers by distance when lat/lng/radius provided', async () => {
      const farProvider = { ...mockProvider, id: 'prov-far', lat: 20.0, lng: -100.0 };
      mockPrisma.provider.findMany.mockResolvedValue([mockProvider, farProvider]);

      // radius 5 km — only mockProvider (0 km away) should pass
      const result = await service.findAll(17.06, -96.72, 5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('prov-1');
    });

    it('includes provider with no coordinates when geo filter is active', async () => {
      const noCoords = { ...mockProvider, id: 'prov-nocoords', lat: null, lng: null };
      mockPrisma.provider.findMany.mockResolvedValue([noCoords]);

      const result = await service.findAll(17.06, -96.72, 5);

      // Provider without coords is always included
      expect(result).toHaveLength(1);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns provider when found', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(mockProvider);

      const result = await service.findOne('prov-1');

      expect(result.id).toBe('prov-1');
    });

    it('throws NotFoundException when provider does not exist', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findByUserId ─────────────────────────────────────────────────────────────

  describe('findByUserId', () => {
    it('returns provider profile for given userId', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(mockProvider);

      const result = await service.findByUserId('user-1');

      expect(result?.userId).toBe('user-1');
    });

    it('returns null when user has no provider profile', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);

      const result = await service.findByUserId('user-no-provider');

      expect(result).toBeNull();
    });
  });

  // ── updateProfile ────────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('updates provider profile successfully', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrisma.provider.update.mockResolvedValue({
        ...mockProvider,
        bio: 'Nuevo bio',
        isAvailable: false,
      });

      const result = await service.updateProfile('user-1', {
        bio: 'Nuevo bio',
        isAvailable: false,
      });

      expect(result.bio).toBe('Nuevo bio');
      expect(mockPrisma.provider.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });

    it('throws NotFoundException when provider profile not found', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('user-no-profile', { bio: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateAvailability ───────────────────────────────────────────────────────

  describe('updateAvailability', () => {
    it('updates provider availability', async () => {
      mockPrisma.provider.update.mockResolvedValue({ ...mockProvider, isAvailable: false });

      const result = await service.updateAvailability('prov-1', false);

      expect(mockPrisma.provider.update).toHaveBeenCalledWith({
        where: { id: 'prov-1' },
        data: { isAvailable: false },
      });
      expect(result.isAvailable).toBe(false);
    });
  });
});
