import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { clearBootstrapCacheForTesting, ensureDbReady } from '@/db/bootstrap';
import { resetDbForTesting } from '@/db';
import { getProductBySlug } from '@/domain/catalog/service';
import {
  addToCart,
  ensureCartExists,
  getHydratedCart,
  setCartItemQuantity,
} from '@/domain/cart/service';
import {
  createGuestOrderFromCart,
  getOrderForCustomer,
  processVerifiedPaymentWebhook,
  triggerSandboxPaymentSimulation,
} from '@/domain/orders/service';
import {
  adminUpdateVariant,
  getAdminFromSessionToken,
  getAdminOverviewData,
  initiateAdminLogin,
  verifyAdminMfa,
} from '@/domain/admin/service';
import {
  recordConsentedAnalyticsEvent,
  upsertConsentPreference,
} from '@/domain/analytics/service';
import { analyticsEventSchema } from '@/lib/validation/schemas';
import { verifySameOriginRequest } from '@/lib/security/csrf';
import { checkRateLimit, clearRateLimitsForTesting } from '@/lib/security/rate-limit';

describe('Commerce Transactions, Webhooks, Security, RBAC/MFA & DPDP Privacy', () => {
  beforeAll(async () => {
    process.env.PGLITE_DATA_DIR = 'memory://';
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    await resetDbForTesting();
    clearBootstrapCacheForTesting();
    clearRateLimitsForTesting();
    await ensureDbReady();
  });

  afterAll(async () => {
    await resetDbForTesting();
    clearBootstrapCacheForTesting();
  });

  it('enforces server-authoritative cart, idempotent guest checkout, signed webhook capture, replay protection & IDOR protection', async () => {
    const sambar = await getProductBySlug('sambar-podi');
    expect(sambar).not.toBeNull();
    const variant = sambar!.variants[0]!;
    const initialStock = variant.stockQty;

    const cartId = await ensureCartExists();
    await addToCart(cartId, variant.id, 2); // 2 × ₹150 = ₹300 + ₹49 TN shipping = ₹349
    const hydrated = await getHydratedCart(cartId, 'Tamil Nadu');
    expect(hydrated.subtotalPaise).toBe(30000);
    expect(hydrated.shippingPaise).toBe(4900);
    expect(hydrated.totalPaise).toBe(34900);

    const idemKey = 'idem_test_order_001_unique';
    const order1 = await createGuestOrderFromCart({
      cartId,
      idempotencyKey: idemKey,
      customerName: 'Karthik Sundaram',
      customerPhone: '9840011223',
      shippingAddressLine1: '12 West Tower Street',
      shippingCity: 'Madurai',
      shippingState: 'Tamil Nadu',
      shippingPincode: '625001',
    });
    expect(order1.reusedIdempotent).toBe(false);
    expect(order1.totalPaise).toBe(34900);

    // Retry with exact same idempotencyKey MUST NOT double-charge or double-decrement stock
    const orderRetry = await createGuestOrderFromCart({
      cartId,
      idempotencyKey: idemKey,
      customerName: 'Karthik Sundaram',
      customerPhone: '9840011223',
      shippingAddressLine1: '12 West Tower Street',
      shippingCity: 'Madurai',
      shippingState: 'Tamil Nadu',
      shippingPincode: '625001',
    });
    expect(orderRetry.reusedIdempotent).toBe(true);
    expect(orderRetry.orderNumber).toBe(order1.orderNumber);

    const afterOrderProduct = await getProductBySlug('sambar-podi');
    expect(afterOrderProduct!.variants[0]!.stockQty).toBe(initialStock - 2);

    // Forged webhook signature MUST fail
    await expect(
      processVerifiedPaymentWebhook(
        JSON.stringify({
          eventId: 'forged_evt_1',
          eventType: 'payment.captured',
          providerOrderId: order1.paymentOrder.providerOrderId,
          providerPaymentId: 'fake_pay_1',
        }),
        'deadbeef0000forgedsignature'
      )
    ).rejects.toThrow(/Invalid webhook cryptographic signature/);

    // Valid signed sandbox webhook transitions order to confirmed + captured
    const webhookRes = await triggerSandboxPaymentSimulation(
      order1.orderNumber,
      'captured',
      'evt_capture_unique_01'
    );
    expect(webhookRes.duplicateReplay).toBe(false);

    // Replay exact same webhook eventId -> safely deduplicated
    const replayRes = await triggerSandboxPaymentSimulation(
      order1.orderNumber,
      'captured',
      'evt_capture_unique_01'
    );
    expect(replayRes.duplicateReplay).toBe(true);

    // IDOR check: wrong phone MUST NOT expose order
    const unauthorizedLookup = await getOrderForCustomer(order1.orderNumber, '9000099999');
    expect(unauthorizedLookup).toBeNull();

    // Matching phone returns verified confirmed order with masked phone
    const authorizedLookup = await getOrderForCustomer(order1.orderNumber, '9840011223');
    expect(authorizedLookup).not.toBeNull();
    expect(authorizedLookup!.paymentStatus).toBe('captured');
    expect(authorizedLookup!.status).toBe('confirmed');
    expect(authorizedLookup!.customerPhoneMasked).toBe('98******23');
  });

  it('restores reserved inventory when a signed payment.failed webhook arrives', async () => {
    const podi = await getProductBySlug('ellu-idli-podi');
    const variant = podi!.variants[0]!;
    const stockBefore = variant.stockQty;

    const cartId = await ensureCartExists();
    await addToCart(cartId, variant.id, 3);
    const created = await createGuestOrderFromCart({
      cartId,
      idempotencyKey: 'idem_test_failed_payment_002',
      customerName: 'Meena R',
      customerPhone: '9876543210',
      shippingAddressLine1: '45 Anna Nagar',
      shippingCity: 'Chennai',
      shippingState: 'Tamil Nadu',
      shippingPincode: '600040',
    });

    const duringReserve = await getProductBySlug('ellu-idli-podi');
    expect(duringReserve!.variants[0]!.stockQty).toBe(stockBefore - 3);

    await triggerSandboxPaymentSimulation(created.orderNumber, 'failed', 'evt_fail_02');

    const afterFail = await getProductBySlug('ellu-idli-podi');
    expect(afterFail!.variants[0]!.stockQty).toBe(stockBefore);
  });

  it('enforces Admin Login + MFA elevation + Session Rotation + Immutable Audit Trail', async () => {
    // Wrong password rejected
    const badLogin = await initiateAdminLogin('admin@aanandhamasala.in', 'wrong-pass-123');
    expect(badLogin).toBeNull();

    // Valid password produces MFA-pending session (not yet privileged!)
    const login = await initiateAdminLogin('admin@aanandhamasala.in', 'MaduraiAdmin#2026!');
    expect(login).not.toBeNull();
    expect(login!.devSandboxMfaCode).toMatch(/^\d{6}$/);

    // Session cannot access MFA-protected admin routes prior to MFA verification
    const preMfaAdmin = await getAdminFromSessionToken(login!.rawToken, true);
    expect(preMfaAdmin).toBeNull();

    // Verify 6-digit MFA -> rotates session token!
    const verified = await verifyAdminMfa(login!.rawToken, login!.devSandboxMfaCode!);
    expect(verified).not.toBeNull();
    expect(verified!.rotatedToken).not.toBe(login!.rawToken);

    // Old pre-MFA token is now invalid; rotated token grants access
    expect(await getAdminFromSessionToken(login!.rawToken, true)).toBeNull();
    const activeAdmin = await getAdminFromSessionToken(verified!.rotatedToken, true);
    expect(activeAdmin?.role).toBe('super_admin');

    // Audit log records variant mutation
    const manjal = await getProductBySlug('manjal-podi');
    const v = manjal!.variants[0]!;
    await adminUpdateVariant(activeAdmin!, {
      variantId: v.id,
      pricePaise: v.pricePaise,
      stockQty: 42,
      isOrderableOnline: true,
    });

    const overview = await getAdminOverviewData();
    expect(overview.recentAudit.some((e) => e.action === 'catalog.variant_updated')).toBe(true);
  });

  it('blocks analytics without DPDP consent and rejects PII fields in analytics payloads', async () => {
    const anonId = 'anon_privacy_test_001';
    const blocked = await recordConsentedAnalyticsEvent({
      anonymousId: anonId,
      eventName: 'product_view',
      path: '/products/sambar-podi',
      deviceClass: 'mobile',
      productSlug: 'sambar-podi',
    });
    expect(blocked.recorded).toBe(false);

    // Grant explicit consent -> analytics now allowed
    await upsertConsentPreference({
      anonymousId: anonId,
      analyticsAccepted: true,
      marketingAccepted: false,
    });
    const allowed = await recordConsentedAnalyticsEvent({
      anonymousId: anonId,
      eventName: 'product_view',
      path: '/products/sambar-podi',
      deviceClass: 'mobile',
      productSlug: 'sambar-podi',
    });
    expect(allowed.recorded).toBe(true);

    // Strict Zod schema MUST reject PII fields like customerPhone or email
    const piiAttempt = analyticsEventSchema.safeParse({
      anonymousId: anonId,
      eventName: 'product_view',
      path: '/products/sambar-podi',
      deviceClass: 'desktop',
      phone: '9843887337',
    });
    expect(piiAttempt.success).toBe(false);
  });

  it('blocks cross-site CSRF requests and enforces sliding-window rate limits', () => {
    const crossSiteReq = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        origin: 'https://evil-attacker.example',
        'sec-fetch-site': 'cross-site',
      },
    });
    expect(verifySameOriginRequest(crossSiteReq).ok).toBe(false);

    const sameSiteReq = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
        'sec-fetch-site': 'same-origin',
      },
    });
    expect(verifySameOriginRequest(sameSiteReq).ok).toBe(true);

    // Rate limit enforcement
    const key = 'test-rl-bucket';
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(false);
  });

  it('supports cart quantity updates, item removal, free shipping threshold transitions, and regional shipping calculation', async () => {
    const meen = await getProductBySlug('bhai-veetu-meen-masala');
    const manjal = await getProductBySlug('manjal-podi');
    expect(meen).not.toBeNull();
    expect(manjal).not.toBeNull();

    const meenVar = meen!.variants[0]!;
    const manjalVar = manjal!.variants[0]!;
    const meenPrice = meenVar.pricePaise!;
    const manjalPrice = manjalVar.pricePaise!;

    const cartId = await ensureCartExists();
    await addToCart(cartId, meenVar.id, 1);
    await addToCart(cartId, manjalVar.id, 2);

    const expectedInitialSubtotal = meenPrice + 2 * manjalPrice;
    let cart = await getHydratedCart(cartId, 'Tamil Nadu');
    expect(cart.itemCount).toBe(3);
    expect(cart.subtotalPaise).toBe(expectedInitialSubtotal);
    expect(cart.shippingPaise).toBe(4900); // ₹49 TN shipping below ₹499
    expect(cart.amountToFreeShippingPaise).toBe(49900 - expectedInitialSubtotal);

    // Rest of India shipping (Karnataka) is ₹79 below ₹499
    const karnatakaCart = await getHydratedCart(cartId, 'Karnataka');
    expect(karnatakaCart.shippingPaise).toBe(7900);

    // Update Meen Masala quantity from 1 -> 3 (exceeds ₹499 threshold -> FREE shipping)
    await setCartItemQuantity(cartId, meenVar.id, 3);
    cart = await getHydratedCart(cartId, 'Tamil Nadu');
    expect(cart.itemCount).toBe(5);
    expect(cart.subtotalPaise).toBe(3 * meenPrice + 2 * manjalPrice);
    expect(cart.shippingPaise).toBe(0);
    expect(cart.amountToFreeShippingPaise).toBe(0);

    // Remove Manjal Podi (quantity = 0)
    await setCartItemQuantity(cartId, manjalVar.id, 0);
    cart = await getHydratedCart(cartId, 'Tamil Nadu');
    expect(cart.items.length).toBe(1);
    expect(cart.items[0]!.variantId).toBe(meenVar.id);
    expect(cart.subtotalPaise).toBe(3 * meenPrice);
    expect(cart.shippingPaise).toBe(0);
  });
});
