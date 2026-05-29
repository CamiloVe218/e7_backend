import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from '../services.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  service: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('ServicesService', () => {
  let service: ServicesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns only active services ordered by name', async () => {
      const services = [
        { id: 's1', name: 'Electricidad', isActive: true },
        { id: 's2', name: 'Plomería',     isActive: true },
      ];
      mockPrisma.service.findMany.mockResolvedValue(services);

      const result = await service.findAll();

      expect(result).toEqual(services);
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
          orderBy: { name: 'asc' },
        }),
      );
    });

    it('filters by category when provided', async () => {
      mockPrisma.service.findMany.mockResolvedValue([]);

      await service.findAll('HOGAR');

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true, category: 'HOGAR' }),
        }),
      );
    });

    it('does not filter by category when not provided', async () => {
      mockPrisma.service.findMany.mockResolvedValue([]);

      await service.findAll();

      const callWhere = mockPrisma.service.findMany.mock.calls[0][0].where;
      expect(callWhere).not.toHaveProperty('category');
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns service when found', async () => {
      const svc = { id: 's1', name: 'Plomería', isActive: true };
      mockPrisma.service.findUnique.mockResolvedValue(svc);

      const result = await service.findOne('s1');
      expect(result).toEqual(svc);
    });

    it('throws NotFoundException when service does not exist', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);
      await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('delegates creation to prisma with provided data', async () => {
      const data = { name: 'Jardín', description: 'Servicio de jardinería', category: 'HOGAR', basePrice: 300, isActive: true };
      const created = { id: 'new-1', ...data };
      mockPrisma.service.create.mockResolvedValue(created);

      const result = await service.create(data as any);

      expect(result).toEqual(created);
      expect(mockPrisma.service.create).toHaveBeenCalledWith({ data });
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates service and returns updated entity', async () => {
      const updated = { id: 's1', name: 'Plomería Pro', basePrice: 500 };
      mockPrisma.service.update.mockResolvedValue(updated);

      const result = await service.update('s1', { name: 'Plomería Pro', basePrice: 500 } as any);

      expect(result).toEqual(updated);
      expect(mockPrisma.service.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { name: 'Plomería Pro', basePrice: 500 },
      });
    });
  });

  // ── getCategories ─────────────────────────────────────────────────────────────

  describe('getCategories', () => {
    it('returns flat list of distinct category strings', async () => {
      mockPrisma.service.findMany.mockResolvedValue([
        { category: 'HOGAR' },
        { category: 'TECNOLOGIA' },
        { category: 'JARDINERIA' },
      ]);

      const result = await service.getCategories();

      expect(result).toEqual(['HOGAR', 'TECNOLOGIA', 'JARDINERIA']);
    });

    it('returns empty array when no services exist', async () => {
      mockPrisma.service.findMany.mockResolvedValue([]);
      const result = await service.getCategories();
      expect(result).toEqual([]);
    });
  });
});
