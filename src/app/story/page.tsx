import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck, Phone } from 'lucide-react';
import { BRAND } from '@/data/brand';
import { PouchImage } from '@/components/ui/PouchImage';

export const metadata: Metadata = {
  title: 'Our Story — Who We Are',
  description:
    'Learn about Madurai Aanandha Masala — traditional South Indian masalas, idli podis, heritage rice flours, and kanji mixes from Villapuram, Madurai.',
};

export default function StoryPage() {
  return (
    <div className="pb-16">
      <header className="relative overflow-hidden bg-[#1B0F0A] py-14 text-[#FAF2E6] lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 75% 40%, rgba(161, 26, 30, 0.42) 0%, rgba(212, 155, 26, 0.16) 45%, #1B0F0A 80%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-xs text-[#CDBAA4]">
            <Link href="/" className="hover:text-[#F6CA63]">Home</Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-white">Our Story</span>
          </nav>
          <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#F6CA63]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Villapuram, Madurai • Tamil Nadu
          </p>
          <h1 className="font-display mt-2 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Traditional South Indian Food for Everyday Living.
          </h1>
          <p className="font-tamil mt-2 text-base font-medium text-[#E8B031]">
            {BRAND.tamilName} — பாரம்பரிய சுவை, தினசரி சமையலுக்கு
          </p>
        </div>
      </header>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-12">
        <div className="space-y-5 text-base leading-relaxed text-[var(--text-secondary)] md:col-span-7">
          <p>
            <strong>{BRAND.fullName}</strong> brings Madurai’s everyday spice pantry to households
            who want authentic regional Tamil flavours without guesswork. From everyday{' '}
            <em>Sambar Podi</em> and <em>Sourashtra Rasam Podi</em> to celebratory{' '}
            <em>Bhai Veetu Kari Masala</em> and eight-grain <em>Ulundhu Kali Maavu</em>, our range
            is built around real foods cooked in South Indian homes week after week.
          </p>
          <p>
            We built this online store so families who discover our kitchen through Instagram Reels
            and YouTube can inspect every genuine pouch clearly, compare pack sizes honestly, and
            choose either quick guest checkout or a direct WhatsApp conversation with our Madurai
            team.
          </p>

          <div className="rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Our Commitment to Factual Clarity
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
              <li>
                <strong>No fabricated claims:</strong> We never publish unsupported medical claims,
                invented awards, fake customer ratings, or unverified certification badges.
              </li>
              <li>
                <strong>Honest packaging transparency:</strong> All 25 listed products show genuine
                packaging photographs. Where a pack weight, MRP, or back-label nutrition table is
                still pending operator verification, we state that openly.
              </li>
              <li>
                <strong>Clear naming note:</strong> {BRAND.spellingDiscrepancyNote}
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/60 p-6 text-sm">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-[var(--text-primary)]">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-leaf)]" aria-hidden="true" />
              Printed Packaging Identity
            </h2>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              <strong>Address printed on pouches:</strong> {BRAND.printedAddressEnglish}
            </p>
            <p className="font-tamil mt-1 text-xs text-[var(--text-muted)]">
              {BRAND.printedAddressTamil}
            </p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              <strong>Printed FSSAI Lic. No.:</strong> {BRAND.printedFssaiNumber} (pending FoSCoS
              launch verification)
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Phone className="h-3.5 w-3.5 text-[var(--brand-crimson)]" aria-hidden="true" />
              <span>Orders & Support: {BRAND.phoneDisplay}</span>
            </p>
          </div>
        </div>

        <div className="space-y-5 md:col-span-5">
          <div className="relative flex flex-col items-center overflow-hidden rounded-[32px] border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 text-center shadow-lg">
            <div
              style={{
                background:
                  'radial-gradient(circle at 50% 42%, #FFFDF9 0%, #F4E8D6 64%, #EAD7BC 100%)',
              }}
              className="flex w-full items-center justify-center rounded-2xl p-6"
            >
              <div className="relative h-[300px] w-[240px]">
                <PouchImage
                  src="/images/cutouts/ulundhu-kali-maavu-22-cutout-720.webp"
                  fallbackSrc="/images/products/ulundhu-kali-maavu-22-960.webp"
                  alt="Ulundhu Kali Maavu genuine pouch floating in Madurai studio light"
                  width={720}
                  height={960}
                  priority
                  imgClassName="pouch-float-light"
                />
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[var(--text-secondary)]">
              Real pouch extraction: Ulundhu Kali Maavu displaying its 8 verified traditional Tamil
              grains printed directly on the front label.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href="/products"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--brand-crimson)] px-6 text-sm font-semibold text-white hover:bg-[var(--brand-crimson-hover)]"
            >
              Explore All Products
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/wholesale"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
            >
              Bulk & Wholesale Enquiries
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
