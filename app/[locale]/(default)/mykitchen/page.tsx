import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { LinkCards, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { ESTIMATOR_HREF, FREE_DESIGN_HREF, SAMPLES_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { getLowest10x10 } from '~/lib/pages/lowest-price';

export const metadata: Metadata = {
  title: 'Plan Your Kitchen',
  description:
    'The options in plain language before you spend anything: a free designer, ready-to-assemble, factory-assembled or a closet. Pick the one that sounds like you.',
};

const PATHS = [
  {
    title: '“I want it done for me”',
    description:
      'A designer plans your kitchen with you, prices every cabinet and hands you a delivery date. Free, with no deposit and nothing to sign up for.',
    href: FREE_DESIGN_HREF,
    linkLabel: 'Free design consult',
  },
  {
    title: '“I’ll assemble and save”',
    description:
      'The same cabinet, flat-packed and shipped in two weeks, for noticeably less. If you can use a screwdriver, you can build it.',
    href: '/mykitchen/what-are-rta-cabinets',
    linkLabel: 'How RTA works',
  },
  {
    title: '“I want it ready-built”',
    description: 'Built and checked in our factory, ships in 3 weeks, ready to install.',
    href: '/mykitchen/what-are-assembled-cabinets',
    linkLabel: 'How assembled works',
  },
  {
    title: '“It’s my closet”',
    description:
      'Twelve pieces, three colors and one afternoon of building. Closets are a straight shop: pick the pieces and go.',
    href: '/closets',
    linkLabel: 'Design my closet',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Choose',
    description: 'A door style, a color and a program: ready-to-assemble or assembled.',
  },
  {
    n: '2',
    title: 'Sample',
    description:
      'Your first two quarter doors are free, so you can see the finish in your own light.',
  },
  {
    n: '3',
    title: 'Measure',
    description: 'Twenty minutes with a tape measure, or a designer does it for you.',
  },
  {
    n: '4',
    title: 'Order',
    description: 'Two weeks for ready-to-assemble, three for assembled, from stock in Connecticut.',
  },
  {
    n: '5',
    title: 'Install',
    description:
      'Your installer fits them. Online orders don’t include installation, but we can point you to people who do.',
  },
];

const FAQ = {
  headline: 'The four questions everyone asks',
  items: [
    {
      q: 'How much will my kitchen cost?',
      a: 'Cabinets for a standard 10×10 kitchen start at the prices above, and every collection page shows its own 10×10 price. The estimator scales that to your walls in about two minutes, and a designer gives you a fixed price for free.',
    },
    {
      q: 'What’s the difference between RTA and assembled?',
      a: 'Nothing about the cabinet. Same box, same door, same finish, same warranty. Ready-to-assemble arrives flat and you build it, so it costs less and ships a week sooner. Assembled arrives built from our factory, ready to install.',
    },
    {
      q: 'How long does it take?',
      a: 'Ready-to-assemble ships in two weeks and assembled in three. Those are published lead times from stock in Connecticut, not a promise made on a call.',
    },
    {
      q: 'Do you install?',
      a: 'Online orders don’t include installation. Assembled means the cabinet box is built, not fitted to your wall. Installing, levelling and plumbing are your installer’s job either way, and our Find a Pro page lists people who install our cabinets regularly.',
    },
  ],
};

export default async function MyKitchen({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const lowest = await getLowest10x10();

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Explore', href: '/mykitchen' }]} />
      <PageHero
        chips={['Free help', 'Real designers', 'No pressure', 'Nothing to sign up for']}
        description="This is the part of the site that explains your options in plain language before you spend anything. Pick the path below that sounds most like you, by what you want rather than by product name, and we'll take you to the right next step."
        kicker="Explore"
        textOnly
        title="Let's plan your kitchen"
      />
      <LinkCards cards={PATHS} columns={4} />
      <HomeSection
        description="Whichever path you take, the kitchen comes together the same way."
        kicker="How it goes"
        tint
        title="Five steps, start to finish"
      >
        <ol className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-5">
          {STEPS.map((step) => (
            <li className="rounded-3xl border border-contrast-100 bg-white p-5" key={step.n}>
              <span className="font-heading text-3xl font-bold text-[var(--button-primary-background,#d90716)]">
                {step.n}
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-contrast-500">{step.description}</p>
            </li>
          ))}
        </ol>
      </HomeSection>
      <Prose
        actions={[
          { label: 'Get a number in 2 minutes', href: ESTIMATOR_HREF, primary: true },
          { label: 'What’s a 10×10?', href: '/resources/ten-by-ten-kitchen' },
        ]}
        body={[
          'Everyone in this business prices cabinets on a “10×10”: a standard kitchen with two ten-foot walls in an L, about twelve cabinets. It is the fairest way to compare one seller with another, and every “from” price on this site is that kitchen in that collection.',
          `Ours start at ${lowest.rta ?? '$[X]'} ready-to-assemble and ${lowest.assembled ?? '$[X]'} assembled. Yours will differ, of course, and the estimator scales those prices to your own walls in about two minutes.`,
        ]}
        image={{
          src: '/images/estimator/layout-l-shaped.jpg',
          alt: 'The 10×10 kitchen as an L: two 10-foot walls of white shaker cabinets',
        }}
        imageLabel="The 10×10 kitchen, drawn in plan"
        kicker="What a kitchen actually costs"
        title="One honest number to start from"
      />
      <CabinetFaq data={FAQ} />
      <HomeSection
        action={{ label: 'Order free samples', href: SAMPLES_HREF }}
        compact
        tint
        title="Rather hold a door first?"
      >
        <p className="max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
          Your first two quarter-door samples are free with the code FREESAMPLES. Most people find
          the choice gets easy once the doors are on the counter.
        </p>
      </HomeSection>
      <ClosingBand
        primary={{ label: 'Book a free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
