# Design Patterns

## 1. Repository Pattern

**Where:** `ServiceRequestRepository` (`service-requests/repositories/`)

**Why:** Decouples business logic from data access. The service layer expresses _what_ data it needs; the repository knows _how_ to fetch it. Prisma queries, `REQUEST_INCLUDE` shape, and transaction wiring live exclusively in the repository.

```
ServiceRequestsController
       ↓
ServiceRequestsService  ← business logic, state machine
       ↓
ServiceRequestRepository  ← all Prisma calls
       ↓
PrismaService (PostgreSQL)
```

The service still holds `PrismaService` directly for auxiliary entities (`provider`, `service`) that don't warrant their own repositories yet.

## 2. Strategy Pattern (Authentication)

**Where:** `JwtStrategy` (`auth/strategies/jwt.strategy.ts`)

NestJS Passport integrates the Strategy pattern. `JwtStrategy` extends `PassportStrategy(Strategy)` and implements `validate()`. Swapping auth schemes (e.g. adding OAuth) means adding a new strategy class, not changing controllers.

## 3. Guard Pattern (Authorization)

**Where:** `JwtAuthGuard`, `RolesGuard` (`auth/guards/`)

Guards implement `CanActivate`. They compose cleanly with decorators:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROVEEDOR')
acceptRequest(...) { ... }
```

`RolesGuard` reads the `@Roles()` metadata set by the decorator and compares against `user.role` injected by `JwtStrategy.validate()`.

## 4. Observer Pattern (WebSocket Events)

**Where:** `NotificationsGateway` (`notifications/notifications.gateway.ts`)

Clients subscribe to server-sent events over Socket.IO. The gateway acts as the event bus — services call `notifyUser()` or `notifyAll()` without knowing which clients are connected.

## 5. State Machine (Request Lifecycle)

**Where:** `ServiceRequestsService.updateStatus()` (`service-requests/service-requests.service.ts`)

```typescript
const validTransitions: Record<string, string[]> = {
  ACEPTADA:   ['EN_PROCESO', 'CANCELADA'],
  EN_PROCESO: ['FINALIZADA', 'CANCELADA'],
  PENDIENTE:  ['CANCELADA'],
};
```

Only explicitly listed transitions are allowed. Any other attempt throws `ConflictException`. The machine is intentionally flat — no external library — keeping it readable and testable.

## 6. Dependency Injection (NestJS IoC Container)

All services, repositories, gateways, and strategies are registered as `providers` in their respective modules. NestJS resolves and injects them automatically. This makes unit testing straightforward: swap any dependency with a `jest.fn()` mock via `Test.createTestingModule`.

## 7. DTO + Validation Pipeline

**Where:** `class-validator` decorators on all DTOs, `ValidationPipe` in `main.ts`

The global `ValidationPipe` (with `whitelist: true`) strips unknown properties and validates all incoming payloads before they reach controllers. DTOs double as Swagger schema sources via `@ApiProperty`.
