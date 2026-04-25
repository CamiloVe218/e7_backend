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
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RatingsService = class RatingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(clientId, dto) {
        const request = await this.prisma.serviceRequest.findUnique({
            where: { id: dto.serviceRequestId },
            include: { rating: true },
        });
        if (!request) {
            throw new common_1.NotFoundException('Solicitud no encontrada');
        }
        if (request.clientId !== clientId) {
            throw new common_1.ForbiddenException('Solo el cliente puede calificar este servicio');
        }
        if (request.status !== 'FINALIZADA') {
            throw new common_1.ConflictException('Solo se pueden calificar servicios finalizados');
        }
        if (request.rating) {
            throw new common_1.ConflictException('Este servicio ya fue calificado');
        }
        if (!request.providerId) {
            throw new common_1.ConflictException('El servicio no tiene proveedor asignado');
        }
        const rating = await this.prisma.rating.create({
            data: {
                serviceRequestId: dto.serviceRequestId,
                clientId,
                providerId: request.providerId,
                score: dto.score,
                comment: dto.comment,
            },
        });
        const allRatings = await this.prisma.rating.findMany({
            where: { providerId: request.providerId },
            select: { score: true },
        });
        const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
        await this.prisma.provider.update({
            where: { id: request.providerId },
            data: { rating: Math.round(avgRating * 10) / 10 },
        });
        return rating;
    }
    async findByProvider(providerId) {
        return this.prisma.rating.findMany({
            where: { providerId },
            include: {
                client: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsService);
//# sourceMappingURL=ratings.service.js.map