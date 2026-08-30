import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const cookieName = getAuthCookieName();
  const response = NextResponse.json({ status: 'success', message: 'Logged out' });

  response.cookies.set({
    name: cookieName,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
