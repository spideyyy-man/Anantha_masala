'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CatalogCategorySummary, CatalogProduct } from '@/domain/catalog/service';
import { ProductCard } from '@/components/cards/ProductCard';

interface InfinitePantryShowcaseProps {
  allProducts: CatalogProduct[];
  categories?: CatalogCategorySummary[];
}

/**
 * Part 2.2 — ONE Continuous Right-to-Left Gliding Product Showcase.
 * - Coordinated Chapter 03 bridge connecting Food Storytelling to the complete 25-pack catalogue
 *   and individual category routes.
 * - Seamless modulo RAF wraparound, hover/focus deceleration, off-screen IntersectionObserver pause,
 *   touch-pan-y swipe/drag support, prefers-reduced-motion compliance, and aria-hidden clones.
 */
export function InfinitePantryShowcase({ allProducts, categories = [] }: InfinitePantryShowcaseProps) {
  const [isDraggingUI, setIsDraggingUI] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef<number>(0);
  const loopWidthRef = useRef<number>(0);
  const speedFactorRef = useRef<number>(1);
  const hoveredRef = useRef<boolean>(false);
  const inViewRef = useRef<boolean>(false);
  const draggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const dragStartOffsetRef = useRef<number>(0);
  const movedDuringDragRef = useRef<boolean>(false);
  const reducedMotionRef = useRef<boolean>(false);

  // Curated showcase order: edible culinary staples first, diverse colour & pack silhouettes across the stream
  const showcaseProducts = useMemo(() => {
    const edible = allProducts.filter((p) => p.isEdible);
    const care = allProducts.filter((p) => !p.isEdible);
    return [...edible, ...care];
  }, [allProducts]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener('change', onMqChange);

    let rafId = 0;
    let lastTs = performance.now();

    const applyTransform = () => {
      const loopW = loopWidthRef.current;
      if (loopW <= 0 || !trackRef.current) return;
      let wrapped = offsetRef.current % loopW;
      if (wrapped > 0) wrapped -= loopW;
      offsetRef.current = wrapped;
      trackRef.current.style.transform = `translate3d(${wrapped.toFixed(1)}px, 0, 0)`;
    };

    const measure = () => {
      if (firstSetRef.current) {
        // Width of one full set + gap-5 (20px)
        loopWidthRef.current = firstSetRef.current.scrollWidth + 20;
        applyTransform();
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (firstSetRef.current) ro.observe(firstSetRef.current);

    const speedPxPerSec = 48;

    const step = (now: number) => {
      if (!inViewRef.current) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const loopW = loopWidthRef.current;
      if (loopW <= 0 || !trackRef.current) return;

      const shouldAutoMove =
        !hoveredRef.current &&
        !draggingRef.current &&
        !reducedMotionRef.current &&
        !document.hidden;

      const targetFactor = shouldAutoMove ? 1 : 0;
      speedFactorRef.current += (targetFactor - speedFactorRef.current) * Math.min(1, dt * 8);

      if (!draggingRef.current && speedFactorRef.current > 0.002) {
        // Continuous smooth right-to-left motion
        offsetRef.current -= speedPxPerSec * speedFactorRef.current * dt;
        applyTransform();
      }
    };

    const startLoop = () => {
      if (rafId === 0 && inViewRef.current) {
        lastTs = performance.now();
        rafId = requestAnimationFrame(step);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = Boolean(entries[0]?.isIntersecting);
        inViewRef.current = visible;
        if (visible) {
          startLoop();
        } else if (rafId !== 0) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { rootMargin: '120px 0px' }
    );
    if (viewportRef.current) io.observe(viewportRef.current);

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      mq.removeEventListener('change', onMqChange);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    movedDuringDragRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartOffsetRef.current = offsetRef.current;
    setIsDraggingUI(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    const dy = e.clientY - dragStartYRef.current;
    if (e.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx) + 8 && !movedDuringDragRef.current) {
      draggingRef.current = false;
      setIsDraggingUI(false);
      return;
    }
    if (Math.abs(dx) > 6) movedDuringDragRef.current = true;
    const loopW = loopWidthRef.current;
    if (loopW > 0 && trackRef.current) {
      let next = (dragStartOffsetRef.current + dx) % loopW;
      if (next > 0) next -= loopW;
      offsetRef.current = next;
      trackRef.current.style.transform = `translate3d(${next.toFixed(1)}px, 0, 0)`;
    }
  };

  const endDrag = () => {
    draggingRef.current = false;
    setIsDraggingUI(false);
  };

  return (
    <section
      id="pantry-showcase"
      aria-labelledby="infinite-pantry-heading"
      className="relative overflow-hidden bg-gradient-to-b from-[#FBF6EE] via-[#F4EAD9] to-[#FBF6EE] py-14 text-[var(--text-primary)] lg:py-18"
    >
      {/* Chapter 03 Architectural Divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto mb-7 flex max-w-7xl items-center gap-4 px-4 sm:px-6"
      >
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-strong)] to-[var(--border-subtle)]" />
        <span className="font-tamil text-xs font-bold tracking-wide text-[var(--brand-crimson)]/85">
          அத்தியாயம் 03 • 25 அசல் மசாலா மற்றும் மாவு வகைகள்
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border-strong)] to-[var(--border-subtle)]" />
      </div>

      {/* Coordinated Chapter Header + Quick Category Jump Pills */}
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-crimson)]">
              Chapter 03 • Complete Pantry Stream • {showcaseProducts.length} Audited Packs
            </p>
            <h2
              id="infinite-pantry-heading"
              className="font-display mt-1.5 text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl"
            >
              Every Genuine Pack, Ready for Your Kitchen Shelf.
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[var(--bg-deep)] px-5 text-xs font-bold text-[#FBF5EC] transition-colors duration-200 hover:bg-[var(--brand-crimson)]"
            >
              Open Full Pantry ({showcaseProducts.length})
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {categories.length > 0 && (
          <div
            aria-label="Browse pantry by category"
            className="snap-rail -mx-4 mt-4 gap-2 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="snap-rail-item inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border-strong)]/75 bg-[var(--bg-surface)]/90 px-3.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors duration-[180ms] hover:border-[var(--brand-crimson)] hover:text-[var(--brand-crimson)]"
              >
                <span>{cat.name.split('&')[0]?.trim()}</span>
                <span className="font-mono-num text-[10px] text-[var(--text-muted)]">
                  {cat.isComingSoonOnly ? 'WA' : cat.productCount}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Single Seamless Right-to-Left Infinite Gliding Showcase */}
      <div
        ref={viewportRef}
        aria-label="Continuous gliding showcase of Madurai Anantha Masala pouches"
        data-infinite-track="left"
        onMouseEnter={() => {
          hoveredRef.current = true;
        }}
        onMouseLeave={() => {
          hoveredRef.current = false;
          endDrag();
        }}
        onFocusCapture={() => {
          hoveredRef.current = true;
        }}
        onBlurCapture={() => {
          hoveredRef.current = false;
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (movedDuringDragRef.current) {
            e.preventDefault();
            e.stopPropagation();
            movedDuringDragRef.current = false;
          }
        }}
        className={`relative w-full touch-pan-y overflow-hidden py-3 select-none ${
          isDraggingUI ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Subtle sunlit edge vignettes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-14 bg-gradient-to-r from-[#FBF6EE] to-transparent sm:block lg:w-24"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-14 bg-gradient-to-l from-[#FBF6EE] to-transparent sm:block lg:w-24"
        />

        <div ref={trackRef} className="flex w-max gap-5">
          {/* Canonical Focusable Track Set */}
          <div ref={firstSetRef} className="flex shrink-0 gap-5">
            {showcaseProducts.map((prod) => (
              <div key={prod.id} className="shrink-0">
                <ProductCard product={prod} variant="showcase" />
              </div>
            ))}
          </div>

          {/* Visual Seamless Loop Clone (non-focusable & aria-hidden) */}
          <div aria-hidden="true" className="flex shrink-0 gap-5">
            {showcaseProducts.map((prod) => (
              <div key={`clone-${prod.id}`} className="shrink-0">
                <ProductCard product={prod} variant="showcase" isDuplicateClone />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
