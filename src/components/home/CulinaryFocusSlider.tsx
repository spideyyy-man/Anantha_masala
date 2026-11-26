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
  Utensils,
} from 'lucide-react';
import type { CatalogProduct } from '@/domain/catalog/service';
import { BRAND, SOCIAL_SHOWCASE_ITEMS, formatPaiseToInr } from '@/data/brand';
import { KITCHEN_IDEAS } from '@/data/kitchen-ideas';
import { getCutoutUrlFromThumb } from '@/lib/media';
import { useStore } from '@/components/providers/StoreProviders';
import { PouchImage } from '@/components/ui/PouchImage';

interface CulinaryFocusSliderProps {
  allProducts: CatalogProduct[];
  mode?: 'full' | 'storytelling-only' | 'recipes-and-finale';
}

/**
 * Cohesive Homepage Food Storytelling (Chapter 02) & Everyday Madurai Recipes + Finale (Chapter 04).
 * Connects authentic South Indian dish photography directly to the exact Aanandha Masala pouches
 * and verified label instructions that cook them.
 */
export function CulinaryFocusSlider({
  allProducts,
  mode = 'full',
}: CulinaryFocusSliderProps) {
  const { addToCart } = useStore();
  const [activeIdx, setActiveIdx] = useState(0);
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  const productBySlug = useMemo(
    () => new Map(allProducts.map((p) => [p.slug, p])),
    [allProducts]
  );

  // All 6 authentic Madurai cooking intentions available in the Focus-Frame
  const spotlightIdeas = useMemo(() => KITCHEN_IDEAS, []);
  const current = spotlightIdeas[activeIdx] ?? spotlightIdeas[0]!;

  // Curated 3-card editorial recipe grid for Chapter 04
  const recipeGridIdeas = useMemo(
    () => [
      KITCHEN_IDEAS[4]!, // Sivappu Arisi Puttu, Idiyappam & Crisp Millet Dosai
      KITCHEN_IDEAS[5]!, // Everyday Madurai Sambar & Aromatic Sourashtra Rasam
      KITCHEN_IDEAS[2]!, // Madurai Sunday Feast: Kari Kurma & Crisp Meen Poriyal
    ],
    []
  );

  const linkedProducts = useMemo(
    () =>
      current.productSlugs
        .map((slug) => productBySlug.get(slug))
        .filter((p): p is CatalogProduct => Boolean(p))
        .slice(0, 3),
    [current, productBySlug]
  );

  const primaryProduct = linkedProducts[0];
  const primaryFallback =
    primaryProduct?.images[0]?.largeUrl || '/images/products/bhai-veetu-meen-masala-7-960.webp';
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
      window.setTimeout(() => setAddedSlug(null), 1500);
    }
  };

  const showStorytelling = mode === 'full' || mode === 'storytelling-only';
  const showRecipesAndFinale = mode === 'full' || mode === 'recipes-and-finale';

  return (
    <>
      {showStorytelling && (
        <section
          id="food-storytelling"
          aria-labelledby="culinary-spotlight-heading"
          className="relative overflow-hidden bg-[#FBF6EE] py-14 text-[var(--text-primary)] lg:py-18"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {/* Section Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-crimson)]">
                  <ChefHat className="h-4 w-4" aria-hidden="true" />
                  Kitchen Ideas
                </p>
                <h2
                  id="culinary-spotlight-heading"
                  className="font-display mt-1.5 text-2xl font-bold leading-tight tracking-[-0.015em] text-[var(--text-primary)] sm:text-3xl lg:text-4xl"
                >
                  What You Can Cook With Our Masalas
                </h2>
              </div>
              <Link
                href="/recipes"
                className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-full bg-[var(--bg-deep)] px-5 text-xs font-bold text-[#FBF5EC] transition-colors duration-[180ms] hover:bg-[var(--brand-crimson)] sm:self-auto"
              >
                All Kitchen Ideas
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Interactive 6-Dish Focus-Frame Meal Tabs */}
            <div
              role="tablist"
              aria-label="Madurai kitchen focus dishes"
              className="snap-rail -mx-4 mt-7 gap-2 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
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
                    className={`snap-rail-item inline-flex min-h-[42px] items-center gap-2 rounded-full border px-4 text-xs font-bold transition-all duration-[180ms] ${
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

            {/* Editorial Focus-Frame Stage: Cinematic Dish Photo + Layered Pouches + 3-Step Method */}
            <div
              key={current.slug}
              className="animate-stage-enter mt-6 grid grid-cols-1 overflow-hidden rounded-[34px] border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-lg lg:grid-cols-12"
            >
              {/* Left 7 Cols: Cinematic South Indian Dish Photography + Anchored Real Pouch Cutout */}
              <div className="relative min-h-[340px] overflow-hidden bg-[#23130D] sm:min-h-[450px] lg:col-span-7 lg:min-h-[560px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.dishImage}
                  alt={current.dishAlt}
                  width={1200}
                  height={900}
                  loading="eager"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
                {/* Soft Editorial Bottom & Top Scrim */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#160B06]/90 via-[#190C07]/20 to-[#160B06]/40"
                />

                {/* Top Badge: Occasion */}
                <div className="absolute inset-x-5 top-5 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-white/25 bg-black/55 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-[#F7CE68] backdrop-blur-md">
                    {current.occasionTag}
                  </span>
                </div>

                {/* Bottom Overlay: Serving Pairing + Floating Real Packaging Integration */}
                <div className="absolute inset-x-5 bottom-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div className="max-w-sm text-[#FBF5EC]">
                    <p className="font-tamil text-sm font-bold text-[#F7CE68]">
                      {current.tamilTitle}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#EEDFCE]">
                      <strong className="text-white">Best served with:</strong>{' '}
                      {current.bestServedWith}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-[#D7C2AA]">
                      <Clock className="h-3 w-3 text-[#F7CE68]" aria-hidden="true" />
                      {current.prepStyle}
                    </p>
                  </div>

                  {/* Layered Floating Genuine Pouch Breaking Crisply Over Dish Frame */}
                  {primaryProduct && (
                    <Link
                      href={`/products/${primaryProduct.slug}`}
                      aria-label={`Inspect ${primaryProduct.name}`}
                      className="group/pack relative flex shrink-0 items-center gap-3 self-start rounded-2xl border border-white/30 bg-[#FBF6EE]/96 p-2.5 pr-4 text-[var(--text-primary)] shadow-2xl backdrop-blur-md transition-transform duration-[220ms] hover:-translate-y-1 sm:self-auto"
                    >
                      <div className="relative -mt-6 h-24 w-19 shrink-0 sm:-mt-8 sm:h-28 sm:w-22">
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
                          {formatPaiseToInr(primaryVariant?.pricePaise)}
                          {primaryVariant?.netWeightGrams
                            ? ` • ${primaryVariant.netWeightGrams}g`
                            : ''}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right 5 Cols: Editorial Story + 3-Step Cooking Method + Required Packs Dock */}
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 lg:p-8">
                <div>
                  <h3 className="font-display text-2xl font-bold leading-[1.15] tracking-[-0.015em] text-[var(--text-primary)] sm:text-[1.75rem]">
                    {current.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {current.summary}
                  </p>

                  {/* 3-Step Traditional Madurai Method — Connects the Masala to the Cooking Process */}
                  <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/85 p-3.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-crimson)]">
                      <Utensils className="h-3.5 w-3.5" aria-hidden="true" />
                      How Madurai Cooks It (3 Simple Steps)
                    </p>
                    <ol className="mt-2.5 space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {current.steps.map((stepText, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="font-mono-num mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-crimson-soft)] text-[10px] font-bold text-[var(--brand-crimson)]">
                            {sIdx + 1}
                          </span>
                          <span>{stepText}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Required Aanandha Masala Packs — Immediate Path From Craving to Shopping */}
                  <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Packs for this dish ({linkedProducts.length})
                    </p>
                    <div className="mt-2.5 space-y-2">
                      {linkedProducts.map((prod) => {
                        const v = prod.variants[0];
                        const thumb = prod.images[0]?.thumbUrl || '';
                        const isAdded = addedSlug === prod.slug;
                        const isAdding = addingSlug === prod.slug;
                        return (
                          <div
                            key={prod.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/70 p-2 transition-colors duration-[180ms] hover:border-[var(--border-strong)]"
                          >
                            <Link
                              href={`/products/${prod.slug}`}
                              className="flex min-w-0 flex-1 items-center gap-2.5"
                            >
                              <div className="h-12 w-10 shrink-0 rounded-lg bg-[#F4E8D6] p-1">
                                <PouchImage
                                  src={getCutoutUrlFromThumb(thumb, '420')}
                                  fallbackSrc={thumb}
                                  alt={prod.name}
                                  width={80}
                                  height={106}
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
                                className={`inline-flex h-9 min-w-[78px] shrink-0 items-center justify-center gap-1 rounded-xl px-3 text-xs font-bold text-white transition-all duration-[180ms] disabled:opacity-60 ${
                                  isAdded
                                    ? 'bg-[var(--brand-leaf)]'
                                    : 'bg-[var(--brand-crimson)] hover:bg-[var(--brand-crimson-hover)]'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                                    {isAdding ? '…' : 'Add'}
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

                <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-[var(--border-subtle)] pt-4">
                  <Link
                    href={`/recipes#${current.slug}`}
                    className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--brand-crimson)] px-5 text-xs font-bold text-white transition-colors duration-[180ms] hover:bg-[var(--brand-crimson-hover)]"
                  >
                    Open Full Recipe Card
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/recipes"
                    className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-xs font-bold text-[var(--text-primary)] transition-colors duration-[180ms] hover:border-[var(--brand-crimson)]"
                  >
                    All Kitchen Ideas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {showRecipesAndFinale && (
        <section
          id="recipes-showcase"
          aria-labelledby="recipes-showcase-heading"
          className="relative overflow-hidden bg-gradient-to-b from-[#FBF6EE] via-[#F5EBDC] to-[#23130D] pt-12 pb-16 text-[var(--text-primary)] lg:pt-16 lg:pb-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {/* Everyday Recipes Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-crimson)]">
                  Recipes
                </p>
                <h2
                  id="recipes-showcase-heading"
                  className="font-display mt-1.5 text-2xl font-bold leading-tight tracking-[-0.015em] text-[var(--text-primary)] sm:text-3xl"
                >
                  More Madurai Dishes to Try
                </h2>
              </div>
              <Link
                href="/recipes"
                className="inline-flex min-h-[42px] items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4.5 text-xs font-bold text-[var(--text-primary)] transition-colors duration-[180ms] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)] sm:self-auto"
              >
                View All Recipes
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* 3-Card Editorial Recipe & Pouch Pairing Grid */}
            <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-3">
              {recipeGridIdeas.map((idea) => {
                const leadProd = productBySlug.get(idea.productSlugs[0] ?? '');
                const leadThumb = leadProd?.images[0]?.thumbUrl || '';
                const leadCutout = leadThumb ? getCutoutUrlFromThumb(leadThumb, '420') : '';
                const leadPrice = leadProd?.variants[0]?.pricePaise;

                return (
                  <article
                    key={idea.slug}
                    className="group flex flex-col justify-between overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm transition-all duration-[260ms] hover:-translate-y-1 hover:border-[var(--brand-crimson)]/40 hover:shadow-xl"
                  >
                    <div>
                      {/* Dish Photograph + Floating Linked Pouch Badge */}
                      <Link
                        href={`/recipes#${idea.slug}`}
                        className="relative block h-52 w-full overflow-hidden bg-[#23130D]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={idea.dishImage}
                          alt={idea.dishAlt}
                          width={640}
                          height={420}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#190C07]/85 via-transparent to-black/25"
                        />
                        <span className="absolute left-3.5 top-3.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F7CE68] backdrop-blur-md">
                          {idea.occasionTag}
                        </span>

                        {leadProd && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl border border-white/25 bg-[#FBF6EE]/95 px-2.5 py-1.5 text-[var(--text-primary)] shadow-lg backdrop-blur-md">
                            <div className="h-10 w-8 shrink-0">
                              <PouchImage
                                src={leadCutout}
                                fallbackSrc={leadThumb}
                                alt={leadProd.name}
                                width={64}
                                height={86}
                              />
                            </div>
                            <div className="pr-1">
                              <p className="max-w-[125px] truncate text-[11px] font-bold leading-tight text-[var(--text-primary)]">
                                {leadProd.name}
                              </p>
                              <p className="font-mono-num text-[10px] font-bold text-[var(--brand-crimson)]">
                                {formatPaiseToInr(leadPrice)}
                              </p>
                            </div>
                          </div>
                        )}
                      </Link>

                      <div className="p-5">
                        <p className="font-tamil text-xs font-bold text-[var(--brand-crimson)]">
                          {idea.tamilTitle}
                        </p>
                        <h3 className="font-display mt-1 text-lg font-bold leading-snug text-[var(--text-primary)] group-hover:text-[var(--brand-crimson)]">
                          <Link href={`/recipes#${idea.slug}`}>{idea.title}</Link>
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                          {idea.hookLine}
                        </p>
                        <p className="mt-3 rounded-xl bg-[var(--bg-canvas)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
                          <strong className="text-[var(--text-primary)]">Serve with:</strong>{' '}
                          {idea.bestServedWith}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]">
                        <Clock className="h-3 w-3 text-[var(--brand-crimson)]" aria-hidden="true" />
                        3-Step Method
                      </span>
                      <Link
                        href={`/recipes#${idea.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-crimson)] hover:underline"
                      >
                        Read Recipe <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Instagram & YouTube Community Strip */}
            <div className="mt-12 rounded-[28px] border border-[var(--border-strong)] bg-[#FBF6EE] p-6 shadow-md sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-crimson)]">
                    Instagram & YouTube
                  </p>
                  <h3 className="font-display mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                    Follow {BRAND.social.instagramHandle}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <a
                    href={BRAND.social.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-xs font-bold text-[var(--text-primary)] transition-colors duration-[180ms] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
                  >
                    <Instagram className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                    Instagram
                  </a>
                  <a
                    href={BRAND.social.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-xs font-bold text-[var(--text-primary)] transition-colors duration-[180ms] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
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
                      className="group flex flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs transition-all duration-[220ms] hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-md"
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
                        <p className="font-tamil mt-0.5 text-xs font-semibold text-[var(--brand-crimson)]">
                          {item.tamilSubtitle}
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

            {/* Monumental Crimson & Deep Tamarind Closing Conversion Finale -> Connects Directly Into Footer */}
            <div className="relative mt-12 overflow-hidden rounded-[36px] border border-[#F7CE68]/25 bg-gradient-to-br from-[#8B1418] via-[#6F1014] to-[#23130D] p-7 text-white shadow-2xl sm:p-12">
              <div
                aria-hidden="true"
                className="bg-brass-lattice pointer-events-none absolute inset-0 opacity-20"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-10 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full bg-[#F7CE68]/25 blur-3xl lg:block"
              />

              <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7CE68]">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                    Villapuram, Madurai
                  </p>
                  <h2 className="font-display mt-2.5 text-2xl font-bold leading-tight text-white sm:text-4xl">
                    Order Fresh From Madurai Today.
                  </h2>
                  <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-[#F8E2DC]">
                    Order 50g–250g packs directly on WhatsApp, or contact us for restaurant,
                    catering, and bulk supply.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/products"
                      className="inline-flex min-h-[50px] items-center gap-2 rounded-full bg-[#F7CE68] px-7 text-sm font-bold text-[#23130D] shadow-lg transition-transform duration-[180ms] hover:scale-[1.02] hover:bg-[#fce096]"
                    >
                      Shop All 25 Products
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/wholesale"
                      className="inline-flex min-h-[50px] items-center rounded-full border border-white/35 bg-white/10 px-6 text-sm font-semibold text-white transition-colors duration-[180ms] hover:bg-white/20"
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
      )}
    </>
  );
}
