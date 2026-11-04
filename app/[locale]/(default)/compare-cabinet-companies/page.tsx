import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { Actions, PageBreadcrumbs, PageHero, RedBox } from '@/vibes/soul/sections/page-kit';
import { ReviewGrid } from '@/vibes/soul/sections/page-kit/media';
import { StepsAccordion } from '@/vibes/soul/sections/page-kit/steps-accordion';
import { StepsTimeline } from '@/vibes/soul/sections/page-kit/steps-timeline';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'How Express Kitchens Compares to Big-Box, Online and Custom Cabinet Sellers',
  description:
    'Who makes the cabinet, how long you wait, whether you can see it first, and price match. Express Kitchens side by side with big-box stores, online sellers and custom shops.',
};

// The comparison is on what is true of each type of seller (who makes it, whether it is in stock,
// whether you can see it first), never on competitors' prices: every EK cell can be backed up and
// the competitor cells describe the category, not a named company. The price match closes it.
const COLUMNS = ['', 'Express Kitchens', 'Big-box stores', 'Online-only sellers', 'Custom shops'];

const ROWS = [
  [
    '!Who makes the cabinet',
    'We do, in Bristol, CT',
    'Another manufacturer',
    'Another manufacturer',
    'They do',
  ],
  ['!Ready to ship', '50,000+ in stock', 'Mostly made to order', 'Varies', 'Made to order'],
  [
    '!Typical wait',
    'RTA ships in 2 weeks, assembled in 3',
    'Often several weeks',
    'Varies',
    '14 weeks is typical',
  ],
  [
    '!See it before you buy',
    '6 showrooms, plus door samples',
    'Aisle displays',
    'Samples only',
    'Usually one showroom',
  ],
  ['!RTA or assembled', 'Both, your choice', 'Usually assembled', 'Usually RTA', 'Assembled'],
  [
    '!Design help',
    'Free, in a showroom or on video',
    'Often free, in store',
    'Online tools, or paid',
    'Included in the price',
  ],
  ['!Price match', 'Yes, in our showrooms', 'Varies', 'Rarely', 'Rarely'],
];

const SELLERS = [
  {
    title: 'Big-box stores',
    image: {
      src: '/images/pages/compare/seller-big-box.jpg',
      alt: 'A big-box store aisle of boxed cabinets on orange racking',
    },
    description:
      "Great for seeing a door in person, and the entry prices look hard to beat. But the cabinets come from someone else, usually made to order, and if something arrives damaged you're waiting on a third party.",
  },
  {
    title: 'Online-only sellers',
    image: {
      src: '/images/pages/compare/seller-online.jpg',
      alt: 'A laptop showing a cabinet product page with an add to cart button',
    },
    description:
      "Often the cheapest ready-to-assemble option, and fine for a confident DIYer with a simple layout. But you can't see the cabinet first, assembled is rarely offered, and help comes through a ticket, not a person.",
  },
  {
    title: 'Custom shops',
    image: {
      src: '/images/pages/compare/seller-custom.jpg',
      alt: 'A cabinet box clamped on a bench in a small woodworking shop',
    },
    description:
      'Beautiful work, built to any size. You pay for it in money and in time, often 14 weeks or more.',
  },
  {
    title: 'Us',
    image: {
      src: '/images/pages/compare/seller-us.jpg',
      alt: 'An Express Kitchens showroom with a white island, red stools and wood kitchens behind',
    },
    description:
      'We sit in between. We make our own cabinets, keep them in stock, show them in six showrooms, and sell them ready to assemble or assembled. Custom-shop quality, with no custom-shop wait.',
  },
];

// Real Google reviews from the site's list, trimmed with an ellipsis where a line was cut.
const REVIEWS = [
  {
    stars: 5,
    quote:
      'No selling involved, just information for you to make your decision. For value I did shop 3 competitors and they were not close.',
    name: 'George M.',
    location: 'New London',
    source: 'Google',
  },
  {
    stars: 5,
    quote: 'Reasonable price. … Very knowledgeable and worked at our own pace. Great value!',
    name: 'Linda K.',
    location: 'New London',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'Dan in the Brookfield office is a saint. I completely changed my mind about the whole cabinet and countertop style two weeks after we put the plan together, and he just went with it.',
    name: 'Cathy D.',
    location: 'Brookfield',
    source: 'Google',
  },
];

export default async function Compare({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Compare', href: '/compare-cabinet-companies' }]} />
      <PageHero
        actions={[
          { label: 'See the comparison', href: '#compare', primary: true },
          { label: 'Free design consult', href: FREE_DESIGN_HREF, style: 'outline' },
        ]}
        description="Big-box stores, online sellers, custom shops and us. Here's what you get from each, so you can compare like for like."
        image={{
          src: '/images/pages/compare/hero-four-doors.jpg',
          alt: 'A Project Manager beside four shaker doors in white, cream, red and grey',
        }}
        imageStyle="plain"
        kicker="Compare"
        title="Pricing your kitchen in three places? Here's how we compare."
      />
      <HomeSection kicker="The short answer" title="Three things most cabinet sellers can't say">
        <StepsTimeline
          layout="row"
          steps={[
            {
              title: 'We make it',
              description:
                "Our cabinets are built in our own Bristol factory, so there's no middleman's markup in the price.",
            },
            {
              title: "It's already in stock",
              description:
                "50,000+ cabinets on the shelf, so you're not waiting the 14 weeks a custom kitchen often takes.",
            },
            {
              title: 'You can see it first',
              description:
                'Walk through full kitchens in six showrooms, or order a door sample before you buy.',
            },
          ]}
        />
      </HomeSection>
      <div id="compare" />
      <DeliveryLadder
        className="bg-[#fdf3f5]"
        columns={COLUMNS}
        footnote="Competitor columns describe each type of seller in general, not any one company. Our ship times are per collection; transit adds 7–10 days. The 14-week figure is the typical custom-cabinet lead time reported by US kitchen designers, 2025–26."
        kicker="Side by side"
        look="minimal"
        rows={ROWS}
        title="What you get, seller by seller"
      />
      <HomeSection kicker="By type of seller" title="The honest take on each">
        <StepsAccordion numbered={false} steps={SELLERS} />
      </HomeSection>
      <HomeSection compact>
        <RedBox
          kicker="Before you compare prices"
          media={{
            image: {
              src: '/images/cabinets/stained-wood-kitchen.jpg',
              alt: 'A kitchen in dark stained shaker cabinets with a granite island and pendant lights',
            },
            split: '60/40',
          }}
          title="A cheaper quote is often a different cabinet"
        >
          <p className="max-w-xl text-sm leading-relaxed text-white/85 @xl:text-base">
            Two quotes for &ldquo;the same kitchen&rdquo; can hide a particleboard box, hinges that
            slam, or fewer cabinets. Check the cabinet list, not just the total. And if a
            competitor&rsquo;s quote still comes in lower, bring it to a showroom: we&rsquo;ll beat
            it, or give you a $500 credit.
          </p>
          <Actions
            actions={[
              { label: 'How the price match works', href: '/price-match-guarantee', primary: true },
              { label: "What's in a 10×10", href: '/resources/ten-by-ten-kitchen' },
            ]}
            className="mt-6"
            onRed
          />
          <p className="mt-5 text-xs leading-relaxed text-white/85">
            Competitor quotes of $3,000+. In-store only. Until Nov 30, 2026.
          </p>
        </RedBox>
      </HomeSection>
      <ReviewGrid
        action={{ label: 'Read all reviews', href: '/reviews' }}
        reviews={REVIEWS}
        title="From people who shopped around"
      />
      <ClosingBand
        description="Bring it to a showroom and we'll show you, line by line, what you'd get with us."
        primary={{ label: 'Find a showroom', href: '/showrooms' }}
        secondary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        title="Got a quote from somewhere else?"
      />
    </>
  );
}
