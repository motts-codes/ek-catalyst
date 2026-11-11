import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { OfferStack, type OfferStackItem } from '@/vibes/soul/sections/offer-stack';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Current Offers and Promotions',
  description:
    'Free appliance credit, up to $500 toward your countertop, our price match and free door samples. Until November 30, 2026.',
};

const ENDS = 'Until November 30, 2026';
const BANNERS = '/images/offers/banners';

// The five offers running until Nov 30, 2026, each as EK's banner in a card that links to its
// offer page. The banner text is pixels, so the card says the offer in words as well.
const OFFERS: OfferStackItem[] = [
  {
    title: 'Free appliance with every kitchen',
    description:
      'An appliance credit of $500 to $1,100 with your kitchen, plus up to 4 bonus gifts: roll-out trays, organizers, designer handles and a pull-down faucet.',
    ends: ENDS,
    href: '/offers-free-appliance',
    banner: {
      src: `${BANNERS}/free-appliance.webp`,
      width: 2078,
      height: 757,
      alt: 'Free appliance with every kitchen. Appliance credit of $500 on kitchens of $3,000 or more, $700 on $5,000 or more, $900 on $7,500 or more, and $1,100 on $9,000 or more. Plus up to 4 bonus gifts: roll-out trays, cabinet organizers, designer handles and a pull-down faucet. Brands include Frigidaire, GE Appliances, Whirlpool, Samsung, Haier, LG, JennAir and Miele. Now through November 30, 2026.',
    },
  },
  {
    title: 'Up to $500 toward your countertop',
    description:
      'With Star Cabinets purchases of $3,000 or more, and the full $500 from $5,000. It comes off your countertop quote.',
    ends: ENDS,
    href: '/offers-countertop',
    banner: {
      src: `${BANNERS}/countertop-credit.webp`,
      width: 2079,
      height: 756,
      alt: 'Get up to $500 toward your countertop with every Star Cabinets purchase. Available on purchases of $3,000 or more, and in full on purchases of $5,000 or more. Offer valid until November 30, 2026.',
    },
  },
  {
    title: 'Granite from $49.99, quartz from $59.99 a sq ft',
    description:
      'Start with $3,000 in cabinets, then pick from three granites and nine quartz colors at these prices.',
    ends: ENDS,
    href: '/offers-countertop-pricing',
    banner: {
      src: `${BANNERS}/countertop-pricing.webp`,
      width: 2080,
      height: 756,
      alt: 'Start with $3,000 in cabinets, then explore granite and quartz options. Granite from $49.99 per square foot: Everest Mist, Gray Atlantico, Valle Nevado. Quartz from $59.99 per square foot: Aruca White, Blanca Arabescato, Calacatta Arno, Calacatta Botanica, Calacatta Sierra, Calacatta Trevi, Carrara Mist, Macabo Gray, New Carrara Marmi. Offer valid until November 30, 2026.',
    },
  },
  {
    title: "We'll beat any quote, or give you a $500 credit",
    description:
      'Bring a competitor quote of $3,000 or more to a showroom. We price the same kitchen with plywood boxes, soft-close hinges and full-extension glides, and beat it.',
    ends: ENDS,
    href: '/price-match-guarantee',
    banner: {
      src: `${BANNERS}/price-match.webp`,
      width: 2079,
      height: 756,
      alt: "We'll beat any quote, or give you a $500 credit. Free hinges, free glides. Bring any competitor quote of $3,000 or more to Express Kitchens and get plywood cabinets, soft-close hinges and full-extension glides at no extra charge before we match it. Offer valid until November 30, 2026.",
    },
  },
  {
    title: 'First 2 door samples free',
    description:
      'Hold the real door before you choose. Any collection, code FREESAMPLES at checkout, and the samples are yours to keep.',
    ends: ENDS,
    href: '/offers-freesamples',
    banner: {
      src: `${BANNERS}/free-samples.webp`,
      width: 2079,
      height: 756,
      alt: 'Quality you can hold before you choose. Feel the quality before you buy. First 2 samples free with code FREESAMPLES. Offer valid until November 30, 2026.',
    },
  },
];

export default async function Promotions({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Promotions', href: '/promotions' }]} />
      <PageHero
        description="Every offer below runs until November 30, 2026."
        kicker="Promotions"
        textOnly
        title="Current offers"
      />
      <OfferStack offers={OFFERS} />
    </>
  );
}
