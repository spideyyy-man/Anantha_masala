# Focused Creative Redesign Audit — Homepage, Pantry & Kitchen Ideas
> **Date:** 24 November 2026  
> **Strict Scope:** Homepage (`/`), Pantry (`/products`), Kitchen Ideas (`/recipes`) and shared presentation components only.  
> **Strictly Protected (Untouched):** Madurai Story (`/story`), Bulk Enquiry (`/wholesale`), Track Orders (`/orders/track`), Collection Detail Pages (`/categories`, `/categories/[slug]`), Cart/Checkout/Admin/Legal/API/Database backend.

---

## Issue Register

| ID | Area | Exact Current Weakness | Severity | Planned Redesign Fix |
|---|---|---|---|---|
| **RED-01** | Homepage Hero | Changing spotlight product relies on clicking small bottom dock pills; lacks prominent Previous/Next arrows, keyboard/swipe navigation, and rich per-product scene transformations (currently shifts subtle background tint only). | Critical | Rebuild `CinematicHeroStage.tsx` into a 5-slide dynamic scene carousel with prominent flanking Left/Right arrows, keyboard & swipe controls, slide index (`01 / 05`), auto-progression with pause-on-hover/focus, and complete per-product visual environments (atmosphere, GLSL shader palette, decorative South Indian backdrop motifs, giant Tamil calligraphy, and direction-aware interruptible pouch + copy transitions). |
| **RED-02** | Homepage Showcase | Currently renders TWO counter-moving product marquees (`Stream 01` + `Stream 02`) PLUS a third Tamil ticker ribbon, cluttered with long intro copy and a filter-jump box, and positioned *after* Collections. | Critical | Consolidate into **EXACTLY ONE** seamless right-to-left continuous gliding product showcase placed **immediately BEFORE Collections**, stripped of long headings/paragraphs/duplicate banners so packaging itself leads naturally into Collections. |
| **RED-03** | Homepage Collections | Current `CategoryExplorer.tsx` renders 8 identical rectangular mini-cards on the left + 1 preview box on the right — functional, but template-like rather than an art-directed product exhibition. | Critical | Redesign `CategoryExplorer.tsx` into an asymmetrical editorial product exhibition inspired by high-craft jar-product art direction: varied spatial compositions (7+5 flagship duet, 5+7 inverted showcase, distinct sculptural lower blocks), large overlapping multi-pouch floating arrangements, distinct collection environments, strong display typography, layered hover depth, and direct `<Link>` routing into existing `/categories/[slug]` pages. |
| **RED-04** | Homepage Story X-Ray | "Madurai Kitchen Story • Front-Label X-Ray" (`ScrollIngredientStory.tsx`) and its sideways marquee ribbon are explicitly marked unnecessary. | High | Completely remove `ScrollIngredientStory.tsx` and all imports/references from `src/app/page.tsx`. |
| **RED-05** | Homepage Kitchen Focus-Frame | Current `CulinaryFocusSlider.tsx` puts a single cutout pouch next to numbered steps inside a flat bordered card — lacks appetising food photography and editorial visual pull. | High | Rework Kitchen Focus-Frame into an editorial culinary spotlight pairing rich South Indian dish photography with overlapping real Aanandha Masala floating pouch cutouts, crisp typography, and clear pathways into Kitchen Ideas (`/recipes`) and direct product pages. |
| **RED-06** | Pantry Cards & Hover | Product cards feel static on hover, do not surface verified shelf-life (`bestBeforePrinted`) on hover or clearly on mobile, and typography can carry stronger editorial hierarchy without clutter. | High | Upgrade `ProductCard.tsx` & `CatalogExplorer.tsx`: choreographed desktop hover depth + sliding shelf-life & kitchen-use caption reveal (grounded strictly in DB `bestBeforePrinted`, never fabricated), always-visible mobile parity row, refined display/Tamil/tabular typography, and 1-click collection pills above the grid. |
| **RED-07** | Kitchen Ideas (`/recipes`) | Text-heavy stacked white boxes with plain pouch thumbnails — feels like a static recipe blog rather than an appetising, interactive *Inspiration → Dish Discovery → Required Products → Add to Bag* journey. | Critical | Rebuild `/recipes` with `KitchenIdeasExperience.tsx`: interactive meal-intention discovery ("What would you like to cook today?"), large editorial South Indian food photography integrated with real floating Aanandha Masala pouches, clear answers to *what to cook* and *which products to buy*, and direct inline Add-to-Bag + PDP links for every verified dish. |

---

## Final Verification & Part 8 Honest Score (Post-Polish Loop)

- **Build & Automated Tests:** `npm run typecheck` (`0` errors), `vitest run` (`11/11` passed), `next build` (`1.8s`, `0` warnings).
- **Browser Audit:** Verified live at `http://localhost:3000` across Desktop (`1440×900`), Tablet (`768×1024`), and Mobile (`390×844`) — `0` console errors, `0` HTTP `>= 400` errors, `0` empty images, `0px` horizontal overflow across all viewports.
- **Visual Refinement Loop Fixed:** Caught and fixed solid-gold Hero Tamil watermark bug (`animate-hero-copy` overriding `opacity-[0.09]`) by locking `opacity-[0.075]` onto the outer wrapper, accelerated GLSL shader color cross-fade (`0.055 -> 0.16`), and deepened per-slide chroma differentiation (crimson ember -> terracotta morning -> velvet plum -> banana-leaf turmeric -> copper hearth).
- **Protected Routes Verified Untouched:** `/story` (HTTP 200), `/wholesale` (HTTP 200), `/orders/track` (HTTP 200), `/categories/cooking-essentials` (HTTP 200).

| Part 8 Dimension | Score | Weight | Notes |
|---|---:|---:|---|
| Homepage hero and dynamic transitions | 14.0 | 15 | 5 distinct product scenes (atmosphere + GLSL cross-fade + backdrop motifs + whispered Tamil watermark + visible flanking arrows + swipe/keyboard/auto-pause). |
| Infinite product showcase | 9.5 | 10 | Single right-to-left loop before Collections, minimal text, verified `dx = -58.4px` over 1200ms, hover-pause `dx = -0.2px`, `0` bad tab stops. |
| Collections visual execution | 14.0 | 15 | Asymmetric art-directed exhibition (7+5, 5+7, 6+6, specialty duet), large multi-pouch floating compositions, distinct backdrops, live routing to preserved `/categories/[slug]`. |
| Pantry card design and typography | 14.0 | 15 | Choreographed hover shelf-life overlay (`Shelf Life: 6 Months`), mobile always-visible parity pill, refined Fraunces + Noto Sans Tamil + tabular mono hierarchy, 1-click collection ribbon. |
| Kitchen Ideas concept and conversion journey | 18.5 | 20 | Interactive meal-intention tabs, 6 bespoke South Indian dish photographs integrated with real floating pouches, verified steps, inline required packs shelf + `Add Core Pair` 1-click cart add. |
| Visual consistency and colour | 9.0 | 10 | Cohesive Madurai sunlit ivory/sand & deep tamarind bookends; high contrast across all viewports. |
| Responsive experience | 4.5 | 5 | Verified `0px` overflow at 1440, 768, and 390; touch arrows on mobile hero; inline shelf-life parity on mobile Pantry. |
| Functionality and performance | 9.0 | 10 | 11/11 tests, `0` console/HTTP errors, off-screen RAF pause, WebP-optimized dish photos (`100–140 KB` each); formal Lighthouse CI field metrics pending CI wiring. |
| **Total** | **92.5 / 100** | **100** | Verified across all 30 Part 7 checkboxes with live multi-viewport visual & interaction evidence. |

