import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminMfa } from '@/domain/admin/service';
import { adminMfaVerifySchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`admin-mfa:${client}`, 10, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many MFA verification attempts.' }, { status: 429 });
  }

  try {
    const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!sessionToken) {
      return jsonError('No active sign-in session. Please log in again.', 401);
    }

    const body = await request.json();
    const parsed = adminMfaVerifySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Enter the 6-digit MFA code.', 400);
    }

    const verified = await verifyAdminMfa(sessionToken, parsed.data.code);
    if (!verified) {
      return jsonError('Invalid or expired MFA verification code.', 401);
    }

    const res = NextResponse.json({ ok: true, admin: verified.admin });
    // Session token rotated on MFA elevation
    res.cookies.set(ADMIN_SESSION_COOKIE, verified.rotatedToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (err) {
    logServerError('POST /api/admin/mfa', err);
    return jsonError('MFA verification failed.', 500);
  }
}
