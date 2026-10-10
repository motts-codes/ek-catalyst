import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ShopLanding } from '@/vibes/soul/sections/shop-landing';
import { getCategoryContent } from '~/lib/category/category-content';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

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
      content={getCategoryContent('/sinks-faucets')}
      note={{
        kicker: 'Buying cabinets too?',
        title: 'Add the sink to the design and it arrives with the kitchen',
        body: 'Tell your designer which sink you like and it goes on the same quote and the same truck as the cabinets, sized to the base it sits in.',
      }}
      title="Kitchen sinks & faucets"
    />
  );
}
