'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { CatalogCategorySummary } from '@/domain/catalog/service';
import { getCategoryTheme, getCutoutUrlFromThumb } from '@/lib/media';
import { TiltCard } from '@/components/motion/TiltCard';
import { PouchImage } from '@/components/ui/PouchImage';

export function CategoryCard({ category }: { category: CatalogCategorySummary }) {
  const theme = getCategoryTheme(category.slug);
  const cutoutSrc = getCutoutUrlFromThumb(category.heroImage, '420');

  return (
    <TiltCard maxTiltDeg={3.5} className="h-full">
      <Link
        href={`/categories/${category.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-crimson)]/40 hover:shadow-lg"
      >
        {/* Luminous Studio Stage with Dominant Floating Pouch (or honest Seasonal emblem when jar photos pending) */}
        <div
          style={{ background: theme.stageBg }}
          className="relative flex h-56 w-full items-center justify-center overflow-hidden p-5"
        >
          {category.isComingSoonOnly ? (
            <div className="flex max-w-[210px] flex-col items-center rounded-2xl border border-dashed border-[var(--brand-crimson)]/40 bg-white/85 px-4 py-5 text-center shadow-xs">
              <span className="font-tamil text-lg font-bold text-[var(--brand-crimson)]">
                மாங்காய் & களாக்காய்
              </span>
              <span className="font-display mt-1 text-sm font-bold text-[var(--text-primary)]">
                Seasonal Pickle Batches
              </span>
              <span className="mt-1 text-[11px] text-[var(--text-muted)]">
                Jar photos & pricing pending • WhatsApp enquiry
              </span>
            </div>
          ) : (
            <div className="relative z-10 h-full w-full transition-transform duration-400 ease-out group-hover:-translate-y-1.5 group-hover:scale-105">
              <PouchImage
                src={cutoutSrc}
                fallbackSrc={category.heroImage}
                alt={`${category.name} — ${category.tamilName}`}
                width={420}
                height={560}
                priority
                imgClassName="pouch-float-light"
              />
            </div>
          )}

          <span className="font-mono-num absolute left-3 top-3 z-20 rounded-full bg-[var(--bg-surface)]/95 px-2.5 py-1 text-[11px] font-bold text-[var(--text-primary)] shadow-xs">
            {category.isComingSoonOnly
              ? 'Seasonal • WA'
              : !category.isEdibleCategory
                ? 'External Care • 1'
                : `${category.productCount} ${category.productCount === 1 ? 'Product' : 'Products'}`}
          </span>

          <span className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-deep)] text-[#FBF5EC] transition-colors group-hover:bg-[var(--brand-crimson)]">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <p className="font-tamil text-xs font-semibold text-[var(--brand-crimson)]">
              {category.tamilName}
            </p>
            <h3 className="font-display mt-1 text-xl font-bold leading-snug text-[var(--text-primary)] group-hover:text-[var(--brand-crimson)]">
              {category.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              {category.shortDescription}
            </p>
          </div>
          <p className="mt-4 text-xs font-bold text-[var(--brand-crimson)] group-hover:underline">
            Explore collection →
          </p>
        </div>
      </Link>
    </TiltCard>
  );
}
