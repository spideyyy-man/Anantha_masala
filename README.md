# Madurai Aanandha Masala — Digital Commerce Platform
> **Traditional South Indian Food for Everyday Living.**  
> **Tradition, in Motion.**

A production-grade Next.js App Router + TypeScript + Drizzle/PostgreSQL modular monolith built for **Madurai Aanandha Masala** (`மதுரை ஆனந்தா மசாலா`, Villapuram, Madurai, Tamil Nadu), combining atmospheric South Indian brand storytelling with fast, accessible, secure e-commerce and hybrid WhatsApp enquiry workflows.

---

## Key Highlights
- **35 / 35 Genuine Product Asset Audit:** Every image in `Assets/1.jpg`–`Assets/35.jpg` was audited at full resolution (`1170 × 1560`), preserved read-only, and processed into responsive WebP/AVIF derivatives (`public/images/products/`) plus clean transparent studio pouch cutouts (`public/images/cutouts/`).
- **Zero Fabricated Facts:** No invented prices (`Chilli Powder` honestly marked pending verification), no fake ratings/reviews, no unverified medical/diabetes claims, and strict separation of non-edible `Kuliyal Podi / Nalangu Maavu` bath powder from food categories.
- **Madurai in Motion — Living Spice Theatre UI:**
  - Full-viewport atmospheric opening theatre with custom ~3 KB WebGL GLSL spice-heat shader (desktop progressive enhancement with toggle & context-loss fallback — zero Three.js bloat!).
  - Floating real pouch cutouts across 6 chromatic storytelling chapters.
  - Scroll-triggered 8-grain *Ulundhu Kali Maavu* front-label X-Ray reveal.
  - Split interactive Banana-Leaf Emerald Category Theatre (desktop) & floating-pouch swipe deck (mobile).
  - Horizontal Floating-Plinth Pantry Rail & Focus-Frame Madurai Kitchen spotlight.
- **Full Server-Authoritative Commerce & Security:**
  - Canonical PostgreSQL schema via Drizzle ORM (`DATABASE_URL` in staging/production; zero-config embedded PostgreSQL `PGlite` locally).
  - Integer-paise money storage, transactional stock reservation, idempotent guest checkout, HMAC-SHA256 signed payment webhook verification (`RazorpayAdapter` boundary + Sandbox Verification Mode), replay protection, and stock restoration on failed payment.
  - IDOR-protected Order Tracking (`Order ID + Checkout Mobile`), RBAC + 6-digit MFA + Session Rotation + Immutable Audit Trail (`/admin`), OWASP security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy), CSRF origin guards, sliding-window rate limits, and DPDP Act 2023 consent-gated zero-PII analytics.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Regenerate responsive images & studio pouch cutouts from Assets/
npm run assets:process
python scripts/extract-cutouts.py

# 3. Copy environment template (optional locally; embedded PGlite works out of the box)
cp .env.example .env.local

# 4. Run development server
npm run dev

# 5. Run production build & server
npm run build
npm run start
```

## Verification & Operations Scripts
- `npm run typecheck` — Strict TypeScript check
- `npm test` — Vitest domain, search, transaction, HMAC webhook, IDOR, MFA, RBAC, CSRF, rate-limit, and DPDP privacy suite
- `npm run db:migrate` — Verify/apply PostgreSQL schema
- `npm run db:seed` — Seed canonical 25-product catalogue from verified audit data
- `npm run db:backup-test` — Full logical backup & clean PostgreSQL restore parity test

## Documentation & Governance
- [Phase 0 Repository & Baseline Audit](docs/audit/phase-0-repository-audit.md)
- [Complete 35-Image Asset Manifest (Markdown)](docs/audit/asset-manifest-35.md) & [JSON](docs/audit/asset-manifest-35.json)
- [Pending Business, Legal & Compliance Inputs](docs/audit/pending-business-data.md)
- [Creative Redesign Architecture (3 Concepts Compared)](docs/audit/creative-redesign-architecture.md)
- [Architecture Decision Records (`docs/adr/`)](docs/adr/001-selective-3d-vs-full-3d.md)
