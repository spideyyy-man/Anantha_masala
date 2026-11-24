'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Check,
  Sparkles,
  Layers,
  MessageCircle,
  Eye,
  ShieldCheck,
  Clock,
  Pause,
  Play,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { CatalogProduct } from '@/domain/catalog/service';
import { BRAND, buildWhatsAppUrl, formatPaiseToInr } from '@/data/brand';
import { getCutoutUrlFromThumb } from '@/lib/media';
import { useStore } from '@/components/providers/StoreProviders';
import { PouchImage } from '@/components/ui/PouchImage';

const SpiceAtmosphereShader = dynamic(
  () => import('@/components/motion/SpiceAtmosphereShader'),
  { ssr: false, loading: () => null }
);

interface HeroSceneDefinition {
  slug: string;
  tamilWatermark: string;
  kicker: string;
  sceneTitle: string;
  sceneLead: string;
  highlightFact: string;
  atmosphereCss: string;
  mobileBgHex: string;
  accentHex: string;
  haloTint: string;
  motif: 'ember-rings' | 'sunbeams' | 'temple-arch' | 'botanical-arcs' | 'brass-hearth';
  shaderBase: [number, number, number];
  shaderA: [number, number, number];
  shaderB: [number, number, number];
}

/**
 * Five complete, product-specific Madurai visual environments.
 * Changing slides transforms the entire atmosphere, backdrop motif, shader palette,
 * monumental Tamil calligraphy, floating packaging, and coordinated copy.
 */
const HERO_SCENES: HeroSceneDefinition[] = [
  {
    slug: 'bhai-veetu-meen-masala',
    tamilWatermark: 'பாய் வீட்டு',
    kicker: 'Madurai Signature Blend',
    sceneTitle: 'Five Kuzhambu Traditions, One Aromatic Pack.',
    sceneLead:
      'Crafted in Villapuram, Madurai for tangy Meen Kuzhambu, Puli Kuzhambu, Vathal Kuzhambu, Poondu Kuzhambu, and daily sambar.',
    highlightFact: '5 Kuzhambu uses printed on pack • 250g',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(176, 34, 30, 0.56) 0%, rgba(218, 140, 26, 0.28) 38%, #21100B 78%)',
    mobileBgHex: '#21100B',
    accentHex: '#F3C04D',
    haloTint: 'rgba(255, 240, 206, 0.78)',
    motif: 'ember-rings',
    shaderBase: [0.13, 0.06, 0.04],
    shaderA: [0.64, 0.13, 0.11],
    shaderB: [0.86, 0.56, 0.16],
  },
  {
    slug: 'idli-milagai-podi',
    tamilWatermark: 'இட்லி பொடி',
    kicker: 'Everyday Breakfast Ritual',
    sceneTitle: 'Golden Gingelly Mornings, Pure Roasted Spice.',
    sceneLead:
      'One of five distinct Madurai breakfast podis — ready to spoon beside steaming idlis and crisp roast dosa in seconds.',
    highlightFact: 'Classic Madurai Idli Milagai Podi • 100g',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(212, 88, 22, 0.55) 0%, rgba(235, 178, 52, 0.30) 40%, #261409 78%)',
    mobileBgHex: '#261409',
    accentHex: '#F7C95C',
    haloTint: 'rgba(255, 244, 212, 0.80)',
    motif: 'sunbeams',
    shaderBase: [0.15, 0.08, 0.035],
    shaderA: [0.76, 0.31, 0.09],
    shaderB: [0.92, 0.70, 0.22],
  },
  {
    slug: 'ulundhu-kali-maavu',
    tamilWatermark: 'உளுந்து களி',
    kicker: 'Eight Heirloom Tamil Grains',
    sceneTitle: 'Black Urad & Seven Heritage Rice Varieties.',
    sceneLead:
      'Karuppu Ulundhu milled with Karuppu Kavuni, Sivappu Kavuni, Mappillai Samba, Poongar, Kattuyanam, Matta, and Karunguruvai.',
    highlightFact: 'All 8 heirloom grains printed on front • 250g',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(132, 38, 62, 0.58) 0%, rgba(216, 154, 68, 0.26) 40%, #1F1016 78%)',
    mobileBgHex: '#1F1016',
    accentHex: '#F0BE73',
    haloTint: 'rgba(255, 241, 226, 0.84)',
    motif: 'temple-arch',
    shaderBase: [0.11, 0.04, 0.09],
    shaderA: [0.56, 0.12, 0.28],
    shaderB: [0.82, 0.54, 0.32],
  },
  {
    slug: 'manjal-podi',
    tamilWatermark: 'மஞ்சள் பொடி',
    kicker: 'Golden Kitchen Essential',
    sceneTitle: 'Bright Golden Turmeric for Every Single Pot.',
    sceneLead:
      'The daily foundation of South Indian sambar, rasam, poriyal, and marinades — offered in both 100g family and 50g trial pouches.',
    highlightFact: 'Available in 100g (₹60) & 50g (₹30) packs',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(232, 174, 24, 0.56) 0%, rgba(24, 96, 48, 0.46) 44%, #101D12 78%)',
    mobileBgHex: '#101D12',
    accentHex: '#F7D252',
    haloTint: 'rgba(255, 248, 214, 0.85)',
    motif: 'botanical-arcs',
    shaderBase: [0.06, 0.12, 0.07],
    shaderA: [0.14, 0.44, 0.23],
    shaderB: [0.94, 0.72, 0.12],
  },
  {
    slug: 'sambar-podi',
    tamilWatermark: 'சாம்பார் பொடி',
    kicker: 'Daily Madurai Hearth',
    sceneTitle: 'The Unmistakable Aroma of Home Sambar.',
    sceneLead:
      'Balanced for daily vegetable sambar and tiffin sambar alongside idli, pongal, and crisp dosa — packed fresh in Villapuram.',
    highlightFact: 'Everyday Madurai family staple • 250g',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(164, 42, 34, 0.56) 0%, rgba(220, 152, 48, 0.28) 40%, #24130C 78%)',
    mobileBgHex: '#24130C',
    accentHex: '#F5C45A',
    haloTint: 'rgba(255, 241, 216, 0.80)',
    motif: 'brass-hearth',
    shaderBase: [0.14, 0.075, 0.045],
    shaderA: [0.62, 0.16, 0.13],
    shaderB: [0.85, 0.58, 0.18],
  },
];

function formatShelfLifeShort(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const match = raw.match(/(\d+\s*Months?)/i);
  return match ? `Best Before ${match[1]}` : raw;
}

function SceneBackdropMotif({ motif, accentHex }: { motif: HeroSceneDefinition['motif']; accentHex: string }) {
  if (motif === 'temple-arch') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 420 480"
        className="pointer-events-none absolute h-[430px] w-[380px] opacity-35 transition-opacity duration-500"
      >
        <path
          d="M40 460 V190 C40 90 120 26 210 26 C300 26 380 90 380 190 V460"
          fill="none"
          stroke={accentHex}
          strokeWidth="1.25"
        />
        <path
          d="M62 460 V196 C62 110 132 50 210 50 C288 50 358 110 358 196 V460"
          fill="none"
          stroke={accentHex}
          strokeWidth="0.75"
          strokeDasharray="4 6"
        />
      </svg>
    );
  }
  if (motif === 'sunbeams') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 440 440"
        className="pointer-events-none absolute h-[440px] w-[440px] opacity-30"
      >
        <circle cx="220" cy="220" r="190" fill="none" stroke={accentHex} strokeWidth="1" strokeDasharray="3 9" />
        <circle cx="220" cy="220" r="154" fill="none" stroke={accentHex} strokeWidth="0.8" />
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <line
            key={deg}
            x1="220"
            y1="14"
            x2="220"
            y2="426"
            stroke={accentHex}
            strokeWidth="0.5"
            opacity="0.35"
            transform={`rotate(${deg} 220 220)`}
          />
        ))}
      </svg>
    );
  }
  if (motif === 'botanical-arcs') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 440 440"
        className="pointer-events-none absolute h-[430px] w-[430px] opacity-35"
      >
        <ellipse cx="220" cy="220" rx="188" ry="140" transform="rotate(-22 220 220)" fill="none" stroke={accentHex} strokeWidth="1.1" />
        <ellipse cx="220" cy="220" rx="188" ry="140" transform="rotate(22 220 220)" fill="none" stroke="#6BD48E" strokeWidth="0.9" strokeDasharray="6 6" />
      </svg>
    );
  }
  if (motif === 'brass-hearth') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 440 440"
        className="pointer-events-none absolute h-[430px] w-[430px] opacity-35"
      >
        <rect x="75" y="75" width="290" height="290" rx="36" transform="rotate(45 220 220)" fill="none" stroke={accentHex} strokeWidth="1" />
        <circle cx="220" cy="220" r="198" fill="none" stroke={accentHex} strokeWidth="0.8" strokeDasharray="2 7" />
      </svg>
    );
  }
  // ember-rings default
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 440 440"
      className="pointer-events-none absolute h-[430px] w-[430px] opacity-35"
    >
      <circle cx="220" cy="220" r="196" fill="none" stroke={accentHex} strokeWidth="1.2" />
      <circle cx="220" cy="220" r="168" fill="none" stroke={accentHex} strokeWidth="0.7" strokeDasharray="5 7" />
      <circle cx="220" cy="220" r="214" fill="none" stroke={accentHex} strokeWidth="0.5" opacity="0.45" />
    </svg>
  );
}

interface CinematicHeroStageProps {
  products: CatalogProduct[];
}

export function CinematicHeroStage({ products }: CinematicHeroStageProps) {
  const { addToCart, trackEvent } = useStore();
  const stageRef = useRef<HTMLElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [transitionKey, setTransitionKey] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isPausedInteraction, setIsPausedInteraction] = useState(false);

  const [desktopCapable, setDesktopCapable] = useState(false);
  const [shaderEnabled, setShaderEnabled] = useState(false);
  const [shaderStatus, setShaderStatus] = useState<'idle' | 'active' | 'fallback' | 'context-lost'>('idle');
  const [adding, setAdding] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });

  // Touch swipe tracking for mobile & tablet
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end start'],
  });
  const watermarkY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const pouchY = useTransform(scrollYProgress, [0, 1], [0, -38]);
  const pouchScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  const featuredSlots = useMemo(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return HERO_SCENES.map((scene) => ({
      scene,
      product: bySlug.get(scene.slug) ?? products[0]!,
    })).filter((item) => Boolean(item.product));
  }, [products]);

  const totalSlides = featuredSlots.length;

  const goToSlide = useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      if (totalSlides === 0) return;
      const normalized = ((nextIndex % totalSlides) + totalSlides) % totalSlides;
      setDirection(dir);
      setActiveIdx(normalized);
      setTransitionKey((k) => k + 1);
      setAddedFlash(false);
    },
    [totalSlides]
  );

  const handleNext = useCallback(() => {
    goToSlide(activeIdx + 1, 1);
  }, [activeIdx, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(activeIdx - 1, -1);
  }, [activeIdx, goToSlide]);

  // Capability detection & reduced-motion auto-play guard
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setAutoPlay(false);
    }
    if (isDesktop && !reduced) {
      setDesktopCapable(true);
      const t = window.setTimeout(() => setShaderEnabled(true), 220);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, []);

  // Gentle auto-progression (pauses on hover, focus, hidden tab, or reduced motion)
  useEffect(() => {
    if (!autoPlay || isPausedInteraction || totalSlides <= 1) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setDirection(1);
        setActiveIdx((prev) => (prev + 1) % totalSlides);
        setTransitionKey((k) => k + 1);
      }
    }, 6800);
    return () => window.clearInterval(timer);
  }, [autoPlay, isPausedInteraction, totalSlides]);

  // Keyboard arrow navigation when hero is focused
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!desktopCapable || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    setTilt({
      rx: -ny * 8.5,
      ry: nx * 10.5,
      tx: nx * 14,
      ty: ny * 8,
    });
  };

  const handlePointerLeave = () => {
    setIsPausedInteraction(false);
    setTilt({ rx: 0, ry: 0, tx: 0, ty: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    const touch = e.changedTouches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  const currentSlot = featuredSlots[activeIdx] ?? featuredSlots[0];
  if (!currentSlot) return null;

  const { scene, product } = currentSlot;
  const activeVariant = product.variants[0];
  const shelfLifeText = formatShelfLifeShort(activeVariant?.bestBeforePrinted);
  const fallbackOriginal =
    product.images[0]?.largeUrl || '/images/products/bhai-veetu-meen-masala-7-960.webp';
  const cutoutLarge = getCutoutUrlFromThumb(fallbackOriginal, '720');

  const handleQuickAdd = async () => {
    if (!activeVariant || !activeVariant.isOrderableOnline || adding) return;
    setAdding(true);
    const ok = await addToCart(activeVariant.id, 1, product.slug);
    setAdding(false);
    if (ok) {
      setAddedFlash(true);
      setTimeout(() => setAddedFlash(false), 1500);
    }
  };

  const enterAnimClass = direction === 1 ? 'animate-hero-from-right' : 'animate-hero-from-left';

  return (
    <section
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Madurai Aanandha Masala scenes"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPausedInteraction(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => setIsPausedInteraction(true)}
      onBlurCapture={() => setIsPausedInteraction(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ backgroundColor: scene.mobileBgHex }}
      className="relative flex min-h-[92svh] flex-col justify-between overflow-hidden pt-[70px] text-[#FBF5EC] transition-colors duration-700 focus:outline-none lg:min-h-[100svh] lg:pt-[78px]"
    >
      {/* Cross-fading full-scene atmospheric backdrop layers (smooth CSS opacity swap on every slide!) */}
      {featuredSlots.map((slot, idx) => (
        <div
          key={slot.scene.slug}
          aria-hidden="true"
          style={{ background: slot.scene.atmosphereCss }}
          className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 ease-out ${
            idx === activeIdx ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Plane 0: Desktop GLSL Organic Spice-Atmosphere Shader (uniforms smoothly lerp between scenes) */}
      {desktopCapable && shaderEnabled && (
        <SpiceAtmosphereShader
          enabled={shaderEnabled}
          colorBase={scene.shaderBase}
          colorA={scene.shaderA}
          colorB={scene.shaderB}
          onStatusChange={setShaderStatus}
        />
      )}

      {/* Readability Scrim Behind Left Editorial Column (Guarantees high contrast on all 5 scenes) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#170C07]/82 via-[#1D0F09]/60 to-[#190D08]/85 lg:bg-gradient-to-r lg:from-[#170C07]/86 lg:via-[#1D0F09]/52 lg:to-transparent"
      />

      {/* Subtle Brass Architectural Grid */}
      <div
        aria-hidden="true"
        className="bg-brass-lattice pointer-events-none absolute inset-0 z-[1] opacity-30"
      />

      {/* Plane 1 (Paper-Cut Depth): Giant Monumental Tamil Calligraphy Behind Packaging (strict 7.5% whispered opacity on outer wrapper) */}
      <motion.div
        aria-hidden="true"
        style={{ y: watermarkY }}
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[2] -translate-y-1/2 select-none overflow-hidden text-center opacity-[0.075]"
      >
        <p
          key={`wm-${scene.slug}-${transitionKey}`}
          className="animate-hero-copy font-tamil whitespace-nowrap text-[22vw] font-bold leading-none tracking-tight text-[#F6D592] lg:text-[14vw]"
        >
          {scene.tamilWatermark}
        </p>
      </motion.div>

      {/* Prominent Desktop Flanking Previous / Next Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous featured product"
        className="group absolute left-4 top-1/2 z-30 hidden h-13 w-13 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-[#FBF5EC] shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-[#F7CE68] hover:bg-[#F7CE68] hover:text-[#1D0F09] active:scale-95 xl:left-7 lg:flex"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next featured product"
        className="group absolute right-4 top-1/2 z-30 hidden h-13 w-13 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-[#FBF5EC] shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-[#F7CE68] hover:bg-[#F7CE68] hover:text-[#1D0F09] active:scale-95 xl:right-7 lg:flex"
      >
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>

      {/* Main Content Stage */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-4 sm:px-6 lg:px-16 lg:py-8">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Editorial Column — Coordinated Sequence Per Product Scene */}
          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3.5 py-1 text-[11px] font-bold tracking-wide backdrop-blur-sm">
                <span
                  className="h-2 w-2 rounded-full transition-colors duration-500"
                  style={{ backgroundColor: scene.accentHex }}
                />
                <span className="text-[#F6D592]">VILLAPURAM, MADURAI</span>
                <span aria-hidden="true" className="opacity-35">|</span>
                <span style={{ color: scene.accentHex }}>{scene.kicker}</span>
              </div>

              {/* Mobile / Tablet Prominent Arrow Controls + Slide Counter */}
              <div className="flex items-center gap-1.5 lg:hidden">
                <span className="font-mono-num mr-1 text-xs font-bold text-[#F6D592]">
                  0{activeIdx + 1} / 0{totalSlides}
                </span>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous featured product"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next featured product"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white active:scale-95"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div key={`copy-${scene.slug}-${transitionKey}`} className="animate-hero-copy">
              <h1
                id="hero-heading"
                className="font-display mt-3.5 text-[2.2rem] font-bold leading-[1.04] tracking-tight text-[#FFF9F0] sm:text-5xl lg:mt-4 lg:text-[4.15rem]"
              >
                Tradition,{' '}
                <span
                  style={{ color: scene.accentHex }}
                  className="transition-colors duration-500 lg:block"
                >
                  in Motion.
                </span>
              </h1>

              <p className="mt-2.5 font-display text-base font-semibold text-[#F8E7CE] sm:text-lg">
                {scene.sceneTitle}
              </p>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-[#DFCEBA] sm:text-[15px]">
                {scene.sceneLead}
              </p>
            </div>

            {/* Mobile-only Contained Floating Pouch Stage (Large, crisp, swipeable) */}
            <div className="relative my-4 flex h-[238px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/12 bg-black/25 lg:hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-44 w-44 rounded-full opacity-65 blur-2xl transition-colors duration-500"
                style={{
                  background: `radial-gradient(circle, ${scene.haloTint} 0%, ${scene.accentHex} 52%, transparent 76%)`,
                }}
              />
              <div
                key={`mob-pouch-${product.slug}-${transitionKey}`}
                className={`${enterAnimClass} relative z-10 h-[216px] w-[190px]`}
              >
                <Link href={`/products/${product.slug}`} aria-label={`Inspect ${product.name}`} className="block h-full w-full">
                  <PouchImage
                    src={cutoutLarge}
                    fallbackSrc={fallbackOriginal}
                    alt={`${product.name} (${product.tamilName})`}
                    width={420}
                    height={560}
                    priority
                    imgClassName="pouch-float-dark"
                  />
                </Link>
              </div>
            </div>

            {/* Active Spotlight Pack Cardette — Real DB Price, Pack Size, Shelf Life & Actions */}
            <div className="mt-4 rounded-2xl border border-white/15 bg-black/42 p-4 backdrop-blur-md sm:max-w-lg lg:mt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-tamil text-xs font-semibold" style={{ color: scene.accentHex }}>
                    {product.tamilName}
                  </p>
                  <p className="font-display text-lg font-bold text-white sm:text-xl">
                    {product.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#D9C7B0]">
                    <span>{scene.highlightFact}</span>
                    {shelfLifeText && (
                      <span className="inline-flex items-center gap-1 text-[#F6D592]">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {shelfLifeText}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono-num text-2xl font-bold" style={{ color: scene.accentHex }}>
                    {formatPaiseToInr(activeVariant?.pricePaise)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#CAB69E]">
                    {activeVariant?.label}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={adding}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-crimson)] px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#b51e22] active:scale-[0.98] disabled:opacity-60"
                >
                  {addedFlash ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                      {adding ? 'Adding...' : 'Quick Add Pack'}
                    </>
                  )}
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Inspect
                </Link>
              </div>
            </div>

            {/* Primary Storefront CTAs */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#F7CE68] px-6 text-sm font-bold text-[#23130D] shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#fce096]"
              >
                Explore Full Pantry
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={buildWhatsAppUrl(
                  `Hello ${BRAND.fullName}, I am exploring your website and would like to enquire about ${product.name}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ eventName: 'whatsapp_click', path: '/', productSlug: product.slug })}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 text-sm font-semibold text-[#FBF5EC] hover:bg-white/20"
              >
                <MessageCircle className="h-4 w-4 text-[#7EE0A1]" aria-hidden="true" />
                WhatsApp
              </a>
            </div>

            <p className="mt-3.5 flex items-center gap-1.5 text-[11px] text-[#CEBCA6]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#7EE0A1]" aria-hidden="true" />
              <span>
                100% genuine pouches • Printed FSSAI: {BRAND.printedFssaiNumber} • Guest checkout + WhatsApp
              </span>
            </p>
          </div>

          {/* Desktop Heroic Floating Pouch Theatre — Large, Unmistakable, Scene-Matched Atmosphere */}
          <div className="hidden flex-col items-center justify-center lg:col-span-6 lg:flex">
            <motion.div
              style={{ y: pouchY, scale: pouchScale }}
              className="relative flex h-[520px] w-full max-w-[480px] items-center justify-center"
            >
              {/* Luminous Warm Sunlit Halo Directly Behind Pouch */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-[360px] w-[360px] rounded-full opacity-80 blur-3xl transition-all duration-700"
                style={{
                  background: `radial-gradient(circle, ${scene.haloTint} 0%, ${scene.accentHex} 52%, transparent 76%)`,
                }}
              />

              {/* Product-Specific Architectural Backdrop Motif */}
              <SceneBackdropMotif motif={scene.motif} accentHex={scene.accentHex} />

              {/* Large Real Floating Cutout Pouch with Direction-Aware Interruptible Transition */}
              <div
                key={`desk-pouch-${product.slug}-${transitionKey}`}
                className={`${enterAnimClass} relative z-10 h-[465px] w-[375px]`}
              >
                <div
                  className="animate-pouch-breathe relative h-full w-full transition-transform duration-200 ease-out will-change-transform"
                  style={{
                    transform: desktopCapable
                      ? `perspective(1100px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) translate3d(${tilt.tx.toFixed(1)}px, ${tilt.ty.toFixed(1)}px, 0)`
                      : undefined,
                  }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    aria-label={`Inspect ${product.name}`}
                    className="block h-full w-full"
                  >
                    <PouchImage
                      src={cutoutLarge}
                      fallbackSrc={fallbackOriginal}
                      alt={`${product.name} (${product.tamilName}) — genuine Madurai Aanandha Masala pouch`}
                      width={720}
                      height={960}
                      priority
                      imgClassName="pouch-float-dark"
                    />
                  </Link>
                </div>
              </div>

              {/* Grounded Studio Contact Shadow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 h-8 w-68 rounded-full bg-black/70 blur-xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Carousel Indicator Dock + Prev/Next + Auto-Play Controls */}
      <div className="relative z-20 border-t border-white/12 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 overflow-x-auto pb-0.5">
            {/* Desktop Inline Slide Counter */}
            <div className="hidden shrink-0 items-center gap-1.5 border-r border-white/15 pr-3 lg:flex">
              <span className="font-mono-num text-sm font-bold text-[#F7CE68]">
                0{activeIdx + 1}
              </span>
              <span className="font-mono-num text-xs text-white/45">/ 0{totalSlides}</span>
            </div>

            <div
              role="tablist"
              aria-label="Choose featured product scene"
              className="snap-rail gap-2"
            >
              {featuredSlots.map((slot, idx) => {
                const isSelected = idx === activeIdx;
                const fallbackThumb = slot.product.images[0]?.thumbUrl || '';
                const miniCutout = getCutoutUrlFromThumb(fallbackThumb, '420');
                const primaryPrice = slot.product.variants[0]?.pricePaise ?? slot.product.minPricePaise;
                return (
                  <button
                    key={slot.scene.slug}
                    role="tab"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => goToSlide(idx, idx >= activeIdx ? 1 : -1)}
                    className={`snap-rail-item group flex min-h-[52px] items-center gap-2 rounded-2xl border px-3 py-1.5 text-left transition-all ${
                      isSelected
                        ? 'border-[#F7CE68] bg-white/18 text-white shadow-md'
                        : 'border-white/12 bg-white/[0.05] text-[#E3D3BE] hover:border-white/35 hover:bg-white/12'
                    }`}
                  >
                    <span className="h-9 w-7 shrink-0">
                      <PouchImage
                        src={miniCutout}
                        fallbackSrc={fallbackThumb}
                        alt=""
                        width={56}
                        height={75}
                        priority
                        imgClassName={`transition-transform duration-300 ${
                          isSelected ? '-translate-y-0.5 scale-110' : 'opacity-90 group-hover:scale-105'
                        }`}
                      />
                    </span>
                    <span className="pr-1">
                      <span className="block max-w-[120px] truncate text-xs font-bold leading-tight text-white">
                        {slot.product.name}
                      </span>
                      <span className="font-mono-num block text-[11px] font-semibold text-[#F7CE68]">
                        {formatPaiseToInr(primaryPrice)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              aria-pressed={!autoPlay}
              aria-label={autoPlay ? 'Pause hero auto-slide' : 'Resume hero auto-slide'}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-[11px] font-semibold text-[#FBF5EC] hover:border-[#F7CE68]"
            >
              {autoPlay ? (
                <>
                  <Pause className="h-3 w-3 text-[#F7CE68]" aria-hidden="true" />
                  Auto
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-[#F7CE68]" aria-hidden="true" />
                  Manual
                </>
              )}
            </button>
            {desktopCapable && (
              <button
                type="button"
                onClick={() => setShaderEnabled((v) => !v)}
                aria-pressed={shaderEnabled}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-[11px] font-semibold text-[#FBF5EC] hover:border-[#F7CE68]"
              >
                {shaderEnabled ? (
                  <Sparkles className="h-3.5 w-3.5 text-[#F7CE68]" aria-hidden="true" />
                ) : (
                  <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {shaderEnabled
                    ? shaderStatus === 'context-lost'
                      ? '2.5D Fallback'
                      : 'Atmosphere: Live'
                    : 'Atmosphere: Static'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
