'use client';

import { CategoryCarousel } from '@/vibes/soul/sections/category-carousel';
import { CATEGORY_TILES } from '~/lib/home/home-content';

import { useSectionDefaults } from '../section-defaults';

interface Tile {
  name: string;
  subtitle: string;
  link?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt: string;
}

interface Props {
  className: string;
  title?: string;
  categories: Tile[];
  tint: boolean;
}

export function MSCategoryCarousel({ className, title, categories, tint }: Props) {
  const defaults = useSectionDefaults();

  return (
    <CategoryCarousel
      categories={
        categories.length > 0
          ? categories.map(({ name, subtitle, link, imageSrc, imageAlt }) => ({
              name,
              subtitle,
              href: link?.href ?? '#',
              image: imageSrc ? { src: imageSrc, alt: imageAlt || name } : undefined,
            }))
          : (defaults.categories ?? CATEGORY_TILES)
      }
      className={className}
      tightTop={defaults.tightTop}
      tint={tint}
      title={title || defaults.categoriesTitle || 'Shop by category.'}
    />
  );
}
