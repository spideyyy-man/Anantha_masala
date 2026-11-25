# Neon deployment and service configuration

The production backend uses the Neon `production` branch linked in `.neon`.

## Services

- PostgreSQL: Drizzle ORM over the existing `pg` / node-postgres driver.
- Object Storage: private S3-compatible bucket named `assets`.

Product photographs and other files shipped in `public/` remain static Vercel assets. They should not be copied into the private bucket: they are part of the deployable frontend bundle and benefit from Vercel's static asset delivery. The private bucket adapter is for future private uploads, documents, and generated files.

## Environment variables

`neon env pull` populates `.env.local`. Never commit that file.

- `DATABASE_URL`: pooled Neon connection string for application requests and Vercel serverless concurrency.
- `DATABASE_URL_UNPOOLED`: direct Neon connection string for migrations and administrative tasks only.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`: branch-scoped Neon Object Storage credentials.

In Vercel Project Settings → Environment Variables, add the production values from `.env.local` for both `DATABASE_URL` and the four `AWS_*` variables. Add `DATABASE_URL_UNPOOLED` only if deployment-time migrations are intentionally run there; prefer running migrations as a controlled release step with the direct URL. Redeploy after setting variables.

Do not expose any of these variables with a `NEXT_PUBLIC_` prefix.

## Database operations

- Run `npm run db:migrate` with `DATABASE_URL` set to `DATABASE_URL_UNPOOLED` for schema/bootstrap operations.
- The application runtime uses pooled `DATABASE_URL` and attaches its pool to Vercel Fluid lifecycle management.
- Production refuses to silently fall back to local PGlite if `DATABASE_URL` is missing.

## Object Storage

`src/lib/object-storage.ts` exposes private upload, download, delete, and time-limited signed-download helpers. The S3 client uses path-style addressing as required by Neon. `npm run storage:smoke` performs a real upload → download/byte verification → delete cycle against the private `assets` bucket.

## Verification

- `npm run build`
- `npm run storage:smoke`
- `GET /api/health` must report `databaseMode: postgres` and a non-zero catalogue count.
- `GET /api/catalog`, `GET /api/cart`, `/`, `/products`, and `/categories` should return HTTP 200.
