'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  MessageCircle,
  Sparkles,
  Search,
} from 'lucide-react';
import type {
  CatalogCategorySummary,
  CatalogProduct,
} from '@/domain/catalog/service';
import {
  filterAndSortCatalogProducts,
  matchCategoriesForQuery,
} from '@/domain/catalog/filter';
import { BRAND, buildWhatsAppUrl, formatPaiseToInr } from '@/data/brand';
import { getCategoryTheme, getCutoutUrlFromThumb } from '@/lib/media';
import { PouchImage } from '@/components/ui/PouchImage';

export const POPULAR_SEARCH_TERMS: { label: string; query: string; tamil: string }[] = [
  { label: 'Manjal Podi (Turmeric)', query: 'Manjal Podi', tamil: 'மஞ்சள் பொடி' },
  { label: 'Bhai Veetu Meen Masala', query: 'Meen Masala', tamil: 'மீன் மசாலா' },
  { label: 'Idli Milagai Podi', query: 'Idli Podi', tamil: 'இட்லி பொடி' },
  { label: 'Ulundhu Kali Maavu', query: 'Ulundhu Kali', tamil: 'உளுந்து களி' },
  { label: 'Karuppu Kavuni Kanji', query: 'Karuppu Kavuni', tamil: 'கருப்பு கவுனி' },
  { label: 'Madurai Sambar Podi', query: 'Sambar Podi', tamil: 'சாம்பார் பொடி' },
];

interface InstantSearchSuggestionsProps {
  query: string;
  allProducts: CatalogProduct[];
  categories: CatalogCategorySummary[];
  onSelectQuery?: (q: string) => void;
  onNavigate?: () => void;
  maxProducts?: number;
}

/**
 * Instant Search Suggestions Panel showing:
 * - Matching Collections (direct navigation to `/categories/[slug]`)
 * - Matching Products with studio pouch thumbnail, English & Tamil name, pack weight, and verified price
 * - Popular Madurai Searches & Quick Collections when query is empty
 * - Helpful empty-results state with 1-click spelling/topic suggestions & WhatsApp enquiry when 0 matches
 */
export function InstantSearchSuggestions({
  query,
  allProducts,
  categories,
  onSelectQuery,
  onNavigate,
  maxProducts = 6,
}: InstantSearchSuggestionsProps) {
  const trimmed = query.trim();

  const matchedProducts = useMemo(() => {
    if (!trimmed) return [];
    return filterAndSortCatalogProducts(allProducts, {
      q: trimmed,
      sort: 'relevance',
    });
  }, [allProducts, trimmed]);

  const matchedCategories = useMemo(() => {
    if (!trimmed) return [];
    return matchCategoriesForQuery(categories, trimmed).slice(0, 3);
  }, [categories, trimmed]);

  const visibleProducts = matchedProducts.slice(0, maxProducts);

  // Empty query state: Popular searches + Featured collections
  if (!trimmed) {
    return (
      <div
        data-instant-search-panel="popular"
        className="space-y-4 pt-2 text-left"
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Popular Madurai Pantry Searches
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {POPULAR_SEARCH_TERMS.map((item) => (
              <button
                key={item.query}
                type="button"
                data-popular-search-pill={item.query}
                onClick={() => onSelectQuery?.(item.query)}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-[var(--border-strong)]/80 bg-[var(--bg-canvas)] px-3 text-xs font-semibold text-[var(--text-primary)] transition-colors duration-[180ms] hover:border-[var(--brand-crimson)] hover:bg-[var(--brand-crimson-soft)] hover:text-[var(--brand-crimson)]"
              >
                <Search className="h-3 w-3 text-[var(--brand-crimson)]" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="border-t border-[var(--border-subtle)] pt-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Jump Directly to a Collection
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={onNavigate}
                  data-instant-collection-link={cat.slug}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/70 px-3 py-2 text-xs transition-all duration-[180ms] hover:border-[var(--brand-crimson)] hover:bg-[var(--bg-surface)]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-crimson)]">
                      {cat.name.split('&')[0]?.trim()}
                    </p>
                    <p className="font-tamil truncate text-[11px] text-[var(--text-muted)]">
                      {cat.tamilName}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--brand-crimson)]"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Zero-match state: helpful empty-results feedback with 1-click suggestions
  if (matchedProducts.length === 0 && matchedCategories.length === 0) {
    return (
      <div
        data-instant-search-panel="empty"
        className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] p-5 text-center"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-crimson-soft)] text-[var(--brand-crimson)]">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="font-display mt-2.5 text-lg font-bold text-[var(--text-primary)]">
          No products or collections matched “{trimmed}”
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[var(--text-secondary)]">
          We never show unrelated filler items. Try one of these verified Madurai blends or ask us
          directly on WhatsApp:
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {POPULAR_SEARCH_TERMS.slice(0, 4).map((item) => (
            <button
              key={item.query}
              type="button"
              onClick={() => onSelectQuery?.(item.query)}
              className="inline-flex min-h-[30px] items-center gap-1 rounded-full border border-[var(--brand-crimson)]/35 bg-[var(--bg-surface)] px-3 text-xs font-semibold text-[var(--brand-crimson)] hover:bg-[var(--brand-crimson)] hover:text-white"
            >
              Try “{item.query}”
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/products"
            onClick={onNavigate}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[var(--brand-crimson)] px-4 text-xs font-bold text-white hover:bg-[var(--brand-crimson-hover)]"
          >
            Browse All 25 Products
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <a
            href={buildWhatsAppUrl(
              `Hello ${BRAND.fullName}, I searched for "${trimmed}" on your website. Do you have this available?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[var(--brand-leaf)] bg-[var(--brand-leaf-soft)] px-3.5 text-xs font-bold text-[var(--brand-leaf)] hover:bg-[var(--brand-leaf)] hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Ask on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      data-instant-search-panel="results"
      data-instant-match-count={matchedProducts.length}
      className="space-y-4 pt-2 text-left"
    >
      {/* Matching Collections Row (Direct Navigation to Collection Page) */}
      {matchedCategories.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Matching Collections ({matchedCategories.length})
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {matchedCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                onClick={onNavigate}
                data-instant-collection-hit={cat.slug}
                className="group inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-[var(--brand-crimson)]/35 bg-[var(--brand-crimson-soft)]/55 px-3.5 py-1.5 text-xs font-bold text-[var(--brand-crimson)] transition-colors duration-[180ms] hover:bg-[var(--brand-crimson)] hover:text-white"
              >
                <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{cat.name}</span>
                <span className="font-tamil text-[11px] font-normal opacity-85">
                  ({cat.tamilName})
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Matching Products with Studio Thumbnails, Names, Pack Weights & Verified Prices */}
      {visibleProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Matching Products ({matchedProducts.length})
            </p>
            <Link
              href={`/search?q=${encodeURIComponent(trimmed)}`}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-crimson)] hover:underline"
            >
              View all {matchedProducts.length} results
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((prod) => {
              const primaryVar = prod.variants[0];
              const thumb =
                primaryVar?.thumbUrl ||
                prod.images[0]?.thumbUrl ||
                '/images/products/sambar-podi-5-480.webp';
              const cutout = getCutoutUrlFromThumb(thumb, '420');
              const theme = getCategoryTheme(prod.primaryCategorySlug);
              const weightLabel = primaryVar?.netWeightGrams
                ? `${primaryVar.netWeightGrams}g`
                : primaryVar?.label || '';

              return (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  onClick={onNavigate}
                  data-instant-product-hit={prod.slug}
                  className="group flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/80 p-2.5 transition-all duration-[180ms] hover:border-[var(--brand-crimson)] hover:bg-[var(--bg-surface)] hover:shadow-md"
                >
                  <div
                    style={{ background: theme.cardStageBg || theme.stageBg }}
                    className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1.5"
                  >
                    <PouchImage
                      src={cutout}
                      fallbackSrc={thumb}
                      alt={prod.name}
                      width={96}
                      height={128}
                      imgClassName="pouch-float-light transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-crimson)]">
                      {prod.name}
                    </p>
                    <p className="font-tamil truncate text-xs text-[#8C2023]">
                      {prod.tamilName}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono-num text-xs font-bold text-[var(--text-primary)]">
                        {formatPaiseToInr(primaryVar?.pricePaise)}
                        {weightLabel ? (
                          <span className="ml-1 font-normal text-[var(--text-muted)]">
                            • {weightLabel}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          prod.isOrderableOnline
                            ? 'bg-[var(--brand-leaf-soft)] text-[var(--brand-leaf)]'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {prod.isOrderableOnline ? 'In Stock' : 'Enquiry'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
