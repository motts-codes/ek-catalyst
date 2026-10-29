import { BadgeDollarSign, CreditCard, Ruler } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { ShowroomCards } from '@/vibes/soul/sections/page-kit/showrooms';
import {
  FREE_DESIGN_HREF,
  SAMPLES_HREF,
  SHOWROOMS as SHOWROOM_LINKS,
} from '~/lib/home/home-content';
import { SHOWROOMS } from '~/lib/pages/showrooms';

export const metadata: Metadata = {
  title: 'Showrooms in Connecticut',
  description:
    'Six Express Kitchens showrooms across Connecticut. Walk through full kitchens, hold the doors, and get your kitchen priced by a designer while you are there. Free, and walk-ins are welcome.',
};

export default async function Showrooms({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Showrooms', href: '/showrooms' }]} />
      <PageHero
        actions={[
          { label: 'Book a visit', href: '/book', primary: true },
          { label: 'See the locations', href: '#locations', style: 'outline' },
        ]}
        description="Walk through full kitchens, hold the doors, and get your kitchen priced by a designer while you're there. Free, and walk-ins are welcome."
        image={{
          src: '/images/showrooms/hero.webp',
          alt: 'A bright showroom floor with white, sage, navy and oak display kitchens',
        }}
        imageLabel="A showroom floor, wide"
        kicker="Six showrooms across Connecticut"
        title="Come and see your kitchen before you buy it"
      />
      <Prose
        body={[
          "Plan on an hour or so. You'll leave with an itemized quote, priced both RTA and assembled.",
          'Bring your measurements, or we can measure for $85 (CT and greater-CT zip codes).',
        ]}
        kicker="What a visit is like"
        tint
        title="Walk through real kitchens, not samples on a wall"
      />
      <CardsRow
        cards={[
          {
            icon: BadgeDollarSign,
            title: 'Price match',
            description: "We'll match a written quote on the same Star cabinets or countertops.",
          },
          {
            icon: CreditCard,
            title: 'Financing',
            description: 'Spread the cost with GreenSky. Apply with your designer.',
          },
          {
            icon: Ruler,
            title: 'Measuring',
            description: '$85, in CT and greater-CT zip codes.',
          },
        ]}
        className="[&>div]:pb-2"
        columns={3}
        hideImages
        kicker="Only in a showroom"
        title="Three things you can only do in person"
      />
      <FinePrint className="[&>div]:pt-0" variant="plain">
        Not available online or at our Factory Outlet.
      </FinePrint>
      <ShowroomCards bookHref="/book" showrooms={SHOWROOMS} title="Find the showroom nearest you" />
      <Prose
        actions={[
          { label: 'Book a video consult', href: FREE_DESIGN_HREF, primary: true },
          { label: 'Order a sample door', href: SAMPLES_HREF, style: 'outline' },
        ]}
        body={[
          'Video consults in every state, 9 AM–5 PM ET. Send your measurements and photos, and get the same itemized quote.',
        ]}
        imageLabel="A designer on a video call with a plan on screen"
        imagePosition="right"
        kicker="Can't get to a showroom?"
        tint
        title="Plan it from your kitchen table instead"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOM_LINKS}
      />
    </>
  );
}
