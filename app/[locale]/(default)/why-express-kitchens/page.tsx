import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import {
  CabinetFilm,
  FactoryRail,
  HeroScrub,
  MetricsTicker,
  StatementReveal,
  WaitBand,
} from '@/vibes/soul/sections/why-us-scroll';
import { FREE_DESIGN_HREF, HOME_REVIEWS, SHOWROOMS, THREE_WAYS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Why Express Kitchens',
  description:
    'Six reasons to buy your kitchen from the company that makes it: built and stocked in Connecticut, shown in six showrooms, priced on the page, designed for free and shipped in two weeks.',
};

export default async function WhyExpressKitchens({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      {/* The scroll story from the client's mockup: a kitchen assembles as you scroll, then the
          lead-time race, the cabinet turning on white, and the factory rail. Then the rest. */}
      <HeroScrub
        cueHint={'Every kitchen starts\nwith a dream'}
        signLine1="We've made 100,000+ real"
        signLine2="Since 1916"
        title="Why Express Kitchens: 100,000+ kitchens since 1916"
      />
      <StatementReveal
        accentWords={['kitchen', 'wait', 'price']}
        lines={[
          "The kitchen you've been picturing.",
          'Without the wait.',
          'Without the price you were dreading.',
        ]}
      />
      <MetricsTicker
        metrics={[
          { icon: 'package', value: '50,000+', label: 'Assembled cabinets, ready to ship' },
          { icon: 'star', value: '5,000+', label: 'Happy customer reviews' },
          { icon: 'design', value: '100K+', label: 'Kitchens designed' },
          { icon: 'pin', value: '6', label: 'Showrooms to visit' },
          { icon: 'shield', value: 'A+', label: 'BBB rating' },
        ]}
      />
      <WaitBand
        description="Custom cabinets are usually built after you order, so you wait in line. Ours are already built and on the shelf in Connecticut. Quick-ship collections ship the next day, RTA in 2 weeks and assembled in 3."
        kicker="Why wait 14 weeks?"
        lanes={[
          { label: 'Industry average', value: '14 weeks', width: 100 },
          { label: 'EK assembled', value: '3 weeks', width: 21.4, highlight: true },
          { label: 'EK RTA', value: '2 weeks', width: 14.3, highlight: true },
          { label: 'EK quick-ship', value: 'Next day', width: 1.5, highlight: true },
        ]}
        note="Bars are to scale."
        source="14 weeks: typical custom-cabinet lead time reported by US kitchen designers, 2025–26."
        title="Most kitchens take 14 weeks. Ours don't."
      />
      <CabinetFilm
        features={[
          {
            title: 'All-plywood box',
            description: 'No particleboard to swell when water gets in.',
          },
          { title: 'Soft-close hinges', description: 'No banging doors, no pinched fingers.' },
          { title: 'Dovetail drawers', description: 'Solid wood, joined like good furniture.' },
          {
            title: 'Full-extension glides',
            description: 'Reach the back of the drawer without kneeling.',
          },
          {
            title: 'Precision-made by robots',
            description:
              'Robots cut, drill and paint every part, so doors line up, gaps stay even and the finish is the same on every door.',
          },
        ]}
        kicker="What's inside every EK cabinet"
        title="Built to take the slam, the spill and the 10th year."
      />
      <FactoryRail
        kicker="Our factory · Connecticut"
        stations={[
          {
            title: 'Cut',
            image: {
              src: '/images/why-us/factory/cut.webp',
              alt: 'A CNC saw cutting white cabinet panels to size',
            },
            description: 'Robots cut every panel to the same exact size.',
            imageLabel: 'EK plant photo: CNC line',
          },
          {
            title: 'Paint',
            image: {
              src: '/images/why-us/factory/paint.webp',
              alt: 'A robotic sprayer finishing sage-green doors on an overhead line',
            },
            description: 'Robotic sprayers lay an even finish on every door.',
            imageLabel: 'EK plant photo: paint robots',
          },
          {
            title: 'Assembled',
            image: {
              src: '/images/why-us/factory/assemble.webp',
              alt: 'A craftsman fitting a door to a white cabinet box in the assembly shop',
            },
            description: 'Assembled cabinets are put together and checked by hand.',
            imageLabel: 'EK plant photo: assembly',
          },
          {
            title: 'Stock',
            image: {
              src: '/images/why-us/factory/stock.webp',
              alt: 'Racks of boxed cabinets in the warehouse',
            },
            description: '50,000 finished cabinets on the racks.',
            imageLabel: 'EK plant photo: warehouse racks',
          },
          {
            title: 'Ship',
            image: {
              src: '/images/why-us/factory/ship.webp',
              alt: 'A forklift loading pallets into an Express Kitchens truck at the dock',
            },
            description: 'Quick-ship the next day. RTA in 2 weeks, assembled in 3.',
            imageLabel: 'EK plant photo: loading dock',
          },
        ]}
        title="300,000 sq ft. Robots for precision. People for the final check."
      />
      <CardsRow
        cards={[
          {
            title: 'Assembled or RTA, your call',
            description:
              'The same cabinet, finish and warranty either way. Pay less and put it together yourself, or have it arrive built.',
            ctaLabel: 'Compare the two',
            href: '/cabinets',
            imageLabel: 'The same cabinet, flat-packed and built',
          },
          {
            title: 'The price is on the page',
            description:
              'Every collection shows its 10x10 kitchen price. No "call for pricing," no form to fill in.',
            ctaLabel: 'Shop cabinets',
            href: '/cabinets/assembled-cabinets',
            imageLabel: 'A collection card with its price',
          },
          {
            title: 'Beat our price, get $500',
            description: "Bring a competitor's quote. We'll beat it, or pay you $500.",
            ctaLabel: 'See the guarantee',
            href: '/price-match-guarantee',
            imageLabel: 'A quote and a cheque',
          },
        ]}
        columns={3}
        description="Each one you can check on this site or in a showroom."
        imageStyle="plain"
        kicker="Only at EK"
        tint
        title="Proven, not promised."
      />
      <DeliveryLadder
        columns={[
          'What to check',
          'Express Kitchens',
          'Online-only sellers',
          'Big-box stores',
          'Custom cabinet shops',
        ]}
        description="Only the rows where the answers differ. We've used store types, not names, so you can check for yourself."
        kicker="Before you shop around"
        rows={[
          ['!Made by the company that sells it', '✓', '—', '—', '✓'],
          ['!In stock, ships in 2–3 weeks (quick-ship next day)', '✓', 'Some', '—', '—'],
          ['!Showrooms you can visit', '✓ Six in CT', '—', '✓', 'Some'],
          ['!Price shown on every collection', '✓', '✓', '—', '—'],
          ['!Free design with a dedicated designer', '✓', 'Online only', '✓', '✓'],
          ['!Free door samples', '✓ First two', 'Paid', '—', '—'],
          ['!RTA and assembled — your choice', '✓', 'RTA only', 'Assembled only', 'Assembled only'],
          ['!Price match guarantee', '✓', 'Some', '✓', '—'],
          ['!0% financing', '✓', '✓', '✓', '—'],
        ]}
        title="How we compare"
      />
      <ReviewMarquee
        action={{ label: 'Read all reviews', href: '/reviews' }}
        reviews={HOME_REVIEWS}
        summary="4.5 on Google · 360+ reviews · BBB A+"
        title="In their words"
      />
      {/* Same three cards as the home page's "Not sure yet?" band, so the two stay in step. */}
      <CardsRow
        cards={THREE_WAYS}
        imageStyle="plain"
        kicker="Where next"
        title="Pick the way you like to decide."
      />
      <ClosingBand
        description="Bring a photo, a sketch or nothing at all. Plan it on a video call or in one of our six Connecticut showrooms, and leave with a layout and a price. Free."
        primary={{ label: 'Book a free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Seen enough? Sit down with a designer."
      />
    </>
  );
}
