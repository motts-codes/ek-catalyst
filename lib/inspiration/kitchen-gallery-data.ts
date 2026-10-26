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

/** Prism shows the same kitchen in ten colours; one per collection keeps the wall varied. */
const FINISHES_PER_COLLECTION = 1;

// Every kitchen photo worth showing: one per collection, a couple per finish for the per-finish
// (Prism) collections, with photos shared between collections (Euro Max and Euro Value use the
// same kitchen) shown once. Prices, strike prices and payments are left out on purpose.
function allKitchens(lines: CabinetLine[]): GalleryKitchen[] {
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
    const perFinish = Object.entries(line.finishKitchens ?? {}).slice(0, FINISHES_PER_COLLECTION);

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

// Star collections each have their own kitchen, so they lead; the other lines are spread evenly
// through them rather than bunched at the end.
export function galleryKitchens(lines: CabinetLine[]): GalleryKitchen[] {
  const seen = new Set<string>();
  const unique = allKitchens(lines).filter((k) => {
    if (seen.has(k.image.src)) return false;
    seen.add(k.image.src);

    return true;
  });
  const star = unique.filter((k) => k.line === 'Star');
  const others = unique.filter((k) => k.line !== 'Star');
  const mixed: GalleryKitchen[] = [];
  const starShare = star.length / (star.length + others.length || 1);
  let starTaken = 0;

  // Proportional weave: take a Star kitchen whenever Star is at or below its share so far.
  while (star.length > 0 || others.length > 0) {
    const starBehind = starTaken <= starShare * mixed.length;
    const next =
      (starBehind && star.length > 0) || others.length === 0 ? star.shift() : others.shift();

    if (next) {
      mixed.push(next);
      if (next.line === 'Star') starTaken += 1;
    }
  }

  return mixed;
}
