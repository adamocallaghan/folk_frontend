import { NextRequest, NextResponse } from 'next/server';
import { verifySession, getAuthCookieName } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/favicon.ico'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets and public auth endpoints are always allowed
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const cookieName = getAuthCookieName();
  const token = req.cookies.get(cookieName)?.value;

  let session = null;
  if (token) {
    session = await verifySession(token);
  }

  // If user is unauthenticated and accessing root or protected pages, redirect to /login
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user visits /login, redirect to their home
  if (pathname === '/login' && session) {
    const homeUrl = session.role === 'teacher' ? '/teacher/curriculum' : '/student';
    return NextResponse.redirect(new URL(homeUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
