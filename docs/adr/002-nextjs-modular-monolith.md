# ADR-002: Next.js App Router Modular Monolith vs SPA + Separate API
- **Date:** 2026-11-24
- **Status:** Accepted

## Context
The repository starts assets-only. Aanandha Masala requires strong SEO/OpenGraph previews for Instagram/YouTube deep links, server-authoritative pricing/orders/payments, admin management, and low operational overhead for a growing regional brand.

## Options Considered
1. **React SPA (Vite) + separate Express API deployment**
2. **Microservices architecture**
3. **Next.js App Router + TypeScript Modular Monolith (Selected)**

## Decision
Build a **Next.js App Router + TypeScript modular monolith** with clean domain boundaries (`src/domain/catalog`, `cart`, `checkout`, `orders`, `payments`, `enquiries`, `admin`, `analytics`, `content`) separated cleanly from UI components and Next.js route handlers.

## Benefits & Trade-offs
- **Benefits:** Native SSR/SSG metadata & JSON-LD for every product/category, single deployment & security perimeter, shared Zod validation schemas between server and client, server-authoritative commerce calculations without cross-origin cookie friction.
- **Trade-offs:** Tighter coupling to Next.js runtime conventions; mitigated by keeping pure business logic inside `src/domain/*`.

## Reversal Trigger
Extract standalone worker/API services only if background order fulfillment, ERP sync, or multi-region traffic saturates the monolith beyond vertical/serverless scaling limits.
