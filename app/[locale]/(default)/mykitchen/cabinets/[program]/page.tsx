import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { type CabinetProgram, getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { EXPLAINER_V2 } from '~/lib/cabinets/explainer-v2-content';

import { ExplainerV2Page } from './explainer-v2';

interface Props {
  params: Promise<{ locale: string; program: string }>;
}

const isProgram = (value: string): value is CabinetProgram =>
  value === 'rta' || value === 'assembled';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { program } = await params;

  return isProgram(program) ? EXPLAINER_V2[program].meta : {};
}

// The education-first explainer for one program (RTA or assembled): what the idea is, what turns
// up, where it fits in a remodel, what the difference costs, and who it suits. Linked from the
// listing banners and the Cabinets hub; shopping stays on /cabinets/<program>-cabinets. The copy
// lives in lib/cabinets/explainer-v2-content.ts; only the Avon prices and photo are live.
export default async function CabinetExplainer({ params }: Props) {
  const { locale, program } = await params;

  setRequestLocale(locale);

  if (!isProgram(program)) return notFound();

  // "Money or time": the priced collection's 10×10 price and lead time in each program, live.
  const [rtaLines, assembledLines] = await Promise.all([
    getCabinetLines('rta'),
    getCabinetLines('assembled'),
  ]);
  const content = EXPLAINER_V2[program];
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
      shipsIn={[priced[0]?.deliveryTime, priced[1]?.deliveryTime]}
    />
  );
}
