import type { Metadata } from 'next';
import { queryCatalog, type CatalogFilterInput } from '@/domain/catalog/service';
import { CatalogExplorer } from '@/components/catalog/CatalogExplorer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search Products (Tamil & English)',
  description:
    'Search Madurai Aanandha Masala products in English, Tamil script, or phonetic transliterations (e.g. Manjal, Poondu, Kollu, Karuppu Kavuni, Bhai Veetu Masala).',
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
  const maxPriceInr =
    maxPriceRaw && Number.isFinite(Number(maxPriceRaw)) ? Number(maxPriceRaw) : undefined;
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

export default async function SearchPage({
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
      allProducts={data.allProducts}
      categories={data.categories}
      facets={data.facets}
      initialFilters={filters}
      heading={filters.q ? `Search Results for "${filters.q}"` : 'Search Our Madurai Pantry'}
      subheading="Try Tamil or English culinary names such as Manjal / Turmeric, Poondu / Garlic, Kollu / Horse Gram, Meen / Fish, Karuppu Kavuni, or Ulundhu Kali."
      basePath="/search"
    />
  );
}
