# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Browser / Client                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                  Next.js Frontend :3000                 │
│  App Router · React Server Components · Tailwind CSS   │
└──────────────────────┬──────────────────────────────────┘
                       │ REST + WS (Socket.IO)
┌──────────────────────▼──────────────────────────────────┐
│                  NestJS Backend :4000                   │
│                                                         │
│   AuthModule       ServiceRequestsModule                │
│   ┌──────────┐    ┌──────────────────────────────────┐  │
│   │Controller│    │ Controller                       │  │
│   │Service   │    │ Service   (state machine)        │  │
│   │JwtStrategy    │ Repository (data access)         │  │
│   └──────────┘    └──────────────────────────────────┘  │
│                                                         │
│   ServicesModule   ProvidersModule   PaymentsModule     │
│   RatingsModule    NotificationsModule (WebSocket GW)   │
└──────────────────────┬──────────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────────┐
│                  PostgreSQL :5432                       │
└─────────────────────────────────────────────────────────┘
```

## Data Model (ER Diagram)

```
User ──────────── Provider
 │                   │
 │ (clientId)        │ (providerId)
 └──── ServiceRequest ────── Service
              │
              ├──── Payment
              └──── Rating
```

Key relationships:
- `User` 1:0..1 `Provider` — a user may have a provider profile
- `ServiceRequest` belongs to a `Client (User)`, optionally to a `Provider`, and to a `Service`
- `Payment` and `Rating` are 1:1 per `ServiceRequest`
- `Provider` has many `Availability` windows

## Request Lifecycle (State Machine)

```
PENDIENTE ──► ACEPTADA ──► EN_PROCESO ──► FINALIZADA
    │              │              │
    └──────────────┴──────────────┴──► CANCELADA
```

Valid transitions:

| From | To |
|---|---|
| PENDIENTE | CANCELADA |
| ACEPTADA | EN_PROCESO, CANCELADA |
| EN_PROCESO | FINALIZADA, CANCELADA |

Any other transition is rejected with `ConflictException`.

## Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── PrismaModule (global-ish)
├── AuthModule
│   └── JwtModule
├── ServiceRequestsModule
│   └── NotificationsModule
├── ServicesModule
├── ProvidersModule
├── PaymentsModule
├── RatingsModule
└── UsersModule
```

## Real-time Notifications

`NotificationsGateway` (Socket.IO) emits events to connected clients:

| Event | Audience | Trigger |
|---|---|---|
| `request:new` | All | New request created |
| `request:accepted` | Client | Provider accepted their request |
| `request:status_changed` | Client + Provider | Status update |
| `request:updated` | All | Any change to a request |

Clients join a personal room `user:<userId>` on connection. `notifyUser()` targets that room; `notifyAll()` broadcasts to everyone.
