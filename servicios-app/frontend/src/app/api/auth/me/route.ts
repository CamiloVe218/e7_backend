import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  let railwayRes: Response;
  try {
    railwayRes = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Sin conexión al servidor.' },
      { status: 503 },
    );
  }

  const data = await railwayRes.json();

  if (!railwayRes.ok) {
    const res = NextResponse.json(data, { status: railwayRes.status });
    res.cookies.delete('auth_token');
    return res;
  }

  // Return both user data and the token so React memory state can be hydrated on refresh
  return NextResponse.json({ user: data, token });
}
