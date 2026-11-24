import { asc, eq, inArray } from 'drizzle-orm';
import { getDb } from '@/db';
import { ensureDbReady } from '@/db/bootstrap';
import {
  categories,
  productCategories,
  productImages,
  products,
  productVariants,
} from '@/db/schema';

export interface CatalogVariant {
  id: number;
  productId: number;
  sku: string;
  label: string;
  netWeightGrams: number | null;
  pricePaise: number | null;
  stockQty: number;
  isOrderableOnline: boolean;
  priceSource: string;
  bestBeforePrinted: string | null;
  verificationNote: string | null;
  assetFile: string;
  thumbUrl: string;
  largeUrl: string;
}

export interface CatalogImage {
  id: number;
  sourceAssetFile: string;
  thumbUrl: string;
  largeUrl: string;
  avifUrl: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface CatalogCategorySummary {
  id: number;
  slug: string;
  name: string;
  tamilName: string;
  shortDescription: string;
  editorialIntro: string;
  heroImage: string;
  accentHex: string;
  sortOrder: number;
  isEdibleCategory: boolean;
  isComingSoonOnly: boolean;
  productCount: number;
}

export interface CatalogProduct {
  id: number;
  slug: string;
  name: string;
  tamilName: string;
  primaryCategorySlug: string;
  categorySlugs: string[];
  shortSummary: string;
  description: string;
  usageTags: string[];
  searchSynonyms: string[];
  isEdible: boolean;
  vegMarkPrinted: boolean;
  fssaiPrinted: string | null;
  ingredientsVerifiedTamil: string | null;
  ingredientsVerifiedEnglish: string[] | null;
  ingredientsNote: string;
  storageGuidance: string;
  labelVerificationFlags: string[];
  isFeatured: boolean;
  featuredOrder: number | null;
  variants: CatalogVariant[];
  images: CatalogImage[];
  minPricePaise: number | null;
  maxPricePaise: number | null;
  hasInStockVariant: boolean;
  isOrderableOnline: boolean;
}

export interface CatalogFilterInput {
  q?: string;
  categories?: string[];
  packSizes?: number[]; // grams: 50, 100, 200, 250
  minPriceInr?: number;
  maxPriceInr?: number;
  availability?: 'all' | 'in_stock' | 'enquiry_only';
  productType?: 'all' | 'edible' | 'herbal_care';
  useCases?: string[];
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'name_asc';
}

export interface CatalogFacets {
  categories: { slug: string; name: string; tamilName: string; count: number; isEdibleCategory: boolean }[];
  packSizes: { grams: number; label: string; count: number }[];
  useCases: { tag: string; count: number }[];
  priceBoundsInr: { min: number; max: number };
}

export interface CatalogQueryResult {
  products: CatalogProduct[];
  totalCount: number;
  facets: CatalogFacets;
}

/** Curated bilingual Tamil / Romanized / English culinary synonym pairs */
const SEARCH_SYNONYM_GROUPS: string[][] = [
  ['turmeric', 'manjal', 'haldi', 'மஞ்சள்'],
  ['chilli', 'chili', 'milagai', 'mirchi', 'red chilli', 'மிளகாய்'],
  ['garlic', 'poondu', 'பூண்டு'],
  ['sesame', 'ellu', 'til', 'எள்ளு'],
  ['horse gram', 'kollu', 'கொள்ளு'],
  ['veldt grape', 'pirandai', 'பிரண்டை'],
  ['fish', 'meen', 'seafood', 'மீன்'],
  ['meat', 'kari', 'mutton', 'chicken', 'kurma', 'கறி', 'மட்டன்', 'சிக்கன்'],
  ['black rice', 'karuppu kavuni', 'kavuni', 'கருப்பு கவுனி'],
  ['red rice', 'sivappu arisi', 'சிவப்பு அரிசி'],
  ['black gram', 'ulundhu', 'urad', 'ulutha', 'உளுந்து'],
  ['millet', 'sirudhaniyam', 'sirudhaniya', 'சிறுதானிய'],
  ['dosa', 'dosai', 'தோசை'],
  ['idli', 'idly', 'இட்லி'],
  ['podi', 'powder', 'gunpowder', 'பொடி'],
  ['curry', 'kuzhambu', 'kulambu', 'குழம்பு'],
  ['sambar', 'sambhar', 'சாம்பார்'],
  ['rasam', 'sourashtra', 'saurashtra', 'ரசம்', 'ரசப்'],
  ['porridge', 'kanji', 'malt', 'sathu maavu', 'கஞ்சி', 'சத்து மாவு'],
  ['bath', 'nalangu', 'kuliyal', 'herbal', 'ubtan', 'குளியல்', 'நலுங்கு'],
  ['pickle', 'oorugai', 'mango', 'kalaka', 'ஊறுகாய்'],
  ['chapathi', 'chapati', 'roti', 'atta', 'multigrain', 'சப்பாத்தி'],
  ['puttu', 'idiyappam', 'string hopper', 'புட்டு', 'இடியாப்பம்'],
];

function expandSearchTokens(rawQuery: string): string[] {
  const clean = rawQuery.trim().toLowerCase();
  if (!clean) return [];
  const baseTokens = clean.split(/[\s,/-]+/).filter(Boolean);
  const expanded = new Set<string>([clean, ...baseTokens]);

  for (const group of SEARCH_SYNONYM_GROUPS) {
    const matched = group.some((term) => clean.includes(term) || baseTokens.some((t) => term.includes(t) && t.length >= 3));
    if (matched) {
      for (const term of group) expanded.add(term);
    }
  }
  return Array.from(expanded);
}

function scoreProductMatch(product: CatalogProduct, rawQuery: string, expandedTokens: string[]): number {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return 1;

  const nameLower = product.name.toLowerCase();
  const tamilLower = product.tamilName.toLowerCase();
  const summaryLower = product.shortSummary.toLowerCase();
  const descLower = product.description.toLowerCase();
  const synonymsLower = product.searchSynonyms.map((s) => s.toLowerCase());
  const usageLower = product.usageTags.map((u) => u.toLowerCase());
  const catLower = product.categorySlugs.join(' ').toLowerCase();

  let score = 0;
  if (nameLower === q || tamilLower === q) score += 120;
  else if (nameLower.startsWith(q) || tamilLower.startsWith(q)) score += 90;
  else if (nameLower.includes(q) || tamilLower.includes(q)) score += 70;

  if (synonymsLower.some((s) => s === q)) score += 80;
  else if (synonymsLower.some((s) => s.includes(q))) score += 55;

  if (summaryLower.includes(q) || usageLower.some((u) => u.includes(q))) score += 35;
  if (descLower.includes(q) || catLower.includes(q)) score += 20;

  // Token + synonym expansion scoring
  for (const token of expandedTokens) {
    if (token.length < 2) continue;
    if (nameLower.includes(token) || tamilLower.includes(token)) score += 28;
    else if (synonymsLower.some((s) => s.includes(token))) score += 22;
    else if (usageLower.some((u) => u.includes(token))) score += 14;
    else if (summaryLower.includes(token)) score += 10;
  }

  return score;
}

export async function getAllCategories(): Promise<CatalogCategorySummary[]> {
  await ensureDbReady();
  const db = getDb();

  const [catRows, mappingRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(productCategories),
  ]);

  const countByCatId = new Map<number, number>();
  for (const m of mappingRows) {
    countByCatId.set(m.categoryId, (countByCatId.get(m.categoryId) ?? 0) + 1);
  }

  return catRows.map((c) => ({
    ...c,
    productCount: countByCatId.get(c.id) ?? 0,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CatalogCategorySummary | null> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getAllCatalogProducts(): Promise<CatalogProduct[]> {
  await ensureDbReady();
  const db = getDb();

  const [prodRows, variantRows, imageRows, mapRows, catRows] = await Promise.all([
    db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.id)),
    db.select().from(productVariants).orderBy(asc(productVariants.id)),
    db.select().from(productImages).orderBy(asc(productImages.sortOrder)),
    db.select().from(productCategories),
    db.select({ id: categories.id, slug: categories.slug }).from(categories),
  ]);

  const slugByCatId = new Map(catRows.map((c) => [c.id, c.slug]));
  const catSlugsByProdId = new Map<number, string[]>();
  for (const m of mapRows) {
    const slug = slugByCatId.get(m.categoryId);
    if (!slug) continue;
    const arr = catSlugsByProdId.get(m.productId) ?? [];
    arr.push(slug);
    catSlugsByProdId.set(m.productId, arr);
  }

  const variantsByProdId = new Map<number, CatalogVariant[]>();
  for (const v of variantRows) {
    const arr = variantsByProdId.get(v.productId) ?? [];
    arr.push(v);
    variantsByProdId.set(v.productId, arr);
  }

  const imagesByProdId = new Map<number, CatalogImage[]>();
  for (const img of imageRows) {
    const arr = imagesByProdId.get(img.productId) ?? [];
    arr.push(img);
    imagesByProdId.set(img.productId, arr);
  }

  return prodRows.map((p) => {
    const pVariants = variantsByProdId.get(p.id) ?? [];
    const priced = pVariants
      .map((v) => v.pricePaise)
      .filter((price): price is number => price !== null);
    const minPricePaise = priced.length > 0 ? Math.min(...priced) : null;
    const maxPricePaise = priced.length > 0 ? Math.max(...priced) : null;
    const hasInStockVariant = pVariants.some((v) => v.isOrderableOnline && v.stockQty > 0);
    const isOrderableOnline = pVariants.some((v) => v.isOrderableOnline && v.pricePaise !== null);

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tamilName: p.tamilName,
      primaryCategorySlug: p.primaryCategorySlug,
      categorySlugs: catSlugsByProdId.get(p.id) ?? [p.primaryCategorySlug],
      shortSummary: p.shortSummary,
      description: p.description,
      usageTags: p.usageTags ?? [],
      searchSynonyms: p.searchSynonyms ?? [],
      isEdible: p.isEdible,
      vegMarkPrinted: p.vegMarkPrinted,
      fssaiPrinted: p.fssaiPrinted,
      ingredientsVerifiedTamil: p.ingredientsVerifiedTamil,
      ingredientsVerifiedEnglish: p.ingredientsVerifiedEnglish,
      ingredientsNote: p.ingredientsNote,
      storageGuidance: p.storageGuidance,
      labelVerificationFlags: p.labelVerificationFlags ?? [],
      isFeatured: p.isFeatured,
      featuredOrder: p.featuredOrder,
      variants: pVariants,
      images: imagesByProdId.get(p.id) ?? [],
      minPricePaise,
      maxPricePaise,
      hasInStockVariant,
      isOrderableOnline,
    };
  });
}

export async function queryCatalog(input: CatalogFilterInput = {}): Promise<CatalogQueryResult> {
  const [allProducts, allCats] = await Promise.all([getAllCatalogProducts(), getAllCategories()]);

  // Build dynamic facets from full verified catalog so only valid values are ever exposed
  const packSizeCounts = new Map<number, number>();
  const useCaseCounts = new Map<string, number>();
  let minP = Infinity;
  let maxP = 0;

  for (const prod of allProducts) {
    const uniqueSizes = new Set<number>();
    for (const v of prod.variants) {
      if (v.netWeightGrams !== null) uniqueSizes.add(v.netWeightGrams);
      if (v.pricePaise !== null) {
        const inr = Math.round(v.pricePaise / 100);
        if (inr < minP) minP = inr;
        if (inr > maxP) maxP = inr;
      }
    }
    for (const sz of uniqueSizes) {
      packSizeCounts.set(sz, (packSizeCounts.get(sz) ?? 0) + 1);
    }
    for (const tag of prod.usageTags) {
      useCaseCounts.set(tag, (useCaseCounts.get(tag) ?? 0) + 1);
    }
  }

  const facets: CatalogFacets = {
    categories: allCats
      .filter((c) => !c.isComingSoonOnly)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        tamilName: c.tamilName,
        count: c.productCount,
        isEdibleCategory: c.isEdibleCategory,
      })),
    packSizes: Array.from(packSizeCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([grams, count]) => ({ grams, label: `${grams}g`, count })),
    useCases: Array.from(useCaseCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count })),
    priceBoundsInr: {
      min: Number.isFinite(minP) ? minP : 30,
      max: maxP > 0 ? maxP : 350,
    },
  };

  const rawQuery = input.q?.trim() ?? '';
  const expandedTokens = expandSearchTokens(rawQuery);

  let scored = allProducts.map((product) => ({
    product,
    score: rawQuery ? scoreProductMatch(product, rawQuery, expandedTokens) : 1,
  }));

  if (rawQuery) {
    scored = scored.filter((item) => item.score > 0);
  }

  if (input.categories && input.categories.length > 0) {
    const catSet = new Set(input.categories);
    scored = scored.filter(({ product }) => product.categorySlugs.some((slug) => catSet.has(slug)));
  }

  if (input.packSizes && input.packSizes.length > 0) {
    const sizeSet = new Set(input.packSizes);
    scored = scored.filter(({ product }) =>
      product.variants.some((v) => v.netWeightGrams !== null && sizeSet.has(v.netWeightGrams))
    );
  }

  if (input.minPriceInr !== undefined && Number.isFinite(input.minPriceInr)) {
    const minPaise = Math.round(input.minPriceInr * 100);
    scored = scored.filter(({ product }) => product.maxPricePaise !== null && product.maxPricePaise >= minPaise);
  }

  if (input.maxPriceInr !== undefined && Number.isFinite(input.maxPriceInr)) {
    const maxPaise = Math.round(input.maxPriceInr * 100);
    scored = scored.filter(({ product }) => product.minPricePaise !== null && product.minPricePaise <= maxPaise);
  }

  if (input.availability === 'in_stock') {
    scored = scored.filter(({ product }) => product.hasInStockVariant);
  } else if (input.availability === 'enquiry_only') {
    scored = scored.filter(({ product }) => !product.isOrderableOnline);
  }

  if (input.productType === 'edible') {
    scored = scored.filter(({ product }) => product.isEdible);
  } else if (input.productType === 'herbal_care') {
    scored = scored.filter(({ product }) => !product.isEdible);
  }

  if (input.useCases && input.useCases.length > 0) {
    const useSet = new Set(input.useCases);
    scored = scored.filter(({ product }) => product.usageTags.some((u) => useSet.has(u)));
  }

  const sort = input.sort ?? 'relevance';
  scored.sort((a, b) => {
    if (sort === 'price_asc') {
      const pa = a.product.minPricePaise ?? Number.MAX_SAFE_INTEGER;
      const pb = b.product.minPricePaise ?? Number.MAX_SAFE_INTEGER;
      return pa - pb || a.product.name.localeCompare(b.product.name);
    }
    if (sort === 'price_desc') {
      const pa = a.product.minPricePaise ?? -1;
      const pb = b.product.minPricePaise ?? -1;
      return pb - pa || a.product.name.localeCompare(b.product.name);
    }
    if (sort === 'name_asc') {
      return a.product.name.localeCompare(b.product.name);
    }
    // Relevance: query score desc, then featured order, then id
    if (b.score !== a.score) return b.score - a.score;
    const fa = a.product.featuredOrder ?? 999;
    const fb = b.product.featuredOrder ?? 999;
    return fa - fb || a.product.id - b.product.id;
  });

  const filteredProducts = scored.map((s) => s.product);
  return {
    products: filteredProducts,
    totalCount: filteredProducts.length,
    facets,
  };
}

export async function getFeaturedProducts(): Promise<CatalogProduct[]> {
  const all = await getAllCatalogProducts();
  return all
    .filter((p) => p.isFeatured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const all = await getAllCatalogProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<CatalogProduct[]> {
  if (slugs.length === 0) return [];
  const all = await getAllCatalogProducts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlug.get(s)).filter((p): p is CatalogProduct => Boolean(p));
}

export async function getRelatedProducts(product: CatalogProduct, limit = 4): Promise<CatalogProduct[]> {
  const all = await getAllCatalogProducts();
  return all
    .filter((p) => p.slug !== product.slug && p.isEdible === product.isEdible && p.isOrderableOnline)
    .sort((a, b) => {
      const aShared = a.categorySlugs.filter((c) => product.categorySlugs.includes(c)).length;
      const bShared = b.categorySlugs.filter((c) => product.categorySlugs.includes(c)).length;
      return bShared - aShared || (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99);
    })
    .slice(0, limit);
}

export async function getVariantsByIds(variantIds: number[]) {
  if (variantIds.length === 0) return [];
  await ensureDbReady();
  const db = getDb();
  return db.select().from(productVariants).where(inArray(productVariants.id, variantIds));
}
