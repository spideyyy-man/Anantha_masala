import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/domain/catalog/service';
import { BRAND } from '@/data/brand';
import { ProductDetailView } from '@/components/product/ProductDetailView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  const primaryImg = product.images[0]?.largeUrl;
  return {
    title: `${product.name} (${product.tamilName})`,
    description: product.shortSummary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} — ${BRAND.fullName}`,
      description: product.shortSummary,
      images: primaryImg ? [{ url: primaryImg, width: 960, height: 1280, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const defaultVariant = product.variants[0];

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    alternateName: product.tamilName,
    description: product.description,
    sku: defaultVariant?.sku,
    image: product.images.map((im) => `${siteUrl}${im.largeUrl}`),
    brand: {
      '@type': 'Brand',
      name: BRAND.fullName,
    },
  };

  // Emit Offer schema ONLY when price is verified and orderable
  if (defaultVariant && defaultVariant.pricePaise !== null && defaultVariant.isOrderableOnline) {
    productJsonLd.offers = {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: (defaultVariant.pricePaise / 100).toFixed(2),
      availability:
        defaultVariant.stockQty > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: BRAND.fullName,
      },
    };
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'All Products', item: `${siteUrl}/products` },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
