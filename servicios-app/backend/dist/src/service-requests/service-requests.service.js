"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const REQUEST_INCLUDE = {
    service: true,
    client: { select: { id: true, name: true, email: true, phone: true } },
    provider: {
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
        },
    },
    payment: true,
    rating: true,
};
let ServiceRequestsService = class ServiceRequestsService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async create(clientId, dto) {
        const service = await this.prisma.service.findUnique({
            where: { id: dto.serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Servicio no encontrado');
        }
        const request = await this.prisma.serviceRequest.create({
            data: {
                clientId,
                serviceId: dto.serviceId,
                description: dto.description,
                address: dto.address,
                lat: dto.lat,
                lng: dto.lng,
                price: dto.price || service.basePrice,
                paymentMethod: dto.paymentMethod || 'EFECTIVO',
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
            },
            include: REQUEST_INCLUDE,
        });
        this.notifications.notifyAll('request:new', request);
        return request;
    }
    async findAll(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.role === 'CLIENTE') {
            where.clientId = filters.userId;
        }
        else if (filters.role === 'PROVEEDOR') {
            const provider = await this.prisma.provider.findUnique({
                where: { userId: filters.userId },
            });
            if (provider) {
                if (filters.status) {
                    where.status = filters.status;
                }
                else {
                    where.OR = [
                        { status: 'PENDIENTE' },
                        { providerId: provider.id },
                    ];
                }
                if (filters.status && filters.status !== 'PENDIENTE') {
                    where.providerId = provider.id;
                    delete where.OR;
                }
            }
        }
        return this.prisma.serviceRequest.findMany({
            where,
            include: REQUEST_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id },
            include: REQUEST_INCLUDE,
        });
        if (!request) {
            throw new common_1.NotFoundException('Solicitud no encontrada');
        }
        return request;
    }
    async acceptRequest(requestId, userId) {
        const provider = await this.prisma.provider.findUnique({
            where: { userId },
        });
        if (!provider) {
            throw new common_1.ForbiddenException('Solo proveedores pueden aceptar solicitudes');
        }
        return this.prisma.$transaction(async (tx) => {
            const activeRequest = await tx.serviceRequest.findFirst({
                where: {
                    providerId: provider.id,
                    status: { in: ['ACEPTADA', 'EN_PROCESO'] },
                },
            });
            if (activeRequest) {
                throw new common_1.ConflictException('Ya tienes una solicitud activa. Finalízala antes de aceptar otra.');
            }
            const request = await tx.serviceRequest.findUnique({
                where: { id: requestId },
            });
            if (!request) {
                throw new common_1.NotFoundException('Solicitud no encontrada');
            }
            if (request.status !== 'PENDIENTE') {
                throw new common_1.ConflictException('Esta solicitud ya no está disponible');
            }
            const updated = await tx.serviceRequest.update({
                where: { id: requestId },
                data: {
                    providerId: provider.id,
                    status: 'ACEPTADA',
                },
                include: REQUEST_INCLUDE,
            });
            await tx.provider.update({
                where: { id: provider.id },
                data: { isAvailable: false },
            });
            this.notifications.notifyUser(request.clientId, 'request:accepted', updated);
            this.notifications.notifyAll('request:updated', updated);
            return updated;
        });
    }
    async updateStatus(requestId, userId, dto) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: { provider: true },
        });
        if (!request) {
            throw new common_1.NotFoundException('Solicitud no encontrada');
        }
        const provider = await this.prisma.provider.findUnique({
            where: { userId },
        });
        const isClient = request.clientId === userId;
        const isProvider = provider && request.providerId === provider.id;
        if (!isClient && !isProvider) {
            throw new common_1.ForbiddenException('No tienes permisos para modificar esta solicitud');
        }
        const validTransitions = {
            ACEPTADA: ['EN_PROCESO', 'CANCELADA'],
            EN_PROCESO: ['FINALIZADA', 'CANCELADA'],
            PENDIENTE: ['CANCELADA'],
        };
        const allowed = validTransitions[request.status];
        if (!allowed || !allowed.includes(dto.status)) {
            throw new common_1.ConflictException(`No se puede cambiar de ${request.status} a ${dto.status}`);
        }
        const updated = await this.prisma.serviceRequest.update({
            where: { id: requestId },
            data: { status: dto.status },
            include: REQUEST_INCLUDE,
        });
        if (dto.status === 'FINALIZADA' || dto.status === 'CANCELADA') {
            if (request.providerId) {
                await this.prisma.provider.update({
                    where: { id: request.providerId },
                    data: { isAvailable: true },
                });
            }
        }
        this.notifications.notifyUser(request.clientId, 'request:status_changed', updated);
        if (request.provider) {
            this.notifications.notifyUser(request.provider.userId, 'request:status_changed', updated);
        }
        this.notifications.notifyAll('request:updated', updated);
        return updated;
    }
    async getHistory(userId, role) {
        const where = {};
        if (role === 'CLIENTE') {
            where.clientId = userId;
            where.status = { in: ['FINALIZADA', 'CANCELADA'] };
        }
        else if (role === 'PROVEEDOR') {
            const provider = await this.prisma.provider.findUnique({
                where: { userId },
            });
            if (provider) {
                where.providerId = provider.id;
                where.status = { in: ['FINALIZADA', 'CANCELADA'] };
            }
        }
        return this.prisma.serviceRequest.findMany({
            where,
            include: REQUEST_INCLUDE,
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getStats() {
        const [total, pending, accepted, inProcess, completed, cancelled] = await Promise.all([
            this.prisma.serviceRequest.count(),
            this.prisma.serviceRequest.count({ where: { status: 'PENDIENTE' } }),
            this.prisma.serviceRequest.count({ where: { status: 'ACEPTADA' } }),
            this.prisma.serviceRequest.count({ where: { status: 'EN_PROCESO' } }),
            this.prisma.serviceRequest.count({ where: { status: 'FINALIZADA' } }),
            this.prisma.serviceRequest.count({ where: { status: 'CANCELADA' } }),
        ]);
        return { total, pending, accepted, inProcess, completed, cancelled };
    }
};
exports.ServiceRequestsService = ServiceRequestsService;
exports.ServiceRequestsService = ServiceRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway])
], ServiceRequestsService);
//# sourceMappingURL=service-requests.service.js.map