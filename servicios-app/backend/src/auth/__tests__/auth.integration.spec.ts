/**
 * Integration tests for the Auth HTTP layer.
 *
 * These tests spin up the full NestJS application with a mocked PrismaService
 * so they can run in CI without a real database, while still exercising
 * ValidationPipe, Guards, Controllers, and Services end-to-end.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

const TEST_JWT_SECRET = 'integration-test-secret-32-chars-long!!';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  provider: {
    create: jest.fn(),
  },
};

async function buildApp(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      PassportModule,
      JwtModule.register({ secret: TEST_JWT_SECRET, signOptions: { expiresIn: '1h' } }),
    ],
    controllers: [AuthController],
    providers: [
      AuthService,
      JwtStrategy,
      { provide: PrismaService, useValue: mockPrisma },
    ],
  })
    .overrideProvider(ConfigModule)
    .useValue({})
    .compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  // Patch JwtStrategy to use the test secret
  const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  (jwtStrategy as any).secretOrKey = TEST_JWT_SECRET;

  await app.init();
  return app;
}

describe('Auth — HTTP integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /api/auth/register ─────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'bad-email' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('returns 400 when email is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'pass123', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: '123', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('returns 409 when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'taken@test.com', password: 'password123', name: 'Test User' });

      expect(res.status).toBe(409);
    });

    it('returns 201 with user and token on valid registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'new@test.com',
        name: 'New User',
        role: 'CLIENTE',
        phone: null,
        createdAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'password123', name: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).not.toHaveProperty('password');
    });
  });

  // ── POST /api/auth/login ────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('returns 401 when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'ghost@test.com', password: 'pass' });

      expect(res.status).toBe(401);
    });

    it('returns 401 when password is wrong', async () => {
      const hashed = await bcrypt.hash('realpass', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test.com',
        password: hashed,
        role: 'CLIENTE',
        name: 'User',
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });

    it('returns 200 with token on valid credentials', async () => {
      const hashed = await bcrypt.hash('correctpass', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test.com',
        password: hashed,
        role: 'CLIENTE',
        name: 'Legit User',
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'correctpass' });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('returns 400 when body is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ── GET /api/auth/me ────────────────────────────────────────────────────────

  describe('GET /api/auth/me', () => {
    it('returns 401 without Authorization header', async () => {
      const res = await request(app.getHttpServer()).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.status).toBe(401);
    });
  });
});
