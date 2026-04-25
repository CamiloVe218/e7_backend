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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                createdAt: true,
                provider: {
                    select: {
                        id: true,
                        bio: true,
                        rating: true,
                        isAvailable: true,
                        serviceType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                createdAt: true,
                provider: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        });
    }
    async updateMe(id, data) {
        return this.prisma.user.update({
            where: { id },
            data: {
                ...(data.name ? { name: data.name } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                createdAt: true,
                provider: true,
            },
        });
    }
    async getStats() {
        const [totalUsers, totalClients, totalProviders, totalAdmins] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'CLIENTE' } }),
            this.prisma.user.count({ where: { role: 'PROVEEDOR' } }),
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
        ]);
        return { totalUsers, totalClients, totalProviders, totalAdmins };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map