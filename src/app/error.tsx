'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-crimson)]">
        Temporary Interruption
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold text-[var(--text-primary)]">
        Something went wrong loading this page.
      </h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        Your shopping bag is preserved safely. Try reloading or return to the catalogue.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-semibold text-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
        <Link
          href="/products"
          className="inline-flex min-h-[46px] items-center rounded-xl border border-[var(--border-strong)] px-5 text-sm font-semibold text-[var(--text-primary)]"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
