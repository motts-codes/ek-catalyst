import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { EXPLAINER_V2_HREF } from '~/lib/cabinets/explainer-v2-content';
import { ESTIMATOR_HREF, FREE_DESIGN_HREF, SAMPLES_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Guides, tools and straight answers for planning a kitchen: RTA vs assembled, the 10×10 kitchen, pricing, measuring, samples, financing, shipping, returns, videos, care and warranty.',
};

// Copy checked against EK's policy pages and their Oct 27 answers. Each card points at the page
// that holds the full answer, and its photo is that page's hero. Learn and Plan are plain cards
// with the whole photo inside a red hairline frame; Ordering and After keep the hairline around
// the full card. Black titles, a text link with an arrow.
export default async function Resources({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Resources', href: '/resources' }]} />
      <PageHero
        description="Guides, tools and straight answers, from choosing a cabinet to caring for it ten years on."
        kicker="Resources"
        textOnly
        title="Plan your kitchen with confidence"
      />

      {/* 2 · Learn the basics */}
      <CardsRow
        cardBorder="red"
        cards={[
          {
            title: 'What are RTA cabinets',
            ctaLabel: 'Read the explainer',
            description:
              'Flat-packed, lower cost, and each one goes together in 30 minutes or less.',
            href: EXPLAINER_V2_HREF.rta,
            image: {
              src: '/images/explainers/rta-box-and-cabinet-espresso.jpg',
              alt: 'An opened flat RTA box with its espresso panels, doors and hardware, beside the same cabinet built',
            },
          },
          {
            title: 'What are assembled cabinets',
            ctaLabel: 'Read the explainer',
            description: 'Built and checked in our factory, ready to install.',
            href: EXPLAINER_V2_HREF.assembled,
            image: {
              src: '/images/explainers/assembled-cabinets-espresso.jpg',
              alt: 'A run of built espresso shaker base cabinets, with a tall pantry at one end',
            },
          },
          {
            title: 'What is a 10×10 kitchen',
            ctaLabel: 'See the 10×10 kitchen',
            description:
              'The standard kitchen behind every "from" price, and the 13 cabinets in ours.',
            href: '/resources/ten-by-ten-kitchen',
            image: {
              src: '/images/estimator/ten-by-ten-hero.jpg',
              alt: 'A white shaker 10×10 kitchen, two walls of cabinets meeting in a corner',
            },
          },
          {
            title: 'Cabinet glossary',
            ctaLabel: 'Open the glossary',
            description: 'Face frame, full overlay, soft-close and other terms, in plain English.',
            href: '/help/cabinet-glossary',
            imageLabel: 'Glossary photo',
          },
        ]}
        columns={4}
        ctaStyle="link"
        imageFit="contain"
        imageStyle="plain"
        kicker="New to cabinets?"
        title="Learn the basics"
      />

      {/* 3 · Plan and price */}
      <CardsRow
        cardBorder="red"
        cards={[
          {
            title: 'Price my kitchen',
            ctaLabel: 'Price my kitchen',
            description: 'Four steps to a price range for your kitchen, RTA and assembled.',
            href: ESTIMATOR_HREF,
            image: {
              src: '/images/estimator/hero-kitchen.jpg',
              alt: 'A bright white kitchen with shaker cabinets, a farmhouse sink and a wooden range hood',
            },
          },
          {
            title: 'Measuring guide',
            ctaLabel: 'How to measure',
            description:
              "Six steps, wall by wall. Send us your numbers and we'll check them before anything is ordered.",
            href: '/resources/measuring-guide',
            image: {
              src: '/images/pages/measuring/hero-measuring-range-3.jpg',
              alt: 'A sketched kitchen with a homeowner in a red top measuring the width of the range with a tape measure',
            },
          },
          {
            title: 'Order samples',
            ctaLabel: 'Order samples',
            description:
              'Hold the real door in your own light. Your first two quarter doors are free.',
            href: SAMPLES_HREF,
            image: {
              src: '/images/pages/samples/hero-door-samples-table-2.jpg',
              alt: 'A designer in a red top and a customer at a table, comparing door samples in white, sage, navy and walnut',
            },
          },
          {
            title: 'Free design consult',
            ctaLabel: 'Book a free consult',
            description:
              'A designer goes through your kitchen with you and gives you an itemized quote, free. In a showroom or by video.',
            href: FREE_DESIGN_HREF,
            image: {
              src: '/images/pages/design-consult/hero-designer-couple-3.jpg',
              alt: 'An Express Kitchens designer going through a kitchen plan with a couple at a showroom table',
            },
          },
        ]}
        columns={4}
        ctaStyle="link"
        imageFit="contain"
        imageStyle="plain"
        kicker="Getting started"
        tint
        title="Plan and price"
      />

      {/* 4 · Ordering and delivery */}
      <CardsRow
        cardBorder="red"
        cards={[
          {
            title: 'Financing',
            ctaLabel: 'See financing',
            description: 'Pay over time with GreenSky, in our showrooms. Rates from 9.99% APR.',
            href: '/financing',
            image: {
              src: '/images/pages/financing/hero-couple-cabinets-5.jpg',
              alt: 'A couple holding white cabinet drawers above a base cabinet, with a red piggy bank',
            },
          },
          {
            title: 'Shipping',
            ctaLabel: 'Shipping policy',
            description: 'Free on orders over $2,500, to the 48 contiguous states.',
            href: '/shipping-policy',
            image: {
              src: '/images/pages/shipping/ek-truck-unloading.jpg',
              alt: 'A driver unloading a shrink-wrapped pallet of cabinets from the liftgate of an Express Kitchens truck',
            },
          },
          {
            title: 'Returns',
            ctaLabel: 'Returns policy',
            description: 'Unopened items, within 30 days of purchase, approved first.',
            href: '/returns-policy',
            image: {
              src: '/images/pages/returns/hero-taping-return-box.jpg',
              alt: 'A smiling man kneeling on the floor, taping a flat cabinet box shut for return',
            },
          },
          {
            title: 'Price match',
            ctaLabel: 'Price match guarantee',
            // Offer copy until Nov 30, 2026. After that, swap to:
            // "We'll match a competitor's cabinet quote, in our showrooms."
            description:
              "Bring a competitor quote of $3,000+ to a showroom. We'll beat it, or give you a $500 credit. Until Nov 30.",
            href: '/price-match-guarantee',
            image: {
              src: '/images/pages/price-match/hero-price-match.jpg',
              alt: 'A Project Manager pointing to a red price-match tag on a white cabinet beside a plain-tagged one',
            },
          },
        ]}
        columns={4}
        ctaStyle="link"
        imageFit="contain"
        kicker="Before you buy"
        title="Ordering and delivery"
      />

      {/* 5 · After it arrives */}
      <CardsRow
        cardBorder="red"
        cards={[
          {
            title: 'Assembly videos',
            ctaLabel: 'Watch the videos',
            description: 'Watch our cabinets and closet units go together, step by step.',
            href: '/resources/how-to-videos',
            image: {
              src: '/images/pages/how-to/hero-assembling-with-tablet.jpg',
              alt: 'A man kneeling beside a white base cabinet, driving a screw with a cordless drill while an assembly video plays on a tablet',
            },
          },
          {
            title: 'Cabinet care',
            ctaLabel: 'Cabinet care guide',
            description: 'Cleaning by finish, adjusting hinges, touch-ups and what never to use.',
            href: '/resources/cabinet-care',
            image: {
              src: '/images/pages/cabinet-care/hero-wiping-cabinet.jpg',
              alt: 'A smiling woman kneeling to wipe a light oak base cabinet with a microfiber cloth, spray bottle beside her',
            },
          },
          {
            title: 'Warranty',
            ctaLabel: 'Read the warranty',
            description: '1 year on every cabinet, and how to make a claim.',
            href: '/warranty',
            image: {
              src: '/images/pages/warranty/one-year-walnut.jpg',
              alt: 'A smiling Express Kitchens designer beside a walnut base cabinet, with a 1-year warranty badge',
            },
          },
        ]}
        columns={3}
        ctaStyle="link"
        imageFit="contain"
        kicker="Guides"
        tint
        title="After it arrives"
      />

      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
