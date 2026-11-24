import { NextRequest, NextResponse } from 'next/server';
import {
  addToCart,
  CART_COOKIE_NAME,
  clearCart,
  ensureCartExists,
  getHydratedCart,
  setCartItemQuantity,
} from '@/domain/cart/service';
import { cartAddSchema, cartMutateSchema } from '@/lib/validation/schemas';
import { jsonError, logServerError, verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

function attachCartCookie(res: NextResponse, cartId: string) {
  res.cookies.set(CART_COOKIE_NAME, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

export async function GET(request: NextRequest) {
  try {
    const cartId = request.cookies.get(CART_COOKIE_NAME)?.value;
    const state = request.nextUrl.searchParams.get('state') || undefined;
    const cart = await getHydratedCart(cartId, state);
    return NextResponse.json(cart);
  } catch (err) {
    logServerError('GET /api/cart', err);
    return jsonError('Could not load cart.', 500);
  }
}

export async function POST(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`cart:${client}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many cart updates. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = cartAddSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Invalid cart request.', 400, parsed.error.flatten().fieldErrors);
    }

    const existingId = request.cookies.get(CART_COOKIE_NAME)?.value;
    const cartId = await ensureCartExists(existingId);
    const updatedCart = await addToCart(cartId, parsed.data.variantId, parsed.data.quantity);
    return attachCartCookie(NextResponse.json(updatedCart), cartId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unable to add item to cart.';
    if (msg.includes('out of stock') || msg.includes('enquiry') || msg.includes('not found')) {
      return jsonError(msg, 400);
    }
    logServerError('POST /api/cart', err);
    return jsonError('Unable to update cart right now.', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  const client = getClientIdentifier(request);
  const rl = checkRateLimit(`cart:${client}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many cart updates. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = cartMutateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Invalid quantity update.', 400, parsed.error.flatten().fieldErrors);
    }

    const existingId = request.cookies.get(CART_COOKIE_NAME)?.value;
    const cartId = await ensureCartExists(existingId);
    const updatedCart = await setCartItemQuantity(cartId, parsed.data.variantId, parsed.data.quantity);
    return attachCartCookie(NextResponse.json(updatedCart), cartId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unable to update item quantity.';
    if (msg.includes('available') || msg.includes('cannot be updated')) {
      return jsonError(msg, 400);
    }
    logServerError('PATCH /api/cart', err);
    return jsonError('Unable to update cart right now.', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const csrf = verifySameOriginRequest(request);
  if (!csrf.ok) return jsonError(csrf.reason, 403);

  try {
    const cartId = request.cookies.get(CART_COOKIE_NAME)?.value;
    if (cartId) {
      await clearCart(cartId);
    }
    const cart = await getHydratedCart(cartId);
    return NextResponse.json(cart);
  } catch (err) {
    logServerError('DELETE /api/cart', err);
    return jsonError('Unable to clear cart.', 500);
  }
}
