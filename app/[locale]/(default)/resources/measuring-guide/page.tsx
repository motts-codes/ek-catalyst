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
  title: 'How to measure your kitchen for cabinets',
  description:
    'Measure your kitchen in 20 minutes with a tape measure and your phone. Six simple steps, and a project manager checks every number before you order.',
};

// Arun's copy of 27 Oct 2026. "Project manager" is EK's real role: the showroom staff member
// who designs the kitchen with the customer. Turnaround times are typical and to be confirmed.
const STEPS = [
  {
    title: '1 · Sketch the room',
    description:
      "Draw the kitchen as if you're looking down from the ceiling. Label each wall A, B, C, and mark the doors and windows. It doesn't need to be neat.",
  },
  {
    title: '2 · Measure each wall three times',
    description:
      'Measure corner to corner at the floor, at counter height (36") and near the ceiling. Write down the smallest number, because that\'s the one your cabinets have to fit. Measure to the wall itself, not to the baseboard.',
  },
  {
    title: "3 · Mark what can't move",
    description:
      'For each window and door, note its width, height and distance from the corner, and the height of the window sill. Mark the sink pipes, gas line, outlets, switches, vents and radiators.',
  },
  {
    title: '4 · Measure the ceiling height',
    description:
      "Measure it in three places. If there's a boxed-in section above where the wall cabinets go (a soffit), note how deep it is and how far down it comes.",
  },
  {
    title: '5 · Measure your appliances',
    description:
      'Note the width, height and depth of the fridge, range, dishwasher and microwave. Buying new ones? Use the spec sheet. Note which way the fridge door opens.',
  },
  {
    title: '6 · Photograph every wall',
    description:
      "Stand back and take one photo of each wall, plus one of the whole room. Photos show your project manager what a sketch can't.",
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
          { label: 'Start measuring', href: '#steps', primary: true },
          { label: 'Already measured? Send your numbers', href: FREE_DESIGN_HREF },
        ]}
        description="All you need is a tape measure and your phone. Don't worry about getting it perfect: a project manager checks every number before anything is ordered. Follow the six steps, one wall at a time, and if you get stuck, call or text 860-247-1000 and we'll talk you through it."
        image={{
          src: '/images/pages/measuring/tape-across-wall.jpg',
          alt: 'A tape measure across an empty kitchen wall',
        }}
        imageLabel="A tape measure across a kitchen wall"
        kicker="Measuring guide"
        title="Measure your kitchen like a pro, in 20 minutes"
      />
      <CategoryPoints
        points={[
          { icon: 'stock', label: 'A project manager checks every measurement' },
          { icon: 'clock', label: 'First design in about 2 business days' },
          { icon: 'phone', label: 'Stuck? Call or text 860-247-1000' },
        ]}
      />
      <CardsRow
        cards={[
          { title: 'Tape measure', description: 'A 25 ft one is ideal.' },
          { title: 'Pencil and paper', description: 'Or print our template.' },
          { title: 'Your phone', description: 'For a photo of every wall.' },
          { title: 'A level (optional)', description: 'Floors and ceilings are rarely flat.' },
        ]}
        columns={4}
        hideImages
        kicker="You'll need"
        tint
        title="Four things, one of them your phone"
      />
      <HomeSection id="steps" kicker="Step by step" title="Six steps, one wall at a time">
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-3xl bg-contrast-100">
          <MediaPlaceholder label="A room plan with walls A, B and C labeled and the measuring points marked" />
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
            title: 'A project manager takes it from here',
            meta: 'Within 1 business day',
            description:
              "Send your sketch, numbers and photos. A project manager at your nearest showroom, who'll design your kitchen with you, checks them and calls you about anything that isn't clear.",
            image: {
              src: '/images/pages/measuring/pm-with-sketch.jpg',
              alt: "A project manager reviewing a customer's kitchen sketch",
            },
            imageLabel: "A project manager with a customer's sketch",
          },
          {
            title: 'Your first design',
            meta: 'About 2 business days',
            description:
              'A 3D design of your kitchen, from above and in perspective, with the full cabinet list and an itemized price, RTA or assembled.',
            image: {
              src: '/images/pages/measuring/3d-kitchen-design.jpg',
              alt: 'A 3D kitchen design on a monitor',
            },
            imageLabel: 'A 3D kitchen design',
          },
          {
            title: "Changes until it's right",
            meta: '1–3 business days each',
            description:
              'Move the sink, try another style, add an island. Changes are free, and most kitchens are settled in two rounds.',
            image: {
              src: '/images/pages/measuring/designer-customer-screen.jpg',
              alt: 'A designer and a customer looking at a kitchen design on a screen',
            },
            imageLabel: 'Designer and customer at a screen',
          },
          {
            title: 'Order',
            meta: 'Ships in 2–8 weeks',
            description:
              'The final itemized quote is what you pay. Most collections ship in 2–3 weeks (Euro in 4, Prism painted colors in 8), then 7–10 days in transit.',
            image: {
              src: '/images/pages/measuring/cabinets-wrapped-pallet.jpg',
              alt: 'Assembled cabinets wrapped on a pallet',
            },
            imageLabel: 'Cabinets wrapped on a pallet',
          },
        ]}
        columns={4}
        description="Here's what happens after you send your measurements, and how long each step takes."
        kicker="What happens next"
        tint
        title="From your numbers to cabinets on order"
      />
      <DeliveryLadder
        columns={['Cabinet', 'Depth', 'Height']}
        rows={[
          ['!Base cabinets', '24"', '34½" (36" with the countertop)'],
          ['!Wall cabinets', '12"', '30", 36" or 42"'],
          ['!Tall / pantry cabinets', '24"', '84", 90" or 96"'],
          ['!Widths', '9" to 48", in 3" steps', ''],
        ]}
        title="Sizes worth knowing"
      />
      <DeliveryLadder
        columns={['Between', 'At least']}
        rows={[
          ['!Countertop and wall cabinets', '18"'],
          ['!Cabinets and large appliances', '1–2"'],
          ['!A walkway', '36"'],
          ['!Island and counter, with two cooks', '42–48"'],
        ]}
        tint
        title="Space to leave"
      />
      <CardsRow
        cards={[
          {
            title: 'Measuring to the baseboard',
            description:
              'Measure to the wall itself. Baseboards and door trim can be trimmed or worked around.',
          },
          {
            title: 'Trusting the floor',
            description:
              'Check it with a level. Floors and ceilings in older homes are rarely flat.',
          },
          {
            title: 'Missing the soffit',
            description:
              'A boxed-in section above the cabinets, or a vent or pipe, decides how tall your wall cabinets can be.',
          },
          {
            title: 'Forgetting the appliances',
            description:
              'A fridge just an inch deeper than the cabinet beside it is the most common reorder.',
          },
          {
            title: 'Skipping the photos',
            description:
              'A photo shows your project manager what no sketch can: window trim, radiators, outlets.',
          },
        ]}
        columns={5}
        hideImages
        kicker="Common mistakes"
        title="Five mistakes that cause reorders"
      />
      <FinePrint>
        Turnaround times are typical, not guaranteed. Standard sizes may vary by collection; your
        project manager confirms every size before you order.
      </FinePrint>
      <ClosingBand
        description="Send your sketch, numbers and photos, and a project manager will turn them into a 3D design with an exact price. It's free, with no obligation to buy."
        primary={{ label: 'Send my measurements', href: FREE_DESIGN_HREF }}
        secondary={{ label: 'Price my kitchen', href: ESTIMATOR_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Measured? Send it to a project manager."
      />
    </>
  );
}
