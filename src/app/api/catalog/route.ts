import { NextRequest, NextResponse } from 'next/server';
import { queryCatalog, type CatalogFilterInput } from '@/domain/catalog/service';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';
import { jsonError, logServerError } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const client = getClientIdentifier(request);
  const limit = checkRateLimit(`catalog:${client}`, 90, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many search requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const sp = request.nextUrl.searchParams;
    const rawCategories = sp.getAll('category').flatMap((v) => v.split(',')).filter(Boolean);
    const rawSizes = sp
      .getAll('size')
      .flatMap((v) => v.split(','))
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0);
    const rawUses = sp.getAll('use').flatMap((v) => v.split(',')).filter(Boolean);

    const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined;
    const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined;
    const sortParam = sp.get('sort') || 'relevance';
    const availParam = sp.get('availability') || 'all';
    const typeParam = sp.get('type') || 'all';

    const input: CatalogFilterInput = {
      q: sp.get('q')?.slice(0, 100) || undefined,
      categories: rawCategories.length ? rawCategories : undefined,
      packSizes: rawSizes.length ? rawSizes : undefined,
      minPriceInr: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPriceInr: Number.isFinite(maxPrice) ? maxPrice : undefined,
      availability:
        availParam === 'in_stock' || availParam === 'enquiry_only' ? availParam : 'all',
      productType:
        typeParam === 'edible' || typeParam === 'herbal_care' ? typeParam : 'all',
      useCases: rawUses.length ? rawUses : undefined,
      sort:
        sortParam === 'price_asc' || sortParam === 'price_desc' || sortParam === 'name_asc'
          ? sortParam
          : 'relevance',
    };

    const result = await queryCatalog(input);
    return NextResponse.json(result);
  } catch (err) {
    logServerError('GET /api/catalog', err);
    return jsonError('Could not load product catalogue.', 500);
  }
}
