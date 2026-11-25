'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  Truck,
} from 'lucide-react';
import { useStore } from '@/components/providers/StoreProviders';
import { BRAND, buildWhatsAppUrl, formatPaiseToInr } from '@/data/brand';
import { getCutoutUrlFromThumb } from '@/lib/media';
import { PouchImage } from '@/components/ui/PouchImage';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Puducherry',
  'Karnataka',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'West Bengal',
  'Other Indian State / UT',
];


export default function CheckoutPage() {
  const { cart, cartLoading, refreshCart, trackEvent } = useStore();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddressLine1, setShippingAddressLine1] = useState('');
  const [shippingAddressLine2, setShippingAddressLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('Madurai');
  const [shippingState, setShippingState] = useState('Tamil Nadu');
  const [shippingPincode, setShippingPincode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    trackEvent({ eventName: 'begin_checkout', valuePaise: cart?.totalPaise });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch authoritative shipping fee whenever delivery state changes
  useEffect(() => {
    void refreshCart(shippingState);
  }, [shippingState, refreshCart]);

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const validateClientSide = (): Record<string, string[]> => {
    const errs: Record<string, string[]> = {};
    if (customerName.trim().length < 2) {
      errs.customerName = ['Please enter your full name (at least 2 characters).'];
    }
    const cleanPhone = customerPhone.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.customerPhone = ['Please enter a valid 10-digit Indian mobile number starting with 6–9.'];
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errs.customerEmail = ['Please enter a valid email address or leave optional email blank.'];
    }
    if (shippingAddressLine1.trim().length < 5) {
      errs.shippingAddressLine1 = ['Please enter your door number, street, and locality (at least 5 characters).'];
    }
    if (shippingCity.trim().length < 2) {
      errs.shippingCity = ['Please enter your city or town.'];
    }
    if (!/^\d{6}$/.test(shippingPincode.trim())) {
      errs.shippingPincode = ['Please enter a valid 6-digit Indian pincode.'];
    }
    return errs;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !cart || cart.items.length === 0) return;
    setFormError(null);
    setFieldErrors({});

    const clientErrs = validateClientSide();
    if (Object.keys(clientErrs).length > 0) {
      setFieldErrors(clientErrs);
      setFormError('Please correct the highlighted delivery fields below before continuing.');
      window.setTimeout(() => errorSummaryRef.current?.focus(), 20);
      return;
    }

    const message = [
      '*New order enquiry - Madurai Aanandha Masala*',
      '',
      '*Customer details*',
      'Name: ' + customerName.trim(),
      'Phone: ' + customerPhone.trim(),
      customerEmail.trim() ? 'Email: ' + customerEmail.trim() : null,
      '',
      '*Delivery address*',
      shippingAddressLine1.trim(),
      shippingAddressLine2.trim() || null,
      shippingCity.trim() + ', ' + shippingState,
      'Pincode: ' + shippingPincode.trim(),
      deliveryNotes.trim() ? 'Delivery note: ' + deliveryNotes.trim() : null,
      '',
      '*Items requested*',
      ...cart.items.map((item, index) =>
        (index + 1) + '. ' + item.productName + ' / ' + item.variantLabel +
        ' x ' + item.quantity + ' = ' + formatPaiseToInr(item.lineTotalPaise)
      ),
      '',
      'Subtotal: ' + formatPaiseToInr(cart.subtotalPaise),
      'Shipping estimate (' + shippingState + '): ' +
        (cart.shippingPaise === 0 ? 'FREE' : formatPaiseToInr(cart.shippingPaise)),
      '*Estimated total: ' + formatPaiseToInr(cart.totalPaise) + '*',
      '',
      'Please confirm product availability, final shipping charge and order total. I understand this is an enquiry, not a confirmed order. No online payment has been made.',
    ].filter(Boolean).join('\n');

    const link = document.createElement('a');
    link.href = buildWhatsAppUrl(message);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    trackEvent({ eventName: 'whatsapp_click', path: '/checkout' });
    setSubmitting(true);
    window.setTimeout(() => setSubmitting(false), 1200);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/cart" className="hover:text-[var(--brand-crimson)]">Shopping Bag</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">WhatsApp Order Request</span>
      </nav>

      <h1 className="font-display mt-3 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
        WhatsApp Order Request
      </h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Send your order request directly to our team on WhatsApp. We will confirm availability and delivery before accepting the order.
      </p>

      {cartLoading ? (
        <div className="mt-8 rounded-2xl bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
          Loading checkout details...
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center">
          <p className="font-display text-xl font-bold">Your shopping bag is empty</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Add products to your bag before checking out.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-semibold text-white"
          >
            Shop All Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* WhatsApp Order Details */}
          <form onSubmit={handleSubmitOrder} noValidate className="space-y-6 lg:col-span-7">
            {formError && (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl border border-red-400 bg-red-50 p-4 text-sm text-red-900"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
                <div>
                  <p className="font-bold">{formError}</p>
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                1. Contact Details
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="chk-name" className="block text-xs font-semibold text-[var(--text-primary)]">
                    Full Name <span className="text-[var(--brand-crimson)]">*</span>
                  </label>
                  <input
                    id="chk-name"
                    required
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.customerName?.[0])}
                    aria-describedby={fieldErrors.customerName?.[0] ? 'chk-name-err' : undefined}
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      clearFieldError('customerName');
                    }}
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 text-sm ${
                      fieldErrors.customerName?.[0]
                        ? 'border-red-600 ring-1 ring-red-600/30'
                        : 'border-[var(--border-strong)]'
                    }`}
                  />
                  {fieldErrors.customerName?.[0] && (
                    <p id="chk-name-err" role="alert" className="mt-1 text-xs font-medium text-red-700">
                      {fieldErrors.customerName[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="chk-phone" className="block text-xs font-semibold text-[var(--text-primary)]">
                    Indian Mobile Number <span className="text-[var(--brand-crimson)]">*</span>
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    inputMode="numeric"
                    required
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    aria-invalid={Boolean(fieldErrors.customerPhone?.[0])}
                    aria-describedby={fieldErrors.customerPhone?.[0] ? 'chk-phone-err' : undefined}
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value.replace(/[^\d\s-]/g, '').slice(0, 14));
                      clearFieldError('customerPhone');
                    }}
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 text-sm ${
                      fieldErrors.customerPhone?.[0]
                        ? 'border-red-600 ring-1 ring-red-600/30'
                        : 'border-[var(--border-strong)]'
                    }`}
                  />
                  {fieldErrors.customerPhone?.[0] && (
                    <p id="chk-phone-err" role="alert" className="mt-1 text-xs font-medium text-red-700">
                      {fieldErrors.customerPhone[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="chk-email" className="block text-xs font-semibold text-[var(--text-primary)]">
                    Email (Optional)
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.customerEmail?.[0])}
                    aria-describedby={fieldErrors.customerEmail?.[0] ? 'chk-email-err' : undefined}
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      clearFieldError('customerEmail');
                    }}
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 text-sm ${
                      fieldErrors.customerEmail?.[0]
                        ? 'border-red-600 ring-1 ring-red-600/30'
                        : 'border-[var(--border-strong)]'
                    }`}
                  />
                  {fieldErrors.customerEmail?.[0] && (
                    <p id="chk-email-err" role="alert" className="mt-1 text-xs font-medium text-red-700">
                      {fieldErrors.customerEmail[0]}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                2. Delivery Address
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="chk-addr1" className="block text-xs font-semibold text-[var(--text-primary)]">
                    Door No., Street & Locality <span className="text-[var(--brand-crimson)]">*</span>
                  </label>
                  <input
                    id="chk-addr1"
                    required
                    autoComplete="address-line1"
                    aria-invalid={Boolean(fieldErrors.shippingAddressLine1?.[0])}
                    aria-describedby={fieldErrors.shippingAddressLine1?.[0] ? 'chk-addr1-err' : undefined}
                    value={shippingAddressLine1}
                    onChange={(e) => {
                      setShippingAddressLine1(e.target.value);
                      clearFieldError('shippingAddressLine1');
                    }}
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 text-sm ${
                      fieldErrors.shippingAddressLine1?.[0]
                        ? 'border-red-600 ring-1 ring-red-600/30'
                        : 'border-[var(--border-strong)]'
                    }`}
                  />
                  {fieldErrors.shippingAddressLine1?.[0] && (
                    <p id="chk-addr1-err" role="alert" className="mt-1 text-xs font-medium text-red-700">
                      {fieldErrors.shippingAddressLine1[0]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="chk-addr2" className="block text-xs font-semibold text-[var(--text-primary)]">
                    Landmark (Optional)
                  </label>
                  <input
                    id="chk-addr2"
                    autoComplete="address-line2"
                    value={shippingAddressLine2}
                    onChange={(e) => setShippingAddressLine2(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="chk-city" className="block text-xs font-semibold text-[var(--text-primary)]">
                    City / Town <span className="text-[var(--brand-crimson)]">*</span>
                  </label>
                  <input
                    id="chk-city"
                    required
                    autoComplete="address-level2"
                    aria-invalid={Boolean(fieldErrors.shippingCity?.[0])}
                    aria-describedby={fieldErrors.shippingCity?.[0] ? 'chk-city-err' : undefined}
                    value={shippingCity}
                    onChange={(e) => {
                      setShippingCity(e.target.value);
                      clearFieldError('shippingCity');
                    }}
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 text-sm ${
                      fieldErrors.shippingCity?.[0]
                        ? 'border-red-600 ring-1 ring-red-600/30'
                        : 'border-[var(--border-strong)]'
                    }`}
                  />
                  {fieldErrors.shippingCity?.[0] && (
                    <p id="chk-city-err" role="alert" className="mt-1 text-xs font-medium text-red-700">
                      {fieldErrors.shippingCity[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="chk-state" className="block text-xs font-semibold text-[var(--text-primary)]">
                    State <span className="text-[var(--brand-crimson)]">*</span>
                  </label>
                  <select
                    id="chk-state"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="chk-pin" className="block text-xs font-semibold text-[var(--text-primary)]">
                    6-Digit Pincode <span className="text-[var(--brand-crimson)]">*</span>
                  </label>
                  <input
                    id="chk-pin"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="e.g. 625012"
                    aria-invalid={Boolean(fieldErrors.shippingPincode?.[0])}
                    aria-describedby={fieldErrors.shippingPincode?.[0] ? 'chk-pin-err' : undefined}
                    value={shippingPincode}
                    onChange={(e) => {
                      setShippingPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      clearFieldError('shippingPincode');
                    }}
                    className={`font-mono-num mt-1.5 h-11 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 text-sm ${
                      fieldErrors.shippingPincode?.[0]
                        ? 'border-red-600 ring-1 ring-red-600/30'
                        : 'border-[var(--border-strong)]'
                    }`}
                  />
                  {fieldErrors.shippingPincode?.[0] && (
                    <p id="chk-pin-err" role="alert" className="mt-1 text-xs font-medium text-red-700">
                      {fieldErrors.shippingPincode[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="chk-notes" className="block text-xs font-semibold text-[var(--text-primary)]">
                    Delivery Note (Optional)
                  </label>
                  <input
                    id="chk-notes"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Gate instructions, timing..."
                    className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3.5 text-sm"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-6 text-base font-semibold text-white shadow-md hover:bg-[var(--brand-crimson-hover)] disabled:opacity-60"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {submitting
                ? 'Opening WhatsApp...'
                : `Send Order on WhatsApp (${formatPaiseToInr(cart.totalPaise)})`}
            </button>

            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              By placing an order, you agree to our{' '}
              <Link href="/legal/terms" className="underline">Terms</Link>,{' '}
              <Link href="/legal/shipping" className="underline">Shipping Policy</Link>, and{' '}
              <Link href="/legal/privacy" className="underline">Privacy Notice</Link>.
            </p>
          </form>

          {/* Authoritative Order Summary */}
          <aside className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 shadow-xs lg:col-span-5 lg:self-start sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Bag Summary ({cart.itemCount} {cart.itemCount === 1 ? 'pack' : 'packs'})
              </h2>
              <Link
                href="/cart"
                className="text-xs font-semibold text-[var(--brand-crimson)] hover:underline"
              >
                Edit Bag
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-[var(--border-subtle)] text-sm">
              {cart.items.map((it) => (
                <li key={it.variantId} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F4E8D6] p-1">
                      <PouchImage
                        src={getCutoutUrlFromThumb(it.thumbUrl, '420')}
                        fallbackSrc={it.thumbUrl}
                        alt={it.productName}
                        width={80}
                        height={106}
                        priority
                        imgClassName="pouch-float-light"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--text-primary)]">
                        {it.productName}
                      </p>
                      <p className="font-tamil text-[11px] text-[var(--text-muted)]">
                        {it.tamilName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {it.variantLabel} •{' '}
                        <span className="font-mono-num">{formatPaiseToInr(it.unitPricePaise)}</span> ×{' '}
                        <strong className="font-mono-num">{it.quantity}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Subtotal
                    </span>
                    <span className="font-mono-num font-bold text-[var(--text-primary)]">
                      {formatPaiseToInr(it.lineTotalPaise)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-[var(--border-subtle)] pt-4 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <dt>Cart Subtotal</dt>
                <dd className="font-mono-num font-semibold text-[var(--text-primary)]">
                  {formatPaiseToInr(cart.subtotalPaise)}
                </dd>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <dt>Shipping ({shippingState})</dt>
                <dd className="font-mono-num font-semibold">
                  {cart.shippingPaise === 0 ? (
                    <span className="text-[var(--brand-leaf)]">FREE</span>
                  ) : (
                    formatPaiseToInr(cart.shippingPaise)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2.5 text-base font-bold text-[var(--text-primary)]">
                <dt>Estimated Total</dt>
                <dd className="font-mono-num">{formatPaiseToInr(cart.totalPaise)}</dd>
              </div>
            </dl>

            <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-[var(--bg-canvas)] p-3 text-xs text-[var(--text-secondary)]">
              <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
              <span>{cart.shippingRegionNote}. {BRAND.shippingRules.estimatedDispatchNote}</span>
            </p>

            <div className="mt-5 rounded-xl bg-[var(--bg-canvas)] p-3.5 text-xs text-[var(--text-secondary)]">
              <p className="flex items-center gap-1.5 font-semibold text-[var(--brand-leaf)]">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                WhatsApp-first ordering
              </p>
              <p className="mt-1">
                Prices and stock are re-verified on the server. Card/UPI details are tokenized by
                our hosted gateway adapter — never stored on our servers.
              </p>
            </div>

            <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                WhatsApp order assistance
              </p>
              <a
                href={cart.whatsappEnquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-4 text-xs font-semibold text-[var(--brand-leaf)]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Send Cart Summary on WhatsApp
              </a>
              <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
Your request is sent to our team for confirmation. No order is confirmed and no payment is taken on this website.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
