import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetLineCard } from '@/vibes/soul/sections/cabinet-lines';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero, Prose, StepsRow } from '@/vibes/soul/sections/page-kit';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { CODE_PAGE_HERO_IMAGES } from '~/lib/category/category-content';
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
    href: '/cabinet-hardware',
    image: {
      src: '/images/pages/glossary/parts-flatlay.jpg',
      alt: 'Cabinet parts laid out on white: doors, crown molding, a soft-close hinge, a drawer slide, a pull and a knob',
    },
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
        description="When a kitchen can't wait, start here. These cabinets come fully assembled, built with all-plywood boxes and dovetail drawers, and KCMA approved, and they're sitting in stock in Bristol. Over 60 colors, more than 80 SKUs and thousands of units ready to go. Order today and start building tomorrow."
        image={CODE_PAGE_HERO_IMAGES.quickShip}
        imageLabel="Cabinets wrapped on a pallet, ready to ship"
        kicker="Ships next day"
        title="Order today. Start building tomorrow."
      />
      <CategoryPoints
        fine="Next-day shipping on in-stock items, confirmed orders. Delivery time depends on where you are; see the shipping page."
        points={[
          { icon: 'stock', label: 'Fully assembled, in stock' },
          { icon: 'plywood', label: 'All-plywood boxes, KCMA approved' },
          { icon: 'zap', label: 'Ships the next business day' },
          { icon: 'price', label: '60+ colors, 80+ SKUs' },
        ]}
      />
      <HomeSection
        description="Six assembled collections we keep on the shelf. Everything else is built to order."
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
            description:
              'Once your order is confirmed, we pack it and send it out the next business day, so nothing waits on a factory run.',
          },
          {
            title: 'Packed safe, tracked all the way',
            description:
              'Cabinets go out wrapped on a pallet, and you get updates as the delivery moves. The shipping page has delivery day and pickup details.',
          },
        ]}
        title="Three steps, no waiting"
      />
      <Prose
        actions={[
          { label: 'Shipping & pickup', href: '/shipping-policy', primary: true },
          { label: 'Talk to a designer', href: FREE_DESIGN_HREF, style: 'outline' },
        ]}
        body={[
          "Running behind on a renovation? Whether you're a hands-on homeowner or a contractor with a crew booked for Monday, this is the stock we built for last-minute jobs. Remodeling the kitchen, upgrading the bath or adding the finishing touches, the cabinets are already packed and ready, so your project stays on track.",
          'Great projects start with great timing. You shouldn’t have to choose between speed and the quality of the box, so these are the same all-plywood, dovetail-drawer cabinets as the rest of the range, just kept on the shelf.',
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
