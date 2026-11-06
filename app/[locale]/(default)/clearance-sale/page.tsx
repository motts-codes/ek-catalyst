import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Clearance: Floor-Model and Overstock Sets',
  description:
    'Floor-model and overstock kitchen and bath sets at deeply discounted prices. Limited stock, sold as is. Call to check availability.',
};

const SETS = [
  {
    title: '7FT Mocha Shaker Cabinet Set',
    image: {
      src: '/images/pages/clearance/set-mocha-shaker-7ft.jpg',
      alt: '7FT Mocha Shaker Cabinet Set',
    },
    description:
      'A warm 7-foot set in a rich mocha finish with classic shaker doors, a practical mix of wall and base cabinets. Countertops not included. Floor model · Bristol.',
  },
  {
    title: '10FT White Shaker Cabinet Set with Island',
    image: {
      src: '/images/pages/clearance/set-white-shaker-island-10ft.jpg',
      alt: '10FT White Shaker Cabinet Set with Island',
    },
    description:
      'A full 10-foot run of white shaker wall and base cabinets with a matching island, the layout most kitchens ask for, at a floor-model price. Soft-close throughout. Floor model · Bristol.',
  },
  {
    title: '8FT Gray Slab Cabinet Set',
    image: {
      src: '/images/pages/clearance/set-gray-slab-8ft.jpg',
      alt: '8FT Gray Slab Cabinet Set',
    },
    description:
      'Flat-front gray doors on a frameless box for a clean, modern run. Eight feet of wall and base cabinets with full-extension drawers. Overstock · Bristol.',
  },
  {
    title: '36 in. Espresso Bathroom Vanity Set with Top',
    image: {
      src: '/images/pages/clearance/vanity-espresso-36.jpg',
      alt: '36 in. Espresso Bathroom Vanity Set with Top',
    },
    description:
      'A 36-inch vanity in espresso with a white quartz top, undermount basin and matching side splash. One unit, ready to collect. Floor model · Bristol.',
  },
  {
    title: '9FT Painted White Shaker Set with Pantry',
    image: {
      src: '/images/pages/clearance/set-painted-white-pantry-9ft.jpg',
      alt: '9FT Painted White Shaker Set with Pantry',
    },
    description:
      'Nine feet of painted white shaker with a tall pantry at one end, from a showroom display and lightly handled. Floor model · Newington.',
  },
  {
    title: '7FT Natural Oak Slab Cabinet Set',
    image: {
      src: '/images/pages/clearance/set-natural-oak-slab-7ft.jpg',
      alt: '7FT Natural Oak Slab Cabinet Set',
    },
    description:
      'A textured oak-look slab set, seven feet, with a lazy Susan corner base. Overstock from a multifamily order, new in box. Overstock · Bristol.',
  },
];

export default async function Clearance({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Cabinets', href: '/cabinets' },
          { label: 'Clearance', href: '/clearance-sale' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Call 860-247-1000', href: 'tel:+18602471000', primary: true },
          {
            label: 'Visit the factory outlet ↗',
            href: 'https://expresskitchensfactoryoutlet.com/',
          },
        ]}
        description="Floor-model and overstock kitchen and bath sets at deeply discounted prices, most of them at the Bristol factory outlet. Each one is a single set, sold as is with no returns or refunds, so the only way to be sure it's still there is to call. If it is, you'll have a whole kitchen for a fraction of the price."
        image={{
          src: '/images/pages/clearance/outlet-floor-sets.jpg',
          alt: 'Floor-model kitchen sets on the outlet floor',
        }}
        imageLabel="Floor-model kitchen sets at the Bristol outlet"
        kicker="Clearance"
        title="Floor-model and overstock sets"
      />
      <CardsRow
        cards={SETS.map((s) => ({
          ...s,
          ctaLabel: 'Call to check price',
          href: 'tel:+18602471000',
          imageLabel: s.title,
        }))}
        columns={3}
        description="Sold as is · no returns or refunds · collect from the outlet."
        tint
        title="Sets available now"
      />
      <Prose
        body={[
          "Floor-model sets have been on a showroom floor, so expect light handling and the occasional mark; overstock sets are new in the box, usually left over from a larger order. Either way the price reflects it, and the construction is the same all-plywood box as a full-price kitchen. They're sold as is, with no returns or refunds, and countertops aren't included unless the listing says so.",
        ]}
        kicker="What clearance means"
        title="Good to know before you call"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about clearance',
          items: [
            {
              q: 'Can I buy a clearance set online?',
              a: "No. Each set is one of a kind and sold in person, so call 860-247-1000 to check it's still available and agree the price.",
            },
            {
              q: 'Do you deliver clearance sets?',
              a: 'Clearance sets are collected from the outlet. Ask when you call if delivery is possible for your set.',
            },
            {
              q: 'Is there a warranty?',
              a: 'Clearance sets are sold as is, with no returns or refunds.',
            },
          ],
        }}
      />
      <ClosingBand
        primary={{ label: 'Call 860-247-1000', href: 'tel:+18602471000' }}
        showrooms={SHOWROOMS}
        tint
        title="Seen a set you like?"
      />
    </>
  );
}
