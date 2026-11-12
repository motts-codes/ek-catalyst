import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { FeatureRows } from '@/vibes/soul/sections/feature-rows';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { NightKitchen } from '@/vibes/soul/sections/night-kitchen';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { ProgramSplit } from '@/vibes/soul/sections/program-split';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { StoryBand } from '@/vibes/soul/sections/story-band';
import { MetricsTicker } from '@/vibes/soul/sections/why-us-scroll';
import { Link } from '~/components/link';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { COST_BAND } from '~/lib/cabinets/cabinets-hub-content';
import { HOME_REVIEWS, SHOWROOMS } from '~/lib/home/home-content';
import { getLowest10x10 } from '~/lib/pages/lowest-price';
import {
  CABINETS_ROW_COLLECTION,
  CATEGORY_ROWS,
  COST_BAND_COPY,
  EVERYTHING_SECTION,
  KITCHEN_STEPS,
  MEASURING_NOTE,
  MYKITCHEN_CLOSING,
  MYKITCHEN_FAQ,
  MYKITCHEN_HERO,
  MYKITCHEN_METRICS,
  REVIEWS_TITLE,
  STEPS_SECTION,
  TWO_WAYS,
} from '~/lib/pages/mykitchen-content';

export const metadata: Metadata = {
  // The site template appends " - Express Kitchens".
  title: 'Your Whole Kitchen: Cabinets, Countertops and Appliances',
  description:
    'Cabinets, countertops, appliances, sinks and hardware that fit together, in stock and ready to order online. See your price in four steps. Free shipping over $2,500.',
};

// The whole-kitchen hub, on the /cabinets layout: story-band hero, proof strip, one feature row
// per category, the two ways to get there (online first), five steps, the cost band, reviews,
// FAQ, closing. Brief v3, 12 Nov 2026: outcome-led headlines, facts underneath as proof.
export default async function MyKitchen({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [lowest, lines] = await Promise.all([getLowest10x10(), getCabinetLines('assembled')]);

  // The Avon kitchen from the live collections fronts the Cabinets row.
  const avon = lines.find(
    (line) =>
      line.productLine === CABINETS_ROW_COLLECTION.line &&
      line.name.startsWith(CABINETS_ROW_COLLECTION.name) &&
      line.image,
  );
  const rows = CATEGORY_ROWS.map((row, index) =>
    index === 0 && avon?.image
      ? { ...row, image: { src: avon.image.src, alt: row.image?.alt ?? '' } }
      : row,
  );

  // The "ours start at" sentence only when both prices loaded; never "$[X]".
  const costDescription =
    COST_BAND_COPY.intro +
    (lowest.rta && lowest.assembled
      ? COST_BAND_COPY.withPrices(lowest.rta, lowest.assembled)
      : COST_BAND_COPY.withoutPrices);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'My kitchen', href: '/mykitchen' }]} />

      {/* 1 · Hero */}
      <StoryBand
        actions={MYKITCHEN_HERO.actions}
        description={MYKITCHEN_HERO.description}
        headingLevel={1}
        kicker={MYKITCHEN_HERO.kicker}
        media={<NightKitchen alt={MYKITCHEN_HERO.imageAlt} priority />}
        plate={false}
        split="even"
        textLink={MYKITCHEN_HERO.textLink}
        title={MYKITCHEN_HERO.title}
      />

      {/* 2 · Proof strip */}
      <MetricsTicker metrics={MYKITCHEN_METRICS} />

      {/* 3 · Everything for your kitchen */}
      <FeatureRows
        className="bg-[#fdf8f8]"
        description={EVERYTHING_SECTION.description}
        id="everything"
        kicker={EVERYTHING_SECTION.kicker}
        rows={rows}
        stacked
        title={EVERYTHING_SECTION.title}
      />

      {/* 4 · Two ways to get there */}
      <ProgramSplit
        cards={TWO_WAYS}
        kicker="Your kitchen, your way"
        title="Two ways to get there"
      />

      {/* 5 · How it comes together */}
      <HomeSection kicker={STEPS_SECTION.kicker} tint title={STEPS_SECTION.title}>
        <ol className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-5">
          {KITCHEN_STEPS.map((step, index) => (
            <li
              className="flex flex-col rounded-3xl border border-contrast-100 bg-white p-5"
              key={step.title}
            >
              <span className="font-heading text-3xl font-bold text-[var(--button-primary-background,#d90716)]">
                {index + 1}
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-contrast-500">{step.description}</p>
              {step.link && (
                <Link
                  className="group/link mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-[var(--button-primary-background,#d90716)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                  href={step.link.href}
                >
                  {step.link.label}
                  <ArrowRight
                    aria-hidden
                    className="transition-transform group-hover/link:translate-x-1"
                    size={15}
                    strokeWidth={2.5}
                  />
                </Link>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-contrast-500">{MEASURING_NOTE}</p>
      </HomeSection>

      {/* 6 · Know your budget */}
      <StoryBand
        actions={COST_BAND_COPY.actions}
        description={costDescription}
        image={COST_BAND.image}
        imageLabel={COST_BAND.imageLabel}
        kicker={COST_BAND_COPY.kicker}
        plate={false}
        title={COST_BAND_COPY.title}
        tone="red"
      />

      {/* 7 · Reviews */}
      <ReviewMarquee
        action={{ label: 'Read all reviews', href: '/reviews' }}
        reviews={HOME_REVIEWS}
        summary="4.5 · 360+ Google reviews"
        title={REVIEWS_TITLE}
      />

      {/* 8 · FAQ */}
      <CabinetFaq data={MYKITCHEN_FAQ} />

      {/* 9 · Closing: three CTAs at most (price, consult, showroom list), so no call button. */}
      <ClosingBand
        description={MYKITCHEN_CLOSING.description}
        phone={null}
        primary={MYKITCHEN_CLOSING.primary}
        secondary={MYKITCHEN_CLOSING.secondary}
        showrooms={SHOWROOMS}
        tint
        title={MYKITCHEN_CLOSING.title}
      />
    </>
  );
}
