'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, AlertTriangle, Sparkles } from 'lucide-react';
import type { CatalogCategorySummary, CatalogProduct } from '@/domain/catalog/service';
import { getCutoutUrlFromThumb } from '@/lib/media';
import { PouchImage } from '@/components/ui/PouchImage';

interface CategoryExplorerProps {
  categories: CatalogCategorySummary[];
  allProducts: CatalogProduct[];
}

interface ExhibitionVisualSpec {
  surfaceClass: string;
  stageStyle: React.CSSProperties;
  darkText: boolean;
  eyebrow: string;
  composition: 'trio-wide' | 'crimson-chamber' | 'podi-cascade' | 'courtyard-wide' | 'duo-offset' | 'heirloom-trio' | 'seasonal-atelier' | 'botanical-care';
}

const EXHIBITION_SPECS: Record<string, ExhibitionVisualSpec> = {
  'cooking-essentials': {
    surfaceClass: 'text-[#1F120C] border-[#DFC7A2]',
    stageStyle: {
      background:
        'radial-gradient(circle at 74% 52%, #FFF8EA 0%, #F5E3C2 55%, #EBD3AB 100%)',
    },
    darkText: true,
    eyebrow: '01 • Everyday Hearth',
    composition: 'trio-wide',
  },
  'non-veg-masalas': {
    surfaceClass: 'text-[#FBF5EC] border-[#5B251D]',
    stageStyle: {
      background:
        'radial-gradient(circle at 52% 40%, rgba(182, 42, 32, 0.56) 0%, rgba(122, 26, 20, 0.45) 45%, #27100C 100%)',
    },
    darkText: false,
    eyebrow: '02 • Madurai Signature',
    composition: 'crimson-chamber',
  },
  'traditional-podi': {
    surfaceClass: 'text-[#1F120C] border-[#DFC49F]',
    stageStyle: {
      background:
        'radial-gradient(circle at 50% 38%, #FFF7E8 0%, #F5E0BE 62%, #E8CB9F 100%)',
    },
    darkText: true,
    eyebrow: '03 • Morning Tiffin',
    composition: 'podi-cascade',
  },
  'traditional-food-mixes': {
    surfaceClass: 'text-[#16271C] border-[#C4D8C1]',
    stageStyle: {
      background:
        'radial-gradient(circle at 72% 48%, #F7FBF4 0%, #E3EFE0 58%, #CFE2CA 100%)',
    },
    darkText: true,
    eyebrow: '04 • Ready Tiffin & Mixes',
    composition: 'courtyard-wide',
  },
  'millet-and-flours': {
    surfaceClass: 'text-[#1F120C] border-[#DAC6AD]',
    stageStyle: {
      background:
        'radial-gradient(circle at 66% 48%, #FDF8F0 0%, #EFE1CE 60%, #E2CEB4 100%)',
    },
    darkText: true,
    eyebrow: '05 • Heritage Milling',
    composition: 'duo-offset',
  },
  'healthy-mixes': {
    surfaceClass: 'text-[#1F120C] border-[#DBC4BE]',
    stageStyle: {
      background:
        'radial-gradient(circle at 54% 46%, #FCF5F2 0%, #EFE0DB 58%, #E1CBC4 100%)',
    },
    darkText: true,
    eyebrow: '06 • Heirloom Grains',
    composition: 'heirloom-trio',
  },
  pickles: {
    surfaceClass: 'text-[#1F120C] border-[#DFBFB5]',
    stageStyle: {
      background:
        'radial-gradient(circle at 70% 45%, #FFF4EE 0%, #F5DED5 60%, #E9C7BC 100%)',
    },
    darkText: true,
    eyebrow: '07 • Seasonal Small Batch',
    composition: 'seasonal-atelier',
  },
  'traditional-herbal-care': {
    surfaceClass: 'text-[#21250E] border-[#CECEAA]',
    stageStyle: {
      background:
        'radial-gradient(circle at 64% 48%, #FAFAE9 0%, #EAEAC9 60%, #DDDDAA 100%)',
    },
    darkText: true,
    eyebrow: '08 • External Bath Care',
    composition: 'botanical-care',
  },
};

function getDistinctShowcasePouches(cat: CatalogCategorySummary, catProducts: CatalogProduct[], max = 3) {
  const heroCutout = getCutoutUrlFromThumb(cat.heroImage, '720');
  const results: { src: string; fallback: string; alt: string }[] = [
    { src: heroCutout, fallback: cat.heroImage, alt: `${cat.name} signature pouch` },
  ];
  const seen = new Set<string>([getCutoutUrlFromThumb(cat.heroImage, '420')]);

  for (const prod of catProducts) {
    if (results.length >= max) break;
    const raw = prod.images[0]?.thumbUrl;
    if (!raw) continue;
    const key = getCutoutUrlFromThumb(raw, '420');
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ src: key, fallback: raw, alt: prod.name });
  }
  return results;
}

/**
 * Part 2.3 — Editorial Art-Directed Collections Exhibition.
 * - Inspired by high-craft jar-product editorial art direction: asymmetric spatial blocks,
 *   oversized layered floating packaging compositions, distinct complementary visual atmospheres,
 *   generous negative space, sculptural typography, and parallax hover depth.
 * - Every collection links directly to its preserved `/categories/[slug]` page.
 */
export function CategoryExplorer({ categories, allProducts }: CategoryExplorerProps) {
  const bySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c])), [categories]);

  const productsByCat = useMemo(() => {
    const map = new Map<string, CatalogProduct[]>();
    for (const cat of categories) {
      map.set(
        cat.slug,
        allProducts.filter((p) => p.categorySlugs.includes(cat.slug))
      );
    }
    return map;
  }, [categories, allProducts]);

  const cooking = bySlug.get('cooking-essentials');
  const nonVeg = bySlug.get('non-veg-masalas');
  const podi = bySlug.get('traditional-podi');
  const foodMixes = bySlug.get('traditional-food-mixes');
  const millets = bySlug.get('millet-and-flours');
  const healthy = bySlug.get('healthy-mixes');
  const pickles = bySlug.get('pickles');
  const herbal = bySlug.get('traditional-herbal-care');

  const getPouches = (cat?: CatalogCategorySummary, max = 3) =>
    cat ? getDistinctShowcasePouches(cat, productsByCat.get(cat.slug) ?? [], max) : [];

  return (
    <section
      aria-labelledby="category-explorer-heading"
      className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[#F4EAD9] py-16 text-[var(--text-primary)] lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Sculptural Editorial Exhibition Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-crimson)]">
              Curated Collections • Eight Pantry Chapters
            </p>
            <h2
              id="category-explorer-heading"
              className="font-display mt-2.5 text-3xl font-bold leading-[1.06] tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl"
            >
              Every Shelf of the Madurai Kitchen.
            </h2>
          </div>
          <Link
            href="/categories"
            className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 text-xs font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)] sm:self-auto"
          >
            Browse All 8 Collections
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* =================================================================
            EXHIBITION ROW 1 — Flagship Asymmetric Duet (7 cols + 5 cols)
            ================================================================= */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 01: Cooking Essentials & Traditional Masalas (7 cols, expansive sunlit saffron pavilion) */}
          {cooking && (() => {
            const spec = EXHIBITION_SPECS[cooking.slug]!;
            const pouches = getPouches(cooking, 3);
            return (
              <Link
                href={`/categories/${cooking.slug}`}
                style={spec.stageStyle}
                className={`group relative flex min-h-[390px] flex-col justify-between overflow-hidden rounded-[32px] border p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:min-h-[430px] sm:p-9 lg:col-span-7 ${spec.surfaceClass}`}
              >
                {/* Decorative giant watermark number */}
                <span
                  aria-hidden="true"
                  className="font-display pointer-events-none absolute -right-4 -top-8 select-none text-[11rem] font-bold leading-none text-[#9E1B1E]/[0.06]"
                >
                  01
                </span>

                <div className="relative z-20 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-crimson)]">
                    {spec.eyebrow}
                  </span>
                  <span className="font-mono-num rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[var(--text-primary)] shadow-xs">
                    {cooking.productCount} Packs
                  </span>
                </div>

                {/* Editorial Split: Left Title + Right Oversized 3-Pouch Floating Composition */}
                <div className="relative z-10 my-4 grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
                  <div className="sm:col-span-6">
                    <p className="font-tamil text-sm font-bold text-[var(--brand-crimson)]">
                      {cooking.tamilName}
                    </p>
                    <h3 className="font-display mt-1.5 text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-[2.15rem]">
                      {cooking.name}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
                      {cooking.shortDescription}
                    </p>
                  </div>

                  {/* Large Multi-Pouch Floating Trio */}
                  <div className="relative flex h-[240px] items-center justify-center sm:col-span-6 sm:h-[285px]">
                    {pouches[1] && (
                      <div className="relative -mr-14 mt-10 h-[185px] w-[140px] -rotate-10 transition-transform duration-500 ease-out group-hover:-translate-x-3 group-hover:-rotate-12">
                        <PouchImage
                          src={pouches[1].src}
                          fallbackSrc={pouches[1].fallback}
                          alt={pouches[1].alt}
                          width={240}
                          height={320}
                          imgClassName="pouch-float-light"
                        />
                      </div>
                    )}
                    <div className="relative z-20 h-[240px] w-[185px] transition-transform duration-500 ease-out group-hover:-translate-y-2.5 group-hover:scale-[1.04]">
                      <PouchImage
                        src={pouches[0]!.src}
                        fallbackSrc={pouches[0]!.fallback}
                        alt={pouches[0]!.alt}
                        width={420}
                        height={560}
                        priority
                        imgClassName="pouch-float-light"
                      />
                    </div>
                    {pouches[2] && (
                      <div className="relative -ml-14 mt-10 h-[185px] w-[140px] rotate-10 transition-transform duration-500 ease-out group-hover:translate-x-3 group-hover:rotate-12">
                        <PouchImage
                          src={pouches[2].src}
                          fallbackSrc={pouches[2].fallback}
                          alt={pouches[2].alt}
                          width={240}
                          height={320}
                          imgClassName="pouch-float-light"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-20 flex items-center justify-between border-t border-[#C8AE86]/45 pt-4">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Sambar • Kuzhambu • Rasam • Turmeric
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand-crimson)]">
                    Enter Collection
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })()}

          {/* 02: Non-Veg Masalas (5 cols, dramatic smoked crimson spice chamber) */}
          {nonVeg && (() => {
            const spec = EXHIBITION_SPECS[nonVeg.slug]!;
            const pouches = getPouches(nonVeg, 3);
            return (
              <Link
                href={`/categories/${nonVeg.slug}`}
                style={spec.stageStyle}
                className={`group relative flex min-h-[390px] flex-col justify-between overflow-hidden rounded-[32px] border p-6 shadow-md transition-shadow duration-500 hover:shadow-2xl sm:min-h-[430px] sm:p-8 lg:col-span-5 ${spec.surfaceClass}`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[44%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F7CE68]/35 blur-3xl transition-opacity duration-500 group-hover:opacity-95"
                />

                <div className="relative z-20 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F7CE68]">
                    {spec.eyebrow}
                  </span>
                  <span className="font-mono-num rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-[#FBF5EC]">
                    {nonVeg.productCount} Blends
                  </span>
                </div>

                {/* Elevated Dramatic Floating Fan */}
                <div className="relative z-10 my-3 flex h-[230px] items-center justify-center">
                  {pouches[1] && (
                    <div className="relative -mr-12 mt-7 h-[180px] w-[138px] -rotate-9 transition-transform duration-500 ease-out group-hover:-translate-x-3 group-hover:-rotate-12">
                      <PouchImage
                        src={pouches[1].src}
                        fallbackSrc={pouches[1].fallback}
                        alt={pouches[1].alt}
                        width={240}
                        height={320}
                        imgClassName="pouch-float-dark"
                      />
                    </div>
                  )}
                  <div className="relative z-20 h-[225px] w-[175px] transition-transform duration-500 ease-out group-hover:-translate-y-2.5 group-hover:scale-[1.05]">
                    <PouchImage
                      src={pouches[0]!.src}
                      fallbackSrc={pouches[0]!.fallback}
                      alt={pouches[0]!.alt}
                      width={420}
                      height={560}
                      priority
                      imgClassName="pouch-float-dark"
                    />
                  </div>
                  {pouches[2] && (
                    <div className="relative -ml-12 mt-7 h-[180px] w-[138px] rotate-9 transition-transform duration-500 ease-out group-hover:translate-x-3 group-hover:rotate-12">
                      <PouchImage
                        src={pouches[2].src}
                        fallbackSrc={pouches[2].fallback}
                        alt={pouches[2].alt}
                        width={240}
                        height={320}
                        imgClassName="pouch-float-dark"
                      />
                    </div>
                  )}
                </div>

                <div className="relative z-20">
                  <p className="font-tamil text-xs font-semibold text-[#F7CE68]">
                    {nonVeg.tamilName}
                  </p>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                        {nonVeg.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#E3CEBA]">
                        Bhai Veetu Kari, Meen Kuzhambu & crisp Fish Fry spice blends.
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7CE68] text-[#23130D] transition-transform duration-300 group-hover:scale-110">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })()}
        </div>

        {/* =================================================================
            EXHIBITION ROW 2 — Inverted Asymmetric Split (5 cols + 7 cols)
            ================================================================= */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 03: Traditional Podi (5 cols, sunlit sesame-ochre arched cascade) */}
          {podi && (() => {
            const spec = EXHIBITION_SPECS[podi.slug]!;
            const pouches = getPouches(podi, 3);
            return (
              <Link
                href={`/categories/${podi.slug}`}
                style={spec.stageStyle}
                className={`group relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-[32px] border p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:p-8 lg:col-span-5 ${spec.surfaceClass}`}
              >
                {/* Architectural subtle temple arch hairline */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-10 top-12 bottom-28 rounded-t-full border border-[#B97A2E]/22"
                />

                <div className="relative z-20 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9A4208]">
                    {spec.eyebrow}
                  </span>
                  <span className="font-mono-num rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                    {podi.productCount} Podis
                  </span>
                </div>

                {/* Stepped 3-Pouch Podi Cascade */}
                <div className="relative z-10 my-3 flex h-[225px] items-center justify-center">
                  {pouches[1] && (
                    <div className="relative -mr-10 mt-8 h-[175px] w-[134px] -rotate-8 transition-transform duration-500 ease-out group-hover:-translate-x-2.5 group-hover:-translate-y-1">
                      <PouchImage
                        src={pouches[1].src}
                        fallbackSrc={pouches[1].fallback}
                        alt={pouches[1].alt}
                        width={220}
                        height={293}
                        imgClassName="pouch-float-light"
                      />
                    </div>
                  )}
                  <div className="relative z-20 h-[218px] w-[168px] transition-transform duration-500 ease-out group-hover:-translate-y-2.5 group-hover:scale-[1.05]">
                    <PouchImage
                      src={pouches[0]!.src}
                      fallbackSrc={pouches[0]!.fallback}
                      alt={pouches[0]!.alt}
                      width={420}
                      height={560}
                      imgClassName="pouch-float-light"
                    />
                  </div>
                  {pouches[2] && (
                    <div className="relative -ml-10 mt-8 h-[175px] w-[134px] rotate-8 transition-transform duration-500 ease-out group-hover:translate-x-2.5 group-hover:-translate-y-1">
                      <PouchImage
                        src={pouches[2].src}
                        fallbackSrc={pouches[2].fallback}
                        alt={pouches[2].alt}
                        width={220}
                        height={293}
                        imgClassName="pouch-float-light"
                      />
                    </div>
                  )}
                </div>

                <div className="relative z-20 flex items-end justify-between gap-3 border-t border-[#C8A677]/40 pt-4">
                  <div>
                    <p className="font-tamil text-xs font-bold text-[#9A4208]">{podi.tamilName}</p>
                    <h3 className="font-display mt-0.5 text-2xl font-bold leading-tight sm:text-3xl">
                      {podi.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Milagai • Poondu • Ellu • Kollu • Pirandai
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-deep)] text-[#FBF5EC] transition-colors group-hover:bg-[var(--brand-crimson)]">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })()}

          {/* 04: Traditional Food Mixes (7 cols, serene banana-leaf sage courtyard) */}
          {foodMixes && (() => {
            const spec = EXHIBITION_SPECS[foodMixes.slug]!;
            const pouches = getPouches(foodMixes, 3);
            return (
              <Link
                href={`/categories/${foodMixes.slug}`}
                style={spec.stageStyle}
                className={`group relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-[32px] border p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:p-9 lg:col-span-7 ${spec.surfaceClass}`}
              >
                <span
                  aria-hidden="true"
                  className="font-display pointer-events-none absolute -right-4 -top-8 select-none text-[11rem] font-bold leading-none text-[#1C5C33]/[0.07]"
                >
                  04
                </span>

                <div className="relative z-20 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-leaf)]">
                    {spec.eyebrow}
                  </span>
                  <span className="font-mono-num rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[#16271C]">
                    {foodMixes.productCount} Mixes
                  </span>
                </div>

                <div className="relative z-10 my-4 grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
                  {/* Large Left-Aligned Pouch Composition (inverted from Row 1 for rhythm!) */}
                  <div className="relative order-2 flex h-[230px] items-center justify-center sm:order-1 sm:col-span-6 sm:h-[265px]">
                    {pouches[1] && (
                      <div className="relative -mr-14 mt-9 h-[175px] w-[134px] -rotate-8 transition-transform duration-500 ease-out group-hover:-translate-x-3">
                        <PouchImage
                          src={pouches[1].src}
                          fallbackSrc={pouches[1].fallback}
                          alt={pouches[1].alt}
                          width={220}
                          height={293}
                          imgClassName="pouch-float-light"
                        />
                      </div>
                    )}
                    <div className="relative z-20 h-[230px] w-[178px] transition-transform duration-500 ease-out group-hover:-translate-y-2.5 group-hover:scale-[1.04]">
                      <PouchImage
                        src={pouches[0]!.src}
                        fallbackSrc={pouches[0]!.fallback}
                        alt={pouches[0]!.alt}
                        width={420}
                        height={560}
                        imgClassName="pouch-float-light"
                      />
                    </div>
                    {pouches[2] && (
                      <div className="relative -ml-14 mt-9 h-[175px] w-[134px] rotate-8 transition-transform duration-500 ease-out group-hover:translate-x-3">
                        <PouchImage
                          src={pouches[2].src}
                          fallbackSrc={pouches[2].fallback}
                          alt={pouches[2].alt}
                          width={220}
                          height={293}
                          imgClassName="pouch-float-light"
                        />
                      </div>
                    )}
                  </div>

                  <div className="order-1 sm:order-2 sm:col-span-6">
                    <p className="font-tamil text-sm font-bold text-[var(--brand-leaf)]">
                      {foodMixes.tamilName}
                    </p>
                    <h3 className="font-display mt-1.5 text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-[2.15rem]">
                      {foodMixes.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#2F4737]">
                      {foodMixes.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="relative z-20 flex items-center justify-between border-t border-[#9BB99A]/45 pt-4">
                  <span className="text-xs font-bold text-[#1D3927]">
                    Adai Dosai • Red Rice Puttu • Millet Tiffin
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand-leaf)]">
                    Enter Collection
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })()}
        </div>

        {/* =================================================================
            EXHIBITION ROW 3 — Balanced Editorial Pair (6 cols + 6 cols)
            ================================================================= */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 05: Millet & Flour Products */}
          {millets && (() => {
            const spec = EXHIBITION_SPECS[millets.slug]!;
            const pouches = getPouches(millets, 2);
            return (
              <Link
                href={`/categories/${millets.slug}`}
                style={spec.stageStyle}
                className={`group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[32px] border p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:p-8 lg:col-span-6 ${spec.surfaceClass}`}
              >
                <div className="relative z-20 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#72441E]">
                    {spec.eyebrow}
                  </span>
                  <span className="font-mono-num rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                    {millets.productCount} Flours
                  </span>
                </div>

                <div className="relative z-10 my-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-6">
                    <p className="font-tamil text-xs font-bold text-[#72441E]">
                      {millets.tamilName}
                    </p>
                    <h3 className="font-display mt-1 text-2xl font-bold leading-snug sm:text-[1.85rem]">
                      {millets.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {millets.shortDescription}
                    </p>
                  </div>
                  <div className="relative flex h-[205px] items-center justify-center sm:col-span-6">
                    {pouches[1] && (
                      <div className="relative -mr-10 mt-6 h-[165px] w-[126px] -rotate-8 transition-transform duration-500 group-hover:-translate-x-2">
                        <PouchImage
                          src={pouches[1].src}
                          fallbackSrc={pouches[1].fallback}
                          alt={pouches[1].alt}
                          width={220}
                          height={293}
                          imgClassName="pouch-float-light"
                        />
                      </div>
                    )}
                    <div className="relative z-20 h-[205px] w-[158px] rotate-3 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.04]">
                      <PouchImage
                        src={pouches[0]!.src}
                        fallbackSrc={pouches[0]!.fallback}
                        alt={pouches[0]!.alt}
                        width={340}
                        height={453}
                        imgClassName="pouch-float-light"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative z-20 flex items-center justify-between border-t border-[#C4AE90]/45 pt-3.5">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    Red Rice Puttu • Idiyappam • Multigrain Chapathi
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#72441E]">
                    Explore <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })()}

          {/* 06: Healthy Mixes (luminous heirloom rose-clay making dark Ulundhu Kali pop!) */}
          {healthy && (() => {
            const spec = EXHIBITION_SPECS[healthy.slug]!;
            const pouches = getPouches(healthy, 3);
            return (
              <Link
                href={`/categories/${healthy.slug}`}
                style={spec.stageStyle}
                className={`group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[32px] border p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:p-8 lg:col-span-6 ${spec.surfaceClass}`}
              >
                <div className="relative z-20 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6E262E]">
                    {spec.eyebrow}
                  </span>
                  <span className="font-mono-num rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
                    {healthy.productCount} Mixes
                  </span>
                </div>

                <div className="relative z-10 my-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <p className="font-tamil text-xs font-bold text-[#6E262E]">
                      {healthy.tamilName}
                    </p>
                    <h3 className="font-display mt-1 text-2xl font-bold leading-snug sm:text-[1.85rem]">
                      {healthy.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {healthy.shortDescription}
                    </p>
                  </div>
                  <div className="relative flex h-[205px] items-center justify-center sm:col-span-7">
                    {pouches[1] && (
                      <div className="relative -mr-10 mt-6 h-[160px] w-[122px] -rotate-8 transition-transform duration-500 group-hover:-translate-x-2.5">
                        <PouchImage
                          src={pouches[1].src}
                          fallbackSrc={pouches[1].fallback}
                          alt={pouches[1].alt}
                          width={220}
                          height={293}
                          imgClassName="pouch-float-light"
                        />
                      </div>
                    )}
                    <div className="relative z-20 h-[205px] w-[158px] transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.05]">
                      <PouchImage
                        src={pouches[0]!.src}
                        fallbackSrc={pouches[0]!.fallback}
                        alt={pouches[0]!.alt}
                        width={340}
                        height={453}
                        imgClassName="pouch-float-light"
                      />
                    </div>
                    {pouches[2] && (
                      <div className="relative -ml-10 mt-6 h-[160px] w-[122px] rotate-8 transition-transform duration-500 group-hover:translate-x-2.5">
                        <PouchImage
                          src={pouches[2].src}
                          fallbackSrc={pouches[2].fallback}
                          alt={pouches[2].alt}
                          width={220}
                          height={293}
                          imgClassName="pouch-float-light"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-20 flex items-center justify-between border-t border-[#C4A59D]/45 pt-3.5">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    Ulundhu Kali • Karuppu Kavuni • Kollu • Sathu Maavu
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6E262E]">
                    Explore <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })()}
        </div>

        {/* =================================================================
            EXHIBITION ROW 4 — Specialty Atelier Duet (Seasonal Pickles + External Herbal Care)
            ================================================================= */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 07: Seasonal Pickles (Honest Seasonal Atelier — zero misleading spice pouches!) */}
          {pickles && (() => {
            const spec = EXHIBITION_SPECS[pickles.slug]!;
            return (
              <Link
                href={`/categories/${pickles.slug}`}
                style={spec.stageStyle}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[28px] border p-6 shadow-xs transition-shadow duration-500 hover:shadow-lg sm:flex-row sm:items-center sm:p-7 lg:col-span-6 ${spec.surfaceClass}`}
              >
                <div className="max-w-sm">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-crimson)]">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {spec.eyebrow}
                  </span>
                  <h3 className="font-display mt-1.5 text-2xl font-bold leading-tight">
                    {pickles.name}
                  </h3>
                  <p className="font-tamil text-xs font-bold text-[var(--brand-crimson)]">
                    {pickles.tamilName} — மாங்காய் & களாக்காய்
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                    Seasonal Mango & Kalaka Pickle batches featured on our Instagram Reels. Jar
                    photographs & online MRPs pending — enquire directly for availability.
                  </p>
                </div>

                <div className="mt-5 flex shrink-0 flex-col items-start gap-2 sm:mt-0 sm:items-end">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-950">
                    Seasonal • WhatsApp Enquiry
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-crimson)]">
                    View Pickle Details <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })()}

          {/* 08: Traditional Herbal Care (External Bathing Only — Distinct Botanical Segregation) */}
          {herbal && (() => {
            const spec = EXHIBITION_SPECS[herbal.slug]!;
            const pouches = getPouches(herbal, 1);
            return (
              <Link
                href={`/categories/${herbal.slug}`}
                style={spec.stageStyle}
                className={`group relative flex items-center justify-between gap-4 overflow-hidden rounded-[28px] border p-6 shadow-xs transition-shadow duration-500 hover:shadow-lg sm:p-7 lg:col-span-6 ${spec.surfaceClass}`}
              >
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-900 px-2.5 py-0.5 text-[10px] font-bold text-amber-50">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    External Bathing Use Only • Non-Edible
                  </span>
                  <h3 className="font-display mt-2 text-2xl font-bold leading-tight">
                    {herbal.name}
                  </h3>
                  <p className="font-tamil text-xs font-bold text-[#525A14]">{herbal.tamilName}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#464A21]">
                    Traditional Nalangu Maavu herbal bath powder kept strictly separate from
                    culinary foods.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#464A21]">
                    View Herbal Care <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>

                {pouches[0] && (
                  <div className="relative h-36 w-28 shrink-0 transition-transform duration-400 group-hover:-translate-y-1.5 group-hover:scale-105">
                    <PouchImage
                      src={pouches[0].src}
                      fallbackSrc={pouches[0].fallback}
                      alt={pouches[0].alt}
                      width={200}
                      height={266}
                      imgClassName="pouch-float-light"
                    />
                  </div>
                )}
              </Link>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
