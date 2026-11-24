'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  CatalogFacets,
  CatalogFilterInput,
  CatalogProduct,
} from '@/domain/catalog/service';
import { BRAND, buildWhatsAppUrl } from '@/data/brand';
import { ProductCard } from '@/components/cards/ProductCard';
import { useStore } from '@/components/providers/StoreProviders';

interface CatalogExplorerProps {
  initialProducts: CatalogProduct[];
  facets: CatalogFacets;
  initialFilters: CatalogFilterInput;
  heading: string;
  subheading: string;
  basePath?: '/products' | '/search';
}

export function CatalogExplorer({
  initialProducts,
  facets,
  initialFilters,
  heading,
  subheading,
  basePath = '/products',
}: CatalogExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { trackEvent } = useStore();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter state initialized from SSR URL query params
  const [q, setQ] = useState(initialFilters.q ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categories ?? []
  );
  const [selectedSizes, setSelectedSizes] = useState<number[]>(initialFilters.packSizes ?? []);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>(
    initialFilters.useCases ?? []
  );
  const [maxPriceInr, setMaxPriceInr] = useState<string>(
    initialFilters.maxPriceInr !== undefined ? String(initialFilters.maxPriceInr) : ''
  );
  const [availability, setAvailability] = useState<'all' | 'in_stock' | 'enquiry_only'>(
    initialFilters.availability ?? 'all'
  );
  const [productType, setProductType] = useState<'all' | 'edible' | 'herbal_care'>(
    initialFilters.productType ?? 'all'
  );
  const [sort, setSort] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name_asc'>(
    initialFilters.sort ?? 'relevance'
  );

  // Build URL query string for both shareable browser URL and /api/catalog request
  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (selectedCategories.length) sp.set('category', selectedCategories.join(','));
    if (selectedSizes.length) sp.set('size', selectedSizes.join(','));
    if (selectedUseCases.length) sp.set('use', selectedUseCases.join(','));
    if (maxPriceInr && Number(maxPriceInr) > 0) sp.set('maxPrice', maxPriceInr);
    if (availability !== 'all') sp.set('availability', availability);
    if (productType !== 'all') sp.set('type', productType);
    if (sort !== 'relevance') sp.set('sort', sort);
    return sp.toString();
  }, [q, selectedCategories, selectedSizes, selectedUseCases, maxPriceInr, availability, productType, sort]);

  // Sync URL and fetch filtered results from server API when filters change
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const targetUrl = queryString ? `${basePath}?${queryString}` : basePath;
      startTransition(() => {
        if (pathname === basePath) {
          router.replace(targetUrl, { scroll: false });
        }
      });

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/catalog${queryString ? `?${queryString}` : ''}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Could not update results');
        const data = (await res.json()) as { products: CatalogProduct[] };
        setProducts(data.products);
        trackEvent({
          eventName: q.trim() ? 'search' : 'filter_apply',
          searchQuery: q.trim() || undefined,
          categorySlug: selectedCategories[0],
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Network error while updating catalogue filters. Please retry.');
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryString]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close mobile filter drawer on Escape
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileFiltersOpen]);

  const toggleString = (list: string[], val: string, setter: (v: string[]) => void) => {
    setter(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };
  const toggleNum = (list: number[], val: number, setter: (v: number[]) => void) => {
    setter(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const resetAll = () => {
    setQ('');
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedUseCases([]);
    setMaxPriceInr('');
    setAvailability('all');
    setProductType('all');
    setSort('relevance');
  };

  // Active filter chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (q.trim()) {
    activeChips.push({ key: 'q', label: `Search: "${q.trim()}"`, onRemove: () => setQ('') });
  }
  for (const slug of selectedCategories) {
    const c = facets.categories.find((x) => x.slug === slug);
    activeChips.push({
      key: `cat-${slug}`,
      label: c ? c.name : slug,
      onRemove: () => setSelectedCategories((prev) => prev.filter((x) => x !== slug)),
    });
  }
  for (const sz of selectedSizes) {
    activeChips.push({
      key: `sz-${sz}`,
      label: `${sz}g Pack`,
      onRemove: () => setSelectedSizes((prev) => prev.filter((x) => x !== sz)),
    });
  }
  for (const use of selectedUseCases) {
    activeChips.push({
      key: `use-${use}`,
      label: use,
      onRemove: () => setSelectedUseCases((prev) => prev.filter((x) => x !== use)),
    });
  }
  if (maxPriceInr && Number(maxPriceInr) > 0) {
    activeChips.push({
      key: 'maxP',
      label: `Up to ₹${maxPriceInr}`,
      onRemove: () => setMaxPriceInr(''),
    });
  }
  if (availability !== 'all') {
    activeChips.push({
      key: 'avail',
      label: availability === 'in_stock' ? 'In Stock Only' : 'WhatsApp Enquiry Only',
      onRemove: () => setAvailability('all'),
    });
  }
  if (productType !== 'all') {
    activeChips.push({
      key: 'type',
      label: productType === 'edible' ? 'Culinary Food Only' : 'External Herbal Care',
      onRemove: () => setProductType('all'),
    });
  }

  const appliedFilterCount = activeChips.length;

  const FilterControls = (
    <div className="space-y-6">
      {/* Category checkboxes */}
      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Category
        </legend>
        <div className="mt-2.5 space-y-2">
          {facets.categories.map((cat) => (
            <label
              key={cat.slug}
              className="flex cursor-pointer items-center justify-between gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleString(selectedCategories, cat.slug, setSelectedCategories)}
                  className="h-4 w-4 rounded accent-[var(--brand-crimson)]"
                />
                <span className="leading-snug">{cat.name}</span>
              </span>
              <span className="font-mono-num text-xs text-[var(--text-muted)]">{cat.count}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Pack Size */}
      <fieldset className="border-t border-[var(--border-subtle)] pt-5">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Pack Size (Net Weight)
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {facets.packSizes.map((sz) => {
            const active = selectedSizes.includes(sz.grams);
            return (
              <button
                key={sz.grams}
                type="button"
                aria-pressed={active}
                onClick={() => toggleNum(selectedSizes, sz.grams, setSelectedSizes)}
                className={`font-mono-num min-h-[38px] rounded-xl border px-3 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white'
                    : 'border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--brand-crimson)]'
                }`}
              >
                {sz.label} ({sz.count})
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Max Price */}
      <fieldset className="border-t border-[var(--border-subtle)] pt-5">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Price Ceiling (INR)
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[80, 120, 150, 200, 350].map((cap) => {
            const active = maxPriceInr === String(cap);
            return (
              <button
                key={cap}
                type="button"
                aria-pressed={active}
                onClick={() => setMaxPriceInr(active ? '' : String(cap))}
                className={`font-mono-num min-h-[34px] rounded-lg border px-2.5 text-xs font-semibold ${
                  active
                    ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson-soft)] text-[var(--brand-crimson)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                }`}
              >
                ≤ ₹{cap}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Kitchen Use-Case */}
      <fieldset className="border-t border-[var(--border-subtle)] pt-5">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Kitchen Use
        </legend>
        <div className="mt-2.5 space-y-2">
          {facets.useCases.map((u) => (
            <label
              key={u.tag}
              className="flex cursor-pointer items-center justify-between gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedUseCases.includes(u.tag)}
                  onChange={() => toggleString(selectedUseCases, u.tag, setSelectedUseCases)}
                  className="h-4 w-4 rounded accent-[var(--brand-crimson)]"
                />
                <span>{u.tag}</span>
              </span>
              <span className="font-mono-num text-xs text-[var(--text-muted)]">{u.count}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Product Type & Availability */}
      <fieldset className="border-t border-[var(--border-subtle)] pt-5">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Product Type
        </legend>
        <div className="mt-2.5 space-y-1.5 text-sm">
          {[
            { val: 'all', label: 'All Products' },
            { val: 'edible', label: 'Culinary Food Only' },
            { val: 'herbal_care', label: 'External Herbal Bath Care' },
          ].map((opt) => (
            <label key={opt.val} className="flex cursor-pointer items-center gap-2.5 text-[var(--text-secondary)]">
              <input
                type="radio"
                name="productType"
                checked={productType === opt.val}
                onChange={() => setProductType(opt.val as typeof productType)}
                className="h-4 w-4 accent-[var(--brand-crimson)]"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-[var(--border-subtle)] pt-5">
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Availability
        </legend>
        <div className="mt-2.5 space-y-1.5 text-sm">
          {[
            { val: 'all', label: 'All Listed Items' },
            { val: 'in_stock', label: 'Orderable Online Now' },
            { val: 'enquiry_only', label: 'Price Pending / Enquiry Only' },
          ].map((opt) => (
            <label key={opt.val} className="flex cursor-pointer items-center gap-2.5 text-[var(--text-secondary)]">
              <input
                type="radio"
                name="availability"
                checked={availability === opt.val}
                onChange={() => setAvailability(opt.val as typeof availability)}
                className="h-4 w-4 accent-[var(--brand-crimson)]"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {appliedFilterCount > 0 && (
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Page Header — Editorial Pantry Typography + Instant Category Ribbon */}
      <header className="border-b border-[var(--border-subtle)] pb-6">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--brand-crimson)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-[var(--text-primary)]">{heading}</span>
        </nav>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="animate-heading-reveal font-display text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl">
              {heading}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
              {subheading}
            </p>
          </div>
          <p className="hidden text-xs font-medium text-[var(--text-muted)] lg:block">
            Hover any pouch to inspect verified shelf life
          </p>
        </div>

        {/* 1-Click Collection Quick-Filter Ribbon */}
        <div
          aria-label="Quick collection filter"
          className="snap-rail -mx-4 mt-5 gap-2 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <button
            type="button"
            onClick={() => setSelectedCategories([])}
            aria-pressed={selectedCategories.length === 0}
            className={`snap-rail-item min-h-[38px] rounded-full border px-4 text-xs font-semibold transition-colors ${
              selectedCategories.length === 0
                ? 'border-[var(--bg-deep)] bg-[var(--bg-deep)] text-[#FBF5EC]'
                : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-crimson)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Collections
          </button>
          {facets.categories.map((cat) => {
            const active = selectedCategories.includes(cat.slug);
            return (
              <button
                key={cat.slug}
                type="button"
                aria-pressed={active}
                onClick={() => toggleString(selectedCategories, cat.slug, setSelectedCategories)}
                className={`snap-rail-item inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-crimson)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`font-mono-num text-[11px] ${active ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Search + Sort + Mobile Filter Trigger Bar */}
        <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Tamil or English: Manjal, Fish Masala, கொள்ளு, Garlic Podi, Kavuni..."
              aria-label="Search product catalogue"
              className="h-12 w-full min-w-0 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-10 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-crimson)] focus:outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-surface-muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-2">
            {/* Mobile / Tablet Filter Drawer button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 text-sm font-semibold text-[var(--text-primary)] sm:flex-initial lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 text-[var(--brand-crimson)]" aria-hidden="true" />
              Filters
              {appliedFilterCount > 0 && (
                <span className="font-mono-num flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-crimson)] px-1.5 text-xs text-white">
                  {appliedFilterCount}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <label className="relative inline-flex min-h-[48px] min-w-0 items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3">
              <ArrowUpDown className="mr-2 h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label="Sort products"
                className="min-w-0 max-w-full bg-transparent pr-2 text-sm font-semibold text-[var(--text-primary)] focus:outline-none"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      {/* Main Split Grid: Desktop Sidebar + Results */}
      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Desktop Persistent Filter Sidebar */}
        <aside
          aria-label="Product filters"
          className="hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs lg:sticky lg:top-24 lg:col-span-3 lg:block lg:self-start"
        >
          <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Filter Pantry
            </h2>
            {appliedFilterCount > 0 && (
              <span className="font-mono-num rounded-full bg-[var(--brand-crimson-soft)] px-2 py-0.5 text-xs font-bold text-[var(--brand-crimson)]">
                {appliedFilterCount} active
              </span>
            )}
          </div>
          {FilterControls}
        </aside>

        {/* Product Results Column */}
        <div className="lg:col-span-9">
          {/* Active Filter Chips + Screen-Reader Live Count */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-medium text-[var(--text-secondary)]"
            >
              {loading || isPending
                ? 'Updating results...'
                : `Showing ${products.length} ${products.length === 1 ? 'product' : 'products'}`}
            </p>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-full bg-[var(--brand-crimson-soft)] px-3 text-xs font-semibold text-[var(--brand-crimson)] hover:bg-[var(--brand-crimson)] hover:text-white"
                  >
                    <span>{chip.label}</span>
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-2 text-xs font-semibold text-[var(--text-muted)] underline hover:text-[var(--text-primary)]"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
            >
              {error}
            </div>
          )}

          {products.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center">
              <p className="font-display text-xl font-bold text-[var(--text-primary)]">
                No exact matches for those filters
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                We don’t show irrelevant filler products when a search doesn’t match. Try clearing a
                filter, searching by Tamil name (e.g. <em>Manjal</em>, <em>Kollu</em>,{' '}
                <em>Kavuni</em>), or ask us on WhatsApp if you’re looking for a seasonal pickle or custom pack.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-semibold text-white"
                >
                  Show All 25 Products
                </button>
                <a
                  href={buildWhatsAppUrl(
                    `Hello ${BRAND.fullName}, I searched for "${q || 'a product'}" on your website. Do you have it available?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-4 text-sm font-semibold text-[var(--brand-leaf)]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-6 transition-opacity duration-150 sm:grid-cols-2 xl:grid-cols-3 ${
                loading ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priorityImage={index < 6}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accessible Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="fixed inset-0 z-50 flex items-end lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex max-h-[86vh] w-full flex-col rounded-t-3xl bg-[var(--bg-surface)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Filters {appliedFilterCount > 0 ? `(${appliedFilterCount})` : ''}
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--bg-surface-muted)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{FilterControls}</div>
              <div className="flex gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-5 py-4">
                <button
                  type="button"
                  onClick={resetAll}
                  className="min-h-[46px] flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-primary)]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="min-h-[46px] flex-[2] rounded-xl bg-[var(--brand-crimson)] text-sm font-semibold text-white"
                >
                  Show {products.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
