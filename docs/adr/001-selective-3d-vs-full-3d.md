# ADR-001: Selective Progressive-Enhancement WebGL Shader & Spatial Depth vs Full 3D Website
- **Date:** 2026-11-24 (Updated during Creative Redesign)
- **Status:** Accepted & Verified

## Context
Madurai Aanandha Masala converts social-media visitors (Instagram Reels & YouTube) into product discovery, WhatsApp enquiries, and completed purchases. The creative brief calls for an unmistakable, atmospheric South Indian culinary theatre — floating real packaging, layered paper-cut depth, chromatic transitions between chapters, and subtle spatial 3D — without sacrificing mobile Core Web Vitals, accessibility, or SEO.

## Options Considered
1. **Full WebGL / 3D-dependent storefront:** Canvas navigation and 3D product grids.
2. **Three.js hero particle scene (`~165.7 KB gz`):** Heavy dependency for faint generic dots.
3. **Custom Zero-Dependency GLSL Spice-Atmosphere Shader (`~3 KB`) + Real Studio Pouch Cutouts + CSS 3D Perspective & Motion Choreography (Selected).**

## Decision
Adopt **Option 3**:
- **Zero Three.js bloat:** Replaced the 165.7 KB gzipped Three.js particle chunk with a custom ~3 KB raw WebGL1/2 GLSL organic spice-atmosphere shader (`SpiceAtmosphereShader.tsx`) that dynamically interpolates its warm spice-heat color uniforms in real time as the visitor switches hero Madurai flavours!
- **Real Floating Packaging Cutouts (`scripts/extract-cutouts.py`):** Non-destructively extracted transparent-background studio cutouts of all 35/35 genuine pouches (`Assets/` untouched) so real Aanandha Masala pouches float freely in 3-plane Z-depth stages instead of sitting trapped inside rectangular tablecloth photo boxes.
- **Graceful Degradation:** All essential headings, prices, links, filters, cart, and checkout remain 100% semantic DOM HTML. WebGL shader mounts ONLY on capable desktop devices after initial paint, caps DPR <= 1.25, pauses offscreen/hidden, handles `webglcontextlost`, honors `prefers-reduced-motion`, and exposes an explicit `Live Spice Shader: On / Off` toggle.
- **Mobile-Specific Experience:** Zero WebGL on mobile; touch-first atmospheric pouch theatre, floating-pouch swipeable category deck, and fast accessible filter drawer.

## Benefits & Trade-offs
- **Benefits:** 98% smaller WebGL code footprint (~3 KB vs 165.7 KB), dramatically stronger Madurai visual identity, instant LCP, zero SEO/a11y risk.
- **Trade-offs:** Does not render interactive 360° rotatable 3D polygon pouch meshes; instead delivers photorealistic real-label cutouts with desktop 3D perspective tilt and instant Original-Pack zoom inspection.

## Reversal Trigger
Introduce a compressed glTF 3D pouch viewer only if product photography reshoots include 360° back/side label scans and throttled mobile benchmarks stay within LCP <= 2.5s and INP <= 200ms.
