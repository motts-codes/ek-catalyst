import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { FinePrint, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ESTIMATOR_HREF, FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'How to Measure Your Kitchen',
  description:
    'Six steps, wall by wall, with only a tape measure. Every measurement is checked by a Project Manager before anything is ordered.',
};

const STEPS = [
  {
    title: '1 · Sketch the room',
    description:
      'Draw the outline from above and label each wall A, B, C. Mark the door, and where you stand when you cook.',
  },
  {
    title: '2 · Measure each wall three times',
    description:
      'At the floor, at counter height (36 in.) and at the ceiling, and use the smallest. Corner to corner, to the wall rather than the trim.',
  },
  {
    title: "3 · Mark what can't move",
    description:
      'Windows and doors (width, height and distance from the corner), the sink waste, gas line, radiator and vents.',
  },
  {
    title: '4 · Note the ceiling',
    description:
      'Height in three places. If there are soffits or bulkheads, how deep they are and how far down they come.',
  },
  {
    title: '5 · Measure the appliances',
    description:
      "Width, height and depth of the fridge, range, dishwasher and microwave, or the spec sheet if you're buying new. Note which way the fridge door swings.",
  },
  {
    title: '6 · Photograph every wall',
    description:
      'Stand back and take one photo per wall and one of the whole room. Your designer will use them more than the numbers.',
  },
];

export default async function MeasuringGuide({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'Measuring guide', href: '/resources/measuring-guide' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Get started', href: '#steps', primary: true },
          { label: 'Already have measurements? Send them', href: FREE_DESIGN_HREF },
        ]}
        description="Measuring your kitchen takes about twenty minutes and a tape measure, and you don't need to get it perfect: every number you send us is checked by a Project Manager before anything is ordered. Follow the six steps below, wall by wall, and if you get stuck at any point, call or text 860-247-1000 and we'll talk you through it."
        imageLabel="A tape measure across a kitchen wall"
        kicker="Measuring guide"
        title="How to measure like a pro"
      />
      <CategoryPoints
        points={[
          { icon: 'stock', label: 'A designer reviews your measurements' },
          { icon: 'clock', label: 'First design back in [X] business days' },
          { icon: 'phone', label: 'Stuck? Call or text 860-247-1000' },
        ]}
      />
      <CardsRow
        cards={[
          { title: 'Tape measure', description: 'A 25 ft one if you have it.' },
          { title: 'Pencil and paper', description: 'Or the printable template.' },
          { title: 'Level', description: 'Floors and ceilings are rarely flat.' },
          { title: 'Your phone', description: 'For photos of every wall.' },
          { title: 'Laser measure', description: 'Optional, but faster and more exact.' },
        ]}
        columns={5}
        hideImages
        kicker="You will need"
        tint
        title="Five things, one of them your phone"
      />
      <HomeSection id="steps" kicker="Step by step" title="Six steps, wall by wall">
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-3xl bg-contrast-100">
          <MediaPlaceholder label="Diagram — room plan with walls A, B, C labelled and the measurement points marked" />
        </div>
        <ol className="grid gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
          {STEPS.map((step) => (
            <li className="rounded-3xl border border-contrast-100 bg-white p-6" key={step.title}>
              <h3 className="font-heading text-lg font-semibold leading-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-contrast-500">{step.description}</p>
            </li>
          ))}
        </ol>
      </HomeSection>
      <CardsRow
        cards={[
          {
            title: "You're matched with a Project Manager",
            description:
              "Within 1 business day. Send the sketch, numbers and photos. A Project Manager at your nearest showroom picks them up, checks them and calls about anything the sketch doesn't show.",
            imageLabel: "A Project Manager with a customer's sketch",
          },
          {
            title: 'Your first design',
            description:
              '2 business days on average. A 3D design of your kitchen, overhead and in perspective, with the cabinet list and an itemized price in your collection, RTA or assembled.',
            imageLabel: 'A 3D kitchen design',
          },
          {
            title: "Changes, until it's right",
            description:
              '1–3 business days per revision. Move the sink, swap a collection, add an island. Revisions are free and unlimited; most kitchens settle in two rounds.',
            imageLabel: 'Designer and customer at a screen',
          },
          {
            title: 'Order with confidence',
            description:
              'Ships in 2–3 weeks. The final itemized quote is what you pay, online or with your Project Manager. RTA ships in two weeks, assembled in three, from Bristol.',
            imageLabel: 'Cabinets wrapped on a pallet',
          },
        ]}
        columns={4}
        description="Four steps from your numbers to a kitchen on order, with how long each one takes. (Turnaround times to confirm.)"
        kicker="What's next"
        tint
        title="After the measurements"
      />
      <DeliveryLadder
        columns={['Cabinet', 'Depth', 'Height']}
        rows={[
          ['!Base cabinets', '24 in.', '34½ in. (+1½ in. countertop)'],
          ['!Wall cabinets', '12 in.', '30, 36 or 42 in.'],
          ['!Tall / pantry', '24 in.', '84, 90 or 96 in.'],
          ['!Widths', '9 to 48 in., in 3 in. steps', ''],
        ]}
        title="Sizes worth knowing"
      />
      <DeliveryLadder
        columns={['Between', 'Minimum']}
        footnote="Standard sizes for Express Kitchens cabinets, to confirm against the spec sheets."
        rows={[
          ['!Countertop and wall cabinets', '18 in.'],
          ['!Cabinets and major appliances', '1–2 in.'],
          ['!A walkway', '36 in.'],
          ['!An island, two cooks', '42–48 in.'],
        ]}
        tint
        title="Clearances"
      />
      <CardsRow
        cards={[
          {
            title: 'Measuring to the trim',
            description: 'Measure to the wall. Baseboard and casing come off or get scribed.',
          },
          {
            title: 'Trusting the floor',
            description: 'Check level. Floors and ceilings in older Connecticut homes rarely are.',
          },
          {
            title: 'Missing the soffit',
            description: 'Vents, pipes and bulkheads decide wall-cabinet height.',
          },
          {
            title: 'Forgetting the appliances',
            description:
              'A fridge that is an inch deeper than the cabinet beside it is the most common reorder.',
          },
          {
            title: 'Skipping the photos',
            description:
              'A photo shows the designer what no sketch can: the window trim, the radiator, the light.',
          },
        ]}
        columns={5}
        hideImages
        kicker="Common mistakes"
        title="The five that cause reorders"
      />
      <FinePrint>
        Turnaround times and standard sizes are to be confirmed by Express Kitchens before launch.
      </FinePrint>
      <ClosingBand
        description="Twenty minutes with a tape measure, then the estimator turns the 10×10 into your kitchen."
        primary={{ label: 'Price my kitchen', href: ESTIMATOR_HREF }}
        secondary={{ label: 'Send my measurements', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Measured? Now price it."
      />
    </>
  );
}
