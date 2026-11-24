import fs from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../src/db/schema';
import { DDL_STATEMENTS, getDb, resetDbForTesting } from '../src/db';
import { ensureDbReady, clearBootstrapCacheForTesting } from '../src/db/bootstrap';

async function main() {
  const backupDir = path.resolve(process.cwd(), '.data', 'backups');
  await fs.mkdir(backupDir, { recursive: true });

  await ensureDbReady();
  const db = getDb();

  // 1. Export full logical backup snapshot (JSON)
  const snapshot = {
    exportedAt: new Date().toISOString(),
    categories: await db.select().from(schema.categories),
    products: await db.select().from(schema.products),
    productCategories: await db.select().from(schema.productCategories),
    productVariants: await db.select().from(schema.productVariants),
    productImages: await db.select().from(schema.productImages),
    orders: await db.select().from(schema.orders),
    orderItems: await db.select().from(schema.orderItems),
    enquiries: await db.select().from(schema.enquiries),
    auditEvents: await db.select().from(schema.auditEvents),
  };

  const backupPath = path.join(backupDir, `backup-verify-${Date.now()}.json`);
  await fs.writeFile(backupPath, JSON.stringify(snapshot, null, 2), 'utf-8');

  // 2. Restore into a completely fresh isolated in-memory PostgreSQL instance and verify row parity
  const restoreEngine = new PGlite();
  await restoreEngine.exec(DDL_STATEMENTS);
  const restoreDb = drizzle(restoreEngine, { schema });

  const loaded = JSON.parse(await fs.readFile(backupPath, 'utf-8')) as typeof snapshot;
  if (loaded.categories.length) {
    await restoreDb.insert(schema.categories).values(
      loaded.categories.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }))
    );
  }
  if (loaded.products.length) {
    await restoreDb.insert(schema.products).values(
      loaded.products.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      }))
    );
  }
  if (loaded.productCategories.length) {
    await restoreDb.insert(schema.productCategories).values(loaded.productCategories);
  }
  if (loaded.productVariants.length) {
    await restoreDb.insert(schema.productVariants).values(
      loaded.productVariants.map((r) => ({ ...r, updatedAt: new Date(r.updatedAt) }))
    );
  }
  if (loaded.productImages.length) {
    await restoreDb.insert(schema.productImages).values(loaded.productImages);
  }

  const restoredCategories = await restoreDb.select().from(schema.categories);
  const restoredProducts = await restoreDb.select().from(schema.products);
  const restoredVariants = await restoreDb.select().from(schema.productVariants);
  const restoredImages = await restoreDb.select().from(schema.productImages);

  const ok =
    restoredCategories.length === snapshot.categories.length &&
    restoredProducts.length === snapshot.products.length &&
    restoredVariants.length === snapshot.productVariants.length &&
    restoredImages.length === snapshot.productImages.length;

  await restoreEngine.close();
  await resetDbForTesting();
  clearBootstrapCacheForTesting();

  if (!ok) {
    throw new Error('Backup restore parity check FAILED!');
  }

  console.log('Database Backup & Restore Verification PASSED:');
  console.log(`  Backup File: ${backupPath}`);
  console.log(
    `  Restored Parity: ${restoredCategories.length} categories, ${restoredProducts.length} products, ${restoredVariants.length} variants, ${restoredImages.length} images.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
