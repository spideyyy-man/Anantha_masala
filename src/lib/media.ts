/**
 * Resolves a product's studio transparent pouch cutout path from its canonical asset filename
 * or generated product image URL, preserving original Assets/ strictly read-only.
 */
export function getCutoutUrlFromAsset(
  productSlug: string,
  assetFile: string,
  size: '420' | '720' = '420'
): string {
  const num = assetFile.replace(/\.jpg$/i, '');
  return `/images/cutouts/${productSlug}-${num}-cutout-${size}.webp`;
}

export function getCutoutUrlFromThumb(
  thumbOrLargeUrl: string,
  size: '420' | '720' = '420'
): string {
  const match = thumbOrLargeUrl.match(/\/images\/products\/(.+)-(?:480|960)\.(?:webp|avif)$/);
  if (!match || !match[1]) return thumbOrLargeUrl;
  return `/images/cutouts/${match[1]}-cutout-${size}.webp`;
}

/**
 * Cohesive Madurai Packaging-First Category Accents.
 * Every packaging stage stays LUMINOUS & WARM so BOTH dark-label pouches (Ulundhu Kali,
 * Kollu Idli Podi) and bright-label pouches (Manjal Podi, Sambar Podi) pop with high contrast!
 */
export interface CategoryTheme {
  stageBg: string;
  stageSolid: string;
  haloColor: string;
  accentHex: string;
  pillBg: string;
  pillText: string;
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'cooking-essentials': {
    stageBg: 'radial-gradient(circle at 50% 48%, #FFF7E4 0%, #F4E4C4 68%, #ECD7B2 100%)',
    stageSolid: '#F5E7CC',
    haloColor: 'rgba(200, 138, 18, 0.22)',
    accentHex: '#9E1B1E',
    pillBg: '#FBEBD1',
    pillText: '#7D3B09',
  },
  'non-veg-masalas': {
    stageBg: 'radial-gradient(circle at 50% 48%, #FFF3EC 0%, #F4DFD3 68%, #EAD0C1 100%)',
    stageSolid: '#F4E1D6',
    haloColor: 'rgba(158, 27, 30, 0.20)',
    accentHex: '#8E1619',
    pillBg: '#FAE2DE',
    pillText: '#8E1619',
  },
  'traditional-podi': {
    stageBg: 'radial-gradient(circle at 50% 48%, #FFF6E8 0%, #F5E1C5 68%, #ECD1AE 100%)',
    stageSolid: '#F5E3C8',
    haloColor: 'rgba(196, 102, 24, 0.20)',
    accentHex: '#A14708',
    pillBg: '#FCE8CE',
    pillText: '#873B06',
  },
  'traditional-food-mixes': {
    stageBg: 'radial-gradient(circle at 50% 48%, #F6FAF2 0%, #E4EFE0 68%, #D4E4CF 100%)',
    stageSolid: '#E7F0E3',
    haloColor: 'rgba(28, 92, 51, 0.18)',
    accentHex: '#1C5C33',
    pillBg: '#E1F0E5',
    pillText: '#174B29',
  },
  'millet-and-flours': {
    stageBg: 'radial-gradient(circle at 50% 48%, #FDF7EE 0%, #EFE1CE 68%, #E4D0B7 100%)',
    stageSolid: '#F0E3D1',
    haloColor: 'rgba(142, 92, 50, 0.20)',
    accentHex: '#72441E',
    pillBg: '#EFE2D1',
    pillText: '#5C3317',
  },
  'healthy-mixes': {
    stageBg: 'radial-gradient(circle at 50% 48%, #FCF4F1 0%, #EFE0DB 68%, #E4CEC7 100%)',
    stageSolid: '#EFE1DC',
    haloColor: 'rgba(120, 48, 56, 0.18)',
    accentHex: '#6E262E',
    pillBg: '#F1DFE2',
    pillText: '#5F1F27',
  },
  pickles: {
    stageBg: 'radial-gradient(circle at 50% 48%, #FFF2EE 0%, #F5DDD6 68%, #EBCBC2 100%)',
    stageSolid: '#F5DFD8',
    haloColor: 'rgba(176, 36, 36, 0.20)',
    accentHex: '#9E1B1E',
    pillBg: '#FADEDB',
    pillText: '#8E1619',
  },
  'traditional-herbal-care': {
    stageBg: 'radial-gradient(circle at 50% 48%, #F9F9EA 0%, #EAEAC9 68%, #DFDFB4 100%)',
    stageSolid: '#ECECCF',
    haloColor: 'rgba(128, 122, 24, 0.20)',
    accentHex: '#525A14',
    pillBg: '#ECEBD0',
    pillText: '#495011',
  },
};

export function getCategoryTheme(slug: string): CategoryTheme {
  return CATEGORY_THEMES[slug] ?? CATEGORY_THEMES['cooking-essentials']!;
}
