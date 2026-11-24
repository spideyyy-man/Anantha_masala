import type { Metadata } from 'next';
import { queryCatalog, type CatalogFilterInput } from '@/domain/catalog/service';
import { CatalogExplorer } from '@/components/catalog/CatalogExplorer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search Products (Tamil & English)',
  description:
    'Search Madurai Aanandha Masala products in English, Tamil script, or phonetic transliterations (e.g. Manjal, Poondu, Kollu, Karuppu Kavuni, Bhai Veetu Masala).',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const filters: CatalogFilterInput = {
    q: q || undefined,
    sort: 'relevance',
  };
  const data = await queryCatalog(filters);

  return (
    <CatalogExplorer
      initialProducts={data.products}
      facets={data.facets}
      initialFilters={filters}
      heading={q ? `Search Results for "${q}"` : 'Search Our Madurai Pantry'}
      subheading="Try Tamil or English culinary names such as Manjal / Turmeric, Poondu / Garlic, Kollu / Horse Gram, Meen / Fish, Karuppu Kavuni, or Ulundhu Kali."
      basePath="/search"
    />
  );
}
