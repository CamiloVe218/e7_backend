# Changelog

All notable changes to Harambal Servicios are documented here.

This project adheres to [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

### Added
- `AuthenticatedUser` interface in `shared/types/user.types.ts` — replaces all `user: any` patterns across controllers
- `UpdateProviderProfileDto` with class-validator and geographic coordinate validation
- `CreateServiceDto` and `UpdateServiceDto` for strict catalog management
- `@Transform` input sanitization (whitespace trimming) on all user-facing string fields
- Structured JSON logging via `nestjs-pino` + `pino-http` — production-ready log output compatible with Railway, Datadog, and CloudWatch
- `service-requests.integration.spec.ts` — HTTP-layer integration tests (auth wall, ValidationPipe, RolesGuard, routing)
- `CONTRIBUTING.md` — developer onboarding, code standards, commit convention, testing requirements
- `CHANGELOG.md` (this file)

### Changed
- `ServicesService.create` and `.update` now accept `CreateServiceDto` / `UpdateServiceDto` instead of `any`
- `ProvidersController.updateProfile` now accepts `UpdateProviderProfileDto` instead of `body: any`
- `AuthService.generateToken` now typed as `Pick<AuthenticatedUser, 'id' | 'email' | 'role'>` instead of `any`
- `AuthService.register` uses `dto.role ?? 'CLIENTE'` instead of `(dto.role as any) || 'CLIENTE'`
- `NestFactory.create` uses `{ bufferLogs: true }` to capture startup logs through pino

### Removed
- All `user: any` occurrences in controllers (auth, users, providers, service-requests, ratings)
- `body: any` in ServicesController and ProvidersController

---

## [0.7.0] — 2026-05-28 — Enterprise Hardening FASE 7

### Security
- **Rate limiting**: `@nestjs/throttler` global guard (60 req/min); auth routes restricted to 3–5 req/min via `@Throttle` decorator
- **Input validation hardened**: `forbidNonWhitelisted: true` in `ValidationPipe` — rejects unknown properties on all DTOs
- **XSS defense**: React JSX escaping (frontend) + Helmet CSP headers + Prisma parameterized queries (no SQL injection surface)

### Backend
- `service-requests.service.ts`: `updateStatus` now wraps both `serviceRequest.update` and `provider.isAvailable` reset inside `repository.transaction()` — atomic consistency guarantee
- `service-request.repository.ts`: `orderBy` typed as `Prisma.ServiceRequestOrderByWithRelationInput` instead of `any`
- `service-requests.service.ts`: `where: any` replaced with `Prisma.ServiceRequestWhereInput`
- `providers.service.ts`: `updateProfile` data parameter typed with an explicit interface

### Testing
- Coverage raised from ~20% to 63.26% (139 tests, 14 suites)
- Added: `providers.service.spec.ts` (11 tests), `payments.service.spec.ts` (12), `ratings.service.spec.ts` (9), `notifications.gateway.spec.ts` (9), `http-exception.filter.spec.ts` (18), `auth.service.spec.ts`, `users.service.spec.ts`, `services.service.spec.ts`, `auth.integration.spec.ts`
- CI coverage threshold enforced: statements/branches/lines ≥ 60%, functions ≥ 55%

---

## [0.6.0] — 2026-05-28 — Security & Infrastructure FASE 4–6

### Security
- **Auth migrated to httpOnly cookies** via BFF pattern (Next.js API routes proxy to Railway)
- JWT stored in `auth_token` httpOnly cookie — never in `localStorage`
- Next.js Edge middleware decodes JWT role via `atob()` and redirects to role-specific dashboard (CLIENTE → `/dashboard/client`, PROVEEDOR → `/dashboard/provider`, ADMIN → `/dashboard/admin`)
- `frontend/.env.production` removed from git tracking

### Infrastructure
- **Docker multi-stage fixed**: `production` stage now copies `node_modules` from `prod-deps` (no devDependencies in image)
- `Dockerfile.backend`: added `COPY prisma` + `RUN prisma generate` to `prod-deps` stage
- `Dockerfile.frontend`: added `prod-deps` stage and `HEALTHCHECK`
- `CMD` uses `sh -c "npx prisma migrate deploy && node dist/src/main"` — zero-downtime migration on container start

### Database
- Added 6 indexes: `ServiceRequest(clientId, providerId, status, createdAt)`, `Rating(providerId, clientId)`
- Migration file: `20260528000000_add_indexes`

### CI/CD
- Frontend job: added `npm run lint` and `npm audit --audit-level=high`
- Backend job: added `npm audit --audit-level=high` and coverage threshold enforcement
- Docker job: `docker compose config --quiet` validates compose syntax on every PR

---

## [0.5.0] — 2026-05-28 — Premium UI FASE 6a–6d

### Added
- Shimmer skeleton loading states across all dashboards
- Toast notification system with auto-dismiss
- `StatusBadge` chip component with color-coded statuses
- `ServiceRequestDrawer` with overline readability improvements and tactile press feedback
- Branded loading state and consistent focus rings on auth inputs
- Micro-interactions: dropdown fade-up, active nav font-weight, filter pill scale

---

## [0.1.0] — Initial Release

### Added
- NestJS 10 backend with modular architecture (auth, users, providers, service-requests, ratings, payments, notifications, services)
- Next.js 14 frontend with App Router and Tailwind CSS
- Prisma ORM with PostgreSQL
- JWT authentication
- WebSocket gateway for real-time notifications (Socket.IO)
- Docker Compose infrastructure
- Swagger API documentation at `/api/docs`
- Role-based access control: CLIENTE, PROVEEDOR, ADMIN
- Service request state machine: PENDIENTE → ACEPTADA → EN_PROCESO → FINALIZADA / CANCELADA
- Payment simulation module
- Provider geolocation filtering (Haversine formula)
- Rating system with automatic provider score recalculation

---

[Unreleased]: ../../compare/v0.7.0...HEAD
[0.7.0]: ../../compare/v0.6.0...v0.7.0
[0.6.0]: ../../compare/v0.5.0...v0.6.0
[0.5.0]: ../../compare/v0.1.0...v0.5.0
[0.1.0]: ../../releases/tag/v0.1.0
