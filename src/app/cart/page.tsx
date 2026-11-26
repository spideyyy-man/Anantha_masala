'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useStore } from '@/components/providers/StoreProviders';
import { formatPaiseToInr } from '@/data/brand';
import type { CatalogProduct } from '@/domain/catalog/service';
import { ProductCard } from '@/components/cards/ProductCard';
import { getCutoutUrlFromThumb } from '@/lib/media';
import { PouchImage } from '@/components/ui/PouchImage';

export default function CartPage() {
  const { cart, cartLoading, updateQuantity, clearCart, trackEvent } = useStore();
  const [recommendations, setRecommendations] = useState<CatalogProduct[]>([]);
  const [updatingVariantIds, setUpdatingVariantIds] = useState<Record<number, boolean>>({});
  const [clearing, setClearing] = useState(false);

  const handleQtyChange = async (variantId: number, nextQuantity: number) => {
    if (updatingVariantIds[variantId]) return;
    setUpdatingVariantIds((prev) => ({ ...prev, [variantId]: true }));
    try {
      await updateQuantity(variantId, Math.max(0, nextQuantity));
    } finally {
      setUpdatingVariantIds((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const handleClear = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await clearCart();
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetch('/api/catalog?availability=in_stock&type=edible')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.products) {
          setRecommendations((data.products as CatalogProduct[]).slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  const items = cart?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Shopping Bag</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Your Spice Bag
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Prices, stock, and shipping thresholds are calculated authoritatively on our server.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            disabled={clearing}
            onClick={() => void handleClear()}
            className="text-xs font-semibold text-[var(--text-muted)] underline hover:text-[var(--brand-crimson)] disabled:opacity-50"
          >
            {clearing ? 'Clearing bag...' : 'Clear bag'}
          </button>
        )}
      </div>

      {cartLoading ? (
        <div className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
          Loading your spice bag...
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-[var(--text-muted)]" aria-hidden="true" />
          <h2 className="font-display mt-4 text-2xl font-bold text-[var(--text-primary)]">
            Your bag is empty
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
            Add Madurai masalas, idli podis, heritage rice flours, or kanji mixes and send your
            order request directly on WhatsApp — no account required.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-6 text-sm font-semibold text-white hover:bg-[var(--brand-crimson-hover)]"
          >
            Browse All Products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Items List */}
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => {
              const isBusy = Boolean(updatingVariantIds[item.variantId]);
              const maxAllowed = Math.min(25, item.stockQty || 25);
              return (
                <article
                  key={item.variantId}
                  aria-busy={isBusy}
                  className={`flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs transition-opacity sm:flex-row sm:items-center ${
                    isBusy ? 'opacity-65' : ''
                  }`}
                >
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-[#F4E8D6] p-1.5"
                  >
                    <PouchImage
                      src={getCutoutUrlFromThumb(item.thumbUrl, '420')}
                      fallbackSrc={item.thumbUrl}
                      alt={item.productName}
                      width={160}
                      height={213}
                      priority
                      imgClassName="pouch-float-light"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="font-display text-lg font-bold text-[var(--text-primary)] hover:text-[var(--brand-crimson)]"
                    >
                      {item.productName}
                    </Link>
                    <p className="font-tamil text-xs text-[var(--text-muted)]">{item.tamilName}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {item.variantLabel} • SKU: <span className="font-mono-num">{item.sku}</span>
                    </p>
                    <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                      Unit Price:{' '}
                      <strong className="font-mono-num text-[var(--text-primary)]">
                        {formatPaiseToInr(item.unitPricePaise)}
                      </strong>{' '}
                      per pack
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Item Subtotal ({item.quantity} × {formatPaiseToInr(item.unitPricePaise)})
                      </span>
                      <span className="font-mono-num text-lg font-bold text-[var(--text-primary)]">
                        {formatPaiseToInr(item.lineTotalPaise)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        role="group"
                        aria-label={`Quantity controls for ${item.productName}`}
                        className="inline-flex items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)]"
                      >
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleQtyChange(item.variantId, item.quantity - 1)}
                          aria-label={`Decrease quantity for ${item.productName}`}
                          className="flex h-10 w-10 items-center justify-center hover:bg-[var(--bg-surface-muted)] disabled:opacity-35"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-mono-num min-w-8 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isBusy || item.quantity >= maxAllowed}
                          onClick={() => void handleQtyChange(item.variantId, item.quantity + 1)}
                          aria-label={`Increase quantity for ${item.productName}`}
                          className="flex h-10 w-10 items-center justify-center hover:bg-[var(--bg-surface-muted)] disabled:opacity-35"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleQtyChange(item.variantId, 0)}
                        aria-label={`Remove ${item.productName}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)] disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          {cart && (
            <aside className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-sm lg:col-span-4 lg:self-start">
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                Order Summary
              </h2>

              {/* Free Shipping Progress Meter */}
              <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  <Truck className="h-3.5 w-3.5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
                  {cart.amountToFreeShippingPaise > 0 ? (
                    <span>
                      Add{' '}
                      <strong className="font-mono-num text-[var(--brand-crimson)]">
                        {formatPaiseToInr(cart.amountToFreeShippingPaise)}
                      </strong>{' '}
                      more for free shipping (₹499+ threshold)
                    </span>
                  ) : (
                    <span className="font-semibold text-[var(--brand-leaf)]">
                      Free shipping unlocked for this order!
                    </span>
                  )}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-leaf)] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (cart.subtotalPaise / (cart.freeShippingThresholdPaise || 49900)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <dt>Cart Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'pack' : 'packs'})</dt>
                  <dd className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {formatPaiseToInr(cart.subtotalPaise)}
                  </dd>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <dt>Provisional Shipping (TN default)</dt>
                  <dd className="font-mono-num font-semibold">
                    {cart.shippingPaise === 0 ? (
                      <span className="text-[var(--brand-leaf)]">FREE</span>
                    ) : (
                      formatPaiseToInr(cart.shippingPaise)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-[var(--border-subtle)] pt-3 text-base font-bold text-[var(--text-primary)]">
                  <dt>Estimated Total</dt>
                  <dd className="font-mono-num">{formatPaiseToInr(cart.totalPaise)}</dd>
                </div>
              </dl>

              <p className="mt-3 rounded-xl bg-[var(--bg-canvas)] p-3 text-xs text-[var(--text-muted)]">
                {cart.shippingRegionNote}. Final shipping updates automatically when you select your
                delivery state at checkout — zero hidden fees.
              </p>

              <div className="mt-5 space-y-2.5">
                <Link
                  href="/checkout"
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-crimson-hover)]"
                >
                  Continue with WhatsApp Order
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={cart.whatsappEnquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ eventName: 'whatsapp_click', path: '/cart' })}
                  className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-4 text-sm font-semibold text-[var(--brand-leaf)] hover:bg-[var(--brand-leaf)] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Send Bag via WhatsApp Enquiry
                </a>
                <p className="text-[11px] leading-snug text-[var(--text-muted)]">
                  Your WhatsApp message is an order request. Our team will confirm availability, delivery and final total.
                </p>
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--brand-leaf)]">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>WhatsApp ordering • No online payment or card details collected</span>
              </p>
            </aside>
          )}
        </div>
      )}

      {/* Compact Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-14 border-t border-[var(--border-subtle)] pt-10">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Add Another Madurai Staple
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
