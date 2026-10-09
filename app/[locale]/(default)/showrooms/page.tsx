import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { ShowroomCards } from '@/vibes/soul/sections/page-kit/showrooms';
import {
  FREE_DESIGN_HREF,
  SAMPLES_HREF,
  SHOWROOMS as SHOWROOM_LINKS,
} from '~/lib/home/home-content';
import { SHOWROOMS, VIRTUAL_CONSULT } from '~/lib/pages/showrooms';

export const metadata: Metadata = {
  title: 'Showrooms in Connecticut',
  description:
    'Six Express Kitchens showrooms across Connecticut with full-size kitchens on display and a Project Manager who designs and prices your kitchen while you are there.',
};

export default async function Showrooms({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Showrooms', href: '/showrooms' }]} />
      <PageHero
        actions={[
          { label: 'Schedule a visit', href: FREE_DESIGN_HREF, primary: true },
          { label: 'See the locations', href: '#locations' },
        ]}
        description="There's a difference between scrolling past a kitchen and standing in one. In every showroom you can walk through complete, installed kitchens, open the drawers, hold a door in your hand and sit down with a Project Manager who will lay out your room and price it while you're there. It's free, with no deposit and no obligation. Walk in whenever suits you, or book a time so someone is ready for you."
        imageLabel="A showroom floor, wide"
        kicker="Six showrooms across Connecticut"
        title="Come and see your kitchen before you buy it"
      />
      <Prose
        body={[
          "Think of it as an hour to ninety minutes well spent. You'll see all 30+ door styles on the floor rather than on a screen, hold countertop and tile boards against the cabinets they go with, and talk through your layout with someone who plans kitchens every day. You leave with a drawing, an itemized quote and a delivery date you can plan around.",
          "If you're near Bristol, that showroom is also our factory outlet, so you'll find floor models and clearance stock alongside the displays.",
        ]}
        kicker="What a visit is like"
        tint
        title="Walk through real kitchens, not samples on a wall"
      />
      <ShowroomCards
        bookHref={FREE_DESIGN_HREF}
        showrooms={SHOWROOMS}
        title="Find the showroom nearest you"
      />
      <Prose
        actions={[
          { label: 'Book a virtual consult', href: FREE_DESIGN_HREF, primary: true },
          { label: 'Order a sample door', href: SAMPLES_HREF },
        ]}
        body={[
          `The same Project Managers who work in our showrooms also plan kitchens over video. Send a few photos and rough measurements, and we'll draw your layout on screen and price it just as we would in person. Virtual appointments run ${VIRTUAL_CONSULT.hours}; call ${VIRTUAL_CONSULT.phone} to arrange one, or book below.`,
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
