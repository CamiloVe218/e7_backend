import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockServiceRequest = {
  id: 'req-1',
  price: 300,
  payment: null,
  service: { basePrice: 200 },
};

const mockPayment = {
  id: 'pay-1',
  serviceRequestId: 'req-1',
  amount: 300,
  status: 'PENDIENTE',
  method: 'SIMULADO',
  transactionId: null,
};

const mockPrisma = {
  serviceRequest: {
    findUnique: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('throws NotFoundException when service request does not exist', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(null);

      await expect(service.create('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when payment already exists', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue({
        ...mockServiceRequest,
        payment: { id: 'existing-pay' },
      });

      await expect(service.create('req-1')).rejects.toThrow(ConflictException);
    });

    it('creates payment using request price when available', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue(mockServiceRequest);
      mockPrisma.payment.create.mockResolvedValue(mockPayment);

      await service.create('req-1');

      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 300 }),
        }),
      );
    });

    it('falls back to service.basePrice when request has no price', async () => {
      mockPrisma.serviceRequest.findUnique.mockResolvedValue({
        ...mockServiceRequest,
        price: null,
      });
      mockPrisma.payment.create.mockResolvedValue({ ...mockPayment, amount: 200 });

      await service.create('req-1');

      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 200 }),
        }),
      );
    });
  });

  // ── simulate ─────────────────────────────────────────────────────────────────

  describe('simulate', () => {
    it('throws NotFoundException when payment does not exist', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.simulate('req-1')).rejects.toThrow(NotFoundException);
    });

    it('marks payment as COMPLETADO when simulation succeeds (Math.random > 0.1)', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'COMPLETADO', transactionId: 'TXN-ABCD1234' });

      jest.spyOn(Math, 'random').mockReturnValue(0.95); // > 0.1 → success

      const result = await service.simulate('req-1');

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETADO' }),
        }),
      );
      expect(result.status).toBe('COMPLETADO');

      (Math.random as jest.Mock).mockRestore();
    });

    it('marks payment as FALLIDO when simulation fails (Math.random <= 0.1)', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'FALLIDO', transactionId: null });

      jest.spyOn(Math, 'random').mockReturnValue(0.05); // <= 0.1 → failure

      const result = await service.simulate('req-1');

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FALLIDO', transactionId: null }),
        }),
      );
      expect(result.status).toBe('FALLIDO');

      (Math.random as jest.Mock).mockRestore();
    });

    it('assigns a transactionId only on success', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);
      const updated = { ...mockPayment, status: 'COMPLETADO', transactionId: 'TXN-12345678' };
      mockPrisma.payment.update.mockResolvedValue(updated);

      jest.spyOn(Math, 'random').mockReturnValue(0.99);

      const result = await service.simulate('req-1');

      expect(result.transactionId).toBeTruthy();

      (Math.random as jest.Mock).mockRestore();
    });
  });

  // ── findByRequest ─────────────────────────────────────────────────────────────

  describe('findByRequest', () => {
    it('returns payment for given serviceRequestId', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.findByRequest('req-1');

      expect(result?.serviceRequestId).toBe('req-1');
    });

    it('returns null when no payment found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      const result = await service.findByRequest('req-none');

      expect(result).toBeNull();
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all payments ordered by createdAt desc', async () => {
      const payments = [mockPayment, { ...mockPayment, id: 'pay-2' }];
      mockPrisma.payment.findMany.mockResolvedValue(payments);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });
});
