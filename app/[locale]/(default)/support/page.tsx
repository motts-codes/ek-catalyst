import { ClipboardList, PackageX, Store } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ShowroomBand } from '@/vibes/soul/sections/showroom-band';
import { SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Call or text 860-247-1000 any time. Order status and changes, Bristol pickups, delivery damage, and the policies that answer most questions.',
};

// Hero, order help, the six policy cards, showroom band. No form here: "Send a message" goes
// to /contact, the one form on the site (it already asks for an order number). The phones are
// answered 24/7; reply times are stated on the contact page only.
export default async function Support({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Support', href: '/support' }]} />
      <PageHero
        actions={[
          { label: 'Call or text 860-247-1000', href: 'tel:+18602471000', primary: true },
          { label: 'Send a message', href: '/contact', style: 'outline' },
        ]}
        description="Checking on an order, arranging a pickup or not sure who to ask? Call or text us any time on 860-247-1000. Most questions are answered on the pages below."
        image={{
          src: '/images/pages/support/hero-chat-phone-door-v3.jpg',
          alt: 'A red speech bubble with three dots in front of a white phone and a small white cabinet door',
        }}
        imageStyle="plain"
        kicker="Support"
        title="How can we help?"
      />

      {/* 2 · Help with an order. Damage wording follows EK's Oct 27 answer. */}
      <CardsRow
        cardTone="red"
        cards={[
          {
            icon: ClipboardList,
            title: 'Status and changes',
            description:
              'Call or text 860-247-1000 with your order number. To change an order, call within 72 hours of placing it. After that, changes may not be possible, or may cost extra.',
          },
          {
            icon: Store,
            title: 'Pickup from Bristol',
            description:
              'Call ahead to arrange a time. Pickups are from 18 Main Street, Bristol, CT 06010.',
          },
          {
            icon: PackageX,
            title: 'Damaged in delivery',
            description:
              'Note the damage on the delivery receipt and file a claim with the carrier, then call us. There’s no restocking fee on items damaged in transit.',
          },
        ]}
        columns={3}
        hideImages
        kicker="Order help"
        title="Already ordered?"
      />

      {/* 3 · Policies: ek content cards, each with the hero photo of the page it opens. */}
      <CardsRow
        cards={[
          {
            title: 'FAQ',
            ctaLabel: 'Read the FAQ',
            description:
              'Ordering, delivery, RTA vs assembled, materials, measuring, samples and more.',
            href: '/faq',
            image: {
              src: '/images/faq/questions.png',
              alt: 'Two speech bubbles, a grey one with three dots and a red one with a question mark',
            },
          },
          {
            title: 'Shipping & pickup',
            ctaLabel: 'Shipping & pickup',
            description: 'How each thing gets to you, what it costs and how long it takes.',
            href: '/shipping-policy',
            image: {
              src: '/images/pages/shipping/ek-truck-unloading.jpg',
              alt: 'A driver unloading a shrink-wrapped pallet of cabinets from the liftgate of an Express Kitchens truck',
            },
          },
          {
            title: 'Returns',
            ctaLabel: 'Returns',
            description: 'What can come back, the restocking fee, and how to get authorization.',
            href: '/returns-policy',
            image: {
              src: '/images/pages/returns/hero-taping-return-box.jpg',
              alt: 'A smiling man kneeling on the floor, taping a flat cabinet box shut for return',
            },
          },
          {
            title: 'Warranty',
            ctaLabel: 'Warranty',
            description: '1 year on every cabinet, and how to make a claim.',
            href: '/warranty',
            image: {
              src: '/images/pages/warranty/one-year-walnut.jpg',
              alt: 'A smiling Express Kitchens designer beside a walnut base cabinet, with a 1-year warranty badge',
            },
          },
          {
            title: 'Price match',
            ctaLabel: 'Price match',
            // Offer copy until Nov 30, 2026. After that, swap to:
            // "We'll match a competitor's cabinet quote, in our showrooms."
            description:
              "Bring a quote to a showroom and we'll beat it, or give you a $500 credit, until Nov 30.",
            href: '/price-match-guarantee',
            image: {
              src: '/images/pages/price-match/hero-price-match.jpg',
              alt: 'A Project Manager pointing to a red price-match tag on a white cabinet beside a plain-tagged one',
            },
          },
          {
            title: 'Secure shopping',
            ctaLabel: 'Secure shopping',
            description: 'How your payment and your details are protected.',
            href: '/secure-shopping',
            image: {
              src: '/images/pages/secure-shopping/shield-card-phone.jpg',
              alt: 'A red shield with a padlock between a payment card and a phone showing a secured checkout',
            },
          },
        ]}
        className="bg-[#fdf3f5]"
        columns={3}
        ctaStyle="link"
        imageFit="contain"
        imageStyle="plain"
        kicker="Policies"
        title="The pages that answer most questions"
      />

      <ShowroomBand showrooms={SHOWROOMS} />
    </>
  );
}
