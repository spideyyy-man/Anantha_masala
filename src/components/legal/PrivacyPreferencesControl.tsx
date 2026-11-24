'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProviders';

export function PrivacyPreferencesControl() {
  const { consent, saveConsent } = useStore();
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (analyticsAccepted: boolean) => {
    await saveConsent(analyticsAccepted, false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[var(--brand-leaf)]" aria-hidden="true" />
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
          Manage Your Consent Preferences
        </h2>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
        Current status:{' '}
        <strong>
          {consent.analyticsAccepted
            ? 'Strictly Necessary + Optional Anonymous Analytics Enabled'
            : 'Strictly Necessary Only (Optional Analytics Off)'}
        </strong>
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => void handleSave(false)}
          className="min-h-[42px] rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--brand-crimson)]"
        >
          Keep Strictly Necessary Only (Withdraw Analytics)
        </button>
        <button
          type="button"
          onClick={() => void handleSave(true)}
          className="min-h-[42px] rounded-xl bg-[var(--brand-crimson)] px-4 text-xs font-semibold text-white hover:bg-[var(--brand-crimson-hover)]"
        >
          Enable Anonymous Storefront Analytics
        </button>
      </div>
      {savedNotice && (
        <p role="status" className="mt-3 text-xs font-semibold text-[var(--brand-leaf)]">
          Your DPDP consent preference has been updated and recorded.
        </p>
      )}
    </div>
  );
}
