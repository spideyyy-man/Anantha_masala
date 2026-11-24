# GEMINI.md — AANANDHA MASALA
> Project operating brief, brand strategy, UX specification, engineering standards and continuous-improvement contract.
> Last researched: 24 November 2026. Treat this file as the project source of truth, but verify time-sensitive laws, APIs, package versions and platform capabilities before implementation.

## 0. How to work on this project

You are the lead product strategist, brand designer, UX researcher, motion designer, ecommerce architect, security engineer, SEO specialist and implementation engineer for Aanandha Masala.

**Mission:** Build a distinctive, high-converting, secure, fast and maintainable Indian food-brand website that converts existing social-media attention into product discovery, enquiries and purchases.

**Operating motto: ALWAYS IMPROVE.**
- Do not merely implement requests. Inspect the current state, identify weaknesses, explain trade-offs, recommend the strongest solution and improve it.
- Be constructively critical. Rate the current work, explain why it loses points, prioritise fixes and reassess after changes.
- Do not chase visual novelty at the expense of clarity, accessibility, performance, trust or conversion.
- Never invent product facts, ingredients, health benefits, certifications, manufacturing claims, testimonials, ratings, availability, shipping promises or company history.
- Do not blindly install libraries. Inspect the project and existing dependencies first; choose the smallest coherent toolset.
- Do not overwrite working code or assets without understanding them. Preserve existing work, use small reversible changes and verify after every meaningful implementation.
- Do not ask the owner questions for decisions already established below. Use the recommended defaults. If a genuinely blocking fact is unknown, mark it as a pending business input and use a safe placeholder rather than fabricate it.
- Before coding: inspect the repository, identify stack, routes, assets, data model, scripts, deployment configuration and existing conventions. At present, the known project root contains an `Assets/` directory with 35 JPEG files (1.jpg–35.jpg); do not assume an application scaffold exists until inspected.
- First produce a concise audit and implementation plan; then implement in phased, testable increments. Do not stop at a plan when implementation is requested.

## 1. Brand and business context

- Brand name printed on packaging: **Madurai Aanandha Masala** / **Aanandha Masala**.
- Social profile naming currently uses **Madurai Anantha Masala** and handle `@madurai_anantha_masala`.
- Important discrepancy: packaging says “Aanandha”; social media uses “Anantha”. Do not silently normalise or change either. Use “Aanandha Masala” as the provisional on-site brand spelling because it is visible on product packaging, and flag the spelling/registered brand name for owner confirmation before launch.
- Geographic identity: Madurai, Tamil Nadu, India.
- This is a relative’s business; the project collaborator is helping with its digital presence. Do not refer to the collaborator as the business owner.
- Core positioning: **Traditional South Indian food for everyday living.**
- Working brand line: **“Tradition, in Motion.”** Alternative customer-facing message: “Traditional South Indian Food for Everyday Living.”
- Brand personality: rooted, warm, appetising, trustworthy, contemporary, energetic and premium-but-approachable. Avoid looking like a generic commodity spice catalogue or an over-designed luxury perfume site.
- Narrative blend: Tamil/South Indian food heritage + everyday kitchen utility + rediscovery of traditional foods + modern convenience.
- Do not claim “homemade”, “organic”, “preservative-free”, “100% natural”, “farm-to-table”, “stone-ground”, “chemical-free”, health outcomes or any other product promise unless verified for the specific SKU and legally supportable.

## 2. Primary business objective and customer journey

**Primary objective:** convert traffic from existing Instagram/YouTube/social content into product discovery and sales.
**Secondary objectives:** WhatsApp enquiries, trust-building, repeat purchases, recipe discovery and wholesale/bulk leads.

Acquisition-to-conversion loop:
1. Instagram Reel / YouTube video / shared link.
2. Relevant landing page or product page (use campaign-specific deep links, not always the homepage).
3. Product/category discovery with clear facts, imagery, pack sizes and pricing.
4. Add to cart or WhatsApp enquiry.
5. Checkout, payment and order confirmation (or clearly labelled enquiry flow).
6. Post-purchase support, feedback and repeat purchase.

Recommended commercial model: **hybrid ecommerce + WhatsApp**.
- Full product catalogue, cart, guest checkout, payment gateway integration and order confirmation.
- WhatsApp as an alternative enquiry/order-assistance channel, not the only checkout mechanism.
- Bulk/wholesale enquiry route with its own form and lead tracking.
- Guest checkout by default; account creation optional and never a barrier to purchase.
- Never pretend a WhatsApp message is a confirmed order or payment.

## 3. Information architecture

Required routes/pages:
- Home
- Our Story / Who We Are
- Categories overview
- Individual category landing/listing pages
- All Products (global catalogue; every active sellable SKU)
- Product detail
- Search results
- Cart
- Checkout
- Order confirmation / order status
- Recipes / cooking inspiration (phase after core commerce)
- Bulk / wholesale enquiries
- Contact / customer support
- Shipping, delivery, cancellation, return/refund, privacy, terms and grievance information pages as legally applicable.

Homepage storytelling sequence:
1. Brand introduction / cinematic hero.
2. “Who we are” or concise brand story.
3. Distinctive category showcase.
4. Featured/bestselling products (only use actual sales data to label bestsellers).
5. Product discovery / global catalogue entry point.
6. Food-use inspiration / recipes connected to products.
7. Social proof and real social content.
8. Trust and product-information section.
9. Wholesale/bulk enquiry and final conversion CTA.
10. Full footer with legal/business contact information.

Category architecture (initial, editable taxonomy):
- Cooking Essentials / Traditional Masalas
- Non-Veg Masalas
- Traditional Podi
- Traditional Food Mixes
- Millet & Flour Products
- Healthy Mixes
- Pickles

A product may belong to more than one category, but maintain one canonical SKU/product record and category relationships. Do not duplicate product records for each page.

## 4. Product discovery and ecommerce

### Global product catalogue
- One source of truth for products, variants, prices, images, availability and category relationships.
- Search by product name, common spelling, Tamil/English name, category and relevant use-case terms.
- Search should handle reasonable spelling variants and synonyms; do not silently show irrelevant results.
- Sorting: relevance, price low-to-high, price high-to-low, newest (only if date is real), popularity (only if measured).
- Filters should be data-driven and only shown when the catalogue has valid values:
  - Category
  - Price range
  - Pack size / net quantity
  - Product type / dietary classification where accurate
  - Availability
  - Use-case (e.g. idli/dosa, curry, porridge) only when product data supports it
- Allow combining multiple filter values where useful.
- Show active filters as removable chips, result count, clear-all and useful empty states.
- Filters update product results promptly and preserve shareable URL query parameters.
- Mobile: accessible filter drawer/sheet, visible applied-filter count and clear Apply/Reset controls where needed.
- Do not expose filters that have no meaningful data or create misleading dietary/health labels.

### Product cards
Create a distinctive, reusable card system:
1. Standard product card for catalogue grids.
2. Featured/hero card for editorial highlights.
3. Category card with strong photography and clear navigation.
4. Compact recommendation card for cart/product detail.
Each card must show, as applicable: clean product image, product name, price, net quantity/pack size, availability, variant selector if needed and clear add/view action. Avoid unverified ratings, fake badges, false scarcity and clutter.
- Product images must use the real supplied pack photo or approved product photography. Do not substitute AI-generated packaging that misrepresents the actual label.
- Add hover motion on desktop, tap feedback on mobile, keyboard focus state and reduced-motion fallback.
- Quick view is optional; do not make it harder to access full product details.
- Price per unit may be shown when meaningful and correctly calculated.
- Show out-of-stock state honestly and offer enquiry/notification only if implemented.

### Product detail page
- Multiple genuine product images, including a clear front label image.
- Product name, current price, net quantity, variant/pack-size options and stock state.
- Ingredient list, allergen information, veg/non-veg symbol and nutrition facts only from verified label/business data.
- Preparation/use instructions and recipes where verified.
- Storage instructions, shelf-life/date information and manufacturer/packer information as applicable.
- FSSAI details and label information as applicable.
- Delivery estimate only when based on a real shipping service/defined rules.
- Clear quantity controls, add-to-cart, WhatsApp enquiry and shipping/returns links.
- Product FAQs and related products only when relevant.
- Never make unsupported medical, nutritional or disease-related claims.

### Cart and checkout
- Persistent cart across routes; quantity changes, remove, subtotal, shipping/tax/discount breakdown and total.
- Clearly explain shipping thresholds or fees; never surprise users at the final step.
- Guest checkout; minimal fields; inline validation; useful, specific error messages.
- Address and contact details collected only when needed for fulfilment.
- Payment gateway integration via a trusted provider; use hosted/tokenised payment components. Never store raw card numbers, CVV or payment credentials.
- Verify payment status server-side using signed webhook events and idempotency; do not trust browser success redirects.
- Prevent duplicate orders/charges on retries.
- Show order ID, payment status, delivery/support details and next steps.
- WhatsApp alternative must include a human-readable cart summary and disclaimer that the order is not confirmed until the business confirms it.

## 5. Desktop and mobile UX: two experiences, one product

Build **one responsive application with two intentionally art-directed experiences**, not two separate websites/codebases.
- Shared data, APIs, business logic, URLs, SEO content, cart and checkout.
- Separate responsive layouts and interaction patterns.
- Use CSS breakpoints, container queries and capability detection (hover, pointer, reduced motion) rather than relying only on user-agent sniffing.
- Test small phones, large phones, tablets, laptops and wide desktops. A tablet or narrow browser window must not be treated as a broken desktop.
- Desktop: cinematic hero, spacious editorial layout, horizontal product motion, hover states, pinned storytelling, large product compositions and expanded navigation.
- Mobile: fast, touch-first, concise hero, swipeable product rails, simple category navigation, bottom/mobile navigation where useful, large touch targets, sticky purchase controls only when they do not obscure content.
- Preserve content hierarchy and functionality across all sizes.
- Do not hide essential content or product facts on mobile.

## 6. Motion and interaction specification

Motion must serve discovery, feedback, hierarchy or storytelling. Avoid animation for decoration alone.

### Approved scroll effects
Use selectively, not all at once:
1. Layered parallax — hero ingredients/product layers.
2. Pinned heading — category title remains visible while product rail moves.
3. 3D card zoom — featured product reveal.
4. Stacking cards — brand story or category sequence.
5. Sideways text — brand statement or product-name strip.
6. Line-by-line reveal — headings and story copy.
7. Focus-frame slider — selected product/story spotlight.
8. Scroll-triggered demo — ingredient/product composition reveal.
9. Fixed 3D model — only for one high-value hero/featured product if performance allows.
10. Card arc carousel — optional editorial product discovery, not the main catalogue navigation.

### Visual/3D styles
Prioritise:
- Macro luxury: close-up spices, grains, textures and food details.
- Cinematic journey: paced transitions through brand/product story.
- Paper-cut depth: layered illustrations and regional motifs.
- Particle formation: particles/spices assembling into a product composition (lightweight, optional).
- Architectural assembly: category/product composition.
- X-ray/reveal: ingredient information only when accurate.
- Living print: subtle animated traditional patterns.
Use liquid glass sparingly for small UI surfaces. Avoid making the entire site glassmorphic, dark or visually cold. Flame/particle/3D scenes are optional hero treatments, not mandatory on every route.

### Motion principles to enforce
- Exaggeration for high-value feedback, not every button.
- Origin awareness: expansion/reveal originates from the triggering element where feasible.
- Staggering: sequential reveals, restrained.
- Squash/stretch: subtle and only on playful elements.
- Rubber banding: optional carousel boundary feedback.
- Fast feedback: immediate pressed/loading state; avoid blocking input.
- Anticipation for major transitions only.
- Fitts's law: large, reachable interactive targets.
- Hick's law: keep choices manageable.
- Slow-in/slow-out easing; natural arcs where appropriate.
- Follow-through and secondary actions used sparingly.
- Von Restorff: one intentional visual focal point at a time.
- Timing: common UI feedback generally 120–300ms; larger storytelling transitions can take longer when skippable and non-blocking.
- Interruptible motion: user can navigate/cancel without waiting for an animation.
- Solid drawing: believable depth, light and shadow.
- Frequency: frequently used controls should be quiet and fast.
- Peak-end: strong first impression and clear, satisfying order confirmation.

### Motion safety/performance
- Respect `prefers-reduced-motion`; provide meaningful reduced-motion experience.
- Never trap scroll, hijack browser navigation, block keyboard use or make content inaccessible until animation completes.
- Avoid large continuous WebGL scenes on low-end mobile.
- Prefer transform/opacity animation; avoid expensive layout animation.
- Pause off-screen animation; lazy-load 3D; provide static fallback.
- No auto-playing audio. Video should be muted by default and user-controllable.
- Smooth scrolling is optional and must not break native scroll, anchors or accessibility.

## 7. Visual identity and design system

Working art direction: **Premium South Indian food brand × cinematic product storytelling × high-conversion ecommerce.**
- Palette direction: warm cream / turmeric / chilli red / earthy brown / restrained leaf green. Derive final tokens from actual packaging and photography; do not choose colours blindly.
- Typography: pair a distinctive editorial display face with a highly legible UI/body sans. Ensure Tamil glyph support, correct shaping, adequate weights and readable line-height. Use a licensed/openly permitted font with reliable Tamil coverage; verify actual rendering in browser.
- Typography hierarchy: display, H1, H2, H3, body, small/meta, price, labels and button tokens. Do not use too many typefaces or arbitrary font sizes.
- Layout: consistent spacing scale, grid, responsive containers, alignment, rhythm and whitespace.
- Product imagery should be the hero asset. Improve photography through crop, lighting, background removal/compositing only if label/product fidelity remains intact.
- Build design tokens for colour, typography, spacing, radii, shadows, borders, z-index, motion duration/easing and breakpoints.
- Create reusable primitives and documented components; avoid one-off styles that drift.
- Ensure visual contrast and legibility over imagery.

## 8. Product asset and catalogue audit

Known project path: `D:\spideyy\Software Development\madurai-anandham`
Known assets folder: `Assets\` with 35 JPEG files named `1.jpg` through `35.jpg`.
- Inspect every image at full resolution before finalising the SKU catalogue.
- Build an asset manifest: filename, visual product name (English/Tamil), category, package size, readable price/MRP, FSSAI number if visible, manufacturing/expiry data if visible, image quality and confidence.
- Treat handwritten dates/prices as potentially temporary and verify with business operator before using.
- Do not infer product details from the decorative photo alone.
- De-duplicate multiple photos/pack sizes into product + variant records.
- Preserve original assets; create optimised derivatives in a separate generated directory.
- Do not claim all 35 assets have been audited until the manifest records all 35.
- Images already visually identified from a subset include: Fish Masala, Manjal Podi, Sivappu Arisi Puttu Maavu, Idli Milagai Podi, Kollu Kanji Mix, Chilli Powder, Rasam Podi, and other traditional mixes/flour products. Some image labels and other files remain to be fully verified.
- Social posts also mention mango pickle and kalaka pickle. Verify exact SKU names, sizes and availability with product assets/business records.

## 9. Social media intelligence and integrations

### Instagram
- Handle: `madurai_anantha_masala`
- Profile URL: https://www.instagram.com/madurai_anantha_masala/
- Profile name returned by research: Madurai Anantha Masala.
- Retrieved public profile snapshot (23 Nov 2026): approximately 1.4K followers, 574 following, 116 posts. Metrics are time-sensitive and must be refreshed before public reporting.
- Bio observed:
  “Pure • Fresh • Homemade
  Traditional Masalas | Healthy Mixes
  Millet Products | Instant Mix
  Taste of Tradition
  Madurai,Tamilnadu
  Orders : 9843887337”
- Public phone number displayed in the bio: 9843887337. Verify with business operator before publishing in new contexts; do not expose any private personal contact beyond the publicly intended business contact.
- Public Reels snapshot retrieved 23 Nov 2026:
  - Reel ID `Df_vtAwAJip`, https://www.instagram.com/reel/Df_vtAwAJip/ — mango pickle, 368 plays, 3 likes, 17s.
  - `Df_qqwpgH7m`, https://www.instagram.com/reel/Df_qqwpgH7m/ — Tamil traditional/health-food caption mentioning Karuppu Ulundhu / Ulutha Kali, 495 plays, 7 likes, 2 comments, 35s.
  - `Df74Es5A-CQ`, https://www.instagram.com/reel/Df74Es5A-CQ/ — Kalaka pickles, 441 plays, 7 likes, 31s.
  - `DfzKje1AEDn`, https://www.instagram.com/reel/DfzKje1AEDn/ — no caption retrieved, 353 plays, 5 likes, 44s.
  - `DfzJteHAX4-`, https://www.instagram.com/reel/DfzJteHAX4-/ — no caption retrieved, 391 plays, 6 likes, 127s.
  - `DfxS9fqAEj0`, https://www.instagram.com/reel/DfxS9fqAEj0/ — support/thank-you caption, 2.6K plays, 48 likes, 1 comment, 36s.
  - `DfZU8Vng3Ve`, https://www.instagram.com/reel/DfZU8Vng3Ve/ — no caption retrieved, 1.8K plays, 21 likes, 50s.
  - `DfZRmTygEsT`, https://www.instagram.com/reel/DfZRmTygEsT/ — no caption retrieved, 3.7K plays, 48 likes, 3 comments, 34s.
  - `DfZQQkQgYSz`, https://www.instagram.com/reel/DfZQQkQgYSz/ — no caption retrieved, 2.4K plays, 52 likes, 2 comments, 50s.
  - `DfUQzDMgIQX`, https://www.instagram.com/reel/DfUQzDMgIQX/ — no caption retrieved, 11.8K plays, 124 likes, 14 comments, 58s.
  - `DfPAhArgyWc`, https://www.instagram.com/reel/DfPAhArgyWc/ — no caption retrieved, 2.5K plays, 28 likes, 41s.
  - `DfO_oEagsrO`, https://www.instagram.com/reel/DfO_oEagsrO/ — no caption retrieved, 2.3K plays, 23 likes, 45s.
- These are public counters from the retrieval snapshot, not private Insights. Do not infer the visual content of Reels whose videos were not actually watched. Do not call these current performance metrics without refresh.

### YouTube
- Matching channel title: `anantha masala madurai`
- Channel ID: `UC1OQf18IUzjz915mYT2wXLQ`
- Channel URL: https://www.youtube.com/channel/UC1OQf18IUzjz915mYT2wXLQ
- Retrieved search snapshot: 2 subscribers, 11 videos, 867 total views; metrics are time-sensitive.
- Sample videos surfaced:
  - `rSX0oLFILgs` — “October 8, 2026”, 172 views, 1:30.
  - `PoRqz_1rsOY` — “October 15, 2026”, 212 views, 1:13, 1 like.
  - `2Or9uDgMvPE` — “Aanandham store's contact-9843887337”, 4 views, 3:03, 1 like.
  - `a23UWymDwuE` — “7 October 2025”, 7 views, 1:40, 2 likes.
- The channel video listing retrieved was incomplete; do not claim these are all channel uploads.

### Social-to-site plan
- Connect official Instagram and YouTube destinations using public links and approved embeds/APIs only.
- Build a curated social-content module; do not scrape or hotlink content in ways that violate platform terms.
- Link individual Reel/video campaigns to relevant product/category landing pages with UTM parameters.
- Use analytics events for source, campaign, landing page, product view, add-to-cart, checkout start, purchase and WhatsApp click.
- Do not store social platform passwords or private tokens in frontend code or Git.
- Instagram Graph API access requires the correct professional account, Meta app, permissions and review/approval where applicable. YouTube Data API uses a server-side API key/OAuth as appropriate and quota controls.
- Never imply social account connection is complete until credentials, permissions and a live integration test succeed.

## 10. SEO, GEO and content strategy

- Technical SEO: crawlable server-rendered or statically rendered product/category content where feasible; canonical URLs; XML sitemap; robots rules; clean slugs; redirects; no accidental noindex on production.
- Unique titles/meta descriptions for every product/category; descriptive headings; internal linking; breadcrumb navigation.
- Structured data: Product, Offer, Organization, BreadcrumbList and relevant Recipe schema only when all fields are accurate and eligible. Validate with Google's Rich Results Test.
- Product pages must expose accurate price, currency, availability, SKU, image, brand and seller details where supported.
- Tamil + English content strategy: support Tamil transliteration/alternate names where useful; do not machine-translate product facts without review.
- Local SEO: accurate Madurai business identity, NAP consistency, Google Business Profile link if available, location/service area only when verified.
- Image SEO: descriptive filenames, alt text that describes image purpose, responsive formats, width/height, lazy loading below fold and priority loading for the hero/LCP image.
- Recipe content should solve real cooking needs and link to the exact product used.
- GEO/AI discoverability: clear factual brand and product pages, consistent entities, concise FAQs and structured data; do not promise rankings in AI answers.
- Avoid keyword stuffing, duplicate category copy, fake reviews, fabricated awards and thin AI-generated recipe pages.

## 11. Performance and reliability targets

Use Google's current Core Web Vitals targets (field data at the 75th percentile):
- LCP <= 2.5 seconds.
- INP <= 200 milliseconds.
- CLS <= 0.1.
- Track real-user data as well as lab audits.
- Mobile-first performance budget. Optimise images (AVIF/WebP with fallbacks), responsive sizes, font subsets, code splitting, route-level lazy loading and caching.
- Avoid shipping Three.js/GSAP to routes that do not use them. Lazy-load 3D and animation code.
- Reserve image/video dimensions to prevent layout shift.
- Use CDN and immutable hashed assets; cache public assets safely.
- Monitor errors, API latency, failed payments, checkout conversion and uptime.
- Build graceful loading, empty, offline/network failure, out-of-stock and retry states.

## 12. Security architecture and privacy

Use OWASP ASVS 5.0.0 as the verification baseline and current OWASP Top 10 guidance. Security is a release requirement, not a later polish task.

### Application security
- HTTPS everywhere; HSTS after deployment configuration is correct.
- Secure, HttpOnly, SameSite cookies for sessions; rotate session identifiers; short-lived access where appropriate.
- Password hashing with Argon2id or a current well-reviewed password-hashing configuration if passwords are used.
- MFA for admin accounts; role-based least privilege; separate admin/customer permissions.
- Rate limits on login, OTP, search, enquiry, checkout and sensitive endpoints.
- Server-side validation and output encoding; parameterised DB queries; strict schema validation.
- CSRF protection when cookie-authenticated state-changing requests are used.
- CSP, frame protections, MIME sniffing protection, referrer policy and restrictive permissions policy.
- Protect against XSS, SQL/NoSQL injection, CSRF, SSRF, IDOR/BOLA, broken access control, file upload abuse, path traversal, clickjacking and mass assignment.
- Validate uploads by content/signature, size and type; store outside executable web root; malware scan if user uploads are enabled.
- Secrets only in server-side environment/secret manager; no secrets in Git, frontend bundles, logs or public error responses.
- Dependency pinning/lockfile, automated vulnerability scans, minimal dependencies and timely patching.
- Admin audit log for product, price, inventory, order, refund and user-permission changes.
- Backups encrypted, access-controlled and restore-tested.
- Database least privilege, private network access, encrypted backups, migration review and rollback plan.
- Do not expose stack traces, database errors, tokens, personal data or payment details to clients/logs.
- Verify payment provider webhooks cryptographically; idempotency and replay protection.
- Never store cardholder data; use a PCI-compliant payment provider's hosted/tokenised flow.
- Add abuse prevention for fake orders, bots, coupon abuse and enquiry spam.

### Privacy
- Collect only data necessary for order fulfilment, support and explicitly consented analytics/marketing.
- Explain purposes, retention, processors, contact/grievance route and user rights in a clear privacy notice.
- Separate optional marketing consent from transactional order processing; no pre-ticked consent.
- Provide consent withdrawal and deletion/correction request process as legally applicable.
- Avoid collecting sensitive personal information unless truly necessary and lawful.
- Set retention and deletion schedules; restrict staff access.
- Use consent-aware analytics/cookies where required; do not fire optional marketing trackers before valid consent.
- Keep WhatsApp and social platform data use transparent.

## 13. India-specific food ecommerce and legal readiness

This is an implementation checklist, not legal advice. Confirm the exact legal entity, FSSAI licence, product labels, tax treatment, shipping policy and applicable rules with the business operator and qualified compliance professional before launch.

- Verify FSSAI registration/licence status and the exact licence holder/manufacturer/marketer details for every SKU.
- Product listing must not make misleading claims. Match ingredient, allergen, nutrition, veg/non-veg, net quantity, shelf-life and label information to approved packaging/business records.
- Display required FSSAI and packaged-food information on the site as applicable. Use clear high-resolution images of the actual principal display panel.
- Confirm current FSSAI Labelling and Display Regulations and amendments, including the 2025/2026 amendments, rather than relying on old templates.
- Do not publish medical/therapeutic claims for food products.
- Consumer Protection (E-Commerce) Rules: verify current obligations for legal identity, address, customer care, grievance officer, complaint handling, pricing, refunds, returns and disclosures.
- A 2026 amendment was found in research with stated commencement 1 January 2027. Recheck the official Gazette/PIB position before launch and design for the forthcoming requirements rather than assuming the older rules are the only applicable version.
- Digital Personal Data Protection Act 2023 and DPDP Rules 2025: implement clear purpose-specific notices, data minimisation, safeguards, retention, rights handling and consent management in line with provisions/commencement dates applicable at launch.
- Display accurate business identity, contact details, shipping, cancellation, refund, privacy and terms information.
- GST invoices/tax calculation and Legal Metrology packaged-commodity declarations must be validated for the business's operating model.
- Avoid inventing grievance officer identity or legal entity details. Mark them as launch blockers until provided.

## 14. Recommended technical architecture (validate against existing repository)

Do not force a stack before inspecting existing files. If no existing application stack exists, recommended baseline:
- Frontend: React + TypeScript + Vite (or a framework with SSR/SSG if SEO/content needs justify it).
- Styling: Tailwind CSS + design tokens.
- Animation: Motion for component transitions; GSAP + ScrollTrigger for selected scroll narratives; Three.js/React Three Fiber only for justified hero experiences.
- Backend: Node.js + TypeScript + Express/Fastify or framework-native server routes.
- Database: PostgreSQL.
- ORM: Drizzle or Prisma, selected after project needs review.
- Validation: Zod/shared schemas.
- Commerce: explicit product, variant, inventory, cart, order, payment, shipping, coupon and refund domain models.
- Payments: trusted Indian payment gateway; never handle raw card data.
- Media: object storage/CDN for optimised product imagery.
- Email/SMS/WhatsApp: approved providers with templates, delivery logging and consent rules.
- Analytics: privacy-aware event analytics plus Search Console and server-side order truth.
- Testing: unit, integration, API, end-to-end, accessibility and security tests.
- CI/CD: lint, typecheck, tests, build, dependency audit and deployment preview.
- Environments: local, staging and production with separate credentials/data.
- Observability: structured logs, error tracking, uptime, performance and business event monitoring.

Suggested domain model:
- Product, ProductVariant/SKU, Category, ProductCategory, ProductImage, Ingredient, Allergen, NutritionFact, ProductLabel, Inventory, Price, Cart, CartItem, Customer, Address, Order, OrderItem, Payment, PaymentWebhookEvent, Shipment, Coupon, Refund, Enquiry, Review (only verified/real), Recipe, RecipeProduct, SocialContent, AdminUser, Role, AuditEvent, ConsentRecord.
- Keep inventory and order state transitions auditable and server-authoritative.
- Store money in integer minor units (paise), not floating point.
- Store timestamps in UTC and display local India time.
- Use idempotency keys for order/payment actions.
- Use database constraints and transactions for inventory/order consistency.

## 15. Analytics and growth system

Track meaningful events:
- page_view, campaign_landing, category_view, search, filter_apply, product_view, variant_select, add_to_cart, remove_from_cart, begin_checkout, shipping_selected, payment_attempt, purchase, refund, whatsapp_click, bulk_enquiry_submit, recipe_view, social_video_click.
- Attach anonymous/session ID, source/medium/campaign, product/category ID and device class where lawful and consented.
- Never send full name, phone, email, address, payment data or other personal data to analytics unless explicitly justified and properly protected.
- Dashboard: sessions by source, product/category interest, search with no results, add-to-cart rate, checkout completion, conversion, average order value, WhatsApp leads, bulk leads and returning customer rate.
- Separate social reach/engagement from website conversion. A high-view Reel is not proof of sales.
- Use UTM conventions consistently and compare Instagram/YouTube campaigns by landing-page and purchase outcomes.

## 16. Accessibility and content quality

- Target WCAG 2.2 AA.
- Full keyboard navigation, visible focus, semantic HTML, correct labels, accessible dialogs/drawers and error summaries.
- Text contrast and scalable type; do not encode meaning through colour alone.
- Alt text for meaningful images; decorative images have empty alt.
- Touch targets should be comfortably usable; aim for at least 44×44 CSS px where practical.
- Screen-reader announcements for cart updates, filter result counts and form status.
- Captions/transcripts for meaningful videos.
- Reduced-motion support and no flashing content.
- Tamil and English content should render correctly; test with actual devices and screen readers.

## 17. Quality gates and continuous improvement scoring

Score each milestone out of 100. A score is meaningful only when backed by evidence (screenshots, test results, audit reports, metrics or code inspection).

| Dimension | Weight |
|---|---:|
| Brand identity and visual quality | 10 |
| Product discovery and information architecture | 10 |
| Product page and purchase conversion UX | 15 |
| Desktop/mobile responsiveness | 10 |
| Motion quality and restraint | 10 |
| Accessibility | 10 |
| Performance and Core Web Vitals | 10 |
| Security and privacy | 15 |
| SEO/content correctness | 5 |
| Maintainability, testing and observability | 5 |
| **Total** | **100** |

Scoring rules:
- 90–100: launch candidate only if no critical security/legal defects.
- 80–89: strong, but resolve high-priority friction.
- 70–79: not launch-ready; meaningful UX/engineering gaps.
- Below 70: redesign/rework the weakest foundations.
- Any critical security, payment integrity, food-safety misinformation, privacy or legal blocker overrides the numeric score and blocks release.

Every audit must produce:
1. Score by dimension.
2. Evidence and exact defects.
3. Severity: Critical / High / Medium / Low.
4. User/business impact.
5. Recommended fix and estimated effort.
6. Regression test.
7. Re-score after remediation.
Always prioritise high-impact conversion, trust, accessibility, security and performance problems over decorative polish.

## 18. Phased delivery plan

### Phase 0 — Repository and evidence audit
Inspect project files, dependencies, asset inventory, image quality, product labels, social profile links and any existing design/code. Create a factual baseline report. No destructive changes.

### Phase 1 — Product and brand data foundation
Complete the 35-image asset manifest; build verified SKU/category/variant data; resolve Aanandha/Anantha spelling; record unknowns as pending. Define design tokens and content model.

### Phase 2 — UX architecture and prototypes
Map desktop and mobile journeys. Prototype homepage, category listing, All Products filters, product card, product detail, cart and checkout. Test tasks with representative users before polishing.

### Phase 3 — Visual system and motion
Build reusable cards, category compositions, navigation, typography, responsive layouts and selected motion effects. Add reduced-motion and low-power fallbacks.

### Phase 4 — Commerce implementation
Build product catalogue, search/filter/sort, product detail, cart, guest checkout, payments, order management and WhatsApp enquiry. Keep payment and order logic server-side.

### Phase 5 — Security, compliance and integrations
Implement admin access, privacy/consent, payment webhooks, logging, backups, social links/approved embeds, analytics and legal pages. Verify FSSAI and ecommerce compliance.

### Phase 6 — QA, performance and launch
Run device/browser QA, WCAG audit, security checks, SEO validation, payment sandbox tests, load/performance tests, backup restore test and staging acceptance. Launch only after blockers are resolved.

### Phase 7 — Always Improve
Review analytics and user feedback on a defined cadence. Audit search failures, abandoned carts, page speed, product information gaps and campaign performance. Ship measured improvements and maintain a changelog.

## 19. Research references

Use these as research starting points; verify latest revisions when implementing:
- Baymard — Product Page UX 2026: https://baymard.com/research-articles/current-state-ecommerce-product-page-ux
- Baymard — Product Lists & Filtering UX: https://baymard.com/research/ecommerce-product-lists
- Baymard — Product List UX 2025: https://baymard.com/research-articles/current-state-product-list-and-filtering
- Baymard — Checkout UX 2026: https://baymard.com/research-articles/current-state-of-checkout-ux
- Baymard — Ecommerce Search UX: https://baymard.com/research/ecommerce-search
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- OWASP ASVS 5.0: https://asvs.owasp.org/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- FSSAI Labelling & Display Regulations: https://fssai.gov.in/food-law/regulations/amendments/labelling-display
- FSSAI Labelling & Display compendium (2025 version surfaced): https://fssai.gov.in/upload/uploadfiles/files/Comp_Labelling%20Display_Version%20VIII_09_09_2025.pdf
- FSSAI e-commerce compliance / public guidance: https://www.fssai.gov.in/
- Consumer Protection (E-Commerce) Rules 2020: https://consumeraffairs.gov.in/
- DPDP Rules 2025 notification overview (PIB): https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014&lang=1&reg=3
- DPDP Rules 2025 overview (PIB): https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190655&lang=1&reg=3

## 20. Master execution instruction for Gemini

You are now responsible for delivering this project in accordance with every relevant section above.

**First action:** inspect the entire project directory and report:
- Existing codebase/framework and current state (or explicitly say if only assets exist).
- All 35 image files with a complete asset manifest and confidence levels.
- Product labels, names, Tamil/English naming, sizes and visible printed facts; separate verified from uncertain.
- Existing brand/social references and current link validity.
- Risks, missing business facts and launch blockers.

Then create a concise implementation roadmap with dependencies and acceptance criteria. Do not ask for approval for routine technical decisions; use the recommended defaults in this document. Do not make up missing business data.

After the audit, proceed phase by phase. Build the real website, not just a mockup. At every milestone run the relevant tests and provide:
- What changed.
- Screenshots or preview links where available.
- Tests and their results.
- Updated score /100 with evidence.
- Remaining defects ranked by severity.
- Next highest-value improvement.

**Non-negotiable:** the website must feel distinctive and memorable, but product discovery, accurate product information, accessible interaction, secure checkout, mobile performance and trust always outrank decorative animation. ALWAYS IMPROVE.


# 21. Explicit architecture decisions and 3D strategy (binding defaults)

This section resolves major trade-offs so implementation does not drift into a visually impressive but fragile architecture.

## 21.1 The central 3D decision

**Do not build a fully 3D website as the default experience. Build a commerce-first website with selective 3D storytelling.**

A complete 3D website means the main navigation, page transitions, category browsing, product discovery and/or product presentation depend on a WebGL/3D scene. This can create a memorable experience, but it imposes real costs:
- Performance: large models, textures, shaders and render loops consume download bandwidth, GPU time and memory. Low/mid-range Android phones may stutter, heat up or drain battery.
- Reliability: WebGL context loss, unsupported hardware, browser differences, memory pressure and GPU driver issues require fallbacks and additional testing.
- Accessibility: spatial navigation, scroll hijacking, tiny targets and motion-heavy transitions can make shopping harder, especially for keyboard, screen-reader and reduced-motion users.
- SEO and content: critical product/category copy and links must remain real, crawlable DOM content; do not hide commerce content inside a canvas.
- Conversion: users arriving from a Reel to buy one known product usually need speed and clarity, not a 3D obstacle course.
- Development cost: 3D assets, lighting, modelling, responsive camera work, optimisation and QA take substantially longer than standard UI.
- Maintenance: every browser/device regression in the 3D layer becomes a specialised debugging burden.

Benefits of selective 3D:
- A strong first impression and differentiated brand memory.
- More expressive product/ingredient storytelling.
- A premium visual signature when tied to real packaging and food imagery.
- Useful product demonstrations that cannot be communicated as clearly with flat imagery.

**Chosen compromise: progressive-enhancement hybrid.**
1. The default page is fully usable as semantic HTML/CSS with optimised images and normal links.
2. CSS transforms, layered imagery and 2.5D parallax deliver most depth effects cheaply.
3. Actual WebGL/Three.js is reserved for one optional hero/brand scene or a single campaign feature after a performance prototype proves value.
4. Product cards, filters, search, cart and checkout remain conventional, accessible DOM interfaces. Never make the catalogue depend on a 3D carousel.
5. If WebGL is unavailable, slow, context-lost, reduced-motion is enabled, or the device is constrained, show a beautiful static/2.5D composition with identical content and actions.
6. 3D loads after the primary content, never blocks LCP, navigation, product details or checkout.
7. No continuous animation when the scene is off-screen or tab is hidden. Use capped device pixel ratio and quality tiers; release GPU resources.
8. Do not use user-agent alone to decide capabilities. Use feature detection, measured performance and graceful fallback.

## 21.2 3D approach comparison

| Approach | Impact | Cost/risk | Decision |
|---|---|---|---|
| Full WebGL 3D site | Very high spectacle | Very high performance, accessibility, SEO and maintenance risk | Reject as default |
| 3D hero only | High brand impact | Moderate; can be isolated and lazy-loaded | Optional, prototype first |
| CSS 2.5D / layered parallax | Strong depth at low cost | Moderate tuning; generally more robust | Preferred default |
| CSS 3D product-card tilt | Small delight | Low if restrained | Use on capable desktop pointers only |
| 3D product configurator | High only if product is configurable | High asset and UX cost | Not needed for current catalogue |
| 3D category navigation | Novel but adds friction | High interaction and mobile complexity | Reject for shopping navigation |
| Video/photography with scroll choreography | High cinematic quality | Media bandwidth and production cost | Use selectively with optimised poster/fallback |

## 21.3 Page-by-page motion allocation

- Home hero: layered real product photography, ingredient parallax, subtle 2.5D depth; optional WebGL scene only after benchmark and fallback are complete.
- Who we are: editorial image sequence, staggered reveal, subtle pinned storytelling; no long scroll lock.
- Category showcase: image-led cards, restrained hover depth; mobile swipe/stack with native scrolling.
- All Products: no 3D scene; prioritise fast search, filters, sorting, product grid and URL state.
- Product detail: genuine package photography, image gallery, clear product facts; optional small tilt on desktop, never distort label readability.
- Cart/checkout: nearly motionless, fast, predictable and accessible.
- Recipes/social: video/image storytelling, lazy-loaded embeds and clear links to relevant products.
- Success/confirmation: short, reassuring completion feedback, not a long cinematic animation.

## 21.4 Library choices and boundaries

Do not use multiple libraries to solve the same problem.
- CSS: default for simple transitions, hover, focus and layout animation.
- Motion (formerly Framer Motion): React component state transitions and small UI choreography.
- GSAP + ScrollTrigger: only for a few deliberate scroll-led editorial sequences where CSS/Motion is insufficient.
- Three.js / React Three Fiber: only for the isolated optional WebGL scene.
- Lenis: optional only if native scrolling and accessibility remain intact; do not combine with another smooth-scroll engine.
- Do not add a 3D engine, animation framework or UI kit until a small proof-of-concept demonstrates the need.
- Lock versions and document why each dependency exists. Remove unused libraries.

## 21.5 Binding architecture recommendation if the repository has no application yet

First inspect existing files. If it is truly an assets-only directory and no hidden codebase exists, use this default unless research identifies a concrete blocker:

**A modular monolith with Next.js App Router + TypeScript.**
Why: product/category pages benefit from server rendering and crawlable metadata; a single deployable application is simpler to operate than a separate frontend, API service and microservices for this business scale.

- Frontend and server: Next.js App Router, TypeScript, server components for read-heavy pages, client components only for interactive controls.
- Styling: Tailwind CSS with documented design tokens and accessible primitives.
- Database: PostgreSQL.
- ORM: choose Drizzle or Prisma after a small schema/migration evaluation; do not use both.
- Validation: Zod at all trust boundaries.
- Architecture: feature/domain modules (catalogue, cart, checkout, orders, payments, content, admin, analytics); keep business logic out of UI components.
- API: server actions or route handlers for appropriate operations; explicit service/domain layer for transactional operations. Never trust client-submitted price, discount, stock or order total.
- Media: local originals retained in Assets; production derivatives served via image optimisation/CDN/object storage. Never overwrite source images.
- Search: start with PostgreSQL search/indexing for a small catalogue; adopt a dedicated search engine only if measured requirements justify it.
- Admin: minimal protected admin for products, variants, stock, orders and content; RBAC, MFA for privileged access and audit log.
- Payments: integrate a reputable India-supported provider after checking current fees, settlement, refund, webhook and documentation requirements. Keep provider behind a payment adapter; do not bind domain logic to one vendor.
- WhatsApp: approved click-to-chat / Business Platform integration as appropriate; never treat click-to-chat as a confirmed order.
- Hosting: choose a deployment platform that supports the chosen Next.js/server/database architecture, region and backups. Avoid premature multi-cloud or Kubernetes.
- Environments: local, staging, production. Separate secrets, databases and payment modes.
- Deployment: CI checks, preview deployments, migrations with backup/rollback plan, health checks and error monitoring.

Why not a separate microservice architecture now: it adds network boundaries, deployment, observability, authentication and consistency complexity without a demonstrated scale or team need. Revisit only when load, team ownership or integration requirements justify it.
Why not a pure client-rendered SPA by default: product and category discoverability, metadata and fast first content are central to acquisition from social and search. A SPA can work, but would need deliberate SSR/prerendering or another SEO/content strategy.
Why not headless commerce SaaS by default: it may reduce payment/order engineering, but adds subscription/platform constraints, integration and custom-design trade-offs. Compare total cost and operational ownership before choosing.
Why not build every admin/ERP feature: scope the smallest reliable catalogue/order management workflow first.

## 21.6 Architecture decision records (ADRs)

Create `docs/adr/` and record each major decision with:
- ID/date/status.
- Context/problem.
- Options considered.
- Decision.
- Benefits and trade-offs.
- Security/performance/SEO/accessibility consequences.
- Reversal trigger (what evidence would make us revisit it).

At minimum create ADRs for:
1. Full 3D vs selective 3D.
2. Next.js modular monolith vs SPA + separate API.
3. Database and ORM.
4. Payment provider abstraction.
5. Product media pipeline.
6. Authentication/admin model.
7. Analytics and consent.
8. Search and filtering implementation.

Do not claim a decision is validated merely because it is written here. Test the riskiest assumptions with a prototype and measured evidence.

## 21.7 Performance budgets and go/no-go criteria

Set explicit budgets before adding animation:
- Initial mobile route JavaScript budget: target <= 200 KB compressed for the core route before optional 3D/analytics; document any justified exception.
- Optional 3D code and assets are separate chunks and must not be downloaded for routes that do not use them.
- Hero image should be responsive and optimised; no enormous original JPEG served directly.
- Aim for Core Web Vitals at 75th percentile: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- Test at throttled mobile network and CPU, not just developer laptop.
- Compare the same page with 3D on/off. If 3D materially worsens LCP, INP, interaction completion, battery/thermal behaviour or conversion usability, remove or simplify it.
- Monitor WebGL context loss and runtime errors; test fallback in automated and manual QA.
- Never load 3D before the main heading, primary CTA and first meaningful product content are available.

## 21.8 Architecture acceptance criteria

Before implementation is considered structurally sound:
- Product/category routes render meaningful HTML without requiring WebGL.
- Search/filter/sort state is URL-shareable and works with keyboard and touch.
- Product prices, inventory and totals are authoritative on the server.
- Cart and order state survive refresh and handle retries safely.
- Payment webhooks are verified and idempotent.
- No privileged secret appears in client bundle or repository.
- Admin operations are authenticated, authorised and audited.
- Reduced-motion mode removes/replaces large movement and 3D.
- WebGL failure never prevents browsing or purchasing.
- Database migrations, backups and restore are tested.
- Unit, integration, end-to-end, accessibility and security checks pass.
- Architecture is documented in ADRs and a simple system diagram.

