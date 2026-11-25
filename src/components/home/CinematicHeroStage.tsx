'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Check,
  MessageCircle,
  Eye,
  ShieldCheck,
  Clock,
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
  englishBackdropWord: string;
  kicker: string;
  sceneTitle: string;
  sceneLead: string;
  highlightFact: string;
  dishPreviewImage: string;
  dishPairingLabel: string;
  recipeAnchor: string;
  ctaLabel: string;
  atmosphereCss: string;
  mobileBgHex: string;
  accentHex: string;
  haloTint: string;
  motif: 'ember-rings' | 'sunbeams' | 'temple-arch' | 'botanical-arcs' | 'brass-hearth';
  shaderBase: [number, number, number];
  shaderA: [number, number, number];
  shaderB: [number, number, number];
}

const SCENE_TRANSITION_MS = 1350;
const AUTOPLAY_INTERVAL_MS = 2500;

/**
 * Five complete, product-specific Madurai visual scenes.
 * Every slide transforms product, headline, Tamil subtitle, description, dish pairing,
 * price, CTA, background typography, decorative motif, and atmospheric lighting together.
 */
const HERO_SCENES: HeroSceneDefinition[] = [
  {
    slug: 'bhai-veetu-meen-masala',
    tamilWatermark: 'பாய் வீட்டு',
    englishBackdropWord: 'MEEN MASALA',
    kicker: 'Madurai Signature Blend',
    sceneTitle: 'Five Kuzhambu Traditions, One Aromatic Pack.',
    sceneLead:
      'Crafted in Villapuram, Madurai for tangy Meen Kuzhambu, Puli Kuzhambu, Vathal Kuzhambu, Poondu Kuzhambu, and daily sambar.',
    highlightFact: '5 Kuzhambu uses printed on pack • 250g',
    dishPreviewImage: '/images/kitchen/madurai-meen-kuzhambu.webp',
    dishPairingLabel: 'Cooks: Earthen-Chatti Meen & Puli Kuzhambu',
    recipeAnchor: 'madurai-bhai-veetu-kuzhambu',
    ctaLabel: 'Explore Meen Masala',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(180, 34, 30, 0.58) 0%, rgba(220, 140, 24, 0.30) 38%, #21100B 78%)',
    mobileBgHex: '#21100B',
    accentHex: '#F4C453',
    haloTint: 'rgba(255, 240, 206, 0.80)',
    motif: 'ember-rings',
    shaderBase: [0.13, 0.06, 0.04],
    shaderA: [0.64, 0.13, 0.11],
    shaderB: [0.86, 0.56, 0.16],
  },
  {
    slug: 'idli-milagai-podi',
    tamilWatermark: 'இட்லி பொடி',
    englishBackdropWord: 'MILAGAI PODI',
    kicker: 'Everyday Breakfast Ritual',
    sceneTitle: 'Golden Gingelly Mornings, Pure Roasted Spice.',
    sceneLead:
      'One of five distinct Madurai breakfast podis — ready to spoon beside steaming idlis and crisp roast dosa in seconds.',
    highlightFact: 'Classic Madurai Idli Milagai Podi • 100g',
    dishPreviewImage: '/images/kitchen/idli-podi-tiffin.webp',
    dishPairingLabel: 'Pairs with: Steaming Idlis & Crisp Ghee Roast',
    recipeAnchor: 'idli-podi-tasting-flight',
    ctaLabel: 'Explore Idli Podi',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(216, 88, 22, 0.58) 0%, rgba(238, 180, 52, 0.32) 40%, #261409 78%)',
    mobileBgHex: '#261409',
    accentHex: '#F9CE63',
    haloTint: 'rgba(255, 244, 212, 0.82)',
    motif: 'sunbeams',
    shaderBase: [0.15, 0.08, 0.035],
    shaderA: [0.76, 0.31, 0.09],
    shaderB: [0.92, 0.70, 0.22],
  },
  {
    slug: 'ulundhu-kali-maavu',
    tamilWatermark: 'உளுந்து களி',
    englishBackdropWord: 'EIGHT GRAINS',
    kicker: 'Eight Heirloom Tamil Grains',
    sceneTitle: 'Black Urad & Seven Heritage Rice Varieties.',
    sceneLead:
      'Karuppu Ulundhu milled with Karuppu Kavuni, Sivappu Kavuni, Mappillai Samba, Poongar, Kattuyanam, Matta, and Karunguruvai.',
    highlightFact: 'All 8 heirloom grains printed on front • 250g',
    dishPreviewImage: '/images/kitchen/ulundhu-kali.webp',
    dishPairingLabel: 'Cooks: Warm Karuppu Ulundhu Kali & Kanji',
    recipeAnchor: 'heritage-grain-ulundhu-kali',
    ctaLabel: 'Explore Ulundhu Kali',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(142, 36, 66, 0.62) 0%, rgba(218, 154, 72, 0.28) 40%, #1E0E15 78%)',
    mobileBgHex: '#1E0E15',
    accentHex: '#F2C37B',
    haloTint: 'rgba(255, 241, 226, 0.86)',
    motif: 'temple-arch',
    shaderBase: [0.11, 0.04, 0.09],
    shaderA: [0.56, 0.12, 0.28],
    shaderB: [0.82, 0.54, 0.32],
  },
  {
    slug: 'manjal-podi',
    tamilWatermark: 'மஞ்சள் பொடி',
    englishBackdropWord: 'TURMERIC GOLD',
    kicker: 'Golden Kitchen Essential',
    sceneTitle: 'Bright Golden Turmeric for Every Single Pot.',
    sceneLead:
      'The daily foundation of South Indian sambar, rasam, poriyal, and marinades — offered in both 100g family and 50g trial pouches.',
    highlightFact: 'Available in 100g (₹60) & 50g (₹30) packs',
    dishPreviewImage: '/images/kitchen/sambar-rasam-thali.webp',
    dishPairingLabel: 'Essential for: Daily Sambar, Rasam &Marinades',
    recipeAnchor: 'everyday-sambar-rasam-lunch',
    ctaLabel: 'Explore Manjal Podi',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(232, 174, 24, 0.58) 0%, rgba(24, 102, 50, 0.48) 44%, #101D12 78%)',
    mobileBgHex: '#101D12',
    accentHex: '#F9D658',
    haloTint: 'rgba(255, 248, 214, 0.86)',
    motif: 'botanical-arcs',
    shaderBase: [0.06, 0.12, 0.07],
    shaderA: [0.14, 0.44, 0.23],
    shaderB: [0.94, 0.72, 0.12],
  },
  {
    slug: 'sambar-podi',
    tamilWatermark: 'சாம்பார் பொடி',
    englishBackdropWord: 'MADURAI SAMBAR',
    kicker: 'Daily Madurai Hearth',
    sceneTitle: 'The Unmistakable Aroma of Home Sambar.',
    sceneLead:
      'Balanced for daily vegetable sambar and tiffin sambar alongside idli, pongal, and crisp dosa — packed fresh in Villapuram.',
    highlightFact: 'Everyday Madurai family staple • 250g',
    dishPreviewImage: '/images/kitchen/sambar-rasam-thali.webp',
    dishPairingLabel: 'Cooks: Homestyle Madurai Sambar & Tiffin Sambar',
    recipeAnchor: 'everyday-sambar-rasam-lunch',
    ctaLabel: 'Explore Sambar Podi',
    atmosphereCss:
      'radial-gradient(circle at 72% 46%, rgba(168, 42, 34, 0.58) 0%, rgba(224, 154, 48, 0.30) 40%, #24130C 78%)',
    mobileBgHex: '#24130C',
    accentHex: '#F7C960',
    haloTint: 'rgba(255, 241, 216, 0.82)',
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

function SceneBackdropMotif({
  motif,
  accentHex,
  className = '',
}: {
  motif: HeroSceneDefinition['motif'];
  accentHex: string;
  className?: string;
}) {
  if (motif === 'temple-arch') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 420 480"
        className={`pointer-events-none absolute h-[440px] w-[390px] ${className}`}
      >
        <path
          d="M40 460 V190 C40 90 120 26 210 26 C300 26 380 90 380 190 V460"
          fill="none"
          stroke={accentHex}
          strokeWidth="1.4"
        />
        <path
          d="M62 460 V196 C62 110 132 50 210 50 C288 50 358 110 358 196 V460"
          fill="none"
          stroke={accentHex}
          strokeWidth="0.85"
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
        className={`pointer-events-none absolute h-[450px] w-[450px] ${className}`}
      >
        <circle cx="220" cy="220" r="192" fill="none" stroke={accentHex} strokeWidth="1.15" strokeDasharray="3 9" />
        <circle cx="220" cy="220" r="154" fill="none" stroke={accentHex} strokeWidth="0.85" />
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <line
            key={deg}
            x1="220"
            y1="14"
            x2="220"
            y2="426"
            stroke={accentHex}
            strokeWidth="0.6"
            opacity="0.4"
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
        className={`pointer-events-none absolute h-[440px] w-[440px] ${className}`}
      >
        <ellipse cx="220" cy="220" rx="190" ry="140" transform="rotate(-22 220 220)" fill="none" stroke={accentHex} strokeWidth="1.25" />
        <ellipse cx="220" cy="220" rx="190" ry="140" transform="rotate(22 220 220)" fill="none" stroke="#7AE89E" strokeWidth="1.0" strokeDasharray="6 6" />
      </svg>
    );
  }
  if (motif === 'brass-hearth') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 440 440"
        className={`pointer-events-none absolute h-[440px] w-[440px] ${className}`}
      >
        <rect x="75" y="75" width="290" height="290" rx="36" transform="rotate(45 220 220)" fill="none" stroke={accentHex} strokeWidth="1.15" />
        <circle cx="220" cy="220" r="200" fill="none" stroke={accentHex} strokeWidth="0.9" strokeDasharray="2 7" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 440 440"
      className={`pointer-events-none absolute h-[440px] w-[440px] ${className}`}
    >
      <circle cx="220" cy="220" r="196" fill="none" stroke={accentHex} strokeWidth="1.3" />
      <circle cx="220" cy="220" r="168" fill="none" stroke={accentHex} strokeWidth="0.8" strokeDasharray="5 7" />
      <circle cx="220" cy="220" r="214" fill="none" stroke={accentHex} strokeWidth="0.55" opacity="0.5" />
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
  const [outgoingIdx, setOutgoingIdx] = useState<number | null>(null);
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

  const outgoingTimerRef = useRef<number | null>(null);
  const activeIdxRef = useRef(0);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end start'],
  });
  const watermarkY = useTransform(scrollYProgress, [0, 1], [0, 82]);
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

  // Pure batched dual-layer interruptible scene switcher: outgoing scene glides out while incoming glides in over 1.35s
  const goToSlide = useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      if (totalSlides === 0) return;
      const current = activeIdxRef.current;
      const normalized = ((nextIndex % totalSlides) + totalSlides) % totalSlides;
      if (normalized === current) return;

      activeIdxRef.current = normalized;
      setOutgoingIdx(current);
      setActiveIdx(normalized);
      setDirection(dir);
      setTransitionKey((k) => k + 1);
      setAddedFlash(false);

      if (outgoingTimerRef.current) {
        window.clearTimeout(outgoingTimerRef.current);
      }
      outgoingTimerRef.current = window.setTimeout(() => {
        setOutgoingIdx(null);
        outgoingTimerRef.current = null;
      }, SCENE_TRANSITION_MS);
    },
    [totalSlides]
  );

  useEffect(() => {
    return () => {
      if (outgoingTimerRef.current) window.clearTimeout(outgoingTimerRef.current);
    };
  }, []);

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
      const t = window.setTimeout(() => setShaderEnabled(true), 200);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, []);

  // Autoplay interval (2.5s) that resets cleanly after every manual interaction
  useEffect(() => {
    if (!autoPlay || isPausedInteraction || totalSlides <= 1) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden) {
        goToSlide(activeIdx + 1, 1);
      }
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [autoPlay, isPausedInteraction, totalSlides, activeIdx, transitionKey, goToSlide]);

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
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  const currentSlot = featuredSlots[activeIdx] ?? featuredSlots[0];
  const outgoingSlot = outgoingIdx !== null ? featuredSlots[outgoingIdx] ?? null : null;
  if (!currentSlot) return null;

  const { scene, product } = currentSlot;
  const activeVariant = product.variants[0];
  const shelfLifeText = formatShelfLifeShort(activeVariant?.bestBeforePrinted);
  const fallbackOriginal =
    product.images[0]?.largeUrl || '/images/products/bhai-veetu-meen-masala-7-960.webp';
  const cutoutLarge = getCutoutUrlFromThumb(fallbackOriginal, '720');

  const outFallback =
    outgoingSlot?.product.images[0]?.largeUrl || '/images/products/bhai-veetu-meen-masala-7-960.webp';
  const outCutout = outgoingSlot ? getCutoutUrlFromThumb(outFallback, '720') : '';

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

  const hasTransitioned = transitionKey > 0;
  const pouchEnterClass = hasTransitioned
    ? direction === 1
      ? 'animate-hero-pouch-enter-next'
      : 'animate-hero-pouch-enter-prev'
    : '';
  const pouchExitClass =
    direction === 1 ? 'animate-hero-pouch-exit-next' : 'animate-hero-pouch-exit-prev';

  const wmEnterClass = hasTransitioned
    ? direction === 1
      ? 'animate-hero-wm-enter-next'
      : 'animate-hero-wm-enter-prev'
    : '';
  const wmExitClass =
    direction === 1 ? 'animate-hero-wm-exit-next' : 'animate-hero-wm-exit-prev';

  const textEnterClass = hasTransitioned ? 'animate-hero-text-enter' : '';

  return (
    <section
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Madurai Aanandha Masala scenes"
      data-hero-active-slide={activeIdx + 1}
      data-hero-active-slug={product.slug}
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
      className="relative flex min-h-[92svh] flex-col justify-between overflow-hidden pt-[70px] text-[#FBF5EC] transition-colors duration-[1400ms] ease-in-out focus:outline-none lg:min-h-[100svh] lg:pt-[78px]"
    >
      {/* Cross-fading full-scene atmospheric backdrop layers (slow 1.4s cinematic wash) */}
      {featuredSlots.map((slot, idx) => (
        <div
          key={slot.scene.slug}
          aria-hidden="true"
          style={{ background: slot.scene.atmosphereCss }}
          className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-[1400ms] ease-in-out ${
            idx === activeIdx ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Plane 0: Desktop GLSL Organic Spice-Atmosphere Shader */}
      {desktopCapable && shaderEnabled && (
        <SpiceAtmosphereShader
          enabled={shaderEnabled}
          colorBase={scene.shaderBase}
          colorA={scene.shaderA}
          colorB={scene.shaderB}
          onStatusChange={setShaderStatus}
        />
      )}

      {/* Protective Readability Scrim Strictly Behind Left Editorial Column */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#170C07]/88 via-[#1D0F09]/62 to-[#190D08]/90 lg:bg-gradient-to-r lg:from-[#140A06]/92 lg:via-[#1A0D08]/68 lg:to-transparent"
      />

      {/* Restrained Brass Architectural Grid (Reduced overlay intensity for cleaner focus) */}
      <div
        aria-hidden="true"
        className="bg-brass-lattice pointer-events-none absolute inset-0 z-[1] opacity-15"
      />

      {/* Plane 1 (Intentional Architectural Background Typography — whisper-quiet behind copy, sculptural behind pouch) */}
      <motion.div
        aria-hidden="true"
        style={{ y: watermarkY }}
        data-hero-backdrop-typography="true"
        className="pointer-events-none absolute inset-x-0 top-[49%] z-[2] -translate-y-1/2 select-none overflow-hidden lg:top-[44%] lg:[mask-image:linear-gradient(to_right,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0.14)_40%,rgba(0,0,0,0.94)_62%,rgba(0,0,0,0.9)_100%)]"
      >
        {/* Outgoing decorative background typography */}
        {outgoingSlot && (
          <div
            key={`wm-out-${outgoingSlot.scene.slug}-${transitionKey}`}
            className={`${wmExitClass} absolute inset-0 flex flex-col items-center justify-center px-3 text-center lg:items-end lg:pr-10 lg:text-right`}
          >
            <p
              className="font-tamil whitespace-nowrap text-[13.5vw] font-bold leading-[0.98] tracking-[0.02em] sm:text-[11.5vw] lg:text-[10vw]"
              style={{ color: outgoingSlot.scene.accentHex, opacity: 0.27 }}
            >
              {outgoingSlot.scene.tamilWatermark}
            </p>
            <p
              className="font-display mt-1 whitespace-nowrap text-[6.4vw] font-bold uppercase tracking-[0.22em] sm:text-[5.2vw] lg:text-[4.1vw]"
              style={{
                color: 'transparent',
                WebkitTextStroke: `1.4px ${outgoingSlot.scene.accentHex}`,
                opacity: 0.34,
              }}
            >
              {outgoingSlot.scene.englishBackdropWord}
            </p>
          </div>
        )}

        {/* Incoming active decorative background typography — unclipped, balanced & sculpted behind pouch */}
        <div
          key={`wm-in-${scene.slug}-${transitionKey}`}
          className={`${wmEnterClass} flex flex-col items-center justify-center px-3 text-center lg:items-end lg:pr-10 lg:text-right`}
        >
          <p
            className="font-tamil whitespace-nowrap text-[13.5vw] font-bold leading-[0.98] tracking-[0.02em] drop-shadow-[0_4px_26px_rgba(0,0,0,0.42)] sm:text-[11.5vw] lg:text-[10vw]"
            style={{ color: scene.accentHex, opacity: 0.27 }}
          >
            {scene.tamilWatermark}
          </p>
          <p
            className="font-display mt-1 whitespace-nowrap text-[6.4vw] font-bold uppercase tracking-[0.22em] sm:text-[5.2vw] lg:text-[4.1vw]"
            style={{
              color: 'transparent',
              WebkitTextStroke: `1.4px ${scene.accentHex}`,
              opacity: 0.34,
            }}
          >
            {scene.englishBackdropWord}
          </p>
        </div>
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
          {/* Left Editorial Column — 100% Synchronized Scene Narrative, Product Name, Description, Price & CTA */}
          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                key={`kicker-${scene.slug}-${transitionKey}`}
                className={`${textEnterClass} inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-[11px] font-bold tracking-wide backdrop-blur-sm`}
              >
                <span
                  className="h-2 w-2 rounded-full transition-colors duration-700"
                  style={{ backgroundColor: scene.accentHex }}
                />
                <span className="text-[#F6D592]">TRADITION, IN MOTION</span>
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

            {/* Synchronized Product Headline + Tamil Name + Poetic Tagline + Description */}
            <div className="relative mt-3.5 lg:mt-4 lg:min-h-[214px]">
              <div
                key={`headline-${scene.slug}-${transitionKey}`}
                className={textEnterClass}
                style={hasTransitioned ? { animationDelay: '100ms' } : undefined}
              >
                <p
                  className="font-tamil text-sm font-semibold tracking-wide transition-colors duration-700 sm:text-base"
                  style={{ color: scene.accentHex }}
                >
                  {product.tamilName}
                </p>
                <h1
                  id="hero-heading"
                  className="font-display mt-1 text-[2rem] font-bold leading-[1.06] tracking-[-0.02em] text-[#FFF9F0] sm:text-5xl lg:text-[3.35rem]"
                >
                  {product.name}
                </h1>
              </div>

              <div
                key={`desc-${scene.slug}-${transitionKey}`}
                className={textEnterClass}
                style={hasTransitioned ? { animationDelay: '220ms' } : undefined}
              >
                <p
                  className="mt-2.5 font-display text-base font-semibold sm:text-lg"
                  style={{ color: scene.accentHex }}
                >
                  {scene.sceneTitle}
                </p>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-[#E6D6C4] sm:text-[15px]">
                  {scene.sceneLead}
                </p>
              </div>
            </div>

            {/* Mobile-only Contained Dual-Layer Floating Pouch Stage */}
            <div className="relative my-4 flex h-[238px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/12 bg-black/30 lg:hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-44 w-44 rounded-full opacity-70 blur-2xl transition-all duration-[1400ms]"
                style={{
                  background: `radial-gradient(circle, ${scene.haloTint} 0%, ${scene.accentHex} 52%, transparent 76%)`,
                }}
              />
              {outgoingSlot && (
                <div
                  key={`mob-out-${outgoingSlot.product.slug}-${transitionKey}`}
                  aria-hidden="true"
                  className={`${pouchExitClass} pointer-events-none absolute z-[5] h-[216px] w-[190px]`}
                >
                  <PouchImage
                    src={outCutout}
                    fallbackSrc={outFallback}
                    alt=""
                    width={420}
                    height={560}
                    priority
                    imgClassName="pouch-float-dark"
                  />
                </div>
              )}
              <div
                key={`mob-in-${product.slug}-${transitionKey}`}
                className={`${pouchEnterClass} relative z-10 h-[216px] w-[190px]`}
              >
                <Link
                  href={`/products/${product.slug}`}
                  aria-label={`Inspect ${product.name}`}
                  className="block h-full w-full"
                >
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

            {/* Active Spotlight Pack Cardette — Connects Raw Pack, Cooked Dish Preview, Price & Primary CTA */}
            <div
              key={`card-${scene.slug}-${transitionKey}`}
              className={`${textEnterClass} mt-4 rounded-2xl border border-white/18 bg-black/52 p-4 shadow-xl backdrop-blur-md sm:max-w-lg lg:mt-6`}
              style={hasTransitioned ? { animationDelay: '320ms' } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {/* Authentic Dish Thumbnail Pairing the Pouch to What It Cooks */}
                  <Link
                    href={`#food-storytelling`}
                    aria-label={scene.dishPairingLabel}
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/25 bg-[#2A160E] shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scene.dishPreviewImage}
                      alt=""
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <p
                      className="truncate text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: scene.accentHex }}
                    >
                      {scene.dishPairingLabel}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-[#F4E3CE]">
                      {scene.highlightFact}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-[#D9C7B0]">
                      <span className="font-mono-num uppercase tracking-wider text-white/85">
                        {activeVariant?.label}
                      </span>
                      {shelfLifeText && (
                        <span className="inline-flex items-center gap-1 font-medium text-[#F6D592]">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {shelfLifeText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className="font-mono-num text-2xl font-bold leading-none transition-colors duration-700 sm:text-[1.75rem]"
                    style={{ color: scene.accentHex }}
                  >
                    {formatPaiseToInr(activeVariant?.pricePaise)}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[#CAB69E]">
                    Incl. taxes
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={adding}
                  className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-bold text-white shadow-md transition-all duration-[180ms] active:scale-[0.98] disabled:opacity-60 sm:gap-2 sm:px-4 sm:text-sm ${
                    addedFlash
                      ? 'bg-[var(--brand-leaf)] ring-2 ring-[var(--brand-leaf)]/40'
                      : 'bg-[var(--brand-crimson)] hover:bg-[#b51e22]'
                  }`}
                >
                  {addedFlash ? (
                    <>
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                      {adding ? 'Adding...' : `Quick Add • ${formatPaiseToInr(activeVariant?.pricePaise)}`}
                    </>
                  )}
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white transition-colors duration-[180ms] hover:bg-white/20 sm:px-4 sm:text-sm"
                >
                  <Eye className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                  {scene.ctaLabel}
                </Link>
              </div>
            </div>

            {/* Secondary Storefront & Provenance Strip (Restrained Hierarchy — Doesn't Compete With Primary Product CTA) */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:max-w-lg">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/products"
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#F7CE68] px-4.5 text-xs font-bold text-[#23130D] shadow-md transition-transform duration-[180ms] hover:scale-[1.02] hover:bg-[#fce096]"
                >
                  Explore Full Pantry
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <a
                  href={buildWhatsAppUrl(
                    `Hello ${BRAND.fullName}, I am viewing ${product.name} (${activeVariant?.label ?? ''}) on your website and would like to enquire.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ eventName: 'whatsapp_click', path: '/', productSlug: product.slug })}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold text-[#FBF5EC] transition-colors duration-[180ms] hover:bg-white/20"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#7EE0A1]" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>

              <p className="flex items-center gap-1.5 text-[11px] text-[#CEBCA6]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#7EE0A1]" aria-hidden="true" />
                <span>
                  100% genuine pouches • Villapuram, Madurai • FSSAI: {BRAND.printedFssaiNumber}
                </span>
              </p>
            </div>
          </div>

          {/* Desktop Heroic Dual-Layer Floating Pouch Theatre (Slow 1.35s Outgoing + Incoming Glide!) */}
          <div className="hidden flex-col items-center justify-center lg:col-span-6 lg:flex">
            <motion.div
              style={{ y: pouchY, scale: pouchScale }}
              className="relative flex h-[520px] w-full max-w-[490px] items-center justify-center"
            >
              {/* Luminous Warm Sunlit Halo Directly Behind Pouch */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-[375px] w-[375px] rounded-full opacity-82 blur-3xl transition-all duration-[1400ms] ease-in-out"
                style={{
                  background: `radial-gradient(circle, ${scene.haloTint} 0%, ${scene.accentHex} 52%, transparent 76%)`,
                }}
              />

              {/* Cross-fading Product-Specific Architectural Backdrop Motifs */}
              {featuredSlots.map((slot, idx) => (
                <SceneBackdropMotif
                  key={`motif-${slot.scene.slug}`}
                  motif={slot.scene.motif}
                  accentHex={slot.scene.accentHex}
                  className={`transition-all duration-[1350ms] ease-in-out ${
                    idx === activeIdx
                      ? 'scale-100 opacity-45'
                      : 'scale-90 opacity-0'
                  }`}
                />
              ))}

              {/* Outgoing Floating Cutout Pouch Gliding Gracefully Out */}
              {outgoingSlot && (
                <div
                  key={`desk-out-${outgoingSlot.product.slug}-${transitionKey}`}
                  aria-hidden="true"
                  className={`${pouchExitClass} pointer-events-none absolute z-[8] h-[465px] w-[375px]`}
                >
                  <PouchImage
                    src={outCutout}
                    fallbackSrc={outFallback}
                    alt=""
                    width={720}
                    height={960}
                    priority
                    imgClassName="pouch-float-dark"
                  />
                </div>
              )}

              {/* Incoming Large Real Floating Cutout Pouch */}
              <div
                key={`desk-in-${product.slug}-${transitionKey}`}
                className={`${pouchEnterClass} relative z-10 h-[465px] w-[375px]`}
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

      {/* Bottom Interactive Carousel Indicator Dock + Live Progress Hairline + Auto-Play Controls */}
      <div className="relative z-20 border-t border-white/12 bg-black/42 backdrop-blur-md">
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
                    style={{
                      borderColor: isSelected ? '#F7CE68' : 'rgba(255, 255, 255, 0.14)',
                    }}
                    className={`snap-rail-item group relative flex min-h-[52px] items-center gap-2 overflow-hidden rounded-2xl border px-3 py-1.5 text-left transition-colors duration-300 ${
                      isSelected
                        ? 'bg-white/20 text-white shadow-md'
                        : 'bg-white/[0.05] text-[#E3D3BE] hover:bg-white/12'
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

                    {/* Smooth hairline progress indicator on active tab when autoplay is active */}
                    {isSelected && autoPlay && !isPausedInteraction && (
                      <span
                        key={`prog-${activeIdx}-${transitionKey}`}
                        aria-hidden="true"
                        className="animate-hero-progress pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-[#F7CE68]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
