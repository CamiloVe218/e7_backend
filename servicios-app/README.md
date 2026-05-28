# Harambal — Marketplace de Servicios a Domicilio

Sistema profesional de contratación de mano de obra local. Los clientes publican solicitudes de servicio, los proveedores las aceptan y ejecutan, los pagos quedan registrados y las calificaciones cierran el ciclo.

[![CI](https://github.com/CamiloVe218/e7_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/CamiloVe218/e7_backend/actions/workflows/ci.yml)
![Node 20](https://img.shields.io/badge/node-20-brightgreen)
![NestJS 10](https://img.shields.io/badge/NestJS-10-red)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-blue)

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, Passport JWT |
| Base de datos | PostgreSQL 15 (Prisma ORM) |
| Tiempo real | Socket.IO (WebSockets) |
| Autenticación | JWT (httpOnly cookie) vía BFF pattern |
| Seguridad | Helmet, Throttler global, bcrypt, ValidationPipe |
| Documentación | Swagger / OpenAPI (`/api/docs`) |
| Infraestructura | Docker Compose, Dockerfiles multi-stage |
| CI/CD | GitHub Actions |
| Despliegue | Railway (backend) + Vercel (frontend) |

---

## Arquitectura del Sistema

```mermaid
graph TB
    Browser["Browser\nNext.js 14 App Router"]

    subgraph BFF["BFF Layer (Next.js API Routes)"]
        Login["/api/auth/login"]
        Register["/api/auth/register"]
        Me["/api/auth/me"]
        Logout["/api/auth/logout"]
    end

    subgraph Backend["Backend NestJS 10 · Railway"]
        Auth["auth module\nJWT + bcrypt"]
        SR["service-requests\nState Machine"]
        SVC["services\nCatálogo"]
        PROV["providers\nPerfiles"]
        PAY["payments\nSimulación"]
        RAT["ratings\nCalificaciones"]
        WS["notifications\nSocket.IO Gateway"]
    end

    DB[(PostgreSQL 15\nPrisma ORM)]

    Browser -- "httpOnly cookie\nauth_token" --> BFF
    BFF -- "Bearer JWT\n(server-side)" --> Auth
    Browser -- "REST + Bearer JWT\n(memory token)" --> SR
    Browser -- "REST + Bearer JWT" --> SVC
    Browser -- "REST + Bearer JWT" --> PROV
    Browser -- "REST + Bearer JWT" --> PAY
    Browser -- "REST + Bearer JWT" --> RAT
    Browser -- "WebSocket" --> WS
    Auth --> DB
    SR --> DB
    SVC --> DB
    PROV --> DB
    PAY --> DB
    RAT --> DB
```

---

## Modelo Entidad-Relación

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String password
        String name
        Role role
        DateTime createdAt
    }
    Provider {
        String id PK
        String userId FK
        String bio
        String location
        Boolean available
        Float rating
        Int totalRatings
    }
    Service {
        String id PK
        String name
        String description
        Float basePrice
        String category
        Boolean active
    }
    ServiceRequest {
        String id PK
        String clientId FK
        String providerId FK
        String serviceId FK
        RequestStatus status
        String description
        Float price
        DateTime scheduledAt
        String address
        DateTime createdAt
    }
    Payment {
        String id PK
        String requestId FK
        Float amount
        PaymentStatus status
        String method
        DateTime paidAt
    }
    Rating {
        String id PK
        String requestId FK
        String clientId FK
        String providerId FK
        Int score
        String comment
        DateTime createdAt
    }
    Availability {
        String id PK
        String providerId FK
        Int dayOfWeek
        String startTime
        String endTime
    }

    User ||--o{ ServiceRequest : "hace (CLIENTE)"
    User ||--o| Provider : "es (PROVEEDOR)"
    Provider ||--o{ ServiceRequest : "atiende"
    Service ||--o{ ServiceRequest : "describe"
    ServiceRequest ||--o| Payment : "genera"
    ServiceRequest ||--o| Rating : "recibe"
    Provider ||--o{ Availability : "define"
    Provider ||--o{ Rating : "recibe"
```

---

## Flujo de Autenticación (BFF Pattern)

```mermaid
sequenceDiagram
    participant B as Browser
    participant BFF as Next.js BFF<br/>/api/auth/*
    participant API as NestJS Backend<br/>(Railway)
    participant DB as PostgreSQL

    Note over B,DB: Login Flow
    B->>BFF: POST /api/auth/login {email, password}
    BFF->>API: POST /api/auth/login {email, password}
    API->>DB: prisma.user.findUnique()
    DB-->>API: User record
    API->>API: bcrypt.compare(password, hash)
    API->>API: jwtService.sign({sub, email, role})
    API-->>BFF: {user, token: "eyJ..."}
    BFF->>B: Set-Cookie: auth_token=eyJ... (httpOnly, secure, sameSite=lax)
    Note over B: Token en cookie httpOnly<br/>JS no puede accederlo

    Note over B,DB: Hydration on page load
    B->>BFF: GET /api/auth/me (cookie automática)
    BFF->>API: GET /api/auth/me (Bearer token extraído de cookie)
    API->>DB: prisma.user.findUnique()
    API-->>BFF: User profile
    BFF-->>B: {user, token} → React memory state

    Note over B,DB: API calls (token en memoria React)
    B->>API: GET /api/service-requests (Bearer desde memoria)
    API->>API: JwtAuthGuard → JwtStrategy.validate()
    API-->>B: ServiceRequest[]

    Note over B,DB: Logout
    B->>BFF: POST /api/auth/logout
    BFF->>B: Set-Cookie: auth_token="" (maxAge=0, borrar cookie)
    Note over B: Cookie eliminada,<br/>memoria React limpiada
```

---

## Máquina de Estados — Solicitudes de Servicio

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE : CLIENTE crea solicitud

    PENDIENTE --> ACEPTADA : PROVEEDOR acepta
    PENDIENTE --> CANCELADA : CLIENTE o ADMIN cancela

    ACEPTADA --> EN_PROCESO : PROVEEDOR inicia trabajo
    ACEPTADA --> CANCELADA : CLIENTE o PROVEEDOR cancela

    EN_PROCESO --> FINALIZADA : PROVEEDOR completa
    EN_PROCESO --> CANCELADA : ADMIN cancela (excepcional)

    FINALIZADA --> [*] : CLIENTE puede calificar
    CANCELADA --> [*]
```

Las transiciones son validadas en `service-requests.service.ts` mediante un mapa `validTransitions` — cualquier transición inválida lanza `BadRequestException` antes de tocar la base de datos.

---

## Estructura del Proyecto

```
servicios-app/
├── backend/
│   ├── src/
│   │   ├── auth/                  # JWT strategy, guards, decoradores
│   │   │   ├── __tests__/         # Unit + integration tests
│   │   │   ├── decorators/        # @CurrentUser(), @Roles()
│   │   │   ├── dto/               # LoginDto, RegisterDto
│   │   │   ├── guards/            # JwtAuthGuard, RolesGuard
│   │   │   └── strategies/        # JwtStrategy
│   │   ├── service-requests/      # Dominio principal
│   │   │   ├── __tests__/         # Tests de máquina de estados
│   │   │   ├── dto/
│   │   │   └── repositories/      # Repository pattern
│   │   ├── services/              # Catálogo de servicios
│   │   ├── providers/             # Perfiles de proveedores
│   │   ├── payments/              # Pagos simulados
│   │   ├── ratings/               # Calificaciones
│   │   ├── notifications/         # WebSocket gateway (Socket.IO)
│   │   └── prisma/                # PrismaService global
│   └── prisma/
│       ├── schema.prisma          # 7 modelos, 3 enums
│       └── seed.ts                # Datos de prueba
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── api/auth/          # BFF routes (httpOnly cookie)
│       │   │   ├── login/route.ts
│       │   │   ├── register/route.ts
│       │   │   ├── me/route.ts
│       │   │   └── logout/route.ts
│       │   ├── auth/              # Login, registro
│       │   └── dashboard/         # Dashboards por rol
│       │       ├── client/        # Vista CLIENTE
│       │       ├── provider/      # Vista PROVEEDOR
│       │       └── admin/         # Vista ADMIN
│       ├── components/
│       │   ├── layout/            # Sidebar, Header
│       │   ├── requests/          # RequestCard, ServiceRequestDrawer
│       │   └── ui/                # Input, Badge, Toast, Button
│       ├── contexts/              # AuthContext
│       ├── hooks/                 # useSocket
│       ├── lib/                   # api.ts, socket.ts, utils.ts
│       ├── types/                 # TypeScript interfaces
│       └── middleware.ts          # Protección de rutas Next.js
├── infrastructure/
│   ├── docker-compose.yml         # postgres + backend + frontend
│   ├── Dockerfile.backend         # Multi-stage (build + production)
│   ├── Dockerfile.frontend        # Multi-stage
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   └── PATTERNS.md
└── .github/
    └── workflows/
        └── ci.yml                 # backend → frontend → docker
```

---

## Patrones de Diseño

| Patrón | Ubicación | Propósito |
|---|---|---|
| **BFF (Backend for Frontend)** | `frontend/src/app/api/auth/` | Proxy server-side que almacena JWT en httpOnly cookie, eliminando riesgo XSS |
| **Repository Pattern** | `service-requests/repositories/` | Desacopla el acceso a Prisma del servicio; facilita tests con mocks |
| **State Machine** | `service-requests.service.ts` | `validTransitions` Record aplica reglas de dominio antes de cualquier write |
| **Strategy Pattern** | `auth/strategies/jwt.strategy.ts` | Passport-JWT encapsula la estrategia de autenticación intercambiable |
| **Guard Pattern** | `auth/guards/` | Separa autenticación (`JwtAuthGuard`) de autorización (`RolesGuard`) |
| **Decorator Pattern** | `auth/decorators/` | `@CurrentUser()` y `@Roles()` como metadata declarativa sin lógica en controladores |
| **Module Pattern** | Toda la aplicación NestJS | Encapsulación por dominio con DI container propio |
| **Observer Pattern** | `notifications/notifications.gateway.ts` | Socket.IO emite eventos a sockets registrados sin acoplamiento directo |

---

## Módulos del Backend

| Módulo | Responsabilidad |
|---|---|
| `auth` | Registro, login, estrategia JWT, guards, decoradores |
| `users` | Perfil de usuario, listado (admin) |
| `providers` | Perfil de proveedor, disponibilidad, filtro geográfico |
| `services` | Catálogo de servicios (CRUD admin) |
| `service-requests` | Ciclo completo de solicitudes + máquina de estados |
| `payments` | Registro y simulación de pagos |
| `ratings` | Calificaciones post-servicio |
| `notifications` | WebSocket gateway (Socket.IO) |
| `prisma` | Cliente Prisma compartido |

---

## WebSockets — Eventos en Tiempo Real

| Dirección | Evento | Payload | Descripción |
|---|---|---|---|
| cliente → servidor | `register` | `{ userId }` | Asocia un userId al socket actual |
| servidor → cliente | `registered` | `{ socketId }` | Confirmación de registro |
| servidor → cliente | `request:new` | `ServiceRequest` | Nueva solicitud creada (broadcast) |
| servidor → cliente | `request:accepted` | `ServiceRequest` | Solicitud aceptada — notifica al cliente |
| servidor → cliente | `request:updated` | `ServiceRequest` | Actualización general (broadcast) |
| servidor → cliente | `request:status_changed` | `{ request, oldStatus, newStatus }` | Cambio de estado — notifica a cliente y proveedor |

---

## Instalación y Ejecución

### Prerequisitos

- Node.js 20+
- Docker + Docker Compose
- `openssl` (para generar secretos)

### 1. Clonar y configurar entorno

```bash
git clone <repo-url>
cd servicios-app

# Backend
cp backend/.env.example backend/.env
# Editar backend/.env: DATABASE_URL y JWT_SECRET

# Docker
cp infrastructure/.env.example infrastructure/.env
# Editar infrastructure/.env: POSTGRES_PASSWORD y JWT_SECRET
```

Generar JWT_SECRET seguro (mínimo 64 caracteres):

```bash
openssl rand -hex 64
```

### 2a. Ejecutar con Docker (recomendado)

```bash
cd infrastructure
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| Swagger UI | http://localhost:4000/api/docs |

### 2b. Ejecutar en local (desarrollo)

**Backend:**

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**Frontend** (terminal separada):

```bash
cd frontend
npm install
# Crear frontend/.env.local con NEXT_PUBLIC_API_URL y NEXT_PUBLIC_WS_URL
npm run dev
```

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secreto JWT (mín. 64 chars) | `openssl rand -hex 64` |
| `JWT_EXPIRES_IN` | Duración del token | `7d` |
| `PORT` | Puerto del servidor | `4000` |
| `FRONTEND_URL` | Origen permitido en CORS | `http://localhost:3000` |
| `NODE_ENV` | Entorno | `development` / `production` |

### Frontend (`frontend/.env.local`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend | `http://localhost:4000/api` |
| `NEXT_PUBLIC_WS_URL` | URL del servidor WebSocket | `http://localhost:4000` |

### Docker (`infrastructure/.env`)

| Variable | Descripción |
|---|---|
| `POSTGRES_USER` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL |
| `POSTGRES_DB` | Nombre de la base de datos |
| `JWT_SECRET` | Secreto JWT compartido con el backend |

---

## Datos de prueba (seed)

```bash
cd backend && npx prisma db seed
```

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@demo.com | admin123 |
| Cliente | cliente@demo.com | cliente123 |
| Proveedor | proveedor@demo.com | proveedor123 |

---

## Referencia de API

Documentación interactiva completa en: **`http://localhost:4000/api/docs`** (Swagger UI).

### Auth

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | Registrar usuario |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | Bearer | Perfil del usuario autenticado |

### Servicios

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/services` | Bearer | Listar catálogo activo |
| POST | `/api/services` | ADMIN | Crear servicio |
| PATCH | `/api/services/:id` | ADMIN | Actualizar servicio |
| DELETE | `/api/services/:id` | ADMIN | Desactivar servicio |

### Solicitudes

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/service-requests` | Bearer | Listar (filtradas por rol) |
| POST | `/api/service-requests` | CLIENTE | Crear solicitud |
| PATCH | `/api/service-requests/:id/accept` | PROVEEDOR | Aceptar solicitud |
| PATCH | `/api/service-requests/:id/status` | Bearer | Cambiar estado |
| GET | `/api/service-requests/history` | Bearer | Historial (FINALIZADA / CANCELADA) |
| GET | `/api/service-requests/stats` | ADMIN | Estadísticas por estado |

### Pagos y Calificaciones

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/payments/:id/simulate` | Bearer | Simular pago |
| POST | `/api/ratings` | CLIENTE | Calificar servicio finalizado |
| GET | `/api/ratings/provider/:id` | Bearer | Calificaciones de un proveedor |

---

## Testing

```bash
cd backend

# Todos los tests
npm test

# Con cobertura
npm run test:cov

# En modo watch
npm run test:watch
```

El proyecto incluye **55 tests** distribuidos en:

| Suite | Tipo | Qué verifica |
|---|---|---|
| `auth.service.spec.ts` | Unitario | bcrypt hash, JWT sign, validación de credenciales |
| `auth.controller.spec.ts` | Integración HTTP | POST /register, POST /login, GET /me con supertest |
| `service-requests.service.spec.ts` | Unitario | Máquina de estados — transiciones válidas e inválidas |
| `services.service.spec.ts` | Unitario | CRUD catálogo, soft-delete |
| `users.service.spec.ts` | Unitario | Perfil de usuario, listado admin |

---

## CI/CD — GitHub Actions

El workflow `.github/workflows/ci.yml` se ejecuta en cada push a `master` y en Pull Requests:

```
backend job (Node 20):
  ✓ npm ci
  ✓ npx prisma generate
  ✓ eslint --max-warnings 0
  ✓ jest (55 tests)
  ✓ jest --coverage
  ✓ nest build (tsc strict)

frontend job (Node 20):
  ✓ npm ci
  ✓ next build + tsc

docker job (depende de backend + frontend):
  ✓ docker compose config (valida sintaxis YAML)
```

---

## Docker

Los Dockerfiles usan **multi-stage builds** (builder → runner) para imágenes mínimas en producción:

```bash
# Construir y levantar todo
cd infrastructure
docker compose up --build

# Solo backend
docker build -f infrastructure/Dockerfile.backend -t harambal-backend backend/

# Solo frontend
docker build -f infrastructure/Dockerfile.frontend -t harambal-frontend frontend/
```

Healthchecks configurados en compose:
- **postgres**: `pg_isready` (interval: 10s)
- **backend**: `GET /api/health` (interval: 30s)
- **frontend**: espera a que backend esté healthy

---

## Despliegue en Producción

### Backend → Railway

1. Conectar el repositorio en Railway
2. Configurar variables en el panel:
   - `DATABASE_URL` (Railway provisiona PostgreSQL automáticamente)
   - `JWT_SECRET` (64+ chars, generado con `openssl rand -hex 64`)
   - `FRONTEND_URL` (URL de Vercel)
   - `NODE_ENV=production`
3. Railway detecta `Dockerfile.backend` automáticamente

### Frontend → Vercel

1. Conectar el repositorio; seleccionar `frontend/` como root directory
2. Configurar variables en Vercel:
   - `NEXT_PUBLIC_API_URL=https://<app>.railway.app/api`
   - `NEXT_PUBLIC_WS_URL=https://<app>.railway.app`
3. Vercel detecta Next.js automáticamente

---

## Seguridad

| Medida | Implementación |
|---|---|
| **XSS — token seguro** | JWT en cookie httpOnly vía BFF; JS no puede leerlo |
| **Password hashing** | bcrypt con salt rounds: 10 |
| **JWT firmado** | Secreto de mínimo 64 chars, expiración 7 días |
| **CORS restrictivo** | `FRONTEND_URL` env var; nunca `*` en producción |
| **Security headers** | Helmet con `contentSecurityPolicy: false` (Next.js gestiona CSP) |
| **Rate limiting** | ThrottlerGuard global: 10 req / 60 s por IP |
| **Validación de input** | `ValidationPipe(whitelist: true)` — rechaza propiedades extra |
| **Errores estructurados** | `GlobalExceptionFilter` — nunca expone stack traces |
| **Env vars** | `.env` excluido de git; `.env.example` como template |
| **Prisma P2002/P2025** | Traducidos a 409/404 por el filtro global |

---

## Roles del Sistema

| Rol | Capacidades |
|---|---|
| `CLIENTE` | Crear solicitudes, ver sus solicitudes, cancelar, calificar servicios finalizados |
| `PROVEEDOR` | Ver solicitudes disponibles, aceptar, cambiar estado (EN_PROCESO → FINALIZADA) |
| `ADMIN` | Ver todos los usuarios, estadísticas globales, gestionar catálogo de servicios |

---

*Desarrollado como proyecto full-stack de nivel producción — arquitectura enterprise, seguridad hardened, CI/CD completo.*
