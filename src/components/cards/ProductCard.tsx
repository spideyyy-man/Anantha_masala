'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, MessageCircle, AlertTriangle, Check, ArrowUpRight, Clock } from 'lucide-react';
import type { CatalogProduct } from '@/domain/catalog/service';
import {
  BRAND,
  buildWhatsAppUrl,
  formatPaiseToInr,
  formatUnitPricePer100g,
} from '@/data/brand';
import { getCategoryTheme, getCutoutUrlFromThumb } from '@/lib/media';
import { useStore } from '@/components/providers/StoreProviders';
import { TiltCard } from '@/components/motion/TiltCard';
import { PouchImage } from '@/components/ui/PouchImage';

const CATEGORY_READABLE_LABELS: Record<string, string> = {
  'cooking-essentials': 'Cooking Essential',
  'non-veg-masalas': 'Non-Veg Masala',
  'traditional-podi': 'Traditional Podi',
  'traditional-food-mixes': 'Food Mix',
  'millet-and-flours': 'Millet & Flour',
  'healthy-mixes': 'Healthy Mix',
  pickles: 'Seasonal Pickle',
  'traditional-herbal-care': 'External Herbal Care',
};

/**
 * Formats strictly verified bestBeforePrinted from the database without inventing missing shelf lives.
 * - "6 Months" -> "Shelf Life: 6 Months"
 * - "4 Months (sticker) / 6 Months (label print — pending confirmation)" -> "Shelf Life: 4–6 Months (printed)"
 * - null -> null (honestly shows "Shelf life pending" where unavailable)
 */
function getVerifiedShelfLifeBadge(bestBeforePrinted: string | null | undefined): string | null {
  if (!bestBeforePrinted) return null;
  if (/4\s*Months.*6\s*Months/i.test(bestBeforePrinted)) {
    return 'Shelf Life: 4–6 Months (printed)';
  }
  const simpleMatch = bestBeforePrinted.match(/(\d+\s*Months?)/i);
  if (simpleMatch) {
    return `Shelf Life: ${simpleMatch[1]}`;
  }
  return `Shelf Life: ${bestBeforePrinted}`;
}

interface ProductCardProps {
  product: CatalogProduct;
  /** Four cohesive variants sharing one Madurai Aanandha Masala design language */
  variant?: 'standard' | 'featured' | 'showcase' | 'compact';
  priorityImage?: boolean;
  /** Disable focusable tab stops on duplicated infinite-marquee clones */
  isDuplicateClone?: boolean;
}

export function ProductCard({
  product,
  variant = 'standard',
  priorityImage = false,
  isDuplicateClone = false,
}: ProductCardProps) {
  const { addToCart, trackEvent } = useStore();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant = product.variants[selectedVariantIdx] ?? product.variants[0];
  const primaryImg = product.images[0];
  const fallbackThumb =
    activeVariant?.thumbUrl || primaryImg?.thumbUrl || '/images/products/sambar-podi-5-480.webp';
  const cutoutSrc = getCutoutUrlFromThumb(
    fallbackThumb,
    variant === 'featured' ? '720' : '420'
  );
  const theme = getCategoryTheme(product.primaryCategorySlug);
  const categoryLabel = CATEGORY_READABLE_LABELS[product.primaryCategorySlug] ?? 'Madurai Pantry';
  const verifiedShelfLife = getVerifiedShelfLifeBadge(activeVariant?.bestBeforePrinted);
  const primaryUseTag = product.usageTags[0] ?? null;

  const unitPrice = activeVariant
    ? formatUnitPricePer100g(activeVariant.pricePaise, activeVariant.netWeightGrams)
    : null;

  const isOrderable = Boolean(
    activeVariant &&
      activeVariant.isOrderableOnline &&
      activeVariant.pricePaise !== null &&
      activeVariant.stockQty > 0
  );

  const tabIndex = isDuplicateClone ? -1 : undefined;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeVariant || !isOrderable || adding) return;
    setAdding(true);
    const ok = await addToCart(activeVariant.id, 1, product.slug);
    setAdding(false);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  const whatsappUrl = buildWhatsAppUrl(
    `Hello ${BRAND.fullName}, I would like to enquire about ${product.name} (${product.tamilName})${
      activeVariant ? ` — ${activeVariant.label}` : ''
    }.`
  );

  /* ==========================================================================
     VARIANT C: COMPACT RECOMMENDATION CARD (Related Products, Kitchen Ideas & Cart)
     ========================================================================== */
  if (variant === 'compact') {
    return (
      <article className="group flex gap-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shadow-xs transition-all hover:border-[var(--border-strong)] hover:shadow-md">
        <Link
          href={`/products/${product.slug}`}
          tabIndex={tabIndex}
          style={{ background: theme.stageBg }}
          className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl p-1.5"
        >
          <PouchImage
            src={cutoutSrc}
            fallbackSrc={fallbackThumb}
            alt={primaryImg?.altText || product.name}
            width={160}
            height={213}
            priority={priorityImage}
            imgClassName="pouch-float-light transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <Link
              href={`/products/${product.slug}`}
              tabIndex={tabIndex}
              className="line-clamp-1 font-display text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)] hover:text-[var(--brand-crimson)]"
            >
              {product.name}
            </Link>
            <p className="font-tamil line-clamp-1 text-xs text-[var(--text-muted)]">
              {product.tamilName}
            </p>
            <p className="font-mono-num mt-1 text-sm font-bold text-[var(--text-primary)]">
              {formatPaiseToInr(activeVariant?.pricePaise)}
              {activeVariant?.netWeightGrams ? (
                <span className="ml-1.5 font-sans text-xs font-normal text-[var(--text-muted)]">
                  / {activeVariant.netWeightGrams}g
                </span>
              ) : null}
            </p>
          </div>
          {isOrderable ? (
            <button
              type="button"
              tabIndex={tabIndex}
              onClick={handleAdd}
              disabled={adding}
              className="mt-2 inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-crimson)] px-3 text-xs font-semibold text-white hover:bg-[var(--brand-crimson-hover)] disabled:opacity-60"
            >
              {justAdded ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              {justAdded ? 'Added' : 'Add'}
            </button>
          ) : (
            <a
              href={whatsappUrl}
              tabIndex={tabIndex}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[36px] items-center justify-center gap-1 rounded-lg border border-[var(--brand-leaf)] px-3 text-xs font-semibold text-[var(--brand-leaf)]"
            >
              Enquire
            </a>
          )}
        </div>
      </article>
    );
  }

  /* ==========================================================================
     VARIANT D: MOVING SHOWCASE CARD (Single Continuous Gliding Showcase)
     Clean, packaging-dominant editorial plinth with instant recognition
     ========================================================================== */
  if (variant === 'showcase') {
    return (
      <article className="group flex h-full w-[262px] flex-col overflow-hidden rounded-[26px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs transition-all duration-300 hover:border-[var(--brand-crimson)]/45 hover:shadow-xl sm:w-[284px]">
        <Link
          href={`/products/${product.slug}`}
          tabIndex={tabIndex}
          style={{ background: theme.stageBg }}
          className="relative block h-[274px] w-full overflow-hidden p-4 pt-6 sm:h-[292px]"
        >
          <div className="relative z-10 h-full w-full transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.045]">
            <PouchImage
              src={cutoutSrc}
              fallbackSrc={fallbackThumb}
              alt={`${product.name} (${product.tamilName})`}
              width={420}
              height={560}
              priority={priorityImage}
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 left-1/2 h-3.5 w-3/5 -translate-x-1/2 rounded-full bg-[#2A150B]/20 blur-md transition-all duration-300 group-hover:w-1/2 group-hover:opacity-60"
          />

          <div className="pointer-events-none absolute left-3 top-3 z-20">
            {!product.isEdible ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-900 px-2.5 py-0.5 text-[10px] font-bold text-amber-50">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                External Use
              </span>
            ) : product.vegMarkPrinted ? (
              <span
                title="Vegetarian mark printed on pack"
                className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/95 shadow-xs ring-1 ring-[var(--brand-leaf)]/30"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--brand-leaf)]" />
              </span>
            ) : null}
          </div>

          {activeVariant?.netWeightGrams && (
            <span className="font-mono-num pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-[var(--bg-deep)]/85 px-2.5 py-0.5 text-[11px] font-bold text-[#FBF5EC]">
              {activeVariant.netWeightGrams}g
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-between p-4">
          <Link href={`/products/${product.slug}`} tabIndex={tabIndex} className="block">
            <h3 className="line-clamp-1 font-display text-[17px] font-semibold tracking-[-0.015em] text-[var(--text-primary)] group-hover:text-[var(--brand-crimson)]">
              {product.name}
            </h3>
            <p className="font-tamil line-clamp-1 text-xs font-medium text-[var(--text-muted)]">
              {product.tamilName}
            </p>
          </Link>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
            <div>
              <p className="font-mono-num text-lg font-bold text-[var(--text-primary)]">
                {formatPaiseToInr(activeVariant?.pricePaise)}
              </p>
              {unitPrice && (
                <p className="font-mono-num text-[10px] text-[var(--text-muted)]">{unitPrice}</p>
              )}
            </div>

            {isOrderable ? (
              <button
                type="button"
                tabIndex={tabIndex}
                onClick={handleAdd}
                disabled={adding}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--brand-crimson)] px-4 text-xs font-bold text-white shadow-xs transition-transform hover:bg-[var(--brand-crimson-hover)] active:scale-95 disabled:opacity-60"
              >
                {justAdded ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                {justAdded ? 'Added' : 'Add'}
              </button>
            ) : (
              <a
                href={whatsappUrl}
                tabIndex={tabIndex}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ eventName: 'whatsapp_click', productSlug: product.slug })}
                className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-3.5 text-xs font-bold text-[var(--brand-leaf)]"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Enquire
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================================================
     PART 3 — IMMERSIVE PANTRY PRODUCT CARD (Standard & Featured)
     - Refined Fraunces + Noto Sans Tamil + Tabular JetBrains Mono typography
     - Choreographed desktop hover: pouch elevates smoothly, verified Shelf-Life
       & kitchen-use glass caption ribbon glides cleanly into view without moving the card
     - Mobile/touch parity: verified Shelf-Life always visible cleanly in card body
     ========================================================================== */
  const isFeatured = variant === 'featured';

  const cardInner = (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[26px] border bg-[var(--bg-surface)] transition-all duration-300 ${
        isFeatured
          ? 'border-[var(--border-strong)] shadow-md hover:border-[var(--brand-crimson)]/45 hover:shadow-2xl'
          : 'border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-crimson)]/40 hover:shadow-xl'
      }`}
    >
      {/* Packaging-First Luminous Studio Stage */}
      <Link
        href={`/products/${product.slug}`}
        tabIndex={tabIndex}
        style={{ background: theme.stageBg }}
        className={`relative block w-full overflow-hidden p-4 pt-9 ${
          isFeatured ? 'h-[325px] sm:h-[345px]' : 'h-[296px] sm:h-[314px]'
        }`}
      >
        {/* Soft Warm Pedestal Halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 blur-2xl transition-opacity duration-400 group-hover:opacity-90"
        />

        {/* Large Uncropped Authentic Pouch Cutout — Subtle Scale & Elevation on Hover */}
        <div className="relative z-10 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-3 group-hover:scale-[1.045]">
          <PouchImage
            src={cutoutSrc}
            fallbackSrc={fallbackThumb}
            alt={primaryImg?.altText || `${product.name} (${product.tamilName})`}
            width={420}
            height={560}
            priority={priorityImage}
            imgClassName="pouch-float-light"
          />
        </div>

        {/* Grounded Studio Contact Shadow (softens subtly as pouch lifts) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-1/2 h-4 w-3/5 -translate-x-1/2 rounded-full bg-[#2A150B]/20 blur-md transition-all duration-500 group-hover:w-1/2 group-hover:opacity-45"
        />

        {/* Top-Left Category & Dietary Badge */}
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap items-center gap-1.5">
          {!product.isEdible ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-900 px-2.5 py-0.5 text-[10px] font-bold text-amber-50 shadow-xs">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              External Use Only
            </span>
          ) : (
            <>
              {product.vegMarkPrinted && (
                <span
                  title="Green vegetarian mark printed on packaging"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-xs ring-1 ring-[var(--brand-leaf)]/25"
                >
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-leaf)]" />
                </span>
              )}
              <span
                style={{ backgroundColor: theme.pillBg, color: theme.pillText }}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-xs transition-opacity duration-300"
              >
                {categoryLabel}
              </span>
            </>
          )}
        </div>

        {/* Top-Right Net Weight Pill */}
        {activeVariant?.netWeightGrams && (
          <span className="font-mono-num pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-[var(--bg-deep)]/85 px-2.5 py-0.5 text-[11px] font-bold text-[#FBF5EC]">
            {activeVariant.netWeightGrams}g
          </span>
        )}

        {/* Choreographed Desktop Hover / Focus Shelf-Life & Kitchen-Use Caption Reveal */}
        <div
          data-shelf-life-overlay="true"
          className="pointer-events-none absolute inset-x-3 bottom-3 z-30 hidden translate-y-3 rounded-2xl border border-[#E5D5BE]/90 bg-[#FFFDF9]/95 px-3.5 py-2.5 opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:block"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
              {verifiedShelfLife ?? 'Shelf life: Pending label check'}
            </span>
            <span className="font-semibold text-[var(--brand-crimson)]">Inspect →</span>
          </div>
          {primaryUseTag && (
            <p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)]">
              Ideal for {primaryUseTag}
            </p>
          )}
        </div>
      </Link>

      {/* Refined Product Typography, Verified Shelf-Life Parity & Actions */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <Link
            href={`/products/${product.slug}`}
            tabIndex={tabIndex}
            className="group/title flex items-start justify-between gap-2.5"
          >
            <div className="min-w-0">
              <h3 className="font-display text-[19px] font-semibold leading-[1.22] tracking-[-0.015em] text-[var(--text-primary)] transition-colors group-hover/title:text-[var(--brand-crimson)]">
                {product.name}
              </h3>
              <p className="font-tamil mt-1 text-[13px] font-medium text-[#8C2023]">
                {product.tamilName}
              </p>
            </div>
            <ArrowUpRight
              className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-300 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 group-hover/title:text-[var(--brand-crimson)]"
              aria-hidden="true"
            />
          </Link>

          <p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.55] text-[var(--text-secondary)]">
            {product.shortSummary}
          </p>

          {/* Always-Visible Mobile / Touch Verified Shelf-Life Strip (Full Parity Without Hover!) */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 lg:hidden">
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-canvas)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
              <Clock className="h-3 w-3 text-[var(--brand-crimson)]" aria-hidden="true" />
              {verifiedShelfLife ?? 'Shelf life pending'}
            </span>
          </div>

          {/* Multi-Pack Size Switcher (e.g. Manjal Podi 100g & 50g) */}
          {product.variants.length > 1 && (
            <div
              className="mt-3 flex flex-wrap gap-1.5"
              role="group"
              aria-label={`Pack sizes for ${product.name}`}
            >
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  tabIndex={tabIndex}
                  onClick={() => {
                    setSelectedVariantIdx(idx);
                    trackEvent({ eventName: 'variant_select', productSlug: product.slug });
                  }}
                  className={`font-mono-num min-h-[34px] rounded-lg border px-2.5 text-xs font-bold transition-colors ${
                    idx === selectedVariantIdx
                      ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson-soft)] text-[var(--brand-crimson)]'
                      : 'border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                  }`}
                >
                  {v.netWeightGrams ? `${v.netWeightGrams}g` : v.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Footer */}
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="font-mono-num text-[22px] font-bold leading-none text-[var(--text-primary)]">
                {formatPaiseToInr(activeVariant?.pricePaise)}
              </p>
              {unitPrice && (
                <p className="font-mono-num mt-1 text-[11px] text-[var(--text-muted)]">
                  {unitPrice}
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                isOrderable
                  ? 'bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)]'
                  : activeVariant?.pricePaise === null
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-red-100 text-red-900'
              }`}
            >
              {isOrderable
                ? 'In Stock'
                : activeVariant?.pricePaise === null
                  ? 'Price Pending'
                  : 'Out of Stock'}
            </span>
          </div>

          <div className="mt-3.5">
            {isOrderable ? (
              <button
                type="button"
                tabIndex={tabIndex}
                onClick={handleAdd}
                disabled={adding}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-4 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[var(--brand-crimson-hover)] active:scale-[0.98] disabled:opacity-60"
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    {adding ? 'Adding...' : 'Add to Bag'}
                  </>
                )}
              </button>
            ) : (
              <a
                href={whatsappUrl}
                tabIndex={tabIndex}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ eventName: 'whatsapp_click', productSlug: product.slug })}
                className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-4 text-xs font-semibold text-[var(--brand-leaf)] hover:bg-[var(--brand-leaf)] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Enquire on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  if (isFeatured) {
    return <TiltCard maxTiltDeg={3}>{cardInner}</TiltCard>;
  }
  return cardInner;
}
