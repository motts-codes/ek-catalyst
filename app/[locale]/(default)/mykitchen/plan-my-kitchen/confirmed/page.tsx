import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { SAMPLES_HREF } from '~/lib/home/home-content';

export const metadata: Metadata = { title: 'Request received', robots: { index: false } };

export default async function FreeDesignConfirmed({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Free design consult', href: '/mykitchen/plan-my-kitchen' },
          { label: 'Requested', href: '/mykitchen/plan-my-kitchen/confirmed' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Order free samples', href: SAMPLES_HREF, primary: true },
          { label: 'See finished kitchens', href: '/inspiration' },
        ]}
        description="Thank you. A designer will call you within one business day to confirm the day, the time and the way you'd like to meet. Until then, there's nothing you need to do — bring a photo of the room, rough measurements if you have them, or nothing at all."
        kicker="Request received"
        textOnly
        title="Your consult is on its way"
      />
      <CardsRow
        cards={[
          {
            title: 'A photo of the room',
            description: 'Any angle, from your phone. It tells the designer more than a sketch.',
            imageLabel: 'A phone photo of a kitchen',
          },
          {
            title: 'Rough wall lengths',
            description: 'Corner to corner with a tape measure. Twenty minutes, and rough is fine.',
            imageLabel: 'A tape measure along a wall',
          },
          {
            title: 'Anything you have saved',
            description:
              'Screenshots, a colour, a kitchen you liked. It gives us a starting point.',
            imageLabel: 'Saved kitchen screenshots on a phone',
          },
        ]}
        kicker="Before the consult"
        tint
        title="Three things that make it better"
      />
    </>
  );
}
