import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ShopLanding } from '@/vibes/soul/sections/shop-landing';
import { FREE_DESIGN_HREF, SAMPLES_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { searchHref, tileImage } from '~/lib/pages/shop-landing';

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
      description="The small things that change how a kitchen feels: handles and knobs in the finishes that go with our doors, backsplash tiles to carry the color up the wall, and the organizers that make a drawer earn its keep. Everything is stocked in Bristol and ships next business day, or you can collect it free. Handles are included with our Premium cabinets; here is where you choose them."
      imageLabel="Brass handles on a navy shaker door, with a marble backsplash behind"
      note={{
        kicker: 'Not sure which finish?',
        title: 'Hold a handle against the door first',
        body: 'Your first two quarter-door samples are free with the code FREESAMPLES. Put a handle on one and the choice usually makes itself.',
      }}
      points={[
        { icon: 'stock', label: 'Stocked in Bristol' },
        { icon: 'zap', label: 'Ships next business day' },
        { icon: 'pickup', label: 'Free pickup, any order' },
      ]}
      pointsFine="Lead times to be confirmed."
      tiles={[
        {
          name: 'Handles & knobs',
          href: searchHref('cabinet handle'),
          image: tileImage('handles', 'Cabinet door with a handle'),
        },
        { name: 'Tiles', href: searchHref('tile'), image: tileImage('tiles', 'Backsplash tiles') },
        {
          name: 'Accessories',
          href: searchHref('drawer organizer'),
          image: tileImage('accessories', 'Drawer organizer'),
        },
      ]}
      tilesTitle="Shop by type"
      title="Cabinet hardware"
    />
  );
}
