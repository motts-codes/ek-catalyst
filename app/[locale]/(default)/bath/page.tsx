import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ShopLanding } from '@/vibes/soul/sections/shop-landing';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { searchHref, tileImage } from '~/lib/pages/shop-landing';

export const metadata: Metadata = {
  title: 'Bath',
  description:
    'Vanity tops, side splashes, bathroom sinks, faucets and drains, stocked in Bristol and sized to go with our vanities. Ships in two days or pick up free.',
};

export default async function Bath({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <ShopLanding
      breadcrumbs={[{ label: 'Bath', href: '/bath' }]}
      closing={{
        primary: { label: 'Free design consult', href: FREE_DESIGN_HREF },
        showrooms: SHOWROOMS,
      }}
      description="Everything that goes on and around a vanity: tops in granite and quartz, matching side splashes, undermount and vessel sinks, faucets in the finishes people actually ask for, and the drains and accessories that finish the job. It's all stocked in Bristol and sized to go with our vanities, so it fits the first time."
      imageLabel="A bathroom vanity with a quartz top, undermount sink and brushed-nickel faucet"
      note={{
        kicker: 'Planning a whole bathroom?',
        title: 'A designer can put it all together for you',
        body: 'Vanity, top, sink, faucet and the mirror above it, drawn for your room and priced as one. The consult is free, and there’s no deposit and no obligation.',
      }}
      points={[
        { icon: 'stock', label: 'Stocked in Bristol' },
        { icon: 'truck', label: 'Ships in 2 days' },
        { icon: 'pickup', label: 'Free pickup, any order' },
      ]}
      pointsFine="Lead times to be confirmed."
      tiles={[
        {
          name: 'Vanity tops',
          href: searchHref('vanity top'),
          image: tileImage('vanity-tops', 'Bathroom vanity top'),
        },
        {
          name: 'Side splashes',
          href: searchHref('side splash'),
          image: tileImage('side-splashes', 'Vanity side splash'),
        },
        {
          name: 'Bathroom sinks',
          href: searchHref('bathroom sink'),
          image: tileImage('bathroom-sinks', 'Bathroom sink'),
        },
        {
          name: 'Bathroom faucets',
          href: searchHref('bathroom faucet'),
          image: tileImage('bathroom-faucets', 'Bathroom faucet'),
        },
        {
          name: 'Drains & accessories',
          href: searchHref('drain'),
          image: tileImage('drains-accessories', 'Drain and accessories'),
        },
      ]}
      tilesTitle="Shop by type"
      title="Bath"
    />
  );
}
