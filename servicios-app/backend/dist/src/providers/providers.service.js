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
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProvidersService = class ProvidersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(lat, lng, radius) {
        const providers = await this.prisma.provider.findMany({
            where: { isAvailable: true },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                ratingsReceived: {
                    select: { score: true },
                },
            },
            orderBy: { rating: 'desc' },
        });
        if (lat && lng && radius) {
            return providers.filter((p) => {
                if (!p.lat || !p.lng)
                    return true;
                const distance = this.calculateDistance(lat, lng, p.lat, p.lng);
                return distance <= radius;
            });
        }
        return providers;
    }
    async findOne(id) {
        const provider = await this.prisma.provider.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                ratingsReceived: {
                    include: {
                        client: { select: { name: true } },
                    },
                },
            },
        });
        if (!provider) {
            throw new common_1.NotFoundException('Proveedor no encontrado');
        }
        return provider;
    }
    async findByUserId(userId) {
        return this.prisma.provider.findUnique({
            where: { userId },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
    }
    async updateProfile(userId, data) {
        const provider = await this.prisma.provider.findUnique({
            where: { userId },
        });
        if (!provider) {
            throw new common_1.NotFoundException('Perfil de proveedor no encontrado');
        }
        return this.prisma.provider.update({
            where: { userId },
            data: {
                bio: data.bio,
                serviceType: data.serviceType,
                lat: data.lat,
                lng: data.lng,
                isAvailable: data.isAvailable,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async updateAvailability(providerId, isAvailable) {
        return this.prisma.provider.update({
            where: { id: providerId },
            data: { isAvailable },
        });
    }
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(value) {
        return (value * Math.PI) / 180;
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map