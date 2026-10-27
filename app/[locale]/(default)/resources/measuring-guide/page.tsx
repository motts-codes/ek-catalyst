import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { MinimalTable } from '@/vibes/soul/sections/delivery-ladder';
import { homeHeadingClassName, HomeSection } from '@/vibes/soul/sections/home-section';
import { FinePrint, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { StepsAccordion } from '@/vibes/soul/sections/page-kit/steps-accordion';
import { Image } from '~/components/image';
import { ESTIMATOR_HREF, FREE_DESIGN_HREF } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'How to measure your kitchen for cabinets',
  description:
    'Measure your kitchen in 20 minutes with a tape measure and your phone. Six simple steps, and a project manager checks every number before you order.',
};

// Arun's copy of 27 Oct 2026. "Project manager" is EK's real role: the showroom staff member
// who designs the kitchen with the customer. Turnaround times are typical and to be confirmed.
const STEPS = [
  {
    title: 'Sketch the room',
    description:
      "Draw it from above, label walls A, B, C and mark doors and windows. Neat doesn't matter.",
  },
  {
    title: 'Measure each wall three times',
    description: 'Floor, counter height and ceiling, corner to corner. Keep the smallest number.',
  },
  {
    title: "Mark what can't move",
    description:
      'Every window and door: width, height, distance to the corner. Plus pipes, outlets, vents.',
  },
  {
    title: 'Measure the ceiling height',
    description:
      'In three places. A soffit above the wall cabinets? Note how deep and how far down.',
  },
  {
    title: 'Measure your appliances',
    description:
      'Fridge, range, dishwasher, microwave: width, height, depth. Note the fridge door swing.',
  },
  {
    title: 'Photograph every wall',
    description:
      "Each wall from a few steps back, plus the whole room. Photos show what a sketch can't.",
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
          src: '/images/pages/measuring/hero-measuring-range-3.jpg',
          alt: 'A sketched kitchen with a homeowner in a red top measuring the width of the range with a tape measure',
        }}
        imageStyle="plain"
        kicker="Measuring guide"
        split="even"
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
          {
            title: 'Tape measure',
            description: 'A 25 ft one is ideal.',
            image: { src: '/images/pages/measuring/tool-tape-measure.jpg', alt: '' },
          },
          {
            title: 'Pencil and paper',
            description: 'Or print our template.',
            image: { src: '/images/pages/measuring/tool-pencil-paper.jpg', alt: '' },
          },
          {
            title: 'Your phone',
            description: 'For a photo of every wall.',
            image: { src: '/images/pages/measuring/tool-phone.jpg', alt: '' },
          },
          {
            title: 'A level (optional)',
            description: 'Floors and ceilings are rarely flat.',
            image: { src: '/images/pages/measuring/tool-level.jpg', alt: '' },
          },
        ]}
        columns={4}
        imageStyle="bleed"
        kicker="You'll need"
        tint
        title="Four things, one of them your phone"
      />
      <HomeSection id="steps" kicker="Step by step" title="Six steps, one wall at a time">
        <div className="grid items-start gap-8 @3xl:grid-cols-[7fr_3fr] @3xl:gap-10">
          <Image
            alt="A sketched kitchen with walls A and B labeled and the measuring points marked: wall lengths, cabinet widths, ceiling height, the window, outlets, the sink, the hood and the fridge depth and door swing"
            className="h-auto w-full rounded-3xl"
            height={1643}
            sizes="(min-width: 56rem) 66vw, 100vw"
            src="/images/pages/measuring/room-plan-annotated.jpg"
            width={2720}
          />
          <StepsAccordion steps={STEPS} />
        </div>
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
        imageStyle="plain"
        kicker="What happens next"
        tint
        title="From your numbers to cabinets on order"
      />
      <HomeSection>
        <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-16">
          <div>
            <h2 className={homeHeadingClassName}>Sizes worth knowing</h2>
            <div className="mt-6">
              <MinimalTable
                columns={['Cabinet', 'Depth', 'Height']}
                compact
                fit
                inline
                narrow
                rows={[
                  ['!Base cabinets', '24"', '34½" (36" with the countertop)'],
                  ['!Wall cabinets', '12"', '30", 36" or 42"'],
                  ['!Tall / pantry cabinets', '24"', '84", 90" or 96"'],
                  ['!Widths', '9" to 48"', 'In 3" steps'],
                ]}
                widths={['w-[30%]', 'w-[44%]']}
              />
            </div>
          </div>
          <div>
            <h2 className={homeHeadingClassName}>Space to leave</h2>
            <div className="mt-6">
              <MinimalTable
                columns={['Between', 'At least']}
                compact
                fit
                inline
                narrow
                rows={[
                  ['!Countertop and wall cabinets', '18"'],
                  ['!Cabinets and large appliances', '1–2"'],
                  ['!A walkway', '36"'],
                  ['!Island and counter, with two cooks', '42–48"'],
                ]}
                widths={['w-[40%]']}
              />
            </div>
          </div>
        </div>
      </HomeSection>
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
        numbered
        title="Five mistakes that cause reorders"
      />
      <FinePrint variant="plain">
        Turnaround times are typical, not guaranteed. Standard sizes may vary by collection; your
        project manager confirms every size before you order.
      </FinePrint>
      <ClosingBand
        description="Send your sketch, numbers and photos, and a project manager will turn them into a 3D design with an exact price. It's free, with no obligation to buy."
        primary={{ label: 'Send my measurements', href: FREE_DESIGN_HREF }}
        secondary={{ label: 'Price my kitchen', href: ESTIMATOR_HREF }}
        tint
        title="Measured? Send it to a project manager."
      />
    </>
  );
}
