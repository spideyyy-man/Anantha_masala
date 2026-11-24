import { NextRequest, NextResponse } from 'next/server';
import { processVerifiedPaymentWebhook } from '@/domain/orders/service';
import { jsonError, logServerError } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`webhook:${client}`, 100, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many webhook requests' }, { status: 429 });
  }

  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-razorpay-signature') ||
      request.headers.get('x-sandbox-signature') ||
      '';

    if (!signature) {
      return jsonError('Missing webhook signature header.', 401);
    }

    const result = await processVerifiedPaymentWebhook(rawBody, signature);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook processing error.';
    if (msg.includes('Invalid webhook cryptographic signature')) {
      return jsonError(msg, 401);
    }
    if (msg.includes('Malformed') || msg.includes('not found')) {
      return jsonError(msg, 400);
    }
    logServerError('POST /api/webhooks/payments', err);
    return jsonError('Webhook processing failed.', 500);
  }
}
