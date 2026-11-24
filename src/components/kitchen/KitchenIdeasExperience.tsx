'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  ShoppingBag,
  Check,
  ArrowUpRight,
  Clock,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import type { CatalogProduct } from '@/domain/catalog/service';
import { BRAND, buildWhatsAppUrl, formatPaiseToInr } from '@/data/brand';
import {
  KITCHEN_IDEAS,
  MEAL_INTENTIONS,
  type KitchenIdeaEntry,
  type MealIntentionId,
} from '@/data/kitchen-ideas';
import { getCutoutUrlFromThumb } from '@/lib/media';
import { useStore } from '@/components/providers/StoreProviders';
import { PouchImage } from '@/components/ui/PouchImage';

interface KitchenIdeasExperienceProps {
  products: CatalogProduct[];
}

function getShortShelfLife(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (/4\s*Months.*6\s*Months/i.test(raw)) return '4–6 Months shelf life';
  const m = raw.match(/(\d+\s*Months?)/i);
  return m ? `${m[1]} shelf life` : null;
}

export function KitchenIdeasExperience({ products }: KitchenIdeasExperienceProps) {
  const { addToCart, trackEvent } = useStore();
  const [selectedIntention, setSelectedIntention] = useState<MealIntentionId>('all');
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    'madurai-bhai-veetu-kuzhambu': true,
    'idli-podi-tasting-flight': true,
  });
  const [addingVariantId, setAddingVariantId] = useState<number | null>(null);
  const [addedVariantId, setAddedVariantId] = useState<number | null>(null);
  const [addingBundleSlug, setAddingBundleSlug] = useState<string | null>(null);
  const [addedBundleSlug, setAddedBundleSlug] = useState<string | null>(null);

  const productBySlug = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products]
  );

  const filteredIdeas = useMemo(() => {
    if (selectedIntention === 'all') return KITCHEN_IDEAS;
    return KITCHEN_IDEAS.filter((idea) => idea.intention === selectedIntention);
  }, [selectedIntention]);

  const countsByIntention = useMemo(() => {
    const counts: Record<MealIntentionId, number> = {
      all: KITCHEN_IDEAS.length,
      breakfast: 0,
      lunch: 0,
      heritage: 0,
      feast: 0,
    };
    for (const idea of KITCHEN_IDEAS) {
      counts[idea.intention] += 1;
    }
    return counts;
  }, []);

  const toggleSteps = (slug: string) => {
    setExpandedSteps((prev) => ({ ...prev, [slug]: !prev[slug] }));
    trackEvent({ eventName: 'recipe_view', path: `/recipes#${slug}` });
  };

  const handleAddSingle = async (prod: CatalogProduct) => {
    const v = prod.variants[0];
    if (!v || !v.isOrderableOnline || addingVariantId) return;
    setAddingVariantId(v.id);
    const ok = await addToCart(v.id, 1, prod.slug);
    setAddingVariantId(null);
    if (ok) {
      setAddedVariantId(v.id);
      setTimeout(() => setAddedVariantId(null), 1500);
    }
  };

  const handleAddDishBundle = async (idea: KitchenIdeaEntry, linked: CatalogProduct[]) => {
    const orderable = linked
      .slice(0, 2)
      .map((p) => ({ product: p, variant: p.variants[0] }))
      .filter((x) => x.variant && x.variant.isOrderableOnline && x.variant.pricePaise !== null);
    if (orderable.length === 0 || addingBundleSlug) return;

    setAddingBundleSlug(idea.slug);
    let addedAny = false;
    for (const item of orderable) {
      const ok = await addToCart(item.variant!.id, 1, item.product.slug);
      if (ok) addedAny = true;
    }
    setAddingBundleSlug(null);
    if (addedAny) {
      setAddedBundleSlug(idea.slug);
      setTimeout(() => setAddedBundleSlug(null), 1800);
    }
  };

  return (
    <div className="pb-20">
      {/* =====================================================================
          EDITORIAL CULINARY HERO — "What would you like to cook today?"
          ===================================================================== */}
      <header className="relative overflow-hidden bg-[#22110B] text-[#FBF5EC]">
        {/* Ambient Dish Photography Backdrop with Editorial Warm Gradient */}
        <div className="absolute inset-0 z-0 opacity-35">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/kitchen/madurai-sunday-feast.webp"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#1C0D08]/95 via-[#22110B]/88 to-[#22110B]/70"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-[#D6C1AA]">
            <Link href="/" className="hover:text-[#F7CE68]">Home</Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-white">Kitchen Ideas</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#F7CE68]">
                <ChefHat className="h-4 w-4" aria-hidden="true" />
                Madurai Kitchen Ideas • From Craving to Pantry
              </p>
              <h1 className="animate-heading-reveal font-display mt-3 text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-[3.6rem]">
                What would you like to cook today?
              </h1>
              <p className="font-tamil mt-2 text-base font-medium text-[#F7CE68]">
                இன்று உங்கள் சமையலறையில் என்ன செய்யலாம்?
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#E5D4C1] sm:text-base">
                Pick a meal occasion or dish below. Every idea pairs traditional Madurai cooking
                guidance directly with the exact Aanandha Masala pouches you need — ready to add
                straight to your bag.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
              <Link
                href="/products"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F7CE68] px-5 text-xs font-bold text-[#22110B] hover:bg-[#fce096]"
              >
                Browse All 25 Packs
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Interactive Cooking Intention Selector Bar — Instant Filtering (Zero Multi-Step Wizard) */}
          <div
            role="tablist"
            aria-label="Filter kitchen ideas by cooking occasion"
            className="snap-rail -mx-4 mt-8 gap-2.5 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {MEAL_INTENTIONS.map((intent) => {
              const active = selectedIntention === intent.id;
              return (
                <button
                  key={intent.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setSelectedIntention(intent.id)}
                  className={`snap-rail-item flex min-h-[48px] items-center gap-2.5 rounded-2xl border px-4 py-2 text-left transition-all ${
                    active
                      ? 'border-[#F7CE68] bg-[#F7CE68] text-[#22110B] shadow-md'
                      : 'border-white/20 bg-white/[0.07] text-[#F2E5D5] hover:border-white/40 hover:bg-white/15'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-bold leading-tight">{intent.label}</span>
                    <span
                      className={`font-tamil block text-[11px] ${
                        active ? 'text-[#5A2D12]' : 'text-[#D6C1AA]'
                      }`}
                    >
                      {intent.tamilLabel}
                    </span>
                  </div>
                  <span
                    className={`font-mono-num rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      active ? 'bg-[#22110B]/15 text-[#22110B]' : 'bg-white/15 text-[#F7CE68]'
                    }`}
                  >
                    {countsByIntention[intent.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* =====================================================================
          DISH JUMP STRIP + EDITORIAL DISH-TO-PRODUCT STORIES
          ===================================================================== */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
        {/* Quick Jump Dish Pills */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-5">
          <p className="text-sm font-semibold text-[var(--text-secondary)]" role="status" aria-live="polite">
            Showing <strong className="text-[var(--text-primary)]">{filteredIdeas.length}</strong>{' '}
            {filteredIdeas.length === 1 ? 'Madurai cooking idea' : 'Madurai cooking ideas'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {filteredIdeas.map((idea) => (
              <a
                key={idea.slug}
                href={`#${idea.slug}`}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
              >
                {idea.occasionTag}
              </a>
            ))}
          </div>
        </div>

        {/* Dish Exhibition Stack — Large Food Photography + Integrated Real Pouches + Direct Shopping Shelf */}
        <div className="space-y-12 lg:space-y-16">
          {filteredIdeas.map((idea, index) => {
            const linkedProducts = idea.productSlugs
              .map((slug) => productBySlug.get(slug))
              .filter((p): p is CatalogProduct => Boolean(p));

            const heroPack = linkedProducts[0];
            const secondPack = linkedProducts[1];
            const isFlipped = index % 2 === 1;
            const stepsOpen = Boolean(expandedSteps[idea.slug]);

            const bundleCandidates = linkedProducts
              .slice(0, 2)
              .filter((p) => p.variants[0]?.isOrderableOnline && p.variants[0]?.pricePaise !== null);
            const bundleTotalPaise = bundleCandidates.reduce(
              (sum, p) => sum + (p.variants[0]?.pricePaise ?? 0),
              0
            );

            return (
              <article
                key={idea.slug}
                id={idea.slug}
                className="scroll-mt-24 overflow-hidden rounded-[34px] border border-[var(--border-strong)]/80 bg-[var(--bg-surface)] shadow-md"
              >
                {/* Upper Editorial Story Split: Dish Photo + Floating Pouches <-> Dish Intention & Prep */}
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Culinary Food Photography Stage with Real Pouch Integration */}
                  <div
                    className={`relative min-h-[300px] overflow-hidden bg-[#22110B] sm:min-h-[390px] lg:col-span-6 lg:min-h-[440px] ${
                      isFlipped ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={idea.dishImage}
                      alt={idea.dishAlt}
                      width={1200}
                      height={900}
                      loading={index < 2 ? 'eager' : 'lazy'}
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#190B07]/85 via-[#190B07]/15 to-transparent"
                    />

                    {/* Top Occasion Pill */}
                    <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3.5 py-1.5 text-[11px] font-bold text-[#F7CE68] backdrop-blur-md">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      {idea.occasionTag}
                    </span>

                    {/* Integrated Floating Genuine Pouches Over Bottom-Right Corner of Dish */}
                    <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                      <div className="max-w-[230px] text-[#FBF5EC]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#F7CE68]">
                          Best Served With
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-[#EFE2D2]">
                          {idea.bestServedWith}
                        </p>
                      </div>

                      {heroPack && (
                        <div className="flex items-end -space-x-6">
                          {secondPack && (
                            <Link
                              href={`/products/${secondPack.slug}`}
                              aria-label={`Inspect ${secondPack.name}`}
                              className="relative mb-1 h-24 w-19 -rotate-8 transition-transform duration-300 hover:-translate-y-1.5 hover:scale-105"
                            >
                              <PouchImage
                                src={getCutoutUrlFromThumb(secondPack.images[0]?.thumbUrl || '', '420')}
                                fallbackSrc={secondPack.images[0]?.thumbUrl}
                                alt={secondPack.name}
                                width={160}
                                height={213}
                                imgClassName="pouch-float-dark"
                              />
                            </Link>
                          )}
                          <Link
                            href={`/products/${heroPack.slug}`}
                            aria-label={`Inspect ${heroPack.name}`}
                            className="relative z-10 h-32 w-25 rotate-3 transition-transform duration-300 hover:-translate-y-2 hover:scale-105"
                          >
                            <PouchImage
                              src={getCutoutUrlFromThumb(heroPack.images[0]?.largeUrl || '', '420')}
                              fallbackSrc={heroPack.images[0]?.thumbUrl}
                              alt={heroPack.name}
                              width={200}
                              height={266}
                              priority={index < 2}
                              imgClassName="pouch-float-dark"
                            />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Editorial Narrative, Prep Method & Quick Dish-Set Add */}
                  <div
                    className={`flex flex-col justify-between p-6 sm:p-8 lg:col-span-6 lg:p-10 ${
                      isFlipped ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div>
                      <p className="font-tamil text-sm font-bold text-[var(--brand-crimson)]">
                        {idea.tamilTitle}
                      </p>
                      <h2 className="font-display mt-1.5 text-2xl font-bold leading-[1.12] tracking-[-0.02em] text-[var(--text-primary)] sm:text-3xl">
                        {idea.title}
                      </h2>
                      <p className="mt-3 text-base font-medium leading-relaxed text-[var(--text-primary)]">
                        {idea.hookLine}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {idea.summary}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-canvas)] px-3 py-1.5 font-semibold text-[var(--text-secondary)]">
                          <UtensilsCrossed className="h-3.5 w-3.5 text-[var(--brand-crimson)]" aria-hidden="true" />
                          {idea.prepStyle}
                        </span>
                      </div>

                      {/* Expandable Traditional Kitchen Steps */}
                      <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/75">
                        <button
                          type="button"
                          onClick={() => toggleSteps(idea.slug)}
                          aria-expanded={stepsOpen}
                          className="flex min-h-[46px] w-full items-center justify-between px-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]"
                        >
                          <span>Traditional Kitchen Steps ({idea.steps.length})</span>
                          {stepsOpen ? (
                            <ChevronUp className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                          )}
                        </button>
                        {stepsOpen && (
                          <div className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-3">
                            <ol className="space-y-2.5 text-sm text-[var(--text-secondary)]">
                              {idea.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <span className="font-mono-num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-crimson-soft)] text-[11px] font-bold text-[var(--brand-crimson)]">
                                    {i + 1}
                                  </span>
                                  <span className="leading-relaxed">{step}</span>
                                </li>
                              ))}
                            </ol>
                            <p className="mt-3 text-[11px] text-[var(--text-muted)]">
                              <strong>Factual Basis:</strong> {idea.usageBasis}. Adjust spice &
                              seasoning to family taste.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick "Add Core Dish Packs" Action Bar */}
                    {bundleCandidates.length > 0 && (
                      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--border-subtle)] pt-5">
                        <button
                          type="button"
                          onClick={() => void handleAddDishBundle(idea, linkedProducts)}
                          disabled={Boolean(addingBundleSlug)}
                          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[var(--brand-crimson)] px-6 text-xs font-bold text-white shadow-sm transition-all hover:bg-[var(--brand-crimson-hover)] active:scale-[0.98] disabled:opacity-60"
                        >
                          {addedBundleSlug === idea.slug ? (
                            <>
                              <Check className="h-4 w-4" aria-hidden="true" />
                              Core Packs Added to Bag
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                              {addingBundleSlug === idea.slug
                                ? 'Adding Packs...'
                                : bundleCandidates.length > 1
                                  ? `Add Core Pair (${formatPaiseToInr(bundleTotalPaise)})`
                                  : `Add ${bundleCandidates[0]!.name} (${formatPaiseToInr(bundleTotalPaise)})`}
                            </>
                          )}
                        </button>
                        <span className="text-xs text-[var(--text-muted)]">
                          Or pick individual packs below ↓
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lower Required Products Shelf — Direct Conversion From Cooking Inspiration to Cart */}
                {linkedProducts.length > 0 && (
                  <div
                    style={{ backgroundColor: idea.accentBg }}
                    className="border-t border-[var(--border-subtle)] px-6 py-6 sm:px-8"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                          Aanandha Masala Packs Used in This Dish
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Inspect packaging labels or add directly to your spice bag.
                        </p>
                      </div>
                      <Link
                        href="/products"
                        className="text-xs font-bold text-[var(--brand-crimson)] hover:underline"
                      >
                        Compare in Full Pantry →
                      </Link>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {linkedProducts.map((prod) => {
                        const v = prod.variants[0];
                        const thumb = prod.images[0]?.thumbUrl || '';
                        const shelf = getShortShelfLife(v?.bestBeforePrinted);
                        const isAdded = addedVariantId === v?.id;
                        const isAdding = addingVariantId === v?.id;
                        return (
                          <div
                            key={prod.id}
                            className="group/item flex items-center gap-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shadow-xs transition-all hover:border-[var(--brand-crimson)]/40 hover:shadow-md"
                          >
                            <Link
                              href={`/products/${prod.slug}`}
                              className="h-22 w-18 shrink-0 rounded-xl bg-[#F4E8D6] p-1.5"
                            >
                              <PouchImage
                                src={getCutoutUrlFromThumb(thumb, '420')}
                                fallbackSrc={thumb}
                                alt={prod.name}
                                width={120}
                                height={160}
                                imgClassName="pouch-float-light transition-transform duration-300 group-hover/item:-translate-y-1 group-hover/item:scale-105"
                              />
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/products/${prod.slug}`}
                                className="flex items-start justify-between gap-1"
                              >
                                <span className="line-clamp-1 font-display text-sm font-bold text-[var(--text-primary)] group-hover/item:text-[var(--brand-crimson)]">
                                  {prod.name}
                                </span>
                                <ArrowUpRight
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                                  aria-hidden="true"
                                />
                              </Link>
                              <p className="font-tamil truncate text-[11px] text-[#8C2023]">
                                {prod.tamilName}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs">
                                <span className="font-mono-num font-bold text-[var(--text-primary)]">
                                  {formatPaiseToInr(v?.pricePaise)}
                                </span>
                                {v?.netWeightGrams && (
                                  <span className="text-[11px] text-[var(--text-muted)]">
                                    • {v.netWeightGrams}g
                                  </span>
                                )}
                              </div>
                              {shelf && (
                                <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                                  <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                                  {shelf}
                                </p>
                              )}

                              <div className="mt-2">
                                {v?.isOrderableOnline ? (
                                  <button
                                    type="button"
                                    onClick={() => void handleAddSingle(prod)}
                                    disabled={Boolean(addingVariantId)}
                                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-crimson)] px-3 text-xs font-bold text-white transition-colors hover:bg-[var(--brand-crimson-hover)] disabled:opacity-60"
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                        Added
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                                        {isAdding ? 'Adding...' : 'Add to Bag'}
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <a
                                    href={buildWhatsAppUrl(
                                      `Hello ${BRAND.fullName}, I am interested in ${prod.name} from Kitchen Ideas.`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-[var(--brand-leaf)] text-xs font-bold text-[var(--brand-leaf)]"
                                  >
                                    Enquire
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Helpful Kitchen Assistance Footer Card */}
        <section className="mt-14 flex flex-col items-start justify-between gap-5 rounded-[30px] border border-[var(--border-strong)] bg-[#F4EAD9] p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Not sure which masala fits your family dish?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              Message our Madurai kitchen team directly on WhatsApp or filter all 25 audited packs
              in the Pantry by meal use and pack size.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={buildWhatsAppUrl(
                `Hello ${BRAND.fullName}, I am browsing Kitchen Ideas and would like help choosing the right masala for a dish.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ eventName: 'whatsapp_click', path: '/recipes' })}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[var(--brand-leaf)] px-5 text-xs font-bold text-white hover:opacity-95"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask on WhatsApp
            </a>
            <Link
              href="/products"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[var(--bg-deep)] px-5 text-xs font-bold text-[#FBF5EC] hover:bg-[var(--brand-crimson)]"
            >
              Open Madurai Pantry
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
