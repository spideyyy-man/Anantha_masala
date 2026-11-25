'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  CatalogCategorySummary,
  CatalogFacets,
  CatalogFilterInput,
  CatalogProduct,
} from '@/domain/catalog/service';
import {
  filterAndSortCatalogProducts,
  matchCategoriesForQuery,
} from '@/domain/catalog/filter';
import { BRAND, buildWhatsAppUrl } from '@/data/brand';
import { ProductCard } from '@/components/cards/ProductCard';
import { InstantSearchSuggestions } from '@/components/catalog/InstantSearchSuggestions';
import { useStore } from '@/components/providers/StoreProviders';

interface CatalogExplorerProps {
  initialProducts: CatalogProduct[];
  allProducts?: CatalogProduct[];
  categories?: CatalogCategorySummary[];
  facets: CatalogFacets;
  initialFilters: CatalogFilterInput;
  heading: string;
  subheading: string;
  basePath?: '/products' | '/search';
}

const SORT_LABELS: Record<NonNullable<CatalogFilterInput['sort']>, string> = {
  relevance: 'Relevance',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  name_asc: 'Name: A to Z',
};

export function ProductGridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: 3 | 4 }) {
  return (
    <div
      data-catalog-loading-skeleton="true"
      aria-busy="true"
      aria-label="Loading products"
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
        columns === 4 ? 'lg:grid-cols-4' : 'xl:grid-cols-3'
      }`}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex h-[518px] flex-col overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs"
        >
          <div className="h-[280px] w-full animate-pulse bg-[#EFE3CF]/75" />
          <div className="flex flex-1 flex-col justify-between p-5">
            <div className="space-y-2.5">
              <div className="h-5 w-4/5 animate-pulse rounded-md bg-[#E8D8C0]" />
              <div className="h-3.5 w-1/2 animate-pulse rounded-md bg-[#EFE3CF]" />
              <div className="mt-3 h-8 w-full animate-pulse rounded-xl bg-[#F4EAD9]" />
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3.5">
              <div className="h-8 w-20 animate-pulse rounded-md bg-[#E8D8C0]" />
              <div className="h-11 w-36 animate-pulse rounded-xl bg-[#E8D8C0]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogExplorer({
  initialProducts,
  allProducts,
  categories = [],
  facets,
  initialFilters,
  heading,
  subheading,
  basePath = '/products',
}: CatalogExplorerProps) {
  const { trackEvent } = useStore();
  const catalogSource = useMemo(
    () => (allProducts && allProducts.length > 0 ? allProducts : initialProducts),
    [allProducts, initialProducts]
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Filter state initialized from SSR URL query params
  const [q, setQ] = useState(initialFilters.q ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categories ?? []
  );
  const [selectedSizes, setSelectedSizes] = useState<number[]>(
    initialFilters.packSizes ?? []
  );
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

  const storageKey = `aanandha_catalog_state_${basePath}`;

  // Restore saved filter/sort state if user navigated back to bare /products without query string
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('loading') === '1') {
      setLoading(true);
      const t = window.setTimeout(() => setLoading(false), 600);
      return () => window.clearTimeout(t);
    }
    const hasExplicitUrlParams = Array.from(sp.keys()).length > 0;
    if (!hasExplicitUrlParams) {
      try {
        const saved = window.sessionStorage.getItem(storageKey);
        if (saved) {
          const restored = new URLSearchParams(saved);
          if (restored.get('q')) setQ(restored.get('q')!);
          if (restored.get('category')) {
            setSelectedCategories(restored.get('category')!.split(',').filter(Boolean));
          }
          if (restored.get('size')) {
            setSelectedSizes(
              restored
                .get('size')!
                .split(',')
                .map(Number)
                .filter((n) => Number.isFinite(n) && n > 0)
            );
          }
          if (restored.get('use')) {
            setSelectedUseCases(restored.get('use')!.split(',').filter(Boolean));
          }
          if (restored.get('maxPrice')) setMaxPriceInr(restored.get('maxPrice')!);
          const av = restored.get('availability');
          if (av === 'in_stock' || av === 'enquiry_only') setAvailability(av);
          const tp = restored.get('type');
          if (tp === 'edible' || tp === 'herbal_care') setProductType(tp);
          const sr = restored.get('sort');
          if (sr === 'price_asc' || sr === 'price_desc' || sr === 'name_asc') setSort(sr);
        }
      } catch {
        // Ignore sessionStorage error
      }
    }
    return undefined;
  }, [storageKey]);

  const matchedCollections = useMemo(
    () => (q.trim() ? matchCategoriesForQuery(categories, q.trim()).slice(0, 4) : []),
    [categories, q]
  );

  // Instantaneous client-side filtering & sorting (Zero RSC reload, Zero layout jump!)
  const products = useMemo(() => {
    const parsedMax =
      maxPriceInr && Number.isFinite(Number(maxPriceInr)) && Number(maxPriceInr) > 0
        ? Number(maxPriceInr)
        : undefined;
    return filterAndSortCatalogProducts(catalogSource, {
      q: q.trim() || undefined,
      categories: selectedCategories.length ? selectedCategories : undefined,
      packSizes: selectedSizes.length ? selectedSizes : undefined,
      useCases: selectedUseCases.length ? selectedUseCases : undefined,
      maxPriceInr: parsedMax,
      availability,
      productType,
      sort,
    });
  }, [
    catalogSource,
    q,
    selectedCategories,
    selectedSizes,
    selectedUseCases,
    maxPriceInr,
    availability,
    productType,
    sort,
  ]);

  // Build shareable URL query string and sync via history.replaceState + sessionStorage without page reload
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
  }, [
    q,
    selectedCategories,
    selectedSizes,
    selectedUseCases,
    maxPriceInr,
    availability,
    productType,
    sort,
  ]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    if (typeof window === 'undefined') return;

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
      // Ignore storage restrictions
    }

    const timer = window.setTimeout(() => {
      trackEvent({
        eventName: q.trim() ? 'search' : 'filter_apply',
        searchQuery: q.trim() || undefined,
        categorySlug: selectedCategories[0],
      });
    }, 240);

    return () => window.clearTimeout(timer);
  }, [queryString, basePath, mounted, storageKey, q, selectedCategories, trackEvent]);

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
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore storage error
    }
  };

  // Build explicit active filter & sort chips (each individually removable)
  const activeChips: { key: string; category: string; label: string; onRemove: () => void }[] = [];
  if (q.trim()) {
    activeChips.push({
      key: 'q',
      category: 'Search',
      label: `"${q.trim()}"`,
      onRemove: () => setQ(''),
    });
  }
  for (const slug of selectedCategories) {
    const c = facets.categories.find((x) => x.slug === slug);
    activeChips.push({
      key: `cat-${slug}`,
      category: 'Collection',
      label: c ? c.name : slug,
      onRemove: () => setSelectedCategories((prev) => prev.filter((x) => x !== slug)),
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
  if (maxPriceInr && Number(maxPriceInr) > 0) {
    activeChips.push({
      key: 'maxP',
      category: 'Price',
      label: `≤ ₹${maxPriceInr}`,
      onRemove: () => setMaxPriceInr(''),
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
  if (productType !== 'all') {
    activeChips.push({
      key: 'type',
      category: 'Type',
      label: productType === 'edible' ? 'Culinary Food Only' : 'External Herbal Care',
      onRemove: () => setProductType('all'),
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

  const appliedFilterCount = activeChips.length;

  const FilterControls = (
    <div className="space-y-6">
      {/* Category checkboxes */}
      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Collection
        </legend>
        <div className="mt-2.5 space-y-2">
          {facets.categories.map((cat) => {
            const checked = selectedCategories.includes(cat.slug);
            return (
              <label
                key={cat.slug}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm transition-colors duration-[180ms] ${
                  checked
                    ? 'bg-[var(--brand-crimson-soft)]/70 font-semibold text-[var(--brand-crimson)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleString(selectedCategories, cat.slug, setSelectedCategories)
                    }
                    className="h-4 w-4 rounded accent-[var(--brand-crimson)]"
                  />
                  <span className="leading-snug">{cat.name}</span>
                </span>
                <span className="font-mono-num text-xs text-[var(--text-muted)]">{cat.count}</span>
              </label>
            );
          })}
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
                className={`font-mono-num inline-flex min-h-[38px] items-center gap-1 rounded-xl border px-3 text-xs font-semibold transition-all duration-[180ms] ${
                  active
                    ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white shadow-xs'
                    : 'border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--brand-crimson)]'
                }`}
              >
                {active && <Check className="h-3 w-3 shrink-0" aria-hidden="true" />}
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
                className={`font-mono-num min-h-[34px] rounded-lg border px-2.5 text-xs font-semibold transition-all duration-[180ms] ${
                  active
                    ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white shadow-xs'
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
        <div className="mt-2.5 space-y-1.5">
          {facets.useCases.map((u) => {
            const checked = selectedUseCases.includes(u.tag);
            return (
              <label
                key={u.tag}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm transition-colors duration-[180ms] ${
                  checked
                    ? 'bg-[var(--brand-crimson-soft)]/70 font-semibold text-[var(--brand-crimson)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleString(selectedUseCases, u.tag, setSelectedUseCases)
                    }
                    className="h-4 w-4 rounded accent-[var(--brand-crimson)]"
                  />
                  <span>{u.tag}</span>
                </span>
                <span className="font-mono-num text-xs text-[var(--text-muted)]">{u.count}</span>
              </label>
            );
          })}
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
            <label
              key={opt.val}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)]"
            >
              <input
                type="radio"
                name="productType"
                checked={productType === opt.val}
                onChange={() => setProductType(opt.val as typeof productType)}
                className="h-4 w-4 accent-[var(--brand-crimson)]"
              />
              <span className={productType === opt.val ? 'font-semibold text-[var(--text-primary)]' : ''}>
                {opt.label}
              </span>
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
            <label
              key={opt.val}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-canvas)]"
            >
              <input
                type="radio"
                name="availability"
                checked={availability === opt.val}
                onChange={() => setAvailability(opt.val as typeof availability)}
                className="h-4 w-4 accent-[var(--brand-crimson)]"
              />
              <span className={availability === opt.val ? 'font-semibold text-[var(--text-primary)]' : ''}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {appliedFilterCount > 0 && (
        <button
          type="button"
          onClick={resetAll}
          data-reset-filters="sidebar"
          className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-crimson)] bg-[var(--brand-crimson-soft)]/50 text-xs font-bold text-[var(--brand-crimson)] transition-colors duration-[180ms] hover:bg-[var(--brand-crimson)] hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset All Filters ({appliedFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Page Header — Editorial Pantry Typography + Instant Category Ribbon */}
      <header className="border-b border-[var(--border-subtle)] pb-6">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--brand-crimson)]">
            Home
          </Link>
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
            className={`snap-rail-item min-h-[38px] rounded-full border px-4 text-xs font-semibold transition-all duration-[180ms] ${
              selectedCategories.length === 0
                ? 'border-[var(--bg-deep)] bg-[var(--bg-deep)] text-[#FBF5EC] shadow-xs'
                : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-crimson)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Collections ({catalogSource.length})
          </button>
          {facets.categories.map((cat) => {
            const active = selectedCategories.includes(cat.slug);
            return (
              <button
                key={cat.slug}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  toggleString(selectedCategories, cat.slug, setSelectedCategories)
                }
                className={`snap-rail-item inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all duration-[180ms] ${
                  active
                    ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-crimson)] hover:text-[var(--text-primary)]'
                }`}
              >
                {active && <Check className="h-3 w-3 shrink-0" aria-hidden="true" />}
                <span>{cat.name}</span>
                <span
                  className={`font-mono-num text-[11px] ${
                    active ? 'text-white/85' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Search + Sort + Mobile Filter Trigger Bar */}
        <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div
            className="relative min-w-0 flex-1"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setSearchFocused(false);
              }
            }}
          >
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setQ(e.target.value);
                setSearchFocused(true);
              }}
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

            {/* Instant Search Suggestions Dropdown (Thumbnails, Names, Prices & Collection Hits) */}
            {searchFocused && (
              <div
                data-inline-instant-suggestions="open"
                className="absolute inset-x-0 top-[calc(100%+6px)] z-30 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 shadow-2xl"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-crimson)]">
                    Instant Search Suggestions
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchFocused(false)}
                    aria-label="Close instant suggestions"
                    className="rounded-lg px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-canvas)] hover:text-[var(--text-primary)]"
                  >
                    Close
                  </button>
                </div>
                <InstantSearchSuggestions
                  query={q}
                  allProducts={catalogSource}
                  categories={categories}
                  maxProducts={6}
                  onSelectQuery={(nextQ) => {
                    setQ(nextQ);
                    setSearchFocused(false);
                  }}
                  onNavigate={() => setSearchFocused(false)}
                />
              </div>
            )}
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-2">
            {/* Mobile / Tablet Filter Drawer button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors duration-[180ms] sm:flex-initial lg:hidden ${
                appliedFilterCount > 0
                  ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson-soft)]/50 text-[var(--brand-crimson)]'
                  : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
              }`}
            >
              <SlidersHorizontal
                className="h-4 w-4 text-[var(--brand-crimson)]"
                aria-hidden="true"
              />
              Filters
              {appliedFilterCount > 0 && (
                <span className="font-mono-num flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-crimson)] px-1.5 text-xs text-white">
                  {appliedFilterCount}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <label
              className={`relative inline-flex min-h-[48px] min-w-0 items-center rounded-xl border px-3 transition-colors duration-[180ms] ${
                sort !== 'relevance'
                  ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson-soft)]/35'
                  : 'border-[var(--border-strong)] bg-[var(--bg-surface)]'
              }`}
            >
              <ArrowUpDown
                className="mr-2 h-4 w-4 shrink-0 text-[var(--brand-crimson)]"
                aria-hidden="true"
              />
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
              <span className="font-mono-num rounded-full bg-[var(--brand-crimson)] px-2.5 py-0.5 text-xs font-bold text-white">
                {appliedFilterCount} active
              </span>
            )}
          </div>
          {FilterControls}
        </aside>

        {/* Product Results Column (Reserved Min-Height Prevents Layout Jumps!) */}
        <div className="min-h-[540px] lg:col-span-9">
          {/* Direct Collection Matches for Active Search Query */}
          {matchedCollections.length > 0 && (
            <div
              data-matching-collections-bar="true"
              className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 shadow-xs"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Matching Collections:
              </span>
              {matchedCollections.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  data-search-collection-link={cat.slug}
                  className="inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-[var(--brand-crimson)]/35 bg-[var(--brand-crimson-soft)]/50 px-3 text-xs font-bold text-[var(--brand-crimson)] transition-colors duration-[180ms] hover:bg-[var(--brand-crimson)] hover:text-white"
                >
                  <span>{cat.name}</span>
                  <span className="font-tamil text-[11px] font-normal opacity-85">
                    ({cat.tamilName})
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Active Filter & Sort Summary Bar */}
          <div
            data-active-filters-bar={appliedFilterCount > 0 ? 'active' : 'idle'}
            className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors duration-[200ms] ${
              appliedFilterCount > 0
                ? 'border-[var(--brand-crimson)]/30 bg-[var(--bg-surface)] shadow-xs'
                : 'border-transparent bg-transparent px-0 py-1'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p
                role="status"
                aria-live="polite"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                {loading
                  ? 'Updating results…'
                  : `Showing ${products.length} of ${catalogSource.length} ${
                      products.length === 1 ? 'product' : 'products'
                    }`}
              </p>
              {appliedFilterCount > 0 && (
                <span className="font-mono-num rounded-full bg-[var(--brand-crimson)] px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {appliedFilterCount} {appliedFilterCount === 1 ? 'filter' : 'filters'} active
                </span>
              )}
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    data-filter-chip={chip.key}
                    aria-label={`Remove ${chip.category} filter: ${chip.label}`}
                    onClick={chip.onRemove}
                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-[var(--brand-crimson)]/35 bg-[var(--brand-crimson-soft)] px-3 text-xs font-semibold text-[var(--brand-crimson)] transition-colors duration-[180ms] hover:bg-[var(--brand-crimson)] hover:text-white"
                  >
                    <span className="opacity-75">{chip.category}:</span>
                    <span className="font-bold">{chip.label}</span>
                    <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetAll}
                  data-reset-filters="bar"
                  className="inline-flex min-h-[32px] items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-3 text-xs font-bold text-[var(--text-primary)] transition-colors duration-[180ms] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <ProductGridSkeleton count={6} columns={3} />
          ) : products.length === 0 ? (
            <div
              data-empty-results="true"
              className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center shadow-xs"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-crimson-soft)] text-[var(--brand-crimson)]">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="font-display mt-4 text-2xl font-bold text-[var(--text-primary)]">
                No exact matches for your current filters
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                We never pad search results with unrelated products. Remove an active filter below,
                reset all filters, or try a Tamil / English kitchen keyword like{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    setQ('Manjal');
                  }}
                  className="font-semibold text-[var(--brand-crimson)] underline"
                >
                  Manjal
                </button>
                ,{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    setQ('Meen');
                  }}
                  className="font-semibold text-[var(--brand-crimson)] underline"
                >
                  Meen
                </button>
                , or{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    setQ('Kollu');
                  }}
                  className="font-semibold text-[var(--brand-crimson)] underline"
                >
                  Kollu
                </button>
                .
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
                  onClick={resetAll}
                  data-reset-filters="empty"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-5 text-sm font-bold text-white shadow-xs transition-colors duration-[180ms] hover:bg-[var(--brand-crimson-hover)]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset All Filters
                </button>
                <a
                  href={buildWhatsAppUrl(
                    `Hello ${BRAND.fullName}, I searched for "${q || 'a product'}" on your website. Do you have it available?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-4 text-sm font-bold text-[var(--brand-leaf)] transition-colors duration-[180ms] hover:bg-[var(--brand-leaf)] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div
              data-product-grid="populated"
              className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3"
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
