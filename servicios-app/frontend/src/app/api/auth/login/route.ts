import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '../_backend';

export async function POST(req: NextRequest) {
  const body = await req.json();

  let railwayRes: Response;
  try {
    railwayRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: 'No se pudo conectar con el servidor. Verifica tu conexión.' },
      { status: 503 },
    );
  }

  const data = await railwayRes.json();

  if (!railwayRes.ok) {
    return NextResponse.json(data, { status: railwayRes.status });
  }

  const res = NextResponse.json(data);
  res.cookies.set('auth_token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return res;
}
