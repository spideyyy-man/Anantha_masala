# ADR-005: Non-Destructive Product Media Pipeline
- **Date:** 2026-11-24
- **Status:** Accepted

## Context
`Assets/1.jpg` through `Assets/35.jpg` are authentic 1170×1560 JPEGs (~225 KB each) photographed directly from real product pouches. Packaging fidelity must never be falsified with AI mockups, originals must never be overwritten, and mobile LCP demands small modern image formats.

## Decision
- Preserve `Assets/1.jpg`–`Assets/35.jpg` strictly read-only.
- Implement `scripts/process-assets.mjs` using `sharp` to read `docs/audit/asset-manifest-35.json` and emit SEO-descriptive derivatives into `public/images/products/`:
  - `<slug>-<assetId>-480.webp` (grid/card thumbnail, ~18–35 KB)
  - `<slug>-<assetId>-960.webp` (product detail / zoom-ready crisp label, ~45–80 KB)
  - `<slug>-<assetId>-960.avif` (modern high-compression format)
- Reserve explicit `width` and `height` (3:4 portrait aspect ratio) on every image container to guarantee `CLS <= 0.1`.
- Apply `priority` / `fetchPriority="high"` strictly to the above-the-fold hero focal product image; lazy-load below-the-fold cards.

## Reversal Trigger
Migrate generated assets to Cloudflare R2 / S3 + Image CDN once SKU count exceeds 100 or high-resolution studio reshoots + video galleries are introduced.
