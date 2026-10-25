import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { CollectionCarousel } from '@/vibes/soul/sections/collection-carousel';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { ExplainerHero, ExplainerPair, ExplainerSteps } from '@/vibes/soul/sections/explainer';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { SamplesCallout } from '@/vibes/soul/sections/samples-callout';
import {
  type CabinetProgram,
  getCabinetLines,
  getCabinetProgramFaq,
} from '~/lib/cabinets/cabinet-lines-data';
import {
  DESIGN_CARD,
  EXPLAINER,
  EXPLAINER_HREF,
  INSTALLER_HREF,
  LISTING_HREF,
  PRICE_MY_KITCHEN,
  PROGRAM_NAME,
  SAME_FACTORY,
} from '~/lib/cabinets/explainer-content';
import { EXPLAINER_V2 } from '~/lib/cabinets/explainer-v2-content';
import { Slot } from '~/lib/makeswift/slot';

import { ExplainerV2Page } from './explainer-v2';

interface Props {
  params: Promise<{ locale: string; program: string }>;
}

const isProgram = (value: string): value is CabinetProgram =>
  value === 'rta' || value === 'assembled';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { program } = await params;

  if (!isProgram(program)) return {};

  const v2 = EXPLAINER_V2[program];

  if (v2) return v2.meta;

  return {
    title: `${PROGRAM_NAME[program]} cabinets explained`,
    description: EXPLAINER[program].description,
  };
}

// Guided explainer for one program (RTA or assembled): what it honestly involves, the Avon price
// both ways, proof it is the same cabinet, the top collections, and the escape hatch to the other
// program. Linked from the listing banners; shopping stays on /cabinets/<program>-cabinets.
export default async function CabinetExplainer({ params }: Props) {
  const { locale, program } = await params;

  setRequestLocale(locale);

  if (!isProgram(program)) return notFound();

  const content = EXPLAINER[program];
  const other: CabinetProgram = program === 'rta' ? 'assembled' : 'rta';
  const faq = await getCabinetProgramFaq(program);

  // "The honest math": Avon's 10×10 price in each program, from the live collection data.
  const [rtaLines, assembledLines] = await Promise.all([
    getCabinetLines('rta'),
    getCabinetLines('assembled'),
  ]);
  const avonPrice = (lines: typeof rtaLines) => {
    const price = Number(lines.find((line) => /^Avon\b/.test(line.name))?.price);

    // Whole dollars, with thousands separators: "$2,993".
    return Number.isFinite(price) && price > 0
      ? `$${Math.round(price).toLocaleString('en-US')}`
      : '$[X]';
  };
  const mathRows = [
    ['!Price', avonPrice(rtaLines), avonPrice(assembledLines)],
    ...content.math.rows,
  ];
  const topCollections = (program === 'rta' ? rtaLines : assembledLines).slice(0, 6);

  // The education-first rewrite (v2), where it exists; the other program keeps v1 until its
  // copy lands.
  const v2 = EXPLAINER_V2[program];

  if (v2) {
    return (
      <ExplainerV2Page
        avonImage={assembledLines.find((line) => /^Avon\b/.test(line.name))?.image}
        avonPrices={[avonPrice(rtaLines), avonPrice(assembledLines)]}
        content={v2}
        program={program}
      />
    );
  }

  return (
    <>
      <Slot
        fallback={
          <ExplainerHero
            actions={[
              {
                label: `Shop ${PROGRAM_NAME[program]} collections`,
                href: LISTING_HREF[program],
                primary: true,
              },
              { label: content.otherLabel, href: EXPLAINER_HREF[other] },
            ]}
            description={content.description}
            kicker="Explore · Cabinets"
            title={content.title}
          />
        }
        label={`${PROGRAM_NAME[program]} explainer hero`}
        snapshotId={`explainer-${program}-hero`}
      />

      <Slot
        fallback={
          <DeliveryLadder
            columns={['Avon · 10×10', 'RTA', 'Assembled']}
            description={content.math.description}
            footnote={<strong>{content.math.footnote}</strong>}
            rows={mathRows}
            tint
            title="The honest math"
          />
        }
        label={`${PROGRAM_NAME[program]} explainer math`}
        snapshotId={`explainer-${program}-math`}
      />

      <Slot
        fallback={<ExplainerSteps {...content.steps} />}
        label={`${PROGRAM_NAME[program]} explainer steps`}
        snapshotId={`explainer-${program}-steps`}
      />

      <Slot
        fallback={<CardsRow cards={SAME_FACTORY} columns={3} hideImages tint />}
        label={`${PROGRAM_NAME[program]} explainer proof`}
        snapshotId={`explainer-${program}-proof`}
      />

      <HomeSection
        action={PRICE_MY_KITCHEN}
        title={`${PROGRAM_NAME[program]} collections people order most`}
      >
        <CollectionCarousel lines={topCollections} />
      </HomeSection>

      <Slot
        fallback={<ExplainerPair cards={[content.escape, DESIGN_CARD]} tint />}
        label={`${PROGRAM_NAME[program]} explainer escape hatch`}
        snapshotId={`explainer-${program}-escape`}
      />

      <HomeSection compact>
        <SamplesCallout
          cta={{ label: 'Find an installer', href: INSTALLER_HREF }}
          description={content.install.description}
          title={content.install.title}
        />
      </HomeSection>

      <CabinetFaq data={faq ?? { headline: 'Common questions', items: content.faqFallback }} />

      <ClosingBand
        description="30+ door styles, filterable by style, finish, price and delivery."
        primary={{
          label: `Shop all ${PROGRAM_NAME[program]} collections`,
          href: LISTING_HREF[program],
        }}
        title="Ready? Here's the catalog"
      />
    </>
  );
}
