import type { CabinetLine } from '@/vibes/soul/sections/cabinet-lines';

/** One kitchen in the best-sellers gallery: the photo, and the details shown when it's opened
 *  (everything but the price). */
export interface GalleryKitchen {
  id: string;
  /** "Avon", or "Prism Avon · Lakehouse" for a per-finish collection. */
  name: string;
  collection: string;
  finish?: string;
  line?: string;
  construction?: string;
  style?: string;
  finishTypes: string[];
  colorCount: number;
  deliveryTime?: string;
  href: string;
  image: { src: string; alt: string };
}

// The kitchen photo of a collection, whichever way round the audience-aware card put it.
function kitchenPhoto(line: CabinetLine): string | undefined {
  return line.containCover ? line.hoverImage?.src : line.image?.src;
}

// Every kitchen photo the collections have: one per collection, plus one per finish for the
// per-finish (Prism) collections. Prices, strike prices and payments are left out on purpose.
export function galleryKitchens(lines: CabinetLine[]): GalleryKitchen[] {
  return lines.flatMap((line) => {
    const base = {
      collection: line.name,
      line: line.productLine,
      construction: line.facets?.construction,
      style: line.facets?.style,
      finishTypes: line.facets?.finishTypes ?? [],
      colorCount: line.facets?.colors.length ?? 0,
      deliveryTime: line.deliveryTime,
      href: line.href,
    };
    const perFinish = Object.entries(line.finishKitchens ?? {});

    if (perFinish.length > 0) {
      return perFinish.map(([finish, photo]) => ({
        ...base,
        id: `${line.entityId}-${finish}`,
        name: `${line.name} · ${finish}`,
        finish,
        image: { src: photo, alt: `A ${line.name} kitchen in ${finish}` },
      }));
    }

    const src = kitchenPhoto(line);

    return src
      ? [
          {
            ...base,
            id: String(line.entityId),
            name: line.name,
            image: { src, alt: `A ${line.name} kitchen` },
          },
        ]
      : [];
  });
}
