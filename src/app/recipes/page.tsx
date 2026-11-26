import type { Metadata } from 'next';
import { KITCHEN_IDEAS } from '@/data/kitchen-ideas';
import { getProductsBySlugs } from '@/domain/catalog/service';
import { KitchenIdeasExperience } from '@/components/kitchen/KitchenIdeasExperience';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kitchen Ideas — What to Cook & Which Madurai Masala to Use',
  description:
    'Discover traditional South Indian breakfast, lunch, heritage grain, and weekend feast ideas — connected directly to genuine Madurai Anantha Masala packs.',
  alternates: { canonical: '/recipes' },
};

export default async function RecipesPage() {
  const allLinkedSlugs = Array.from(
    new Set(KITCHEN_IDEAS.flatMap((idea) => idea.productSlugs))
  );
  const linkedProducts = await getProductsBySlugs(allLinkedSlugs);

  return <KitchenIdeasExperience products={linkedProducts} />;
}
