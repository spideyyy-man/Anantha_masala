import React from 'react';
import Link from 'next/link';
import { Instagram, Youtube, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { BRAND } from '@/data/brand';
import { PrivacyTrigger } from '@/components/ui/PrivacyTrigger';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-deep)] pb-24 text-[var(--text-on-deep)] md:pb-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Madurai identity */}
          <div className="space-y-4">
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-white">
                {BRAND.fullName}
              </p>
              <p className="font-tamil mt-0.5 text-sm text-[var(--brand-turmeric-bright)]">
                {BRAND.tamilName}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-on-deep-muted)]">
              {BRAND.positioning} {BRAND.tagline}
            </p>
            <div className="space-y-2 text-xs text-[var(--text-on-deep-muted)]">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-turmeric-bright)]" aria-hidden="true" />
                <span>{BRAND.printedAddressEnglish} (as printed on packaging)</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[var(--brand-turmeric-bright)]" aria-hidden="true" />
                <a href={`tel:+91${BRAND.phoneRaw}`} className="hover:text-white hover:underline">
                  {BRAND.phoneDisplay}
                </a>
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={BRAND.social.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-white hover:bg-white/15"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                Instagram
              </a>
              <a
                href={BRAND.social.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-white hover:bg-white/15"
              >
                <Youtube className="h-4 w-4" aria-hidden="true" />
                YouTube
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-turmeric-bright)]">
              Shop Our Pantry
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-on-deep-muted)]">
              <li><Link href="/products" className="hover:text-white">All Products (25 SKUs)</Link></li>
              <li><Link href="/categories/cooking-essentials" className="hover:text-white">Cooking Essentials & Masalas</Link></li>
              <li><Link href="/categories/non-veg-masalas" className="hover:text-white">Non-Veg Masalas</Link></li>
              <li><Link href="/categories/traditional-podi" className="hover:text-white">Traditional Idli Podi</Link></li>
              <li><Link href="/categories/millet-and-flours" className="hover:text-white">Millet & Rice Flours</Link></li>
              <li><Link href="/categories/healthy-mixes" className="hover:text-white">Healthy Kanji & Kali Mixes</Link></li>
              <li><Link href="/categories/pickles" className="hover:text-white">Seasonal Pickles (Enquiry)</Link></li>
              <li><Link href="/categories/traditional-herbal-care" className="hover:text-white">Herbal Bath Care (External)</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-turmeric-bright)]">
              Explore & Support
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-on-deep-muted)]">
              <li><Link href="/story" className="hover:text-white">Our Madurai Story</Link></li>
              <li><Link href="/recipes" className="hover:text-white">Kitchen & Serving Ideas</Link></li>
              <li><Link href="/wholesale" className="hover:text-white">Bulk & Wholesale Enquiries</Link></li>
              <li><Link href="/orders/track" className="hover:text-white">Track Your Order</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact & Customer Support</Link></li>
              <li><Link href="/admin" className="hover:text-white">Store Operator Console</Link></li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-turmeric-bright)]">
              Policies & Compliance
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-on-deep-muted)]">
              <li><Link href="/legal/shipping" className="hover:text-white">Shipping & Delivery Policy</Link></li>
              <li><Link href="/legal/returns" className="hover:text-white">Cancellation, Returns & Refunds</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white">Privacy Notice & DPDP Rights</Link></li>
              <li><Link href="/legal/terms" className="hover:text-white">Terms of Use</Link></li>
              <li><Link href="/legal/grievance-and-compliance" className="hover:text-white">FSSAI & Grievance Disclosures</Link></li>
              <li className="pt-1"><PrivacyTrigger /></li>
            </ul>
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-[var(--text-on-deep-muted)]">
              <p className="flex items-center gap-1.5 font-semibold text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-turmeric-bright)]" aria-hidden="true" />
                Printed FSSAI Lic. No.: {BRAND.printedFssaiNumber}
              </p>
              <p className="mt-1">
                Printed on packaging labels; official entity registration, FSSAI FoSCoS verification, GSTIN, and Grievance Officer details are pending pre-launch owner confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[var(--text-on-deep-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.fullName} (Provisional packaging name; social handle {BRAND.social.instagramHandle}).
          </p>
          <p>All product photographs are genuine pouches — zero fabricated labels or unverified claims.</p>
        </div>
      </div>
    </footer>
  );
}
