'use client';

import {
  CategoryHero,
  CategoryPoints,
  SubcategoryTiles,
} from '@/vibes/soul/sections/category-hero';
import { type CategoryPointIcon } from '~/lib/category/category-content';

import { useSectionDefaults } from '../section-defaults';

interface Point {
  icon: CategoryPointIcon;
  label: string;
}

interface Props {
  className: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  points: Point[];
  fine?: string;
  showPoints: boolean;
  subTitle?: string;
  showTiles: boolean;
}

// Category page header as one editable component: the red hero, the points row and the
// subcategory tiles (subcategory pages get the compact hero). Every field falls back to the page's defaults (BigCommerce name, description
// and image; the per-category copy in lib/category/category-content.ts) when left empty.
export function MSCategoryHeader({
  className,
  title,
  description,
  imageSrc,
  imageAlt,
  points,
  fine,
  showPoints,
  subTitle,
  showTiles,
}: Props) {
  const defaults = useSectionDefaults().categoryHeader;

  if (!defaults) return null;

  const image = imageSrc ? { src: imageSrc, alt: imageAlt || defaults.title } : defaults.image;
  const resolvedPoints = points.filter((point) => point.label !== '');

  return (
    <div className={className}>
      <CategoryHero
        compact={defaults.compact}
        description={description || defaults.description}
        image={image}
        imageLabel={defaults.imageLabel}
        title={title || defaults.title}
        tone={defaults.tone}
      />
      {showPoints && (
        <CategoryPoints
          fine={fine || defaults.fine}
          points={resolvedPoints.length > 0 ? resolvedPoints : defaults.points}
        />
      )}
      {showTiles && (
        <SubcategoryTiles items={defaults.subcategories} title={subTitle || defaults.subTitle} />
      )}
    </div>
  );
}
