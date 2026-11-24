import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { getCategoryBySlug, queryCatalog } from '@/domain/catalog/service';
import { BRAND, buildWhatsAppUrl } from '@/data/brand';
import { getCategoryTheme, getCutoutUrlFromThumb } from '@/lib/media';
import { ProductCard } from '@/components/cards/ProductCard';
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
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await queryCatalog({ categories: [category.slug] });
  const theme = getCategoryTheme(category.slug);
  const heroCutouts = result.products
    .slice(0, 2)
    .map((p) => getCutoutUrlFromThumb(p.images[0]?.largeUrl || category.heroImage, '420'));
  if (heroCutouts.length === 0) {
    heroCutouts.push(getCutoutUrlFromThumb(category.heroImage, '420'));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${siteUrl}/categories` },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${siteUrl}/categories/${category.slug}`,
      },
    ],
  };

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Category-Specific Sunlit Luminous Hero Stage */}
      <header
        style={{ background: theme.stageBg }}
        className="relative overflow-hidden border-b border-[var(--border-subtle)] py-12 text-[var(--text-primary)] lg:py-16"
      >
        <div
          aria-hidden="true"
          className="bg-kolam-grain pointer-events-none absolute inset-0 opacity-60"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/categories" className="hover:text-[var(--brand-crimson)]">Collections</Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-[var(--text-primary)]">{category.name}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {!category.isEdibleCategory && (
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-3.5 py-1 text-xs font-bold text-amber-50">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  For External Use Only — Non-Edible Herbal Care
                </div>
              )}
              <p className="font-tamil text-sm font-bold text-[var(--brand-crimson)]">
                {category.tamilName}
              </p>
              <h1 className="font-display mt-1 text-3xl font-bold text-[var(--text-primary)] sm:text-5xl">
                {category.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                {category.editorialIntro}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--brand-crimson)] px-5 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-crimson-hover)]"
                >
                  Open in Global Filter Arena
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Floating Category Cutout Pouches on Warm Sunlit Stage (or honest Seasonal emblem for Pickles) */}
            <div className="relative flex h-[230px] items-center justify-center sm:h-[270px] lg:col-span-5">
              {category.isComingSoonOnly ? (
                <div className="flex max-w-xs flex-col items-center rounded-3xl border border-dashed border-[var(--brand-crimson)]/40 bg-white/85 px-6 py-6 text-center shadow-xs">
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
                    className="pointer-events-none absolute h-52 w-52 rounded-full bg-white/65 blur-2xl"
                  />
                  {heroCutouts[1] && (
                    <div className="relative -mr-10 mt-6 h-[195px] w-[150px] -rotate-6">
                      <PouchImage
                        src={heroCutouts[1]}
                        fallbackSrc={result.products[1]?.images[0]?.thumbUrl}
                        alt=""
                        width={240}
                        height={320}
                        priority
                        imgClassName="pouch-float-light"
                      />
                    </div>
                  )}
                  <div className="relative z-10 h-[235px] w-[180px] rotate-2">
                    <PouchImage
                      src={heroCutouts[0]!}
                      fallbackSrc={result.products[0]?.images[0]?.largeUrl || category.heroImage}
                      alt={`${category.name} showcase pouch`}
                      width={340}
                      height={453}
                      priority
                      imgClassName="pouch-float-light"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        {category.isComingSoonOnly || result.products.length === 0 ? (
          <section className="rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center">
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
          <section aria-label={`${category.name} products`}>
            <p className="mb-5 text-xs font-semibold text-[var(--text-muted)]">
              Showing {result.totalCount} verified {result.totalCount === 1 ? 'product' : 'products'}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {result.products.map((product, index) => (
                <ProductCard key={product.id} product={product} priorityImage={index < 4} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
