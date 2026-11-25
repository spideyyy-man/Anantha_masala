'use client';

import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  RotateCcw,
  MessageCircle,
  Sparkles,
  Check,
  Package,
} from 'lucide-react';
import type { CatalogFilterInput, CatalogProduct } from '@/domain/catalog/service';
import { filterAndSortCatalogProducts } from '@/domain/catalog/filter';
import { BRAND, buildWhatsAppUrl } from '@/data/brand';
import { ProductCard } from '@/components/cards/ProductCard';

interface CategoryCollectionCatalogProps {
  categorySlug: string;
  categoryName: string;
  initialProducts: CatalogProduct[];
}

const SORT_LABELS: Record<NonNullable<CatalogFilterInput['sort']>, string> = {
  relevance: 'Relevance',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  name_asc: 'Name: A to Z',
};

/**
 * Interactive Filter, Sort & Aligned Product Grid for Individual Collection Pages (`/categories/[slug]`).
 * - Instant client-side filtering & sorting with zero page reloads or vertical layout jumps.
 * - Visually obvious active filter chips with individual removal + one-click Reset Filters.
 * - Preserves filter & sort state in URL query parameters (`history.replaceState`) and `sessionStorage`.
 * - Includes a polished empty-results state without artificial loading delays.
 */
export function CategoryCollectionCatalog({
  categorySlug,
  categoryName,
  initialProducts,
}: CategoryCollectionCatalogProps) {
  const [q, setQ] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'all' | 'in_stock' | 'enquiry_only'>('all');
  const [sort, setSort] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name_asc'>(
    'relevance'
  );
  const storageKey = `aanandha_collection_filters_${categorySlug}`;

  // Derive valid pack sizes and usage tags strictly from this collection's verified products
  const collectionFacets = useMemo(() => {
    const sizeMap = new Map<number, number>();
    const useMap = new Map<string, number>();
    let inStockCount = 0;
    let enquiryCount = 0;

    for (const prod of initialProducts) {
      if (prod.hasInStockVariant) inStockCount++;
      if (!prod.isOrderableOnline) enquiryCount++;

      const seenSizes = new Set<number>();
      for (const v of prod.variants) {
        if (v.netWeightGrams !== null) seenSizes.add(v.netWeightGrams);
      }
      for (const sz of seenSizes) {
        sizeMap.set(sz, (sizeMap.get(sz) ?? 0) + 1);
      }
      for (const tag of prod.usageTags) {
        useMap.set(tag, (useMap.get(tag) ?? 0) + 1);
      }
    }

    return {
      packSizes: Array.from(sizeMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([grams, count]) => ({ grams, label: `${grams}g`, count })),
      useCases: Array.from(useMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([tag, count]) => ({ tag, count })),
      inStockCount,
      enquiryCount,
    };
  }, [initialProducts]);

  // Hydrate initial filters from URL query string or sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const sourceParams =
      Array.from(sp.keys()).length > 0
        ? sp
        : (() => {
            try {
              const saved = window.sessionStorage.getItem(storageKey);
              return saved ? new URLSearchParams(saved) : sp;
            } catch {
              return sp;
            }
          })();

    const restoredQuery = sourceParams.get('q');
    const restoredSizes = sourceParams.get('size')
      ?.split(',')
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);
    const restoredUseCases = sourceParams.get('use')?.split(',').filter(Boolean);
    const restoredAvailability = sourceParams.get('availability');
    const restoredSort = sourceParams.get('sort');

    startTransition(() => {
      if (restoredQuery) setQ(restoredQuery);
      if (restoredSizes?.length) setSelectedSizes(restoredSizes);
      if (restoredUseCases?.length) setSelectedUseCases(restoredUseCases);
      if (restoredAvailability === 'in_stock' || restoredAvailability === 'enquiry_only') {
        setAvailability(restoredAvailability);
      }
      if (restoredSort === 'price_asc' || restoredSort === 'price_desc' || restoredSort === 'name_asc') {
        setSort(restoredSort);
      }
    });
    return undefined;
  }, [storageKey]);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (selectedSizes.length) sp.set('size', selectedSizes.join(','));
    if (selectedUseCases.length) sp.set('use', selectedUseCases.join(','));
    if (availability !== 'all') sp.set('availability', availability);
    if (sort !== 'relevance') sp.set('sort', sort);
    return sp.toString();
  }, [q, selectedSizes, selectedUseCases, availability, sort]);

  const hasHydrated = useRef(false);
  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }
    if (typeof window === 'undefined') return;
    const basePath = `/categories/${categorySlug}`;
    const targetUrl = queryString ? `${basePath}?${queryString}` : basePath;
    if (window.location.pathname === basePath) {
      window.history.replaceState(null, '', targetUrl);
    }
    try {
      if (queryString) {
        window.sessionStorage.setItem(storageKey, queryString);
      } else {
        window.sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore storage error
    }
  }, [queryString, categorySlug, storageKey]);

  const filteredProducts = useMemo(() => {
    return filterAndSortCatalogProducts(initialProducts, {
      q: q.trim() || undefined,
      packSizes: selectedSizes.length ? selectedSizes : undefined,
      useCases: selectedUseCases.length ? selectedUseCases : undefined,
      availability,
      sort,
    });
  }, [initialProducts, q, selectedSizes, selectedUseCases, availability, sort]);

  const toggleSize = (grams: number) => {
    setSelectedSizes((prev) =>
      prev.includes(grams) ? prev.filter((x) => x !== grams) : [...prev, grams]
    );
  };

  const toggleUse = (tag: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setQ('');
    setSelectedSizes([]);
    setSelectedUseCases([]);
    setAvailability('all');
    setSort('relevance');
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore storage error
    }
  };

  // Active chips (individually removable)
  const activeChips: { key: string; category: string; label: string; onRemove: () => void }[] = [];
  if (q.trim()) {
    activeChips.push({
      key: 'q',
      category: 'Search',
      label: `"${q.trim()}"`,
      onRemove: () => setQ(''),
    });
  }
  for (const sz of selectedSizes) {
    activeChips.push({
      key: `sz-${sz}`,
      category: 'Size',
      label: `${sz}g Pack`,
      onRemove: () => setSelectedSizes((prev) => prev.filter((x) => x !== sz)),
    });
  }
  for (const use of selectedUseCases) {
    activeChips.push({
      key: `use-${use}`,
      category: 'Use',
      label: use,
      onRemove: () => setSelectedUseCases((prev) => prev.filter((x) => x !== use)),
    });
  }
  if (availability !== 'all') {
    activeChips.push({
      key: 'avail',
      category: 'Stock',
      label: availability === 'in_stock' ? 'In Stock Only' : 'Enquiry Only',
      onRemove: () => setAvailability('all'),
    });
  }
  if (sort !== 'relevance') {
    activeChips.push({
      key: 'sort',
      category: 'Sort',
      label: SORT_LABELS[sort],
      onRemove: () => setSort('relevance'),
    });
  }

  return (
    <section aria-label={`${categoryName} products`} className="min-h-[480px]">
      {/* Collection Filter & Sort Control Bar */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search within Collection */}
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search within ${categoryName} (Tamil or English)…`}
              aria-label={`Search within ${categoryName}`}
              className="h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] pl-10 pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-crimson)] focus:bg-[var(--bg-surface)] focus:outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Clear collection search"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-surface-muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Inline Pack Size, Availability & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Pack Size Pills */}
            {collectionFacets.packSizes.map((sz) => {
              const active = selectedSizes.includes(sz.grams);
              return (
                <button
                  key={sz.grams}
                  type="button"
                  aria-pressed={active}
                  data-collection-size-filter={sz.grams}
                  onClick={() => toggleSize(sz.grams)}
                  className={`font-mono-num inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all duration-[180ms] ${
                    active
                      ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white shadow-xs'
                      : 'border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--brand-crimson)]'
                  }`}
                >
                  {active ? (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <Package className="h-3.5 w-3.5 shrink-0 text-[var(--brand-crimson)]" aria-hidden="true" />
                  )}
                  {sz.label} ({sz.count})
                </button>
              );
            })}

            {/* In Stock Filter Pill (when collection has mix of stock/enquiry) */}
            {collectionFacets.inStockCount > 0 && collectionFacets.enquiryCount > 0 && (
              <button
                type="button"
                aria-pressed={availability === 'in_stock'}
                onClick={() =>
                  setAvailability((curr) => (curr === 'in_stock' ? 'all' : 'in_stock'))
                }
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all duration-[180ms] ${
                  availability === 'in_stock'
                    ? 'border-[var(--brand-leaf)] bg-[var(--brand-leaf)] text-white shadow-xs'
                    : 'border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--brand-leaf)]'
                }`}
              >
                {availability === 'in_stock' && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                In Stock Only ({collectionFacets.inStockCount})
              </button>
            )}

            {/* Sort Selector */}
            <label
              className={`relative inline-flex h-10 items-center rounded-xl border px-3 transition-colors duration-[180ms] ${
                sort !== 'relevance'
                  ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson-soft)]/40'
                  : 'border-[var(--border-strong)] bg-[var(--bg-canvas)]'
              }`}
            >
              <ArrowUpDown
                className="mr-1.5 h-3.5 w-3.5 shrink-0 text-[var(--brand-crimson)]"
                aria-hidden="true"
              />
              <span className="sr-only">Sort collection products</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label="Sort collection products"
                className="bg-transparent pr-1 text-xs font-bold text-[var(--text-primary)] focus:outline-none"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>

        {/* Kitchen Use Quick Tags */}
        {collectionFacets.useCases.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--border-subtle)] pt-3">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Kitchen Use:
            </span>
            {collectionFacets.useCases.map((u) => {
              const active = selectedUseCases.includes(u.tag);
              return (
                <button
                  key={u.tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleUse(u.tag)}
                  className={`inline-flex min-h-[28px] items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-all duration-[180ms] ${
                    active
                      ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--brand-crimson)]'
                  }`}
                >
                  {active && <Check className="h-3 w-3" aria-hidden="true" />}
                  {u.tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Visually Obvious Active Filter Chips & Result Count Bar */}
      <div
        data-collection-active-filters={activeChips.length > 0 ? 'active' : 'idle'}
        className="my-5 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p
            role="status"
            aria-live="polite"
            className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
          >
            Showing {filteredProducts.length} of {initialProducts.length} verified{' '}
            {initialProducts.length === 1 ? 'product' : 'products'}
          </p>
          {activeChips.length > 0 && (
            <span className="font-mono-num rounded-full bg-[var(--brand-crimson)] px-2.5 py-0.5 text-[11px] font-bold text-white">
              {activeChips.length} active
            </span>
          )}
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                data-collection-chip={chip.key}
                aria-label={`Remove ${chip.category} filter: ${chip.label}`}
                onClick={chip.onRemove}
                className="inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-[var(--brand-crimson)]/35 bg-[var(--brand-crimson-soft)] px-3 text-xs font-semibold text-[var(--brand-crimson)] transition-colors duration-[180ms] hover:bg-[var(--brand-crimson)] hover:text-white"
              >
                <span className="opacity-75">{chip.category}:</span>
                <span className="font-bold">{chip.label}</span>
                <X className="h-3 w-3 shrink-0" aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              data-collection-reset="bar"
              className="inline-flex min-h-[30px] items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs font-bold text-[var(--text-primary)] transition-colors duration-[180ms] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Grid / Polished Empty State */}
      {filteredProducts.length === 0 ? (
        <div
          data-collection-empty="true"
          className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center shadow-xs"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-crimson-soft)] text-[var(--brand-crimson)]">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="font-display mt-3.5 text-2xl font-bold text-[var(--text-primary)]">
            No {categoryName} packs match those filters
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            Try removing one of your active filters below or reset all filters to view all{' '}
            {initialProducts.length} verified products in {categoryName}.
          </p>

          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {activeChips.map((chip) => (
                <button
                  key={`empty-${chip.key}`}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex min-h-[30px] items-center gap-1 rounded-full border border-[var(--brand-crimson)]/35 bg-[var(--brand-crimson-soft)] px-3 text-xs font-semibold text-[var(--brand-crimson)] hover:bg-[var(--brand-crimson)] hover:text-white"
                >
                  <span>
                    {chip.category}: {chip.label}
                  </span>
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              data-collection-reset="empty"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-bold text-white shadow-xs transition-colors duration-[180ms] hover:bg-[var(--brand-crimson-hover)]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset Filters (Show All {initialProducts.length})
            </button>
            <a
              href={buildWhatsAppUrl(
                `Hello ${BRAND.fullName}, I am browsing your ${categoryName} collection and looking for "${q || 'a specific pack'}".`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-4 text-sm font-bold text-[var(--brand-leaf)] transition-colors duration-[180ms] hover:bg-[var(--brand-leaf)] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div
          data-collection-grid="populated"
          className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priorityImage={index < 4}
            />
          ))}
        </div>
      )}
    </section>
  );
}
