import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'Transparent provisional shipping thresholds, dispatch notes, and delivery disclosures for Madurai Aanandha Masala.',
};

export default function ShippingPolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Shipping & Delivery</span>
      </nav>

      <h1 className="font-display mt-4 text-3xl font-bold text-[var(--text-primary)]">
        Shipping & Delivery Policy
      </h1>
      <p className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-medium text-amber-950">
        <strong>Provisional Policy Notice:</strong> Exact courier partner SLAs and pincode
        serviceability tables are pending final confirmation by the business operator before
        commercial launch. No unverified same-day or guaranteed delivery dates are promised.
      </p>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            1. Transparent Shipping Charges (Provisional Slabs)
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li><strong>Orders ₹499 and above:</strong> Free shipping across serviceable Indian pincodes.</li>
            <li><strong>Tamil Nadu & Puducherry (under ₹499):</strong> Flat ₹49.</li>
            <li><strong>Rest of India (under ₹499):</strong> Flat ₹79.</li>
          </ul>
          <p className="mt-2">
            Shipping charges are always displayed clearly in your Shopping Bag and Guest Checkout
            before payment — never added as a hidden fee at the final step.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            2. Dispatch Origin & Tracking
          </h2>
          <p className="mt-2">
            Orders are dispatched from Madurai, Tamil Nadu ({BRAND.printedAddressEnglish}). Once
            confirmed, you can verify live order status anytime on our{' '}
            <Link href="/orders/track" className="font-semibold text-[var(--brand-crimson)] underline">
              Order Status page
            </Link>{' '}
            or contact {BRAND.phoneDisplay}.
          </p>
        </section>
      </div>
    </article>
  );
}
