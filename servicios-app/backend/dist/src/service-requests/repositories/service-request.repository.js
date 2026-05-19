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
exports.ServiceRequestRepository = exports.REQUEST_INCLUDE = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
exports.REQUEST_INCLUDE = {
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
let ServiceRequestRepository = class ServiceRequestRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.serviceRequest.create({ data, include: exports.REQUEST_INCLUDE });
    }
    findMany(args = {}) {
        return this.prisma.serviceRequest.findMany({
            where: args.where,
            include: exports.REQUEST_INCLUDE,
            orderBy: args.orderBy ?? { createdAt: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.serviceRequest.findUnique({
            where: { id },
            include: exports.REQUEST_INCLUDE,
        });
    }
    findFirst(where) {
        return this.prisma.serviceRequest.findFirst({ where });
    }
    update(id, data) {
        return this.prisma.serviceRequest.update({
            where: { id },
            data,
            include: exports.REQUEST_INCLUDE,
        });
    }
    count(where) {
        return this.prisma.serviceRequest.count({ where });
    }
    transaction(fn) {
        return this.prisma.$transaction(fn);
    }
};
exports.ServiceRequestRepository = ServiceRequestRepository;
exports.ServiceRequestRepository = ServiceRequestRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceRequestRepository);
//# sourceMappingURL=service-request.repository.js.map