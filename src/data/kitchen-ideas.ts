export type MealIntentionId = 'all' | 'breakfast' | 'lunch' | 'heritage' | 'feast';

export interface MealIntention {
  id: MealIntentionId;
  label: string;
  tamilLabel: string;
  prompt: string;
}

export interface KitchenIdeaEntry {
  slug: string;
  intention: Exclude<MealIntentionId, 'all'>;
  occasionTag: string;
  title: string;
  tamilTitle: string;
  hookLine: string;
  summary: string;
  bestServedWith: string;
  prepStyle: string;
  usageBasis: string;
  dishImage: string;
  dishAlt: string;
  /** Real product slugs from the audited catalog — primary product first */
  productSlugs: string[];
  steps: string[];
  accentBg: string;
}

export const MEAL_INTENTIONS: MealIntention[] = [
  {
    id: 'all',
    label: 'All Kitchen Ideas',
    tamilLabel: 'அனைத்து சமையல் யோசனைகள்',
    prompt: 'Explore every everyday Madurai dish & the packs behind it',
  },
  {
    id: 'breakfast',
    label: 'Traditional Breakfast',
    tamilLabel: 'காலை டிபன்',
    prompt: 'Idli podis, crispy dosas, steaming red-rice puttu & idiyappam',
  },
  {
    id: 'lunch',
    label: 'Everyday Lunch & Curries',
    tamilLabel: 'மதிய சாப்பாடு & குழம்பு',
    prompt: 'Daily sambar, tangy puli kuzhambu, meen kuzhambu & rasam',
  },
  {
    id: 'heritage',
    label: 'Heritage Tiffin & Porridge',
    tamilLabel: 'பாரம்பரிய களி & கஞ்சி',
    prompt: 'Eight-grain Ulundhu Kali, Karuppu Kavuni & Kollu kanji bowls',
  },
  {
    id: 'feast',
    label: 'Weekend Family Feast',
    tamilLabel: 'ஞாயிறு சிறப்பு சமையல்',
    prompt: 'Rich Madurai Bhai Veetu kari kurma & crisp pan-fried fish',
  },
];

export const KITCHEN_IDEAS: KitchenIdeaEntry[] = [
  {
    slug: 'madurai-bhai-veetu-kuzhambu',
    intention: 'lunch',
    occasionTag: 'Everyday Curries & Lunch',
    title: 'Five Traditional Kuzhambu Dishes with One Masala',
    tamilTitle: 'பாய் வீட்டு மீன் மசாலா — ஐந்து வகை குழம்பு',
    hookLine: 'One versatile Madurai blend for tangy fish curry, garlic kuzhambu, or daily puli kuzhambu.',
    summary:
      'Directly matching the five uses printed on the Bhai Veetu Meen Masala pouch: Sambar, Puli Kuzhambu, Vathal Kuzhambu, Meen Kuzhambu, and Poondu Kuzhambu.',
    bestServedWith: 'Steaming white rice, gingelly oil, and crisp appalam',
    prepStyle: 'Simmered in earthen clay chatti or heavy pot',
    usageBasis: 'Five dish uses printed directly on product pouch (Assets/7.jpg)',
    dishImage: '/images/kitchen/madurai-meen-kuzhambu.webp',
    dishAlt: 'Steaming earthen clay pot of crimson Madurai Meen Kuzhambu with shallots, garlic cloves, and curry leaves',
    productSlugs: ['bhai-veetu-meen-masala', 'manjal-podi', 'tamil-kuzhambu-podi'],
    steps: [
      'Temper fenugreek, shallots, crushed garlic pearls, and ripe tomatoes in warm gingelly oil.',
      'Stir in Bhai Veetu Meen Masala and a pinch of Manjal Podi on gentle heat until fragrant.',
      'Simmer with tamarind extract and fish pieces, garlic pearls, or sundried vathal until oil rises cleanly along the rim.',
    ],
    accentBg: '#F6E5D9',
  },
  {
    slug: 'idli-podi-tasting-flight',
    intention: 'breakfast',
    occasionTag: 'Morning Idli & Dosa',
    title: 'Five Heritage Idli Podis for Everyday Breakfast',
    tamilTitle: 'இட்லி பொடி வகைகள் — காலை உணவுக்கு',
    hookLine: 'Turn steaming idlis or crisp dosas into a Madurai tiffin table in thirty seconds.',
    summary:
      'Rotate across classic Idli Milagai Podi, toasted Sesame (Ellu), aromatic Garlic (Poondu), Horse Gram (Kollu), and Veldt Grape (Pirandai) podis drizzled with cold-pressed gingelly oil or ghee.',
    bestServedWith: 'Soft idlis, crispy roast dosa, uthappam, or hot rice',
    prepStyle: 'Zero-cook pantry pairing — spoon, drizzle oil, enjoy',
    usageBasis: 'Traditional South Indian tiffin pairing across all 5 audited 100g Podi SKUs',
    dishImage: '/images/kitchen/idli-podi-tiffin.webp',
    dishAlt: 'Steamed South Indian idlis and crispy golden dosa on a banana leaf with brass bowls of red milagai podi and gingelly oil',
    productSlugs: ['idli-milagai-podi', 'poondu-idli-podi', 'ellu-idli-podi', 'kollu-idli-podi', 'pirandai-idli-podi'],
    steps: [
      'Spoon 1–2 teaspoons of your chosen Anantha Idli Podi into a small bowl beside piping hot idlis or crisp dosa.',
      'Drizzle cold-pressed gingelly oil (nallennai) or melted ghee and stir into a glossy coarse paste.',
      'Dust generously inside ghee roast dosa or mix with warm rice for a quick weekday lunchbox.',
    ],
    accentBg: '#F7E7CE',
  },
  {
    slug: 'sunday-madurai-feast-masalas',
    intention: 'feast',
    occasionTag: 'Weekend Family Feast',
    title: 'Madurai Sunday Feast: Kari Kurma & Crisp Meen Poriyal',
    tamilTitle: 'மட்டன் குருமா & மீன் பொரியல்',
    hookLine: 'Two dedicated Madurai non-veg spice blends for a memorable weekend lunch table.',
    summary:
      'Pair Bhai Veetu Kari Masala (labelled for Mutton, Chicken & Kurma varieties) with Meen Poriyal Masala for richly spiced gravy alongside crisp pan-seared fish steaks.',
    bestServedWith: 'Steamed rice, flaky parotta, or soft idiyappam',
    prepStyle: '20-minute marinade + slow aromatic kurma simmer',
    usageBasis: 'Dish uses printed directly on packaging (Assets/31.jpg, Assets/26.jpg, Assets/11.jpg)',
    dishImage: '/images/kitchen/madurai-sunday-feast.webp',
    dishAlt: 'Madurai Sunday spread of spiced mutton kari kurma in brass uruli and crisp masala-crusted fried fish on banana leaf',
    productSlugs: ['bhai-veetu-kari-masala', 'meen-poriyal-masala', 'chicken-mutton-masala'],
    steps: [
      'Rub cleaned fish steaks with Meen Poriyal Masala, lemon juice, and salt; rest 20 minutes before shallow pan-frying with curry leaves.',
      'Slow-simmer shallots, ginger-garlic paste, tomatoes, and Bhai Veetu Kari Masala with mutton or chicken until tender.',
      'Finish with fresh coriander and coconut-fennel paste if making traditional Madurai kurma.',
    ],
    accentBg: '#F4DFD5',
  },
  {
    slug: 'heritage-grain-ulundhu-kali',
    intention: 'heritage',
    occasionTag: 'Heritage Grains & Porridge',
    title: 'Eight-Grain Ulundhu Kali & Traditional Morning Kanji',
    tamilTitle: 'பாரம்பரிய உளுந்து களி & கஞ்சி வகைகள்',
    hookLine: 'Rediscover heirloom Tamil grains — Black Urad Dal, Karuppu Kavuni, and Mappillai Samba.',
    summary:
      'Ulundhu Kali Maavu declares eight verified traditional ingredients on its front label (Black Urad Dal + 7 heirloom rice varieties). Pair it with Karuppu Kavuni or Kollu Kanji Mix for comforting warm bowls.',
    bestServedWith: 'Palm jaggery (karupatti) & cold-pressed gingelly oil',
    prepStyle: 'Slow-whisked low-flame traditional stirring',
    usageBasis: '8 grains verified on front label (Assets/22.jpg); standard traditional kali & kanji preparation',
    dishImage: '/images/kitchen/ulundhu-kali.webp',
    dishAlt: 'Glossy dark Tamil Karuppu Ulundhu Kali served warm in a hammered brass bowl with golden gingelly oil and palm jaggery',
    productSlugs: ['ulundhu-kali-maavu', 'karuppu-kavuni-kanji-mix', 'kollu-kanji-mix', 'sathu-maavu-healthy-mix'],
    steps: [
      'Whisk Ulundhu Kali Maavu smoothly with water before placing on low heat so zero lumps form.',
      'Stir steadily as the batter thickens into a glossy dough, folding in melted palm jaggery syrup and gingelly oil.',
      'For quick weekday mornings, whisk Karuppu Kavuni or Kollu Kanji Mix in water and simmer until silky.',
    ],
    accentBg: '#EFE0DC',
  },
  {
    slug: 'red-rice-puttu-idiyappam-morning',
    intention: 'breakfast',
    occasionTag: 'Steamed Heritage Tiffin',
    title: 'Sivappu Arisi Puttu, Idiyappam & Crisp Millet Dosai',
    tamilTitle: 'சிவப்பு அரிசி புட்டு, இடியாப்பம் & தோசை',
    hookLine: 'Steamed red-rice staples and protein-rich adai dosai milled ready for busy mornings.',
    summary:
      'Finely milled Madurai red-rice puttu & idiyappam flours paired with Adai Dosai Maavu and Millet Dosai flour make classic South Indian breakfasts practical on weekdays.',
    bestServedWith: 'Fresh grated coconut, kadala curry, or hot tiffin sambar',
    prepStyle: 'Steamed puttu kuzhal / idiyappam press or cast-iron tawa',
    usageBasis: 'Product usage stated directly on audited flour pouches (Assets/15.jpg, 18.jpg, 23.jpg, 17.jpg)',
    dishImage: '/images/kitchen/red-rice-puttu-idiyappam.webp',
    dishAlt: 'Steaming Sivappu Arisi red rice puttu layered with fresh white coconut alongside red rice idiyappam and golden sambar',
    productSlugs: [
      'sivappu-arisi-puttu-idiyappam-maavu',
      'sivappu-arisi-idiyappam-maavu',
      'adai-dosai-maavu',
      'sirudhaniya-dosai-maavu',
    ],
    steps: [
      'Sprinkle lightly salted water over Sivappu Arisi Puttu Maavu until crumbly like damp sand, layer with grated coconut, and steam.',
      'For soft idiyappam, mix flour with boiling water into a pliable dough, press through an idiappam mould, and steam 6–8 minutes.',
      'Keep Adai Dosai Maavu or Sirudhaniya Dosai Maavu handy for instant crisp cast-iron evening tiffin.',
    ],
    accentBg: '#E7EFE2',
  },
  {
    slug: 'everyday-sambar-rasam-lunch',
    intention: 'lunch',
    occasionTag: 'Daily Madurai Home Lunch',
    title: 'Everyday Madurai Sambar & Aromatic Sourashtra Rasam',
    tamilTitle: 'தினசரி மதுரை சாம்பார் & சவுராஷ்ட்ரா ரசம்',
    hookLine: 'The two aromas that define a classic Madurai home lunch — every single day of the week.',
    summary:
      'Bring together fragrant daily Sambar Podi, distinctive Madurai Sourashtra Rasam Podi, and pure golden Manjal Podi for effortless homestyle lentil sambar and frothy rasam.',
    bestServedWith: 'Hot cooked rice, ghee, and stir-fried seasonal poriyal',
    prepStyle: 'Pressure-cooked toor dal + fresh mustard-curry leaf tempering',
    usageBasis: 'Core culinary uses printed on audited pouches (Assets/5.jpg, 34.jpg, 27.jpg, 14.jpg)',
    dishImage: '/images/kitchen/sambar-rasam-thali.webp',
    dishAlt: 'Steaming golden South Indian vegetable sambar and frothy pepper tomato rasam served with rice on a banana leaf',
    productSlugs: ['sambar-podi', 'sourashtra-rasam-podi', 'kuzhambu-podi', 'manjal-podi'],
    steps: [
      'Simmer seasonal vegetables with tamarind water, Manjal Podi, and Anantha Sambar Podi before folding in mashed toor dal.',
      'For Madurai-style Sourashtra Rasam, bring crushed tomato, tamarind, garlic, and Sourashtra Rasam Podi to a gentle frothy boil (never overboil).',
      'Finish both with crisp mustard seeds, dried red chillies, hing, and fresh curry leaves.',
    ],
    accentBg: '#F6E9D2',
  },
];
