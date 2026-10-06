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
  ctaLabel?: string;
  link?: { href?: string };
  points: Point[];
  fine?: string;
  showPoints: boolean;
  subTitle?: string;
  showTiles: boolean;
}

// Category page header as one editable component: the red hero, the points row and the
// subcategory tiles. Every field falls back to the page's defaults (BigCommerce name, description
// and image; the per-category copy in lib/category/category-content.ts) when left empty.
export function MSCategoryHeader({
  className,
  title,
  description,
  imageSrc,
  imageAlt,
  ctaLabel,
  link,
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
        actions={[{ label: ctaLabel || defaults.ctaLabel, href: link?.href || '#products' }]}
        description={description || defaults.description}
        image={image}
        imageLabel={defaults.imageLabel}
        title={title || defaults.title}
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
