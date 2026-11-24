import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, revokeAdminSession } from '@/domain/admin/service';
import { verifySameOriginRequest, jsonError } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  await revokeAdminSession(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
