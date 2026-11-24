import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, initiateAdminLogin } from '@/domain/admin/service';
import { adminLoginSchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`admin-login:${client}`, 8, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Please wait a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Enter a valid admin email and password.', 400);
    }

    const result = await initiateAdminLogin(parsed.data.email, parsed.data.password);
    if (!result) {
      return jsonError('Invalid credentials.', 401);
    }

    const res = NextResponse.json({
      mfaRequired: true,
      email: result.email,
      ...(result.devSandboxMfaCode ? { devSandboxMfaCode: result.devSandboxMfaCode } : {}),
    });

    res.cookies.set(ADMIN_SESSION_COOKIE, result.rawToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (err) {
    logServerError('POST /api/admin/login', err);
    return jsonError('Unable to complete sign-in.', 500);
  }
}
