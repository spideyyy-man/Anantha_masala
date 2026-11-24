import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/data/brand';
import { PrivacyPreferencesControl } from '@/components/legal/PrivacyPreferencesControl';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

export const metadata: Metadata = {
  title: 'Privacy Notice & DPDP Data Rights',
  description:
    'Data minimization, purpose limitation, consent management, and data deletion/correction request process aligned with India DPDP Act 2023 & Rules 2025.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Privacy Notice</span>
      </nav>

      <h1 className="font-display mt-4 text-3xl font-bold text-[var(--text-primary)]">
        Privacy Notice & Your Data Rights
      </h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Designed around data minimisation and purpose-specific consent principles under India’s
        Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 (subject to final legal
        entity & Grievance Officer confirmation before commercial launch).
      </p>

      <div className="mt-6">
        <PrivacyPreferencesControl />
      </div>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            1. What Data We Collect & Why
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <strong>Order Fulfilment (Strictly Necessary):</strong> Full name, mobile number,
              optional email, and Indian delivery address — collected strictly to process, ship,
              and provide support for your order.
            </li>
            <li>
              <strong>Payment Security:</strong> Card, UPI, and bank credentials are handled solely
              by our PCI-compliant hosted payment gateway provider; we never store card numbers or CVV.
            </li>
            <li>
              <strong>Optional Storefront Analytics (Consent-Gated):</strong> Disabled by default.
              Only when you explicitly opt in do we record anonymous session events (page views,
              product views, search terms, UTM campaign source) — strictly excluding personal name,
              phone, email, or street address.
            </li>
            <li>
              <strong>WhatsApp & Social Platforms:</strong> Clicking WhatsApp or Instagram/YouTube
              links navigates to those third-party platforms under their respective privacy policies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            2. Retention & Safeguards
          </h2>
          <p className="mt-2">
            Order invoices and audit records are retained as required for tax and statutory
            accounting; enquiry leads and anonymous analytics are purged on a periodic retention
            schedule. Access to customer orders is protected by role-based controls, MFA, and
            immutable admin audit logs.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            3. Request Data Access, Correction or Deletion
          </h2>
          <p className="mt-2 mb-4">
            Submit a privacy rights request below or contact {BRAND.phoneDisplay}. Official
            Data Protection / Grievance Officer designation: <strong>{BRAND.grievanceOfficerStatus}</strong>.
          </p>
          <EnquiryForm
            type="privacy_request"
            title="Submit a DPDP Data Rights Request"
            submitLabel="Submit Privacy Request"
          />
        </section>
      </div>
    </div>
  );
}
