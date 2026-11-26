import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Cancellation, Returns & Refunds Policy',
  description: 'Food-safety-aware cancellation, damaged-pack replacement, and refund process for Madurai Anantha Masala.',
};

export default function ReturnsPolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Cancellation, Returns & Refunds</span>
      </nav>

      <h1 className="font-display mt-4 text-3xl font-bold text-[var(--text-primary)]">
        Cancellation, Returns & Refunds Policy
      </h1>
      <p className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-medium text-amber-950">
        <strong>Pre-Launch Review Note:</strong> Final refund timelines and commercial return
        thresholds must be confirmed by the business operator in accordance with Consumer
        Protection (E-Commerce) Rules prior to production launch.
      </p>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            1. Order Cancellation
          </h2>
          <p className="mt-2">
            Orders may be cancelled prior to dispatch by contacting {BRAND.phoneDisplay} with your
            Order ID. Once packed and handed to a courier partner, cancellation may not be possible.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            2. Food Safety & Eligible Claims
          </h2>
          <p className="mt-2">
            Because spices, flours, and food mixes are perishable consumables, opened pouches cannot
            be restocked. However, if you receive a wrong SKU, torn/leaking seal, or expired batch,
            please share your Order ID and unboxing photographs within 48 hours of delivery via{' '}
            <Link href="/contact" className="font-semibold text-[var(--brand-crimson)] underline">
              Customer Support
            </Link>{' '}
            or WhatsApp ({BRAND.phoneDisplay}) for replacement or refund review.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            3. Refund Method
          </h2>
          <p className="mt-2">
            Approved refunds for online payments are returned to the original payment source through
            our payment gateway adapter; payment failures that did not settle are reconciled
            automatically via webhook verification.
          </p>
        </section>
      </div>
    </article>
  );
}
