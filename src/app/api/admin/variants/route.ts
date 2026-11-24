import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  adminUpdateVariant,
  getAdminFromSessionToken,
} from '@/domain/admin/service';
import { adminVariantUpdateSchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const admin = await getAdminFromSessionToken(token, true);
    if (!admin) return jsonError('Unauthorized.', 401);

    const body = await request.json();
    const parsed = adminVariantUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Invalid variant update payload.', 400, parsed.error.flatten().fieldErrors);
    }

    const updated = await adminUpdateVariant(admin, parsed.data);
    return NextResponse.json({ ok: true, variant: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed.';
    if (msg.includes('Forbidden')) return jsonError(msg, 403);
    if (msg.includes('not found')) return jsonError(msg, 404);
    logServerError('PATCH /api/admin/variants', err);
    return jsonError('Could not update variant.', 500);
  }
}
