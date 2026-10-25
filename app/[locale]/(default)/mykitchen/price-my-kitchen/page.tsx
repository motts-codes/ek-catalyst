import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { TermTip } from '@/vibes/soul/primitives/term-tip';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { TenByTenEstimator } from '@/vibes/soul/sections/ten-by-ten-estimator';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { doorsFor, TEN_BY_TEN_CABINETS } from '~/lib/estimator/ten-by-ten';
import { buildEstimatorVisuals } from '~/lib/estimator/ten-by-ten-visuals';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Kitchen Estimator: what would your kitchen cost?',
  description:
    'Pick a kitchen shape, a cabinet line, a door style and a color, and see the 10×10 price, the price per linear foot and a monthly payment. No email, no sales call.',
};

// The 10x10 estimator: a short intro on why kitchens are priced as a 10x10, the four picks, the
// price. Copy is the client's one-page explainer (Oct 2026); prices come from EK's workbook via
// scripts/build-ten-by-ten-prices.py.
export default async function PriceMyKitchen({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  // The pictures the picks are made with: a kitchen per line, a door sample per door style and
  // a swatch per color, from the live cabinet collections (assembled + RTA).
  const visuals = Streamable.from(async () => {
    const [assembled, rta] = await Promise.all([
      getCabinetLines('assembled'),
      getCabinetLines('rta'),
    ]);
    const seen = new Set(assembled.map((l) => l.entityId));
    const collections = [...assembled, ...rta.filter((l) => !seen.has(l.entityId))];

    return buildEstimatorVisuals(collections, {
      star: doorsFor('star'),
      prism: doorsFor('prism'),
      euro: doorsFor('euro'),
    });
  });

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'My kitchen', href: '/mykitchen' },
          { label: 'Price my kitchen', href: '/mykitchen/price-my-kitchen' },
        ]}
      />
      <PageHero
        description={
          <>
            Pick a shape, a cabinet line, a door style and a color, and see the price of a{' '}
            <TermTip term="10×10 kitchen">
              A 10×10 is the sample kitchen every cabinet company uses to compare prices: two
              10-foot walls in an L shape, cabinets only. Ours has 13 cabinets. Countertops,
              appliances and installation aren’t included.
            </TermTip>{' '}
            in that style straight away.
          </>
        }
        image={{
          src: '/images/estimator/hero-kitchen.jpg',
          alt: 'A bright white kitchen with shaker cabinets, a farmhouse sink and a wooden range hood',
        }}
        kicker="Kitchen estimator"
        note="This isn’t a quote. It’s a ballpark, with a price per foot so you can rough out your own room. For a price on your exact layout, a designer can quote it for free."
        spacing="roomy"
        title="What would your kitchen cost? Find out in 4 steps."
      />

      <HomeSection className="bg-[#fdf3f5] bg-[url('/images/estimator/noise.svg')] bg-repeat">
        <Stream fallback={<EstimatorSkeleton />} value={visuals}>
          {(v) => <TenByTenEstimator designHref={FREE_DESIGN_HREF} visuals={v} />}
        </Stream>
      </HomeSection>

      <HomeSection
        description="A 10×10 kitchen is not a room that measures ten by ten. It’s the industry yardstick: the same set of cabinets, priced in every door style, so you can compare lines and brands on equal terms."
        kicker="Why a 10×10"
        tint
        title="Why we price kitchens as a 10×10"
      >
        <div className="grid gap-8 @3xl:grid-cols-3">
          <div className="rounded-3xl border border-contrast-100 bg-white p-6">
            <h3 className="font-heading text-lg font-bold">It shows what the style costs</h3>
            <p className="mt-2 text-sm leading-relaxed text-contrast-500">
              Every door style is priced on the identical cabinet set, so the only thing that
              changes is the door and the construction. You can see which line fits your budget
              before anyone measures your home.
            </p>
          </div>
          <div className="rounded-3xl border border-contrast-100 bg-white p-6">
            <h3 className="font-heading text-lg font-bold">It scales with your kitchen</h3>
            <p className="mt-2 text-sm leading-relaxed text-contrast-500">
              Cabinet cost tracks linear footage. A kitchen with about twice the cabinet run lands
              near twice the 10×10 price, and a smaller run comes in under it. That’s why we show
              the price per linear foot too.
            </p>
          </div>
          <div className="rounded-3xl border border-contrast-100 bg-white p-6">
            <h3 className="font-heading text-lg font-bold">Shape doesn’t change the price</h3>
            <p className="mt-2 text-sm leading-relaxed text-contrast-500">
              L-shape, U-shape, galley or single wall, the estimator uses the same 10×10 cabinet
              mix. Your designer fine-tunes the exact cabinets for your layout at the free design
              appointment.
            </p>
          </div>
        </div>
        <div className="mt-8 rounded-3xl border border-[#fcb6bb] bg-white p-6 @xl:p-8">
          <h3 className="font-heading text-lg font-bold">What’s in our 10×10</h3>
          <ul className="mt-3 grid gap-x-10 gap-y-2 text-sm text-contrast-500 @xl:grid-cols-2">
            {TEN_BY_TEN_CABINETS.map((item) => (
              <li className="flex items-start gap-2.5" key={item}>
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--button-primary-background,#d90716)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </HomeSection>

      <ClosingBand
        description="A designer plans your real kitchen with you, in a showroom or on a video call, and prices it exactly. Free, with no obligation to buy."
        primary={{ label: 'Book a free design', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        title="Ready for the real number?"
      />
    </>
  );
}

// The wizard's first step, as grey boxes, while the collection photos load.
function EstimatorSkeleton() {
  return (
    <div aria-busy className="@container">
      <div className="mb-10 h-7 w-2/3 rounded-full bg-contrast-100" />
      <div className="h-4 w-24 rounded bg-contrast-100" />
      <div className="mt-3 h-8 w-80 max-w-full rounded bg-contrast-100" />
      <div className="mt-8 grid grid-cols-2 gap-4 @xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div className="aspect-[4/3] rounded-2xl bg-contrast-100" key={i} />
        ))}
      </div>
    </div>
  );
}
