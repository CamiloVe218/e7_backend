"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const update_status_dto_1 = require("../dto/update-status.dto");
const service_requests_service_1 = require("../service-requests.service");
const service_request_repository_1 = require("../repositories/service-request.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_gateway_1 = require("../../notifications/notifications.gateway");
const mockRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    transaction: jest.fn(),
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
    let service;
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                service_requests_service_1.ServiceRequestsService,
                { provide: service_request_repository_1.ServiceRequestRepository, useValue: mockRepository },
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: notifications_gateway_1.NotificationsGateway, useValue: mockNotifications },
            ],
        }).compile();
        service = module.get(service_requests_service_1.ServiceRequestsService);
    });
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
            mockRepository.update.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });
        });
        it('allows ACEPTADA → EN_PROCESO', async () => {
            const result = await service.updateStatus('req-1', 'user-prov-1', { status: update_status_dto_1.RequestStatus.EN_PROCESO });
            expect(result.status).toBe('EN_PROCESO');
        });
        it('allows ACEPTADA → CANCELADA', async () => {
            mockRepository.update.mockResolvedValue({ ...baseRequest, status: 'CANCELADA' });
            const result = await service.updateStatus('req-1', 'client-1', { status: update_status_dto_1.RequestStatus.CANCELADA });
            expect(result.status).toBe('CANCELADA');
        });
        it('rejects ACEPTADA → PENDIENTE (invalid transition)', async () => {
            await expect(service.updateStatus('req-1', 'client-1', { status: update_status_dto_1.RequestStatus.PENDIENTE })).rejects.toThrow(common_1.ConflictException);
        });
        it('rejects ACEPTADA → FINALIZADA (invalid transition)', async () => {
            await expect(service.updateStatus('req-1', 'client-1', { status: update_status_dto_1.RequestStatus.FINALIZADA })).rejects.toThrow(common_1.ConflictException);
        });
        it('allows EN_PROCESO → FINALIZADA', async () => {
            mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });
            mockRepository.update.mockResolvedValue({ ...baseRequest, status: 'FINALIZADA' });
            const result = await service.updateStatus('req-1', 'user-prov-1', { status: update_status_dto_1.RequestStatus.FINALIZADA });
            expect(result.status).toBe('FINALIZADA');
        });
        it('rejects EN_PROCESO → ACEPTADA (invalid transition)', async () => {
            mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'EN_PROCESO' });
            await expect(service.updateStatus('req-1', 'client-1', { status: update_status_dto_1.RequestStatus.ACEPTADA })).rejects.toThrow(common_1.ConflictException);
        });
        it('allows PENDIENTE → CANCELADA', async () => {
            mockRepository.findOne.mockResolvedValue({ ...baseRequest, status: 'PENDIENTE', providerId: null });
            mockRepository.update.mockResolvedValue({ ...baseRequest, status: 'CANCELADA' });
            mockPrisma.provider.findUnique.mockResolvedValue(null);
            const result = await service.updateStatus('req-1', 'client-1', { status: update_status_dto_1.RequestStatus.CANCELADA });
            expect(result.status).toBe('CANCELADA');
        });
        it('throws ForbiddenException when unrelated user tries to update', async () => {
            mockPrisma.provider.findUnique.mockResolvedValue(null);
            await expect(service.updateStatus('req-1', 'stranger-user', { status: update_status_dto_1.RequestStatus.CANCELADA })).rejects.toThrow(common_1.ForbiddenException);
        });
        it('throws NotFoundException when request does not exist', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            await expect(service.updateStatus('req-1', 'client-1', { status: update_status_dto_1.RequestStatus.CANCELADA })).rejects.toThrow(common_1.NotFoundException);
        });
    });
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
            await expect(service.create('client-1', dto)).rejects.toThrow(common_1.NotFoundException);
        });
        it('uses service.basePrice when dto.price is not provided', async () => {
            const mockService = { id: 'svc-1', basePrice: 250 };
            mockPrisma.service.findUnique.mockResolvedValue(mockService);
            mockRepository.create.mockResolvedValue({ id: 'req-new', price: 250 });
            await service.create('client-1', dto);
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({ price: 250, paymentMethod: 'EFECTIVO' }));
        });
        it('uses dto.price when provided', async () => {
            mockPrisma.service.findUnique.mockResolvedValue({ id: 'svc-1', basePrice: 250 });
            mockRepository.create.mockResolvedValue({ id: 'req-new', price: 150 });
            await service.create('client-1', { ...dto, price: 150 });
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({ price: 150 }));
        });
        it('emits request:new notification after creation', async () => {
            mockPrisma.service.findUnique.mockResolvedValue({ id: 'svc-1', basePrice: 200 });
            const created = { id: 'req-new', price: 200 };
            mockRepository.create.mockResolvedValue(created);
            await service.create('client-1', dto);
            expect(mockNotifications.notifyAll).toHaveBeenCalledWith('request:new', created);
        });
    });
    describe('acceptRequest', () => {
        it('throws ForbiddenException when user has no provider profile', async () => {
            mockPrisma.provider.findUnique.mockResolvedValue(null);
            await expect(service.acceptRequest('req-1', 'user-1')).rejects.toThrow(common_1.ForbiddenException);
        });
        it('delegates to repository.transaction', async () => {
            mockPrisma.provider.findUnique.mockResolvedValue({ id: 'prov-1' });
            mockRepository.transaction.mockResolvedValue({ id: 'req-1', status: 'ACEPTADA' });
            const result = await service.acceptRequest('req-1', 'user-1');
            expect(mockRepository.transaction).toHaveBeenCalled();
            expect(result).toEqual({ id: 'req-1', status: 'ACEPTADA' });
        });
    });
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
//# sourceMappingURL=service-requests.service.spec.js.map