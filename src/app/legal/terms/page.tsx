import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Storefront terms of use, order verification rules, and disclaimers for Madurai Aanandha Masala.',
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Terms of Use</span>
      </nav>

      <h1 className="font-display mt-4 text-3xl font-bold text-[var(--text-primary)]">
        Terms of Use
      </h1>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            1. Orders & Pricing Integrity
          </h2>
          <p className="mt-2">
            All product prices, pack quantities, and shipping totals are computed authoritatively on
            the server in Indian Rupees (INR). An online order is confirmed only after payment
            verification via server-side gateway confirmation. Initiating a WhatsApp enquiry never
            constitutes a confirmed order or payment until explicitly confirmed by {BRAND.fullName}.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            2. Product Information & External-Use Items
          </h2>
          <p className="mt-2">
            Product descriptions reflect audited packaging labels. Always inspect the physical
            pouch upon delivery for batch-specific manufacturing/expiry dates, ingredients, and
            allergens. Products categorized under Traditional Herbal Care (Kuliyal Podi / Nalangu
            Maavu) are strictly for external bathing use only and are not edible foods.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            3. Sandbox Notice
          </h2>
          <p className="mt-2">
            When payment gateway credentials are not live, checkout runs in clearly labelled Sandbox
            Test Mode where no real financial charge occurs.
          </p>
        </section>
      </div>
    </article>
  );
}
