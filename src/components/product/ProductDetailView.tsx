'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  MessageCircle,
  ZoomIn,
  X,
  Plus,
  Minus,
  AlertTriangle,
  ShieldCheck,
  Info,
  Truck,
  Check,
  Sparkles,
  ImageIcon,
  Utensils,
  PackageCheck,
} from 'lucide-react';
import type { CatalogProduct } from '@/domain/catalog/service';
import {
  BRAND,
  buildWhatsAppUrl,
  formatPaiseToInr,
  formatUnitPricePer100g,
} from '@/data/brand';
import { KITCHEN_IDEAS } from '@/data/kitchen-ideas';
import { getCategoryTheme, getCutoutUrlFromThumb } from '@/lib/media';
import { useStore } from '@/components/providers/StoreProviders';
import { ProductCard } from '@/components/cards/ProductCard';
import { TiltCard } from '@/components/motion/TiltCard';
import { PouchImage } from '@/components/ui/PouchImage';

interface ProductDetailViewProps {
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { addToCart, trackEvent } = useStore();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'studio' | 'original'>('studio');
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  const activeVariant = product.variants[selectedVariantIdx] ?? product.variants[0];
  const activeImage = product.images[selectedImageIdx] ?? product.images[0];
  const displayOriginal =
    activeImage?.largeUrl || activeVariant?.largeUrl || '/images/products/sambar-podi-5-960.webp';
  const displayCutout = getCutoutUrlFromThumb(displayOriginal, '720');
  const theme = getCategoryTheme(product.primaryCategorySlug);

  useEffect(() => {
    trackEvent({
      eventName: 'product_view',
      productSlug: product.slug,
      categorySlug: product.primaryCategorySlug,
      valuePaise: activeVariant?.pricePaise ?? undefined,
    });
  }, [product.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomOpen]);

  const handleVariantChange = (idx: number) => {
    setSelectedVariantIdx(idx);
    const v = product.variants[idx];
    if (v) {
      const nextMaxQty = Math.max(1, Math.min(25, v.stockQty > 0 ? v.stockQty : 25));
      setQuantity((q) => Math.max(1, Math.min(nextMaxQty, q)));
      const matchImgIdx = product.images.findIndex((im) => im.sourceAssetFile === v.assetFile);
      if (matchImgIdx >= 0) setSelectedImageIdx(matchImgIdx);
      trackEvent({ eventName: 'variant_select', productSlug: product.slug });
    }
  };

  const isOrderable = Boolean(
    activeVariant &&
      activeVariant.isOrderableOnline &&
      activeVariant.pricePaise !== null &&
      activeVariant.stockQty > 0
  );

  const maxAllowedQty = Math.max(
    1,
    Math.min(25, activeVariant?.stockQty && activeVariant.stockQty > 0 ? activeVariant.stockQty : 25)
  );
  const selectedLineSubtotalPaise =
    activeVariant?.pricePaise != null ? activeVariant.pricePaise * quantity : null;
  const matchingRecipes = KITCHEN_IDEAS.filter((idea) => idea.productSlugs.includes(product.slug));

  const unitPrice = activeVariant
    ? formatUnitPricePer100g(activeVariant.pricePaise, activeVariant.netWeightGrams)
    : null;

  const whatsappUrl = buildWhatsAppUrl(
    `Hello ${BRAND.fullName}, I am looking at ${product.name} (${product.tamilName})${
      activeVariant ? ` — ${activeVariant.label}` : ''
    } on your website and would like to enquire.${
      isOrderable ? ` Quantity: ${quantity}.` : ' Please share pack size and current price.'
    }\n(Note: I understand WhatsApp starts an enquiry and is not a confirmed order until confirmed by your team.)`
  );

  const handleAdd = async () => {
    if (!activeVariant || !isOrderable || adding) return;
    setAdding(true);
    const ok = await addToCart(activeVariant.id, quantity, product.slug);
    setAdding(false);
    if (ok) {
      setAddedFlash(true);
      setTimeout(() => setAddedFlash(false), 1600);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-16 lg:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-[var(--brand-crimson)]">All Products</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/categories/${product.primaryCategorySlug}`}
          className="capitalize hover:text-[var(--brand-crimson)]"
        >
          {product.primaryCategorySlug.replace(/-/g, ' ')}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">{product.name}</span>
      </nav>

      {/* Non-Edible Prominent Banner */}
      {!product.isEdible && (
        <div
          role="note"
          className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-amber-600/50 bg-amber-50 p-4 text-amber-950"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-bold">For External Bathing Use Only — Not an Edible Food Product</p>
            <p className="mt-0.5 text-xs leading-relaxed">
              Kuliyal Podi (Nalangu Maavu) is a traditional South Indian herbal bath powder. We
              segregate it strictly from edible spices and mixes.
            </p>
          </div>
        </div>
      )}

      {/* Main Two-Column Product World */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left: Luminous Sunlit Madurai Packaging Stage — Instant First-Paint Render (ZERO blank flash!) */}
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-24">
            {viewMode === 'studio' ? (
              <TiltCard maxTiltDeg={3}>
                <div
                  style={{ background: theme.stageBg }}
                  className="relative h-[460px] w-full overflow-hidden rounded-[32px] border border-[var(--border-strong)]/70 p-6 pb-20 shadow-lg sm:h-[560px] lg:h-[600px]"
                >
                  {/* Warm Studio Spotlight Halo behind Pouch — ensures dark & light packs both pop! */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-[44%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl"
                  />

                  {/* Instant-Render Real Floating Cutout Pouch */}
                  <div className="relative z-10 h-full w-full">
                    <PouchImage
                      src={displayCutout}
                      fallbackSrc={displayOriginal}
                      alt={activeImage?.altText || `${product.name} (${product.tamilName})`}
                      width={720}
                      height={960}
                      priority
                      imgClassName="pouch-float-light"
                    />
                  </div>

                  {/* Elliptical Contact Shadow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-16 left-1/2 h-5 w-1/2 -translate-x-1/2 rounded-full bg-[#2A150B]/22 blur-lg"
                  />

                  {/* Stage View Mode Controls */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-1 text-xs shadow-sm backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => setViewMode('studio')}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-deep)] px-3 py-1.5 font-bold text-[#FBF5EC]"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#E7B032]" aria-hidden="true" />
                        Studio Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('original')}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Original Pack
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoomOpen(true)}
                      aria-label="Zoom in to inspect full product label"
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[var(--bg-deep)] px-4 text-xs font-bold text-[#FBF5EC] shadow-sm hover:bg-[var(--brand-crimson)]"
                    >
                      <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                      Inspect Label
                    </button>
                  </div>
                </div>
              </TiltCard>
            ) : (
              <div className="relative h-[460px] w-full overflow-hidden rounded-[32px] border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-md sm:h-[560px] lg:h-[600px]">
                <PouchImage
                  src={displayOriginal}
                  alt={activeImage?.altText || `${product.name} original uncropped photo`}
                  width={960}
                  height={1280}
                  priority
                  fit="contain"
                  className="bg-[var(--bg-sand)] p-2 pb-16"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-1 text-xs shadow-sm">
                    <button
                      type="button"
                      onClick={() => setViewMode('studio')}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      Studio Stage
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('original')}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-deep)] px-3 py-1.5 font-bold text-[#FBF5EC]"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-[#E7B032]" aria-hidden="true" />
                      Original Pack
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomOpen(true)}
                    aria-label="Zoom in to inspect full product label"
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[var(--bg-deep)] px-4 text-xs font-bold text-[#FBF5EC] hover:bg-[var(--brand-crimson)]"
                  >
                    <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                    Inspect Label
                  </button>
                </div>
              </div>
            )}

            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    aria-label={`View packaging photo ${idx + 1}`}
                    style={{ background: theme.stageBg }}
                    className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 p-1.5 ${
                      idx === selectedImageIdx
                        ? 'border-[var(--brand-crimson)] shadow-xs'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <PouchImage
                      src={getCutoutUrlFromThumb(img.thumbUrl, '420')}
                      fallbackSrc={img.thumbUrl}
                      alt={img.altText}
                      width={120}
                      height={160}
                      priority
                      imgClassName="pouch-float-light"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-2.5 text-xs text-[var(--text-muted)]">
              Genuine pouch photography from audited packaging ({activeImage?.sourceAssetFile}).
              Switch to “Original Pack” or click “Inspect Label” to examine uncropped printed text.
            </p>
          </div>
        </div>

        {/* Right: Product Identity, Price, Purchase Controls & Verified Label Facts */}
        <div className="lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.isEdible && product.vegMarkPrinted && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-leaf-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-leaf)]">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border border-[var(--brand-leaf)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-leaf)]" />
                </span>
                Vegetarian Mark Printed on Pack
              </span>
            )}
            {activeVariant && (
              <span className="font-mono-num rounded-full bg-[var(--bg-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                SKU: {activeVariant.sku}
              </span>
            )}
          </div>

          <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl">
            {product.name}
          </h1>
          <p className="font-tamil mt-1 text-lg font-bold text-[var(--brand-crimson)]">
            {product.tamilName}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {product.description}
          </p>

          {/* Price Block */}
          <div className="mt-5 rounded-2xl border border-[var(--border-strong)]/70 bg-[var(--bg-surface)] p-5 shadow-xs">
            {/* Price, Pack Size & Availability Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <p className="font-mono-num text-3xl font-bold text-[var(--text-primary)]">
                    {formatPaiseToInr(activeVariant?.pricePaise)}
                  </p>
                  {activeVariant?.label && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-2.5 py-0.5 text-xs font-bold text-[var(--text-primary)]">
                      <PackageCheck className="h-3.5 w-3.5 text-[var(--brand-crimson)]" aria-hidden="true" />
                      Pack Size: {activeVariant.label}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  {activeVariant?.netWeightGrams && (
                    <span className="font-semibold text-[var(--text-secondary)]">
                      Net Weight: {activeVariant.netWeightGrams}g
                    </span>
                  )}
                  {unitPrice && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="font-mono-num">{unitPrice}</span>
                    </>
                  )}
                  {isOrderable && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span>MRP incl. applicable taxes</span>
                    </>
                  )}
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  isOrderable
                    ? 'bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)]'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${
                    isOrderable ? 'bg-[var(--brand-leaf)]' : 'bg-amber-600'
                  }`}
                />
                {isOrderable
                  ? `In Stock (${activeVariant?.stockQty} packs)`
                  : activeVariant?.pricePaise === null
                    ? 'Price Pending Verification'
                    : 'Out of Stock'}
              </span>
            </div>

            {activeVariant?.verificationNote && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-950">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                <span>{activeVariant.verificationNote}</span>
              </p>
            )}

            {/* Variant Selector */}
            {product.variants.length > 1 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Select Pack Size ({product.variants.length} options)
                </p>
                <div role="radiogroup" aria-label="Select pack size" className="mt-2 flex flex-wrap gap-2">
                  {product.variants.map((v, idx) => {
                    const selected = idx === selectedVariantIdx;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleVariantChange(idx)}
                        className={`min-h-[46px] rounded-xl border px-4 py-2 text-left text-xs font-bold transition-all ${
                          selected
                            ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson-soft)] text-[var(--brand-crimson)] ring-1 ring-[var(--brand-crimson)]/40'
                            : 'border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--brand-crimson)]/50'
                        }`}
                      >
                        <span className="block">{v.label}</span>
                        <span className="font-mono-num block text-sm font-bold">
                          {formatPaiseToInr(v.pricePaise)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Action Buttons */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {isOrderable && (
                <div
                  role="group"
                  aria-label="Select purchase quantity"
                  className="inline-flex h-12 items-center justify-between rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-1 sm:w-36"
                >
                  <button
                    type="button"
                    disabled={quantity <= 1 || adding}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-muted)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span
                    aria-live="polite"
                    aria-label={`Selected quantity ${quantity}`}
                    className="font-mono-num min-w-[2.25rem] text-center text-sm font-bold text-[var(--text-primary)]"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= maxAllowedQty || adding}
                    onClick={() => setQuantity((q) => Math.min(maxAllowedQty, q + 1))}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-muted)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}

              {isOrderable ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  aria-busy={adding}
                  className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-65 ${
                    addedFlash
                      ? 'bg-[var(--brand-leaf)]'
                      : 'bg-[var(--brand-crimson)] hover:bg-[var(--brand-crimson-hover)]'
                  }`}
                >
                  {addedFlash ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Added {quantity} {quantity === 1 ? 'Pack' : 'Packs'} to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                      {adding
                        ? 'Adding to Spice Bag...'
                        : `Add ${quantity > 1 ? `${quantity} Packs ` : ''}to Spice Bag${
                            selectedLineSubtotalPaise ? ` • ${formatPaiseToInr(selectedLineSubtotalPaise)}` : ''
                          }`}
                    </>
                  )}
                </button>
              ) : null}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ eventName: 'whatsapp_click', productSlug: product.slug })}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[var(--brand-leaf)] px-5 text-sm font-bold transition-colors ${
                  isOrderable
                    ? 'bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)] hover:bg-[var(--brand-leaf)] hover:text-white'
                    : 'flex-1 bg-[var(--brand-leaf)] text-white hover:opacity-95'
                }`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {isOrderable ? 'WhatsApp Enquiry' : 'Enquire Price & Availability on WhatsApp'}
              </a>
            </div>

            {isOrderable && quantity > 1 && selectedLineSubtotalPaise && (
              <p className="font-mono-num mt-2.5 text-xs font-semibold text-[var(--text-secondary)]">
                Selected subtotal: {quantity} × {formatPaiseToInr(activeVariant?.pricePaise)} ={' '}
                <strong className="text-[var(--text-primary)]">
                  {formatPaiseToInr(selectedLineSubtotalPaise)}
                </strong>
              </p>
            )}

            <p className="mt-3 text-[11px] text-[var(--text-muted)]">
              WhatsApp sends an enquiry directly to {BRAND.phoneDisplay} and does not create a paid
              order until confirmed by our team.
            </p>
          </div>

          {/* Transparent Product, Usage & Label Facts */}
          <div className="mt-6 space-y-4">
            {/* Culinary Usage & Kitchen Applications (Strictly from verified product.usageTags & KITCHEN_IDEAS) */}
            {(product.usageTags.length > 0 || matchingRecipes.length > 0) && (
              <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
                <h2 className="font-display flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                  <Utensils className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                  {product.isEdible ? 'Kitchen Usage & Culinary Pairing' : 'Traditional Usage Context'}
                </h2>
                {product.usageTags.length > 0 && (
                  <div className="mt-2.5">
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                      {product.isEdible
                        ? 'Recommended South Indian kitchen preparations:'
                        : 'Application category:'}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {product.usageTags.map((uc) => (
                        <li
                          key={uc}
                          className="rounded-full border border-[var(--border-strong)]/60 bg-[var(--bg-canvas)] px-3 py-1 text-xs font-semibold capitalize text-[var(--text-primary)]"
                        >
                          {uc.replace(/-/g, ' ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchingRecipes.length > 0 && (
                  <div className="mt-3.5 space-y-2.5 border-t border-[var(--border-subtle)] pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-crimson)]">
                      Featured Madurai Kitchen Preparation
                    </p>
                    {matchingRecipes.map((rec) => (
                      <div
                        key={rec.slug}
                        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 text-xs"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                            {rec.title}
                          </p>
                          <span className="font-tamil text-xs font-semibold text-[var(--brand-crimson)]">
                            {rec.tamilTitle} • {rec.occasionTag}
                          </span>
                        </div>
                        <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">
                          {rec.summary}
                        </p>
                        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[var(--text-secondary)]">
                          {rec.steps.slice(0, 3).map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                        <Link
                          href="/recipes"
                          className="mt-2 inline-block font-bold text-[var(--brand-crimson)] hover:underline"
                        >
                          View full recipe in Kitchen Ideas →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                Ingredients & Allergen Information
              </h2>
              {product.ingredientsVerifiedEnglish && product.ingredientsVerifiedEnglish.length > 0 ? (
                <div className="mt-2.5">
                  <p className="text-xs font-bold text-[var(--brand-leaf)]">
                    Verified from front packaging label:
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {product.ingredientsVerifiedEnglish.map((ing) => (
                      <li
                        key={ing}
                        className="rounded-full bg-[var(--bg-sand)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]"
                      >
                        {ing}
                      </li>
                    ))}
                  </ul>
                  {product.ingredientsVerifiedTamil && (
                    <p className="font-tamil mt-2.5 text-xs text-[var(--text-muted)]">
                      தமிழ்: {product.ingredientsVerifiedTamil}
                    </p>
                  )}
                </div>
              ) : null}
              <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                {product.ingredientsNote}
              </p>
            </section>

            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 text-xs text-[var(--text-secondary)]">
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                Packaging, Shelf Life & Storage
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-[var(--text-primary)]">Printed Best Before</dt>
                  <dd className="mt-0.5">
                    {activeVariant?.bestBeforePrinted || 'Pending label verification'}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--text-primary)]">Printed FSSAI Lic. No.</dt>
                  <dd className="font-mono-num mt-0.5">
                    {product.fssaiPrinted
                      ? `${product.fssaiPrinted} (verification pending)`
                      : 'Not visible on front photo (pending confirmation)'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-[var(--text-primary)]">Storage Guidance</dt>
                  <dd className="mt-0.5 leading-relaxed">{product.storageGuidance}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-[var(--text-primary)]">Packer / Address (Printed on Pack)</dt>
                  <dd className="mt-0.5">{BRAND.printedAddressEnglish}</dd>
                </div>
              </dl>
            </section>

            <section className="flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-sand)]/60 p-4 text-xs text-[var(--text-secondary)]">
              <p className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <Truck className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                Provisional Shipping: ₹49 Tamil Nadu • ₹79 Rest of India • Free on ₹499+
              </p>
              <p>{BRAND.shippingRules.estimatedDispatchNote}</p>
              <div className="mt-1 flex flex-wrap gap-4 font-bold text-[var(--brand-crimson)]">
                <Link href="/legal/shipping" className="hover:underline">Shipping Policy</Link>
                <Link href="/legal/returns" className="hover:underline">Returns & Refunds</Link>
                <Link href="/legal/grievance-and-compliance" className="hover:underline">
                  FSSAI & Disclosures
                </Link>
              </div>
            </section>

            {product.labelVerificationFlags.length > 0 && (
              <details className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-xs">
                <summary className="flex cursor-pointer items-center gap-2 font-semibold text-[var(--text-primary)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--brand-leaf)]" aria-hidden="true" />
                  Packaging Verification Notes ({product.labelVerificationFlags.length})
                </summary>
                <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[var(--text-secondary)]">
                  {product.labelVerificationFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14 border-t border-[var(--border-subtle)] pt-10">
          <h2 id="related-heading" className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Pairs Well in Your Kitchen
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* Label Zoom Lightbox (Original full-resolution photo for crisp label reading) */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Inspect full-resolution original product label"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative h-[86vh] w-full max-w-xl overflow-hidden rounded-2xl bg-[var(--bg-surface)] p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Close zoomed label"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-deep)] text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <PouchImage
              src={displayOriginal}
              alt={activeImage?.altText || product.name}
              width={960}
              height={1280}
              priority
              fit="contain"
            />
          </div>
        </div>
      )}

      {/* Mobile Non-Obscuring Sticky Purchase Bar */}
      {isOrderable && (
        <div className="fixed inset-x-0 bottom-[64px] z-30 border-t border-[var(--border-strong)] bg-[var(--bg-surface)]/95 px-4 py-2.5 shadow-lg backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <p className="font-mono-num text-base font-bold text-[var(--text-primary)]">
                {formatPaiseToInr(selectedLineSubtotalPaise ?? activeVariant?.pricePaise)}
              </p>
              <p className="truncate text-[11px] text-[var(--text-muted)]">
                {activeVariant?.label}
                {quantity > 1 ? ` × ${quantity}` : ''}
              </p>
            </div>
            <div className="inline-flex h-10 shrink-0 items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-0.5">
              <button
                type="button"
                disabled={quantity <= 1 || adding}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease mobile quantity"
                className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-35"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono-num min-w-[1.5rem] text-center text-xs font-bold">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= maxAllowedQty || adding}
                onClick={() => setQuantity((q) => Math.min(maxAllowedQty, q + 1))}
                aria-label="Increase mobile quantity"
                className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-35"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white transition-colors disabled:opacity-65 ${
                addedFlash ? 'bg-[var(--brand-leaf)]' : 'bg-[var(--brand-crimson)]'
              }`}
            >
              {addedFlash ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  {adding ? 'Adding...' : 'Add to Bag'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
