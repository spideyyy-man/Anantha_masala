# ADR-008: Search, Tamil/English Transliteration & Multi-Facet Catalogue Filtering
- **Date:** 2026-11-24
- **Status:** Accepted

## Context
Customers search South Indian foods using mixed English, Tamil script, and phonetic transliterations (e.g., `turmeric` / `manjal` / `மஞ்சள்`, `garlic` / `poondu`, `horse gram` / `kollu`, `sesame` / `ellu`, `fish` / `meen`, `black rice` / `kavuni`, `bath powder` / `nalangu`). With 25 canonical products, search must be instant, forgiving of phonetic variants, URL-shareable, and zero-infrastructure-bloat.

## Options Considered
1. **Meilisearch / Algolia external search SaaS** (overkill for 25 SKUs, extra credential/cost dependency)
2. **Simple substring match on English title only** (fails Tamil & regional queries)
3. **PostgreSQL canonical catalog + bilingual synonym/transliteration index + URL-synchronized multi-facet filtering (Selected)**

## Decision
- Single canonical catalog query service (`src/domain/catalog/service.ts`) backed by PostgreSQL tables.
- Expand query tokens using a curated South Indian culinary synonym/transliteration dictionary (Tamil Unicode + Romanized Tamil + English culinary equivalents) scored by weighted relevance (exact title > Tamil title > synonym/use-case > category).
- Never return irrelevant results silently; return explicit empty state with curated suggestions and WhatsApp product request CTA.
- All filters (category, pack size, price bracket, availability, dietary/product-type, culinary use-case) are 100% data-driven from verified SKU attributes and persisted in clean shareable URL query parameters (`/products?category=...&size=...&sort=...`).

## Reversal Trigger
Introduce PostgreSQL `pg_trgm` trigram indexes or Meilisearch if catalog grows beyond 500 SKUs or search latency exceeds 150ms p95.
