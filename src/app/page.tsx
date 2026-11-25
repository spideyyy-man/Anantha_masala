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
    <div data-homepage-storytelling="cohesive-v3" className="bg-[#FBF6EE]">
      {/* Beat 1: Atmospheric 5-Scene Product & Dish Hero Carousel */}
      <CinematicHeroStage products={allProducts} />

      {/* Beat 2 (Chapter 01): Continuous Infinite Centre-Focused Collection Shelf */}
      <CategoryExplorer categories={categories} allProducts={allProducts} />

      {/* Beat 3 (Chapter 02): Food Storytelling — Interactive 6-Dish Focus-Frame & 3-Step Madurai Method */}
      <CulinaryFocusSlider
        allProducts={allProducts}
        mode="storytelling-only"
      />

      {/* Beat 4 (Chapter 03): Complete 25-Pack Pantry Stream & Category Quick-Entry Bridge */}
      <InfinitePantryShowcase allProducts={allProducts} categories={categories} />

      {/* Beat 5 (Chapter 04): Everyday Madurai Recipes Grid, Social Community & Closing Finale -> Footer Bridge */}
      <CulinaryFocusSlider
        allProducts={allProducts}
        mode="recipes-and-finale"
      />
    </div>
  );
}
