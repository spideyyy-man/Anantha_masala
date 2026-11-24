import React from 'react';
import { getAllCatalogProducts, getAllCategories } from '@/domain/catalog/service';
import { CinematicHeroStage } from '@/components/home/CinematicHeroStage';
import { InfinitePantryShowcase } from '@/components/home/InfinitePantryShowcase';
import { CategoryExplorer } from '@/components/home/CategoryExplorer';
import { CulinaryFocusSlider } from '@/components/home/CulinaryFocusSlider';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, allProducts] = await Promise.all([
    getAllCategories(),
    getAllCatalogProducts(),
  ]);

  return (
    <>
      {/* Beat 1: Dynamic 5-Scene Atmospheric Product Hero Carousel with Prev/Next Arrows */}
      <CinematicHeroStage products={allProducts} />

      {/* Beat 2: ONE Seamless Right-to-Left Continuous Gliding Product Showcase (Before Collections) */}
      <InfinitePantryShowcase allProducts={allProducts} />

      {/* Beat 3: Editorial Art-Directed Collections Exhibition (Clickable Into Preserved Category Pages) */}
      <CategoryExplorer categories={categories} allProducts={allProducts} />

      {/* Beat 4: Reworked Editorial Kitchen Focus-Frame (Dish Photography + Integrated Real Pouches) + Social & Closing CTA */}
      <CulinaryFocusSlider allProducts={allProducts} />
    </>
  );
}
