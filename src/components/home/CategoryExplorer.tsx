'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import type { CatalogCategorySummary, CatalogProduct } from '@/domain/catalog/service';
import { CATEGORY_THEMES, getCategoryTheme, getCutoutUrlFromThumb } from '@/lib/media';
import { PouchImage } from '@/components/ui/PouchImage';

interface CategoryExplorerProps {
  categories: CatalogCategorySummary[];
  allProducts: CatalogProduct[];
}

export function getDistinctShowcasePouches(
  cat: CatalogCategorySummary,
  catProducts: CatalogProduct[],
  max = 3
) {
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

/** Normalize any floating-point phase into [0, total) */
function wrapPhase(phase: number, total: number): number {
  if (total <= 0) return 0;
  return ((phase % total) + total) % total;
}

/**
 * Shortest continuous circular signed offset in (-N/2, N/2] for seamless infinite
 * looping without duplicate DOM clones or boundary jumps.
 */
function getContinuousCircularOffset(index: number, phase: number, total: number): number {
  if (total <= 0) return 0;
  let diff = index - wrapPhase(phase, total);
  const half = total / 2;
  if (diff > half) diff -= total;
  if (diff <= -half) diff += total;
  return diff;
}

/** Smooth Hermite interpolation t in [0, 1] */
function smoothstep01(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

type ViewportTier = 'mobile' | 'tablet' | 'desktop';

interface SpatialState {
  x: number;
  y: number;
  scale: number;
  rotateY: number;
  opacity: number;
  blur: number;
  z: number;
  interactive: boolean;
}

/**
 * Evaluates a C1-continuous spatial 3D curve for any floating-point offset `rel`.
 * Cards beyond |rel| >= 2.85 are completely transparent (opacity: 0) well before
 * the circular wrap boundary at |rel| = 4.0, guaranteeing zero visible seam or jump.
 */
function evaluateContinuousSpatial(rel: number, tier: ViewportTier): SpatialState {
  // Subtle focal dwell shaping near rel = 0 so the central product commands clear visual presence
  const absRaw = Math.abs(rel);
  const sign = rel < 0 ? -1 : 1;
  const shapedAbs =
    absRaw < 0.65
      ? absRaw * (0.76 + 0.24 * (absRaw / 0.65) * (absRaw / 0.65))
      : absRaw;

  const anchorPoints =
    tier === 'mobile'
      ? [
          { d: 0, x: 0, y: 0, scale: 1.0, rot: 0, op: 1.0, blur: 0 },
          { d: 1, x: 266, y: 16, scale: 0.85, rot: 8, op: 0.58, blur: 0.5 },
          { d: 2, x: 465, y: 32, scale: 0.72, rot: 12, op: 0.0, blur: 1.8 },
          { d: 3, x: 540, y: 40, scale: 0.66, rot: 14, op: 0.0, blur: 2.2 },
        ]
      : tier === 'tablet'
        ? [
            { d: 0, x: 0, y: 0, scale: 1.0, rot: 0, op: 1.0, blur: 0 },
            { d: 1, x: 342, y: 18, scale: 0.83, rot: 9, op: 0.74, blur: 0.65 },
            { d: 2, x: 585, y: 35, scale: 0.67, rot: 14, op: 0.26, blur: 1.6 },
            { d: 2.85, x: 760, y: 48, scale: 0.56, rot: 16, op: 0.0, blur: 2.5 },
          ]
        : [
            { d: 0, x: 0, y: 0, scale: 1.0, rot: 0, op: 1.0, blur: 0 },
            { d: 1, x: 426, y: 16, scale: 0.835, rot: 9, op: 0.82, blur: 0.45 },
            { d: 2, x: 694, y: 34, scale: 0.69, rot: 14, op: 0.54, blur: 1.1 },
            { d: 2.85, x: 940, y: 50, scale: 0.56, rot: 18, op: 0.0, blur: 2.4 },
          ];

  let p0 = anchorPoints[0]!;
  let p1 = anchorPoints[anchorPoints.length - 1]!;

  if (shapedAbs >= p1.d) {
    return {
      x: sign * p1.x,
      y: p1.y,
      scale: p1.scale,
      rotateY: -sign * p1.rot,
      opacity: 0,
      blur: p1.blur,
      z: 1,
      interactive: false,
    };
  }

  for (let i = 0; i < anchorPoints.length - 1; i++) {
    const a = anchorPoints[i]!;
    const b = anchorPoints[i + 1]!;
    if (shapedAbs >= a.d && shapedAbs <= b.d) {
      p0 = a;
      p1 = b;
      break;
    }
  }

  const span = Math.max(0.0001, p1.d - p0.d);
  const t = smoothstep01((shapedAbs - p0.d) / span);

  const x = sign * lerp(p0.x, p1.x, t);
  const y = lerp(p0.y, p1.y, t);
  const scale = lerp(p0.scale, p1.scale, t);
  const rotateY = -sign * lerp(p0.rot, p1.rot, t);
  const opacity = lerp(p0.op, p1.op, t);
  const blur = lerp(p0.blur, p1.blur, t);
  const z = Math.max(1, Math.round(40 - shapedAbs * 12));
  const interactive = opacity > 0.18 && shapedAbs < (tier === 'mobile' ? 1.45 : 2.35);

  return { x, y, scale, rotateY, opacity, blur, z, interactive };
}

/** Discrete semantic slot attribute for accessibility & deterministic DOM querying */
function getDiscreteSlotLabel(rel: number): string {
  const rounded = Math.round(rel);
  if (rounded === 0) return 'center';
  if (rounded === -1) return 'left-1';
  if (rounded === 1) return 'right-1';
  if (rounded === -2) return 'left-2';
  if (rounded === 2) return 'right-2';
  return rounded < 0 ? 'far-left' : 'far-right';
}

const BASE_SPEED_CARDS_PER_SEC = 0.72; // Continuous movement: ~1.39s per card, ~11.1s per full 8-card loop
const INTERACTION_PAUSE_SEC = 1.4;

const COLLECTION_SHORT_TAB_LABELS: Record<string, string> = {
  'cooking-essentials': 'Cooking Essentials',
  'non-veg-masalas': 'Non-Veg Masalas',
  'traditional-podi': 'Traditional Podi',
  'traditional-food-mixes': 'Food Mixes',
  'millet-and-flours': 'Millet & Flours',
  'healthy-mixes': 'Healthy Mixes',
  pickles: 'Pickles',
  'traditional-herbal-care': 'Herbal Care',
};

export const ACTIVE_COLLECTION_STORAGE_KEY = 'aanandha_active_collection_slug';

/**
 * Continuous Infinite Spatial Collection Shelf with Connected Shared-Element Transitions.
 * - Moves continuously by default with zero Auto/Pause/Play UI clutter.
 * - Uses a floating-point circular ring in requestAnimationFrame so cards glide seamlessly
 *   across infinite loops with zero boundary jump, reset, or blank space.
 * - Supports direct pointer/touch dragging, smooth hover slowdown, and connected expansion
 *   transitions into `/categories/[slug]`.
 */
export function CategoryExplorer({ categories, allProducts }: CategoryExplorerProps) {
  const router = useRouter();
  const total = categories.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [tier, setTier] = useState<ViewportTier>('desktop');
  const [isDraggingUI, setIsDraggingUI] = useState(false);
  const [launchingSlug, setLaunchingSlug] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardElsRef = useRef<(HTMLElement | null)[]>([]);

  // Continuous floating-point motion state
  const phaseRef = useRef<number>(0);
  const unwrappedDistanceRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(0);
  const speedFactorRef = useRef<number>(1);
  const dragVelocityRef = useRef<number>(0);
  const targetPhaseRef = useRef<number | null>(null);
  const pauseTimerSecRef = useRef<number>(0);

  // Interaction refs
  const inViewRef = useRef<boolean>(true);
  const stageHoveredRef = useRef<boolean>(false);
  const cardHoveredRef = useRef<boolean>(false);
  const draggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const dragStartPhaseRef = useRef<number>(0);
  const lastDragXRef = useRef<number>(0);
  const lastDragTsRef = useRef<number>(0);
  const movedDuringDragRef = useRef<boolean>(false);
  const reducedMotionRef = useRef<boolean>(false);
  const tierRef = useRef<ViewportTier>('desktop');

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

  // Apply continuous 60fps spatial transforms directly to card DOM nodes
  const applySpatialFrame = useCallback(() => {
    if (total === 0) return;
    const currentPhase = wrapPhase(phaseRef.current, total);
    const currentTier = tierRef.current;

    // Update section telemetry attributes for deterministic loop & phase verification
    if (sectionRef.current) {
      const completedLoops = Math.floor(Math.abs(unwrappedDistanceRef.current) / total);
      sectionRef.current.setAttribute('data-collections-phase', currentPhase.toFixed(3));
      sectionRef.current.setAttribute(
        'data-collections-unwrapped',
        unwrappedDistanceRef.current.toFixed(3)
      );
      sectionRef.current.setAttribute('data-collections-loops', String(completedLoops));
    }

    let closestIdx = 0;
    let closestDist = Infinity;

    for (let idx = 0; idx < total; idx++) {
      const rel = getContinuousCircularOffset(idx, currentPhase, total);
      const absRel = Math.abs(rel);
      if (absRel < closestDist) {
        closestDist = absRel;
        closestIdx = idx;
      }

      const el = cardElsRef.current[idx];
      if (!el) continue;

      const spatial = evaluateContinuousSpatial(rel, currentTier);
      el.style.transform = `translate3d(calc(-50% + ${spatial.x.toFixed(2)}px), ${spatial.y.toFixed(2)}px, 0) scale(${spatial.scale.toFixed(4)}) rotateY(${spatial.rotateY.toFixed(2)}deg)`;
      el.style.opacity = spatial.opacity.toFixed(3);
      el.style.filter = spatial.blur > 0.08 ? `blur(${spatial.blur.toFixed(2)}px)` : 'none';
      el.style.zIndex = String(spatial.z);
      el.style.pointerEvents = spatial.interactive ? 'auto' : 'none';
      el.setAttribute('data-carousel-pos', getDiscreteSlotLabel(rel));
      el.setAttribute('data-carousel-rel', rel.toFixed(3));
    }

    if (closestIdx !== activeIndexRef.current) {
      activeIndexRef.current = closestIdx;
      setActiveIndex(closestIdx);
    }
  }, [total]);

  // Restore last visited collection on return navigation & prefetch all category routes
  useEffect(() => {
    if (total === 0) return;
    categories.forEach((cat) => {
      router.prefetch(`/categories/${cat.slug}`);
    });

    try {
      const savedSlug = window.sessionStorage.getItem(ACTIVE_COLLECTION_STORAGE_KEY);
      if (savedSlug) {
        const savedIdx = categories.findIndex((c) => c.slug === savedSlug);
        if (savedIdx >= 0) {
          phaseRef.current = savedIdx;
          activeIndexRef.current = savedIdx;
          setActiveIndex(savedIdx);
        }
      }
    } catch {
      // Ignore storage access restrictions
    }
    applySpatialFrame();
  }, [categories, total, router, applySpatialFrame]);

  // Responsive tier detection & prefers-reduced-motion listener
  useEffect(() => {
    const updateTier = () => {
      const w = window.innerWidth;
      const nextTier: ViewportTier = w < 768 ? 'mobile' : w < 1100 ? 'tablet' : 'desktop';
      tierRef.current = nextTier;
      setTier(nextTier);
      applySpatialFrame();
    };
    updateTier();
    window.addEventListener('resize', updateTier, { passive: true });

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const onMq = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener('change', onMq);

    return () => {
      window.removeEventListener('resize', updateTier);
      mq.removeEventListener('change', onMq);
    };
  }, [applySpatialFrame]);

  // Single clean requestAnimationFrame loop with IntersectionObserver lifecycle cleanup
  useEffect(() => {
    if (total <= 1) return;

    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      if (!inViewRef.current) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      if (pauseTimerSecRef.current > 0) {
        pauseTimerSecRef.current = Math.max(0, pauseTimerSecRef.current - dt);
      }

      if (draggingRef.current) {
        speedFactorRef.current = 0;
        applySpatialFrame();
        return;
      }

      // Smoothly glide to an explicit target index when user clicks a side card, pill, or arrow
      if (targetPhaseRef.current !== null) {
        const current = wrapPhase(phaseRef.current, total);
        const diff = getContinuousCircularOffset(targetPhaseRef.current, current, total);
        if (Math.abs(diff) < 0.006) {
          phaseRef.current = wrapPhase(targetPhaseRef.current, total);
          targetPhaseRef.current = null;
        } else {
          // 280ms responsive card-state convergence
          const stepDelta = diff * Math.min(1, dt * 11.5);
          phaseRef.current = wrapPhase(current + stepDelta, total);
          unwrappedDistanceRef.current += Math.abs(stepDelta);
        }
        applySpatialFrame();
        return;
      }

      // Decay any post-drag release momentum smoothly into continuous motion
      if (Math.abs(dragVelocityRef.current) > 0.015) {
        const vDelta = dragVelocityRef.current * dt;
        phaseRef.current = wrapPhase(phaseRef.current + vDelta, total);
        unwrappedDistanceRef.current += Math.abs(vDelta);
        dragVelocityRef.current *= Math.exp(-dt * 6.5);
      } else {
        dragVelocityRef.current = 0;
      }

      // Determine target automatic speed factor (pauses on direct card hover, slows on stage hover)
      const desiredFactor =
        reducedMotionRef.current || document.hidden || pauseTimerSecRef.current > 0
          ? 0
          : cardHoveredRef.current
            ? 0
            : stageHoveredRef.current
              ? 0.22
              : 1;

      speedFactorRef.current +=
        (desiredFactor - speedFactorRef.current) * Math.min(1, dt * 6.5);

      if (speedFactorRef.current > 0.002) {
        const autoDelta = BASE_SPEED_CARDS_PER_SEC * speedFactorRef.current * dt;
        phaseRef.current = wrapPhase(phaseRef.current + autoDelta, total);
        unwrappedDistanceRef.current += autoDelta;
      }

      applySpatialFrame();
    };

    const startLoop = () => {
      if (rafId === 0 && inViewRef.current) {
        lastTs = performance.now();
        rafId = requestAnimationFrame(tick);
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
      { threshold: 0.08, rootMargin: '120px 0px' }
    );

    if (sectionRef.current) {
      io.observe(sectionRef.current);
    }
    startLoop();

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, [total, applySpatialFrame]);

  // Smoothly glide a specific collection card to exact focal center (280ms convergence)
  const focusCollectionIndex = useCallback(
    (targetIdx: number) => {
      if (total === 0) return;
      const norm = ((targetIdx % total) + total) % total;
      targetPhaseRef.current = norm;
      dragVelocityRef.current = 0;
      pauseTimerSecRef.current = INTERACTION_PAUSE_SEC;
      activeIndexRef.current = norm;
      setActiveIndex(norm);
    },
    [total]
  );

  const handleNext = useCallback(() => {
    const base = targetPhaseRef.current ?? Math.round(phaseRef.current);
    focusCollectionIndex(base + 1);
  }, [focusCollectionIndex]);

  const handlePrev = useCallback(() => {
    const base = targetPhaseRef.current ?? Math.round(phaseRef.current);
    focusCollectionIndex(base - 1);
  }, [focusCollectionIndex]);

  // Connected shared-element navigation into `/categories/[slug]`
  const navigateToCollectionConnected = useCallback(
    (cat: CatalogCategorySummary, e?: React.MouseEvent) => {
      if (movedDuringDragRef.current) {
        e?.preventDefault();
        return;
      }
      e?.preventDefault();

      try {
        window.sessionStorage.setItem(ACTIVE_COLLECTION_STORAGE_KEY, cat.slug);
      } catch {
        // Ignore storage error
      }

      setLaunchingSlug(cat.slug);
      const destination = `/categories/${cat.slug}`;

      const docWithVt = document as Document & {
        startViewTransition?: (cb: () => void) => void;
      };

      window.setTimeout(() => {
        if (
          typeof docWithVt.startViewTransition === 'function' &&
          !reducedMotionRef.current
        ) {
          docWithVt.startViewTransition(() => {
            router.push(destination);
          });
        } else {
          router.push(destination);
        }
      }, 170);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  // Unified pointer dragging (mouse + touch) that never breaks continuous movement
  const dragPxPerCard = tier === 'mobile' ? 230 : tier === 'tablet' ? 310 : 380;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    draggingRef.current = true;
    movedDuringDragRef.current = false;
    targetPhaseRef.current = null;
    dragVelocityRef.current = 0;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartPhaseRef.current = phaseRef.current;
    lastDragXRef.current = e.clientX;
    lastDragTsRef.current = performance.now();
    setIsDraggingUI(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    const dy = e.clientY - dragStartYRef.current;

    // Allow vertical page scroll on touch if gesture is primarily vertical
    if (
      e.pointerType !== 'mouse' &&
      Math.abs(dy) > Math.abs(dx) + 8 &&
      !movedDuringDragRef.current
    ) {
      draggingRef.current = false;
      setIsDraggingUI(false);
      return;
    }

    if (Math.abs(dx) > 6) {
      movedDuringDragRef.current = true;
    }

    const now = performance.now();
    const dtMs = Math.max(8, now - lastDragTsRef.current);
    const stepDx = e.clientX - lastDragXRef.current;
    const instVelCardsPerSec = (-stepDx / dragPxPerCard) / (dtMs / 1000);
    dragVelocityRef.current = lerp(dragVelocityRef.current, instVelCardsPerSec, 0.45);

    lastDragXRef.current = e.clientX;
    lastDragTsRef.current = now;

    const deltaCards = -dx / dragPxPerCard;
    const prevPhase = phaseRef.current;
    phaseRef.current = wrapPhase(dragStartPhaseRef.current + deltaCards, total);
    unwrappedDistanceRef.current += Math.abs(
      getContinuousCircularOffset(phaseRef.current, prevPhase, total)
    );
    applySpatialFrame();
  };

  const endPointerDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDraggingUI(false);
    if (movedDuringDragRef.current) {
      pauseTimerSecRef.current = 0.45;
      window.setTimeout(() => {
        movedDuringDragRef.current = false;
      }, 80);
    }
  };

  if (total === 0) return null;

  const cardWidthPx = tier === 'mobile' ? 304 : tier === 'tablet' ? 450 : 540;
  const stageHeightPx = tier === 'mobile' ? 455 : tier === 'tablet' ? 470 : 485;
  const activeCategory = categories[activeIndex] ?? categories[0]!;
  const launchingCategory = launchingSlug
    ? categories.find((c) => c.slug === launchingSlug) ?? null
    : null;
  const launchingTheme = launchingCategory
    ? getCategoryTheme(launchingCategory.slug)
    : null;

  return (
    <section
      id="collections-shelf"
      ref={sectionRef}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby="category-explorer-heading"
      data-collections-carousel="true"
      data-collections-motion="continuous-infinite"
      data-collections-active-index={activeIndex}
      data-collections-active-slug={activeCategory.slug}
      data-connected-transition-active={launchingSlug ? 'true' : 'false'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden bg-gradient-to-b from-[#F9F1E4] via-[#F4EAD9] to-[#FBF6EE] py-16 text-[var(--text-primary)] focus:outline-none lg:py-22"
    >
      {/* Subtle Top Architectural Chapter Bridge From Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto mb-8 flex max-w-7xl items-center gap-4 px-4 sm:px-6"
      >
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-strong)] to-[var(--border-subtle)]" />
        <span className="font-tamil text-xs font-bold tracking-wide text-[var(--brand-crimson)]/85">
          அத்தியாயம் 01 • மதுரை சமையல் பிரிவுகள்
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border-strong)] to-[var(--border-subtle)]" />
      </div>

      {/* Header Row — Clean Editorial Controls Without Auto/Pause/Play Clutter */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-crimson)]">
              Chapter 01 • Curated Collections • Eight Pantry Chapters
            </p>
            <h2
              id="category-explorer-heading"
              className="font-display mt-2 text-3xl font-bold leading-[1.06] tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl"
            >
              Every Shelf of the Madurai Kitchen.
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
              From daily sambar and Bhai Veetu non-veg masalas to roasted breakfast idli podis and
              eight-grain heirloom mixes — explore our pantry by how Madurai cooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono-num mr-1 text-xs font-bold text-[var(--text-secondary)]">
              0{activeIndex + 1} / 0{total}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous collection"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs transition-all duration-[180ms] hover:scale-105 hover:border-[var(--brand-crimson)] hover:bg-[var(--brand-crimson)] hover:text-white active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next collection"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs transition-all duration-[180ms] hover:scale-105 hover:border-[var(--brand-crimson)] hover:bg-[var(--brand-crimson)] hover:text-white active:scale-95"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <Link
              href="/categories"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--bg-deep)] px-4.5 text-xs font-bold text-[#FBF5EC] transition-all duration-[180ms] hover:bg-[var(--brand-crimson)]"
            >
              All 8 Collections
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================================
          CONTINUOUS INFINITE CENTRE-FOCUSED SPATIAL SHELF
          [ Far Left ] [ Left Neighbour ] [ MAIN FOCUS ] [ Right Neighbour ] [ Far Right ]
          ===================================================================== */}
      <div
        ref={stageRef}
        onMouseEnter={() => {
          stageHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          stageHoveredRef.current = false;
          cardHoveredRef.current = false;
          endPointerDrag();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        onClickCapture={(e) => {
          if (movedDuringDragRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        style={{ height: `${stageHeightPx}px`, perspective: '1400px' }}
        className={`relative mt-9 w-full touch-pan-y select-none overflow-hidden ${
          isDraggingUI ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Subtle left/right spatial fade vignettes framing the distant cards */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-40 hidden w-12 bg-gradient-to-r from-[#F4EAD9] via-[#F4EAD9]/55 to-transparent lg:block xl:w-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-40 hidden w-12 bg-gradient-to-l from-[#F4EAD9] via-[#F4EAD9]/55 to-transparent lg:block xl:w-20"
        />

        {/* Flanking Stage Arrows for Direct Spatial Browsing on Wide Desktop */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Shift previous collection into centre focus"
          className="absolute left-5 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 text-[var(--text-primary)] shadow-lg backdrop-blur-md transition-all duration-[180ms] hover:scale-105 hover:border-[var(--brand-crimson)] hover:bg-[var(--brand-crimson)] hover:text-white active:scale-95 xl:flex"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Shift next collection into centre focus"
          className="absolute right-5 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 text-[var(--text-primary)] shadow-lg backdrop-blur-md transition-all duration-[180ms] hover:scale-105 hover:border-[var(--brand-crimson)] hover:bg-[var(--brand-crimson)] hover:text-white active:scale-95 xl:flex"
        >
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Circular Spatial Cards — Preserving Each Collection's Signature Art Direction */}
        {categories.map((cat, idx) => {
          const initialRel = getContinuousCircularOffset(idx, phaseRef.current, total);
          const initialSpatial = evaluateContinuousSpatial(initialRel, tier);
          const isCenter = idx === activeIndex;
          const isLaunching = launchingSlug === cat.slug;

          const spec =
            CATEGORY_THEMES[cat.slug] ?? CATEGORY_THEMES['cooking-essentials']!;
          const catProducts = productsByCat.get(cat.slug) ?? [];
          const pouches = getDistinctShowcasePouches(
            cat,
            catProducts,
            cat.isComingSoonOnly ? 0 : 3
          );

          const cardStyle: React.CSSProperties = {
            background: spec.stageBg,
            width: `${cardWidthPx}px`,
            height: `${stageHeightPx - 36}px`,
            transform: `translate3d(calc(-50% + ${initialSpatial.x.toFixed(2)}px), ${initialSpatial.y.toFixed(2)}px, 0) scale(${initialSpatial.scale.toFixed(4)}) rotateY(${initialSpatial.rotateY.toFixed(2)}deg)`,
            opacity: initialSpatial.opacity,
            filter: initialSpatial.blur > 0.08 ? `blur(${initialSpatial.blur.toFixed(2)}px)` : 'none',
            zIndex: initialSpatial.z,
            pointerEvents: initialSpatial.interactive ? 'auto' : 'none',
            willChange: 'transform, opacity',
            viewTransitionName: isCenter ? `collection-stage-${cat.slug}` : undefined,
          };

          return (
            <Link
              key={cat.id}
              ref={(el) => {
                cardElsRef.current[idx] = el;
              }}
              href={`/categories/${cat.slug}`}
              draggable={false}
              data-collection-card={cat.slug}
              data-carousel-pos={getDiscreteSlotLabel(initialRel)}
              data-carousel-focal={isCenter ? 'true' : 'false'}
              aria-label={
                isCenter
                  ? `Explore ${cat.name} collection`
                  : `Bring ${cat.name} into centre focus`
              }
              onMouseEnter={() => {
                cardHoveredRef.current = true;
              }}
              onMouseLeave={() => {
                cardHoveredRef.current = false;
              }}
              onClick={(e) => {
                if (movedDuringDragRef.current) {
                  e.preventDefault();
                  return;
                }
                const liveRel = getContinuousCircularOffset(idx, phaseRef.current, total);
                // Side cards glide smoothly into centre focus; central focal card launches connected page transition
                if (Math.abs(liveRel) >= 0.45 && idx !== activeIndexRef.current) {
                  e.preventDefault();
                  focusCollectionIndex(idx);
                } else {
                  navigateToCollectionConnected(cat, e);
                }
              }}
              style={cardStyle}
              className={`group absolute left-1/2 top-3 flex flex-col justify-between overflow-hidden rounded-[32px] border p-5 text-left transition-[box-shadow,border-color] duration-[300ms] ease-out sm:p-7 ${
                spec.surfaceClass
              } ${
                isCenter
                  ? 'shadow-[0_28px_60px_-15px_rgba(31,18,12,0.32)] ring-2 ring-[var(--brand-crimson)]/30'
                  : 'shadow-md hover:shadow-xl'
              } ${isLaunching ? 'scale-[1.03] ring-4 ring-[var(--brand-crimson)]/45' : ''}`}
            >
              {/* Subtle Architectural Watermark Number */}
              <span
                aria-hidden="true"
                className={`font-display pointer-events-none absolute -right-3 -top-6 select-none text-[8.5rem] font-bold leading-none transition-transform duration-[300ms] ${
                  spec.darkSurface ? 'text-[#F7CE68]/[0.07]' : 'text-[#9E1B1E]/[0.055]'
                } ${isCenter ? 'scale-105' : 'scale-95'}`}
              >
                {spec.watermarkNum}
              </span>

              {/* Dark Chamber Glow (Non-Veg Masalas) */}
              {spec.darkSurface && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 top-[44%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F7CE68]/35 blur-3xl transition-opacity duration-[320ms] ${
                    isCenter ? 'opacity-100' : 'opacity-65'
                  }`}
                />
              )}

              {/* Subtle Temple Arch Hairline (Traditional Podi) */}
              {cat.slug === 'traditional-podi' && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-12 top-12 bottom-28 rounded-t-full border border-[#B97A2E]/22"
                />
              )}

              {/* Top Eyebrow & Count Pill (Text transition: 210ms) */}
              <div className="relative z-20 flex items-center justify-between gap-2 transition-opacity duration-[210ms] ease-out">
                <span
                  className={`inline-flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase leading-snug tracking-[0.16em] ${spec.accentTextClass}`}
                >
                  {cat.isComingSoonOnly && (
                    <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{spec.eyebrow}</span>
                </span>

                {!cat.isEdibleCategory ? (
                  <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-amber-900 px-2.5 py-0.5 text-[10px] font-bold text-amber-50">
                    <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                    External Only
                  </span>
                ) : cat.isComingSoonOnly ? (
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-950">
                    Seasonal • WA
                  </span>
                ) : (
                  <span
                    className={`font-mono-num shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition-transform duration-[220ms] ${
                      spec.darkSurface
                        ? 'border border-white/20 bg-white/10 text-[#FBF5EC]'
                        : 'bg-white/85 text-[var(--text-primary)] shadow-xs'
                    } ${isCenter ? 'scale-100' : 'scale-95 opacity-85'}`}
                  >
                    {cat.productCount} {spec.badgeSuffix}
                  </span>
                )}
              </div>

              {/* Centre Multi-Pouch Floating Visual Composition (Product image transition: 420ms) */}
              <div className="relative z-10 my-2 flex flex-1 items-center justify-center">
                {cat.isComingSoonOnly ? (
                  <div
                    className={`flex max-w-[300px] flex-col items-center rounded-2xl border border-dashed border-[var(--brand-crimson)]/40 bg-white/80 px-6 py-6 text-center shadow-xs transition-transform duration-[350ms] ${
                      isCenter ? 'scale-100' : 'scale-95'
                    }`}
                  >
                    <span className="font-tamil text-xl font-bold text-[var(--brand-crimson)]">
                      மாங்காய் & களாக்காய் ஊறுகாய்
                    </span>
                    <span className="font-display mt-1 text-base font-bold text-[var(--text-primary)]">
                      Seasonal Madurai Pickles
                    </span>
                    <span className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      Featured on Instagram Reels. Jar photography & online pricing pending —
                      enquire directly on WhatsApp.
                    </span>
                  </div>
                ) : (
                  <div className="relative flex h-[215px] w-full items-center justify-center sm:h-[235px]">
                    {pouches[1] && (
                      <div
                        style={{
                          viewTransitionName: isCenter
                            ? `collection-pouch-1-${cat.slug}`
                            : undefined,
                        }}
                        className={`relative -mr-12 mt-8 h-[160px] w-[124px] transition-transform duration-[420ms] ease-out sm:h-[178px] sm:w-[136px] ${
                          isCenter
                            ? '-translate-x-2 -rotate-11 scale-100 group-hover:-translate-x-3.5 group-hover:-rotate-13'
                            : 'translate-x-1 -rotate-6 scale-92 opacity-85'
                        }`}
                      >
                        <PouchImage
                          src={pouches[1].src}
                          fallbackSrc={pouches[1].fallback}
                          alt={pouches[1].alt}
                          width={220}
                          height={293}
                          imgClassName={
                            spec.darkSurface ? 'pouch-float-dark' : 'pouch-float-light'
                          }
                        />
                      </div>
                    )}

                    {pouches[0] && (
                      <div
                        style={{
                          viewTransitionName: isCenter
                            ? `collection-pouch-0-${cat.slug}`
                            : undefined,
                        }}
                        className={`relative z-20 h-[205px] w-[158px] transition-transform duration-[420ms] ease-out sm:h-[228px] sm:w-[176px] ${
                          isCenter
                            ? '-translate-y-1.5 scale-[1.05] group-hover:-translate-y-3 group-hover:scale-[1.08]'
                            : 'translate-y-1 scale-95'
                        }`}
                      >
                        <PouchImage
                          src={pouches[0].src}
                          fallbackSrc={pouches[0].fallback}
                          alt={pouches[0].alt}
                          width={420}
                          height={560}
                          priority
                          imgClassName={
                            spec.darkSurface ? 'pouch-float-dark' : 'pouch-float-light'
                          }
                        />
                      </div>
                    )}

                    {pouches[2] && (
                      <div
                        style={{
                          viewTransitionName: isCenter
                            ? `collection-pouch-2-${cat.slug}`
                            : undefined,
                        }}
                        className={`relative -ml-12 mt-8 h-[160px] w-[124px] transition-transform duration-[420ms] ease-out sm:h-[178px] sm:w-[136px] ${
                          isCenter
                            ? 'translate-x-2 rotate-11 scale-100 group-hover:translate-x-3.5 group-hover:rotate-13'
                            : '-translate-x-1 rotate-6 scale-92 opacity-85'
                        }`}
                      >
                        <PouchImage
                          src={pouches[2].src}
                          fallbackSrc={pouches[2].fallback}
                          alt={pouches[2].alt}
                          width={220}
                          height={293}
                          imgClassName={
                            spec.darkSurface ? 'pouch-float-dark' : 'pouch-float-light'
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Title, Tamil Name, Description & Action Footer (Text: 210ms, Hover: 180ms) */}
              <div
                className={`relative z-20 border-t pt-3.5 transition-transform duration-[210ms] ease-out ${spec.borderDividerClass}`}
              >
                <p
                  className={`font-tamil text-xs font-bold transition-opacity duration-[200ms] ${spec.accentTextClass} ${
                    isCenter ? 'opacity-100' : 'opacity-80'
                  }`}
                >
                  {cat.tamilName}
                </p>
                <div className="mt-0.5 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      style={{
                        viewTransitionName: isCenter
                          ? `collection-title-${cat.slug}`
                          : undefined,
                      }}
                      className={`font-display line-clamp-2 text-[19px] font-bold leading-[1.15] transition-transform duration-[210ms] ease-out sm:text-[22px] ${
                        spec.darkSurface ? 'text-white' : ''
                      } ${isCenter ? 'translate-x-0' : 'opacity-90'}`}
                    >
                      {cat.name}
                    </h3>
                    <p
                      className={`mt-1 line-clamp-1 text-xs transition-opacity duration-[210ms] ${spec.subTextClass} ${
                        isCenter ? 'opacity-100' : 'opacity-75'
                      }`}
                    >
                      {spec.tagline}
                    </p>
                  </div>

                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-[180ms] ease-out ${
                      spec.darkSurface
                        ? 'bg-[#F7CE68] text-[#23130D]'
                        : 'bg-[var(--bg-deep)] text-[#FBF5EC]'
                    } ${
                      isCenter
                        ? 'scale-100 group-hover:scale-110 group-hover:bg-[var(--brand-crimson)] group-hover:text-white'
                        : 'scale-90 opacity-80'
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Active Collection Indicator Bar + Quick Direct Enter Link */}
      <div className="mx-auto mt-4 flex max-w-6xl flex-col items-center justify-center gap-3 px-4 sm:px-6">
        <div
          role="tablist"
          aria-label="Choose featured collection"
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
        >
          {categories.map((cat, idx) => {
            const active = idx === activeIndex;
            const shortLabel =
              COLLECTION_SHORT_TAB_LABELS[cat.slug] ??
              cat.name.split('&')[0]?.trim() ??
              cat.name;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active}
                aria-label={`0${idx + 1} ${cat.name}`}
                type="button"
                onClick={() => focusCollectionIndex(idx)}
                className={`inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold transition-all duration-[200ms] sm:px-3 ${
                  active
                    ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white shadow-xs'
                    : 'border-[var(--border-strong)]/70 bg-[var(--bg-surface)]/80 text-[var(--text-secondary)] hover:border-[var(--brand-crimson)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="font-mono-num text-[10px] opacity-75">0{idx + 1}</span>
                <span className={active ? 'inline' : 'hidden md:inline'}>{shortLabel}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Drag the shelf or click any side card to focus, or click{' '}
          <Link
            href={`/categories/${activeCategory.slug}`}
            onClick={(e) => navigateToCollectionConnected(activeCategory, e)}
            className="font-bold text-[var(--brand-crimson)] underline-offset-2 transition-colors duration-[180ms] hover:underline"
          >
            {activeCategory.name}
          </Link>{' '}
          to enter the collection.
        </p>
      </div>

      {/* Connected Shared-Element Transition Bridge Overlay during Navigation Launch */}
      {launchingCategory && launchingTheme && (
        <div
          aria-hidden="true"
          data-connected-portal={launchingCategory.slug}
          style={{ background: launchingTheme.stageBg }}
          className={`animate-collection-stage pointer-events-none fixed inset-x-0 top-[68px] z-50 border-b shadow-2xl ${launchingTheme.surfaceClass}`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-[0.18em] ${launchingTheme.accentTextClass}`}
              >
                {launchingTheme.eyebrow}
              </p>
              <p className={`font-tamil mt-1 text-sm font-bold ${launchingTheme.accentTextClass}`}>
                {launchingCategory.tamilName}
              </p>
              <p
                className={`font-display mt-0.5 text-2xl font-bold sm:text-4xl ${
                  launchingTheme.darkSurface ? 'text-white' : 'text-[var(--text-primary)]'
                }`}
              >
                {launchingCategory.name}
              </p>
            </div>
            <span className="font-mono-num rounded-full border border-current/25 px-3.5 py-1 text-xs font-bold">
              Opening Collection…
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
