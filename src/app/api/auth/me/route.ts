import { NextRequest, NextResponse } from 'next/server';
import { verifySession, getAuthCookieName } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const cookieName = getAuthCookieName();
  const token = req.cookies.get(cookieName)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: session });
}
