import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { LinkCards, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SAMPLES_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Guides, tools and answers for planning a kitchen: measuring, the 10×10 kitchen, videos, samples, financing and care.',
};

export default async function Resources({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Resources', href: '/resources' }]} />
      <PageHero
        description="Everything we've written and filmed to help you plan a kitchen with confidence, from measuring your room to keeping the doors looking new ten years on. Every guide is also linked from the page where the question comes up, so you'll never be far from the answer."
        kicker="Resources"
        textOnly
        title="Guides, tools and straight answers"
      />
      <LinkCards
        cards={[
          {
            title: 'Measuring guide',
            description:
              'Six steps, wall by wall, and a Project Manager checks every number before anything is ordered.',
            href: '/resources/measuring-guide',
          },
          {
            title: 'What is a 10×10 kitchen',
            description:
              'The standard kitchen behind every "from" price, and exactly what is in ours.',
            href: '/resources/ten-by-ten-kitchen',
          },
          {
            title: 'Order samples',
            description:
              'Hold the real door in your own light. Your first two quarter doors are free.',
            href: SAMPLES_HREF,
          },
          {
            title: 'Free design consult',
            description: 'A Project Manager plans your kitchen with you and prices it, free.',
            href: FREE_DESIGN_HREF,
          },
        ]}
        kicker="Getting started"
        tint
        title="Before you order"
      />
      <LinkCards
        cards={[
          {
            title: 'How-to videos',
            description:
              'Assembly, measuring, design help and installation prep, filmed in our own factory and showrooms.',
            href: '/resources/how-to-videos',
          },
          {
            title: 'Cabinet care',
            description: 'Cleaning by finish, adjusting hinges, touch-ups and what never to use.',
            href: '/resources/cabinet-care',
          },
          {
            title: 'Financing',
            description:
              '0% financing from $299 a month, with no impact on your credit score to check.',
            href: '/financing',
          },
          {
            title: 'Warranty',
            description: "What's covered, for how long, and what counts as a defect.",
            href: '/warranty',
          },
        ]}
        kicker="Guides"
        title="While you build, and afterwards"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
