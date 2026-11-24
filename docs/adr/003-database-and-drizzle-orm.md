# ADR-003: PostgreSQL + Drizzle ORM with Embedded PGlite Local Dev Fallback
- **Date:** 2026-11-24
- **Status:** Accepted

## Context
The commerce platform needs relational integrity, transactional stock/order consistency, integer-paise financial storage, UTC timestamps, audit logs, and parameterized SQL safety. Production targets managed PostgreSQL (`DATABASE_URL`), while local development/CI environments may lack pre-provisioned Postgres credentials.

## Options Considered
1. **Prisma + PostgreSQL** (heavier binary engine, slower cold starts)
2. **SQLite locally + PostgreSQL in prod** (dialect drift risk on constraints, JSONB, and full-text queries)
3. **Drizzle ORM (`pgTable` schema) + `node-postgres` (`DATABASE_URL`) with automatic embedded `PGlite` PostgreSQL fallback when `DATABASE_URL` is unset (Selected)**

## Decision
Use **Drizzle ORM** with a single canonical PostgreSQL schema (`src/db/schema.ts`).
- When `DATABASE_URL` is configured (staging/production), connect via `pg.Pool` (`drizzle-orm/node-postgres`).
- When `DATABASE_URL` is absent in local development/automated tests, automatically initialize persistent embedded PostgreSQL via `@electric-sql/pglite` (`drizzle-orm/pglite`) stored in `.data/pglite/`.
- All money fields are stored as integer paise (`integer`), all timestamps as `timestamp(..., { withTimezone: true })`.

## Benefits & Trade-offs
- **Benefits:** Zero SQL dialect drift between local and production, real PostgreSQL constraints/transactions/JSONB everywhere, lightweight TypeScript-first ORM, reproducible backup/restore scripts.
- **Trade-offs:** Local PGlite is single-process only; production must always configure a managed PostgreSQL `DATABASE_URL`.

## Reversal Trigger
Replace PGlite fallback with Docker Compose PostgreSQL if multi-worker local concurrency becomes mandatory during team growth.
