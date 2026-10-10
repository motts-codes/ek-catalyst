import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import {
  CategoryHero,
  CategoryPoints,
  SubcategoryTiles,
} from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Sale',
  description:
    'Everything with a sale price on it right now: cabinets, closets, appliances, windows and accessories.',
};

export default async function Sale({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Sale', href: '/sale' }]} />
      <CategoryHero
        actions={[{ label: 'Current offers', href: '/promotions' }]}
        description="Everything with a sale price on it right now, across cabinets, closets, appliances, windows and accessories, with the same warranty as full price and free shipping over $2,500. Sale prices last while stock does, so if something here is the one, don't sit on it."
        imageLabel="A kitchen with sale-tagged cabinets"
        title="Sale"
      />
      <CategoryPoints
        fine="*Free shipping on orders over $2,500. Conditions apply."
        points={[
          { icon: 'tag', label: 'Sale prices while stock lasts' },
          { icon: 'truck', label: 'Free & fast shipping' },
          { icon: 'returns', label: 'Same warranty as full price' },
        ]}
      />
      <SubcategoryTiles
        items={[
          { name: 'Cabinets', href: '/cabinets/assembled-cabinets' },
          { name: 'Closets', href: '/closets' },
          { name: 'Appliances', href: '/appliances' },
          { name: 'Windows', href: '/windows' },
          { name: 'Accessories', href: '#' },
        ]}
        title="Shop sale by category"
      />
      <SubcategoryTiles
        items={[
          { name: '10% off', href: '#' },
          { name: '20% off', href: '#' },
          { name: '30% off and more', href: '#' },
          { name: 'Clearance sets', href: '/clearance-sale' },
        ]}
        title="Shop by discount"
      />
      <ClosingBand
        description="Sale products will list here once the sale category is set up in the store; until then the collections and categories above show their current prices."
        primary={{ label: 'Clearance sets', href: '/clearance-sale' }}
        secondary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Looking for the deepest discounts?"
      />
    </>
  );
}
