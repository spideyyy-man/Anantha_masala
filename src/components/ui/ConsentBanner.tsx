'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProviders';

export function ConsentBanner() {
  const { consent, saveConsent } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false); // Never pre-ticked (DPDP Act 2023)

  if (consent.decided) return null;

  return (
    <aside
      aria-label="Privacy and cookie preferences"
      className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-2xl rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 shadow-2xl md:bottom-5 md:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)]">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Your privacy choices (DPDP-aligned)
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
            We use strictly necessary cookies to keep your shopping bag and guest checkout secure.
            Optional anonymous storefront analytics stay <strong>off</strong> unless you choose to enable them.
            We never send your name, phone, or address to analytics.{' '}
            <Link href="/legal/privacy" className="font-medium text-[var(--brand-crimson)] underline">
              Privacy Notice
            </Link>
          </p>

          {expanded && (
            <div className="mt-3 space-y-2 rounded-xl bg-[var(--bg-surface-muted)] p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">Strictly Necessary</span>
                  <p className="text-[var(--text-muted)]">Cart persistence, CSRF security, and checkout integrity.</p>
                </div>
                <span className="rounded-full bg-[var(--brand-leaf-soft)] px-2.5 py-0.5 font-medium text-[var(--brand-leaf)]">
                  Always on
                </span>
              </div>
              <label className="flex cursor-pointer items-start justify-between gap-3 border-t border-[var(--border-subtle)] pt-2">
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">Anonymous Storefront Analytics</span>
                  <p className="text-[var(--text-muted)]">
                    Helps improve search results and Instagram/YouTube campaign links without collecting PII.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsOptIn}
                  onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--brand-crimson)]"
                />
              </label>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void saveConsent(false, false)}
              className="min-h-[40px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
            >
              Necessary Only
            </button>
            {expanded ? (
              <button
                type="button"
                onClick={() => void saveConsent(analyticsOptIn, false)}
                className="min-h-[40px] rounded-lg bg-[var(--brand-crimson)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-crimson-hover)]"
              >
                Save Choices
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void saveConsent(true, false)}
                  className="min-h-[40px] rounded-lg bg-[var(--brand-crimson)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-crimson-hover)]"
                >
                  Allow Anonymous Analytics
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-muted)]"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Customize
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
