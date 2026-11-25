import type {
  CatalogCategorySummary,
  CatalogFilterInput,
  CatalogProduct,
} from './service';

/** Curated bilingual Tamil / Romanized / English culinary synonym pairs */
export const SEARCH_SYNONYM_GROUPS: string[][] = [
  ['turmeric', 'turmaric', 'tumeric', 'manjal', 'manjel', 'haldi', 'மஞ்சள்'],
  ['chilli', 'chili', 'chillies', 'milagai', 'milakai', 'mirchi', 'red chilli', 'மிளகாய்'],
  ['garlic', 'poondu', 'poondhu', 'pundu', 'பூண்டு'],
  ['sesame', 'ellu', 'el', 'gingelly', 'til', 'எள்ளு'],
  ['horse gram', 'horsegram', 'kollu', 'kolu', 'kulith', 'கொள்ளு'],
  ['veldt grape', 'pirandai', 'pirandhai', 'perandai', 'adamant creeper', 'பிரண்டை'],
  ['fish', 'meen', 'min', 'seafood', 'மீன்'],
  ['meat', 'kari', 'mutton', 'chicken', 'kurma', 'kuruma', 'korma', 'கறி', 'மட்டன்', 'சிக்கன்'],
  ['black rice', 'karuppu kavuni', 'karupu kavuni', 'kavuni', 'kaavuni', 'கருப்பு கவுனி'],
  ['red rice', 'sivappu arisi', 'sivapu arisi', 'சிகப்பு அரிசி', 'சிவப்பு அரிசி'],
  ['black gram', 'ulundhu', 'ulundu', 'ulunthu', 'urad', 'ulutha', 'உளுந்து'],
  ['millet', 'millets', 'sirudhaniyam', 'sirudhaniya', 'siruthaniya', 'சிறுதானிய'],
  ['dosa', 'dosai', 'thosai', 'adai', 'தோசை', 'அடை'],
  ['idli', 'idly', 'iddli', 'இட்லி'],
  ['podi', 'poddi', 'powder', 'gunpowder', 'chutney powder', 'பொடி'],
  ['curry', 'kuzhambu', 'kulambu', 'kuzhampu', 'kolambu', 'gravy', 'குழம்பு'],
  ['sambar', 'sambhar', 'saambar', 'சாம்பார்'],
  ['rasam', 'rasam podi', 'sourashtra', 'saurashtra', 'savurashtra', 'ரசம்', 'ரசப்'],
  ['porridge', 'kanji', 'conjee', 'malt', 'sathu maavu', 'sathumaavu', 'health mix', 'கஞ்சி', 'சத்து மாவு'],
  ['bath', 'nalangu', 'kuliyal', 'kuzhiyal', 'herbal', 'ubtan', 'குளியல்', 'நலுங்கு'],
  ['pickle', 'pickles', 'oorugai', 'urugai', 'mango', 'kalaka', 'kalakai', 'ஊறுகாய்'],
  ['chapathi', 'chapati', 'chappathi', 'roti', 'atta', 'multigrain', 'சப்பாத்தி'],
  ['puttu', 'putu', 'idiyappam', 'idiyapam', 'idiappam', 'string hopper', 'புட்டு', 'இடியாப்பம்'],
  ['masala', 'masalla', 'masla', 'spice', 'spices', 'blend', ' மசாலா'],
  ['flour', 'flours', 'maavu', 'mavu', 'மாவு'],
];

/**
 * Strips punctuation, normalizes case, and collapses multiple spaces into single spaces.
 * Preserves Tamil Unicode script characters and Latin alphanumeric characters.
 */
export function normalizeSearchText(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’“”|<>+[\]\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * South Indian Romanized phonetic normalization so common spelling variations
 * (e.g., "kuzhambu" vs "kulambu", "ulundhu" vs "ulundu", "chappathi" vs "chapati",
 * "sambhar" vs "sambar", "idly" vs "idli") collapse to a shared phonetic key.
 */
export function toPhoneticKey(token: string): string {
  if (!token || token.length < 3) return token;
  // Only apply Latin phonetic rules to ASCII/Latin tokens
  if (!/^[a-z0-9]+$/.test(token)) return token;
  return token
    .replace(/zh/g, 'l')
    .replace(/dh/g, 'd')
    .replace(/th/g, 't')
    .replace(/bh/g, 'b')
    .replace(/gh/g, 'g')
    .replace(/kh/g, 'k')
    .replace(/ph/g, 'f')
    .replace(/sh/g, 's')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/y$/g, 'i')
    .replace(/([a-z])\1+/g, '$1');
}

/**
 * Bounded Damerau-Levenshtein distance with early exit for fast typo tolerance.
 */
export function boundedEditDistance(a: string, b: string, maxDist = 2): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > maxDist) return maxDist + 1;

  const prevPrev: number[] = new Array(lb + 1).fill(0);
  const prev: number[] = new Array(lb + 1).fill(0);
  const curr: number[] = new Array(lb + 1).fill(0);

  for (let j = 0; j <= lb; j++) prev[j] = j;

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    let rowMin = curr[0];

    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let val = Math.min(
        prev[j]! + 1, // deletion
        curr[j - 1]! + 1, // insertion
        prev[j - 1]! + cost // substitution
      );

      // Adjacent transposition (e.g. "turmaric" / "maslaa")
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        val = Math.min(val, prevPrev[j - 2]! + 1);
      }

      curr[j] = val;
      if (val < rowMin) rowMin = val;
    }

    if (rowMin > maxDist) return maxDist + 1;

    for (let j = 0; j <= lb; j++) {
      prevPrev[j] = prev[j]!;
      prev[j] = curr[j]!;
    }
  }

  return prev[lb]!;
}

/**
 * Pre-compiled search index per product cached in a WeakMap for O(1) reuse across keystrokes.
 */
interface CompiledProductIndex {
  nameNorm: string;
  tamilNorm: string;
  slugNorm: string;
  summaryNorm: string;
  descNorm: string;
  catNorm: string;
  synonymsNorm: string[];
  usageNorm: string[];
  primaryWords: string[];
  primaryPhonetics: string[];
  allWords: string[];
  allPhonetics: string[];
}

const productIndexCache = new WeakMap<CatalogProduct, CompiledProductIndex>();

function getCompiledProductIndex(product: CatalogProduct): CompiledProductIndex {
  const cached = productIndexCache.get(product);
  if (cached) return cached;

  const nameNorm = normalizeSearchText(product.name);
  const tamilNorm = normalizeSearchText(product.tamilName);
  const slugNorm = normalizeSearchText(product.slug);
  const summaryNorm = normalizeSearchText(product.shortSummary);
  const descNorm = normalizeSearchText(product.description);
  const catNorm = normalizeSearchText(product.categorySlugs.join(' '));
  const synonymsNorm = product.searchSynonyms.map(normalizeSearchText).filter(Boolean);
  const usageNorm = product.usageTags.map(normalizeSearchText).filter(Boolean);

  const primaryWordSet = new Set<string>();
  for (const src of [nameNorm, tamilNorm, slugNorm, ...synonymsNorm]) {
    for (const w of src.split(' ')) {
      if (w.length >= 2) primaryWordSet.add(w);
    }
  }
  const primaryWords = Array.from(primaryWordSet);
  const primaryPhonetics = primaryWords.map(toPhoneticKey);

  const allWordSet = new Set<string>(primaryWords);
  for (const src of [summaryNorm, catNorm, ...usageNorm]) {
    for (const w of src.split(' ')) {
      if (w.length >= 2) allWordSet.add(w);
    }
  }
  const allWords = Array.from(allWordSet);
  const allPhonetics = allWords.map(toPhoneticKey);

  const compiled: CompiledProductIndex = {
    nameNorm,
    tamilNorm,
    slugNorm,
    summaryNorm,
    descNorm,
    catNorm,
    synonymsNorm,
    usageNorm,
    primaryWords,
    primaryPhonetics,
    allWords,
    allPhonetics,
  };
  productIndexCache.set(product, compiled);
  return compiled;
}

export function expandSearchTokens(rawQuery: string): string[] {
  const clean = normalizeSearchText(rawQuery);
  if (!clean) return [];
  const baseTokens = clean.split(' ').filter(Boolean);
  const basePhonetics = baseTokens.map(toPhoneticKey);
  const expanded = new Set<string>([clean, ...baseTokens]);

  for (const group of SEARCH_SYNONYM_GROUPS) {
    const normGroup = group.map(normalizeSearchText).filter(Boolean);

    // 1. Prefer exact token or phonetic match first
    let matched = normGroup.some((term) => {
      const termPhonetic = toPhoneticKey(term);
      if (clean === term || (term.includes(' ') && clean.includes(term))) return true;
      return baseTokens.some((t, idx) => {
        if (t === term) return true;
        if (t.length >= 4 && term.length >= 4 && basePhonetics[idx] === termPhonetic) {
          return true;
        }
        return false;
      });
    });

    // 2. Only fall back to bounded edit-distance on longer tokens (>= 5 chars)
    if (!matched) {
      matched = normGroup.some((term) => {
        if (term.length < 5) return false;
        return baseTokens.some((t) => {
          if (t.length < 5) return false;
          const maxDist = t.length >= 7 && term.length >= 7 ? 2 : 1;
          return boundedEditDistance(t, term, maxDist) <= maxDist;
        });
      });
    }

    if (matched) {
      for (const normTerm of normGroup) {
        expanded.add(normTerm);
      }
    }
  }
  return Array.from(expanded);
}

/**
 * Multi-tier relevance ranking supporting:
 * - Case-insensitive and punctuation-normalized matching
 * - Partial prefix/infix product-name matching
 * - Phonetic South Indian spelling variations & Damerau-Levenshtein typo tolerance
 * - Multi-token coverage requirement so gibberish queries return 0 results
 */
export function scoreProductMatch(
  product: CatalogProduct,
  rawQuery: string,
  expandedTokens?: string[]
): number {
  const q = normalizeSearchText(rawQuery);
  if (!q) return 1;

  const idx = getCompiledProductIndex(product);
  const tokens = expandedTokens ?? expandSearchTokens(q);
  const queryTokens = q.split(' ').filter(Boolean);

  let score = 0;

  // Tier 1: Full normalized query phrase match against primary fields
  if (idx.nameNorm === q || idx.tamilNorm === q || idx.slugNorm === q) {
    score += 200;
  } else if (idx.nameNorm.startsWith(q) || idx.tamilNorm.startsWith(q)) {
    score += 150;
  } else if (idx.nameNorm.includes(q) || idx.tamilNorm.includes(q)) {
    score += 115;
  }

  if (idx.synonymsNorm.some((s) => s === q)) {
    score += 130;
  } else if (idx.synonymsNorm.some((s) => s.includes(q))) {
    score += 85;
  }

  if (idx.usageNorm.some((u) => u.includes(q)) || idx.summaryNorm.includes(q)) {
    score += 48;
  }
  if (idx.descNorm.includes(q) || idx.catNorm.includes(q)) {
    score += 24;
  }

  // Tier 2: Per-query-token coverage & fuzzy/phonetic matching
  let matchedQueryTokenCount = 0;

  for (const qt of queryTokens) {
    const qtPhonetic = toPhoneticKey(qt);
    let tokenScore = 0;

    // Direct word prefix or substring on product name / Tamil name
    if (idx.primaryWords.some((w) => w === qt)) {
      tokenScore = Math.max(tokenScore, 65);
    } else if (idx.primaryWords.some((w) => w.startsWith(qt))) {
      tokenScore = Math.max(tokenScore, 52);
    } else if (idx.nameNorm.includes(qt) || idx.tamilNorm.includes(qt)) {
      tokenScore = Math.max(tokenScore, 44);
    } else if (idx.synonymsNorm.some((s) => s.includes(qt))) {
      tokenScore = Math.max(tokenScore, 38);
    } else if (
      qt.length >= 3 &&
      idx.primaryPhonetics.some(
        (ph) => ph === qtPhonetic || (qtPhonetic.length >= 4 && ph.startsWith(qtPhonetic))
      )
    ) {
      // Phonetic spelling match (e.g. "kulambu" -> "kuzhambu", "idly" -> "idli")
      tokenScore = Math.max(tokenScore, 40);
    } else if (qt.length >= 4) {
      // Bounded edit-distance typo tolerance against primary product words
      const maxDist = qt.length >= 6 ? 2 : 1;
      for (const pw of idx.primaryWords) {
        if (pw.length < 3) continue;
        const dist = boundedEditDistance(qt, pw, maxDist);
        if (dist <= maxDist) {
          tokenScore = Math.max(tokenScore, dist === 1 ? 34 : 26);
          break;
        }
      }
    }

    // Secondary fields (usage tags, summary, category)
    if (tokenScore === 0) {
      if (idx.usageNorm.some((u) => u.includes(qt)) || idx.summaryNorm.includes(qt)) {
        tokenScore = Math.max(tokenScore, 22);
      } else if (idx.catNorm.includes(qt) || idx.descNorm.includes(qt)) {
        tokenScore = Math.max(tokenScore, 14);
      } else if (
        qt.length >= 4 &&
        idx.allPhonetics.some((ph) => ph === qtPhonetic)
      ) {
        tokenScore = Math.max(tokenScore, 18);
      }
    }

    if (tokenScore > 0) {
      matchedQueryTokenCount++;
      score += tokenScore;
    }
  }

  // Reward multi-token coverage so products matching ALL query words rank first
  if (queryTokens.length > 1 && matchedQueryTokenCount > 1) {
    score += matchedQueryTokenCount * 75;
  }

  // Tier 3: Synonym expansion boost (capped so large synonym groups don't overpower direct matches)
  let synonymBoost = 0;
  for (const expToken of tokens) {
    if (expToken.length < 2 || expToken === q || queryTokens.includes(expToken)) continue;
    if (idx.nameNorm.includes(expToken) || idx.tamilNorm.includes(expToken)) {
      synonymBoost = Math.max(synonymBoost, 38);
      matchedQueryTokenCount = Math.max(matchedQueryTokenCount, 1);
    } else if (idx.synonymsNorm.some((s) => s.includes(expToken))) {
      synonymBoost = Math.max(synonymBoost, 28);
      matchedQueryTokenCount = Math.max(matchedQueryTokenCount, 1);
    } else if (idx.usageNorm.some((u) => u.includes(expToken))) {
      synonymBoost = Math.max(synonymBoost, 16);
      matchedQueryTokenCount = Math.max(matchedQueryTokenCount, 1);
    } else if (idx.summaryNorm.includes(expToken)) {
      synonymBoost = Math.max(synonymBoost, 10);
    }
  }
  score += synonymBoost;

  // Multi-word queries require at least one direct/synonym match
  if (queryTokens.length === 1 && matchedQueryTokenCount === 0 && score < 24) {
    return 0;
  }
  if (queryTokens.length >= 2 && matchedQueryTokenCount === 0 && score < 35) {
    return 0;
  }

  return score;
}

/**
 * Matches and ranks Collections (`CatalogCategorySummary`) for instant search suggestions
 * so users can navigate directly to a relevant collection as well as individual products.
 */
export function matchCategoriesForQuery(
  categories: CatalogCategorySummary[],
  rawQuery: string
): CatalogCategorySummary[] {
  const q = normalizeSearchText(rawQuery);
  if (!q) return [];
  const expanded = expandSearchTokens(q);
  const qPhonetic = toPhoneticKey(q);

  const scored = categories
    .map((cat) => {
      const nameNorm = normalizeSearchText(cat.name);
      const tamilNorm = normalizeSearchText(cat.tamilName);
      const slugNorm = normalizeSearchText(cat.slug);
      const descNorm = normalizeSearchText(cat.shortDescription);
      const words = `${nameNorm} ${slugNorm}`.split(' ').filter(Boolean);

      let score = 0;
      if (nameNorm === q || tamilNorm === q || slugNorm === q) score += 120;
      else if (nameNorm.startsWith(q) || tamilNorm.startsWith(q)) score += 90;
      else if (nameNorm.includes(q) || tamilNorm.includes(q) || slugNorm.includes(q)) score += 70;
      else if (descNorm.includes(q)) score += 35;

      for (const w of words) {
        if (w.startsWith(q) || (q.length >= 3 && toPhoneticKey(w) === qPhonetic)) {
          score += 40;
        } else if (q.length >= 4 && w.length >= 4 && boundedEditDistance(q, w, 1) <= 1) {
          score += 28;
        }
      }

      for (const token of expanded) {
        if (token.length < 3) continue;
        if (nameNorm.includes(token) || tamilNorm.includes(token)) score += 25;
        else if (descNorm.includes(token)) score += 12;
      }

      return { cat, score };
    })
    .filter((item) => item.score >= 25)
    .sort((a, b) => b.score - a.score || a.cat.sortOrder - b.cat.sortOrder);

  return scored.map((s) => s.cat);
}

/**
 * Pure, deterministic filter and sort engine shared across server SSR (`queryCatalog`),
 * `/products`, `/search`, `/categories/[slug]`, and global instant search suggestions.
 */
export function filterAndSortCatalogProducts(
  sourceProducts: CatalogProduct[],
  input: CatalogFilterInput = {}
): CatalogProduct[] {
  const rawQuery = input.q?.trim() ?? '';
  const normalizedQuery = normalizeSearchText(rawQuery);
  const expandedTokens = expandSearchTokens(normalizedQuery);

  let scored = sourceProducts.map((product) => ({
    product,
    score: normalizedQuery ? scoreProductMatch(product, normalizedQuery, expandedTokens) : 1,
  }));

  if (normalizedQuery) {
    scored = scored.filter((item) => item.score > 0);
  }

  if (input.categories && input.categories.length > 0) {
    const catSet = new Set(input.categories);
    scored = scored.filter(({ product }) =>
      product.categorySlugs.some((slug) => catSet.has(slug))
    );
  }

  if (input.packSizes && input.packSizes.length > 0) {
    const sizeSet = new Set(input.packSizes);
    scored = scored.filter(({ product }) =>
      product.variants.some(
        (v) => v.netWeightGrams !== null && sizeSet.has(v.netWeightGrams)
      )
    );
  }

  if (input.minPriceInr !== undefined && Number.isFinite(input.minPriceInr)) {
    const minPaise = Math.round(input.minPriceInr * 100);
    scored = scored.filter(
      ({ product }) => product.maxPricePaise !== null && product.maxPricePaise >= minPaise
    );
  }

  if (input.maxPriceInr !== undefined && Number.isFinite(input.maxPriceInr)) {
    const maxPaise = Math.round(input.maxPriceInr * 100);
    scored = scored.filter(
      ({ product }) => product.minPricePaise !== null && product.minPricePaise <= maxPaise
    );
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
    scored = scored.filter(({ product }) =>
      product.usageTags.some((u) => useSet.has(u))
    );
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
    if (b.score !== a.score) return b.score - a.score;
    const fa = a.product.featuredOrder ?? 999;
    const fb = b.product.featuredOrder ?? 999;
    return fa - fb || a.product.id - b.product.id;
  });

  return scored.map((s) => s.product);
}
