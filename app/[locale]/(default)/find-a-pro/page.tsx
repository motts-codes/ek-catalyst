import { LayoutPanelLeft, ListChecks, ShieldCheck, Wrench } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { Actions, PageBreadcrumbs, PageHero, Prose, RedBox } from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';

export const metadata: Metadata = {
  title: 'Find an Installer',
  description:
    'We install showroom orders in Connecticut. Ordering online? How to find a good installer and what to ask.',
};

const DIRECTORY_HREF =
  'https://www.contractors.com/g/contractor-search/?category=Additions+and+Remodels&subcategory=Remodel%20-%20Multiple%20Rooms';

const PHONE = { label: '860-247-1000', href: 'tel:+18602471000' };

// Copy per EK's brief, 12 Nov 2026: showroom orders in Connecticut can be installed by EK; online
// orders are self-install or a local installer, and the page helps pick one.
export default async function FindAPro({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Find an installer', href: '/find-a-pro' }]} />
      <PageHero
        actions={[
          { label: 'Find a showroom', href: '/showrooms', primary: true },
          { label: 'Search installers near you ↗', href: DIRECTORY_HREF, style: 'outline' },
        ]}
        description="Order through a showroom and, in Connecticut, we can install it for you. Ordering online? Here’s how to find a good installer."
        image={{
          src: '/images/pages/find-a-pro/installer-levelling.jpg',
          alt: 'An installer levelling a white shaker base cabinet',
        }}
        kicker="Find an installer"
        title="Your cabinets, installed right."
      />

      {/* 2 · EK installs showroom orders (Connecticut). */}
      <HomeSection compact>
        <RedBox
          media={{
            image: {
              src: '/images/pages/design-consult/plan-and-quote.jpg',
              alt: 'A designer and a customer going over a kitchen plan and quote at a showroom table',
            },
            split: '60/40',
          }}
          title="Want us to install it?"
        >
          <p className="max-w-xl text-sm leading-relaxed text-white/85 @xl:text-base">
            On showroom orders in Connecticut, our team installs the cabinets and templates and
            installs the countertop. Ask your designer when you get your quote.
          </p>
          <Actions
            actions={[{ label: 'Book a visit', href: '/book', primary: true }]}
            className="mt-6"
            onRed
          />
        </RedBox>
      </HomeSection>

      {/* 3 · What to ask. */}
      <CardsRow
        cards={[
          {
            icon: ShieldCheck,
            title: 'Licensed and insured?',
            description: 'Ask for proof of both before work starts.',
          },
          {
            icon: LayoutPanelLeft,
            title: 'Framed or frameless?',
            description:
              'Star and Prism are framed; Euro Max and Euro Value are frameless. Ask which they’ve installed.',
          },
          {
            icon: Wrench,
            title: 'Will they assemble RTA?',
            description:
              'About 30 minutes per cabinet. Agree who does it, and whether it’s in the price.',
          },
          {
            icon: ListChecks,
            title: 'What’s included?',
            description:
              'Removing the old kitchen, plumbing and hardware are often extras. Ask up front.',
          },
        ]}
        columns={4}
        hideImages
        kicker="What to ask an installer"
        tint
        title="Four questions to ask"
      />

      {/* 4 · Prep. The phone number is a link, so the paragraph and button are children, not `body`. */}
      <Prose kicker="Before the installer arrives" title="Get the room ready">
        <p className="mt-4 text-sm leading-relaxed text-contrast-500 @xl:text-base">
          Unbox with two people, check every piece against the packing list, and let the cabinets
          sit in the room for a day or two before they’re installed. Damaged in transit? File a
          claim with the carrier, then call us at{' '}
          <Link
            className="font-semibold text-foreground underline-offset-2 hover:underline"
            href={PHONE.href}
          >
            {PHONE.label}
          </Link>
          .
        </p>
        <Actions
          actions={[{ label: 'The full checklist', href: '/resources/cabinet-care' }]}
          className="mt-6"
        />
      </Prose>

      <ClosingBand primary={{ label: 'Find a showroom', href: '/showrooms' }} tint />
    </>
  );
}
