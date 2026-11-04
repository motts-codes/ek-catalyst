import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import {
  AudienceRows,
  PageBreadcrumbs,
  type Person,
  StackedHero,
  StoryTimeline,
  TeamRow,
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
    'I love meeting customers every day and helping families get the kitchen they’ve always wanted.',
  ),
  pmPerson('orange', 'The kitchen really is the heart of the home.'),
  pmPerson('brookfield', 'I listen more than I talk.'),
  pmPerson(
    'stamford',
    'I blend creativity with practicality, so every kitchen fits the way my customers live.',
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
      <StoryTimeline
        className="bg-[#fdf3f5]"
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
        surfaceClassName="bg-[#fdf3f5]"
        title="From a Hartford hardware store to a 300,000 sq ft home in Bristol"
      />
      <CardsRow
        cardTitleTone="red"
        cards={[
          {
            title: 'Our own factory',
            description:
              "We make our own cabinets in Bristol, cut and finished by robots so every one fits the next. And with 50,000+ already in stock, you're not waiting months for yours.",
            image: {
              src: '/images/pages/about/robotic-line.jpg',
              alt: 'A robotic arm placing a panel on the cabinet line',
            },
            imageLabel: 'Robotic line',
          },
          {
            title: 'Six showrooms',
            description:
              "See full kitchens, hold the doors, and sit down with a Project Manager who'll price yours. Six showrooms across Connecticut, and walk-ins are welcome.",
            image: {
              src: '/images/pages/about/showroom-display.jpg',
              alt: 'A white shaker display kitchen in the showroom',
            },
            imageLabel: 'Showroom display',
          },
          {
            title: 'The Factory Outlet',
            description:
              'Clearance, quick-ship and in-stock cabinets, closets, appliances, windows and doors, for less than big-box prices. Bring your plans and our team will help you find what fits.',
            image: {
              src: '/images/why-us/factory/stock.webp',
              alt: 'Racks of boxed cabinets in the Bristol warehouse',
            },
            imageLabel: 'Factory outlet',
          },
          {
            title: 'We stand behind it',
            description:
              "Every cabinet has a 1-year warranty, and our phones are answered 24/7. If something's not right, call or text and a real person picks up.",
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
      />
      <ShowroomBand showrooms={SHOWROOMS} />
      <AudienceRows
        description="Six showrooms for homeowners, plus a commercial business supplying builders, contractors and apartment communities."
        items={[
          {
            title: 'Homeowners',
            description:
              'Planning your first kitchen, or your last? Walk into any of our six showrooms, see it for real, and get it priced, free and with no pressure to buy.',
            href: FREE_DESIGN_HREF,
            linkLabel: 'Start your kitchen',
            image: {
              src: '/images/pages/about/audience-homeowners-v2.jpg',
              alt: 'A couple laughing at their new white kitchen island, French doors open to the garden behind them',
            },
          },
          {
            title: 'Contractors',
            description:
              'Your client wants a date, and you need cabinets that show up on time. With 50,000+ in stock and special pricing for the trade, we help you keep your promises. Call us for details.',
            href: '/pro',
            linkLabel: 'For contractors',
            image: {
              src: '/images/pages/about/audience-contractors-v2.jpg',
              alt: 'A contractor pointing out a cabinet in a warehouse aisle while a red-shirted team member checks stock on a tablet',
            },
          },
          {
            title: 'Multifamily',
            description:
              "Hundreds of units, one spec, and no room for delays. We've supplied up to 430 kitchens for Storrs Center near UConn, delivered on the schedule the building needed.",
            href: '/industry/multifamily',
            linkLabel: 'Multifamily',
            image: {
              src: '/images/pages/about/audience-multifamily-v2.jpg',
              alt: 'A property manager with a tablet walking a developer through a finished apartment kitchen',
            },
          },
          {
            title: 'Commercial & wholesale',
            description:
              "Developers and general contractors need cabinets they can schedule around. We make and stock our own, so your timeline isn't waiting on someone else's factory.",
            href: '/industry/commercial',
            linkLabel: 'Commercial',
            image: {
              src: '/images/pages/about/audience-commercial-v2.jpg',
              alt: "Shrink-wrapped cabinet pallets lined up in a new building's corridor while a site inspector and a developer review the delivery",
            },
          },
        ]}
        kicker="Who we work with"
        tint
        title="Whatever you’re building"
      />
      <TeamRow
        action={{ label: 'Find your showroom team', href: '/showrooms' }}
        description="Customers name our Project Managers in their reviews more than anything else about us."
        kicker="The people"
        people={PEOPLE}
        title="Meet a few of them"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
