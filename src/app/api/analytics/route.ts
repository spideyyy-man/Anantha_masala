import { NextRequest, NextResponse } from 'next/server';
import { recordConsentedAnalyticsEvent } from '@/domain/analytics/service';
import { analyticsEventSchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`analytics:${client}`, 120, 60_000);
  if (!rl.allowed) return jsonError('Too many analytics events.', 429);

  try {
    const body = await request.json();
    // Strict schema explicitly rejects any unexpected/PII properties
    const parsed = analyticsEventSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Invalid or non-compliant analytics payload (no PII allowed).', 400);
    }

    const res = await recordConsentedAnalyticsEvent(parsed.data);
    return NextResponse.json(res, { status: res.recorded ? 201 : 202 });
  } catch (err) {
    logServerError('POST /api/analytics', err);
    return jsonError('Could not record event.', 500);
  }
}
