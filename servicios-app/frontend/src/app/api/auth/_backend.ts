// Server-only — never imported client-side.
// BACKEND_URL is used by BFF routes to reach the NestJS backend.
// In Docker: BACKEND_URL=http://backend:4000/api (internal container name)
// In dev:    BACKEND_URL=http://localhost:4000/api (default)
export const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api';
