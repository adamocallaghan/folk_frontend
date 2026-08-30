import { NextRequest, NextResponse } from 'next/server';
import { verifySession, getAuthCookieName } from '@/lib/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'https://folk-agent-workflows-897366780891.us-east1.run.app';

// Automatically retrieve GCP IAM ID token when running on Cloud Run
async function getGcpIdToken(audience: string): Promise<string | null> {
  try {
    const metaUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`;
    const res = await fetch(metaUrl, {
      headers: { 'Metadata-Flavor': 'Google' },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      return (await res.text()).trim();
    }
  } catch {
    // Fallback when running locally or if metadata server is not reachable
  }
  return null;
}

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // 1. Verify that incoming client request has a valid session cookie
  const cookieName = getAuthCookieName();
  const token = req.cookies.get(cookieName)?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized. Please login to access agent services.' },
      { status: 401 }
    );
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json(
      { error: 'Invalid or expired session. Please login again.' },
      { status: 401 }
    );
  }

  // 2. Construct backend destination URL
  const { path } = await params;
  const targetPath = path.join('/');
  const searchParams = req.nextUrl.search;
  const destinationUrl = `${BACKEND_URL}/api/${targetPath}${searchParams}`;

  // 3. Relay request securely to Cloud Run agent service
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Attach GCP Service-to-Service IAM Token
    const idToken = await getGcpIdToken(BACKEND_URL);
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    let bodyData: any = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const textBody = await req.text();
      if (textBody) {
        bodyData = textBody;
      }
    }

    const backendResponse = await fetch(destinationUrl, {
      method: req.method,
      headers,
      body: bodyData,
    });

    const responseData = await backendResponse.text();
    const status = backendResponse.status;

    return new NextResponse(responseData, {
      status,
      headers: {
        'Content-Type': backendResponse.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err: any) {
    console.error(`Proxy error to ${destinationUrl}:`, err);
    return NextResponse.json(
      { error: 'Failed to communicate with agent backend service', details: err.message },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, ctx);
}
