import { NextRequest, NextResponse } from 'next/server';
import { getOrderForCustomer } from '@/domain/orders/service';
import { orderTrackSchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`order-track:${client}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many order lookup attempts. Please wait a minute.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = orderTrackSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        'Enter both your Order ID and the 10-digit mobile number used at checkout.',
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const order = await getOrderForCustomer(parsed.data.orderNumber, parsed.data.phone);
    if (!order) {
      return jsonError('No matching order found for that Order ID and mobile number.', 404);
    }

    return NextResponse.json({ order });
  } catch (err) {
    logServerError('POST /api/orders/track', err);
    return jsonError('Unable to check order status right now.', 500);
  }
}
