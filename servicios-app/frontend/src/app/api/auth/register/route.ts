import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '../_backend';

export async function POST(req: NextRequest) {
  const body = await req.json();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/auth/register`, {
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

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  // Registration succeeds — return user info but DO NOT set the auth cookie.
  // The user must explicitly log in after creating their account.
  return NextResponse.json({
    message: 'Usuario creado correctamente',
    user: data.user,
  });
}
