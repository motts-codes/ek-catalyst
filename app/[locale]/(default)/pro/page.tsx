import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { ProgramCards } from '@/vibes/soul/sections/program-cards';
import { StoryBand } from '@/vibes/soul/sections/story-band';
import { locales } from '~/i18n/locales';
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
  QUALITY_POINTS,
  SPEC_SHELF,
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

  return (
    <>
      {/* 1 · Hero — trade welcome slides + the homepage's offer cards */}
      <EditableSection
        defaults={{ slides: PRO_HERO_SLIDES, offers: HERO_OFFERS }}
        label="Pro hero"
        snapshotId="pro-hero-split"
        type={HERO_SPLIT_TYPE}
      />

      {/* 2 · Which one sounds like your business? */}
      <Slot
        fallback={
          <CardsRow
            cards={PRO_AUDIENCES}
            columns={4}
            description="Some jobs are bigger than a kitchen. Pick the one that sounds like your business."
            imageStyle="bleed"
            tint
            title="Which one sounds like your business?"
          />
        }
        label="Pro audiences"
        snapshotId="pro-audiences"
      />

      {/* 3 · Two ways to buy the same cabinet */}
      <Slot
        fallback={
          <ProgramCards
            cards={PRO_PROGRAM_CARDS}
            kicker="Two ways to buy the same cabinet"
            title="Start with the program"
          />
        }
        label="Pro program cards"
        snapshotId="pro-programs"
      />

      {/* 4 · Ship times you can quote */}
      <Slot
        fallback={
          <DeliveryLadder
            columns={DELIVERY_COLUMNS}
            description="So you can put a date in front of your client and hold it. Add 7–10 days of transit, or pick up in Bristol."
            look="minimal"
            rows={DELIVERY_ROWS}
            tint
            title="Ship times you can quote"
          />
        }
        label="Pro delivery ladder"
        snapshotId="pro-delivery"
      />

      {/* 5 · Everything for the job */}
      <EditableSection
        defaults={{ categories: PRO_CATEGORY_TILES, categoriesTitle: 'Everything for the job' }}
        label="Pro categories"
        snapshotId="pro-category-carousel"
        type={CATEGORY_CAROUSEL_TYPE}
      />

      {/* 6 · Windows offer (double hung only) */}
      <Slot
        fallback={
          <StoryBand
            actions={WINDOWS_OFFER.actions}
            description={WINDOWS_OFFER.description}
            imageLabel={WINDOWS_OFFER.imageLabel}
            kicker={WINDOWS_OFFER.kicker}
            title={WINDOWS_OFFER.title}
          />
        }
        label="Pro windows offer"
        snapshotId="pro-windows-offer"
      />

      {/* 7 · The four lines */}
      <Slot
        fallback={
          <CardsRow
            cards={FOUR_LINES}
            columns={4}
            title="The four lines, and what to spec at each budget"
          />
        }
        label="Pro cabinet lines"
        snapshotId="pro-lines"
      />

      {/* 8 · How every cabinet is built */}
      <Slot
        fallback={
          <CardsRow
            cards={QUALITY_POINTS}
            columns={3}
            description="The build is the same across collections. What changes is the door and the finish."
            hideImages
            tint
            title="How every cabinet is built"
          />
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
            title={DESIGN_BAND.title}
          />
        }
        label="Pro design band"
        snapshotId="pro-design"
      />

      {/* 10 · Spec shelf — downloads, no login */}
      <Slot
        fallback={
          <CardsRow
            cards={SPEC_SHELF}
            columns={2}
            description="Downloads, with no login."
            tint
            title="Spec shelf"
          />
        }
        label="Pro spec shelf"
        snapshotId="pro-spec-shelf"
      />

      {/* 11 · Closing — call or text, or visit the outlet */}
      <Slot
        fallback={
          <ClosingBand
            description="Call or text the trade team for special pricing on contractor and builder orders. We answer 24/7. Or visit the Factory Outlet: our outlet team knows the products, so bring your plans and they'll help you find what fits."
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
