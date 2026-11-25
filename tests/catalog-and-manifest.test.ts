import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { clearBootstrapCacheForTesting, ensureDbReady } from '@/db/bootstrap';
import { resetDbForTesting } from '@/db';
import {
  getAllCatalogProducts,
  getAllCategories,
  getProductBySlug,
  queryCatalog,
} from '@/domain/catalog/service';

describe('Catalog Integrity, 35-Image Manifest & Bilingual Discovery', () => {
  beforeAll(async () => {
    process.env.PGLITE_DATA_DIR = 'memory://';
    await resetDbForTesting();
    clearBootstrapCacheForTesting();
    await ensureDbReady();
  });

  afterAll(async () => {
    await resetDbForTesting();
    clearBootstrapCacheForTesting();
  });

  it('audits all 35/35 Assets files cleanly and preserves originals', () => {
    const manifestPath = path.resolve(process.cwd(), 'docs/audit/asset-manifest-35.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
      auditedCount: number;
      assets: { file: string }[];
    };

    expect(manifest.auditedCount).toBe(35);
    expect(manifest.assets).toHaveLength(35);

    const fileSet = new Set(manifest.assets.map((a) => a.file));
    for (let i = 1; i <= 35; i++) {
      const name = `${i}.jpg`;
      expect(fileSet.has(name)).toBe(true);
      expect(fs.existsSync(path.resolve(process.cwd(), 'Assets', name))).toBe(true);
    }
  });

  it('seeds 25 canonical products and 8 categories without duplicating SKUs', async () => {
    const [products, cats] = await Promise.all([getAllCatalogProducts(), getAllCategories()]);
    expect(products).toHaveLength(25);
    expect(cats).toHaveLength(8);

    const manjal = await getProductBySlug('manjal-podi');
    expect(manjal?.variants).toHaveLength(2); // 100g & 50g
  });

  it('never fabricates price for Chilli Powder (32.jpg) and disables online checkout for it', async () => {
    const chilli = await getProductBySlug('chilli-powder');
    expect(chilli).not.toBeNull();
    expect(chilli!.variants[0]!.pricePaise).toBeNull();
    expect(chilli!.isOrderableOnline).toBe(false);
  });

  it('excludes unverified medical claims on Millet Dosa Flour and segregates non-edible bath powder', async () => {
    const milletDosa = await getProductBySlug('sirudhaniya-dosai-maavu');
    expect(milletDosa).not.toBeNull();
    expect(milletDosa!.shortSummary.toLowerCase()).not.toContain('diabetes');
    expect(milletDosa!.description.toLowerCase()).not.toContain('diabetes');

    const bathPowder = await getProductBySlug('kuliyal-podi-nalangu-maavu');
    expect(bathPowder).not.toBeNull();
    expect(bathPowder!.isEdible).toBe(false);
    expect(bathPowder!.primaryCategorySlug).toBe('traditional-herbal-care');
  });

  it('supports bilingual Tamil, English, and phonetic transliteration search with zero silent filler', async () => {
    const turmeric = await queryCatalog({ q: 'turmeric' });
    expect(turmeric.products.some((p) => p.slug === 'manjal-podi')).toBe(true);

    const tamilKollu = await queryCatalog({ q: 'கொள்ளு' });
    expect(tamilKollu.products.some((p) => p.slug === 'kollu-idli-podi')).toBe(true);
    expect(tamilKollu.products.some((p) => p.slug === 'kollu-kanji-mix')).toBe(true);

    const garlic = await queryCatalog({ q: 'garlic' });
    expect(garlic.products.some((p) => p.slug === 'poondu-idli-podi')).toBe(true);

    const noMatches = await queryCatalog({ q: 'zxqv-nonexistent-item-999' });
    expect(noMatches.products).toHaveLength(0);
  });

  it('handles partial product names, common misspellings, extra spaces, and punctuation accurately', async () => {
    // Partial product-name searches
    const partialBhai = await queryCatalog({ q: 'bhai veetu' });
    expect(partialBhai.products.some((p) => p.slug === 'bhai-veetu-meen-masala')).toBe(true);
    expect(partialBhai.products.some((p) => p.slug === 'bhai-veetu-kari-masala')).toBe(true);

    // Extra spaces and punctuation normalization
    const messyQuery = await queryCatalog({ q: '  bhai---veetu...   meen!!  ' });
    expect(messyQuery.products[0]?.slug).toBe('bhai-veetu-meen-masala');

    // Misspelled / phonetic variations ("turmaric", "kuzhampu", "idly poddi", "ulundu", "chappathi")
    const misspelledTurmeric = await queryCatalog({ q: 'turmaric' });
    expect(misspelledTurmeric.products.some((p) => p.slug === 'manjal-podi')).toBe(true);

    const misspelledKuzhambu = await queryCatalog({ q: 'kuzhampu' });
    expect(misspelledKuzhambu.products.some((p) => p.slug === 'kuzhambu-podi')).toBe(true);

    const misspelledIdli = await queryCatalog({ q: 'idly poddi' });
    expect(misspelledIdli.products.some((p) => p.slug === 'idli-milagai-podi')).toBe(true);

    const misspelledUlundhu = await queryCatalog({ q: 'ulundu kali' });
    expect(misspelledUlundhu.products[0]?.slug).toBe('ulundhu-kali-maavu');

    const misspelledChapathi = await queryCatalog({ q: 'chappathi' });
    expect(misspelledChapathi.products.some((p) => p.slug === 'multigrain-chapathi-maavu')).toBe(
      true
    );
  });

  it('applies multi-facet filtering and price/alphabetical sorting accurately', async () => {
    const filtered = await queryCatalog({
      categories: ['traditional-podi'],
      packSizes: [100],
      maxPriceInr: 80,
      sort: 'price_asc',
    });
    expect(filtered.products.length).toBeGreaterThanOrEqual(3);
    for (const p of filtered.products) {
      expect(p.categorySlugs).toContain('traditional-podi');
      expect(p.minPricePaise).toBeLessThanOrEqual(8000);
    }
    const prices = filtered.products.map((p) => p.minPricePaise ?? 0);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const alpha = await queryCatalog({
      categories: ['cooking-essentials'],
      sort: 'name_asc',
    });
    const names = alpha.products.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
