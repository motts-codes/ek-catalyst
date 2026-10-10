import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { ReviewGrid } from '@/vibes/soul/sections/page-kit/media';
import { ASSEMBLED_LISTING_HREF } from '~/lib/cabinets/cabinets-hub-content';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { getLowest10x10 } from '~/lib/pages/lowest-price';

export const metadata: Metadata = {
  title: 'How We Compare to Big-Box and Online Cabinet Sellers',
  description:
    'The 10×10 price, the finishes, whether you can get it assembled, how long it takes and who actually makes it. Express Kitchens next to big-box stores, online-only sellers and custom shops, line by line.',
};

// Competitor cells are "[X]" until the business supplies figures it is comfortable publishing.
// Nothing here should be a guess about someone else's price.
const COLUMNS = ['', 'Express Kitchens', 'Big-box stores', 'Online-only sellers', 'Custom shops'];

const rows = (lowest: { assembled: string | null; rta: string | null; collections: number }) => [
  [
    '!10×10 price',
    `from ${lowest.rta ?? '$[X]'} RTA · ${lowest.assembled ?? '$[X]'} assembled`,
    '$[X]',
    '$[X]',
    '$[X]',
  ],
  [
    '!Door styles',
    `${lowest.collections > 0 ? `${lowest.collections}+` : '30+'} collections`,
    '[X]',
    '[X]',
    'Unlimited, at a price',
  ],
  ['!Assembled available', 'Yes, in 3 weeks', '[?]', '[?]', 'Yes, by definition'],
  ['!Delivery time', 'RTA 2 weeks · assembled 3 weeks', '[X]', '[X]', '[X]'],
  ['!Showrooms', `${SHOWROOMS.length} in Connecticut`, 'Aisle displays', 'None', 'Usually one'],
  [
    '!Who manufactures',
    'We do, in Bristol (Star Cabinetry)',
    'Third party',
    'Third party',
    'They do',
  ],
  [
    '!Installation',
    'Not included; we point you to installers',
    'Sold separately',
    'Not offered',
    'Often included',
  ],
];

const QUOTES = [
  {
    quote:
      '[Big-box first: a review from someone who priced a big-box store before us, in their own words.]',
    name: '[Name]',
    location: '[Town], CT',
    stars: 5,
  },
  {
    quote:
      '[Online-only first: a review from someone who compared an online seller, in their own words.]',
    name: '[Name]',
    location: '[Town], CT',
    stars: 5,
  },
  {
    quote:
      '[Custom quote first: a review from someone who priced a custom shop before us, in their own words.]',
    name: '[Name]',
    location: '[Town], CT',
    stars: 5,
  },
];

export default async function Compare({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const lowest = await getLowest10x10();

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Compare', href: '/compare-cabinet-companies' }]} />
      <PageHero
        actions={[
          { label: 'Shop cabinets', href: ASSEMBLED_LISTING_HREF, primary: true },
          { label: 'Free design consult', href: FREE_DESIGN_HREF },
        ]}
        description="You're probably pricing a kitchen in three or four places at once, and the hard part is that nobody quotes it the same way. So here is the comparison on one basis: the industry-standard 10×10 kitchen, the number of finishes, whether you can get it assembled, how long it takes and who actually makes the cabinet. Where we don't know another seller's figure we say so rather than guess."
        kicker="Compare"
        textOnly
        title="How we compare to big-box, line by line"
      />
      <DeliveryLadder
        columns={COLUMNS}
        footnote="Our prices are live from the collection pages. Competitor figures are left blank until we can publish them with a source; we'd rather show a gap than a guess."
        kicker="Side by side"
        rows={rows(lowest)}
        tint
        title="The same seven questions, asked of everyone"
      />
      <Prose
        body={[
          "Big-box stores sell cabinets made by someone else, usually to order, with lead times set by that supplier. The in-store displays are good for getting a feel for a door style, and the prices on the entry lines are hard to beat on paper. Where it tends to go wrong is after the order: a damaged box means waiting on a third party, and the person who designed your kitchen isn't the person who built it.",
          "Online-only sellers are often the cheapest ready-to-assemble option you'll find, and for a confident builder with a simple layout they can be a perfectly good choice. You won't be able to see or hold the cabinet first, assembled is rarely an option, and support is a ticket rather than a person.",
          'Custom shops make beautiful work and will build to any size. You pay for that, both in money and in time, and a true custom kitchen is usually a different budget conversation entirely.',
          "Our position is the one in between: we design and build the cabinet ourselves in Bristol, stock it there, show it in six Connecticut showrooms and sell it priced openly, ready-to-assemble or factory-assembled. If you want it faster or cheaper than that, we'd rather tell you who to call.",
        ]}
        kicker="By seller type"
        title="The honest version of each"
      />
      <ReviewGrid reviews={QUOTES} tint title="What people who compared first said" />
      <HomeSection compact title="Ready to decide?">
        <p className="max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
          Browse the collections with their 10×10 prices, or let a designer price your actual room
          both ways for free. Either way you keep the number.
        </p>
      </HomeSection>
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        secondary={{ label: 'Shop cabinets', href: ASSEMBLED_LISTING_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
