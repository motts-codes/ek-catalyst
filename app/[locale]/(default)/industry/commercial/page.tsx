import { Boxes, Calculator, CalendarCheck, ShieldCheck, Timer, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow, type RowCard } from '@/vibes/soul/sections/cards-row';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { LogoMarquee } from '@/vibes/soul/sections/logo-marquee';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { StepsAccordion } from '@/vibes/soul/sections/page-kit/steps-accordion';
import { StepsTimeline } from '@/vibes/soul/sections/page-kit/steps-timeline';
import { ProjectShowcase } from '@/vibes/soul/sections/project-showcase';
import { MetricsTicker } from '@/vibes/soul/sections/why-us-scroll';
import { industryFields } from '~/lib/forms/industry-fields';
import { submitIndustryLead } from '~/lib/forms/submit-lead';
import { COMMERCIAL_PROJECTS } from '~/lib/pages/commercial-projects';
import { PROJECT_LOGOS } from '~/lib/pages/project-logos';

export const metadata: Metadata = {
  title: 'Commercial Cabinets and Kitchens: WBE/MBE Certified',
  description:
    'Hit your date on every unit. Cabinets, countertops, appliances and installation from one supplier, with pricing in 48 hours. WBE/MBE certified, across CT, NY, NJ, MA and RI.',
};

// Outcome-led copy, 5 Nov 2026 (docs: ek-commercial-page-copy.md). Still with EK: the
// capabilities PDF (button left off until the file exists), logo permissions, whether installation
// covers all five states, and real project photos (Pinnacle, Steel Pointe, Rose Hill).
const METRICS = [
  { icon: 'dollar', value: '$40M+', label: 'commercial projects delivered' },
  { icon: 'building', value: '100K+', label: 'multifamily units delivered' },
  { icon: 'package', value: '50,000+', label: 'cabinets in stock' },
  { icon: 'calendar', value: '110+', label: 'years in business' },
  { icon: 'award', value: 'WBE/MBE', label: 'certified' },
] as const;

const OUTCOMES: RowCard[] = [
  {
    title: 'Your schedule holds',
    description:
      "Our own factory and 50,000+ cabinets in stock mean we commit to a date and keep it. No waiting on someone else's supply chain.",
    icon: CalendarCheck,
  },
  {
    title: 'Your bids go out faster',
    description:
      'Send plans and specs, and our commercial team returns detailed pricing within 48 hours.',
    icon: Timer,
  },
  {
    title: 'Your budget works',
    description:
      'We value-engineer the spec with you, keeping the quality and cutting the cost, so your proforma adds up.',
    icon: Calculator,
  },
  {
    title: 'Your requirements are covered',
    description:
      'WBE/MBE certified, a certified member of the KCMA, and HUD-compliant cabinets built for heavy use. Paperwork included.',
    icon: ShieldCheck,
  },
  {
    title: 'One supplier, one contact',
    description:
      'Cabinets, countertops, appliances, vanities, delivery and installation. One PO, one point of accountability.',
    icon: Boxes,
  },
  {
    title: 'It scales with you',
    description:
      'From 50 units to 500+, the same spec and the same quality in every one, from the same production line.',
    icon: TrendingUp,
  },
];

// Photos are the category pages' hero shots; installation uses the warehouse crew.
const ONE_PO = [
  {
    title: 'Cabinets',
    description:
      '50,000+ in stock, from classic wood and painted finishes to sleek slab doors. Built for high-traffic spaces.',
    image: { src: '/images/category/heroes/cat-cabinets.webp', alt: 'A finished shaker kitchen' },
  },
  {
    title: 'Countertops',
    description: '10,000+ linear feet in stock, in laminate, granite and quartz.',
    image: {
      src: '/images/category/heroes/cat-countertops.webp',
      alt: 'A stone countertop on an island',
    },
  },
  {
    title: 'Appliances',
    description:
      '5,000+ in stock, from GE, Frigidaire, Whirlpool and Element: ranges, microwaves, fridges, dishwashers, and washers and dryers. Same-day pickup in Connecticut and New Jersey.',
    image: {
      src: '/images/category/heroes/cat-appliances.webp',
      alt: 'A white kitchen with a stainless fridge, range and hood beside an oak island',
    },
  },
  {
    title: 'Vanities',
    description: 'Bathroom vanities and tops, configured to your spec.',
    image: {
      src: '/images/category/heroes/cat-bath.webp',
      alt: 'A vanity with a white top, sink and faucet',
    },
  },
  {
    title: 'Installation',
    description: 'Our crews install, or we coordinate with yours. One schedule either way.',
    image: {
      src: '/images/pages/industry/warehouse-crew.jpg',
      alt: 'Three Express Kitchens crew in red shirts wheeling a wrapped cabinet to a box truck',
    },
  },
];

const STEPS = [
  {
    title: 'Send the scope',
    description:
      'Plans and specs. You get detailed pricing within 48 hours, with value-engineering options.',
  },
  {
    title: 'Lock the spec',
    description: 'We finalize finishes and sizes to meet the requirements and the budget.',
  },
  {
    title: 'Lock the date',
    description:
      "Delivery is scheduled to your construction timeline, from stock, so it's ready when your site is.",
  },
  {
    title: 'Install and hand over',
    description:
      'Our crews install, or we coordinate with yours. One contact from order to completion, and after.',
  },
];

const FAQ = [
  {
    q: 'Can you handle a 200+ unit project?',
    a: "Yes. We've delivered 100,000+ multifamily units and $40M+ in commercial projects. Our inventory and our own manufacturing are built for scale.",
  },
  {
    q: 'We need WBE/MBE for this project.',
    a: "Express Kitchens is a certified Women's and Minority Business Enterprise. We provide all the documentation for government RFPs, institutional projects and diversity-sourcing requirements.",
  },
  {
    q: "How do we know you'll hit the delivery date?",
    a: "We don't depend on a third-party supply chain. We make, stock and deliver from our own facilities, so the date we commit to is one we control. References are available.",
  },
  {
    q: 'Do you meet HUD and accessibility requirements?',
    a: 'Yes. We offer HUD-compliant cabinets built for heavy use, and ADA-compliant appliance packages.',
  },
  {
    q: 'Can you install, or work with our installers?',
    a: "Either. Our crews can install, or we'll coordinate delivery with your team. One point of contact either way.",
  },
];

export default async function Commercial({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Industry', href: '/industry' },
          { label: 'Commercial', href: '/industry/commercial' },
        ]}
      />
      <PageHero
        actions={[{ label: 'Request a project consultation', href: '#talk', primary: true }]}
        chipStyle="checks"
        chips={[
          'Pricing in 48 hours',
          '50,000+ cabinets in stock',
          '$40M+ in commercial projects delivered',
        ]}
        description="Cabinet delays shouldn't be the reason your project slips. We make, stock and deliver our own cabinets, so the date we give you is one we control. Send us your scope, and you'll have pricing back within 48 hours."
        image={{
          src: '/images/pages/industry/hero-pm-pallet.jpg',
          alt: 'A project manager in a hard hat and hi-vis vest with a tablet beside a shrink-wrapped pallet of cabinets',
        }}
        imageStyle="plain"
        kicker="Commercial · WBE/MBE certified"
        title="Hit your date, on every unit."
      />
      <ProjectShowcase
        kicker="Recent projects"
        projects={COMMERCIAL_PROJECTS}
        title="Delivered on schedule, from Jersey City to Long Island City"
      />
      <LogoMarquee kicker="Trusted by" logos={PROJECT_LOGOS} />
      <CardsRow
        cardTone="alternate"
        cards={OUTCOMES}
        columns={3}
        hideImages
        kicker="Why GCs choose us"
        title="Fewer surprises on site. More bids won."
      />
      <MetricsTicker metrics={[...METRICS]} />
      <HomeSection kicker="One PO" title="Everything for the project, from one supplier">
        <StepsAccordion numbered={false} size="large" split="even" steps={ONE_PO} />
      </HomeSection>
      <HomeSection className="bg-[#fdf3f5]" kicker="How it works" title="From scope to site">
        <StepsTimeline layout="row" steps={STEPS} />
      </HomeSection>
      <Prose
        body={[
          'Working with general contractors, developers, hospitality groups, office complexes and retail developments across Connecticut, New York, New Jersey, Massachusetts and Rhode Island.',
        ]}
        kicker="Where we work"
        title="Local experts across five states"
      />
      <CabinetFaq data={{ headline: 'Questions we hear from GCs', items: FAQ }} />
      <LeadFormCard
        action={submitIndustryLead}
        description="Send your scope and timeline, and our commercial team will come back with detailed pricing and a delivery schedule."
        fields={industryFields('Project: scope')}
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
        image={{
          src: '/images/pages/industry/office-break-room.jpg',
          alt: 'An office break room with white cabinets and red chairs',
        }}
        kicker="Talk to us"
        submitLabel="Send"
        title="Get pricing in 48 hours"
      />
    </>
  );
}
