import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import {
  CategoryHero,
  CategoryPoints,
  SubcategoryTiles,
} from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Interior Doors',
  description:
    'Interior doors in stock in Bristol: slab or prehung, hollow, solid or fire-rated core, primed and paint-ready. Standard sizes ready to collect or ship.',
};

export default async function Doors({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Building Materials', href: '#' },
          { label: 'Doors', href: '/doors' },
        ]}
      />
      <CategoryHero
        actions={[{ label: 'Shop interior doors', href: '#products' }]}
        description="Interior doors in stock in Bristol, so you can measure, order and have them in your hands without waiting weeks or making a second trip. Slab or prehung, hollow, solid or fire-rated core, all primed and ready to paint, in the standard sizes that fit most openings."
        imageLabel="A white shaker interior door in a hallway"
        title="Doors that fit, the first time"
      />
      <CategoryPoints
        fine="Stock, lead time and returns on doors to be confirmed."
        points={[
          { icon: 'truck', label: 'Ships in 2 days, or pick up from Bristol' },
          { icon: 'stock', label: 'Primed and paint-ready' },
          { icon: 'returns', label: 'Easy returns within [X] days, unopened' },
        ]}
      />
      <SubcategoryTiles
        items={[
          { name: 'Slab', href: '#products' },
          { name: 'Slab + jamb', href: '#products' },
          { name: 'Prehung', href: '#products' },
        ]}
        title="Interior doors"
      />
      <CardsRow
        cards={[
          {
            title: 'Hollow core',
            description: 'Light and affordable. The standard for bedrooms, closets and most rooms.',
            imageLabel: 'A hollow-core slab',
          },
          {
            title: 'Solid core',
            description:
              'Dense for sound control and a solid feel. Ideal for bedrooms, baths and offices.',
            imageLabel: 'A solid-core door',
          },
          {
            title: 'Fire-rated',
            description:
              'A 20-minute rated assembly for code-required openings, supplied primed and paint-ready.',
            imageLabel: 'A fire-rated door to a garage',
          },
        ]}
        description="Core is the decision that changes the price and the feel."
        kicker="Interior doors by core type"
        tint
        title="Three cores"
      />
      <SubcategoryTiles
        items={['1-panel', '2-panel', '3-panel', '5-panel', '6-panel'].map((name) => ({
          name,
          href: '#products',
        }))}
        title="By number of panels"
      />
      <SubcategoryTiles
        items={['18 × 80', '24 × 80', '28 × 80', '30 × 80', '32 × 80', '36 × 80'].map((name) => ({
          name: `${name} in.`,
          href: '#products',
        }))}
        title="Shop popular sizes"
      />
      <div id="products" />
      <ClosingBand
        description="Door products will appear here as the category is set up in the store. Until then, call 860-247-1000 to order."
        primary={{ label: 'Call 860-247-1000', href: 'tel:+18602471000' }}
        secondary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Order by phone for now"
      />
    </>
  );
}
