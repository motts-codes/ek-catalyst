import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { TenByTenEstimator } from '@/vibes/soul/sections/ten-by-ten-estimator';
import { TEN_BY_TEN_CABINETS } from '~/lib/estimator/ten-by-ten';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Kitchen Estimator: your 10×10 price in four picks',
  description:
    'Pick a kitchen shape, a cabinet line, a door style and a color, and see the 10×10 price, the price per linear foot and a monthly payment. No email, no sales call.',
};

// The 10x10 estimator: a short intro on why kitchens are priced as a 10x10, the four picks, the
// price. Copy is the client's one-page explainer (Oct 2026); prices come from EK's workbook via
// scripts/build-ten-by-ten-prices.py.
export default async function PriceMyKitchen({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'My kitchen', href: '/mykitchen' },
          { label: 'Price my kitchen', href: '/mykitchen/price-my-kitchen' },
        ]}
      />
      <PageHero
        chipStyle="checks"
        chips={['Cabinets only', 'Four picks', 'No email, no sales call']}
        description="Every cabinet company quotes a 10×10: a standard set of cabinets covering two 10-foot walls, about 20 linear feet. Ours is 13 cabinets. Pick a shape, a line, a door style and a color, and you’ll see what that kitchen costs in the collection you like, plus the price per foot so you can rough out your own room."
        kicker="Kitchen estimator"
        textOnly
        title="See what your kitchen costs, as a 10×10"
      />

      <HomeSection tightTop>
        <TenByTenEstimator designHref={FREE_DESIGN_HREF} />
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
