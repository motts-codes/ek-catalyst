'use client';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { SubcategoryTiles } from '@/vibes/soul/sections/category-hero';

interface Tile {
  name: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string };
}

interface Card {
  title: string;
  description: string;
  ctaLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string };
}

const toImage = (src: string | undefined, alt: string | undefined, fallbackAlt: string) =>
  src ? { src, alt: alt || fallbackAlt } : undefined;

// "Shop by finish / width / size" — photo tiles with the name beneath, same tile as the
// subcategory row. Dropped into a category's top-content slot.
export function MSTileRow({
  className,
  title,
  tiles,
}: {
  className: string;
  title: string;
  tiles: Tile[];
}) {
  return (
    <SubcategoryTiles
      className={className}
      items={tiles
        .filter((tile) => tile.name !== '')
        .map((tile) => ({
          name: tile.name,
          href: tile.link?.href || '#',
          image: toImage(tile.imageSrc, tile.imageAlt, tile.name),
        }))}
      title={title}
    />
  );
}

// "Shop by problem" — photo, title and one line per card, optional button.
export function MSCardRow({
  className,
  title,
  description,
  cards,
  columns,
  tint,
}: {
  className: string;
  title: string;
  description?: string;
  cards: Card[];
  columns: '3' | '4';
  tint: boolean;
}) {
  return (
    <CardsRow
      cards={cards
        .filter((card) => card.title !== '')
        .map((card) => ({
          title: card.title,
          description: card.description,
          ctaLabel: card.ctaLabel || undefined,
          href: card.link?.href || '#',
          image: toImage(card.imageSrc, card.imageAlt, card.title),
          imageLabel: card.title,
        }))}
      className={className}
      columns={columns === '4' ? 4 : 3}
      description={description}
      tint={tint}
      title={title}
    />
  );
}
