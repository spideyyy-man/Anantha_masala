import type { Metadata } from 'next';
import { queryCatalog, type CatalogFilterInput } from '@/domain/catalog/service';
import { CatalogExplorer } from '@/components/catalog/CatalogExplorer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Products — Madurai Masalas, Podis, Flours & Mixes',
  description:
    'Filter and search all 25 audited Madurai Aanandha Masala products by category, pack size (50g–250g), price, availability, and Tamil or English name.',
  alternates: { canonical: '/products' },
};

function parseSearchParams(sp: Record<string, string | string[] | undefined>): CatalogFilterInput {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const splitList = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(',')).filter(Boolean);

  const cats = splitList(sp.category);
  const sizes = splitList(sp.size)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const uses = splitList(sp.use);
  const maxPriceRaw = first(sp.maxPrice);
  const maxPriceInr = maxPriceRaw && Number.isFinite(Number(maxPriceRaw)) ? Number(maxPriceRaw) : undefined;
  const sortRaw = first(sp.sort);
  const availRaw = first(sp.availability);
  const typeRaw = first(sp.type);

  return {
    q: first(sp.q),
    categories: cats.length ? cats : undefined,
    packSizes: sizes.length ? sizes : undefined,
    useCases: uses.length ? uses : undefined,
    maxPriceInr,
    availability: availRaw === 'in_stock' || availRaw === 'enquiry_only' ? availRaw : 'all',
    productType: typeRaw === 'edible' || typeRaw === 'herbal_care' ? typeRaw : 'all',
    sort:
      sortRaw === 'price_asc' || sortRaw === 'price_desc' || sortRaw === 'name_asc'
        ? sortRaw
        : 'relevance',
  };
}

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseSearchParams(sp);
  const data = await queryCatalog(filters);

  return (
    <CatalogExplorer
      initialProducts={data.products}
      facets={data.facets}
      initialFilters={filters}
      heading="Madurai Pantry"
      subheading="All 25 audited Madurai Aanandha Masala packs — filter by collection, pack size, kitchen use, or search in Tamil and English."
      basePath="/products"
    />
  );
}
