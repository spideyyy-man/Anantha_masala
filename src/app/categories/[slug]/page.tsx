import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageCircle, AlertTriangle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { getAllCategories, getCategoryBySlug, queryCatalog } from '@/domain/catalog/service';
import { BRAND, buildWhatsAppUrl } from '@/data/brand';
import { getCategoryTheme, getCutoutUrlFromThumb } from '@/lib/media';
import { CategoryCollectionCatalog } from '@/components/catalog/CategoryCollectionCatalog';
import { PouchImage } from '@/components/ui/PouchImage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} (${category.tamilName})`,
    description: category.shortDescription,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getAllCategories(),
  ]);
  if (!category) notFound();

  const result = await queryCatalog({ categories: [category.slug] });
  const theme = getCategoryTheme(category.slug);

  // Match the exact 3-pouch composition shown on the Homepage Collection Shelf card
  const heroCutouts: { src: string; fallback: string; alt: string }[] = [
    {
      src: getCutoutUrlFromThumb(category.heroImage, '720'),
      fallback: category.heroImage,
      alt: `${category.name} signature pouch`,
    },
  ];
  const seen = new Set<string>([getCutoutUrlFromThumb(category.heroImage, '420')]);

  for (const prod of result.products) {
    if (heroCutouts.length >= 3) break;
    const raw = prod.images[0]?.thumbUrl;
    if (!raw) continue;
    const key = getCutoutUrlFromThumb(raw, '420');
    if (seen.has(key)) continue;
    seen.add(key);
    heroCutouts.push({ src: key, fallback: raw, alt: prod.name });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Collections', item: `${siteUrl}/categories` },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${siteUrl}/categories/${category.slug}`,
      },
    ],
  };

  return (
    <div className="pb-16" data-connected-category-page={category.slug}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Connected Category Hero Stage — Preserves Exact Card Visual Identity, Palette & 3-Pouch Composition */}
      <header
        data-category-hero-stage={category.slug}
        data-category-dark-surface={theme.darkSurface ? 'true' : 'false'}
        style={{
          background: theme.stageBg,
          viewTransitionName: `collection-stage-${category.slug}`,
        }}
        className={`animate-collection-stage relative overflow-hidden border-b py-12 lg:py-16 ${theme.surfaceClass}`}
      >
        <div
          aria-hidden="true"
          className={`bg-kolam-grain pointer-events-none absolute inset-0 ${
            theme.darkSurface ? 'opacity-20' : 'opacity-60'
          }`}
        />

        {/* Subtle Architectural Watermark Number Matching the Shelf Card */}
        <span
          aria-hidden="true"
          className={`font-display pointer-events-none absolute right-6 top-2 select-none text-[10rem] font-bold leading-none sm:text-[13rem] ${
            theme.darkSurface ? 'text-[#F7CE68]/[0.07]' : 'text-[#9E1B1E]/[0.055]'
          }`}
        >
          {theme.watermarkNum}
        </span>

        {/* Dark Chamber Glow (Non-Veg Masalas) */}
        {theme.darkSurface && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[18%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#F7CE68]/30 blur-3xl"
          />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className={`text-xs ${theme.darkSurface ? 'text-[#E3CEBA]' : 'text-[var(--text-muted)]'}`}
            >
              <Link
                href="/"
                className={`transition-colors duration-[180ms] ${
                  theme.darkSurface ? 'hover:text-[#F7CE68]' : 'hover:text-[var(--brand-crimson)]'
                }`}
              >
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link
                href="/categories"
                className={`transition-colors duration-[180ms] ${
                  theme.darkSurface ? 'hover:text-[#F7CE68]' : 'hover:text-[var(--brand-crimson)]'
                }`}
              >
                Collections
              </Link>
              <span className="mx-2">/</span>
              <span
                className={`font-semibold ${
                  theme.darkSurface ? 'text-white' : 'text-[var(--text-primary)]'
                }`}
              >
                {category.name}
              </span>
            </nav>

            <Link
              href="/#collections-shelf"
              data-back-to-shelf="true"
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all duration-[180ms] ${
                theme.darkSurface
                  ? 'border-white/20 bg-white/10 text-[#FBF5EC] hover:border-[#F7CE68] hover:text-[#F7CE68]'
                  : 'border-[var(--border-strong)] bg-white/80 text-[var(--text-primary)] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Collection Shelf
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Coordinated Copy Column (230ms text arrival) */}
            <div className="animate-collection-copy lg:col-span-7">
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] ${theme.accentTextClass}`}
                >
                  {category.isComingSoonOnly && (
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {theme.eyebrow}
                </span>

                {!category.isEdibleCategory ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-3 py-0.5 text-xs font-bold text-amber-50">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    For External Use Only — Non-Edible Herbal Care
                  </span>
                ) : category.isComingSoonOnly ? (
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-950">
                    Seasonal • WhatsApp Enquiry
                  </span>
                ) : (
                  <span
                    className={`font-mono-num rounded-full px-3 py-0.5 text-xs font-bold ${
                      theme.darkSurface
                        ? 'border border-white/20 bg-white/10 text-[#FBF5EC]'
                        : 'bg-white/85 text-[var(--text-primary)] shadow-xs'
                    }`}
                  >
                    {result.totalCount} {theme.badgeSuffix}
                  </span>
                )}
              </div>

              <p className={`font-tamil text-sm font-bold ${theme.accentTextClass}`}>
                {category.tamilName}
              </p>
              <h1
                style={{ viewTransitionName: `collection-title-${category.slug}` }}
                className={`font-display mt-1 text-3xl font-bold tracking-[-0.02em] sm:text-5xl ${
                  theme.darkSurface ? 'text-white' : 'text-[var(--text-primary)]'
                }`}
              >
                {category.name}
              </h1>
              <p
                className={`mt-3 max-w-2xl text-sm leading-relaxed sm:text-base ${theme.subTextClass}`}
              >
                {category.editorialIntro}
              </p>
              <p
                className={`mt-2 text-xs font-semibold tracking-wide ${theme.accentTextClass}`}
              >
                {theme.tagline}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className={`inline-flex min-h-[42px] items-center gap-2 rounded-full px-5 text-xs font-bold shadow-xs transition-all duration-[180ms] ${
                    theme.darkSurface
                      ? 'bg-[#F7CE68] text-[#23130D] hover:bg-[#fce096]'
                      : 'bg-[var(--brand-crimson)] text-white hover:bg-[var(--brand-crimson-hover)]'
                  }`}
                >
                  Open in Full Pantry Explorer
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Connected 3-Pouch Floating Composition (440-460ms product image choreography) */}
            <div className="relative flex h-[240px] items-center justify-center sm:h-[275px] lg:col-span-5">
              {category.isComingSoonOnly ? (
                <div className="animate-collection-pouch-center flex max-w-xs flex-col items-center rounded-3xl border border-dashed border-[var(--brand-crimson)]/40 bg-white/85 px-6 py-6 text-center shadow-xs">
                  <span className="font-tamil text-xl font-bold text-[var(--brand-crimson)]">
                    மாங்காய் & களாக்காய் ஊறுகாய்
                  </span>
                  <span className="mt-1 text-xs font-bold text-[var(--text-primary)]">
                    Seasonal Madurai Pickle Batches
                  </span>
                  <span className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    Jar photos & online pricing pending • WhatsApp enquiry only
                  </span>
                </div>
              ) : (
                <>
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute h-56 w-56 rounded-full blur-2xl ${
                      theme.darkSurface ? 'bg-[#F7CE68]/25' : 'bg-white/65'
                    }`}
                  />
                  {heroCutouts[1] && (
                    <div
                      style={{ viewTransitionName: `collection-pouch-1-${category.slug}` }}
                      className="animate-collection-pouch-left relative -mr-12 mt-8 h-[175px] w-[135px] sm:h-[195px] sm:w-[150px]"
                    >
                      <PouchImage
                        src={heroCutouts[1].src}
                        fallbackSrc={heroCutouts[1].fallback}
                        alt={heroCutouts[1].alt}
                        width={240}
                        height={320}
                        priority
                        imgClassName={
                          theme.darkSurface ? 'pouch-float-dark' : 'pouch-float-light'
                        }
                      />
                    </div>
                  )}
                  <div
                    style={{ viewTransitionName: `collection-pouch-0-${category.slug}` }}
                    className="animate-collection-pouch-center relative z-20 h-[220px] w-[170px] sm:h-[245px] sm:w-[188px]"
                  >
                    <PouchImage
                      src={heroCutouts[0]!.src}
                      fallbackSrc={heroCutouts[0]!.fallback}
                      alt={heroCutouts[0]!.alt}
                      width={340}
                      height={453}
                      priority
                      imgClassName={
                        theme.darkSurface ? 'pouch-float-dark' : 'pouch-float-light'
                      }
                    />
                  </div>
                  {heroCutouts[2] && (
                    <div
                      style={{ viewTransitionName: `collection-pouch-2-${category.slug}` }}
                      className="animate-collection-pouch-right relative -ml-12 mt-8 h-[175px] w-[135px] sm:h-[195px] sm:w-[150px]"
                    >
                      <PouchImage
                        src={heroCutouts[2].src}
                        fallbackSrc={heroCutouts[2].fallback}
                        alt={heroCutouts[2].alt}
                        width={240}
                        height={320}
                        priority
                        imgClassName={
                          theme.darkSurface ? 'pouch-float-dark' : 'pouch-float-light'
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sibling Collection Quick-Switch Ribbon (Shared System Across All 8 Chapters) */}
          <nav
            aria-label="Switch collection chapter"
            className={`snap-rail -mx-4 mt-8 gap-2 border-t px-4 pt-5 sm:mx-0 sm:flex-wrap sm:px-0 ${theme.borderDividerClass}`}
          >
            {allCategories.map((c, idx) => {
              const active = c.slug === category.slug;
              return (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={`snap-rail-item inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-all duration-[180ms] ${
                    active
                      ? theme.darkSurface
                        ? 'border-[#F7CE68] bg-[#F7CE68] text-[#23130D] shadow-xs'
                        : 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white shadow-xs'
                      : theme.darkSurface
                        ? 'border-white/20 bg-white/10 text-[#FBF5EC] hover:border-[#F7CE68]'
                        : 'border-[var(--border-strong)]/70 bg-white/75 text-[var(--text-secondary)] hover:border-[var(--brand-crimson)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="font-mono-num text-[10px] opacity-75">0{idx + 1}</span>
                  <span>{c.name.split('&')[0]?.trim()}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="animate-collection-grid mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        {category.isComingSoonOnly || result.products.length === 0 ? (
          <section className="rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-crimson)]">
              Pending Pack Photos & Online Pricing
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold text-[var(--text-primary)]">
              Seasonal Madurai Pickles — Enquire Directly
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
              Our Instagram Reels showcase <strong>Mango Pickle</strong> and{' '}
              <strong>Kalaka Pickle</strong>. Because physical pouch photographs, net weights, and
              online MRPs are not yet finalized in our digital catalogue, we do not fabricate prices.
              Message us directly on WhatsApp for today’s seasonal batch availability.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={buildWhatsAppUrl(
                  `Hello ${BRAND.fullName}, I saw your Mango Pickle & Kalaka Pickle Reels on Instagram. Could you share available jar sizes and pricing?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[var(--brand-leaf)] px-6 text-sm font-semibold text-white hover:opacity-95"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Enquire on WhatsApp ({BRAND.phoneDisplay})
              </a>
              <Link
                href="/products"
                className="inline-flex min-h-[46px] items-center rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
              >
                Explore Available Masalas
              </Link>
            </div>
          </section>
        ) : (
          <CategoryCollectionCatalog
            categorySlug={category.slug}
            categoryName={category.name}
            initialProducts={result.products}
          />
        )}
      </div>
    </div>
  );
}
