import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import {
  CabinetFilm,
  FactoryRail,
  HeroScrub,
  MetricsTicker,
  StatementReveal,
  WaitBand,
} from '@/vibes/soul/sections/why-us-scroll';
import {
  ESTIMATOR_HREF,
  FREE_DESIGN_HREF,
  HOME_REVIEWS,
  SAMPLES_HREF,
  SHOWROOMS,
} from '~/lib/home/home-content';

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
        signLine1="Simplifying Kitchens"
        signLine2="for 110+ years"
        title="Why Express Kitchens: simplifying kitchens for 110+ years"
      />
      <StatementReveal
        accentLines={[1, 2]}
        lines={[
          "The kitchen you've been picturing.",
          'Without the wait.',
          'Without the price you were dreading.',
        ]}
      />
      <MetricsTicker
        metrics={[
          { icon: 'package', value: '50,000+', label: 'All-plywood cabinets, ready to ship' },
          { icon: 'star', value: '5,000+', label: 'Happy customer reviews' },
          { icon: 'design', value: '100K+', label: 'Kitchens designed' },
          { icon: 'pin', value: '6', label: 'Showrooms to visit' },
          { icon: 'shield', value: 'A+', label: 'BBB rating' },
        ]}
      />
      <WaitBand
        description="A custom kitchen usually takes 14 weeks to arrive. Ours are already built, all-plywood, and sitting in stock in Connecticut."
        kicker="Why wait 14 weeks?"
        lanes={[
          { label: 'Industry average', value: '14 weeks', width: 100 },
          { label: 'Express Kitchens', value: '3 weeks', width: 21.4, highlight: true },
        ]}
        note="Bars are to scale: 3 weeks against 14."
        title="The industry mistook waiting for quality."
      />
      <CabinetFilm
        features={[
          {
            title: 'All-plywood construction',
            description: 'No particleboard anywhere in the box.',
          },
          { title: 'Soft-close hinges', description: 'Every door settles shut on its own.' },
          {
            title: 'Dovetail drawer boxes',
            description: 'Solid wood, joined the way furniture is.',
          },
          {
            title: 'Undermount drawer glides',
            description: 'Full extension, hidden under the drawer.',
          },
          { title: 'BBB A+ rating', description: 'And 5,000+ customer reviews behind it.' },
        ]}
        kicker="What makes an EK cabinet"
        title="The same box, whether you pay showroom or outlet price."
      />
      <FactoryRail
        kicker="The factory · Bristol, Connecticut"
        stations={[
          {
            title: 'Cut',
            description: 'AI-guided CNC machines cut every plywood panel.',
            imageLabel: 'EK plant photo: CNC line',
          },
          {
            title: 'Paint',
            description: 'Robotic sprayers lay down the finish.',
            imageLabel: 'EK plant photo: paint robots',
          },
          {
            title: 'Assemble',
            description: 'Boxes are built and checked by hand.',
            imageLabel: 'EK plant photo: assembly',
          },
          {
            title: 'Stock',
            description: '50,000 finished cabinets wait on the racks.',
            imageLabel: 'EK plant photo: warehouse racks',
          },
          {
            title: 'Ship',
            description: 'Your order leaves within days.',
            imageLabel: 'EK plant photo: loading dock',
          },
        ]}
        title="300,000 square feet. Run by robots, checked by people."
      />
      <PageBreadcrumbs
        breadcrumbs={[{ label: 'Why Express Kitchens', href: '/why-express-kitchens' }]}
      />
      <PageHero
        actions={[
          { label: 'Shop cabinets', href: '/cabinets', primary: true },
          { label: 'Free design consult', href: FREE_DESIGN_HREF },
        ]}
        description="Would you rather save with ready-to-assemble, or have the building done for you? With us you don't have to choose between the two companies that offer each — it's the same cabinet, the same finish and the same warranty either way, and you decide. Every one of them is built in our own factory, kept in stock in Bristol and shipped in two weeks. That's what a website with a warehouse somewhere can't say to you."
        headingLevel={2}
        imageLabel="A finished Connecticut kitchen, with the family in it"
        kicker="Why Express Kitchens"
        title="The kitchen you want, your way — made and stocked in Connecticut"
      />
      <CardsRow
        cards={[
          {
            title: 'We make it',
            description:
              "Star Cabinetry is our own brand, built in our Bristol factory. That's why your price is manufacturer-direct, and why the whites match from the wall cabinets to the base run.",
            ctaLabel: "See how it's built",
            href: '/cabinets',
            imageLabel: 'The cabinet line in the Bristol factory',
          },
          {
            title: 'We stock it',
            description:
              'There are 50,000 cabinets on the shelf in Connecticut right now. Two weeks is a real promise because your cabinets are already here, not being built to order overseas.',
            ctaLabel: 'Shop in-stock cabinets',
            href: '/cabinets/assembled-cabinets',
            imageLabel: 'Racked stock in the warehouse',
          },
          {
            title: 'You can see it',
            description:
              "Six showrooms across Connecticut where you can open a drawer, hold a door and meet the person who'll plan your kitchen.",
            ctaLabel: 'Find a showroom',
            href: '/showrooms',
            imageLabel: 'A showroom, drawer open',
          },
          {
            title: 'The price is on the page',
            description:
              'Every collection shows its 10×10 price. No quote wall, no "call for pricing". And if you bring us a competitor\'s quote, we\'ll beat it or pay you $500.',
            ctaLabel: 'Price match guarantee',
            href: '#',
            imageLabel: 'A collection card with its price',
          },
          {
            title: 'Free design, from a named person',
            description:
              'A Project Manager plans your kitchen with you — at home, in a showroom or on a call — and gives you a fixed price. No deposit, and you keep the plan.',
            ctaLabel: 'Free design consult',
            href: FREE_DESIGN_HREF,
            imageLabel: 'A Project Manager with a homeowner',
          },
          {
            title: 'Hold it before you buy',
            description:
              'Your first two quarter-door samples are free with the code FREESAMPLES. The real door, in the real finish, in your own light.',
            ctaLabel: 'Order samples',
            href: SAMPLES_HREF,
            imageLabel: 'Two quarter-door samples',
          },
        ]}
        columns={3}
        description="Each one is a fact you can check for yourself, on this site or in a showroom."
        kicker="Six reasons"
        tint
        title="Proven, not claimed"
      />
      <DeliveryLadder
        columns={[
          '',
          'Express Kitchens',
          'Online-only sellers',
          'Big-box stores',
          'Custom cabinet shops',
        ]}
        description="We've kept only the rows where the answer is different, and used categories rather than names so you can check them yourself."
        rows={[
          ['!Made by the company that sells it', '✓', '—', '—', '✓'],
          ['!In stock, ships in 2 weeks', '✓', 'Some', '—', '—'],
          ['!Showrooms you can visit', '✓ Six in CT', '—', '✓', 'Some'],
          ['!Price shown on every collection', '✓', '✓', '—', '—'],
          ['!Free design with a named Project Manager', '✓', 'Online only', '✓', '✓'],
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
        summary="4.5 · 360+ Google reviews"
        tint
        title="In their words"
      />
      <CardsRow
        cards={[
          {
            title: 'I want a number',
            description:
              'The estimator gives you a real range for your room in four steps. Nothing is gated behind a form.',
            ctaLabel: 'Price my kitchen',
            href: ESTIMATOR_HREF,
            imageLabel: 'Estimator on a phone',
          },
          {
            title: 'I want to hold it',
            description:
              'Your first two quarter-door samples are free. The real door, in the real finish, in your light.',
            ctaLabel: 'Order free samples',
            href: SAMPLES_HREF,
            imageLabel: 'Two quarter-door samples',
          },
          {
            title: 'I want a person',
            description:
              'A Project Manager plans it with you — at home, in a showroom or on a call.',
            ctaLabel: 'Free design consult',
            href: FREE_DESIGN_HREF,
            primary: true,
            imageLabel: 'A designer with a homeowner',
          },
        ]}
        kicker="Where next"
        title="Three ways to be sure"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
