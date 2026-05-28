import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RatingsService } from '../ratings.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockRequest = {
  id: 'req-1',
  clientId: 'client-1',
  providerId: 'prov-1',
  status: 'FINALIZADA',
  rating: null,
};

const mockRating = {
  id: 'rat-1',
  serviceRequestId: 'req-1',
  clientId: 'client-1',
  providerId: 'prov-1',
  score: 5,
  comment: 'Excelente servicio',
  createdAt: new Date(),
};

const mockPrisma = {
  serviceRequest: {
    findUnique: jest.fn(),
  },
  rating: {
    create: jest.fn(),
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  provider: {
    update: jest.fn(),
  },
};

describe('RatingsService', () => {
  let service: RatingsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = { serviceRequestId: 'req-1', score: 5, comment: 'Excelente' };

    beforeEach(() => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(mockRequest);
      mockPrisma.rating.create.mockResolvedValue(mockRating);
      mockPrisma.rating.aggregate.mockResolvedValue({ _avg: { score: 4.8 } });
      mockPrisma.provider.update.mockResolvedValue({});
    });

    it('creates rating and returns it on success', async () => {
      const result = await service.create('client-1', dto);

      expect(result.id).toBe('rat-1');
      expect(mockPrisma.rating.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            serviceRequestId: 'req-1',
            clientId: 'client-1',
            providerId: 'prov-1',
            score: 5,
          }),
        }),
      );
    });

    it('updates provider average rating after creation', async () => {
      await service.create('client-1', dto);

      expect(mockPrisma.provider.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prov-1' },
          data: { rating: 4.8 },
        }),
      );
    });

    it('throws NotFoundException when service request does not exist', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(null);

      await expect(service.create('client-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user is not the request client', async () => {
      await expect(service.create('other-user', dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException when request is not FINALIZADA', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        status: 'EN_PROCESO',
      });

      await expect(service.create('client-1', dto)).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when rating already exists', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        rating: { id: 'existing-rating' },
      });

      await expect(service.create('client-1', dto)).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when request has no provider', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        providerId: null,
      });

      await expect(service.create('client-1', dto)).rejects.toThrow(ConflictException);
    });

    it('rounds provider rating to one decimal', async () => {
      mockPrisma.rating.aggregate.mockResolvedValue({ _avg: { score: 4.666666 } });

      await service.create('client-1', dto);

      expect(mockPrisma.provider.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { rating: 4.7 },
        }),
      );
    });
  });

  // ── findByProvider ────────────────────────────────────────────────────────────

  describe('findByProvider', () => {
    it('returns ratings for given provider ordered by createdAt desc', async () => {
      mockPrisma.rating.findMany.mockResolvedValue([mockRating]);

      const result = await service.findByProvider('prov-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.rating.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { providerId: 'prov-1' },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('returns empty array when provider has no ratings', async () => {
      mockPrisma.rating.findMany.mockResolvedValue([]);

      const result = await service.findByProvider('prov-no-ratings');

      expect(result).toHaveLength(0);
    });
  });
});
