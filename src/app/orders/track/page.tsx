'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  MessageCircle,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { BRAND, buildWhatsAppUrl, formatPaiseToInr } from '@/data/brand';

interface TrackedOrder {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentProvider: string;
  customerName: string;
  customerPhoneMasked: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  createdAt: string;
  items: {
    id: number;
    sku: string;
    productName: string;
    tamilName: string;
    variantLabel: string;
    unitPricePaise: number;
    quantity: number;
    lineTotalPaise: number;
  }[];
  latestPayment: {
    status: string;
    provider: string;
    failureReason: string | null;
  } | null;
}

function OrderTrackInner() {
  const searchParams = useSearchParams();
  const initialOrderParam = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderParam);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const performLookup = async (ordNum: string, mob: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: ordNum, phone: mob }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrder(null);
        setError(data.error || 'Order not found.');
      } else {
        setOrder(data.order as TrackedOrder);
      }
    } catch {
      setError('Network error while looking up order. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup safely from sessionStorage right after checkout redirect WITHOUT exposing raw mobile in visible input
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('am_last_order');
      if (saved) {
        const parsed = JSON.parse(saved) as { orderNumber?: string; phone?: string };
        const ord = initialOrderParam || parsed.orderNumber || '';
        const mob = parsed.phone || '';
        if (ord) setOrderNumber(ord);
        if (ord && mob && initialOrderParam) {
          void performLookup(ord, mob).then(() => {
            try {
              sessionStorage.setItem('am_last_order', JSON.stringify({ orderNumber: ord }));
            } catch {
              // ignore
            }
          });
        }
      }
    } catch {
      // ignore
    }
  }, [initialOrderParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performLookup(orderNumber, phone);
  };

  const formatIst = (iso: string) =>
    new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Order Status</span>
      </nav>

      <h1 className="font-display mt-3 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
        Order Confirmation & Status
      </h1>
      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
        To protect your privacy, enter both your Order ID and the 10-digit mobile number used at
        checkout.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs sm:grid-cols-12"
      >
        <div className="sm:col-span-5">
          <label htmlFor="track-order" className="block text-xs font-semibold text-[var(--text-primary)]">
            Order ID
          </label>
          <input
            id="track-order"
            required
            placeholder="e.g. AM261124-A1B2C3"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="font-mono-num mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm uppercase"
          />
        </div>
        <div className="sm:col-span-4">
          <label htmlFor="track-phone" className="block text-xs font-semibold text-[var(--text-primary)]">
            Checkout Mobile
          </label>
          <input
            id="track-phone"
            type="tel"
            required
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
          />
        </div>
        <div className="flex items-end sm:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-crimson)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-crimson-hover)] disabled:opacity-60"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {order && (
        <section
          aria-label="Verified order details"
          className="mt-8 overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-sm"
        >
          {/* Status Banner */}
          <div
            className={`flex items-start gap-3 p-5 sm:p-6 ${
              order.paymentStatus === 'captured'
                ? 'bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)]'
                : order.paymentStatus === 'failed'
                  ? 'bg-red-50 text-red-900'
                  : 'bg-amber-50 text-amber-950'
            }`}
          >
            {order.paymentStatus === 'captured' ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
            ) : order.paymentStatus === 'failed' ? (
              <XCircle className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
            ) : (
              <Clock className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
            )}
            <div>
              <p className="font-display text-xl font-bold">
                {order.paymentStatus === 'captured'
                  ? 'Payment Verified & Order Confirmed'
                  : order.paymentStatus === 'failed'
                    ? 'Payment Failed — Stock Released'
                    : 'Payment Pending Server Confirmation'}
              </p>
              <p className="mt-1 text-xs">
                Order <strong className="font-mono-num">{order.orderNumber}</strong> • Placed{' '}
                {formatIst(order.createdAt)} IST • Mode:{' '}
                <strong className="uppercase">{order.paymentProvider}</strong>
              </p>
              {order.latestPayment?.failureReason && (
                <p className="mt-1.5 text-xs font-semibold">
                  Gateway note: {order.latestPayment.failureReason}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 rounded-2xl bg-[var(--bg-canvas)] p-4 text-xs sm:grid-cols-2">
              <div>
                <p className="font-bold uppercase tracking-wider text-[var(--text-muted)]">Recipient</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{order.customerName}</p>
                <p className="text-[var(--text-secondary)]">Mobile: {order.customerPhoneMasked}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-[var(--text-muted)]">Destination</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
                </p>
                <p className="flex items-center gap-1 text-[var(--text-secondary)]">
                  <Package className="h-3.5 w-3.5" aria-hidden="true" />
                  Fulfilment status: <strong className="capitalize">{order.status.replace(/_/g, ' ')}</strong>
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">Items</h2>
              <ul className="mt-2 divide-y divide-[var(--border-subtle)] text-sm">
                {order.items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{it.productName}</p>
                      <p className="font-tamil text-xs text-[var(--text-muted)]">
                        {it.tamilName} • {it.variantLabel} •{' '}
                        <span className="font-mono-num">{formatPaiseToInr(it.unitPricePaise)}</span> ×{' '}
                        <strong className="font-mono-num">{it.quantity}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        Item Subtotal
                      </span>
                      <span className="font-mono-num font-bold text-[var(--text-primary)]">
                        {formatPaiseToInr(it.lineTotalPaise)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-1.5 border-t border-[var(--border-subtle)] pt-4 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <dt>Subtotal</dt>
                <dd className="font-mono-num">{formatPaiseToInr(order.subtotalPaise)}</dd>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <dt>Shipping</dt>
                <dd className="font-mono-num">
                  {order.shippingPaise === 0 ? 'FREE' : formatPaiseToInr(order.shippingPaise)}
                </dd>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-[var(--text-primary)]">
                <dt>Total</dt>
                <dd className="font-mono-num">{formatPaiseToInr(order.totalPaise)}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
              <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-leaf)]" aria-hidden="true" />
                Verified directly from server order records
              </p>
              <a
                href={buildWhatsAppUrl(
                  `Hello ${BRAND.fullName}, I need support regarding Order ${order.orderNumber} (Status: ${order.status}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-4 text-xs font-semibold text-[var(--brand-leaf)]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Order Support on WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function OrderTrackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12 text-center text-sm text-[var(--text-muted)]">
          Loading order status lookup...
        </div>
      }
    >
      <OrderTrackInner />
    </Suspense>
  );
}
