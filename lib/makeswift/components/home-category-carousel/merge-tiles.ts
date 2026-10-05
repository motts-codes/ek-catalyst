import { type CategoryTile } from '@/vibes/soul/sections/category-carousel';

// One item from the Makeswift "Categories" list. Every field is optional: an item OVERRIDES the
// default tile it points at, it does not replace the whole row.
export interface CategoryOverride {
  /** Key of the default category to override (see `categoryKey`), or 'custom' for a new tile. */
  category?: string;
  /** Name — only needed for a custom tile (older items used it to identify the category). */
  name?: string;
  /** Hook line. Empty = keep the page's default line for that category. */
  subtitle?: string;
  link?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt?: string;
  /** Remove this category from the row. */
  hide?: boolean;
}

export const CUSTOM_CATEGORY = 'custom';

export const categoryKey = (name: string) => name.trim().toLowerCase();

// Applies the builder's overrides on top of the page's default tiles:
//  - an item whose category matches a default tile changes only the fields it sets (hook line,
//    photo, link) or hides the tile — all other tiles keep their defaults, in their default order;
//  - an item marked "custom" (or naming a category that is not a default) is appended as a new tile.
export function mergeCategoryTiles(
  base: CategoryTile[],
  items: CategoryOverride[],
): CategoryTile[] {
  const baseKeys = new Set(base.map((tile) => categoryKey(tile.name)));
  const overrides = new Map<string, CategoryOverride>();
  const extras: CategoryTile[] = [];

  items.forEach((item) => {
    const chosen = item.category != null && item.category !== '' ? item.category : undefined;
    const key =
      chosen != null && chosen !== CUSTOM_CATEGORY ? chosen : categoryKey(item.name ?? '');

    if (chosen !== CUSTOM_CATEGORY && baseKeys.has(key)) {
      overrides.set(key, item);

      return;
    }

    const name = (item.name ?? '').trim();

    if (name === '' || item.hide === true) return;

    extras.push({
      name,
      subtitle: item.subtitle?.trim() || undefined,
      href: item.link?.href ?? '#',
      image: item.imageSrc ? { src: item.imageSrc, alt: item.imageAlt?.trim() || name } : undefined,
    });
  });

  const merged = base.flatMap((tile) => {
    const override = overrides.get(categoryKey(tile.name));

    if (!override) return [tile];
    if (override.hide === true) return [];

    return [
      {
        ...tile,
        subtitle: override.subtitle?.trim() || tile.subtitle,
        href: override.link?.href ?? tile.href,
        image: override.imageSrc
          ? { src: override.imageSrc, alt: override.imageAlt?.trim() || tile.name }
          : tile.image,
      },
    ];
  });

  return [...merged, ...extras];
}
