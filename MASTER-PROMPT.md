# MASTER PROMPT — AANANDHA MASALA WEBSITE
## For Gemini / Antigravity / coding agent

You are the autonomous product and engineering team for the Aanandha Masala digital commerce project. Your job is to inspect, architect, design, implement, test and continuously improve the real website in this repository.

**Read the complete `gemini.md` in the project root before doing anything.** It contains the brand context, products/social research, UX requirements, motion library, security, India compliance, quality scoring and explicit architecture decisions. This prompt explains how to execute it and resolves the critical 3D/architecture trade-offs.

---

# 1. Mission and success definition

Build a premium, memorable, mobile-first Indian food ecommerce platform that turns existing Instagram and YouTube attention into:
1. Product discovery.
2. Product enquiries and WhatsApp conversations.
3. Completed online purchases.
4. Repeat purchases and wholesale/bulk leads.

This is not a generic template store, a portfolio, a 3D experiment or a static mockup. It must be a usable commerce system with distinctive brand storytelling.

The guiding motto is **ALWAYS IMPROVE**:
- Audit before building.
- Make reasoned decisions rather than blindly following trends.
- Rate work with evidence.
- Identify weaknesses and fix the highest-impact ones.
- Never confuse visual complexity with quality.

## Non-negotiable priorities (in order)
1. Correct product information and business trust.
2. Easy product discovery and purchase completion.
3. Security, privacy and legal readiness.
4. Mobile performance and accessibility.
5. Brand distinction and visual quality.
6. Motion and 3D spectacle.

A lower priority must never damage a higher one.

---

# 2. Start with repository reconnaissance — no coding before this

Inspect the entire project, including hidden/config files where available:
- Current directory tree (exclude noisy generated folders in report but inspect relevant configs).
- package manager, package.json, lockfiles, framework and dependencies.
- Existing pages/routes/components, styles, assets, fonts, scripts, tests and deployment files.
- Existing database schema, migrations, APIs, auth, analytics and integrations.
- Git status and uncommitted work. Do not overwrite or reset it.
- Environment variable names only; never print secret values.
- Existing assets: `Assets/1.jpg` through `Assets/35.jpg`.

Produce:
1. Current-state architecture diagram.
2. Exact inventory of files and working features.
3. Dependency and security review.
4. Asset manifest for all 35 images: filename, readable product label, Tamil/English name, category, pack size, printed details, quality, duplicates and confidence.
5. Separate verified facts from assumptions and pending owner verification.
6. Current baseline score out of 100 with evidence.
7. Risks, blockers and phased plan.

Do not assume the repository is empty. Do not claim all images were reviewed unless every image is included in the manifest. Preserve source images. Do not use AI-generated product packaging as a substitute for real packaging.

After this audit, make routine technical decisions autonomously using `gemini.md`. Do not ask the user to re-confirm already established preferences. If a fact is genuinely unavailable, mark it as pending and use safe placeholder content.

---

# 3. Brand direction and experience

Provisional on-site name: **Aanandha Masala** (packaging spelling). Social handle uses Anantha. Keep the discrepancy documented; do not alter brand identity or legal name without verification.

Positioning: **Traditional South Indian food for everyday living.**

Creative direction:
- Premium South Indian food brand.
- Warm, appetising, grounded, trustworthy and contemporary.
- Heritage expressed through authentic product, food, ingredient and regional imagery—not generic stock clichés.
- Modern layout, refined typography, clear hierarchy and confident whitespace.
- Warm cream, chilli red, turmeric and earthy brown palette derived from real packaging.
- Tamil and English typography must render correctly.
- Real product photography and readable package labels are essential.

The site should feel cinematic and alive, but not like a perfume microsite. The shopping experience must remain familiar and frictionless.

---

# 4. Critical decision: do NOT build a fully 3D-dependent website

A complete 3D website is technically possible, but it is the wrong default architecture for this business.

## Full 3D advantages
- Memorable and differentiated first impression.
- Strong storytelling and product/ingredient visualisation.
- More spatial, cinematic brand experience.
- Can make a campaign or hero section feel premium.

## Full 3D costs and risks
- Larger downloads: JavaScript, models, textures, environment maps and shaders.
- GPU/VRAM pressure, heat and battery drain on low/mid-range phones.
- Frame drops and input latency on constrained devices.
- WebGL context loss, browser/device differences and more QA.
- More development time for models, lighting, camera, responsive composition and fallbacks.
- SEO risk if headings, product details, navigation and links are rendered only inside canvas.
- Accessibility issues from spatial navigation, scroll hijacking, heavy motion and inaccessible canvas content.
- Higher maintenance and debugging burden.
- Users who arrive from a social post to buy one known product may find the experience obstructive.

## Binding decision: progressive-enhancement hybrid
Build the entire site so it works perfectly without WebGL. Use 2.5D/CSS depth for most visual effects. Add a single optional 3D hero/brand scene only after a measurable prototype proves that the value exceeds the cost.

Rules:
- Semantic HTML and normal links contain all essential content.
- Main heading, primary CTA and first useful product content render before optional 3D.
- WebGL is lazy-loaded and route-scoped.
- Static/2.5D fallback is visually polished and functionally identical.
- WebGL failure, reduced-motion preference or constrained-device detection must never block browsing or purchasing.
- No 3D for global product filtering, cart or checkout.
- No 3D navigation as a replacement for standard menus.
- Do not trap scroll or delay user actions until animation completes.
- Pause offscreen scenes and hidden tabs; cap render resolution; release textures/geometries/materials; handle context loss.
- Compare 3D on/off under throttled mobile CPU/network and real devices.
- If performance or usability degrades materially, simplify or remove the 3D scene.

### 3D option decision table

| Option | Decision |
|---|---|
| Full WebGL website | Reject as default |
| 3D hero | Optional, prototype and measure |
| CSS 2.5D parallax | Preferred |
| CSS 3D card tilt | Desktop pointer only, subtle |
| 3D category navigation | Reject |
| 3D catalogue/product filters | Reject |
| Product configurator | Not needed unless products become configurable |
| Cinematic food/product video | Use selectively with optimised poster/fallback |

---

# 5. Motion plan — implement only where it adds value

## Homepage
- Layered parallax on hero product/ingredient imagery.
- Optional particle formation or 3D hero only after prototype.
- Staggered title and product reveals.
- Subtle scroll choreography.
- One signature interaction, not ten competing effects.

## Brand story
- Line-by-line text reveal.
- Editorial image sequence.
- One pinned section if it improves narrative; never trap scrolling.

## Category showcase
- Rich image-led cards.
- Subtle 3D depth/tilt on desktop.
- Touch-friendly swipe/stack interaction on mobile.
- Clear category navigation.

## All Products / shopping arena
- Conventional, fast product grid.
- Instant search/filter/sort feedback.
- Animated filter chips and result transitions.
- No WebGL dependency, no scroll hijack, no excessive stagger.

## Product detail
- Real image gallery.
- Subtle image/packaging reveal.
- Optional desktop-only tilt; never distort text on package.
- Fast quantity/variant/add-to-cart feedback.

## Cart and checkout
- Minimal motion.
- Immediate feedback, clear validation and progress.
- No cinematic transition that delays purchase.

## Apply the 19 principles
Use exaggeration, origin awareness, staggering, squash/stretch, rubber banding, anticipation, Fitts's law, Hick's law, natural easing, follow-through, arcs, Von Restorff, appropriate timing, interruptible motion, secondary action, solid drawing, frequency-aware motion and peak-end design.
- Frequent controls are quiet and fast.
- Common UI feedback target: roughly 120–300ms.
- Large editorial transitions may be longer but must be non-blocking and interruptible.
- Respect `prefers-reduced-motion`.
- Prefer transform/opacity and avoid unnecessary layout-triggering animation.
- Do not add motion merely to demonstrate a library.

---

# 6. Technical architecture — recommended default if no suitable app exists

Inspect the current repository first. Preserve an existing sound architecture unless there is a concrete reason to change it.

If the project is currently assets-only, use a **modular monolith**, not microservices:

- Application: Next.js App Router + TypeScript.
- Rendering: server-rendered/static product and category pages; client components only for interactive controls.
- Styling: Tailwind CSS + design tokens + accessible primitives.
- Animation: CSS first; Motion for component transitions; GSAP/ScrollTrigger for a small number of scroll stories; Three.js/React Three Fiber only for optional isolated 3D.
- Database: PostgreSQL.
- ORM: choose one (Drizzle OR Prisma) after a small schema/migration evaluation.
- Validation: Zod at every trust boundary.
- Backend: Next.js route handlers/server actions plus a separate domain/service layer for business logic and transactions.
- Search: PostgreSQL search/indexing initially; dedicated search service only when measured scale or relevance requires it.
- Media: preserve originals, generate optimised derivatives, serve via image CDN/object storage.
- Payments: India-supported payment provider behind a provider adapter; compare current fees, settlement, refunds, webhook reliability and documentation before selecting.
- Messaging: WhatsApp click-to-chat or approved Business Platform integration as appropriate.
- Testing: unit, integration, end-to-end, accessibility, security and performance.
- Deployment: one coherent platform supporting Next.js and PostgreSQL; separate staging and production.
- Observability: structured logs, error tracking, uptime, performance and commerce event monitoring.

## Why this architecture?
- SSR/SSG helps product/category pages expose useful HTML, metadata and content for search and social link previews.
- A modular monolith is simpler to deploy, secure, monitor and maintain for a small business than a distributed microservice system.
- PostgreSQL is sufficient for an initial product catalogue, order system and filter queries.
- A provider adapter avoids coupling payment domain logic to a single gateway.
- Domain modules preserve separation without unnecessary network boundaries.

## Explicitly avoid
- Microservices/Kubernetes without proven scale/team need.
- Separate frontend and API deployments unless a concrete requirement justifies it.
- A pure client-only SPA without a deliberate SEO strategy.
- Two separate desktop/mobile codebases.
- Multiple overlapping animation/scroll libraries.
- Multiple ORMs or redundant UI libraries.
- Building loyalty, complex ERP, multi-vendor or customer account systems before core sales work.
- Client-side authoritative price, stock, tax, discount or payment calculations.

## Suggested domain modules
- catalog: products, variants/SKUs, categories, images, ingredients, allergens, labels.
- inventory: stock and stock movements.
- cart: cart and cart items.
- checkout: address, shipping quote, order creation.
- payments: payment attempts, webhook events, refunds.
- orders: order lifecycle and fulfilment.
- content: brand story, recipes, FAQs, social content.
- enquiries: WhatsApp and bulk enquiries.
- admin: roles, permissions, audit events.
- analytics: consent-aware event collection.

Keep one canonical SKU record. Store currency amounts as integer paise. Use UTC timestamps and display India local time. Use database constraints and transactions. Make order/payment operations idempotent.

Create `docs/adr/` and document major decisions: full vs selective 3D, app architecture, DB/ORM, payment provider, search, media pipeline, admin/auth and analytics/consent. Each ADR must state context, options, decision, trade-offs, consequences and reversal trigger.

---

# 7. Product and ecommerce UX

Implement:
- Home, Who We Are, category pages, All Products, product detail, search, cart, checkout, order confirmation, recipes (later phase), bulk enquiries, contact and legal pages.
- Product discovery with search, category, price, pack-size, availability and only verified attributes.
- Filters can be combined; active filters are visible/removable; clear all; result count; URL query state; useful empty states.
- Sorting: relevance, price ascending/descending, newest/popularity only if data supports them.
- Mobile filter drawer with applied count and clear controls.
- Product cards: category, standard, featured and compact recommendation variants.
- Product card information: real image, product name, price, net quantity, availability and clear CTA.
- Product details: real package images, ingredients/allergens/nutrition only from verified source, pack size, price, availability, use/storage guidance, applicable label details and clear purchase action.
- Hybrid checkout: guest checkout, trusted payment gateway, server-verified signed webhooks, idempotency and clear order status.
- WhatsApp is an alternative enquiry route; a chat click is not a confirmed paid order.
- Bulk/wholesale enquiry flow.
- No fake reviews, false urgency, fabricated ratings or misleading badges.

Use one product data source for homepage, categories, search, all-products, recommendations and product detail. Do not duplicate product objects across pages.

---

# 8. Desktop and mobile are different experiences, not different sites

Shared:
- URLs, product data, APIs, business rules, cart, checkout, SEO content and analytics.

Desktop:
- Cinematic hero, expansive editorial grid, hover states, horizontal product strip, selected pinned storytelling, generous product cards and pointer-specific microinteractions.

Mobile:
- Fast product-led first screen, compact brand introduction, native vertical scroll, swipeable product rails, bottom navigation if useful, filter drawer, large touch targets and simplified transitions.

Detect viewport with responsive CSS/container queries and capabilities with feature detection. Do not rely only on user-agent. Test phones, tablets, laptops and wide desktops. Never hide product information on mobile.

---

# 9. Security, privacy, compliance and trust

Treat security as a release gate:
- OWASP ASVS 5.0 verification baseline.
- HTTPS, secure session cookies, CSRF protection where applicable, CSP, HSTS after correct deployment, rate limits and RBAC.
- MFA for admin, least privilege, audit logging.
- Password hashing using a modern approved algorithm if passwords exist.
- Server-side validation, parameterised DB access, output encoding and strict input schemas.
- Protect XSS, SQL injection, CSRF, SSRF, IDOR/BOLA, broken access control, upload abuse, path traversal and payment webhook replay.
- No secrets in client bundle, source control, logs or error messages.
- Hosted/tokenised payment only; never store raw card details.
- Signed webhook verification and idempotency.
- Encrypted backups and restore test.
- Data minimisation, clear privacy notice, retention policy and consent-aware analytics.
- India-specific FSSAI, packaged-food labelling, consumer ecommerce, DPDP, GST and Legal Metrology requirements must be checked against current official rules and actual business records before launch.
- Do not invent FSSAI numbers, legal entity details, grievance officer, certifications, nutrition or health claims.

---

# 10. Social acquisition and measurement

Use the social identifiers recorded in `gemini.md`:
- Instagram: `@madurai_anantha_masala` — https://www.instagram.com/madurai_anantha_masala/
- YouTube channel ID: `UC1OQf18IUzjz915mYT2wXLQ` — https://www.youtube.com/channel/UC1OQf18IUzjz915mYT2wXLQ
- Public business contact shown in bio: `9843887337` (verify before launch).

Use the previously collected public Reel/video identifiers and metrics only as historical snapshots. Refresh before claiming current performance. Do not infer visual content from videos that were not actually viewed.

Implement:
- Social profile links and compliant embeds.
- Campaign-specific landing pages and UTM tags.
- Events: landing, product/category view, search, filter, add/remove cart, checkout, payment attempt, purchase, WhatsApp click, bulk enquiry and recipe/social click.
- Never send PII/payment data into analytics.
- Distinguish reach/plays from actual website conversions.
- Never expose social API tokens or passwords in the browser or repository.
- Only integrate through authorised APIs/embeds after credentials and permissions are configured.

---

# 11. Quality, performance and accessibility gates

Target:
- Core Web Vitals at 75th percentile: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- WCAG 2.2 AA.
- Initial mobile route JS target <= 200 KB compressed before optional 3D/analytics; document justified exceptions.
- 3D chunks/assets must be route-scoped and lazy-loaded.
- Test throttled mobile CPU/network and actual low/mid-range Android hardware.
- Reserve image/video dimensions, optimise AVIF/WebP, responsive images, font subsets, code splitting and caching.
- Full keyboard operation, visible focus, screen-reader labels/status, sufficient contrast and reduced motion.
- WebGL fallback tested, including context loss and disabled hardware.
- Test cart/checkout with duplicate clicks, network failure, payment pending, payment failure, webhook retries and refresh.

Quality score /100:
- Brand/visual 10
- Product discovery 10
- Product/checkout UX 15
- Responsive UX 10
- Motion 10
- Accessibility 10
- Performance 10
- Security/privacy 15
- SEO/content 5
- Maintainability/testing/observability 5

Score with evidence. Critical security, payment, privacy, legal or food-information defects block release regardless of score.

---

# 12. Implementation phases and deliverables

## Phase 0 — Audit
Deliver repository map, current stack, asset manifest (35/35), baseline score, risks, missing facts and recommended roadmap.

## Phase 1 — Product truth and content model
Create verified product/SKU manifest, image map, category taxonomy, design tokens and pending-business-data list.

## Phase 2 — UX and architecture
Create sitemap, customer journeys, desktop/mobile wireframes, system diagram, data model and ADRs. Prototype the risky 3D hero separately and compare it against a 2.5D alternative.

## Phase 3 — Visual foundation
Build typography, tokens, navigation, cards, buttons, forms, product gallery, responsive primitives and motion rules.

## Phase 4 — Main storefront
Implement home, story, category pages, global catalogue, search, filters, sort, product details.

## Phase 5 — Commerce
Implement cart, guest checkout, payment adapter, webhooks, order confirmation, admin order handling and WhatsApp enquiry.

## Phase 6 — Trust, SEO and integrations
Legal/product information, social links/embeds, analytics, SEO metadata/schema, privacy/consent and support.

## Phase 7 — Hardening
Security, accessibility, performance, browser/device, payment failure and restore testing.

## Phase 8 — Launch and continuous improvement
Staging signoff, deployment, monitoring, baseline metrics, changelog and prioritised improvement backlog.

For every phase, provide:
- Files/features changed.
- Design/architecture decisions and trade-offs.
- Screenshots or preview.
- Tests run and results.
- Updated score with evidence.
- Critical/high/medium/low defects.
- Next best improvement.

Do not skip tests or claim success without evidence.

---

# 13. First response expected from you

After reading `gemini.md` and this prompt, do NOT immediately generate the whole website.

Return:
1. Repository audit summary.
2. 35-image asset audit status (identify all files and what is still uncertain).
3. Current architecture and whether a codebase already exists.
4. Recommended architecture with trade-offs and why.
5. Full-3D vs hybrid decision with a small proof-of-concept plan and measurable go/no-go criteria.
6. Initial ADR list.
7. Phased implementation plan with acceptance criteria.
8. Baseline score /100 and top 10 problems.

Then start Phase 0/1 work and continue autonomously. Routine decisions should not be escalated as questions. Do not fabricate missing information.

**Final principle:** Build an exceptional brand experience, not a technology demo. The user should remember the brand, find the product, trust the information and complete the purchase with minimum friction. ALWAYS IMPROVE.
