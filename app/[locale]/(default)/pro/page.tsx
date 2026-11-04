import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { Build } from '@/vibes/soul/sections/cabinet-program-content';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { ProgramSplit } from '@/vibes/soul/sections/program-split';
import { SamplesCallout } from '@/vibes/soul/sections/samples-callout';
import { StoryBand } from '@/vibes/soul/sections/story-band';
import { locales } from '~/i18n/locales';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { LINE_CARDS, LINE_SAMPLE_COLLECTIONS } from '~/lib/cabinets/cabinets-hub-content';
import { ASSEMBLED_BUILD_BLOCK } from '~/lib/cabinets/program-content';
import { HERO_OFFERS, PRO_CATEGORY_TILES } from '~/lib/home/home-content';
import {
  DELIVERY_COLUMNS,
  DELIVERY_ROWS,
  DESIGN_BAND,
  FACTORY_OUTLET_URL,
  FOUR_LINES,
  PRO_AUDIENCES,
  PRO_HERO_SLIDES,
  PRO_PROGRAM_CARDS,
  PRO_PROGRAM_FOOTNOTE,
  TRADE_CONTACT_HREF,
  WINDOWS_OFFER,
} from '~/lib/home/pro-content';
import { EditableSection } from '~/lib/makeswift/components/editable-section';
import { CATEGORY_CAROUSEL_TYPE, HERO_SPLIT_TYPE } from '~/lib/makeswift/components/section-types';
import { Slot } from '~/lib/makeswift/slot';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

export function generateMetadata(): Metadata {
  return {
    title: 'Pro: Contractors, Designers, Multifamily and Commercial',
    description:
      'Special pricing for contractors and builders, 50,000+ cabinets in stock, and ship dates you can quote. Express Kitchens for the trade. Call or text 860-247-1000, 24/7.',
  };
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

// Pro (contractor) home — wireframe `/pro`, a trade landing page (there is no Pro Program on the
// site). Same mechanics as the homeowner home: every band is a Makeswift <Slot> whose fallback
// renders lib/home/pro-content.ts, so the page is complete now and any band can be replaced in
// the builder. The hero reuses the "Home / Hero Split" layout (65/35, rotating photos + the same
// offer cards as the homepage).
export default async function Pro({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  // The four lines as the cabinets hub shows them (a kitchen photo from one of each line's
  // collections, the line's meta line and shop button), with the trade copy from pro-content.
  const lines = await getCabinetLines('assembled');
  const kitchenOf = (line?: (typeof lines)[number]) =>
    line?.image && !line.containCover ? line.image : undefined;
  const lineCards = FOUR_LINES.map((card) => {
    const hub = LINE_CARDS.find((candidate) => candidate.title === card.title);
    const pick = LINE_SAMPLE_COLLECTIONS[card.title];
    const named = lines.find((candidate) => candidate.name === pick?.name);
    const byFinish = pick?.finish ? named?.finishKitchens?.[pick.finish] : undefined;
    const image =
      (byFinish && named ? { src: byFinish, alt: `${named.name} ${pick?.finish}` } : undefined) ??
      kitchenOf(named) ??
      lines
        .map(kitchenOf)
        .find((kitchen, index) => kitchen && lines[index]?.productLine === card.title);

    return {
      ...card,
      meta: hub?.meta,
      ctaLabel: hub?.ctaLabel,
      href: hub?.href,
      image,
      primary: true,
    };
  });

  return (
    <>
      {/* 1 · Hero — trade welcome slides + the homepage's offer cards */}
      <EditableSection
        defaults={{ slides: PRO_HERO_SLIDES, offers: HERO_OFFERS }}
        label="Pro hero"
        snapshotId="pro-hero-split"
        type={HERO_SPLIT_TYPE}
      />

      {/* 2 · Everything for the job: shopping first */}
      <EditableSection
        defaults={{
          categories: PRO_CATEGORY_TILES,
          categoriesTitle: 'Everything for the job',
          tightTop: true,
        }}
        label="Pro categories"
        snapshotId="pro-category-carousel"
        type={CATEGORY_CAROUSEL_TYPE}
      />

      {/* 3 · Which one sounds like your business? */}
      <Slot
        fallback={
          <CardsRow
            cards={PRO_AUDIENCES}
            columns={4}
            description="Some jobs are bigger than a kitchen. Pick the one that sounds like your business."
            imageStyle="plain"
            kicker="Who we work with"
            title="Which one sounds like your business?"
          />
        }
        label="Pro audiences"
        snapshotId="pro-audiences"
      />

      {/* 4 · Two ways to buy the same cabinet */}
      <Slot
        fallback={
          <ProgramSplit
            cards={PRO_PROGRAM_CARDS}
            footnote={PRO_PROGRAM_FOOTNOTE}
            helper={{ label: 'Not sure? Talk to the trade team →', href: TRADE_CONTACT_HREF }}
            kicker="Two ways to buy the same cabinet"
            title="Start with the program"
          />
        }
        label="Pro program cards"
        snapshotId="pro-programs"
      />

      {/* 5 · Ship times you can quote */}
      <Slot
        fallback={
          <DeliveryLadder
            className="bg-[#fdf3f5]"
            columns={DELIVERY_COLUMNS}
            description="So you can put a date in front of your client and hold it. Add 7–10 days of transit, or pick up in Bristol."
            kicker="Lead times, line by line"
            look="minimal"
            rows={DELIVERY_ROWS}
            title="Ship times you can quote"
          />
        }
        label="Pro delivery ladder"
        snapshotId="pro-delivery"
      />

      {/* 6 · Windows offer (double hung only) */}
      <Slot
        fallback={
          <HomeSection compact>
            <SamplesCallout
              cta={WINDOWS_OFFER.actions[0]}
              description={WINDOWS_OFFER.description}
              image={WINDOWS_OFFER.image}
              kicker={WINDOWS_OFFER.kicker}
              note={WINDOWS_OFFER.note}
              secondaryCta={WINDOWS_OFFER.actions[1]}
              title={WINDOWS_OFFER.title}
            />
          </HomeSection>
        }
        label="Pro windows offer"
        snapshotId="pro-windows-offer"
      />

      {/* 7 · The four lines */}
      <Slot
        fallback={
          <CardsRow
            cards={lineCards}
            columns={4}
            description="The line decides how the cabinet is built; the collection decides the door and color."
            imageStyle="plain"
            kicker="The four lines"
            title="What to spec at each budget"
          />
        }
        label="Pro cabinet lines"
        snapshotId="pro-lines"
      />

      {/* 8 · How every cabinet is built */}
      <Slot
        fallback={
          <HomeSection
            description="The build is the same across collections. What changes is the door and the finish."
            kicker="Same box, every line"
            title="How every cabinet is built"
          >
            <Build block={ASSEMBLED_BUILD_BLOCK} embedded />
          </HomeSection>
        }
        label="Pro quality"
        snapshotId="pro-quality"
      />

      {/* 9 · We price it, you win the job */}
      <Slot
        fallback={
          <StoryBand
            actions={DESIGN_BAND.actions}
            description={DESIGN_BAND.description}
            imageLabel={DESIGN_BAND.imageLabel}
            kicker={DESIGN_BAND.kicker}
            title={DESIGN_BAND.title}
          />
        }
        label="Pro design band"
        snapshotId="pro-design"
      />

      {/* 11 · Closing — call or text, or visit the outlet */}
      <Slot
        fallback={
          <ClosingBand
            description="Call or text the trade team for special pricing on contractor and builder orders. We answer 24/7. Or visit the Factory Outlet: our outlet team knows the products, so bring your plans and they'll help you find what fits."
            kicker="Special pricing for the trade"
            phone={{ label: 'Call or text 860-247-1000', href: 'tel:+18602471000' }}
            primary={{ label: 'Talk to the trade team', href: TRADE_CONTACT_HREF }}
            secondary={{ label: 'Visit the Factory Outlet ↗', href: FACTORY_OUTLET_URL }}
            tint={false}
            title="Got a job coming up?"
          />
        }
        label="Pro closing band"
        snapshotId="pro-closing"
      />
    </>
  );
}
