import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { ensureDbReady } from '@/db/bootstrap';
import { cartItems, carts, products, productVariants } from '@/db/schema';
import { BRAND, buildWhatsAppUrl, formatPaiseToInr } from '@/data/brand';
import { generateSecureToken } from '@/lib/security/crypto';

export const CART_COOKIE_NAME = 'am_cart_id';

export interface HydratedCartItem {
  variantId: number;
  productId: number;
  productSlug: string;
  productName: string;
  tamilName: string;
  sku: string;
  variantLabel: string;
  netWeightGrams: number | null;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  stockQty: number;
  thumbUrl: string;
  isEdible: boolean;
}

export interface HydratedCart {
  cartId: string;
  items: HydratedCartItem[];
  itemCount: number;
  subtotalPaise: number;
  shippingPaise: number;
  freeShippingThresholdPaise: number;
  amountToFreeShippingPaise: number;
  totalPaise: number;
  shippingRegionNote: string;
  whatsappEnquiryUrl: string;
}

export function calculateShippingPaise(subtotalPaise: number, state?: string): number {
  if (subtotalPaise <= 0) return 0;
  if (subtotalPaise >= BRAND.shippingRules.freeShippingThresholdPaise) return 0;
  const normalizedState = (state || 'Tamil Nadu').trim().toLowerCase();
  if (normalizedState === 'tamil nadu' || normalizedState === 'puducherry' || normalizedState === 'pondicherry') {
    return BRAND.shippingRules.tamilNaduFlatPaise;
  }
  return BRAND.shippingRules.restOfIndiaFlatPaise;
}

export async function ensureCartExists(existingCartId?: string | null): Promise<string> {
  await ensureDbReady();
  const db = getDb();
  if (existingCartId && /^[A-Za-z0-9_-]{16,80}$/.test(existingCartId)) {
    const found = await db.select({ id: carts.id }).from(carts).where(eq(carts.id, existingCartId)).limit(1);
    if (found[0]) return found[0].id;
  }
  const newId = generateSecureToken(24);
  await db.insert(carts).values({ id: newId });
  return newId;
}

export async function getHydratedCart(cartId: string | null | undefined, shippingState?: string): Promise<HydratedCart> {
  await ensureDbReady();
  const db = getDb();

  if (!cartId) {
    return buildEmptyCart('');
  }

  const rows = await db
    .select({
      quantity: cartItems.quantity,
      variantId: productVariants.id,
      sku: productVariants.sku,
      variantLabel: productVariants.label,
      netWeightGrams: productVariants.netWeightGrams,
      pricePaise: productVariants.pricePaise,
      stockQty: productVariants.stockQty,
      isOrderableOnline: productVariants.isOrderableOnline,
      thumbUrl: productVariants.thumbUrl,
      productId: products.id,
      productSlug: products.slug,
      productName: products.name,
      tamilName: products.tamilName,
      isEdible: products.isEdible,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  const items: HydratedCartItem[] = [];
  let subtotalPaise = 0;
  let itemCount = 0;

  for (const r of rows) {
    if (!r.isOrderableOnline || r.pricePaise === null || r.quantity <= 0) continue;
    const clampedQty = Math.min(r.quantity, Math.max(1, r.stockQty));
    const lineTotalPaise = r.pricePaise * clampedQty;
    subtotalPaise += lineTotalPaise;
    itemCount += clampedQty;
    items.push({
      variantId: r.variantId,
      productId: r.productId,
      productSlug: r.productSlug,
      productName: r.productName,
      tamilName: r.tamilName,
      sku: r.sku,
      variantLabel: r.variantLabel,
      netWeightGrams: r.netWeightGrams,
      unitPricePaise: r.pricePaise,
      quantity: clampedQty,
      lineTotalPaise,
      stockQty: r.stockQty,
      thumbUrl: r.thumbUrl,
      isEdible: r.isEdible,
    });
  }

  const shippingPaise = calculateShippingPaise(subtotalPaise, shippingState);
  const threshold = BRAND.shippingRules.freeShippingThresholdPaise;
  const amountToFreeShippingPaise = Math.max(0, threshold - subtotalPaise);
  const totalPaise = subtotalPaise + shippingPaise;

  const waLines = [
    `Hello ${BRAND.fullName} team, I would like to enquire about the following items from your website:`,
    ...items.map(
      (it) =>
        `• ${it.productName} (${it.tamilName}) — ${it.variantLabel} × ${it.quantity} = ${formatPaiseToInr(it.lineTotalPaise)}`
    ),
    `Estimated Subtotal: ${formatPaiseToInr(subtotalPaise)}`,
    `Note: I understand this WhatsApp enquiry is not a confirmed order or payment until confirmed by your team.`,
  ];

  return {
    cartId,
    items,
    itemCount,
    subtotalPaise,
    shippingPaise,
    freeShippingThresholdPaise: threshold,
    amountToFreeShippingPaise,
    totalPaise,
    shippingRegionNote:
      shippingPaise === 0 && subtotalPaise > 0
        ? 'Free shipping unlocked (orders ₹499+, provisional rule)'
        : `Provisional shipping: ₹49 Tamil Nadu / ₹79 Rest of India (Free at ₹499+)`,
    whatsappEnquiryUrl: buildWhatsAppUrl(waLines.join('\n')),
  };
}

function buildEmptyCart(cartId: string): HydratedCart {
  return {
    cartId,
    items: [],
    itemCount: 0,
    subtotalPaise: 0,
    shippingPaise: 0,
    freeShippingThresholdPaise: BRAND.shippingRules.freeShippingThresholdPaise,
    amountToFreeShippingPaise: BRAND.shippingRules.freeShippingThresholdPaise,
    totalPaise: 0,
    shippingRegionNote: 'Provisional shipping: ₹49 Tamil Nadu / ₹79 Rest of India (Free at ₹499+)',
    whatsappEnquiryUrl: buildWhatsAppUrl(
      `Hello ${BRAND.fullName}, I have a question about your traditional South Indian masalas and mixes.`
    ),
  };
}

export async function addToCart(cartId: string, variantId: number, deltaQty: number): Promise<HydratedCart> {
  await ensureDbReady();
  const db = getDb();

  const variantRows = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);
  const variant = variantRows[0];

  if (!variant) {
    throw new Error('Selected product pack was not found.');
  }
  if (!variant.isOrderableOnline || variant.pricePaise === null) {
    throw new Error('This product is currently available via WhatsApp enquiry only.');
  }
  if (variant.stockQty <= 0) {
    throw new Error('This pack is currently out of stock.');
  }

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)))
    .limit(1);

  const nextQty = Math.min(25, variant.stockQty, (existing[0]?.quantity ?? 0) + deltaQty);
  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: nextQty, updatedAt: new Date() })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      variantId,
      quantity: nextQty,
    });
  }

  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
  return getHydratedCart(cartId);
}

export async function setCartItemQuantity(cartId: string, variantId: number, quantity: number): Promise<HydratedCart> {
  await ensureDbReady();
  const db = getDb();

  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)));
    return getHydratedCart(cartId);
  }

  const variantRows = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);
  const variant = variantRows[0];
  if (!variant || !variant.isOrderableOnline || variant.pricePaise === null) {
    throw new Error('Selected product pack cannot be updated.');
  }
  if (quantity > variant.stockQty) {
    throw new Error(`Only ${variant.stockQty} pack(s) currently available.`);
  }

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: Math.min(25, quantity), updatedAt: new Date() })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      variantId,
      quantity: Math.min(25, quantity),
    });
  }

  return getHydratedCart(cartId);
}

export async function clearCart(cartId: string): Promise<void> {
  await ensureDbReady();
  const db = getDb();
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}
