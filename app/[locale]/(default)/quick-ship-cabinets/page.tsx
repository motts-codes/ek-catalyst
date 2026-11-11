import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetLineCard } from '@/vibes/soul/sections/cabinet-lines';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero, Prose, StepsRow } from '@/vibes/soul/sections/page-kit';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Ships Next Day',
  description:
    'Fully assembled, all-plywood cabinets in stock and shipped the next business day: Avon, Madison, Birmingham, Cambridge, Derry and Eden, plus handles, faucets, sinks, bath and accessories.',
  // Hidden at the client's request (27 Oct 2026): out of the nav, footer and sitemap, not indexed.
  robots: { index: false },
};

// The six collections EK ships next day (expresskitchens.com/ships-next-day): assembled only.
// Matched by collection slug on the Catalyst tree. Eden and Madison exist as Euro Max and Euro
// Value; the live page doesn't say which, so the Euro Max pair is listed (the all-plywood line).
const NEXT_DAY_SLUGS = [
  'avon',
  'euro-max-madison',
  'birmingham',
  'cambridge',
  'derry-stratus',
  'euro-max-eden',
];

// Everything else on the live page's next-day grid, in our catalog.
const NEXT_DAY_MORE = [
  {
    title: 'Handles',
    description: 'Pulls and knobs to finish the doors, in stock.',
    ctaLabel: 'Shop handles',
    href: '/cabinet-hardware',
    image: {
      src: '/images/home/categories/handles.webp',
      alt: 'A drawer cabinet with brass pulls against white tile',
    },
  },
  {
    title: 'Sinks and faucets',
    description: 'Kitchen sinks and pull-down faucets, ready to ship.',
    ctaLabel: 'Shop sinks and faucets',
    href: '/sinks-faucets',
    image: {
      src: '/images/home/categories/kitchen-sink.webp',
      alt: 'A farmhouse sink with a brass faucet',
    },
  },
  {
    title: 'Bath',
    description: 'Vanities and bath cabinets from stock.',
    ctaLabel: 'Shop bath',
    href: '/bath',
    image: {
      src: '/images/home/categories/bath-faucet-sink.webp',
      alt: 'An oak vanity with a white top, black faucet and round mirror',
    },
  },
  {
    title: 'Accessories',
    description: 'Roll-out trays, organizers, fillers and panels.',
    ctaLabel: 'Shop accessories',
    href: '/cabinet-hardware/accessories',
    image: { src: '/images/nav/accessories.webp', alt: 'Drawer organizer' },
  },
];

export default async function QuickShip({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const assembled = await getCabinetLines('assembled');
  // The cards normally show the collection's built-to-order lead time; here the stock ships next day.
  const lines = NEXT_DAY_SLUGS.map((slug) =>
    assembled.find((line) => line.href.split('?')[0]?.replace(/\/$/, '').endsWith(`/${slug}`)),
  )
    .filter((line): line is NonNullable<typeof line> => line != null)
    .map((line) => ({ ...line, deliveryTime: 'Next day' }));

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Cabinets', href: '/cabinets' },
          { label: 'Ships next day', href: '/quick-ship-cabinets' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Shop next-day collections', href: '#collections', primary: true },
          { label: 'Shipping & pickup', href: '/shipping-policy', style: 'outline' },
        ]}
        description="When a kitchen can’t wait, start here. Six collections, fully assembled and in stock in Bristol, ship the next business day. Dovetail drawers, KCMA certified, thousands of units ready to go."
        image={{
          src: '/images/pages/quick-ship/hero-cart-cabinets.jpg',
          alt: 'A smiling woman in a red top pushing a cart stacked with three shrink-wrapped white shaker cabinets, strapped with a red ratchet strap',
        }}
        imageStyle="plain"
        kicker="Ships next day"
        title="Order today. Ships tomorrow."
      />
      <CategoryPoints
        fine="Ships the next business day on confirmed orders of in-stock items. Allow 7–10 days for transit, or pick up in Bristol."
        points={[
          { icon: 'stock', label: 'Fully assembled, in stock' },
          { icon: 'plywood', label: 'All-plywood boxes, KCMA approved' },
          { icon: 'zap', label: 'Ships the next business day' },
          { icon: 'price', label: '60+ colors, 80+ SKUs' },
        ]}
      />
      <HomeSection
        description="Six assembled collections we keep on the shelf. Other collections ship in 2 to 8 weeks."
        id="collections"
        kicker="Cabinets"
        tint
        title="Collections that ship next day"
      >
        {lines.length === 0 ? (
          <p className="text-contrast-500">
            Next-day collections will appear here as they are added to the store.
          </p>
        ) : (
          <div className="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
            {lines.map((line) => (
              <CabinetLineCard key={line.entityId} line={line} />
            ))}
          </div>
        )}
      </HomeSection>
      <CardsRow
        cards={NEXT_DAY_MORE}
        columns={4}
        ctaStyle="link"
        description="Finish the job from the same stock. These ship next day too."
        imageStyle="plain"
        kicker="Also next day"
        title="Handles, sinks, faucets, bath and accessories"
      />
      <StepsRow
        className="bg-[#fdf3f5]"
        kicker="How it works"
        steps={[
          {
            title: 'Order online',
            description:
              'Pick from the collections above, plus any handles, sinks, faucets, bath pieces or accessories you need, and check out.',
          },
          {
            title: 'We ship the next day',
            description: 'Once your order is confirmed, it ships the next business day.',
          },
          {
            title: 'On its way in 7–10 days',
            description:
              'Cabinets go out wrapped on a pallet and are delivered to the ground floor, usually within 7–10 days. In Connecticut? Pick up from Bristol instead.',
          },
        ]}
        title="Three steps, less waiting"
      />
      <Prose
        actions={[
          { label: 'Shipping & pickup', href: '/shipping-policy', primary: true },
          { label: 'Talk to a designer', href: FREE_DESIGN_HREF, style: 'outline' },
        ]}
        body={[
          "Running behind on a renovation? Whether you're a hands-on homeowner or a contractor with a crew to keep busy, this is the stock we keep for jobs that can’t wait. Remodeling the kitchen, upgrading the bath or adding the finishing touches, the cabinets are already packed and ready, so your project stays on track.",
          'You shouldn’t have to choose between speed and quality. These are the same cabinets as the rest of the range, just kept on the shelf.',
        ]}
        kicker="Built for speed, made to last"
        title="Perfect for last-minute projects"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
