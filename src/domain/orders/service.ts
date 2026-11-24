import crypto from 'node:crypto';
import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { ensureDbReady } from '@/db/bootstrap';
import {
  cartItems,
  orderItems,
  orders,
  payments,
  paymentWebhookEvents,
  products,
  productVariants,
} from '@/db/schema';
import { calculateShippingPaise, clearCart } from '@/domain/cart/service';
import {
  getPaymentProviderAdapter,
  signSandboxWebhookBody,
  type ProviderOrderResult,
} from '@/domain/payments/adapter';
import { normalizeIndianPhone } from '@/lib/validation/schemas';
import { sha256Hex } from '@/lib/security/crypto';

export interface CreateGuestOrderInput {
  cartId: string;
  idempotencyKey: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  deliveryNotes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface CreatedOrderResponse {
  reusedIdempotent: boolean;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  paymentOrder: ProviderOrderResult;
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getUTCFullYear().toString().slice(-2);
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `AM${y}${m}${d}-${rand}`;
}

export async function createGuestOrderFromCart(
  input: CreateGuestOrderInput
): Promise<CreatedOrderResponse> {
  await ensureDbReady();
  const db = getDb();
  const adapter = getPaymentProviderAdapter();

  // 1. Idempotency check — duplicate submit / retry returns existing order without charging twice!
  const existingOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.idempotencyKey, input.idempotencyKey))
    .limit(1);

  if (existingOrder[0]) {
    const ord = existingOrder[0];
    return {
      reusedIdempotent: true,
      orderNumber: ord.orderNumber,
      status: ord.status,
      paymentStatus: ord.paymentStatus,
      subtotalPaise: ord.subtotalPaise,
      shippingPaise: ord.shippingPaise,
      totalPaise: ord.totalPaise,
      paymentOrder: {
        provider: ord.paymentProvider === 'razorpay' ? 'razorpay' : 'sandbox',
        mode: ord.paymentProvider === 'razorpay' ? 'live' : 'sandbox',
        providerOrderId: ord.providerOrderId || '',
        publicKeyId: process.env.RAZORPAY_KEY_ID || null,
        amountPaise: ord.totalPaise,
        currency: 'INR',
      },
    };
  }

  // 2. Server-authoritative cart read & stock verification
  const rows = await db
    .select({
      quantity: cartItems.quantity,
      variantId: productVariants.id,
      sku: productVariants.sku,
      variantLabel: productVariants.label,
      pricePaise: productVariants.pricePaise,
      stockQty: productVariants.stockQty,
      isOrderableOnline: productVariants.isOrderableOnline,
      productName: products.name,
      tamilName: products.tamilName,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, input.cartId));

  if (rows.length === 0) {
    throw new Error('Your cart is empty. Please add items before checking out.');
  }

  let subtotalPaise = 0;
  for (const row of rows) {
    if (!row.isOrderableOnline || row.pricePaise === null) {
      throw new Error(`${row.productName} is currently enquiry-only and cannot be checked out online.`);
    }
    if (row.quantity <= 0 || row.quantity > row.stockQty) {
      throw new Error(
        `Insufficient stock for ${row.productName} (${row.variantLabel}). Available: ${row.stockQty}.`
      );
    }
    subtotalPaise += row.pricePaise * row.quantity;
  }

  const shippingPaise = calculateShippingPaise(subtotalPaise, input.shippingState);
  const totalPaise = subtotalPaise + shippingPaise;
  const orderNumber = generateOrderNumber();
  const normalizedPhone = normalizeIndianPhone(input.customerPhone);

  // 3. Create payment order via adapter before persisting final transaction
  const paymentOrder = await adapter.createPaymentOrder({
    orderNumber,
    amountPaise: totalPaise,
    currency: 'INR',
    customerName: input.customerName,
    customerPhone: normalizedPhone,
  });

  // 4. Transactional order creation + stock reservation
  await db.transaction(async (tx) => {
    // Re-check and decrement stock atomically
    for (const row of rows) {
      const updated = await tx
        .update(productVariants)
        .set({
          stockQty: sql`${productVariants.stockQty} - ${row.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(productVariants.id, row.variantId),
            sql`${productVariants.stockQty} >= ${row.quantity}`
          )
        )
        .returning({ id: productVariants.id });

      if (updated.length === 0) {
        throw new Error(`Stock changed during checkout for ${row.productName}. Please review your cart.`);
      }
    }

    const insertedOrders = await tx
      .insert(orders)
      .values({
        orderNumber,
        idempotencyKey: input.idempotencyKey,
        status: 'pending_payment',
        paymentStatus: 'pending',
        paymentProvider: paymentOrder.provider,
        providerOrderId: paymentOrder.providerOrderId,
        customerName: input.customerName,
        customerPhone: normalizedPhone,
        customerEmail: input.customerEmail || null,
        shippingAddressLine1: input.shippingAddressLine1,
        shippingAddressLine2: input.shippingAddressLine2 || null,
        shippingCity: input.shippingCity,
        shippingState: input.shippingState,
        shippingPincode: input.shippingPincode,
        deliveryNotes: input.deliveryNotes || null,
        subtotalPaise,
        shippingPaise,
        discountPaise: 0,
        totalPaise,
        utmSource: input.utmSource || null,
        utmMedium: input.utmMedium || null,
        utmCampaign: input.utmCampaign || null,
      })
      .returning();

    const createdOrder = insertedOrders[0]!;

    for (const row of rows) {
      await tx.insert(orderItems).values({
        orderId: createdOrder.id,
        variantId: row.variantId,
        sku: row.sku,
        productName: row.productName,
        tamilName: row.tamilName,
        variantLabel: row.variantLabel,
        unitPricePaise: row.pricePaise!,
        quantity: row.quantity,
        lineTotalPaise: row.pricePaise! * row.quantity,
      });
    }

    await tx.insert(payments).values({
      orderId: createdOrder.id,
      provider: paymentOrder.provider,
      providerOrderId: paymentOrder.providerOrderId,
      amountPaise: totalPaise,
      currency: 'INR',
      status: 'created',
    });
  });

  // Clear shopping cart once order is safely committed
  await clearCart(input.cartId);

  return {
    reusedIdempotent: false,
    orderNumber,
    status: 'pending_payment',
    paymentStatus: 'pending',
    subtotalPaise,
    shippingPaise,
    totalPaise,
    paymentOrder,
  };
}

export async function processVerifiedPaymentWebhook(rawBody: string, signatureHeader: string) {
  await ensureDbReady();
  const db = getDb();
  const adapter = getPaymentProviderAdapter();

  const signatureValid = adapter.verifyWebhookSignature(rawBody, signatureHeader);
  if (!signatureValid) {
    throw new Error('Invalid webhook cryptographic signature.');
  }

  const parsed = adapter.parseWebhookPayload(rawBody);
  if (!parsed.eventId || !parsed.providerOrderId) {
    throw new Error('Malformed webhook payload: missing eventId or providerOrderId.');
  }

  // Idempotent replay protection
  const existingEvent = await db
    .select()
    .from(paymentWebhookEvents)
    .where(
      and(
        eq(paymentWebhookEvents.provider, adapter.providerName),
        eq(paymentWebhookEvents.eventId, parsed.eventId)
      )
    )
    .limit(1);

  if (existingEvent[0]) {
    return {
      duplicateReplay: true,
      eventId: parsed.eventId,
      status: 'already_processed',
    };
  }

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.providerOrderId, parsed.providerOrderId))
    .limit(1);

  const ord = orderRows[0];
  if (!ord) {
    throw new Error('Order matching providerOrderId not found.');
  }

  await db.transaction(async (tx) => {
    await tx.insert(paymentWebhookEvents).values({
      provider: adapter.providerName,
      eventId: parsed.eventId,
      eventType: parsed.eventType,
      signatureVerified: true,
      payloadHash: sha256Hex(rawBody),
    });

    if (parsed.eventType === 'payment.captured') {
      await tx
        .update(orders)
        .set({
          paymentStatus: 'captured',
          status: ord.status === 'pending_payment' || ord.status === 'payment_failed' ? 'confirmed' : ord.status,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, ord.id));

      await tx
        .update(payments)
        .set({
          providerPaymentId: parsed.providerPaymentId,
          status: 'captured',
          failureReason: null,
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, ord.id));
    } else if (parsed.eventType === 'payment.failed') {
      // Restore reserved stock only when transitioning from non-failed to failed
      if (ord.paymentStatus !== 'failed' && ord.paymentStatus !== 'captured') {
        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, ord.id));
        for (const item of items) {
          if (item.variantId) {
            await tx
              .update(productVariants)
              .set({ stockQty: sql`${productVariants.stockQty} + ${item.quantity}` })
              .where(eq(productVariants.id, item.variantId));
          }
        }
      }

      await tx
        .update(orders)
        .set({
          paymentStatus: 'failed',
          status: 'payment_failed',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, ord.id));

      await tx
        .update(payments)
        .set({
          providerPaymentId: parsed.providerPaymentId || null,
          status: 'failed',
          failureReason: parsed.failureReason || 'Payment declined or cancelled',
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, ord.id));
    } else {
      await tx
        .update(payments)
        .set({
          providerPaymentId: parsed.providerPaymentId || null,
          status: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, ord.id));
    }
  });

  return {
    duplicateReplay: false,
    eventId: parsed.eventId,
    orderNumber: ord.orderNumber,
    eventType: parsed.eventType,
  };
}

/**
 * Triggers a genuine HMAC-signed sandbox webhook strictly when running in Sandbox mode.
 * Rejected automatically if live Razorpay credentials are active.
 */
export async function triggerSandboxPaymentSimulation(
  orderNumber: string,
  outcome: 'captured' | 'pending' | 'failed',
  customEventId?: string
) {
  await ensureDbReady();
  const adapter = getPaymentProviderAdapter();
  if (!adapter.isSandbox) {
    throw new Error('Sandbox payment simulation is disabled when live payment credentials are active.');
  }

  const db = getDb();
  const found = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  const ord = found[0];
  if (!ord || !ord.providerOrderId) {
    throw new Error('Order not found.');
  }

  const eventType =
    outcome === 'captured'
      ? 'payment.captured'
      : outcome === 'failed'
        ? 'payment.failed'
        : 'payment.pending';

  const payload = JSON.stringify({
    eventId: customEventId || `sbx_evt_${orderNumber}_${outcome}_${Date.now()}`,
    eventType,
    providerOrderId: ord.providerOrderId,
    providerPaymentId: `sbx_pay_${crypto.randomBytes(6).toString('hex')}`,
    orderNumber: ord.orderNumber,
    failureReason: outcome === 'failed' ? 'Simulated bank authorization decline (Sandbox)' : undefined,
  });

  const signature = signSandboxWebhookBody(payload);
  return processVerifiedPaymentWebhook(payload, signature);
}

/**
 * IDOR-protected order retrieval: requires BOTH orderNumber AND matching 10-digit customer phone
 * unless invoked from an authenticated admin context.
 */
export async function getOrderForCustomer(orderNumber: string, customerPhone: string) {
  await ensureDbReady();
  const db = getDb();
  const normalized = normalizeIndianPhone(customerPhone);

  const found = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderNumber, orderNumber.trim().toUpperCase()), eq(orders.customerPhone, normalized)))
    .limit(1);

  const ord = found[0];
  if (!ord) return null;

  const [items, paymentRows] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, ord.id)),
    db.select().from(payments).where(eq(payments.orderId, ord.id)).orderBy(desc(payments.id)),
  ]);

  return {
    orderNumber: ord.orderNumber,
    status: ord.status,
    paymentStatus: ord.paymentStatus,
    paymentProvider: ord.paymentProvider,
    customerName: ord.customerName,
    customerPhoneMasked: `${ord.customerPhone.slice(0, 2)}******${ord.customerPhone.slice(-2)}`,
    shippingCity: ord.shippingCity,
    shippingState: ord.shippingState,
    shippingPincode: ord.shippingPincode,
    subtotalPaise: ord.subtotalPaise,
    shippingPaise: ord.shippingPaise,
    totalPaise: ord.totalPaise,
    createdAt: ord.createdAt,
    updatedAt: ord.updatedAt,
    items,
    latestPayment: paymentRows[0]
      ? {
          status: paymentRows[0].status,
          provider: paymentRows[0].provider,
          failureReason: paymentRows[0].failureReason,
        }
      : null,
  };
}
