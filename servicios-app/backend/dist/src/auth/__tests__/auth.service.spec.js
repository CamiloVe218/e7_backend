"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const register_dto_1 = require("../dto/register.dto");
const auth_service_1 = require("../auth.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcrypt");
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    provider: {
        create: jest.fn(),
    },
};
const mockJwt = {
    sign: jest.fn().mockReturnValue('signed-token'),
};
describe('AuthService', () => {
    let service;
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: jwt_1.JwtService, useValue: mockJwt },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
    });
    describe('register', () => {
        const dto = {
            email: 'test@test.com',
            password: 'secret123',
            name: 'Test User',
            role: register_dto_1.Role.CLIENTE,
            phone: '123456',
            bio: '',
            serviceType: [],
        };
        it('throws ConflictException when email already exists', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });
            await expect(service.register(dto)).rejects.toThrow(common_1.ConflictException);
        });
        it('creates a user and returns token', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            const createdUser = { id: 'u1', email: dto.email, name: dto.name, role: register_dto_1.Role.CLIENTE, phone: dto.phone, createdAt: new Date() };
            mockPrisma.user.create.mockResolvedValue(createdUser);
            const result = await service.register(dto);
            expect(result.token).toBe('signed-token');
            expect(result.user).toEqual(createdUser);
        });
        it('hashes the password before storing', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: dto.email, name: dto.name, role: register_dto_1.Role.CLIENTE, phone: dto.phone, createdAt: new Date() });
            await service.register(dto);
            const callData = mockPrisma.user.create.mock.calls[0][0].data;
            expect(callData.password).not.toBe(dto.password);
            const isHashed = await bcrypt.compare(dto.password, callData.password);
            expect(isHashed).toBe(true);
        });
        it('creates provider profile when role is PROVEEDOR', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: dto.email, name: dto.name, role: register_dto_1.Role.PROVEEDOR, phone: dto.phone, createdAt: new Date() });
            mockPrisma.provider.create.mockResolvedValue({});
            await service.register({ ...dto, role: register_dto_1.Role.PROVEEDOR });
            expect(mockPrisma.provider.create).toHaveBeenCalledWith({
                data: { userId: 'u1', bio: '', serviceType: [] },
            });
        });
        it('does NOT create provider profile for CLIENTE role', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: dto.email, name: dto.name, role: register_dto_1.Role.CLIENTE, phone: dto.phone, createdAt: new Date() });
            await service.register(dto);
            expect(mockPrisma.provider.create).not.toHaveBeenCalled();
        });
    });
    describe('login', () => {
        it('throws UnauthorizedException when user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(service.login({ email: 'no@one.com', password: 'x' })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('throws UnauthorizedException when password does not match', async () => {
            const hashed = await bcrypt.hash('realpassword', 10);
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: hashed, role: register_dto_1.Role.CLIENTE });
            await expect(service.login({ email: 'test@test.com', password: 'wrongpassword' })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('returns user (without password) and token on valid credentials', async () => {
            const hashed = await bcrypt.hash('secret', 10);
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: hashed, role: register_dto_1.Role.CLIENTE, name: 'User' });
            const result = await service.login({ email: 'test@test.com', password: 'secret' });
            expect(result.token).toBe('signed-token');
            expect(result.user).not.toHaveProperty('password');
            expect(result.user.email).toBe('test@test.com');
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map