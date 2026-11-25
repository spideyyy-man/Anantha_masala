import path from 'node:path';
import fs from 'node:fs';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { PGlite } from '@electric-sql/pglite';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import * as schema from './schema';

export type AppDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

interface GlobalDbState {
  db?: AppDatabase;
  pglite?: PGlite;
  pool?: Pool;
  initPromise?: Promise<void>;
  mode?: 'postgres' | 'pglite';
}

const globalForDb = globalThis as unknown as { __aanandhaDb?: GlobalDbState };
if (!globalForDb.__aanandhaDb) {
  globalForDb.__aanandhaDb = {};
}

export const DDL_STATEMENTS = `
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tamil_name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  editorial_intro TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  accent_hex TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_edible_category BOOLEAN NOT NULL DEFAULT TRUE,
  is_coming_soon_only BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tamil_name TEXT NOT NULL,
  primary_category_slug TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  description TEXT NOT NULL,
  usage_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  search_synonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_edible BOOLEAN NOT NULL DEFAULT TRUE,
  veg_mark_printed BOOLEAN NOT NULL DEFAULT TRUE,
  fssai_printed TEXT,
  ingredients_verified_tamil TEXT,
  ingredients_verified_english JSONB,
  ingredients_note TEXT NOT NULL,
  storage_guidance TEXT NOT NULL,
  label_verification_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  featured_order INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS products_primary_category_idx ON products(primary_category_slug);

CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(product_id, category_id)
);

CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  net_weight_grams INTEGER,
  price_paise INTEGER,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  is_orderable_online BOOLEAN NOT NULL DEFAULT TRUE,
  price_source TEXT NOT NULL DEFAULT 'printed_sticker',
  best_before_printed TEXT,
  verification_note TEXT,
  asset_file TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  large_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON product_variants(product_id);

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source_asset_file TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  large_url TEXT NOT NULL,
  avif_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON product_images(product_id);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, variant_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_provider TEXT NOT NULL DEFAULT 'sandbox',
  provider_order_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_pincode TEXT NOT NULL,
  delivery_notes TEXT,
  subtotal_paise INTEGER NOT NULL,
  shipping_paise INTEGER NOT NULL,
  discount_paise INTEGER NOT NULL DEFAULT 0,
  total_paise INTEGER NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  tamil_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  unit_price_paise INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  line_total_paise INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_order_id TEXT NOT NULL,
  provider_payment_id TEXT,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
  payload_hash TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, event_id)
);

CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  city_state TEXT,
  interested_products TEXT,
  estimated_monthly_kg TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  password_hash TEXT NOT NULL,
  mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  mfa_verified BOOLEAN NOT NULL DEFAULT FALSE,
  pending_mfa_code_hash TEXT,
  mfa_expires_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id SERIAL PRIMARY KEY,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_events_created_at_idx ON audit_events(created_at);

CREATE TABLE IF NOT EXISTS consent_records (
  id SERIAL PRIMARY KEY,
  anonymous_id TEXT NOT NULL UNIQUE,
  necessary_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  analytics_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  policy_version TEXT NOT NULL DEFAULT '2026-11-v1',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  device_class TEXT NOT NULL DEFAULT 'unknown',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  product_slug TEXT,
  category_slug TEXT,
  search_query TEXT,
  value_paise INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS analytics_event_name_idx ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics_events(created_at);
`;

function initConnection(): AppDatabase {
  const state = globalForDb.__aanandhaDb!;
  if (state.db) return state.db;

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const pool = new Pool({
      connectionString: databaseUrl,
      max: process.env.VERCEL ? 5 : 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    state.pool = pool;
    state.mode = 'postgres';
    if (process.env.VERCEL) attachDatabasePool(pool);
    state.db = drizzlePg(pool, { schema });
    return state.db;
  }

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error(
      'DATABASE_URL is required in production. Configure a managed PostgreSQL connection; PGlite is development-only.',
    );
  }

  const dataDir =
    process.env.PGLITE_DATA_DIR === 'memory://'
      ? 'memory://'
      : path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.PGLITE_DATA_DIR || '.data/pglite');

  if (dataDir !== 'memory://') {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite = new PGlite(dataDir === 'memory://' ? undefined : dataDir);
  state.pglite = pglite;
  state.mode = 'pglite';
  state.db = drizzlePglite(pglite, { schema });
  return state.db;
}

export function getDb(): AppDatabase {
  return initConnection();
}

export function getDbMode(): 'postgres' | 'pglite' {
  initConnection();
  return globalForDb.__aanandhaDb!.mode ?? 'pglite';
}

export async function execRawSql(sqlText: string): Promise<void> {
  initConnection();
  const state = globalForDb.__aanandhaDb!;
  if (state.mode === 'postgres' && state.pool) {
    await state.pool.query(sqlText);
  } else if (state.pglite) {
    await state.pglite.exec(sqlText);
  }
}

export async function resetDbForTesting(): Promise<void> {
  const state = globalForDb.__aanandhaDb!;
  if (state.pglite) {
    await state.pglite.close();
  }
  if (state.pool) {
    await state.pool.end();
  }
  state.db = undefined;
  state.pglite = undefined;
  state.pool = undefined;
  state.initPromise = undefined;
  state.mode = undefined;
}
