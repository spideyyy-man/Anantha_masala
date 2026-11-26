'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, ArrowRight, Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '@/components/providers/StoreProviders';
import { formatPaiseToInr } from '@/data/brand';
import { getCutoutUrlFromThumb } from '@/lib/media';
import { PouchImage } from '@/components/ui/PouchImage';

export function CartDrawer() {
  const { cart, cartDrawerOpen, setCartDrawerOpen, updateQuantity, trackEvent } = useStore();
  const [updatingVariantIds, setUpdatingVariantIds] = useState<Record<number, boolean>>({});

  const handleQtyChange = async (variantId: number, nextQuantity: number) => {
    if (updatingVariantIds[variantId]) return;
    setUpdatingVariantIds((prev) => ({ ...prev, [variantId]: true }));
    try {
      await updateQuantity(variantId, Math.max(0, nextQuantity));
    } finally {
      setUpdatingVariantIds((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  useEffect(() => {
    if (!cartDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cartDrawerOpen, setCartDrawerOpen]);

  const items = cart?.items ?? [];
  const threshold = cart?.freeShippingThresholdPaise ?? 49900;
  const subtotal = cart?.subtotalPaise ?? 0;
  const progressPct = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shopping bag"
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-[var(--bg-surface)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-[var(--brand-crimson)]" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Your Spice Bag ({cart?.itemCount ?? 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close shopping bag"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-surface-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free shipping threshold progress */}
            {items.length > 0 && (
              <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-5 py-3">
                <p className="text-xs font-medium text-[var(--text-secondary)]">
                  {cart && cart.amountToFreeShippingPaise > 0 ? (
                    <>
                      Add{' '}
                      <strong className="text-[var(--brand-crimson)]">
                        {formatPaiseToInr(cart.amountToFreeShippingPaise)}
                      </strong>{' '}
                      more for free shipping (provisional ₹499+ rule)
                    </>
                  ) : (
                    <span className="font-semibold text-[var(--brand-leaf)]">
                      Free shipping unlocked for this order!
                    </span>
                  )}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-leaf)] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface-muted)] text-[var(--text-muted)]">
                    <ShoppingBag className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <p className="mt-4 font-display text-lg font-semibold text-[var(--text-primary)]">
                    Your spice bag is empty
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-[var(--text-secondary)]">
                    Explore our Madurai masalas, idli podis, heritage rice flours, and kanji mixes.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setCartDrawerOpen(false)}
                    className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-crimson-hover)]"
                  >
                    Browse All Products
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => {
                    const isBusy = Boolean(updatingVariantIds[item.variantId]);
                    const maxAllowed = Math.min(25, item.stockQty || 25);
                    return (
                      <li
                        key={item.variantId}
                        aria-busy={isBusy}
                        className={`flex gap-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 p-3 transition-opacity ${
                          isBusy ? 'opacity-65' : ''
                        }`}
                      >
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={() => setCartDrawerOpen(false)}
                          className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F4E8D6] p-1"
                        >
                          <PouchImage
                            src={getCutoutUrlFromThumb(item.thumbUrl, '420')}
                            fallbackSrc={item.thumbUrl}
                            alt={item.productName}
                            width={120}
                            height={160}
                            priority
                            imgClassName="pouch-float-light"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                href={`/products/${item.productSlug}`}
                                onClick={() => setCartDrawerOpen(false)}
                                className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--brand-crimson)]"
                              >
                                {item.productName}
                              </Link>
                              <p className="font-tamil text-xs text-[var(--text-muted)]">
                                {item.tamilName}
                              </p>
                              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                {item.variantLabel} •{' '}
                                <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                                  {formatPaiseToInr(item.unitPricePaise)}
                                </span>{' '}
                                unit price
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleQtyChange(item.variantId, 0)}
                              aria-label={`Remove ${item.productName}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--brand-crimson-soft)] hover:text-[var(--brand-crimson)] disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between">
                            <div
                              role="group"
                              aria-label={`Quantity controls for ${item.productName}`}
                              className="inline-flex items-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)]"
                            >
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleQtyChange(item.variantId, item.quantity - 1)}
                                aria-label={`Decrease quantity of ${item.productName}`}
                                className="flex h-8 w-8 items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)] disabled:opacity-35"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="font-mono-num min-w-8 text-center text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={isBusy || item.quantity >= maxAllowed}
                                onClick={() => void handleQtyChange(item.variantId, item.quantity + 1)}
                                aria-label={`Increase quantity of ${item.productName}`}
                                className="flex h-8 w-8 items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)] disabled:opacity-35"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                Item Subtotal
                              </span>
                              <span className="font-mono-num text-sm font-bold text-[var(--text-primary)]">
                                {formatPaiseToInr(item.lineTotalPaise)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer totals & CTA */}
            {items.length > 0 && cart && (
              <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-5 py-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Cart Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'pack' : 'packs'})</span>
                    <span className="font-mono-num font-semibold text-[var(--text-primary)]">{formatPaiseToInr(cart.subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Estimated Shipping (TN default)</span>
                    <span className="font-mono-num font-medium">
                      {cart.shippingPaise === 0 ? (
                        <strong className="text-[var(--brand-leaf)]">FREE</strong>
                      ) : (
                        formatPaiseToInr(cart.shippingPaise)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2 text-base font-bold text-[var(--text-primary)]">
                    <span>Estimated Total</span>
                    <span className="font-mono-num">{formatPaiseToInr(cart.totalPaise)}</span>
                  </div>
                </div>
                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-[var(--bg-surface)] p-2 text-[11px] leading-snug text-[var(--text-secondary)]">
                  <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
                  <span>{cart.shippingRegionNote}</span>
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href="/checkout"
                    onClick={() => setCartDrawerOpen(false)}
                    className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-crimson-hover)]"
                  >
                    Continue with WhatsApp Order
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/cart"
                      onClick={() => setCartDrawerOpen(false)}
                      className="flex min-h-[42px] items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
                    >
                      View Full Cart
                    </Link>
                    <a
                      href={cart.whatsappEnquiryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent({ eventName: 'whatsapp_click', path: '/cart-drawer' })}
                      className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] text-xs font-semibold text-[var(--brand-leaf)] hover:bg-[var(--brand-leaf)] hover:text-white"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      WhatsApp Enquiry
                    </a>
                  </div>
                  <p className="text-[11px] leading-snug text-[var(--text-muted)]">
                    WhatsApp opens an enquiry chat only — it is not a confirmed order or payment until confirmed by our team.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
