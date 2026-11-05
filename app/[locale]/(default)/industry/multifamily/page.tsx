import { DoorClosed, Droplets, RectangleHorizontal, Refrigerator, Wrench } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs, PageHero, Prose, StatsRow } from '@/vibes/soul/sections/page-kit';
import { StoryBand } from '@/vibes/soul/sections/story-band';
import { industryFields } from '~/lib/forms/industry-fields';
import { submitIndustryLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Multifamily Kitchens: Five-Day Delivery',
  description:
    'Five-day kitchens from 50,000+ in-stock cabinets, with countertops, appliances and installation on one PO, so your units are back on the market sooner.',
};

// Final copy, 5 Nov 2026. Two figures are still with EK to confirm (100,000+ units delivered,
// 300+ property managers). If they don't hold, replace those two stats with "10,000+ linear feet
// of countertops in stock" and "5,000+ appliances in stock". Client names (UDR, Related
// Companies, Equity Residential, WinnCompanies, Konover) go under the Storrs Center band once
// EK confirms each may be used.
const STATS = [
  { value: '5-day', label: 'kitchens, our multifamily standard' },
  { value: '50,000+', label: 'cabinets in stock' },
  { value: '100,000+', label: 'multifamily units delivered' },
  { value: '300+', label: 'property managers' },
];

const ONE_PO = [
  {
    title: 'Cabinets',
    description: '50,000+ in stock, in shaker, raised panel, stained and modern finishes.',
    icon: DoorClosed,
  },
  {
    title: 'Countertops',
    description:
      '10,000+ linear feet in stock, in granite, quartz and laminate, with 35+ colors to choose from.',
    icon: RectangleHorizontal,
  },
  {
    title: 'Appliances',
    description:
      '5,000+ in stock, freestanding and built-in, in white, black and stainless. ADA-compliant packages, Energy Star and Wi-Fi models, from Whirlpool, GE, Frigidaire, Maytag, KitchenAid and more.',
    icon: Refrigerator,
  },
  {
    title: 'Sinks, faucets and hardware',
    description: '300+ sinks, 700+ faucets and 2,000+ handles and pulls in stock.',
    icon: Droplets,
  },
  {
    title: 'Installation',
    description: 'Our crews install, so the kitchen arrives and goes in on one schedule.',
    icon: Wrench,
  },
];

const PACKAGES = [
  {
    title: 'Studio / 1BR, from $2,800',
    description:
      '8–12 cabinets per unit. A base and wall cabinet set, laminate countertop, standard sink cutout, soft-close hinges.',
  },
  {
    title: '2BR standard, from $4,200',
    meta: 'Most popular',
    description:
      '14–18 cabinets per unit. An expanded layout, a choice of three countertop materials, an appliance bundle available, and plywood construction.',
  },
  {
    title: 'Luxury / 3BR, from $6,500',
    description:
      '20–28 cabinets per unit. A full kitchen redesign, solid-surface countertops, premium hardware, and a custom layout consultation.',
  },
];

const FAQ = [
  {
    q: 'We need the same quality across 200+ units. Can you deliver that?',
    a: 'Yes. Every cabinet comes off the same production line, so unit 1 and unit 247 match. One spec per unit type, repeated across your whole portfolio.',
  },
  {
    q: 'Our last cabinet supplier delayed the project by six weeks.',
    a: "That's why we keep 50,000+ cabinets in stock. Five-day kitchens are our multifamily standard, not a marketing line.",
  },
  {
    q: "We're worried about coordinating cabinets, countertops and installation separately.",
    a: "Don't be. We stock the cabinets, supply the countertops and appliances, and our own crews install. One company, one PO, one point of accountability.",
  },
  {
    q: 'What if we need different configurations for different unit types?',
    a: 'Our packages cover studios through three-bedrooms. For 50+ units, we spec each unit type once, price it per unit, and repeat it across your portfolio.',
  },
];

export default async function Multifamily({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Industry', href: '/industry' },
          { label: 'Multifamily', href: '/industry/multifamily' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Request portfolio pricing', href: '#talk', primary: true },
          { label: 'See unit packages', href: '#packages', style: 'outline' },
        ]}
        chipStyle="checks"
        chips={['5-day kitchens', '50,000+ cabinets in stock', 'Supply and installation on one PO']}
        description="We deliver complete kitchens in five days from 50,000+ cabinets in stock, so your units are back on the market sooner. One spec per unit type, one PO, from cabinets to installation."
        image={{
          src: '/images/pages/industry/apartment-kitchen-units.jpg',
          alt: 'A finished apartment kitchen, with the next identical unit visible beyond',
        }}
        imageStyle="plain"
        kicker="Multifamily · 5-day kitchens"
        title="Fewer vacant days. More rental income."
      />
      <DeliveryLadder
        className="bg-[#fdf3f5]"
        columns={['', 'Industry standard', 'Express Kitchens']}
        description="What the cabinet wait costs you per unit, at $2,500 a month in rent. Your numbers will differ, and we'll work them out for your portfolio."
        footnote={
          <>
            <span className="block text-lg font-semibold text-foreground">
              $7,705 back per unit, times your units.
            </span>
            <span className="mt-2 block">
              Based on $2,500 a month average rent. 14 weeks is the typical custom-cabinet lead time
              reported by US kitchen designers, 2025–26.
            </span>
          </>
        }
        inline
        look="minimal"
        narrow
        rows={[
          ['!Wait time', '14 weeks for cabinets', '5 days to delivery'],
          ['!Rent lost while you wait', '$8,120', '$415'],
          ['!Rent per unit', '$2,500/mo', '$2,500/mo'],
        ]}
        title="The math that matters"
      />
      <StatsRow stats={STATS} />
      <CardsRow
        cards={ONE_PO}
        columns={5}
        description="Cabinets, countertops, appliances, fixtures and installation, all from one company. Fewer vendors to chase, and one point of accountability."
        hideImages
        kicker="One supplier"
        title="Everything for the unit, on one PO"
      />
      <Prose
        body={[
          'Your tenants need to move in, and your owners need occupancy up. Nobody should wait 14 weeks for cabinets while units sit empty. So we built a different kind of operation: 50,000+ cabinets in stock, our own factory, our own crews, and a team that understands what each vacant day costs you.',
        ]}
        kicker="Our belief"
        tint
        title="The kitchen supplier should be the fastest part of your renovation, not the bottleneck."
      />
      <div id="packages" />
      <CardsRow
        cards={PACKAGES}
        description="Pre-configured packages cut decision time and speed up quote to order. Cabinets, countertops and appliances on one PO, with installation available. Custom configurations for orders of 50+ units."
        hideImages
        kicker="Apartment kitchen packages"
        title="Three packages, one PO"
      />
      <StoryBand
        description="For Storrs Center, the mixed-use development beside UConn, we supplied up to 430 kitchens: the same spec in every unit, from our own cabinet line."
        image={{
          // Stand-in until EK sends a Storrs Center unit photo.
          src: '/images/pages/industry/multifamily-kitchen.jpg',
          alt: 'A compact apartment kitchen in grey shaker cabinets with white quartz and stainless appliances',
        }}
        kicker="Proof"
        title="Up to 430 kitchens for Storrs Center"
      />
      <CabinetFaq data={{ headline: 'Questions from property managers', items: FAQ }} />
      <LeadFormCard
        action={submitIndustryLead}
        description="Tell us the unit count and timeline, and we'll come back with portfolio pricing."
        fields={industryFields('Project: number of units')}
        fine={
          <>
            Prefer to talk? Call or text{' '}
            <a className="font-semibold text-foreground" href="tel:+18602471000">
              860-247-1000
            </a>
            , any time.
          </>
        }
        id="talk"
        kicker="Talk to us"
        submitLabel="Send"
        title="Request portfolio pricing"
      />
    </>
  );
}
