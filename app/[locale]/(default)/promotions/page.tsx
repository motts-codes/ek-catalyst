import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export const metadata: Metadata = {
  title: 'Current Offers and Promotions',
  description:
    'Free appliance credit, up to $500 toward your countertop, our price match and free door samples. Until November 30, 2026.',
};

const ENDS = 'Until November 30, 2026';

// The five offers running until Nov 30, 2026, each as EK's banner linking to its offer page.
// The banner text is pixels, so each one carries a real text link beneath it.
const OFFERS = [
  {
    label: 'Up to $1,100 in appliance credit with your kitchen',
    href: '/offers-free-appliance',
    src: '/images/offers/banners/free-appliance.webp',
    width: 2078,
    height: 757,
    alt: 'Free appliance with every kitchen. Appliance credit of $500 on kitchens of $3,000 or more, $700 on $5,000 or more, $900 on $7,500 or more, and $1,100 on $9,000 or more. Plus up to 4 bonus gifts: roll-out trays, cabinet organizers, designer handles and a pull-down faucet. Brands include Frigidaire, GE Appliances, Whirlpool, Samsung, Haier, LG, JennAir and Miele. Now through November 30, 2026.',
  },
  {
    label: 'Up to $500 toward your countertop with Star Cabinets',
    href: '/offers-countertop',
    src: '/images/offers/banners/countertop-credit.webp',
    width: 2079,
    height: 756,
    alt: 'Get up to $500 toward your countertop with every Star Cabinets purchase. Available on purchases of $3,000 or more, and in full on purchases of $5,000 or more. Offer valid until November 30, 2026.',
  },
  {
    label: 'Granite from $49.99, quartz from $59.99 a sq ft',
    href: '/offers-countertop-pricing',
    src: '/images/offers/banners/countertop-pricing.webp',
    width: 2080,
    height: 756,
    alt: 'Start with $3,000 in cabinets, then explore granite and quartz options. Granite from $49.99 per square foot: Everest Mist, Gray Atlantico, Valle Nevado. Quartz from $59.99 per square foot: Aruca White, Blanca Arabescato, Calacatta Arno, Calacatta Botanica, Calacatta Sierra, Calacatta Trevi, Carrara Mist, Macabo Gray, New Carrara Marmi. Offer valid until November 30, 2026.',
  },
  {
    label: 'Beat any quote, or a $500 credit, in our showrooms',
    href: '/price-match-guarantee',
    src: '/images/offers/banners/price-match.webp',
    width: 2079,
    height: 756,
    alt: "We'll beat any quote, or give you a $500 credit. Free hinges, free glides. Bring any competitor quote of $3,000 or more to Express Kitchens and get plywood cabinets, soft-close hinges and full-extension glides at no extra charge before we match it. Offer valid until November 30, 2026.",
  },
  {
    label: 'First 2 door samples free with code FREESAMPLES',
    href: '/offers-freesamples',
    src: '/images/offers/banners/free-samples.webp',
    width: 2079,
    height: 756,
    alt: 'Quality you can hold before you choose. Feel the quality before you buy. First 2 samples free with code FREESAMPLES. Offer valid until November 30, 2026.',
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
      <HomeSection halfPadding>
        <ul className="space-y-10 @xl:space-y-14">
          {OFFERS.map((offer, index) => (
            <li key={offer.href}>
              {/* One link per offer: the banner and the line beneath it go to the same page. */}
              <Link
                className="group block focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                href={offer.href}
              >
                <span className="block overflow-hidden rounded-3xl">
                  <Image
                    alt={offer.alt}
                    className="h-auto w-full transition-transform duration-700 ease-smooth group-hover:scale-[1.01]"
                    height={offer.height}
                    preload={index === 0}
                    sizes="(min-width: 96rem) 1536px, 100vw"
                    src={offer.src}
                    width={offer.width}
                  />
                </span>
                <span className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm @xl:text-base">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--button-primary-background,#d90716)]">
                    {offer.label}
                    <ArrowRight
                      aria-hidden
                      className="transition-transform group-hover:translate-x-1"
                      size={16}
                      strokeWidth={2.5}
                    />
                  </span>
                  <span className="text-contrast-500">{ENDS}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </HomeSection>
    </>
  );
}
