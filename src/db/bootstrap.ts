import { eq } from 'drizzle-orm';
import { DDL_STATEMENTS, execRawSql, getDb } from './index';
import {
  adminUsers,
  categories,
  productCategories,
  productImages,
  products,
  productVariants,
} from './schema';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '@/data/catalog-seed';
import { hashPassword } from '@/lib/security/crypto';

const globalBootstrap = globalThis as unknown as {
  __aanandhaBootPromise?: Promise<void>;
};

function assetFileToUrls(productSlug: string, assetFile: string) {
  const num = assetFile.replace('.jpg', '');
  const base = `${productSlug}-${num}`;
  return {
    thumbUrl: `/images/products/${base}-480.webp`,
    largeUrl: `/images/products/${base}-960.webp`,
    avifUrl: `/images/products/${base}-960.avif`,
  };
}

export async function runBootstrap(forceReseed = false): Promise<void> {
  await execRawSql(DDL_STATEMENTS);
  const db = getDb();

  const existingCategories = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existingCategories.length === 0 || forceReseed) {
    // 1. Seed categories idempotently
    const categoryIdBySlug = new Map<string, number>();
    for (const cat of SEED_CATEGORIES) {
      const existing = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, cat.slug))
        .limit(1);
      if (existing[0]) {
        categoryIdBySlug.set(cat.slug, existing[0].id);
      } else {
        const inserted = await db
          .insert(categories)
          .values({
            slug: cat.slug,
            name: cat.name,
            tamilName: cat.tamilName,
            shortDescription: cat.shortDescription,
            editorialIntro: cat.editorialIntro,
            heroImage: cat.heroImage,
            accentHex: cat.accentHex,
            sortOrder: cat.sortOrder,
            isEdibleCategory: cat.isEdibleCategory,
            isComingSoonOnly: Boolean(cat.isComingSoonOnly),
          })
          .returning({ id: categories.id });
        if (inserted[0]) {
          categoryIdBySlug.set(cat.slug, inserted[0].id);
        }
      }
    }

    // 2. Seed products, category links, variants, and image gallery idempotently
    for (const prod of SEED_PRODUCTS) {
      const existingProd = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, prod.slug))
        .limit(1);

      let productId: number;
      if (existingProd[0]) {
        productId = existingProd[0].id;
      } else {
        const insertedProd = await db
          .insert(products)
          .values({
            slug: prod.slug,
            name: prod.name,
            tamilName: prod.tamilName,
            primaryCategorySlug: prod.primaryCategorySlug,
            shortSummary: prod.shortSummary,
            description: prod.description,
            usageTags: prod.usageTags,
            searchSynonyms: prod.searchSynonyms,
            isEdible: prod.isEdible,
            vegMarkPrinted: prod.vegMarkPrinted,
            fssaiPrinted: prod.fssaiPrinted,
            ingredientsVerifiedTamil: prod.ingredientsVerifiedTamil,
            ingredientsVerifiedEnglish: prod.ingredientsVerifiedEnglish,
            ingredientsNote: prod.ingredientsNote,
            storageGuidance: prod.storageGuidance,
            labelVerificationFlags: prod.labelVerificationFlags,
            isFeatured: prod.isFeatured,
            featuredOrder: prod.featuredOrder,
            isActive: true,
          })
          .returning({ id: products.id });
        productId = insertedProd[0]!.id;

        // Category mappings
        for (const catSlug of prod.categorySlugs) {
          const catId = categoryIdBySlug.get(catSlug);
          if (catId) {
            await db
              .insert(productCategories)
              .values({ productId, categoryId: catId })
              .onConflictDoNothing();
          }
        }

        // Variants
        for (const v of prod.variants) {
          const urls = assetFileToUrls(prod.slug, v.assetFile);
          await db
            .insert(productVariants)
            .values({
              productId,
              sku: v.sku,
              label: v.label,
              netWeightGrams: v.netWeightGrams,
              pricePaise: v.pricePaise,
              stockQty: v.stockQty,
              isOrderableOnline: v.isOrderableOnline,
              priceSource: v.priceSource,
              bestBeforePrinted: v.bestBeforePrinted,
              verificationNote: v.verificationNote,
              assetFile: v.assetFile,
              thumbUrl: urls.thumbUrl,
              largeUrl: urls.largeUrl,
            })
            .onConflictDoNothing();
        }

        // Gallery images
        for (let idx = 0; idx < prod.galleryAssetFiles.length; idx++) {
          const file = prod.galleryAssetFiles[idx]!;
          const urls = assetFileToUrls(prod.slug, file);
          await db.insert(productImages).values({
            productId,
            sourceAssetFile: file,
            thumbUrl: urls.thumbUrl,
            largeUrl: urls.largeUrl,
            avifUrl: urls.avifUrl,
            altText:
              idx === 0
                ? `${prod.name} (${prod.tamilName}) front packaging pouch — Madurai Anantha Masala`
                : `${prod.name} (${prod.tamilName}) alternate packaging view — Madurai Anantha Masala`,
            isPrimary: idx === 0,
            sortOrder: idx,
          });
        }
      }
    }
  }

  // 3. Seed default admin user if none exists (uses env vars when configured)
  const existingAdmin = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existingAdmin.length === 0) {
    const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@aanandhamasala.in').toLowerCase();
    const defaultDevPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'MaduraiAdmin#2026!');
    if (!defaultDevPassword) throw new Error('ADMIN_BOOTSTRAP_PASSWORD is required to create the first production admin account.');
    await db
      .insert(adminUsers)
      .values({
        email,
        displayName: 'Madurai Store Operator',
        role: 'super_admin',
        passwordHash: hashPassword(defaultDevPassword),
        mfaEnabled: true,
        isActive: true,
      })
      .onConflictDoNothing();
  }
}

export async function ensureDbReady(): Promise<void> {
  if (!globalBootstrap.__aanandhaBootPromise) {
    globalBootstrap.__aanandhaBootPromise = runBootstrap(false).catch((err) => {
      globalBootstrap.__aanandhaBootPromise = undefined;
      throw err;
    });
  }
  await globalBootstrap.__aanandhaBootPromise;
}

export function clearBootstrapCacheForTesting(): void {
  globalBootstrap.__aanandhaBootPromise = undefined;
}
