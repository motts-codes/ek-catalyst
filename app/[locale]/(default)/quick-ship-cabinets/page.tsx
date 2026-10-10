import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetLineCard } from '@/vibes/soul/sections/cabinet-lines';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Quick-Ship Cabinets',
  description:
    'In a hurry? Everything here ships in two weeks or less, straight from stock in Bristol.',
};

export default async function QuickShip({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const lines = await getCabinetLines('rta');

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Cabinets', href: '/cabinets' },
          { label: 'Quick-ship', href: '/quick-ship-cabinets' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Shop quick-ship collections', href: '#collections', primary: true },
          { label: 'Shipping & pickup', href: '/shipping-policy' },
        ]}
        description="If your kitchen can't wait, start here. Everything on this page is stocked in Bristol and ships in two weeks or less: the quick-ship collections and all the ready-to-assemble lines. Order by [time] and it goes on the next run."
        imageLabel="Cabinets wrapped on a pallet, ready to ship"
        kicker="Quick-ship"
        title="In a hurry? Everything here ships in 2 weeks or less"
      />
      <HomeSection id="collections" tint title="Ships in two weeks or less">
        {lines.length === 0 ? (
          <p className="text-contrast-500">
            Quick-ship collections will appear here as they are flagged in the store.
          </p>
        ) : (
          <div className="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
            {lines.map((line) => (
              <CabinetLineCard key={line.entityId} line={line} />
            ))}
          </div>
        )}
      </HomeSection>
      <Prose
        actions={[{ label: 'Shipping & pickup', href: '/shipping-policy' }]}
        body={[
          'Quick-ship collections are stocked in Bristol rather than built to order. Order by [time] and your cabinets go on the next run; RTA ships in about two weeks, and you can collect from the outlet sooner. The shipping page has the detail on delivery day and pickup.',
        ]}
        kicker="How quick-ship works"
        title="Stocked, not built to order"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
