'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PouchImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** 'contain' preserves 100% of pouch label uncropped; 'cover' for original full-bleed photos */
  fit?: 'contain' | 'cover';
}

/**
 * Deterministic, instant-render product packaging image renderer.
 * - Serves pre-optimized immutable static WebP cutouts/photos directly (no runtime /_next/image sharp stall).
 * - NEVER hides <img> at opacity-0 (eliminates SSR/hydration invisible-image race conditions permanently).
 * - Renders a subtle warm silhouette shimmer strictly behind uncached non-priority images until decoded.
 * - Falls back seamlessly to the uncropped original product WebP if a cutout URL ever errors.
 */
export function PouchImage({
  src,
  fallbackSrc,
  alt,
  width = 420,
  height = 560,
  priority = false,
  className = '',
  imgClassName = '',
  fit = 'contain',
}: PouchImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [activeSrc, setActiveSrc] = useState(src);
  const [loaded, setLoaded] = useState(priority);

  useEffect(() => {
    setActiveSrc(src);
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    } else if (!priority) {
      setLoaded(false);
    }
  }, [src, priority]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    if (fallbackSrc && activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc);
    } else {
      setLoaded(true);
    }
  };

  return (
    <div className={`relative h-full w-full ${className}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 z-0 animate-pulse rounded-[22px] bg-[#E8D8C2]/65"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={activeSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={`relative z-10 h-full w-full opacity-100 ${
          fit === 'contain' ? 'object-contain' : 'object-cover'
        } ${imgClassName}`}
      />
    </div>
  );
}
