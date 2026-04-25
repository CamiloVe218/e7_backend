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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(serviceRequestId) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: serviceRequestId },
            include: { service: true, payment: true },
        });
        if (!request) {
            throw new common_1.NotFoundException('Solicitud no encontrada');
        }
        if (request.payment) {
            throw new common_1.ConflictException('Ya existe un pago para esta solicitud');
        }
        return this.prisma.payment.create({
            data: {
                serviceRequestId,
                amount: request.price || request.service.basePrice,
                status: 'PENDIENTE',
                method: 'SIMULADO',
            },
        });
    }
    async simulate(serviceRequestId) {
        const payment = await this.prisma.payment.findUnique({
            where: { serviceRequestId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pago no encontrado');
        }
        const success = Math.random() > 0.1;
        return this.prisma.payment.update({
            where: { serviceRequestId },
            data: {
                status: success ? 'COMPLETADO' : 'FALLIDO',
                transactionId: success ? `TXN-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}` : null,
            },
        });
    }
    async findByRequest(serviceRequestId) {
        return this.prisma.payment.findUnique({
            where: { serviceRequestId },
        });
    }
    async findAll() {
        return this.prisma.payment.findMany({
            include: {
                serviceRequest: {
                    include: {
                        client: { select: { name: true, email: true } },
                        service: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map