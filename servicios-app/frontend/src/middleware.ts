import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/'];

const ROLE_REDIRECT: Record<string, string> = {
  CLIENTE:   '/dashboard/client',
  PROVEEDOR: '/dashboard/provider',
  ADMIN:     '/dashboard/admin',
};

function decodeJwtRole(token: string): string | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    // Normalize base64url → base64 and decode (available in Edge Runtime)
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    const payload = JSON.parse(json) as Record<string, unknown>;
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

function roleDashboard(token: string): string {
  const role = decodeJwtRole(token);
  return (role && ROLE_REDIRECT[role]) ?? '/dashboard/client';
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  // No token + protected route → login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Authenticated + auth pages → role dashboard
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL(roleDashboard(token), request.url));
  }

  // Root → role dashboard
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL(roleDashboard(token), request.url));
  }

  // /dashboard → role-based redirect (was hardcoded to /client — BUG FIXED)
  if (pathname === '/dashboard') {
    const dest = token ? roleDashboard(token) : '/auth/login';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
