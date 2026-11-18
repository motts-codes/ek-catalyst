import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Appointment Requested',
  robots: { index: false },
};

export default async function BookConfirmed({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Showrooms', href: '/showrooms' },
          { label: 'Appointment requested', href: '/book/confirmed' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'How to measure', href: '/resources/measuring-guide', primary: true },
          { label: 'Showroom directions', href: '/showrooms' },
        ]}
        description="Thanks. Your Project Manager will confirm the day and time by text and email within 1 business day, and you'll get a reminder the day before. Bring a photo of your kitchen and rough measurements if you have them, or nothing at all; either way you'll leave with an itemized quote."
        kicker="Showroom appointment"
        textOnly
        title="Your appointment is requested"
      />
      <CardsRow
        cards={[
          {
            title: 'Measure your walls',
            description:
              'Twenty minutes with a tape measure means the plan you leave with is closer to final.',
            href: '/resources/measuring-guide',
            ctaLabel: 'Measuring guide',
            image: {
              src: '/images/book/measure.webp',
              alt: 'Hands stretching a tape measure into the corner of a kitchen wall, a sketch on the counter',
            },
          },
          {
            title: 'Narrow the finishes',
            description:
              'Have a look at the collections first so the showroom visit starts with three doors rather than thirty.',
            href: '/cabinets/assembled-cabinets',
            ctaLabel: 'Browse the collections',
            image: {
              src: '/images/book/inspiration.webp',
              alt: 'A hand holding a phone showing a grid of saved kitchen photos, a bright kitchen behind',
            },
          },
          {
            title: 'Get a rough number',
            description:
              'Two minutes with the estimator and you’ll know what range to expect before you sit down.',
            href: '/mykitchen/price-my-kitchen',
            ctaLabel: 'Price my kitchen',
            image: {
              src: '/images/home/ways/estimator.webp',
              alt: 'A couple at their kitchen island, checking a price range on a phone',
            },
          },
        ]}
        columns={3}
        ctaStyle="link"
        imageStyle="plain"
        kicker="Before you come in"
        tint
        title="Three things that make the visit count"
      />
    </>
  );
}
