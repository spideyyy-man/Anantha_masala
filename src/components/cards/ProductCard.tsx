'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  MessageCircle,
  AlertTriangle,
  Check,
  ArrowUpRight,
  Clock,
  Package,
} from 'lucide-react';
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
 */
function getVerifiedShelfLifeBadge(bestBeforePrinted: string | null | undefined): string | null {
  if (!bestBeforePrinted) return null;
  if (/4\s*Months.*6\s*Months/i.test(bestBeforePrinted)) {
    return '4–6 Months';
  }
  const simpleMatch = bestBeforePrinted.match(/(\d+\s*Months?)/i);
  if (simpleMatch) {
    return simpleMatch[1]!;
  }
  return bestBeforePrinted;
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
  const stageBackground = theme.cardStageBg || theme.stageBg;
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

  const packWeightLabel = activeVariant?.netWeightGrams
    ? `${activeVariant.netWeightGrams}g`
    : activeVariant?.label || 'Standard Pack';

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
      window.setTimeout(() => setJustAdded(false), 1600);
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
      <article
        data-product-card={product.slug}
        data-card-variant="compact"
        className="group flex gap-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shadow-xs transition-all duration-[200ms] hover:border-[var(--border-strong)] hover:shadow-md"
      >
        <Link
          href={`/products/${product.slug}`}
          tabIndex={tabIndex}
          style={{ background: stageBackground }}
          className="relative flex h-28 w-22 shrink-0 items-center justify-center overflow-hidden rounded-xl p-2"
        >
          <PouchImage
            src={cutoutSrc}
            fallbackSrc={fallbackThumb}
            alt={primaryImg?.altText || product.name}
            width={160}
            height={213}
            priority={priorityImage}
            imgClassName="pouch-float-light transition-transform duration-[380ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.06]"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <Link
              href={`/products/${product.slug}`}
              tabIndex={tabIndex}
              className="line-clamp-1 font-display text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)] transition-colors duration-[180ms] hover:text-[var(--brand-crimson)]"
            >
              {product.name}
            </Link>
            <p className="font-tamil line-clamp-1 text-xs text-[var(--text-muted)]">
              {product.tamilName}
            </p>
            <p className="font-mono-num mt-1 text-sm font-bold text-[var(--text-primary)]">
              {formatPaiseToInr(activeVariant?.pricePaise)}
              <span className="ml-1.5 font-sans text-xs font-medium text-[var(--text-muted)]">
                • {packWeightLabel}
              </span>
            </p>
          </div>
          {isOrderable ? (
            <button
              type="button"
              tabIndex={tabIndex}
              onClick={handleAdd}
              disabled={adding}
              data-cart-feedback={justAdded ? 'added' : adding ? 'adding' : 'idle'}
              className={`mt-2 inline-flex h-[36px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-white transition-all duration-[180ms] disabled:opacity-60 ${
                justAdded
                  ? 'bg-[var(--brand-leaf)] ring-2 ring-[var(--brand-leaf)]/30'
                  : 'bg-[var(--brand-crimson)] hover:bg-[var(--brand-crimson-hover)]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {adding ? 'Adding…' : 'Add to Bag'}
                </>
              )}
            </button>
          ) : (
            <a
              href={whatsappUrl}
              tabIndex={tabIndex}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-[36px] items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[var(--brand-leaf)] px-3 text-xs font-semibold text-[var(--brand-leaf)] transition-colors duration-[180ms] hover:bg-[var(--brand-leaf)] hover:text-white"
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
     ========================================================================== */
  if (variant === 'showcase') {
    return (
      <article
        data-product-card={product.slug}
        data-card-variant="showcase"
        className="group flex h-full w-[262px] flex-col overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs transition-all duration-[280ms] hover:border-[var(--brand-crimson)]/45 hover:shadow-xl sm:w-[284px]"
      >
        <Link
          href={`/products/${product.slug}`}
          tabIndex={tabIndex}
          style={{ background: stageBackground }}
          className="relative flex h-[264px] w-full items-center justify-center overflow-hidden p-5 pt-10 sm:h-[280px]"
        >
          <div className="relative z-10 flex h-full w-full items-center justify-center transition-transform duration-[420ms] ease-out group-hover:-translate-y-2 group-hover:scale-[1.055]">
            <PouchImage
              src={cutoutSrc}
              fallbackSrc={fallbackThumb}
              alt={`${product.name} (${product.tamilName})`}
              width={420}
              height={560}
              priority={priorityImage}
              imgClassName="pouch-float-light"
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3.5 left-1/2 h-3.5 w-3/5 -translate-x-1/2 rounded-full bg-[#2A150B]/20 blur-md transition-all duration-[350ms] group-hover:w-1/2 group-hover:opacity-55"
          />

          <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-1.5">
            {!product.isEdible ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-900 px-2.5 py-0.5 text-[10px] font-bold text-amber-50">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                External Use
              </span>
            ) : product.vegMarkPrinted ? (
              <span
                title="Vegetarian mark printed on pack"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-xs ring-1 ring-[var(--brand-leaf)]/30"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--brand-leaf)]" />
              </span>
            ) : null}
          </div>

          <span className="font-mono-num pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-[var(--bg-deep)]/88 px-2.5 py-0.5 text-[11px] font-bold text-[#FBF5EC]">
            {packWeightLabel}
          </span>
        </Link>

        <div className="flex flex-1 flex-col justify-between p-4">
          <Link href={`/products/${product.slug}`} tabIndex={tabIndex} className="block">
            <h3 className="line-clamp-1 font-display text-[17px] font-semibold tracking-[-0.015em] text-[var(--text-primary)] transition-colors duration-[180ms] group-hover:text-[var(--brand-crimson)]">
              {product.name}
            </h3>
            <p className="font-tamil mt-0.5 line-clamp-1 text-xs font-medium text-[#8C2023]">
              {product.tamilName}
            </p>
          </Link>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
            <div className="min-h-[38px]">
              <p className="font-mono-num text-lg font-bold leading-tight text-[var(--text-primary)]">
                {formatPaiseToInr(activeVariant?.pricePaise)}
              </p>
              <p className="font-mono-num text-[10px] text-[var(--text-muted)]">
                {unitPrice ?? (isOrderable ? 'Incl. taxes' : 'Confirm via WhatsApp')}
              </p>
            </div>

            {isOrderable ? (
              <button
                type="button"
                tabIndex={tabIndex}
                onClick={handleAdd}
                disabled={adding}
                data-cart-feedback={justAdded ? 'added' : adding ? 'adding' : 'idle'}
                className={`inline-flex h-[38px] min-w-[88px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-bold text-white shadow-xs transition-all duration-[180ms] active:scale-95 disabled:opacity-60 ${
                  justAdded
                    ? 'bg-[var(--brand-leaf)] ring-2 ring-[var(--brand-leaf)]/30'
                    : 'bg-[var(--brand-crimson)] hover:bg-[var(--brand-crimson-hover)]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {adding ? 'Adding…' : 'Add'}
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
                className="inline-flex h-[38px] min-w-[88px] items-center justify-center gap-1 whitespace-nowrap rounded-full border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-3.5 text-xs font-bold text-[var(--brand-leaf)] transition-colors duration-[180ms] hover:bg-[var(--brand-leaf)] hover:text-white"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Enquire
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================================================
     STANDARD & FEATURED PRODUCT CARDS (Pantry & Collection Grids)
     - Standardised card dimensions, uniform 4:3.8 image container aspect ratio,
       and fixed-height typography/metadata slots for zero layout shift (CLS = 0)
     - Clear hierarchy: Title & Tamil name -> Description -> Pack Size & Stock Status
       -> Price & Unit Price -> Full-width Add to Bag CTA with instant visual feedback
     ========================================================================== */
  const isFeatured = variant === 'featured';

  const cardInner = (
    <article
      data-product-card={product.slug}
      data-card-variant={variant}
      className={`group flex h-full flex-col overflow-hidden rounded-[24px] border bg-[var(--bg-surface)] transition-all duration-[280ms] ease-out ${
        isFeatured
          ? 'border-[var(--border-strong)] shadow-md hover:-translate-y-1 hover:border-[var(--brand-crimson)]/45 hover:shadow-2xl'
          : 'border-[var(--border-subtle)] shadow-xs hover:-translate-y-1 hover:border-[var(--brand-crimson)]/40 hover:shadow-xl'
      }`}
    >
      {/* Standardised Packaging-First Luminous Studio Stage (Uniform Aspect & Cropping) */}
      <Link
        href={`/products/${product.slug}`}
        tabIndex={tabIndex}
        style={{ background: stageBackground }}
        className={`relative flex w-full shrink-0 items-center justify-center overflow-hidden px-6 pb-6 pt-11 ${
          isFeatured ? 'h-[304px] sm:h-[320px]' : 'h-[272px] sm:h-[286px]'
        }`}
      >
        {/* Soft Warm Pedestal Halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/65 blur-2xl transition-all duration-[420ms] group-hover:scale-110 group-hover:opacity-95"
        />

        {/* Uniform Bounded Pouch Frame — Subtle Image Zoom (420ms) on Hover */}
        <div className="relative z-10 flex h-full w-full max-w-[200px] items-center justify-center transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2.5 group-hover:scale-[1.06]">
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

        {/* Grounded Studio Contact Shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3.5 left-1/2 h-3.5 w-3/5 -translate-x-1/2 rounded-full bg-[#2A150B]/20 blur-md transition-all duration-[420ms] group-hover:w-1/2 group-hover:opacity-45"
        />

        {/* Top-Left Category & Dietary Badge */}
        <div className="pointer-events-none absolute left-3.5 top-3.5 z-20 flex flex-wrap items-center gap-1.5">
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
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-xs"
              >
                {categoryLabel}
              </span>
            </>
          )}
        </div>

        {/* Top-Right Net Weight Pill */}
        <span className="font-mono-num pointer-events-none absolute right-3.5 top-3.5 z-20 rounded-full bg-[var(--bg-deep)]/88 px-2.5 py-0.5 text-[11px] font-bold text-[#FBF5EC] shadow-xs">
          {packWeightLabel}
        </span>

        {/* Choreographed Desktop Hover / Focus Shelf-Life & Kitchen-Use Caption Reveal */}
        <div
          data-shelf-life-overlay="true"
          className="pointer-events-none absolute inset-x-3 bottom-3 z-30 hidden translate-y-2.5 rounded-2xl border border-[#E5D5BE]/95 bg-[#FFFDF9]/96 px-3.5 py-2 opacity-0 shadow-lg backdrop-blur-md transition-all duration-[240ms] ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:block"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
              {verifiedShelfLife ? `Shelf Life: ${verifiedShelfLife}` : 'Shelf life pending check'}
            </span>
            <span className="font-semibold text-[var(--brand-crimson)]">View Pack →</span>
          </div>
          {primaryUseTag && (
            <p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)]">
              Ideal for {primaryUseTag}
            </p>
          )}
        </div>
      </Link>

      {/* Standardised Card Body with Fixed Vertical Rhythm Slots (Zero Layout Shift) */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Slot 1: Product Title & Tamil Subtitle (Reserved Height) */}
          <Link
            href={`/products/${product.slug}`}
            tabIndex={tabIndex}
            className="group/title flex min-h-[66px] items-start justify-between gap-2"
          >
            <div className="min-w-0">
              <h3 className="font-display line-clamp-2 min-h-[44px] text-[18px] font-bold leading-[1.2] tracking-[-0.015em] text-[var(--text-primary)] transition-colors duration-[180ms] group-hover/title:text-[var(--brand-crimson)]">
                {product.name}
              </h3>
              <p className="font-tamil mt-1 line-clamp-1 text-[13px] font-medium text-[#8C2023]">
                {product.tamilName}
              </p>
            </div>
            <ArrowUpRight
              className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-[180ms] group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 group-hover/title:text-[var(--brand-crimson)]"
              aria-hidden="true"
            />
          </Link>

          {/* Slot 2: Concise Culinary Summary (Reserved 2-Line Height) */}
          <p className="mt-2 line-clamp-2 min-h-[38px] text-[13px] leading-[1.46] text-[var(--text-secondary)]">
            {product.shortSummary}
          </p>

          {/* Slot 3: Standardised Pack Size, Shelf Life & Availability Hierarchy Bar (Always Present) */}
          <div className="mt-3.5 flex min-h-[34px] flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--bg-canvas)] px-3 py-1.5">
            {product.variants.length > 1 ? (
              <div
                className="flex items-center gap-1"
                role="group"
                aria-label={`Pack sizes for ${product.name}`}
              >
                <span className="mr-1 text-[11px] font-semibold text-[var(--text-muted)]">
                  Size:
                </span>
                {product.variants.map((v, idx) => {
                  const active = idx === selectedVariantIdx;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      tabIndex={tabIndex}
                      aria-pressed={active}
                      onClick={() => {
                        setSelectedVariantIdx(idx);
                        trackEvent({ eventName: 'variant_select', productSlug: product.slug });
                      }}
                      className={`font-mono-num h-[26px] rounded-md border px-2 text-[11px] font-bold transition-colors duration-[180ms] ${
                        active
                          ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white'
                          : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-crimson)]'
                      }`}
                    >
                      {v.netWeightGrams ? `${v.netWeightGrams}g` : v.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-secondary)]">
                <span className="font-mono-num inline-flex items-center gap-1 font-bold text-[var(--text-primary)]">
                  <Package className="h-3 w-3 text-[var(--brand-crimson)]" aria-hidden="true" />
                  {packWeightLabel}
                </span>
                {verifiedShelfLife && (
                  <>
                    <span aria-hidden="true" className="text-[var(--border-strong)]">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[var(--brand-crimson)]" aria-hidden="true" />
                      {verifiedShelfLife}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Clear Availability Hierarchy Badge */}
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                isOrderable
                  ? 'bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)]'
                  : activeVariant?.pricePaise === null
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-red-100 text-red-900'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  isOrderable
                    ? 'bg-[var(--brand-leaf)]'
                    : activeVariant?.pricePaise === null
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                }`}
              />
              {isOrderable
                ? 'In Stock'
                : activeVariant?.pricePaise === null
                  ? 'Price Pending'
                  : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Slot 4: Standardised Price & Immediate Action Footer (Zero Layout Shift on Add) */}
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Fixed 2-Line Price Stack */}
            <div className="min-h-[42px] min-w-0">
              <p className="font-mono-num text-[21px] font-bold leading-none text-[var(--text-primary)]">
                {formatPaiseToInr(activeVariant?.pricePaise)}
              </p>
              <p className="font-mono-num mt-1 truncate text-[11px] text-[var(--text-muted)]">
                {unitPrice ?? (isOrderable ? 'Incl. all taxes' : 'Enquire for batch MRP')}
              </p>
            </div>

            {/* Immediately Understandable Add-to-Cart / Enquiry CTA with Live Feedback */}
            {isOrderable ? (
              <button
                type="button"
                tabIndex={tabIndex}
                onClick={handleAdd}
                disabled={adding}
                data-cart-feedback={justAdded ? 'added' : adding ? 'adding' : 'idle'}
                aria-live="polite"
                className={`inline-flex h-[44px] min-w-[144px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-xs font-bold text-white shadow-xs transition-all duration-[180ms] active:scale-[0.98] disabled:opacity-60 sm:text-[13px] ${
                  justAdded
                    ? 'bg-[var(--brand-leaf)] ring-2 ring-[var(--brand-leaf)]/35'
                    : 'bg-[var(--brand-crimson)] hover:bg-[var(--brand-crimson-hover)]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{adding ? 'Adding…' : 'Add to Bag'}</span>
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
                className="inline-flex h-[44px] min-w-[144px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-3.5 text-xs font-bold text-[var(--brand-leaf)] transition-colors duration-[180ms] hover:bg-[var(--brand-leaf)] hover:text-white"
              >
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>WhatsApp Enquiry</span>
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
