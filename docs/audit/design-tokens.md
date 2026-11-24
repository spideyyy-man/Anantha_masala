# Madurai Aanandha Masala — Unified Design Token System
**Updated:** 24 November 2026

## 1. Deliberate Colour Architecture
Every surface, text token, and interactive state derives directly from authentic Madurai Aanandha Masala packaging while guaranteeing WCAG 2.2 AA+ readability and making product packaging the undisputed visual hero.

| Role | Token | Hex | Usage Rule |
|---|---|---|---|
| **Primary Canvas** | `--bg-canvas` | `#FBF6EE` | Main sunlit ivory parchment page canvas |
| **Warm Rhythm Band** | `--bg-sand` | `#F2E6D3` | Subtle alternating section surface (Category Explorer, Trust Ledger) — eliminates jarring dark/light disco jumps |
| **Elevated Card Surface** | `--bg-surface` | `#FFFDF9` | Crisp ivory cards, forms, checkout, filter sidebar |
| **Luminous Packaging Stage** | `--bg-stage` | `#F4E8D6` | Default warm studio backdrop behind floating real pouches so BOTH dark labels (*Ulundhu Kali*, *Kollu Idli Podi*) and light labels (*Manjal Podi*, *Idli Milagai Podi*) maintain crisp edge contrast |
| **Deep Anchor Surface** | `--bg-deep` | `#23130D` | Reserved intentionally for Opening Hero Theatre, Footer, and high-contrast pill badges — never randomly placed mid-page behind dark pouches |
| **Primary Brand Accent** | `--brand-crimson` | `#9E1B1E` | All primary purchase & conversion actions (`Add to Bag`, `Shop All`, `Checkout`) — hover `#7E1417` (>7.2:1 contrast with white) |
| **Botanical Secondary** | `--brand-leaf` | `#1C5C33` | Veg marks, In-Stock indicators, WhatsApp enquiry buttons, verified badges (>7.6:1 contrast with white) |
| **Restrained Turmeric Highlight** | `--brand-turmeric` | `#C88A12` / `#E7B032` | Eyebrow kickers, active dock indicators, focus highlights on dark surfaces — never cluttered decorative outlines |
| **Primary Ink** | `--text-primary` | `#1F120C` | Headings & primary copy (>15:1 contrast on `#FBF6EE`) |
| **Secondary Ink** | `--text-secondary` | `#52392D` | Descriptions & body paragraphs (>7.8:1 contrast on `#FBF6EE`) |
| **Muted Meta Ink** | `--text-muted` | `#6B4F41` | Breadcrumbs, SKU metadata, per-100g unit prices (>5.6:1 contrast on `#FBF6EE`) |

## 2. Typography Scale
- **Editorial Display (`--font-display`):** `Fraunces` (soft serif, weights 500–700)
- **UI & Body (`--font-sans`):** `Plus Jakarta Sans` (weights 400–700)
- **Tamil Script (`--font-tamil`):** `Noto Sans Tamil` (weights 400–700, `line-height: 1.45` for crisp conjuncts)
- **Tabular Numerals (`--font-mono`):** `JetBrains Mono` (`font-variant-numeric: tabular-nums` for prices, weights, SKU codes)

## 3. Product Card Hierarchy (4 Unified Variants)
1. **Featured Card:** Expressive sunlit stage, oversized floating pouch, clear English + Tamil title, concise story, prominent price & instant Add-to-Bag.
2. **Standard Catalogue Card:** Clean `aspect-[5/6]` luminous stage, pouch occupies ~88% of stage height, zero colliding background text, crisp hover levitation.
3. **Moving Showcase Card:** Built for the continuous dual-row infinite loop (`w-[272px]–[296px]`), bold recognizable packaging, quick price + hover/tap action.
4. **Compact Recommendation Card:** Horizontal layout for cart & related products.
