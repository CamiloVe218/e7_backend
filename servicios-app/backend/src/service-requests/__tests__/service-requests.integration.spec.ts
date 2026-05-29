/**
 * Integration tests for the ServiceRequests HTTP layer.
 *
 * Spins up a scoped NestJS app with mocked Service and PrismaService,
 * exercising ValidationPipe, JwtAuthGuard, RolesGuard, and routing.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { ServiceRequestsController } from '../service-requests.controller';
import { ServiceRequestsService } from '../service-requests.service';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalExceptionFilter } from '../../filters/http-exception.filter';

const TEST_SECRET = 'service-requests-integration-test-secret-64!!';

const mockPrisma = {
  user: { findUnique: jest.fn() },
};

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  getHistory: jest.fn(),
  getStats: jest.fn(),
  acceptRequest: jest.fn(),
  updateStatus: jest.fn(),
};

const clientUser  = { id: 'client-1',   email: 'client@test.com',   name: 'Cliente',   role: 'CLIENTE' };
const providerUser = { id: 'prov-1',    email: 'prov@test.com',     name: 'Proveedor', role: 'PROVEEDOR' };

async function buildApp(): Promise<{ app: INestApplication; jwt: JwtService }> {
  process.env.JWT_SECRET = TEST_SECRET;

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      PassportModule,
      JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '1h' } }),
    ],
    controllers: [ServiceRequestsController],
    providers: [
      { provide: ServiceRequestsService, useValue: mockService },
      { provide: PrismaService, useValue: mockPrisma },
      JwtStrategy,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('api');

  const jwtSvc = module.get<JwtService>(JwtService);

  await app.init();
  return { app, jwt: jwtSvc };
}

describe('ServiceRequests — HTTP integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  let clientToken: string;
  let providerToken: string;

  beforeAll(async () => {
    ({ app, jwt: jwtService } = await buildApp());
    clientToken  = jwtService.sign({ sub: clientUser.id,  email: clientUser.email,  role: clientUser.role });
    providerToken = jwtService.sign({ sub: providerUser.id, email: providerUser.email, role: providerUser.role });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Auth wall ───────────────────────────────────────────────────────────────

  describe('unauthenticated requests', () => {
    it('GET /api/service-requests returns 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/api/service-requests');
      expect(res.status).toBe(401);
    });

    it('POST /api/service-requests returns 401 without token', async () => {
      const res = await request(app.getHttpServer()).post('/api/service-requests').send({});
      expect(res.status).toBe(401);
    });
  });

  // ── ValidationPipe ──────────────────────────────────────────────────────────

  describe('POST /api/service-requests — validation', () => {
    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(clientUser);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/service-requests')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 when description is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/service-requests')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ serviceId: 'svc-1', description: 'short', address: 'Av. Test 1', lat: 19.4, lng: -99.1 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when unknown fields are sent (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/service-requests')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId: 'svc-1',
          description: 'Necesito reparar una tubería rota urgente',
          address: 'Av. Test 123',
          lat: 19.4326,
          lng: -99.1332,
          hackerField: 'injected',
        });

      expect(res.status).toBe(400);
    });
  });

  // ── Role guard ──────────────────────────────────────────────────────────────

  describe('POST /api/service-requests — roles', () => {
    it('returns 403 when PROVEEDOR tries to create a request', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(providerUser);

      const res = await request(app.getHttpServer())
        .post('/api/service-requests')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          serviceId: 'svc-1',
          description: 'Necesito reparar una tubería rota urgente',
          address: 'Av. Test 123',
          lat: 19.4326,
          lng: -99.1332,
        });

      expect(res.status).toBe(403);
    });
  });

  // ── Successful flows ────────────────────────────────────────────────────────

  describe('GET /api/service-requests', () => {
    it('returns 200 and delegates to service.findAll', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(clientUser);
      mockService.findAll.mockResolvedValue([{ id: 'req-1' }]);

      const res = await request(app.getHttpServer())
        .get('/api/service-requests')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(mockService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'CLIENTE', userId: clientUser.id }),
      );
    });
  });

  describe('GET /api/service-requests/history', () => {
    it('returns 200 for authenticated user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(clientUser);
      mockService.getHistory.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/service-requests/history')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(mockService.getHistory).toHaveBeenCalledWith(clientUser.id, clientUser.role);
    });
  });

  describe('PATCH /api/service-requests/:id/accept', () => {
    it('returns 403 when CLIENTE tries to accept a request', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(clientUser);

      const res = await request(app.getHttpServer())
        .patch('/api/service-requests/req-1/accept')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
    });

    it('returns 200 when PROVEEDOR accepts a request', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(providerUser);
      mockService.acceptRequest.mockResolvedValue({ id: 'req-1', status: 'ACEPTADA' });

      const res = await request(app.getHttpServer())
        .patch('/api/service-requests/req-1/accept')
        .set('Authorization', `Bearer ${providerToken}`);

      expect([200, 201]).toContain(res.status);
      expect(mockService.acceptRequest).toHaveBeenCalledWith('req-1', providerUser.id);
    });
  });
});
