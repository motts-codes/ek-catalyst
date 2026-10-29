import { ClipboardList, CreditCard, DollarSign, Ruler } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { ShowroomCards } from '@/vibes/soul/sections/page-kit/showrooms';
import { ShowroomLocator } from '@/vibes/soul/sections/showroom-locator';
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
        split="even"
        title="Come and see your kitchen before you buy it"
      />
      <CardsRow
        cardTone="red"
        cards={[
          {
            icon: ClipboardList,
            title: 'Leave with a quote',
            description: 'An itemized price, RTA and assembled, in about an hour.',
          },
          {
            icon: DollarSign,
            title: 'Price match',
            description: "We'll match a written quote on the same Star cabinets or countertops.",
          },
          {
            icon: CreditCard,
            title: 'Financing',
            description: 'Spread the cost with GreenSky. Apply with your Project Manager.',
          },
          {
            icon: Ruler,
            title: 'Measuring',
            description: "We'll measure your kitchen for $85 (CT and greater-CT zip codes).",
          },
        ]}
        className="[&>div]:pb-2"
        columns={4}
        description="Four things that make the trip worth it."
        hideImages
        kicker="Why visit"
        title="What you get in a showroom"
      />
      <FinePrint className="[&>div]:pt-0" variant="plain">
        Price match and financing aren't available online or at our Factory Outlet.
      </FinePrint>
      <ShowroomLocator showrooms={SHOWROOMS} token={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} />
      <ShowroomCards
        bookHref="/book"
        id="showroom-cards"
        showrooms={SHOWROOMS}
        title="Find the showroom nearest you"
      />
      <Prose
        actions={[
          { label: 'Book a video consult', href: FREE_DESIGN_HREF, primary: true },
          { label: 'Order a sample door', href: SAMPLES_HREF, style: 'outline' },
        ]}
        body={[
          'Video consults in every state, 9 AM–5 PM ET. Send your measurements and photos, and get the same itemized quote.',
        ]}
        image={{
          src: '/images/home/ways/design-consult.webp',
          alt: 'A designer on a video call with a couple, their kitchen plan and door samples on her laptop',
        }}
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
