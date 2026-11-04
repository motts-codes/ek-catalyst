import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import {
  LinkCards,
  PageBreadcrumbs,
  type Person,
  StackedHero,
  TeamRow,
  Timeline,
} from '@/vibes/soul/sections/page-kit';
import { ShowroomBand } from '@/vibes/soul/sections/showroom-band';
import { MetricsTicker } from '@/vibes/soul/sections/why-us-scroll';
import { EK_METRICS, FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import { getShowroom, showroomHref } from '~/lib/pages/showrooms';

export const metadata: Metadata = {
  title: 'About Express Kitchens',
  description:
    'Two families, four generations and more than a century of kitchens. Meet the Project Managers, cabinetmakers and Bristol team behind every Express Kitchens order.',
};

// The Project Managers quoted on this page, with their portraits from the showroom data.
const pmPerson = (slug: string, quote: string): Person => {
  const showroom = getShowroom(slug);

  return {
    name: showroom?.pm.name ?? '',
    role: `Project Manager · ${showroom?.name ?? ''}`,
    quote,
    image: showroom?.pm.photo,
    href: showroomHref(slug),
  };
};

const PEOPLE: Person[] = [
  pmPerson(
    'new-london',
    '“I love meeting customers every day and helping families get the kitchen they’ve always wanted.”',
  ),
  pmPerson('orange', '“The kitchen really is the heart of the home.”'),
  pmPerson('brookfield', '“I listen more than I talk.”'),
  pmPerson(
    'stamford',
    '“I blend creativity with practicality, so every kitchen fits the way my customers live.”',
  ),
];

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'About', href: '/about' }]} />
      <StackedHero
        actions={[{ label: 'Meet your showroom team', href: '/showrooms', primary: true }]}
        description="Our Project Managers, cabinetmakers, drivers and the team in Bristol are the reason customers come back, and the people they name in their reviews. Two families have run this business across four generations since 1916, and every kitchen still goes through people who know the work."
        image={{
          src: '/images/pages/about/team-bristol-wide.jpg',
          alt: 'The Express Kitchens team together at our Bristol facility',
        }}
        kicker="About Express Kitchens"
        title="The people behind your kitchen"
      />
      <MetricsTicker metrics={EK_METRICS} />
      <Timeline
        description="Two families, four generations, and more than a century of kitchens."
        items={[
          {
            when: '1916',
            title: 'Star Hardware opens',
            description:
              'Sam and Charlie Gellin open a hardware store in Hartford, and soon start remodeling kitchens.',
          },
          {
            when: '1989',
            title: 'A new family takes over',
            description: 'The Kothari family takes over Star Hardware.',
          },
          {
            when: '2002',
            title: 'Express Kitchens is born',
            description: 'Max Kothari founds Express Kitchens in Hartford.',
          },
          {
            when: '2013',
            title: 'Our own cabinet line',
            description:
              'Star Cabinets, made in Hartford, and up to 430 kitchens for Storrs Center near UConn.',
          },
          {
            when: '2018',
            title: 'Three stores in one day',
            description:
              'Southington, Springfield and Holyoke open together, taking us to 16 stores.',
          },
          {
            when: '2023',
            title: 'Into New York and New Jersey',
            description:
              'Three acquisitions add a New Jersey plant and grow us to 17 showrooms in four states.',
          },
          {
            when: '2025',
            title: 'A new home in Bristol',
            description:
              'Manufacturing, distribution, offices and our outlet, in one 300,000+ sq ft facility.',
          },
          {
            when: '2026',
            title: 'Windows, doors and a new website',
            description:
              'Automated cabinet production, windows and interior doors, and a new site.',
          },
        ]}
        kicker="Our story"
        tint
        title="From a Hartford hardware store to a 300,000 sq ft home in Bristol"
      />
      <CardsRow
        cards={[
          {
            title: 'Our own factory',
            description:
              'Since 2025, manufacturing, distribution and our offices share one 300,000+ sq ft facility in Bristol. Robots cut and finish every cabinet, and 50,000+ sit in stock, so RTA ships in 2 weeks.',
            image: {
              src: '/images/pages/about/robotic-line.jpg',
              alt: 'A robotic arm placing a panel on the cabinet line',
            },
            imageLabel: 'Robotic line',
          },
          {
            title: 'Six showrooms',
            description:
              'Newington, Orange, New London, Brookfield, Stamford and Bristol. Full kitchens on display, and a Project Manager at each one to plan and price your kitchen.',
            image: {
              src: '/images/pages/about/showroom-display.jpg',
              alt: 'A white shaker display kitchen in the showroom',
            },
            imageLabel: 'Showroom display',
          },
          {
            title: 'The Factory Outlet',
            description:
              'Also at 18 Main Street, Bristol: clearance and discounted cabinets, quick-ship styles, closets, appliances, windows, vanities and interior doors.',
            image: {
              src: '/images/why-us/factory/stock.webp',
              alt: 'Racks of boxed cabinets in the Bristol warehouse',
            },
            imageLabel: 'Factory outlet',
          },
          {
            title: 'People who know the work',
            description:
              "Project Managers and factory teams, many with us for over a decade. They're the people our customers name in their reviews.",
            image: {
              src: '/images/pages/about/team-at-work.jpg',
              alt: 'Two cabinetmakers fitting a door at a workbench',
            },
            imageLabel: 'The team at work',
          },
        ]}
        columns={4}
        description="We don't resell someone else's kitchen. We make it, stock it, show it and stand behind it."
        imageStyle="plain"
        kicker="Why Express Kitchens"
        title="Everything under one roof"
        titleTone="red"
      />
      <LinkCards
        cards={[
          {
            title: 'Homeowners',
            description:
              'Six showrooms, free design help, and everything for the kitchen from one company.',
            href: '/',
            linkLabel: 'Start your kitchen',
          },
          {
            title: 'Contractors',
            description:
              'Special pricing for contractors and builders, and 50,000+ cabinets in stock. Call us for details.',
            href: '/pro',
            linkLabel: 'For contractors',
          },
          {
            title: 'Multifamily',
            description:
              "One spec per unit type, delivered on your schedule. We've supplied up to 430 kitchens for Storrs Center near UConn.",
            href: '/industry/multifamily',
            linkLabel: 'Multifamily',
          },
          {
            title: 'Commercial & wholesale',
            description: 'Schedule certainty for general contractors and developers.',
            href: '/industry/commercial',
            linkLabel: 'Commercial',
          },
        ]}
        description="Six showrooms for homeowners, plus a commercial business supplying builders, contractors and apartment communities."
        kicker="Who we work with"
        tint
        title="Homeowners, contractors, builders and property managers"
      />
      <TeamRow
        action={{ label: 'Find your showroom team', href: '/showrooms' }}
        description="Customers name our Project Managers in their reviews more than anything else about us."
        kicker="The people"
        people={PEOPLE}
        title="Meet a few of them"
      />
      <ShowroomBand showrooms={SHOWROOMS} />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
