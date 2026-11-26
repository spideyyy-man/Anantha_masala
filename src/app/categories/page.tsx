import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories } from '@/domain/catalog/service';
import { CategoryCard } from '@/components/cards/CategoryCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Categories — Madurai Masalas, Podis, Flours & Mixes',
  description:
    'Browse Madurai Anantha Masala collections: Cooking Essentials, Non-Veg Masalas, Traditional Idli Podi, Millet & Flours, Healthy Mixes, Seasonal Pickles, and Traditional Herbal Bath Care.',
};

export default async function CategoriesOverviewPage() {
  const categories = await getAllCategories();
  const culinary = categories.filter((c) => c.isEdibleCategory);
  const nonEdible = categories.filter((c) => !c.isEdibleCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[var(--text-primary)]">Categories</span>
      </nav>

      <header className="mt-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-crimson)]">
          Madurai Culinary Pantry
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          Browse by Collection
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Each collection connects directly to our single canonical SKU catalogue. Some versatile
          blends appear across multiple relevant categories without duplicating product records.
        </p>
      </header>

      <section aria-label="Culinary Food Categories" className="mt-8">
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
          Culinary & Food Collections
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {culinary.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {nonEdible.length > 0 && (
        <section aria-label="Traditional Herbal Care (Non-Edible)" className="mt-12 border-t border-[var(--border-subtle)] pt-10">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              Traditional Herbal Bath Care
            </h2>
            <span className="rounded-full bg-amber-900 px-2.5 py-0.5 text-xs font-semibold text-amber-50">
              For External Use Only — Non-Edible
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">
            Kept explicitly separate from culinary food items for customer safety and clarity.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nonEdible.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
