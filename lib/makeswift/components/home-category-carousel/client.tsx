'use client';

import { CategoryCarousel } from '@/vibes/soul/sections/category-carousel';
import { CATEGORY_TILES } from '~/lib/home/home-content';

import { useSectionDefaults } from '../section-defaults';

import { type CategoryOverride, mergeCategoryTiles } from './merge-tiles';

interface Props {
  className: string;
  title?: string;
  categories: CategoryOverride[];
  tint: boolean;
}

// The row always starts from the page's default tiles (homeowner and Pro have different hook
// lines). Items added in the builder override individual categories — see merge-tiles.ts — so
// adding one never wipes the rest.
export function MSCategoryCarousel({ className, title, categories, tint }: Props) {
  const defaults = useSectionDefaults();
  const base = defaults.categories ?? CATEGORY_TILES;

  return (
    <CategoryCarousel
      categories={mergeCategoryTiles(base, categories)}
      className={className}
      tightTop={defaults.tightTop}
      tint={tint}
      title={title || defaults.categoriesTitle || 'Shop by category.'}
    />
  );
}
