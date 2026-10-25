import type { CabinetLine } from '@/vibes/soul/sections/cabinet-lines';
import { LINE_SAMPLE_COLLECTIONS } from '~/lib/cabinets/cabinets-hub-content';

import { type LineId, LINES } from './ten-by-ten';

/** A picture for the estimator, resolved from the live cabinet collections. */
export interface Picture {
  src: string;
  alt: string;
}

/** The imagery the estimator shows: a kitchen per line, a door sample per door style, a swatch
 *  per color. Built on the server from the cabinet collections (see buildEstimatorVisuals). */
export interface EstimatorVisuals {
  lines: Partial<Record<LineId, Picture>>;
  /** Keyed by `${lineId}:${door}`. */
  doors: Record<string, Picture>;
  /** Keyed by color name; Prism's measured hexes. */
  colors: Record<string, { hex: string }>;
}

export const doorKey = (line: LineId, door: string) => `${line}:${door}`;

const letters = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

// The door sample and the kitchen photo of a collection, whichever way round the audience-aware
// card put them (contractors get the door as the cover, homeowners get the kitchen).
function photosOf(line: CabinetLine): { door?: string; kitchen?: string } {
  if (line.containCover) return { door: line.image?.src, kitchen: line.hoverImage?.src };

  return { door: line.hoverImage?.src, kitchen: line.image?.src };
}

// The collection a workbook door style lives in. Star doors are the collection name itself
// ("Avon Painted White" → Avon, "Derry Stratus" → Derry, "Lasalle" → LaSalle); Prism and Euro
// prefix the line ("Prism Avon", "Euro Max Tribeca A").
function collectionFor(
  lines: CabinetLine[],
  lineId: LineId,
  door: string,
): CabinetLine | undefined {
  const want = letters(door);
  const inLine = (names: string[]) => lines.filter((l) => names.includes(l.productLine ?? ''));

  if (lineId === 'star') {
    return inLine(['Star']).find((l) => letters(l.name).startsWith(want));
  }

  if (lineId === 'prism') {
    return inLine(['Prism']).find((l) => letters(l.name) === `prism${want}`);
  }

  return (
    inLine(['Euro Max']).find((l) => letters(l.name) === `euromax${want}`) ??
    inLine(['Euro Value']).find((l) => letters(l.name) === `eurovalue${want}`)
  );
}

// The kitchen each line card shows: the hub's sample collection for the line (a finish's kitchen
// for Prism), else the first collection in the line with a kitchen photo.
function lineKitchen(lines: CabinetLine[], lineId: LineId): Picture | undefined {
  const hubKey = { star: 'Star', prism: 'Prism', euro: 'Euro Max' }[lineId];
  const sample = LINE_SAMPLE_COLLECTIONS[hubKey];
  const sampleLine = lines.find((l) => l.name === sample?.name);
  const fromSample = sample?.finish
    ? sampleLine?.finishKitchens?.[sample.finish]
    : sampleLine && photosOf(sampleLine).kitchen;

  if (fromSample && sampleLine) return { src: fromSample, alt: `A ${sampleLine.name} kitchen` };

  const any = lines.find((l) => photosOf(l).kitchen);
  const kitchen = any ? photosOf(any).kitchen : undefined;

  return any && kitchen ? { src: kitchen, alt: `A ${any.name} kitchen` } : undefined;
}

// Resolves the estimator's pictures from the cabinet collections (assembled + RTA, so a door
// sold in only one program is still found). Pure: no fetching here.
export function buildEstimatorVisuals(
  collections: CabinetLine[],
  doorsByLine: Record<LineId, string[]>,
): EstimatorVisuals {
  const visuals: EstimatorVisuals = { lines: {}, doors: {}, colors: {} };

  LINES.forEach((line) => {
    const kitchen = lineKitchen(collections, line.id);

    if (kitchen) visuals.lines[line.id] = kitchen;

    doorsByLine[line.id].forEach((door) => {
      const collection = collectionFor(collections, line.id, door);
      const doorPhoto = collection ? photosOf(collection).door : undefined;

      if (doorPhoto)
        visuals.doors[doorKey(line.id, door)] = { src: doorPhoto, alt: `${door} door` };

      collection?.finishSwatches?.forEach((swatch) => {
        if (swatch.hex && !visuals.colors[swatch.name])
          visuals.colors[swatch.name] = { hex: swatch.hex };
      });
    });
  });

  return visuals;
}
