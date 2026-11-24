import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const categories = pgTable(
  'categories',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    tamilName: text('tamil_name').notNull(),
    shortDescription: text('short_description').notNull(),
    editorialIntro: text('editorial_intro').notNull(),
    heroImage: text('hero_image').notNull(),
    accentHex: text('accent_hex').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isEdibleCategory: boolean('is_edible_category').notNull().default(true),
    isComingSoonOnly: boolean('is_coming_soon_only').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('categories_slug_idx').on(table.slug)]
);

export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    tamilName: text('tamil_name').notNull(),
    primaryCategorySlug: text('primary_category_slug').notNull(),
    shortSummary: text('short_summary').notNull(),
    description: text('description').notNull(),
    usageTags: jsonb('usage_tags').$type<string[]>().notNull().default([]),
    searchSynonyms: jsonb('search_synonyms').$type<string[]>().notNull().default([]),
    isEdible: boolean('is_edible').notNull().default(true),
    vegMarkPrinted: boolean('veg_mark_printed').notNull().default(true),
    fssaiPrinted: text('fssai_printed'),
    ingredientsVerifiedTamil: text('ingredients_verified_tamil'),
    ingredientsVerifiedEnglish: jsonb('ingredients_verified_english').$type<string[] | null>(),
    ingredientsNote: text('ingredients_note').notNull(),
    storageGuidance: text('storage_guidance').notNull(),
    labelVerificationFlags: jsonb('label_verification_flags').$type<string[]>().notNull().default([]),
    isFeatured: boolean('is_featured').notNull().default(false),
    featuredOrder: integer('featured_order'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('products_slug_idx').on(table.slug),
    index('products_primary_category_idx').on(table.primaryCategorySlug),
  ]
);

export const productCategories = pgTable(
  'product_categories',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => [uniqueIndex('product_categories_pair_idx').on(table.productId, table.categoryId)]
);

export const productVariants = pgTable(
  'product_variants',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull(),
    label: text('label').notNull(),
    netWeightGrams: integer('net_weight_grams'),
    /** Always integer minor units (paise). Null only when pending verification (e.g., Chilli Powder). */
    pricePaise: integer('price_paise'),
    stockQty: integer('stock_qty').notNull().default(0),
    isOrderableOnline: boolean('is_orderable_online').notNull().default(true),
    priceSource: text('price_source').notNull().default('printed_sticker'),
    bestBeforePrinted: text('best_before_printed'),
    verificationNote: text('verification_note'),
    assetFile: text('asset_file').notNull(),
    thumbUrl: text('thumb_url').notNull(),
    largeUrl: text('large_url').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('product_variants_sku_idx').on(table.sku),
    index('product_variants_product_id_idx').on(table.productId),
  ]
);

export const productImages = pgTable(
  'product_images',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sourceAssetFile: text('source_asset_file').notNull(),
    thumbUrl: text('thumb_url').notNull(),
    largeUrl: text('large_url').notNull(),
    avifUrl: text('avif_url').notNull(),
    altText: text('alt_text').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('product_images_product_id_idx').on(table.productId)]
);

export const carts = pgTable(
  'carts',
  {
    id: text('id').primaryKey(), // cryptographically random token
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const cartItems = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    cartId: text('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    variantId: integer('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('cart_items_cart_variant_idx').on(table.cartId, table.variantId)]
);

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    orderNumber: text('order_number').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    status: text('status').notNull().default('pending_payment'), // pending_payment, confirmed, packed, shipped, delivered, cancelled, payment_failed
    paymentStatus: text('payment_status').notNull().default('pending'), // pending, captured, failed, refunded
    paymentProvider: text('payment_provider').notNull().default('sandbox'),
    providerOrderId: text('provider_order_id'),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone').notNull(),
    customerEmail: text('customer_email'),
    shippingAddressLine1: text('shipping_address_line1').notNull(),
    shippingAddressLine2: text('shipping_address_line2'),
    shippingCity: text('shipping_city').notNull(),
    shippingState: text('shipping_state').notNull(),
    shippingPincode: text('shipping_pincode').notNull(),
    deliveryNotes: text('delivery_notes'),
    subtotalPaise: integer('subtotal_paise').notNull(),
    shippingPaise: integer('shipping_paise').notNull(),
    discountPaise: integer('discount_paise').notNull().default(0),
    totalPaise: integer('total_paise').notNull(),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('orders_order_number_idx').on(table.orderNumber),
    uniqueIndex('orders_idempotency_key_idx').on(table.idempotencyKey),
  ]
);

export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    sku: text('sku').notNull(),
    productName: text('product_name').notNull(),
    tamilName: text('tamil_name').notNull(),
    variantLabel: text('variant_label').notNull(),
    unitPricePaise: integer('unit_price_paise').notNull(),
    quantity: integer('quantity').notNull(),
    lineTotalPaise: integer('line_total_paise').notNull(),
  },
  (table) => [index('order_items_order_id_idx').on(table.orderId)]
);

export const payments = pgTable(
  'payments',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerOrderId: text('provider_order_id').notNull(),
    providerPaymentId: text('provider_payment_id'),
    amountPaise: integer('amount_paise').notNull(),
    currency: text('currency').notNull().default('INR'),
    status: text('status').notNull().default('created'), // created, pending, captured, failed, refunded
    failureReason: text('failure_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('payments_order_id_idx').on(table.orderId)]
);

export const paymentWebhookEvents = pgTable(
  'payment_webhook_events',
  {
    id: serial('id').primaryKey(),
    provider: text('provider').notNull(),
    eventId: text('event_id').notNull(),
    eventType: text('event_type').notNull(),
    signatureVerified: boolean('signature_verified').notNull().default(false),
    payloadHash: text('payload_hash').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('webhook_provider_event_idx').on(table.provider, table.eventId)]
);

export const enquiries = pgTable(
  'enquiries',
  {
    id: serial('id').primaryKey(),
    referenceCode: text('reference_code').notNull(),
    type: text('type').notNull(), // bulk_wholesale | contact_support | privacy_request
    name: text('name').notNull(),
    businessName: text('business_name'),
    phone: text('phone').notNull(),
    email: text('email'),
    cityState: text('city_state'),
    interestedProducts: text('interested_products'),
    estimatedMonthlyKg: text('estimated_monthly_kg'),
    message: text('message').notNull(),
    status: text('status').notNull().default('new'), // new | contacted | closed
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('enquiries_ref_code_idx').on(table.referenceCode)]
);

export const adminUsers = pgTable(
  'admin_users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    role: text('role').notNull().default('super_admin'), // super_admin | catalog_manager | order_operator
    passwordHash: text('password_hash').notNull(), // scrypt salt:hash
    mfaEnabled: boolean('mfa_enabled').notNull().default(true),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('admin_users_email_idx').on(table.email)]
);

export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: serial('id').primaryKey(),
    tokenHash: text('token_hash').notNull(),
    adminUserId: integer('admin_user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    mfaVerified: boolean('mfa_verified').notNull().default(false),
    pendingMfaCodeHash: text('pending_mfa_code_hash'),
    mfaExpiresAt: timestamp('mfa_expires_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('admin_sessions_token_hash_idx').on(table.tokenHash)]
);

export const auditEvents = pgTable(
  'audit_events',
  {
    id: serial('id').primaryKey(),
    actorEmail: text('actor_email').notNull(),
    actorRole: text('actor_role').notNull(),
    action: text('action').notNull(),
    targetEntity: text('target_entity').notNull(),
    targetId: text('target_id').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('audit_events_created_at_idx').on(table.createdAt)]
);

export const consentRecords = pgTable(
  'consent_records',
  {
    id: serial('id').primaryKey(),
    anonymousId: text('anonymous_id').notNull(),
    necessaryAccepted: boolean('necessary_accepted').notNull().default(true),
    analyticsAccepted: boolean('analytics_accepted').notNull().default(false),
    marketingAccepted: boolean('marketing_accepted').notNull().default(false),
    policyVersion: text('policy_version').notNull().default('2026-11-v1'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('consent_anonymous_id_idx').on(table.anonymousId)]
);

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: serial('id').primaryKey(),
    anonymousId: text('anonymous_id').notNull(),
    eventName: text('event_name').notNull(),
    path: text('path').notNull(),
    deviceClass: text('device_class').notNull().default('unknown'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    productSlug: text('product_slug'),
    categorySlug: text('category_slug'),
    searchQuery: text('search_query'),
    valuePaise: integer('value_paise'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('analytics_event_name_idx').on(table.eventName),
    index('analytics_created_at_idx').on(table.createdAt),
  ]
);
