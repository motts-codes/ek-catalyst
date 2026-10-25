import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { LinkCards, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SAMPLES_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Kitchen Visualizer',
  description:
    'See a finish in a room before you buy. The visualizer is on its way; until then, the finished kitchens gallery and free samples get you most of the way there.',
};

// Reserved for the third-party visualizer embed (final phase). Until it's chosen, this page
// sends people to the two things that answer the same question today.
export default async function Visualizer({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Explore', href: '/mykitchen' },
          { label: 'Visualizer', href: '/mykitchen/visualize-my-kitchen' },
        ]}
      />
      <PageHero
        description="We're building a tool that lets you try our finishes on a photo of your own kitchen. It isn't ready yet, and we'd rather tell you that than show you something half-done. In the meantime, the two links below answer the same question: the gallery shows every finish in real rooms, and a free sample door shows it in your light."
        kicker="Visualizer"
        textOnly
        title="See a finish in your room"
      />
      <LinkCards
        cards={[
          {
            title: 'See finished kitchens',
            description:
              'Real rooms, named collections and finishes, so you can find the look you’re after and see what it’s made of.',
            href: '/inspiration/projects',
            linkLabel: 'Browse the gallery',
          },
          {
            title: 'Order a sample door',
            description:
              'Your first two quarter doors are free with the code FREESAMPLES. Nothing beats the real finish on your own counter.',
            href: SAMPLES_HREF,
            linkLabel: 'Order free samples',
          },
        ]}
        columns={2}
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
