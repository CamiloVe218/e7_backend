# Servicios App

Full-stack marketplace for on-demand home services. Clients post service requests, providers accept and fulfill them, payments are tracked, and ratings close the loop.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, Passport JWT |
| Database | PostgreSQL 15 (via Prisma ORM) |
| Real-time | Socket.IO (WebSockets) |
| Auth | JWT Bearer tokens, bcrypt password hashing |
| Docs | Swagger / OpenAPI (`/api/docs`) |
| Infra | Docker Compose, multi-stage Dockerfiles |
| CI | GitHub Actions |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- `openssl` (for generating secrets)

### 1 — Clone and configure environment

```bash
git clone <repo-url>
cd servicios-app

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL and JWT_SECRET

# Docker env
cp infrastructure/.env.example infrastructure/.env
# Edit infrastructure/.env — set POSTGRES_PASSWORD and JWT_SECRET
```

Generate a secure JWT secret:

```bash
openssl rand -hex 64
```

### 2a — Run with Docker (recommended for production-like setup)

```bash
cd infrastructure
docker compose up --build
```

Services start at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Swagger UI: http://localhost:4000/api/docs

### 2b — Run locally (development)

**Backend:**

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**Frontend** (separate terminal):

```bash
cd frontend
npm install
npm run dev
```

### Seed data (test users)

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.com | admin123 |
| Client | cliente@demo.com | cliente123 |
| Provider | proveedor@demo.com | proveedor123 |

## Project Structure

```
servicios-app/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/             # JWT strategy, guards, decorators
│   │   ├── service-requests/ # Core domain — requests, repository, state machine
│   │   ├── services/         # Service catalog
│   │   ├── providers/        # Provider profiles
│   │   ├── payments/         # Payment records
│   │   ├── ratings/          # Post-service ratings
│   │   ├── notifications/    # WebSocket gateway
│   │   └── prisma/           # Database client
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── frontend/                 # Next.js app
│   └── src/app/
│       ├── admin/            # Admin dashboard
│       ├── provider/         # Provider dashboard
│       └── client/           # Client dashboard
├── infrastructure/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend    # Multi-stage
│   ├── Dockerfile.frontend   # Multi-stage
│   └── .env.example
└── .github/
    └── workflows/ci.yml
```

## API Reference

Full interactive docs at `http://localhost:4000/api/docs` (Swagger UI).

Key endpoints:

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login, get JWT |
| GET | /api/auth/me | Bearer | Current user profile |
| GET | /api/service-requests | Bearer | List requests (role-filtered) |
| POST | /api/service-requests | CLIENT | Create request |
| PATCH | /api/service-requests/:id/accept | PROVIDER | Accept request |
| PATCH | /api/service-requests/:id/status | Bearer | Update status |
| GET | /api/service-requests/history | Bearer | Completed/cancelled history |
| GET | /api/service-requests/stats | ADMIN | Dashboard counts |

## Running Tests

```bash
cd backend
npm test               # unit tests
npm test -- --coverage # with coverage report
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system diagram and design decisions.

See [docs/PATTERNS.md](docs/PATTERNS.md) for design patterns used throughout the codebase.
