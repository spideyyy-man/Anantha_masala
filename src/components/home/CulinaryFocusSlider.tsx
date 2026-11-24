'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Check,
  Instagram,
  Youtube,
  ExternalLink,
  Building2,
  Clock,
} from 'lucide-react';
import type { CatalogProduct } from '@/domain/catalog/service';
import { BRAND, SOCIAL_SHOWCASE_ITEMS, formatPaiseToInr } from '@/data/brand';
import { KITCHEN_IDEAS } from '@/data/kitchen-ideas';
import { getCutoutUrlFromThumb } from '@/lib/media';
import { useStore } from '@/components/providers/StoreProviders';
import { PouchImage } from '@/components/ui/PouchImage';

interface CulinaryFocusSliderProps {
  allProducts: CatalogProduct[];
}

/**
 * Part 2.5 — Reworked Editorial Kitchen Focus-Frame + Real Social Moments + Closing Finale.
 * Pairs bespoke South Indian culinary dish photography with layered floating Aanandha Masala
 * pouches and live database pricing/Add-to-Bag controls, guiding seamlessly into Kitchen Ideas.
 */
export function CulinaryFocusSlider({ allProducts }: CulinaryFocusSliderProps) {
  const { addToCart } = useStore();
  const [activeIdx, setActiveIdx] = useState(0);
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  const productBySlug = useMemo(
    () => new Map(allProducts.map((p) => [p.slug, p])),
    [allProducts]
  );

  // Highlight 4 distinct everyday cooking intentions on the homepage
  const spotlightIdeas = useMemo(() => KITCHEN_IDEAS.slice(0, 4), []);
  const current = spotlightIdeas[activeIdx] ?? spotlightIdeas[0]!;

  const linkedProducts = useMemo(
    () =>
      current.productSlugs
        .map((slug) => productBySlug.get(slug))
        .filter((p): p is CatalogProduct => Boolean(p))
        .slice(0, 3),
    [current, productBySlug]
  );

  const primaryProduct = linkedProducts[0];
  const primaryFallback = primaryProduct?.images[0]?.largeUrl || '/images/products/bhai-veetu-meen-masala-7-960.webp';
  const primaryCutout = getCutoutUrlFromThumb(primaryFallback, '720');
  const primaryVariant = primaryProduct?.variants[0];

  const handleQuickAdd = async (prod: CatalogProduct) => {
    const v = prod.variants[0];
    if (!v || !v.isOrderableOnline || addingSlug) return;
    setAddingSlug(prod.slug);
    const ok = await addToCart(v.id, 1, prod.slug);
    setAddingSlug(null);
    if (ok) {
      setAddedSlug(prod.slug);
      setTimeout(() => setAddedSlug(null), 1500);
    }
  };

  return (
    <section
      aria-labelledby="culinary-spotlight-heading"
      className="relative overflow-hidden bg-[#FBF6EE] py-16 text-[var(--text-primary)] lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Editorial Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-crimson)]">
              <ChefHat className="h-4 w-4" aria-hidden="true" />
              Kitchen Focus-Frame • Everyday South Indian Cooking
            </p>
            <h2
              id="culinary-spotlight-heading"
              className="font-display mt-2.5 text-3xl font-bold leading-[1.06] tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl"
            >
              From What You Crave to the Pack That Cooks It.
            </h2>
          </div>
          <Link
            href="/recipes"
            className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-full bg-[var(--bg-deep)] px-5 text-xs font-bold text-[#FBF5EC] transition-colors hover:bg-[var(--brand-crimson)] sm:self-auto"
          >
            Explore All Kitchen Ideas
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Interactive Focus-Frame Meal Tabs */}
        <div
          role="tablist"
          aria-label="Madurai kitchen focus dishes"
          className="snap-rail -mx-4 mt-8 gap-2.5 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {spotlightIdeas.map((idea, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={idea.slug}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`snap-rail-item inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4.5 text-xs font-bold transition-all ${
                  active
                    ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white shadow-sm'
                    : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-crimson)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="font-mono-num opacity-75">0{idx + 1}</span>
                <span>{idea.occasionTag}</span>
              </button>
            );
          })}
        </div>

        {/* Reworked Editorial Focus-Frame Stage: Cinematic Dish Photo + Layered Real Floating Pouch */}
        <div
          key={current.slug}
          className="animate-stage-enter mt-6 grid grid-cols-1 overflow-hidden rounded-[34px] border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-lg lg:grid-cols-12"
        >
          {/* Left 7 Cols: Cinematic South Indian Dish Photography + Anchored Real Pouch Cutout */}
          <div className="relative min-h-[310px] overflow-hidden bg-[#23130D] sm:min-h-[420px] lg:col-span-7 lg:min-h-[500px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.dishImage}
              alt={current.dishAlt}
              width={1200}
              height={900}
              loading="eager"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
            {/* Soft Editorial Bottom Scrim */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#190C07]/85 via-[#190C07]/15 to-transparent"
            />

            {/* Dish Occasion Tag on Top-Left */}
            <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/50 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-[#F7CE68] backdrop-blur-md">
              {current.occasionTag}
            </span>

            {/* Bottom Overlay: Serving Pairing + Floating Real Packaging Integration */}
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
              <div className="max-w-xs text-[#FBF5EC]">
                <p className="font-tamil text-xs font-semibold text-[#F7CE68]">
                  {current.tamilTitle}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#E7D7C4]">
                  <strong className="text-white">Best served with:</strong> {current.bestServedWith}
                </p>
              </div>

              {/* Layered Floating Genuine Pouch Breaking Crisply Over Dish Frame */}
              {primaryProduct && (
                <Link
                  href={`/products/${primaryProduct.slug}`}
                  aria-label={`Inspect ${primaryProduct.name}`}
                  className="group/pack relative hidden shrink-0 items-center gap-3 rounded-2xl border border-white/25 bg-[#FBF6EE]/95 p-2.5 pr-4 text-[var(--text-primary)] shadow-2xl backdrop-blur-md transition-transform hover:-translate-y-1 sm:flex"
                >
                  <div className="relative -mt-8 h-28 w-22 shrink-0">
                    <PouchImage
                      src={primaryCutout}
                      fallbackSrc={primaryFallback}
                      alt={primaryProduct.name}
                      width={200}
                      height={266}
                      priority
                      imgClassName="pouch-float-light transition-transform duration-300 group-hover/pack:scale-105"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-crimson)]">
                      Key Pack Used
                    </span>
                    <p className="font-display text-sm font-bold leading-tight text-[var(--text-primary)]">
                      {primaryProduct.name}
                    </p>
                    <p className="font-mono-num mt-0.5 text-xs font-bold text-[var(--brand-crimson)]">
                      {formatPaiseToInr(primaryVariant?.pricePaise)} • {primaryVariant?.netWeightGrams}g
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Editorial Pitch + Concise Kitchen Notes + Required Packs Dock */}
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 lg:p-9">
            <div>
              <h3 className="font-display text-2xl font-bold leading-[1.15] tracking-[-0.015em] text-[var(--text-primary)] sm:text-[1.85rem]">
                {current.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {current.hookLine}
              </p>

              {/* Concise Traditional Prep Note */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs text-[var(--text-secondary)]">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
                <span>{current.prepStyle}</span>
              </div>

              {/* Required Aanandha Masala Packs — Immediate Path From Craving to Shopping */}
              <div className="mt-5 border-t border-[var(--border-subtle)] pt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Packs for this dish
                </p>
                <div className="mt-3 space-y-2.5">
                  {linkedProducts.map((prod) => {
                    const v = prod.variants[0];
                    const thumb = prod.images[0]?.thumbUrl || '';
                    const isAdded = addedSlug === prod.slug;
                    const isAdding = addingSlug === prod.slug;
                    return (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/70 p-2.5 transition-colors hover:border-[var(--border-strong)]"
                      >
                        <Link
                          href={`/products/${prod.slug}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <div className="h-14 w-11 shrink-0 rounded-lg bg-[#F4E8D6] p-1">
                            <PouchImage
                              src={getCutoutUrlFromThumb(thumb, '420')}
                              fallbackSrc={thumb}
                              alt={prod.name}
                              width={88}
                              height={116}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-bold text-[var(--text-primary)] hover:text-[var(--brand-crimson)]">
                              {prod.name}
                            </p>
                            <p className="font-mono-num text-xs font-semibold text-[var(--text-secondary)]">
                              {formatPaiseToInr(v?.pricePaise)}
                              {v?.netWeightGrams ? ` • ${v.netWeightGrams}g` : ''}
                            </p>
                          </div>
                        </Link>
                        {v?.isOrderableOnline && (
                          <button
                            type="button"
                            onClick={() => void handleQuickAdd(prod)}
                            disabled={Boolean(addingSlug)}
                            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-[var(--brand-crimson)] px-3 text-xs font-bold text-white transition-colors hover:bg-[var(--brand-crimson-hover)] disabled:opacity-60"
                          >
                            {isAdded ? (
                              <>
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                                {isAdding ? '...' : 'Add'}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-[var(--border-subtle)] pt-5">
              <Link
                href={`/recipes#${current.slug}`}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--brand-crimson)] px-5 text-xs font-bold text-white hover:bg-[var(--brand-crimson-hover)]"
              >
                Cook This Dish
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/recipes"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-crimson)]"
              >
                All Kitchen Ideas
              </Link>
            </div>
          </div>
        </div>

        {/* Authentic Instagram & YouTube Community Strip */}
        <div className="mt-16 border-t border-[var(--border-subtle)] pt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-crimson)]">
                From Instagram & YouTube ({BRAND.social.snapshotDate} Snapshot)
              </p>
              <h3 className="font-display mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                Direct Links From {BRAND.social.instagramHandle}
              </h3>
            </div>
            <div className="flex gap-2">
              <a
                href={BRAND.social.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
              >
                <Instagram className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                Instagram
              </a>
              <a
                href={BRAND.social.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
              >
                <Youtube className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                YouTube
              </a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOCIAL_SHOWCASE_ITEMS.map((item) => {
              const cutout = getCutoutUrlFromThumb(item.previewImage, '420');
              return (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs transition-all hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[var(--brand-crimson)]">
                      <span className="inline-flex items-center gap-1">
                        {item.platform === 'instagram' ? (
                          <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Youtube className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {item.platform === 'instagram' ? 'Reel' : 'YouTube'} •{' '}
                        {item.snapshotDuration}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--brand-crimson)]"
                      >
                        Watch <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </div>

                    <div
                      style={{
                        background:
                          'radial-gradient(circle at 50% 45%, #FFFDF9 0%, #F4E8D6 72%, #ECDCC4 100%)',
                      }}
                      className="my-3.5 flex h-38 w-full items-center justify-center rounded-2xl p-3"
                    >
                      <div className="h-full w-26 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                        <PouchImage
                          src={cutout}
                          fallbackSrc={item.previewImage}
                          alt={item.title}
                          width={220}
                          height={293}
                          imgClassName="pouch-float-light"
                        />
                      </div>
                    </div>

                    <h4 className="font-display text-base font-bold text-[var(--text-primary)]">
                      {item.title}
                    </h4>
                    <p className="font-tamil text-xs font-semibold text-[var(--brand-crimson)]">
                      {item.tamilSubtitle}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {item.snapshotCaptionNote}
                    </p>
                  </div>

                  <Link
                    href={
                      item.linkedProductSlug
                        ? `/products/${item.linkedProductSlug}?utm_source=${item.platform}&utm_medium=social&utm_campaign=${item.externalId}`
                        : `/categories/${item.linkedCategorySlug}?utm_source=${item.platform}&utm_medium=social&utm_campaign=${item.externalId}`
                    }
                    className="mt-4 inline-flex items-center gap-1 border-t border-[var(--border-subtle)] pt-3 text-xs font-bold text-[var(--brand-crimson)] hover:underline"
                  >
                    Shop linked item →
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* Monumental Crimson & Deep Tamarind Closing Conversion Finale */}
        <div className="relative mt-14 overflow-hidden rounded-[36px] bg-gradient-to-br from-[#8B1418] via-[#6F1014] to-[#23130D] p-7 text-white shadow-2xl sm:p-12">
          <div
            aria-hidden="true"
            className="bg-brass-lattice pointer-events-none absolute inset-0 opacity-30"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-10 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full bg-[#F7CE68]/25 blur-3xl lg:block"
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#F7CE68]">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Homes, Restaurants & Wholesale
              </p>
              <h2 className="font-display mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">
                Bring Madurai’s Pantry Into Your Kitchen Today.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#F8E2DC] sm:text-base">
                Order single 50g–250g pouches with guest checkout or request direct Madurai bulk
                quotes for restaurants, caterers, and festive gifting.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex min-h-[50px] items-center gap-2 rounded-full bg-[#F7CE68] px-7 text-sm font-bold text-[#23130D] shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#fce096]"
                >
                  Shop All 25 Products
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/wholesale"
                  className="inline-flex min-h-[50px] items-center rounded-full border border-white/35 bg-white/10 px-6 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Bulk & Wholesale Enquiry
                </Link>
              </div>
            </div>

            <div className="relative flex h-[230px] items-center justify-center sm:h-[270px] lg:col-span-5">
              <div className="relative -mr-10 mt-6 h-[185px] w-[140px] -rotate-12">
                <PouchImage
                  src="/images/cutouts/sambar-podi-5-cutout-420.webp"
                  fallbackSrc="/images/products/sambar-podi-5-480.webp"
                  alt="Sambar Podi pouch"
                  width={240}
                  height={320}
                  imgClassName="pouch-float-dark"
                />
              </div>
              <div className="relative z-10 h-[225px] w-[170px]">
                <PouchImage
                  src="/images/cutouts/bhai-veetu-kari-masala-31-cutout-420.webp"
                  fallbackSrc="/images/products/bhai-veetu-kari-masala-31-480.webp"
                  alt="Bhai Veetu Kari Masala pouch"
                  width={280}
                  height={373}
                  imgClassName="pouch-float-dark"
                />
              </div>
              <div className="relative -ml-10 mt-6 h-[185px] w-[140px] rotate-12">
                <PouchImage
                  src="/images/cutouts/idli-milagai-podi-35-cutout-420.webp"
                  fallbackSrc="/images/products/idli-milagai-podi-35-480.webp"
                  alt="Idli Milagai Podi pouch"
                  width={240}
                  height={320}
                  imgClassName="pouch-float-dark"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
