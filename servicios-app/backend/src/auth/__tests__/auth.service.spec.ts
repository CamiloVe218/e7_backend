import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../dto/register.dto';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── register ─────────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      email: 'test@test.com',
      password: 'secret123',
      name: 'Test User',
      role: Role.CLIENTE,
      phone: '123456',
      bio: '',
      serviceType: [],
    };

    it('throws ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('creates a user and returns token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const createdUser = { id: 'u1', email: dto.email, name: dto.name, role: Role.CLIENTE, phone: dto.phone, createdAt: new Date() };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(result.token).toBe('signed-token');
      expect(result.user).toEqual(createdUser);
    });

    it('hashes the password before storing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: dto.email, name: dto.name, role: Role.CLIENTE, phone: dto.phone, createdAt: new Date() });

      await service.register(dto);

      const callData = mockPrisma.user.create.mock.calls[0][0].data;
      expect(callData.password).not.toBe(dto.password);
      const isHashed = await bcrypt.compare(dto.password, callData.password);
      expect(isHashed).toBe(true);
    });

    it('creates provider profile when role is PROVEEDOR', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: dto.email, name: dto.name, role: Role.PROVEEDOR, phone: dto.phone, createdAt: new Date() });
      mockPrisma.provider.create.mockResolvedValue({});

      await service.register({ ...dto, role: Role.PROVEEDOR });

      expect(mockPrisma.provider.create).toHaveBeenCalledWith({
        data: { userId: 'u1', bio: '', serviceType: [] },
      });
    });

    it('does NOT create provider profile for CLIENTE role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: dto.email, name: dto.name, role: Role.CLIENTE, phone: dto.phone, createdAt: new Date() });

      await service.register(dto);

      expect(mockPrisma.provider.create).not.toHaveBeenCalled();
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'no@one.com', password: 'x' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password does not match', async () => {
      const hashed = await bcrypt.hash('realpassword', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: hashed, role: Role.CLIENTE });
      await expect(service.login({ email: 'test@test.com', password: 'wrongpassword' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns user (without password) and token on valid credentials', async () => {
      const hashed = await bcrypt.hash('secret', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: hashed, role: Role.CLIENTE, name: 'User' });

      const result = await service.login({ email: 'test@test.com', password: 'secret' });

      expect(result.token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@test.com');
    });
  });
});
