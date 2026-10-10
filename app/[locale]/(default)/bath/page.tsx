import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ShopLanding } from '@/vibes/soul/sections/shop-landing';
import { getCategoryContent } from '~/lib/category/category-content';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

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
      content={getCategoryContent('/bath')}
      note={{
        kicker: 'Planning a whole bathroom?',
        title: 'A designer can put it all together for you',
        body: 'Vanity, top, sink, faucet and the mirror above it, drawn for your room and priced as one. The consult is free, and there’s no deposit and no obligation.',
      }}
      title="Bath"
    />
  );
}
