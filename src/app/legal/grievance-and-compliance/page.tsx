import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { BRAND } from '@/data/brand';

export const metadata: Metadata = {
  title: 'FSSAI, Legal Identity & Grievance Disclosures',
  description:
    'India food e-commerce compliance transparency: printed FSSAI details, Consumer Protection (E-Commerce) Rules disclosures, and pending pre-launch verifications.',
};

export default function GrievanceCompliancePage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">FSSAI & Grievance Disclosures</span>
      </nav>

      <h1 className="font-display mt-4 text-3xl font-bold text-[var(--text-primary)]">
        FSSAI, Legal Identity & Grievance Officer Disclosures
      </h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        In line with Indian Consumer Protection (E-Commerce) Rules and FSSAI Labelling & Display
        transparency principles, this page separates verified packaging facts from items pending
        final pre-launch owner verification.
      </p>

      <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-xs leading-relaxed text-amber-950">
        <p className="flex items-center gap-2 text-sm font-bold">
          <AlertTriangle className="h-4 w-4 text-amber-700" aria-hidden="true" />
          Pre-Launch Compliance Blockers Transparently Tracked
        </p>
        <p className="mt-1.5">
          No legal entity name, GSTIN, or Grievance Officer identity has been invented. The fields
          marked “Pending business verification” below must be populated with verified official
          records before accepting live commercial payments.
        </p>
      </div>

      <dl className="mt-6 divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm">
        {[
          ['Provisional Trading Name (Packaging)', BRAND.fullName],
          ['Social Channel Name & Discrepancy Note', BRAND.spellingDiscrepancyNote],
          ['Registered Legal Entity Name', BRAND.legalEntityStatus],
          ['Printed FSSAI License Number (on Pouches)', `${BRAND.printedFssaiNumber} — pending FoSCoS active-status & category verification`],
          ['GSTIN', BRAND.gstinStatus],
          ['Printed Packaging Address', `${BRAND.printedAddressEnglish} (${BRAND.printedAddressTamil})`],
          ['Customer Care Phone / WhatsApp', BRAND.phoneDisplay],
          ['Customer Care & Grievance Email', BRAND.supportEmailPlaceholder],
          ['Grievance Officer (E-Commerce Rules & DPDP)', BRAND.grievanceOfficerStatus],
        ].map(([label, val]) => (
          <div key={label} className="grid grid-cols-1 gap-1 p-4 sm:grid-cols-12 sm:gap-4">
            <dt className="font-semibold text-[var(--text-primary)] sm:col-span-4">{label}</dt>
            <dd className="text-[var(--text-secondary)] sm:col-span-8">{val}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/60 p-4 text-xs text-[var(--text-secondary)]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-leaf)]" aria-hidden="true" />
        <p>
          <strong>Packaging Audit Safeguards Applied:</strong> Unverified disease/medical claims
          observed on physical Millet Dosa Flour pouches and unverified “100% Natural / No
          Preservatives” badges are deliberately excluded from website copy. Non-edible herbal bath
          powder (Kuliyal Podi / Nalangu Maavu) is explicitly separated from food products.
        </p>
      </div>
    </article>
  );
}
