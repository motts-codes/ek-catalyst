import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ShopLanding } from '@/vibes/soul/sections/shop-landing';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { searchHref, tileImage } from '~/lib/pages/shop-landing';

export const metadata: Metadata = {
  title: 'Kitchen Sinks & Faucets',
  description:
    'Kitchen sinks sized for our sink bases, faucets to match, and the strainers and accessories that go with them. Stocked in Bristol; ships in two days or pick up free.',
};

export default async function SinksFaucets({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <ShopLanding
      breadcrumbs={[
        { label: 'Kitchen', href: '/cabinets' },
        { label: 'Sinks & faucets', href: '/sinks-faucets' },
      ]}
      closing={{
        primary: { label: 'Free design consult', href: FREE_DESIGN_HREF },
        showrooms: SHOWROOMS,
      }}
      description="A sink that fits the base cabinet, a faucet that reaches the bowl, and the strainer, grid and soap dispenser that finish it off. Every sink here is sized to our sink bases, so if you're buying cabinets from us you won't be guessing at the cut-out. It all ships from Bristol in two days, or you can collect it free with your order."
      imageLabel="A stainless double-bowl sink with a pull-down faucet, in a white shaker kitchen"
      note={{
        kicker: 'Buying cabinets too?',
        title: 'Add the sink to the design and it arrives with the kitchen',
        body: 'Tell your designer which sink you like and it goes on the same quote and the same truck as the cabinets, sized to the base it sits in.',
      }}
      points={[
        { icon: 'stock', label: 'Stocked in Bristol' },
        { icon: 'truck', label: 'Ships in 2 days' },
        { icon: 'pickup', label: 'Free pickup, any order' },
      ]}
      pointsFine="Lead times to be confirmed."
      tiles={[
        {
          name: 'Kitchen sinks',
          href: searchHref('kitchen sink'),
          image: tileImage('kitchen-sinks', 'Kitchen sink'),
        },
        {
          name: 'Kitchen faucets',
          href: searchHref('kitchen faucet'),
          image: tileImage('kitchen-faucets', 'Kitchen faucet'),
        },
        {
          name: 'Accessories',
          href: searchHref('sink accessories'),
          image: tileImage('sink-faucet-accessories', 'Sink and faucet accessories'),
        },
      ]}
      tilesTitle="Shop by type"
      title="Kitchen sinks & faucets"
    />
  );
}
