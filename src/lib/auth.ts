import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'folk_session_token';
const DEFAULT_AUTH_SECRET = 'folk_super_secret_auth_token_key_2026_hackathon';

export interface UserSession {
  username: string;
  role: 'teacher' | 'student';
  exp: number;
}

export function getAuthSecret(): string {
  return process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'folk-admin-2026';
}

export function getStudentPin(): string {
  return process.env.STUDENT_PIN || 'student123';
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
}

// Simple Web-Crypto based token signing for Edge & Node compatibility
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

export async function signSession(session: UserSession): Promise<string> {
  const secret = getAuthSecret();
  const key = await getCryptoKey(secret);
  const enc = new TextEncoder();

  const payloadStr = JSON.stringify(session);
  const payloadB64 = base64UrlEncode(payloadStr);

  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigArray = Array.from(new Uint8Array(sigBuffer));
  const sigB64 = base64UrlEncode(String.fromCharCode(...sigArray));

  return `${payloadB64}.${sigB64}`;
}

export async function verifySession(token: string): Promise<UserSession | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, sigB64] = parts;
    const secret = getAuthSecret();
    const key = await getCryptoKey(secret);
    const enc = new TextEncoder();

    const expectedSigRaw = base64UrlDecode(sigB64);
    const expectedSigBytes = new Uint8Array(
      expectedSigRaw.split('').map((c) => c.charCodeAt(0))
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      expectedSigBytes,
      enc.encode(payloadB64)
    );

    if (!valid) return null;

    const payloadStr = base64UrlDecode(payloadB64);
    const session: UserSession = JSON.parse(payloadStr);

    if (Date.now() > session.exp) return null;

    return session;
  } catch (err) {
    return null;
  }
}
