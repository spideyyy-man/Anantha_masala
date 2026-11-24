'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProviders';

export function PrivacyTrigger() {
  const { reopenConsent } = useStore();
  return (
    <button
      type="button"
      onClick={reopenConsent}
      className="inline-flex items-center gap-1.5 text-left text-sm text-[var(--text-on-deep-muted)] underline-offset-4 hover:text-white hover:underline"
    >
      <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--brand-turmeric-bright)]" aria-hidden="true" />
      Manage Cookie & DPDP Choices
    </button>
  );
}
