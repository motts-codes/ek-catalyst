import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type CabinetProgram, getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { EXPLAINER_V2 } from '~/lib/cabinets/explainer-v2-content';

import { ExplainerV2Page } from './explainer-v2';

// The two explainer routes (/mykitchen/what-are-rta-cabinets, /mykitchen/what-are-assembled-
// cabinets) are thin wrappers around this: one program, one page. The education-first explainer
// says what the idea is, what turns up, where it fits in a remodel, what the difference costs
// and who it suits. Linked from the listing banners and the Cabinets hub; shopping stays on
// /cabinets/<program>-cabinets. Copy lives in lib/cabinets/explainer-v2-content.ts; only the
// priced collection's figures and photo are live.

export function explainerMetadata(program: CabinetProgram): Metadata {
  return EXPLAINER_V2[program].meta;
}

export async function ExplainerFor({
  program,
  locale,
}: {
  program: CabinetProgram;
  locale: string;
}) {
  setRequestLocale(locale);

  const content = EXPLAINER_V2[program];

  // "Money or time": the priced collection's 10×10 price and lead time in each program, live.
  const [rtaLines, assembledLines] = await Promise.all([
    getCabinetLines('rta'),
    getCabinetLines('assembled'),
  ]);
  const find = (lines: typeof rtaLines, name: string) =>
    lines.find((line) => line.name.startsWith(name));
  // The priced collection in each program (Avon on the assembled page, Northampton on RTA).
  const priced = [
    find(rtaLines, content.cost.priceCollection),
    find(assembledLines, content.cost.priceCollection),
  ] as const;
  const dollars = (raw?: string) => {
    const price = Number(raw);

    // Whole dollars, with thousands separators: "$2,993".
    return Number.isFinite(price) && price > 0
      ? `$${Math.round(price).toLocaleString('en-US')}`
      : '$[X]';
  };
  // The kitchen beside the table: the page's named collection, from its own program's listing.
  const costImage = find(
    program === 'rta' ? rtaLines : assembledLines,
    content.cost.imageCollection,
  )?.image;

  return (
    <ExplainerV2Page
      avonImage={costImage}
      avonPrices={[dollars(priced[0]?.price), dollars(priced[1]?.price)]}
      content={content}
      program={program}
      shipsIn={[priced[0]?.deliveryTime?.toLowerCase(), priced[1]?.deliveryTime?.toLowerCase()]}
    />
  );
}
