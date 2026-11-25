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
  cardStageBg: string;
  stageSolid: string;
  haloColor: string;
  accentHex: string;
  pillBg: string;
  pillText: string;
  surfaceClass: string;
  darkSurface: boolean;
  eyebrow: string;
  accentTextClass: string;
  subTextClass: string;
  borderDividerClass: string;
  tagline: string;
  badgeSuffix: string;
  watermarkNum: string;
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'cooking-essentials': {
    stageBg: 'radial-gradient(circle at 72% 48%, #FFF8EA 0%, #F5E3C2 58%, #EBD3AB 100%)',
    cardStageBg: 'radial-gradient(circle at 50% 46%, #FFFDF7 0%, #F6E8CC 68%, #ECD8B4 100%)',
    stageSolid: '#F5E3C2',
    haloColor: 'rgba(200, 138, 18, 0.22)',
    accentHex: '#9E1B1E',
    pillBg: '#FBEBD1',
    pillText: '#7D3B09',
    surfaceClass: 'text-[#1F120C] border-[#DFC7A2]',
    darkSurface: false,
    eyebrow: '01 • Everyday Hearth',
    accentTextClass: 'text-[var(--brand-crimson)]',
    subTextClass: 'text-[var(--text-secondary)]',
    borderDividerClass: 'border-[#C8AE86]/45',
    tagline: 'Sambar • Kuzhambu • Rasam • Turmeric',
    badgeSuffix: 'Packs',
    watermarkNum: '01',
  },
  'non-veg-masalas': {
    stageBg:
      'radial-gradient(circle at 52% 40%, rgba(188, 44, 34, 0.62) 0%, rgba(122, 26, 20, 0.48) 45%, #27100C 100%)',
    cardStageBg: 'radial-gradient(circle at 50% 46%, #FFF8F4 0%, #F5E1D6 68%, #EBD0C2 100%)',
    stageSolid: '#27100C',
    haloColor: 'rgba(247, 206, 104, 0.28)',
    accentHex: '#F7CE68',
    pillBg: '#FAE2DE',
    pillText: '#8E1619',
    surfaceClass: 'text-[#FBF5EC] border-[#6B2B22]',
    darkSurface: true,
    eyebrow: '02 • Madurai Signature',
    accentTextClass: 'text-[#F7CE68]',
    subTextClass: 'text-[#E3CEBA]',
    borderDividerClass: 'border-white/15',
    tagline: 'Bhai Veetu Kari • Meen Kuzhambu • Fish Fry',
    badgeSuffix: 'Blends',
    watermarkNum: '02',
  },
  'traditional-podi': {
    stageBg: 'radial-gradient(circle at 50% 38%, #FFF7E8 0%, #F5E0BE 62%, #E8CB9F 100%)',
    cardStageBg: 'radial-gradient(circle at 50% 46%, #FFFBF2 0%, #F6E4C8 68%, #ECD2AD 100%)',
    stageSolid: '#F5E0BE',
    haloColor: 'rgba(196, 102, 24, 0.20)',
    accentHex: '#9A4208',
    pillBg: '#FCE8CE',
    pillText: '#873B06',
    surfaceClass: 'text-[#1F120C] border-[#DFC49F]',
    darkSurface: false,
    eyebrow: '03 • Morning Tiffin',
    accentTextClass: 'text-[#9A4208]',
    subTextClass: 'text-[var(--text-secondary)]',
    borderDividerClass: 'border-[#C8A677]/45',
    tagline: 'Milagai • Poondu • Ellu • Kollu • Pirandai',
    badgeSuffix: 'Podis',
    watermarkNum: '03',
  },
  'traditional-food-mixes': {
    stageBg: 'radial-gradient(circle at 70% 46%, #F7FBF4 0%, #E3EFE0 58%, #CFE2CA 100%)',
    cardStageBg: 'radial-gradient(circle at 50% 46%, #FBFDF9 0%, #E6F1E3 68%, #D6E6D2 100%)',
    stageSolid: '#E3EFE0',
    haloColor: 'rgba(28, 92, 51, 0.18)',
    accentHex: '#1C5C33',
    pillBg: '#E1F0E5',
    pillText: '#174B29',
    surfaceClass: 'text-[#16271C] border-[#C4D8C1]',
    darkSurface: false,
    eyebrow: '04 • Ready Tiffin & Mixes',
    accentTextClass: 'text-[var(--brand-leaf)]',
    subTextClass: 'text-[#2F4737]',
    borderDividerClass: 'border-[#9BB99A]/45',
    tagline: 'Adai Dosai • Red Rice Puttu • Millet Tiffin',
    badgeSuffix: 'Mixes',
    watermarkNum: '04',
  },
  'millet-and-flours': {
    stageBg: 'radial-gradient(circle at 64% 48%, #FDF8F0 0%, #EFE1CE 60%, #E2CEB4 100%)',
    cardStageBg: 'radial-gradient(circle at 50% 46%, #FFFDF8 0%, #F1E4D3 68%, #E5D3BC 100%)',
    stageSolid: '#EFE1CE',
    haloColor: 'rgba(142, 92, 50, 0.20)',
    accentHex: '#72441E',
    pillBg: '#EFE2D1',
    pillText: '#5C3317',
    surfaceClass: 'text-[#1F120C] border-[#DAC6AD]',
    darkSurface: false,
    eyebrow: '05 • Heritage Milling',
    accentTextClass: 'text-[#72441E]',
    subTextClass: 'text-[var(--text-secondary)]',
    borderDividerClass: 'border-[#C4AE90]/45',
    tagline: 'Red Rice Puttu • Idiyappam • Multigrain Chapathi',
    badgeSuffix: 'Flours',
    watermarkNum: '05',
  },
  'healthy-mixes': {
    stageBg: 'radial-gradient(circle at 54% 46%, #FCF5F2 0%, #EFE0DB 58%, #E1CBC4 100%)',
    cardStageBg: 'radial-gradient(circle at 50% 46%, #FFFaf8 0%, #F1E3DE 68%, #E4D0C9 100%)',
    stageSolid: '#EFE0DB',
    haloColor: 'rgba(120, 48, 56, 0.18)',
    accentHex: '#6E262E',
    pillBg: '#F1DFE2',
    pillText: '#5F1F27',
    surfaceClass: 'text-[#1F120C] border-[#DBC4BE]',
    darkSurface: false,
    eyebrow: '06 • Heirloom Grains',
    accentTextClass: 'text-[#6E262E]',
    subTextClass: 'text-[var(--text-secondary)]',
    borderDividerClass: 'border-[#C4A59D]/45',
    tagline: 'Ulundhu Kali • Karuppu Kavuni • Kollu • Sathu Maavu',
    badgeSuffix: 'Mixes',
    watermarkNum: '06',
  },
  pickles: {
    stageBg: 'radial-gradient(circle at 68% 45%, #FFF4EE 0%, #F5DED5 60%, #E9C7BC 100%)',
    cardStageBg: 'radial-gradient(circle at 50% 46%, #FFF9F6 0%, #F6E1D9 68%, #ECCDC3 100%)',
    stageSolid: '#F5DED5',
    haloColor: 'rgba(176, 36, 36, 0.20)',
    accentHex: '#9E1B1E',
    pillBg: '#FADEDB',
    pillText: '#8E1619',
    surfaceClass: 'text-[#1F120C] border-[#DFBFB5]',
    darkSurface: false,
    eyebrow: '07 • Seasonal Small Batch',
    accentTextClass: 'text-[var(--brand-crimson)]',
    subTextClass: 'text-[var(--text-secondary)]',
    borderDividerClass: 'border-[#D5AEA2]/50',
    tagline: 'Mango & Kalaka Pickles • Seasonal WhatsApp Enquiry',
    badgeSuffix: 'Seasonal',
    watermarkNum: '07',
  },
  'traditional-herbal-care': {
    stageBg: 'radial-gradient(circle at 62% 48%, #FAFAE9 0%, #EAEAC9 60%, #DDDDAA 100%)',
    cardStageBg: 'radial-gradient(circle at 50% 46%, #FDFDF2 0%, #EEEECE 68%, #E2E2B8 100%)',
    stageSolid: '#EAEAC9',
    haloColor: 'rgba(128, 122, 24, 0.20)',
    accentHex: '#525A14',
    pillBg: '#ECEBD0',
    pillText: '#495011',
    surfaceClass: 'text-[#21250E] border-[#CECEAA]',
    darkSurface: false,
    eyebrow: '08 • External Bath Care',
    accentTextClass: 'text-[#525A14]',
    subTextClass: 'text-[#464A21]',
    borderDividerClass: 'border-[#BFC092]/55',
    tagline: 'For External Bathing Use Only • Non-Edible',
    badgeSuffix: 'External',
    watermarkNum: '08',
  },
};

export function getCategoryTheme(slug: string): CategoryTheme {
  return CATEGORY_THEMES[slug] ?? CATEGORY_THEMES['cooking-essentials']!;
}
