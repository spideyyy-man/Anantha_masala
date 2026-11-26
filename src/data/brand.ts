export const BRAND = {
  /** Confirmed brand name: Madurai Anantha Masala. */
  name: 'Anantha Masala',
  fullName: 'Madurai Anantha Masala',
  tamilName: 'மதுரை ஆனந்தா மசாலா',
  socialProfileName: 'Madurai Anantha Masala',
  spellingDiscrepancyNote:
    'Official brand name is "Madurai Anantha Masala" (@madurai_anantha_masala); some earlier packaging labels print "Aanandha".',
  tagline: 'Tradition, in Motion.',
  positioning: 'Traditional South Indian Food for Everyday Living.',
  city: 'Madurai',
  state: 'Tamil Nadu',
  country: 'India',
  /** Printed on 33/35 product labels and public Instagram bio (verify with operator before launch). */
  phoneDisplay: '+91 98438 87337',
  phoneRaw: '9843887337',
  whatsappDigits: '919843887337',
  /** Printed on product packaging labels; confirm exact registered entity address before launch. */
  printedAddressTamil:
    'மதுரை ஆனந்தா மசாலா, மீனாட்சி நகர், அருப்புக்கோட்டை மெயின்ரோடு, வில்லபுரம், மதுரை - 625012',
  printedAddressEnglish:
    'Meenakshi Nagar, Aruppukottai Main Road, Villapuram, Madurai - 625012, Tamil Nadu, India',
  /** Printed on packaging labels; verify validity and scope on FSSAI FoSCoS before launch. */
  printedFssaiNumber: '12423012000494',
  legalEntityStatus: 'Pending business verification (Trading name: Madurai Anantha Masala)',
  gstinStatus: 'Pending business verification',
  grievanceOfficerStatus: 'Pending appointment & contact confirmation before production launch',
  supportEmailPlaceholder: 'Pending official business domain email confirmation (contact +91 98438 87337)',
  social: {
    instagramHandle: '@madurai_anantha_masala',
    instagramUrl: 'https://www.instagram.com/madurai_anantha_masala/',
    youtubeTitle: 'anantha masala madurai',
    youtubeChannelId: 'UC1OQf18IUzjz915mYT2wXLQ',
    youtubeUrl: 'https://www.youtube.com/channel/UC1OQf18IUzjz915mYT2wXLQ',
    snapshotDate: '23 November 2026',
  },
  /** Transparent provisional shipping rules until courier rate card is finalized. */
  shippingRules: {
    isProvisional: true,
    freeShippingThresholdPaise: 49900, // ₹499
    tamilNaduFlatPaise: 4900, // ₹49
    restOfIndiaFlatPaise: 7900, // ₹79
    estimatedDispatchNote:
      'Provisional delivery schedule pending courier partner onboarding: dispatch typically within 1–2 business days from Madurai.',
  },
} as const;

export const SOCIAL_SHOWCASE_ITEMS = [
  {
    id: 'ig-ulundhu-kali',
    platform: 'instagram' as const,
    externalId: 'Df_qqwpgH7m',
    url: 'https://www.instagram.com/reel/Df_qqwpgH7m/',
    title: 'Karuppu Ulundhu & Ulundhu Kali Heritage Mix',
    tamilSubtitle: 'கருப்பு உளுந்து / உளுந்து களி',
    linkedProductSlug: 'ulundhu-kali-maavu',
    linkedCategorySlug: 'healthy-mixes',
    snapshotCaptionNote: 'Public Reel snapshot (23 Nov 2026) highlighting traditional Black Urad Kali preparation.',
    snapshotDuration: '35s',
    previewImage: '/images/products/ulundhu-kali-maavu-22-480.webp',
  },
  {
    id: 'ig-mango-pickle',
    platform: 'instagram' as const,
    externalId: 'Df_vtAwAJip',
    url: 'https://www.instagram.com/reel/Df_vtAwAJip/',
    title: 'Seasonal Mango Pickle Reel',
    tamilSubtitle: 'மாங்காய் ஊறுகாய்',
    linkedProductSlug: null,
    linkedCategorySlug: 'pickles',
    snapshotCaptionNote: 'Public Reel snapshot (23 Nov 2026) featuring Madurai Mango Pickle — online pack pricing pending; enquire on WhatsApp.',
    snapshotDuration: '17s',
    previewImage: '/images/products/tamil-kuzhambu-podi-24-480.webp',
  },
  {
    id: 'ig-kalaka-pickle',
    platform: 'instagram' as const,
    externalId: 'Df74Es5A-CQ',
    url: 'https://www.instagram.com/reel/Df74Es5A-CQ/',
    title: 'Traditional Kalaka Pickle Reel',
    tamilSubtitle: 'களாக்காய் ஊறுகாய்',
    linkedProductSlug: null,
    linkedCategorySlug: 'pickles',
    snapshotCaptionNote: 'Public Reel snapshot (23 Nov 2026) featuring Kalaka Pickle — enquire on WhatsApp for seasonal batch availability.',
    snapshotDuration: '31s',
    previewImage: '/images/products/bhai-veetu-meen-masala-7-480.webp',
  },
  {
    id: 'yt-store-contact',
    platform: 'youtube' as const,
    externalId: '2Or9uDgMvPE',
    url: 'https://www.youtube.com/watch?v=2Or9uDgMvPE',
    title: "Aanandham Store's Kitchen & Direct Contact",
    tamilSubtitle: 'மதுரை ஆனந்தா மசாலா — YouTube',
    linkedProductSlug: 'bhai-veetu-kari-masala',
    linkedCategorySlug: 'cooking-essentials',
    snapshotCaptionNote: 'Public YouTube upload surfaced on channel anantha masala madurai (snapshot 23 Nov 2026).',
    snapshotDuration: '3:03',
    previewImage: '/images/products/sambar-podi-5-480.webp',
  },
] as const;

export const KITCHEN_INSPIRATIONS = [
  {
    slug: 'madurai-bhai-veetu-kuzhambu',
    title: 'Five Traditional Kuzhambu Dishes with One Madurai Masala',
    tamilTitle: 'பாய் வீட்டு மீன் மசாலா — ஐந்து வகை குழம்பு',
    summary:
      'Directly matching the five uses printed on the Bhai Veetu Meen Masala pouch: Sambar, Puli Kuzhambu, Vathal Kuzhambu, Meen Kuzhambu, and Poondu Kuzhambu.',
    usageBasis: 'Printed directly on product pouch (Assets/7.jpg)',
    steps: [
      'Prepare your tamarind, shallot, tomato, and garlic tempering base in gingelly oil as preferred for fish curry or tangy kuzhambu.',
      'Stir in measured spoons of Bhai Veetu Meen Masala on gentle heat until aromatic before adding tamarind extract.',
      'Simmer with fish pieces, garlic pearls, or sundried vathal until oil separates cleanly along the edges.',
    ],
    productSlugs: ['bhai-veetu-meen-masala', 'manjal-podi'],
    heroImage: '/images/products/bhai-veetu-meen-masala-7-960.webp',
    categoryLabel: 'Everyday Curries',
  },
  {
    slug: 'idli-podi-tasting-flight',
    title: 'Five Heritage Idli Podis for Everyday Breakfast',
    tamilTitle: 'இட்லி பொடி வகைகள் — காலை உணவுக்கு',
    summary:
      'Rotate between classic Idli Milagai Podi, toasted Sesame (Ellu), aromatic Garlic (Poondu), Horse Gram (Kollu), and Veldt Grape (Pirandai) podis with warm gingelly oil or ghee.',
    usageBasis: 'Traditional South Indian tiffin pairing across all 5 audited Podi SKUs',
    steps: [
      'Spoon 1–2 teaspoons of your chosen podi into a small brass or steel bowl alongside steaming hot idli or crisp dosa.',
      'Pour cold-pressed gingelly oil (nallennai) or melted ghee and mix to a coarse paste.',
      'Store opened pouches tightly sealed in a cool, dry jar to preserve aroma within the printed Best Before window.',
    ],
    productSlugs: ['idli-milagai-podi', 'poondu-idli-podi', 'ellu-idli-podi', 'kollu-idli-podi', 'pirandai-idli-podi'],
    heroImage: '/images/products/idli-milagai-podi-35-960.webp',
    categoryLabel: 'Idli & Dosa',
  },
  {
    slug: 'heritage-grain-ulundhu-kali',
    title: 'Traditional Ulundhu Kali with Eight Heritage Grains',
    tamilTitle: 'பாரம்பரிய உளுந்து களி தயாரிப்பு',
    summary:
      'Prepared from Madurai Anantha Ulundhu Kali Maavu — whose front label declares Black Urad Dal blended with Karuppu Kavuni, Sivappu Kavuni, Mappillai Samba, Poongar, Kattuyanam, Matta, and Karunguruvai rice.',
    usageBasis: 'Ingredients verified on front label (Assets/22.jpg); standard traditional kali preparation',
    steps: [
      'Whisk Ulundhu Kali Maavu with water into a smooth, lump-free batter before placing on low heat.',
      'Cook slowly while stirring continuously, folding in melted palm jaggery syrup and traditional gingelly oil.',
      'Serve warm as a classic Madurai morning or evening tiffin dish.',
    ],
    productSlugs: ['ulundhu-kali-maavu', 'karuppu-kavuni-kanji-mix', 'kollu-kanji-mix'],
    heroImage: '/images/products/ulundhu-kali-maavu-22-960.webp',
    categoryLabel: 'Heritage Mixes',
  },
  {
    slug: 'sunday-madurai-feast-masalas',
    title: 'Madurai Sunday Feast: Kari Kurma & Crisp Meen Poriyal',
    tamilTitle: 'மட்டன் குருமா & மீன் பொரியல்',
    summary:
      'Pair Bhai Veetu Kari Masala (labelled for Mutton, Chicken & Kurma varieties) with Meen Poriyal Masala for an effortless Madurai weekend table.',
    usageBasis: 'Dish uses printed directly on packaging (Assets/31.jpg, Assets/26.jpg, Assets/11.jpg)',
    steps: [
      'Coat cleaned fish steaks with Meen Poriyal Masala, a splash of lemon juice, and salt; rest 20 minutes before shallow pan-frying.',
      'Slow-simmer mutton or chicken with caramelized shallots, ginger-garlic paste, and Bhai Veetu Kari Masala for rich kurma or gravy.',
      'Finish with fresh curry leaves and serve over steamed rice, idiyappam, or flaky parotta.',
    ],
    productSlugs: ['bhai-veetu-kari-masala', 'meen-poriyal-masala', 'chicken-mutton-masala'],
    heroImage: '/images/products/bhai-veetu-kari-masala-31-960.webp',
    categoryLabel: 'Weekend Specials',
  },
] as const;

export function formatPaiseToInr(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) {
    return 'Price pending';
  }
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

export function formatUnitPricePer100g(pricePaise: number | null, netWeightGrams: number | null): string | null {
  if (!pricePaise || !netWeightGrams || netWeightGrams <= 0) return null;
  const per100gPaise = Math.round((pricePaise / netWeightGrams) * 100);
  return `${formatPaiseToInr(per100gPaise)} / 100g`;
}

export function buildWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${BRAND.whatsappDigits}?text=${encoded}`;
}
