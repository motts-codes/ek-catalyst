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

  // "Money or time": Avon's 10×10 price in each program, from the live collection data.
  const [rtaLines, assembledLines] = await Promise.all([
    getCabinetLines('rta'),
    getCabinetLines('assembled'),
  ]);
  const avon = (lines: typeof rtaLines) => lines.find((line) => /^Avon\b/.test(line.name));
  const avonPrice = (lines: typeof rtaLines) => {
    const price = Number(avon(lines)?.price);

    // Whole dollars, with thousands separators: "$2,993".
    return Number.isFinite(price) && price > 0
      ? `$${Math.round(price).toLocaleString('en-US')}`
      : '$[X]';
  };

  return (
    <ExplainerV2Page
      avonImage={avon(assembledLines)?.image}
      avonPrices={[avonPrice(rtaLines), avonPrice(assembledLines)]}
      content={EXPLAINER_V2[program]}
      program={program}
    />
  );
}
