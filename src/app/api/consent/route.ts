import { NextRequest, NextResponse } from 'next/server';
import { upsertConsentPreference } from '@/domain/analytics/service';
import { consentSchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`consent:${client}`, 30, 60_000);
  if (!rl.allowed) return jsonError('Too many requests.', 429);

  try {
    const body = await request.json();
    const parsed = consentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Invalid consent preference payload.', 400);
    }

    await upsertConsentPreference(parsed.data);
    return NextResponse.json({ ok: true, saved: parsed.data });
  } catch (err) {
    logServerError('POST /api/consent', err);
    return jsonError('Could not save privacy preferences.', 500);
  }
}
