# Phase 14 — Creative Experience Overhaul Verification & Honest Quality Report
> **Project:** Madurai Aanandha Masala (`மதுரை ஆனந்தா மசாலா`)  
> **Date:** 24 November 2026  
> **Production Build:** Next.js `16.4.6` (Turbopack), React `19.1.0`, TypeScript `5.8.3` (strict), Tailwind CSS `4.1.0`, Drizzle ORM `0.45.4`, Zod `4.6.7`, Sharp `0.35.5`

---

## 1. Issue Register & Verified Resolutions

| ID | Area / Route | Root Cause Found | Resolution Implemented | Verification Evidence |
|---|---|---|---|---|
| **ISS-01** | Global `/products`, PDPs & Route Transitions | `src/app/template.tsx` mounted `<motion.div initial={{ opacity: 0.01 }}>`, rendering SSR HTML 99% invisible; Next.js `<Image>` piped already-optimized static WebPs through runtime `/_next/image` transcoding, causing blank packaging frames on first paint (`step_28.png`, `step_40.png`). | Removed `opacity: 0.01` wrapper in `src/app/template.tsx`; created deterministic `<PouchImage>` (`src/components/ui/PouchImage.tsx`) serving pre-optimized immutable WebP cutouts directly at `opacity: 1` with zero `/_next/image` stall and graceful fallback to original pack WebP across every storefront route. | `step_17_shot_1.png` (`/products`), `step_17_shot_2.png` (`/products/manjal-podi`), `step_17_shot_3.png` (`/products/ulundhu-kali-maavu`) — 100% immediate first-paint packaging visibility. |
| **ISS-02** | Homepage Pantry Showcase | Previously an arrow-controlled static horizontal scroll row (`PantryInMotionRail.tsx`), not a genuine continuous infinitely moving showcase. | Replaced with `InfinitePantryShowcase.tsx`: dual counter-moving RAF tracks (Stream 01: 15 masalas/podis left; Stream 02: 10 flours/mixes/care right), seamless modulo wraparound, smooth velocity lerp pause on hover/focus, drag/swipe with vertical `touch-pan-y` discrimination, `IntersectionObserver` off-screen pause, `Pause/Resume Motion` button, `prefers-reduced-motion` support, and `aria-hidden` + `tabIndex={-1}` duplicate clones. | `step_15_shot_1.png`; live `boundingBox().x` deltas over `1200ms`: Stream 01 `dx = -3.8px`, Stream 02 `dx = +3.2px`; hover-pause `dx = -0.4px`; `0` duplicate focusable tab stops across `45` cloned controls. |
| **ISS-03** | Homepage Category Discovery | `CategoryTheatre.tsx` left huge empty right-side dead space and had empty `src=""` on inactive image slots. | Deleted `CategoryTheatre.tsx` and built `CategoryExplorer.tsx`: balanced 12-col visual bento matrix (left 2×4 mini-pouch cards showing all 8 collections with distinct hero pouches + counts; right full-height always-populated 3-pouch luminous spotlight; honest Seasonal Pickle emblem for `Pickles` where jar photos are pending; touch-first 2-col mobile grid). | `step_71_shot_3.png` (Desktop 3-pouch Traditional Podi fan + distinct pouches on 01/02/03/04), `step_102.png` (Mobile 2-col visual grid), `img[src=""]` count = `0`. |
| **ISS-04** | Product Card System | Cards had colliding Tamil watermarks, dark boxes hiding dark pouches, and inconsistent variants. | Unified 4-variant system in `ProductCard.tsx` (`featured`, `standard`, `showcase`, `compact`) on luminous warm packaging stages (`#F4E8D6`), unobstructed ~85% packaging prominence, clean top badges, grounded shadows, and crisp pricing/actions. | `step_17_shot_1.png`, `step_15_shot_1.png`, `step_23_shot_3.png`, `step_25_shot_3.png`. |
| **ISS-05** | Colour System & Dark-on-Dark Contrast | Abrupt jumps between emerald green, smoked chocolate, cream, and crimson; dark pouches (*Ulundhu Kali*) disappeared into dark cards. | Unified packaging-first Madurai palette in `globals.css` & `src/lib/media.ts`: Deep Roasted Tamarind (`#23130D`) reserved strictly for Hero & Footer/Closing anchor; sunlit ivory (`#FBF6EE`) and warm sand (`#F2E6D3`) daylight rhythm everywhere else; luminous warm pedestals behind every pouch. | `step_71.png`, `step_92_shot_2.png`, `step_15_shot_2.png`, `step_17_shot_3.png`. |
| **ISS-06** | Hero Overlapping Badge & Price Mismatch | Old hero placed FSSAI pill over the pouch and showed `₹30` (50g secondary variant) for Manjal Podi in the dock instead of primary `100g ₹60`. | Removed overlapping pouch badge (moved FSSAI provenance neatly below CTAs), bound dock prices to primary `variants[0]` (`Manjal Podi ₹60`), and replaced `AnimatePresence mode="wait"` tab swap with deterministic instant CSS transition (`aanandha-stage-enter`). | `step_2_media_0.png` (`Bhai Veetu Meen Masala` + `Manjal Podi ₹60`), `step_71_shot_1.png` (`Ulundhu Kali Maavu` solid on tab switch). |
| **ISS-07** | Mobile Hero Contrast & Header Clipping (`390×844`) | Old `step_65.png` had pale radial wash over white headline text and clipped hamburger button at right edge; scrolled header had invalid `/96` opacity class. | Reordered mobile hero (headline first, contained pouch below with dark readability scrim), tightened mobile header spacing (`px-3 gap-1`, `h-10 w-10`), and set scrolled header to solid `bg-[#FBF6EE] sm:bg-[#FBF6EE]/95`. | `step_25_shot_1.png` (crisp mobile hero contrast, hamburger `right=363 <= 390`, `0` WebGL canvases), `step_102.png` (solid `#FBF6EE` scrolled mobile header). |
| **ISS-08** | Tablet Horizontal Overflow (`768×1024`) | Old `/products` had `+17px` horizontal overflow at `768px`. | Added `min-w-0` on search/sort flex wrappers in `CatalogExplorer.tsx` and constrained select width cleanly. | `step_23_shot_2.png`, `step_23_shot_3.png`: `bodyWidth = 753px <= 768px` (`0px` overflow) on both `/` and `/products`. |
| **ISS-09** | `/orders/track` Raw Phone PII Exposure | Auto-lookup pre-filled raw 10-digit checkout mobile visibly inside `input#track-phone` (`step_61.png`). | Passed `sessionStorage` phone directly to server lookup without populating `input#track-phone` state, then scrubbed phone from `sessionStorage` immediately after confirmation. | `step_23_shot_1.png`: confirmed order `AM261124-69AC33`, masked `98******56`, `input#track-phone` value `""`, `rawPhoneInBody: false`. |
| **ISS-10** | DPDP Consent Re-Management | Returning visitors had no footer entry to revisit DPDP Act 2023 cookie choices. | Added `reopenConsent()` in `StoreProviders.tsx` and `Manage Cookie & DPDP Choices` trigger (`PrivacyTrigger.tsx`) in `SiteFooter.tsx`. | `step_62_shot_2.png`: banner opens cleanly with `0` pre-checked checkboxes and saves `Necessary Only`. |

---

## 2. Automated & Live Browser Verification Results

- **TypeScript Strict (`npm run typecheck`):** `0` errors.
- **Vitest (`npm test`):** `11 / 11` passed (`tests/catalog-and-manifest.test.ts` + `tests/commerce-security.test.ts` — covers 35/35 asset manifest parity, Tamil/English search, Chilli Powder enquiry-only enforcement, Nalangu Maavu non-edible segregation, integer paise checkout, idempotency, HMAC webhook verification, IDOR protection, RBAC + MFA + audit trail, DPDP consent logging).
- **Database Backup & Restore (`npm run db:backup-test`):** PASSED (`8 categories, 25 products, 26 variants, 35 images`).
- **Next.js Production Build (`npm run build`):** Compiled cleanly in `1.56s`, `0` warnings, all 37 routes built.
- **Dependency Security (`npm audit --omit=dev`):** `0` production vulnerabilities.
- **Live Browser QA (`http://localhost:3000`):**
  - Desktop `1440×900`, Tablet `768×1024`, Mobile `390×844` verified across Hero, Category Explorer, Dual-Row Infinite Showcase, 8-Grain Ingredient X-Ray, Kitchen Focus-Frame, Closing/Footer + DPDP Banner, `/products`, `/products/manjal-podi`, `/products/ulundhu-kali-maavu`, CartDrawer, Guest Checkout, Sandbox HMAC Webhook, and `/orders/track`.
  - Console errors: `0` | HTTP `>= 400` errors: `0` | Empty `img[src=""]`: `0` | Horizontal overflow: `0px` across all 3 viewports.

---

## 3. Honest Phase 14 Quality Score: **87 / 100**

| Dimension | Score | Weight | Notes |
|---|---:|---:|---|
| 1. Packaging Visibility & First-Paint Reliability | 9.5 / 10 | 15% | Instant `<PouchImage>` first paint proven on `/`, `/products`, PDPs; 35/35 verified studio cutouts. |
| 2. Brand Identity & Colour Cohesion | 9.0 / 10 | 12% | Unified Deep Tamarind + Sunlit Ivory/Sand Madurai palette; dark pouches pop cleanly. |
| 3. Category Discovery & Information Architecture | 9.0 / 10 | 12% | Zero empty dead space; all 8 collections immediately visual with unique hero pouches + honest Seasonal Pickles card. |
| 4. Infinite Showcase & Motion Choreography | 8.5 / 10 | 12% | Genuine dual counter-moving RAF loop, hover/focus pause, off-screen IO pause, drag/swipe, 0 duplicate tab stops. Still room for richer tactile scroll-scrubbed transitions between bands. |
| 5. Product Card & PDP Craftsmanship | 9.0 / 10 | 12% | Clean 4-variant system, Studio Stage / Original Pack toggle, Inspect Label zoom, zero fake claims/badges. |
| 6. Desktop, Tablet & Mobile Responsiveness | 9.0 / 10 | 12% | Dedicated desktop/mobile experiences, 0px overflow at 1440/768/390, 0 WebGL on mobile, crisp scrolled header. |
| 7. Ecommerce Flow, Security & DPDP Compliance | 9.0 / 10 | 12% | Guest checkout, integer paise, idempotency, HMAC webhooks, IDOR/PII masking, RBAC+MFA, DPDP consent manager, 0 prod CVEs. |
| 8. Real-World Launch Readiness (External Data/APIs) | 6.5 / 10 | 8% | Correctly blocks fabrication, but live payment gateway keys, real shipping rate cards, FSSAI FoSCoS check, back-label nutrition panels, Chilli Powder MRP, and Pickle jar photos await business owner inputs (`docs/audit/pending-business-data.md`). |
| 9. Real-User Performance Instrumentation (RUM/LH) | 7.5 / 10 | 5% | Bundle trimmed (`three` removed), off-screen RAF paused, WebGL throttled to 30fps on desktop only; formal field CrUX/Lighthouse CI budget check not yet wired into CI pipeline. |
| **Weighted Total** | **87 / 100** | **100%** | Strong, distinctive, verified production foundation; held back honestly by pending operator business inputs and unmeasured lab Lighthouse CI scores. |

---

## 4. Weakest Remaining Area & Next Improvement Plan

- **Weakest Area:** **Pending real-world business & packaging data + automated CI visual/Lighthouse regression suite** (Dimension 8 & 9). Specifically:
  1. Back-label ingredient/allergen/nutrition tables (24 of 25 SKUs), Chilli Powder weight/MRP, Pickle jar photos, live Razorpay/Cashfree credentials, GSTIN, and verified Grievance Officer details remain pending operator confirmation.
  2. Visual QA was executed interactively via the browser subagent, but there is no committed Playwright + Lighthouse CI script running automatically on every Git PR.
- **Concrete Next Steps:**
  1. Walk through `docs/audit/pending-business-data.md` with the business operator to populate verified back-label nutrition, Chilli Powder price, Pickle jar photography, live Razorpay webhook secret, and legal Grievance Officer details.
  2. Add a Playwright visual-regression + Lighthouse CI workflow (`npx playwright test`) covering Desktop/Tablet/Mobile LCP/CLS/INP budgets and automated checkout smoke tests on every pull request.
  3. Capture higher-resolution multi-angle studio lighting shots (front + back nutrition label) for all 25 SKUs when new inventory batches are packed.
