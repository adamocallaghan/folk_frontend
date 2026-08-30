import { NextRequest, NextResponse } from 'next/server';
import { signSession, getAdminPassword, getStudentPin, getAuthCookieName, UserSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, role } = body;

    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    const adminPass = getAdminPassword();
    const studentPin = getStudentPin();

    let authenticatedRole: 'teacher' | 'student' | null = null;

    if (role === 'teacher' || (!role && (trimmedUser === 'admin' || trimmedUser === 'teacher'))) {
      if (trimmedPass === adminPass) {
        authenticatedRole = 'teacher';
      }
    } else if (role === 'student' || (!role && trimmedUser.toLowerCase().includes('student'))) {
      if (trimmedPass === studentPin || trimmedPass === adminPass) {
        authenticatedRole = 'student';
      }
    } else {
      // Fallback check
      if (trimmedPass === adminPass) {
        authenticatedRole = 'teacher';
      } else if (trimmedPass === studentPin) {
        authenticatedRole = 'student';
      }
    }

    if (!authenticatedRole) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // 7-day session validity
    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const sessionPayload: UserSession = {
      username: trimmedUser || (authenticatedRole === 'teacher' ? 'Teacher Admin' : 'Student'),
      role: authenticatedRole,
      exp,
    };

    const token = await signSession(sessionPayload);
    const cookieName = getAuthCookieName();

    const response = NextResponse.json({
      status: 'success',
      user: sessionPayload,
      redirect: authenticatedRole === 'teacher' ? '/teacher/curriculum' : '/student',
    });

    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
