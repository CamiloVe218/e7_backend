# Harambal — Marketplace de Servicios a Domicilio

Sistema profesional de contratación de mano de obra local. Los clientes publican solicitudes de servicio, los proveedores las aceptan y ejecutan, los pagos quedan registrados y las calificaciones cierran el ciclo.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, Passport JWT |
| Base de datos | PostgreSQL 15 (Prisma ORM) |
| Tiempo real | Socket.IO (WebSockets) |
| Autenticación | JWT Bearer tokens + bcrypt |
| Documentación | Swagger / OpenAPI (`/api/docs`) |
| Infraestructura | Docker Compose, Dockerfiles multi-stage |
| CI/CD | GitHub Actions |
| Despliegue | Railway (backend) + Vercel (frontend) |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│              Next.js 14 App Router + Tailwind CSS               │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│   │ /auth/login  │  │ /dashboard/  │  │  WebSocket (Socket.IO│ │
│   │ /auth/reg..  │  │ client       │  │  cliente)            │ │
│   │              │  │ provider     │  │                      │ │
│   │              │  │ admin        │  └──────────────────────┘ │
│   └──────────────┘  └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
              │ HTTP (REST + JWT Bearer)    │ WS
              ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (NestJS 10)                         │
│                                                                 │
│  ┌──────────┐ ┌───────────────┐ ┌──────────┐ ┌─────────────┐  │
│  │   auth   │ │service-request│ │ services │ │  providers  │  │
│  │          │ │  (state mach.)│ │(catalog) │ │  (profiles) │  │
│  └──────────┘ └───────────────┘ └──────────┘ └─────────────┘  │
│  ┌──────────┐ ┌───────────────┐ ┌────────────────────────────┐ │
│  │ payments │ │    ratings    │ │  notifications (WS Gateway)│ │
│  │(simul.)  │ │               │ │                            │ │
│  └──────────┘ └───────────────┘ └────────────────────────────┘ │
│                       │ Prisma ORM                              │
└───────────────────────┼─────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL 15                                 │
│  users · providers · services · service_requests                │
│  payments · ratings · availability                              │
└─────────────────────────────────────────────────────────────────┘
```

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

## Flujo de Autenticación JWT

```
Cliente                     Backend
  │                            │
  │  POST /api/auth/register   │
  │ ──────────────────────────►│
  │                            │  bcrypt.hash(password)
  │                            │  prisma.user.create()
  │                            │  jwtService.sign({ sub, email, role })
  │  { user, token: JWT }      │
  │ ◄──────────────────────────│
  │                            │
  │  GET /api/... + Bearer JWT │
  │ ──────────────────────────►│
  │                            │  JwtAuthGuard → passport-jwt
  │                            │  JwtStrategy.validate() → prisma.user
  │                            │  @CurrentUser() inyecta usuario
  │  Respuesta protegida       │
  │ ◄──────────────────────────│
```

---

## Máquina de Estados — Solicitudes de Servicio

```
                ┌───────────┐
   CREAR ──────►│ PENDIENTE │
                └─────┬─────┘
                      │ Proveedor acepta
                      ▼
                ┌───────────┐
                │  ACEPTADA │
                └─────┬─────┘
                      │ Proveedor inicia
                      ▼
                ┌───────────┐
                │ EN_PROCESO│
                └─────┬─────┘
                      │ Proveedor finaliza
                      ▼
                ┌───────────┐
                │ FINALIZADA│
                └───────────┘
  (CANCELADA es válido desde PENDIENTE, ACEPTADA o EN_PROCESO)
```

---

## WebSockets — Eventos en Tiempo Real

| Evento (cliente → servidor) | Descripción |
|---|---|
| `register` | Asocia un `userId` al socket actual |

| Evento (servidor → cliente) | Descripción |
|---|---|
| `registered` | Confirmación de registro del socket |
| `request:new` | Nueva solicitud creada (broadcast) |
| `request:accepted` | Solicitud aceptada → notifica al cliente |
| `request:updated` | Solicitud actualizada (broadcast) |
| `request:status_changed` | Cambio de estado → notifica a cliente y proveedor |

---

## Estructura del Proyecto

```
servicios-app/
├── backend/
│   ├── src/
│   │   ├── auth/                  # JWT strategy, guards, decoradores
│   │   │   ├── __tests__/         # Unit + integration tests
│   │   │   ├── decorators/
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── strategies/
│   │   ├── service-requests/      # Dominio principal
│   │   │   ├── __tests__/
│   │   │   ├── dto/
│   │   │   └── repositories/      # Repository pattern (Prisma)
│   │   ├── services/              # Catálogo de servicios
│   │   ├── providers/             # Perfiles de proveedores
│   │   ├── payments/              # Pagos simulados
│   │   ├── ratings/               # Calificaciones
│   │   ├── notifications/         # WebSocket gateway
│   │   └── prisma/                # PrismaService global
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── auth/              # Login, registro
│       │   └── dashboard/         # Dashboards por rol
│       ├── components/            # UI components reutilizables
│       ├── contexts/              # AuthContext + estado global
│       ├── hooks/                 # useSocket
│       ├── lib/                   # api.ts, socket.ts, utils.ts
│       └── middleware.ts          # Protección de rutas Next.js
├── infrastructure/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend         # Multi-stage (build + production)
│   ├── Dockerfile.frontend        # Multi-stage
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   └── PATTERNS.md
└── .github/
    └── workflows/
        └── ci.yml                 # Lint + test + build (backend y frontend)
```

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

# Entorno del backend
cp backend/.env.example backend/.env
# Editar backend/.env — configurar DATABASE_URL y JWT_SECRET

# Entorno de Docker
cp infrastructure/.env.example infrastructure/.env
# Editar infrastructure/.env — configurar POSTGRES_PASSWORD y JWT_SECRET
```

Generar un JWT_SECRET seguro:

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
npm run dev
```

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
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

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@demo.com | admin123 |
| Cliente | cliente@demo.com | cliente123 |
| Proveedor | proveedor@demo.com | proveedor123 |

```bash
cd backend
npx prisma db seed
```

---

## Referencia de API

Documentación interactiva completa en: **`http://localhost:4000/api/docs`** (Swagger UI).

### Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | Registrar usuario |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | Bearer | Perfil del usuario autenticado |
| GET | `/api/services` | Bearer | Catálogo de servicios |
| GET | `/api/service-requests` | Bearer | Listar solicitudes (filtradas por rol) |
| POST | `/api/service-requests` | CLIENTE | Crear solicitud |
| PATCH | `/api/service-requests/:id/accept` | PROVEEDOR | Aceptar solicitud |
| PATCH | `/api/service-requests/:id/status` | Bearer | Cambiar estado |
| GET | `/api/service-requests/history` | Bearer | Historial (FINALIZADA / CANCELADA) |
| GET | `/api/service-requests/stats` | ADMIN | Estadísticas por estado |
| POST | `/api/payments/:id/simulate` | Bearer | Simular pago |
| POST | `/api/ratings` | CLIENTE | Calificar servicio finalizado |
| GET | `/api/ratings/provider/:id` | Bearer | Calificaciones de un proveedor |

---

## Testing

```bash
cd backend

# Tests unitarios
npm test

# Con reporte de cobertura
npm run test:cov

# En modo watch (desarrollo)
npm run test:watch
```

El proyecto incluye:

- **Tests unitarios** — `AuthService`, `ServiceRequestsService` (máquina de estados, transacciones), `ServicesService`, `UsersService`
- **Tests de integración** — capa HTTP de `auth` usando supertest + NestJS TestingModule (sin base de datos real, compatible con CI)

---

## CI/CD — GitHub Actions

El workflow `.github/workflows/ci.yml` se ejecuta en cada push a `master/main/develop` y en Pull Requests:

```
backend job:
  ✓ npm ci
  ✓ npx prisma generate
  ✓ eslint
  ✓ jest (unit + integration)
  ✓ jest --coverage
  ✓ nest build

frontend job:
  ✓ npm ci
  ✓ next build

docker job (after backend + frontend):
  ✓ docker compose config (valida sintaxis)
```

---

## Docker

Los Dockerfiles usan **multi-stage builds**:

```bash
# Construir y levantar todos los servicios
cd infrastructure
docker compose up --build

# Solo el backend
docker build -f infrastructure/Dockerfile.backend -t harambal-backend backend/

# Solo el frontend
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
2. Configurar las variables de entorno en el panel de Railway:
   - `DATABASE_URL` (Railway provisiona PostgreSQL automáticamente)
   - `JWT_SECRET`
   - `FRONTEND_URL` (URL de Vercel)
   - `NODE_ENV=production`
3. Railway detecta el `Dockerfile.backend` automáticamente

### Frontend → Vercel

1. Conectar el repositorio en Vercel, seleccionando `frontend/` como root directory
2. Configurar variables de entorno en Vercel:
   - `NEXT_PUBLIC_API_URL=https://<tu-backend>.railway.app/api`
   - `NEXT_PUBLIC_WS_URL=https://<tu-backend>.railway.app`
3. Vercel detecta Next.js automáticamente

---

## Patrones de Diseño

| Patrón | Dónde | Por qué |
|---|---|---|
| Repository Pattern | `service-requests/repositories/` | Desacopla el acceso a Prisma del servicio |
| Strategy Pattern | `auth/strategies/jwt.strategy.ts` | Passport-JWT encapsula la estrategia de autenticación |
| Guard Pattern | `auth/guards/` | Separación entre autenticación y autorización |
| Decorator Pattern | `auth/decorators/` | `@CurrentUser()` extrae el usuario del request |
| State Machine | `service-requests.service.ts` | `validTransitions` define transiciones legales de estado |
| Module Pattern | Toda la aplicación | Encapsulación por dominio en NestJS |

Ver [docs/PATTERNS.md](docs/PATTERNS.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalles adicionales.

---

## Roles del Sistema

| Rol | Capacidades |
|---|---|
| `CLIENTE` | Crear solicitudes, ver sus solicitudes, cancelar, calificar servicios |
| `PROVEEDOR` | Ver solicitudes disponibles, aceptar, cambiar estado (EN_PROCESO, FINALIZADA) |
| `ADMIN` | Ver todos los usuarios, estadísticas, gestionar catálogo de servicios |

---

## Seguridad

- Contraseñas hasheadas con **bcrypt** (salt rounds: 10)
- Tokens JWT firmados con secreto de mínimo 64 caracteres
- CORS restringido a orígenes configurados (no `*`)
- WebSocket CORS alineado con la misma política que HTTP
- `ValidationPipe` con `whitelist: true` — rechaza propiedades no declaradas en DTOs
- `.env` excluido de git mediante `.gitignore`

---

*Desarrollado como proyecto profesional full-stack — listo para revisión académica y portafolio.*
