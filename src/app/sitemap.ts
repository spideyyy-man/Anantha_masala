import type { MetadataRoute } from 'next';
import { getAllCatalogProducts, getAllCategories } from '@/domain/catalog/service';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllCatalogProducts(),
  ]);

  const staticRoutes = [
    '',
    '/story',
    '/categories',
    '/products',
    '/search',
    '/recipes',
    '/wholesale',
    '/contact',
    '/orders/track',
    '/legal/shipping',
    '/legal/returns',
    '/legal/privacy',
    '/legal/terms',
    '/legal/grievance-and-compliance',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.7,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${siteUrl}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
