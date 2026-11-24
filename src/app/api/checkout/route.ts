import { NextRequest, NextResponse } from 'next/server';
import { CART_COOKIE_NAME } from '@/domain/cart/service';
import { createGuestOrderFromCart } from '@/domain/orders/service';
import { guestCheckoutSchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`checkout:${client}`, 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many checkout attempts. Please wait a minute and retry.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const cartId = request.cookies.get(CART_COOKIE_NAME)?.value;
    if (!cartId) {
      return jsonError('Your shopping cart is empty or has expired.', 400);
    }

    const body = await request.json();
    const parsed = guestCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        'Please fix the highlighted checkout details.',
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const created = await createGuestOrderFromCart({
      cartId,
      ...parsed.data,
    });

    return NextResponse.json(created, { status: created.reusedIdempotent ? 200 : 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Checkout failed.';
    if (
      msg.includes('cart is empty') ||
      msg.includes('Insufficient stock') ||
      msg.includes('Stock changed') ||
      msg.includes('enquiry-only')
    ) {
      return jsonError(msg, 400);
    }
    logServerError('POST /api/checkout', err);
    return jsonError('Unable to process checkout right now. Please try again.', 500);
  }
}
