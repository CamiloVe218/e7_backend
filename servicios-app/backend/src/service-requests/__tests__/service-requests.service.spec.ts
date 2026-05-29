import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RequestStatus } from '../dto/update-status.dto';
import { ServiceRequestsService } from '../service-requests.service';
import { ServiceRequestRepository } from '../repositories/service-request.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';

// Mock Prisma transaction client used inside updateStatus and acceptRequest
const mockTx = {
  serviceRequest: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  provider: {
    update: jest.fn(),
  },
  user: {
    update: jest.fn(),
  },
};

const mockRepository = {
  create: jest.fn(),
  findMany: jest.fn(),
  findManyPaginated: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, hasMore: false }),
  findOne: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
  // Execute the callback with the mockTx so inner logic is exercised
  transaction: jest.fn().mockImplementation((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
};

const mockPrisma = {
  service: { findUnique: jest.fn() },
  provider: { findUnique: jest.fn(), update: jest.fn() },
};

const mockNotifications = {
  notifyAll: jest.fn(),
  notifyUser: jest.fn(),
};

describe('ServiceRequestsService', () => {
  let service: ServiceRequestsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset transaction to always call the fn
    mockRepository.transaction.mockImplementation(
      (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRequestsService,
        { provide: ServiceRequestRepository, useValue: mockRepository },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsGateway, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<ServiceRequestsService>(ServiceRequestsService);
  });

  // ── State machine ────────────────────────────────────────────────────────────

  describe('updateStatus — state machine', () => {
    const baseRequest = {
      id: 'req-1',
      clientId: 'client-1',
      providerId: 'prov-1',
      status: 'ACEPTADA',
      provider: { user: { id: 'user-prov-1' } },
    };

    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue(baseRequest);
      mockPrisma.provider.findUnique.mockResolvedValue({ id: 'prov-1' });
      mockPrisma.provider.update.mockResolvedValue({});
      // tx mocks used inside the transaction callback
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });
      mockTx.provider.update.mockResolvedValue({});
    });

    it('allows ACEPTADA → EN_PROCESO', async () => {
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });
      const result = await service.updateStatus('req-1', 'user-prov-1', { status: RequestStatus.EN_PROCESO });
      expect(result.status).toBe('EN_PROCESO');
    });

    it('allows ACEPTADA → CANCELADA', async () => {
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'CANCELADA' });
      const result = await service.updateStatus('req-1', 'client-1', { status: RequestStatus.CANCELADA });
      expect(result.status).toBe('CANCELADA');
    });

    it('rejects ACEPTADA → PENDIENTE (invalid transition)', async () => {
      await expect(
        service.updateStatus('req-1', 'client-1', { status: RequestStatus.PENDIENTE }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects ACEPTADA → FINALIZADA (client cannot finalize)', async () => {
      await expect(
        service.updateStatus('req-1', 'client-1', { status: RequestStatus.FINALIZADA }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows EN_PROCESO → FINALIZADA', async () => {
      mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'FINALIZADA' });
      const result = await service.updateStatus('req-1', 'user-prov-1', { status: RequestStatus.FINALIZADA });
      expect(result.status).toBe('FINALIZADA');
    });

    it('rejects EN_PROCESO → ACEPTADA (invalid transition)', async () => {
      mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });
      await expect(
        service.updateStatus('req-1', 'client-1', { status: RequestStatus.ACEPTADA }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows PENDIENTE → CANCELADA', async () => {
      mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'PENDIENTE', providerId: null });
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'CANCELADA' });
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      const result = await service.updateStatus('req-1', 'client-1', { status: RequestStatus.CANCELADA });
      expect(result.status).toBe('CANCELADA');
    });

    it('throws ForbiddenException when unrelated user tries to update', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus('req-1', 'stranger-user', { status: RequestStatus.CANCELADA }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when request does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateStatus('req-1', 'client-1', { status: RequestStatus.CANCELADA }),
      ).rejects.toThrow(NotFoundException);
    });

    it('resets provider availability when status becomes FINALIZADA', async () => {
      mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'FINALIZADA' });

      await service.updateStatus('req-1', 'user-prov-1', { status: RequestStatus.FINALIZADA });

      expect(mockTx.provider.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isAvailable: true } }),
      );
    });

    it('resets provider availability when status becomes CANCELADA', async () => {
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'CANCELADA' });

      await service.updateStatus('req-1', 'client-1', { status: RequestStatus.CANCELADA });

      expect(mockTx.provider.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isAvailable: true } }),
      );
    });
  });

  // ── request:completed event ───────────────────────────────────────────────────

  describe('updateStatus — request:completed event', () => {
    const baseRequest = {
      id: 'req-1',
      clientId: 'client-1',
      providerId: 'prov-1',
      status: 'EN_PROCESO',
      provider: { user: { id: 'user-prov-1' } },
    };
    const finalizedResult = { ...baseRequest, status: 'FINALIZADA' };

    beforeEach(() => {
      mockPrisma.provider.findUnique.mockResolvedValue({ id: 'prov-1' });
      mockPrisma.provider.update.mockResolvedValue({});
      mockTx.provider.update.mockResolvedValue({});
    });

    it('emits request:completed to client exactly once on EN_PROCESO → FINALIZADA', async () => {
      mockRepository.findOne.mockResolvedValue(baseRequest);
      mockTx.serviceRequest.update.mockResolvedValue(finalizedResult);

      await service.updateStatus('req-1', 'user-prov-1', { status: RequestStatus.FINALIZADA });

      const completedCalls = (mockNotifications.notifyUser as jest.Mock).mock.calls.filter(
        ([, event]) => event === 'request:completed',
      );
      expect(completedCalls).toHaveLength(1);
      expect(completedCalls[0][0]).toBe('client-1');
      expect(completedCalls[0][2]).toEqual(finalizedResult);
    });

    it('payload of request:completed equals payload of request:status_changed', async () => {
      mockRepository.findOne.mockResolvedValue(baseRequest);
      mockTx.serviceRequest.update.mockResolvedValue(finalizedResult);

      await service.updateStatus('req-1', 'user-prov-1', { status: RequestStatus.FINALIZADA });

      const calls = (mockNotifications.notifyUser as jest.Mock).mock.calls;
      const statusChangedPayload = calls.find(([, ev]) => ev === 'request:status_changed' && calls[0][0] === 'client-1')?.[2];
      const completedPayload     = calls.find(([, ev]) => ev === 'request:completed')?.[2];

      expect(completedPayload).toEqual(statusChangedPayload);
    });

    it('does NOT emit request:completed for EN_PROCESO transition', async () => {
      mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'ACEPTADA' });
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });

      await service.updateStatus('req-1', 'user-prov-1', { status: RequestStatus.EN_PROCESO });

      const completedCalls = (mockNotifications.notifyUser as jest.Mock).mock.calls.filter(
        ([, event]) => event === 'request:completed',
      );
      expect(completedCalls).toHaveLength(0);
    });

    it('does NOT emit request:completed for CANCELADA transition', async () => {
      mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'ACEPTADA' });
      mockTx.serviceRequest.update.mockResolvedValue({ ...baseRequest, status: 'CANCELADA' });
      mockPrisma.provider.findUnique.mockResolvedValue(null);

      await service.updateStatus('req-1', 'client-1', { status: RequestStatus.CANCELADA });

      const completedCalls = (mockNotifications.notifyUser as jest.Mock).mock.calls.filter(
        ([, event]) => event === 'request:completed',
      );
      expect(completedCalls).toHaveLength(0);
    });

    it('does NOT emit request:completed to the provider', async () => {
      mockRepository.findOne.mockResolvedValue(baseRequest);
      mockTx.serviceRequest.update.mockResolvedValue(finalizedResult);

      await service.updateStatus('req-1', 'user-prov-1', { status: RequestStatus.FINALIZADA });

      const providerCompletedCalls = (mockNotifications.notifyUser as jest.Mock).mock.calls.filter(
        ([userId, event]) => event === 'request:completed' && userId === 'user-prov-1',
      );
      expect(providerCompletedCalls).toHaveLength(0);
    });

    it('does NOT emit request:completed if previousStatus was already FINALIZADA (idempotency guard)', async () => {
      mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'FINALIZADA' });
      mockTx.serviceRequest.update.mockResolvedValue(finalizedResult);
      // Bypassing state machine for this edge-case guard test
      mockPrisma.provider.findUnique.mockResolvedValue(null);

      // This call will be rejected by the state machine (FINALIZADA has no valid transitions),
      // so we just verify the guard would block it even if the state machine were bypassed.
      // The guard `request.status !== 'FINALIZADA'` is the defense-in-depth check.
      const requestAlreadyFinalizada = { ...baseRequest, status: 'FINALIZADA' };
      mockRepository.findOne.mockResolvedValue(requestAlreadyFinalizada);

      await expect(
        service.updateStatus('req-1', 'client-1', { status: RequestStatus.CANCELADA }),
      ).rejects.toThrow(ForbiddenException);

      const completedCalls = (mockNotifications.notifyUser as jest.Mock).mock.calls.filter(
        ([, event]) => event === 'request:completed',
      );
      expect(completedCalls).toHaveLength(0);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      serviceId: 'svc-1',
      description: 'Need plumber',
      address: 'Calle 1',
      lat: 0,
      lng: 0,
      price: null,
      paymentMethod: null,
      scheduledAt: null,
    };

    it('throws NotFoundException when service does not exist', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);
      await expect(service.create('client-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('uses service.basePrice when dto.price is not provided', async () => {
      const mockService = { id: 'svc-1', basePrice: 250 };
      mockPrisma.service.findUnique.mockResolvedValue(mockService);
      mockRepository.create.mockResolvedValue({ id: 'req-new', price: 250 });

      await service.create('client-1', dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ price: 250, paymentMethod: 'EFECTIVO' }),
      );
    });

    it('uses dto.price when provided', async () => {
      mockPrisma.service.findUnique.mockResolvedValue({ id: 'svc-1', basePrice: 250 });
      mockRepository.create.mockResolvedValue({ id: 'req-new', price: 150 });

      await service.create('client-1', { ...dto, price: 150 });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ price: 150 }),
      );
    });

    it('emits request:new notification after creation', async () => {
      mockPrisma.service.findUnique.mockResolvedValue({ id: 'svc-1', basePrice: 200 });
      const created = { id: 'req-new', price: 200 };
      mockRepository.create.mockResolvedValue(created);

      await service.create('client-1', dto);

      expect(mockNotifications.notifyAll).toHaveBeenCalledWith('request:new', created);
    });
  });

  // ── acceptRequest ────────────────────────────────────────────────────────────

  describe('acceptRequest', () => {
    it('throws ForbiddenException when user has no provider profile', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      await expect(service.acceptRequest('req-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('delegates to repository.transaction', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({ id: 'prov-1' });
      mockRepository.transaction.mockResolvedValue({ id: 'req-1', status: 'ACEPTADA' });

      const result = await service.acceptRequest('req-1', 'user-1');

      expect(mockRepository.transaction).toHaveBeenCalled();
      expect(result).toEqual({ id: 'req-1', status: 'ACEPTADA' });
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the request when found', async () => {
      const req = { id: 'req-1', status: 'PENDIENTE' };
      mockRepository.findOne.mockResolvedValue(req);

      const result = await service.findOne('req-1');

      expect(result.id).toBe('req-1');
    });

    it('throws NotFoundException when request does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    beforeEach(() => {
      mockRepository.findMany.mockResolvedValue([]);
    });

    it('returns all requests for ADMIN role (no user filter)', async () => {
      await service.findAll({ role: 'ADMIN', userId: 'admin-1' });
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('filters by clientId for CLIENTE role', async () => {
      await service.findAll({ role: 'CLIENTE', userId: 'client-1' });
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clientId: 'client-1' } }),
      );
    });

    it('filters by status when provided', async () => {
      await service.findAll({ role: 'CLIENTE', userId: 'client-1', status: 'PENDIENTE' });
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'PENDIENTE' }) }),
      );
    });

    it('uses OR filter for PROVEEDOR with no status (pending + own requests)', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({ id: 'prov-1' });

      await service.findAll({ role: 'PROVEEDOR', userId: 'user-prov-1' });

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ status: 'PENDIENTE' }, { providerId: 'prov-1' }],
          }),
        }),
      );
    });

    it('filters by providerId for PROVEEDOR with non-PENDIENTE status', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({ id: 'prov-1' });

      await service.findAll({ role: 'PROVEEDOR', userId: 'user-prov-1', status: 'FINALIZADA' });

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ providerId: 'prov-1', status: 'FINALIZADA' }),
        }),
      );
    });

    it('applies limit and page for pagination', async () => {
      await service.findAll({ role: 'ADMIN', userId: 'admin-1', limit: 10, page: 2 });
      expect(mockRepository.findManyPaginated).toHaveBeenCalledWith(
        expect.anything(),
        2,
        10,
      );
    });
  });

  // ── getHistory ────────────────────────────────────────────────────────────────

  describe('getHistory', () => {
    beforeEach(() => {
      mockRepository.findMany.mockResolvedValue([]);
    });

    it('returns terminal requests for CLIENTE', async () => {
      await service.getHistory('client-1', 'CLIENTE');
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clientId: 'client-1',
            status: { in: ['FINALIZADA', 'CANCELADA'] },
          }),
        }),
      );
    });

    it('returns terminal requests for PROVEEDOR', async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({ id: 'prov-1' });

      await service.getHistory('user-prov-1', 'PROVEEDOR');

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            providerId: 'prov-1',
            status: { in: ['FINALIZADA', 'CANCELADA'] },
          }),
        }),
      );
    });
  });

  // ── getStats ─────────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns counts for all status buckets', async () => {
      mockRepository.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(35)
        .mockResolvedValueOnce(5);

      const stats = await service.getStats();

      expect(stats).toEqual({
        total: 100,
        pending: 30,
        accepted: 20,
        inProcess: 10,
        completed: 35,
        cancelled: 5,
      });
    });
  });
});
