import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryCarousel } from '@/vibes/soul/sections/category-carousel';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeHeroSplit } from '@/vibes/soul/sections/home-hero-split';
import { ProgramCards } from '@/vibes/soul/sections/program-cards';
import { ProgramTiers } from '@/vibes/soul/sections/program-tiers';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
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
  PRO_PROGRAM_HREF,
  PRO_REVIEWS,
  PROGRAM_TIERS,
  PROGRAM_TIERS_FOOTNOTE,
  QUALITY_POINTS,
  QUICK_SHIP_TILES,
  SPEC_SHELF,
  WINDOWS_OFFER,
} from '~/lib/home/pro-content';
import { Slot } from '~/lib/makeswift/slot';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

export function generateMetadata(): Metadata {
  return {
    title: 'Pro / Trade Program',
    description:
      'Express Kitchens Pro — trade pricing, dedicated project support, faster delivery and bulk ordering for contractors, designers, multifamily and commercial firms.',
  };
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

// Pro (contractor) home — wireframe `/pro`. Same mechanics as the homeowner home: every band is
// a Makeswift <Slot> whose fallback renders lib/home/pro-content.ts, so the page is complete now
// and any band can be replaced in the builder. The hero reuses the "Home / Hero Split" layout
// (65/35, rotating photos + the same offer cards as the homepage).
export default async function Pro({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      {/* 1 · Hero — trade welcome slides + the homepage's offer cards */}
      <Slot
        fallback={<HomeHeroSplit offers={HERO_OFFERS} slides={PRO_HERO_SLIDES} />}
        label="Pro hero"
        snapshotId="pro-hero"
      />

      {/* 2 · Which one sounds like your business? */}
      <Slot
        fallback={
          <CardsRow
            cards={PRO_AUDIENCES}
            columns={4}
            description="Some jobs are bigger than a kitchen. Pick the one that sounds like your business — there's a dedicated team for each."
            imageStyle="bleed"
            tint
            title="Which one sounds like your business?"
          />
        }
        label="Pro audiences"
        snapshotId="pro-audiences"
      />

      {/* 3 · Start with the program — real delivery promises, no explainer */}
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

      {/* 4 · Everything for the job */}
      <Slot
        fallback={
          <CategoryCarousel categories={PRO_CATEGORY_TILES} tint title="Everything for the job." />
        }
        label="Pro categories"
        snapshotId="pro-categories"
      />

      {/* 5 · Windows offer */}
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

      {/* 6 · The delivery ladder */}
      <Slot
        fallback={
          <DeliveryLadder
            columns={DELIVERY_COLUMNS}
            cta={{ label: 'Everything that ships in 2 weeks or less', href: '#' }}
            description="So you can put a date in front of your client and hold it."
            rows={DELIVERY_ROWS}
            tiles={QUICK_SHIP_TILES}
            tint
            title="The delivery ladder"
          />
        }
        label="Pro delivery ladder"
        snapshotId="pro-delivery"
      />

      {/* 7 · The Contractor Program — two tiers (anchor for the audience card above) */}
      <Slot
        fallback={
          <ProgramTiers
            cta={{ label: 'Join the program', href: PRO_PROGRAM_HREF }}
            footnote={PROGRAM_TIERS_FOOTNOTE}
            id="pro-program"
            lede="Silver from your first $5,000 invoice. Diamond at $50,000 a year. Both get a text-enabled support line only contractors have, free design and design audits, and sales-tax exemption with your form on file."
            tiers={PROGRAM_TIERS}
            title="The Contractor Program — two tiers, real discounts"
          />
        }
        label="Pro program tiers"
        snapshotId="pro-program-tiers"
      />

      {/* 8 · Spec shelf — downloads, no login */}
      <Slot
        fallback={
          <CardsRow cards={SPEC_SHELF} description="Downloads, no login." tint title="Spec shelf" />
        }
        label="Pro spec shelf"
        snapshotId="pro-spec-shelf"
      />

      {/* 9 · The four lines */}
      <Slot
        fallback={
          <CardsRow
            cards={FOUR_LINES}
            columns={4}
            title="The four lines — what to spec at which budget"
          />
        }
        label="Pro cabinet lines"
        snapshotId="pro-lines"
      />

      {/* 10 · Quality you can see and touch */}
      <Slot
        fallback={
          <CardsRow
            cards={QUALITY_POINTS}
            columns={4}
            description="The construction is the same across every line and every collection — what changes is the door and the finish."
            hideImages
            tint
            title="Quality you can see and touch."
          />
        }
        label="Pro quality"
        snapshotId="pro-quality"
      />

      {/* 11 · We design, you win the job */}
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

      {/* 12 · Contractors who order here */}
      <Slot
        fallback={
          <ReviewMarquee
            height={420}
            reviews={PRO_REVIEWS}
            tint
            title="Contractors who order here"
          />
        }
        label="Pro testimonials"
        snapshotId="pro-testimonials"
      />

      {/* 13 · Closing — join, visit the outlet, or call */}
      <Slot
        fallback={
          <ClosingBand
            description="Two-minute form, then our trade team calls to verify your license and set you up — pricing, tax exemption and a text line that answers."
            phone={{ label: 'Call or text 860-247-1000', href: 'tel:+18602471000' }}
            primary={{ label: 'Join the program', href: PRO_PROGRAM_HREF }}
            secondary={{ label: 'Visit the factory outlet ↗', href: FACTORY_OUTLET_URL }}
            tint={false}
            title="Ready to set up your trade account?"
          />
        }
        label="Pro closing band"
        snapshotId="pro-closing"
      />
    </>
  );
}
