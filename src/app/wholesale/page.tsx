import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Package, Phone } from 'lucide-react';
import { BRAND } from '@/data/brand';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

export const metadata: Metadata = {
  title: 'Bulk & Wholesale Enquiries',
  description:
    'Request wholesale or bulk supply quotes for Madurai Anantha Masala spices, idli podis, heritage flours, and festive gifting packs.',
};

export default function WholesalePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Bulk & Wholesale</span>
      </nav>

      <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--brand-crimson)]">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Trade, HORECA & Gifting
          </p>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Wholesale & Bulk Supply from Madurai
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Supplying restaurants, caterers, South Indian grocery retailers, or wedding/festive
            return-gift hampers? Submit your expected product mix and monthly volume so our
            Madurai team can confirm batch lead times and trade pricing.
          </p>

          <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 text-xs text-[var(--text-secondary)]">
            <p className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <Package className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
              Available Bulk Categories
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Cooking Essentials (Sambar Podi, Kuzhambu Podi, Manjal Podi, Rasam Podi)</li>
              <li>Non-Veg Blends (Bhai Veetu Kari & Meen Masala, Fish Fry, Chicken Mutton Masala)</li>
              <li>Five Traditional Idli Podis (Milagai, Garlic, Sesame, Kollu, Pirandai)</li>
              <li>Heritage Rice Flours, Millet Dosa Mix, Sathu Maavu & Ulundhu Kali</li>
            </ul>
            <p className="flex items-center gap-1.5 pt-2 font-semibold text-[var(--text-primary)]">
              <Phone className="h-3.5 w-3.5 text-[var(--brand-leaf)]" aria-hidden="true" />
              Direct Trade Line: {BRAND.phoneDisplay}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <EnquiryForm
            type="bulk_wholesale"
            title="Request a Wholesale Quote"
            submitLabel="Submit Bulk Enquiry"
          />
        </div>
      </div>
    </div>
  );
}
