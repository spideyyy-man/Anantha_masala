import { NextResponse } from 'next/server';

/**
 * Validates same-origin CSRF protection for state-changing requests.
 * Rejects cross-site browser requests while allowing legitimate same-origin fetch/form requests.
 */
export function verifySameOriginRequest(request: Request): { ok: true } | { ok: false; reason: string } {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { ok: true };
  }

  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return { ok: false, reason: 'Cross-site request blocked by CSRF policy.' };
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return { ok: false, reason: 'Origin header mismatch.' };
      }
    } catch {
      return { ok: false, reason: 'Malformed Origin header.' };
    }
  }

  return { ok: true };
}

export function jsonError(message: string, status = 400, details?: Record<string, string[]>) {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { fieldErrors: details } : {}),
    },
    { status }
  );
}

export function logServerError(context: string, err: unknown): void {
  const safeMessage = err instanceof Error ? err.message : 'Unknown error';
  // Structured error logging without leaking stack traces to API responses or printing secrets
  console.error(
    JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      context,
      message: safeMessage,
    })
  );
}
