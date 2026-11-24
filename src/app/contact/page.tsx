import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { BRAND, buildWhatsAppUrl } from '@/data/brand';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

export const metadata: Metadata = {
  title: 'Contact & Customer Support',
  description:
    'Reach Madurai Aanandha Masala for order assistance, product questions, or bulk enquiries in Villapuram, Madurai.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Contact & Support</span>
      </nav>

      <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Contact Madurai Aanandha Masala
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Have a question about pack weights, current batch availability (including seasonal
            pickles or Chilli Powder pricing), or an existing order? Reach us directly.
          </p>

          <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Address Printed on Packaging</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{BRAND.printedAddressEnglish}</p>
                <p className="font-tamil mt-0.5 text-xs text-[var(--text-muted)]">{BRAND.printedAddressTamil}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Orders & Support Phone</p>
                <a href={`tel:+91${BRAND.phoneRaw}`} className="text-xs font-semibold text-[var(--brand-crimson)] hover:underline">
                  {BRAND.phoneDisplay}
                </a>
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  Official support email & Grievance Officer details: {BRAND.grievanceOfficerStatus}.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={buildWhatsAppUrl(`Hello ${BRAND.fullName}, I need customer support assistance.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[var(--brand-leaf)] px-4 text-xs font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
              <a
                href={BRAND.social.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-3.5 text-xs font-semibold text-[var(--text-primary)]"
              >
                <Instagram className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                Instagram
              </a>
              <a
                href={BRAND.social.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-3.5 text-xs font-semibold text-[var(--text-primary)]"
              >
                <Youtube className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
                YouTube
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <EnquiryForm
            type="contact_support"
            title="Send a Support Message"
            submitLabel="Send Message"
          />
        </div>
      </div>
    </div>
  );
}
