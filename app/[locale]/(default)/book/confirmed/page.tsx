import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { LinkCards, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';

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
      <LinkCards
        cards={[
          {
            title: 'Measure your walls',
            description:
              'Twenty minutes with a tape measure means the plan you leave with is closer to final.',
            href: '/resources/measuring-guide',
            linkLabel: 'Measuring guide',
          },
          {
            title: 'Narrow the finishes',
            description:
              'Have a look at the collections first so the showroom visit starts with three doors rather than thirty.',
            href: '/cabinets/assembled-cabinets',
            linkLabel: 'Browse the collections',
          },
          {
            title: 'Get a rough number',
            description:
              'Two minutes with the estimator and you’ll know what range to expect before you sit down.',
            href: '/mykitchen/price-my-kitchen',
            linkLabel: 'Price my kitchen',
          },
        ]}
        columns={3}
      />
    </>
  );
}
