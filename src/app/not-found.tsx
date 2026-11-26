import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="font-mono-num text-xs font-bold uppercase tracking-widest text-[var(--brand-crimson)]">
        404 — Page Not Found
      </p>
      <h1 className="font-display mt-3 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
        We couldn’t find that spice shelf.
      </h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        The link may have moved or been mistyped. Explore all 25 Madurai Anantha Masala
        products below.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-6 text-sm font-semibold text-white"
        >
          Browse All Products
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-[46px] items-center rounded-xl border border-[var(--border-strong)] px-5 text-sm font-semibold text-[var(--text-primary)]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
