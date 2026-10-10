import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ShopLanding } from '@/vibes/soul/sections/shop-landing';
import { getCategoryContent } from '~/lib/category/category-content';
import { FREE_DESIGN_HREF, SAMPLES_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Cabinet Hardware',
  description:
    'Handles and knobs, backsplash tiles and the drawer organizers that make a kitchen work. Stocked in Bristol; ships next business day or pick up free.',
};

export default async function CabinetHardware({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <ShopLanding
      actions={[{ label: 'Order free samples', href: SAMPLES_HREF }]}
      breadcrumbs={[
        { label: 'Kitchen', href: '/cabinets' },
        { label: 'Cabinet hardware', href: '/cabinet-hardware' },
      ]}
      closing={{
        primary: { label: 'Free design consult', href: FREE_DESIGN_HREF },
        showrooms: SHOWROOMS,
      }}
      content={getCategoryContent('/cabinet-hardware')}
      note={{
        kicker: 'Not sure which finish?',
        title: 'Hold a handle against the door first',
        body: 'Your first two quarter-door samples are free with the code FREESAMPLES. Put a handle on one and the choice usually makes itself.',
      }}
      title="Cabinet hardware"
    />
  );
}
