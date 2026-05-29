# Contributing to Harambal Servicios

Thank you for your interest in contributing. This document provides guidelines for development workflow, code standards, and the review process.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Branch Strategy](#branch-strategy)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20.x |
| npm | ≥ 10.x |
| Docker | ≥ 24.x |
| PostgreSQL | ≥ 15.x |

### Local Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd servicios-app

# 2. Install backend dependencies
cd backend && npm install

# 3. Configure environment
cp ../infrastructure/.env.example ../.env

# 4. Run database and push schema
cd ../infrastructure && docker compose up postgres -d
cd ../backend && npx prisma migrate dev && npx prisma db seed

# 5. Install frontend dependencies and start
cd ../frontend && npm install && npm run dev

# 6. Start backend
cd ../backend && npm run start:dev
```

---

## Development Workflow

1. Create a branch from `master` following the [Branch Strategy](#branch-strategy)
2. Implement changes with tests
3. Ensure CI passes locally before pushing:
   ```bash
   npm run lint && npx tsc --noEmit && npm test && npm run build
   ```
4. Open a pull request against `master`
5. Address review comments
6. Merge only after approval and green CI

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change without new feature or bug fix |
| `test` | Adding or fixing tests |
| `docs` | Documentation only |
| `chore` | Tooling, CI, dependencies |
| `perf` | Performance improvement |
| `security` | Security hardening |
| `infra` | Infrastructure / Docker / deployment |

### Examples

```
feat(ratings): add weighted average calculation for provider score
fix(auth): prevent token reuse after password change
test(service-requests): add integration tests for status transitions
security(throttler): reduce login rate limit to 5 req/min
```

---

## Branch Strategy

```
master          ← production-ready code only
  └── feature/<ticket>-short-description
  └── fix/<ticket>-short-description
  └── chore/<ticket>-short-description
```

- Branch names use kebab-case
- Include ticket/issue number when applicable
- Keep branches short-lived (< 5 days)
- Rebase onto `master` before opening PR

---

## Code Standards

### TypeScript

- **No `any` types** in production code — use proper interfaces or Prisma types
- Use `AuthenticatedUser` from `shared/types/user.types.ts` for `@CurrentUser()` parameters
- All DTOs must use `class-validator` decorators and `@Transform` for string sanitization
- Prefer `Pick<T, ...>` and `Partial<T>` over ad-hoc inline types

### NestJS

- One module per domain — no cross-module imports except through exported services
- Repository pattern for all database access
- All business logic in services; controllers are thin routing layers
- Use `@ApiOperation`, `@ApiTags`, and `@ApiParam` on every endpoint
- Protected routes must declare `@UseGuards(JwtAuthGuard)` explicitly (no magic globals)

### Prisma

- Migrations go through `prisma migrate dev` — never modify the database directly
- Add indexes for every foreign key and high-cardinality filter column
- Use `select` projections; never return raw Prisma objects with passwords included

### Formatting

The project uses ESLint. Run before committing:

```bash
npm run lint
```

---

## Testing Requirements

### Coverage Thresholds (enforced in CI)

| Metric | Minimum |
|--------|---------|
| Statements | 60% |
| Branches | 60% |
| Functions | 55% |
| Lines | 60% |

### What to test

| Layer | Test type | Location |
|-------|-----------|----------|
| Services | Unit (mock Prisma) | `src/**/__tests__/*.service.spec.ts` |
| Controllers | Unit (mock service) | `src/**/__tests__/*.controller.spec.ts` |
| Guards / Strategies | Unit | `src/auth/__tests__/` |
| HTTP layer | Integration (supertest) | `src/**/__tests__/*.integration.spec.ts` |
| Exception filter | Unit | `src/filters/__tests__/` |

### Running tests

```bash
# Unit tests
npm test

# With coverage
npm run test:cov

# Watch mode during development
npm run test:watch
```

---

## Pull Request Process

1. **Title**: Follow commit convention (`feat(scope): description`)
2. **Description**: Include what changed, why, and how to test
3. **Checklist** before marking ready for review:
   - [ ] `npm run lint` passes
   - [ ] `npx tsc --noEmit` passes
   - [ ] `npm test` passes (all existing tests still green)
   - [ ] New code has tests
   - [ ] Coverage not degraded
   - [ ] No secrets in code or environment files
   - [ ] Swagger annotations updated for new/changed endpoints
4. **Review**: Minimum 1 approval required
5. **Merge**: Squash merge preferred for feature branches; merge commit for release branches

---

## Security

- **Never commit** `.env` files, API keys, JWT secrets, or credentials
- **Never store** secrets in code — always use `ConfigService` and environment variables
- **Report vulnerabilities** privately to the maintainers before opening a public issue
- All new endpoints must be protected with `JwtAuthGuard` unless explicitly public
- Rate limiting is applied globally (60 req/min) and more strictly on auth routes (3–5 req/min)
- Input validation (`class-validator`) and sanitization (`@Transform`) are required in all DTOs

---

## Questions

Open a [GitHub Discussion](../../discussions) for general questions, or a [GitHub Issue](../../issues) for bugs and feature requests.
