import { ClipboardList, PackageX, Store } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { LinkCards, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
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
          { label: 'Send a message', href: '/contact' },
        ]}
        description="Checking on an order, arranging a pickup or not sure who to ask? Call or text us any time on 860-247-1000. Most questions are answered on the pages below."
        kicker="Support"
        textOnly
        title="How can we help?"
      />

      {/* 2 · Help with an order. Damage wording follows EK's Oct 27 answer. */}
      <CardsRow
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

      {/* 3 · Policies */}
      <LinkCards
        cards={[
          {
            title: 'FAQ',
            description:
              'Ordering, delivery, RTA vs assembled, materials, measuring, samples and more.',
            href: '/faq',
            linkLabel: 'Read the FAQ',
          },
          {
            title: 'Shipping & pickup',
            description: 'How each thing gets to you, what it costs and how long it takes.',
            href: '/shipping-policy',
            linkLabel: 'Shipping & pickup',
          },
          {
            title: 'Returns',
            description: 'What can come back, the restocking fee, and how to get authorization.',
            href: '/returns-policy',
            linkLabel: 'Returns',
          },
          {
            title: 'Warranty',
            description: '1 year on every cabinet, and how to make a claim.',
            href: '/warranty',
            linkLabel: 'Warranty',
          },
          {
            title: 'Price match',
            // Offer copy until Nov 30, 2026. After that, swap to:
            // "We'll match a competitor's cabinet quote, in our showrooms."
            description:
              "Bring a quote to a showroom and we'll beat it, or give you a $500 credit, until Nov 30.",
            href: '/price-match-guarantee',
            linkLabel: 'Price match',
          },
          {
            title: 'Secure shopping',
            description: 'How your payment and your details are protected.',
            href: '/secure-shopping',
            linkLabel: 'Secure shopping',
          },
        ]}
        columns={3}
        kicker="Policies"
        tint
        title="The pages that answer most questions"
      />

      <ShowroomBand showrooms={SHOWROOMS} />
    </>
  );
}
