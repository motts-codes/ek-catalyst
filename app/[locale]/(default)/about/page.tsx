import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import {
  LinkCards,
  PageBreadcrumbs,
  PageHero,
  StatsRow,
  TeamRow,
  Timeline,
} from '@/vibes/soul/sections/page-kit';
import { ShowroomBand } from '@/vibes/soul/sections/showroom-band';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'About Express Kitchens',
  description:
    "Connecticut's kitchen company since 1916. We make our own cabinets, cut our own stone and sell it all from six showrooms, so you get manufacturer-direct pricing and cabinets already in stock.",
};

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'About', href: '/about' }]} />
      <PageHero
        actions={[
          { label: 'Free design consult', href: FREE_DESIGN_HREF, primary: true },
          { label: 'Visit a showroom', href: '/showrooms' },
        ]}
        description="We've been Connecticut's kitchen company since 1916. Based in Bristol, we build our own cabinetry — Star Cabinetry, made right here — cut and polish our own stone countertops, and sell it all from six showrooms you can walk into. That's the difference between us and a website with a warehouse somewhere: when you buy from us, you're buying from the people who made it, at a manufacturer-direct price, with the cabinets already on the shelf."
        imageLabel="The factory floor, cabinets on the line"
        kicker="About Express Kitchens"
        title="Made in Connecticut. Sold by the people who make it."
      />
      <StatsRow
        stats={[
          { value: '110', label: 'years in Connecticut' },
          { value: '100,000+', label: 'kitchens delivered' },
          { value: '6', label: 'showrooms you can visit' },
          { value: '50,000+', label: 'cabinets in stock' },
          { value: '4.5 ★', label: 'from 360+ Google reviews' },
        ]}
        tint
      />
      <CardsRow
        cards={[
          {
            title: 'Our own factory',
            description:
              'A robotic line in Bristol cuts, drills and finishes every cabinet to the same tolerance, and keeps 50,000 cabinets in stock so yours can ship in two weeks rather than two months.',
            imageLabel: 'Robotic line',
          },
          {
            title: 'Six showrooms',
            description:
              'Newington, Orange, New London, Brookfield, Stamford and Bristol. Full kitchens on display, real finishes to touch, and a Project Manager at each one who will plan your kitchen with you.',
            imageLabel: 'Showroom display',
          },
          {
            title: 'The factory outlet',
            description:
              "In Bristol you'll also find our outlet: floor models, overstock and clearance sets at outlet prices, and the pickup point for windows and appliances.",
            imageLabel: 'Factory outlet',
          },
          {
            title: 'People who know the work',
            description:
              'Cabinetmakers, stone finishers, designers and Project Managers, many of whom have been with us for well over a decade. They are the people our customers name in their reviews.',
            imageLabel: 'The team at work',
          },
        ]}
        columns={4}
        description="We don't resell someone else's kitchen. We make it, stock it, show it and stand behind it, all in Connecticut, which is why we can promise prices and dates that other companies can only quote."
        kicker="Why Express Kitchens"
        title="Everything under our own roof"
      />
      <Timeline
        description="Four generations of building the kind of company that delivers what it promises, from a hardware store on Main Street to 100,000 kitchens."
        items={[
          {
            when: '1916',
            title: 'Star Hardware opens in Hartford',
            description:
              'A family hardware store on Main Street, serving the builders and homeowners of a growing city.',
          },
          {
            when: '1948',
            title: 'The first kitchen cabinets',
            description:
              'The store begins building cabinets in a workshop behind the counter, for local contractors who wanted something better than what the catalogues offered.',
          },
          {
            when: '1989',
            title: 'The Kothari family takes over',
            description:
              'A new family on the same street. The shop grows from cabinets to whole kitchens.',
          },
          {
            when: '2002',
            title: 'Express Kitchens is born',
            description:
              'The company takes its current name and opens its first showroom in Hartford, where a kitchen can be designed, priced and ordered in a single visit.',
          },
          {
            when: '2008',
            title: 'Star Cabinetry launches',
            description:
              'Our own brand of all-plywood cabinetry, built in Connecticut and priced manufacturer-direct.',
          },
          {
            when: '2012',
            title: 'The Bristol factory opens',
            description:
              'Manufacturing, 50,000 cabinets of stock and the factory outlet move under one roof.',
          },
          {
            when: '2016',
            title: 'Six showrooms across Connecticut',
            description: 'The sixth showroom opens in Stamford as the company turns 100.',
          },
          {
            when: '2019',
            title: '100,000 multifamily units',
            description:
              'The multifamily division passes 100,000 units delivered to property managers across the Northeast.',
          },
          {
            when: '2023',
            title: 'Robotic manufacturing',
            description:
              'A new automated line cuts, drills and finishes cabinets with tolerances a hand shop cannot match.',
          },
          {
            when: '2026',
            title: 'Windows, doors and a new website',
            description:
              'The range grows beyond the kitchen, and this site launches with a homeowner experience and a contractor experience.',
          },
        ]}
        kicker="Our story"
        tint
        title="From a hardware store to 100,000 kitchens"
      />
      <CardsRow
        cards={[
          {
            title: 'Cabinets, built in Connecticut',
            description:
              'Star Cabinetry is our own brand: all-plywood boxes and five-piece doors, built by our own cabinetmakers in Bristol. Because we make it, we can price it manufacturer-direct and keep 50,000 cabinets in stock for you.',
            imageLabel: 'A cabinetmaker at the line',
          },
          {
            title: 'Countertops, cut and polished here',
            description:
              'Granite and quartz from quarries around the world, templated, cut and hand-polished at our own facility in Bristol, in a wide choice of colours and at a price to fit your budget.',
            imageLabel: 'Stone polishing',
          },
          {
            title: 'Brands we carry alongside our own',
            description:
              "If you have your heart set on a particular national cabinet brand, we carry several, at some of the most affordable prices you'll find.",
            imageLabel: 'Showroom display',
          },
        ]}
        kicker="We make what we sell"
        title="Your kitchen, from our hands"
      />
      <LinkCards
        cards={[
          {
            title: 'Homeowners',
            description:
              'Six showrooms, free design help and everything for the kitchen from one company.',
            href: '/',
            linkLabel: 'Start your kitchen',
          },
          {
            title: 'Contractors',
            description:
              'Trade pricing, a rep who knows your jobs, and stock that ships in two weeks.',
            href: '/pro',
            linkLabel: 'See the Pro Program',
          },
          {
            title: 'Multifamily',
            description:
              'One spec per unit type, delivered floor by floor. More than 100,000 units so far.',
            href: '#',
            linkLabel: 'Multifamily',
          },
          {
            title: 'Commercial & wholesale',
            description:
              'Schedule certainty for GCs and developers, and wholesale supply through Kunal Kitchens.',
            href: '#',
            linkLabel: 'Commercial & wholesale',
          },
        ]}
        description="A retail network of showrooms across Connecticut, and a commercial and wholesale business that supplies builders, contractors and apartment communities across the Northeast."
        kicker="Who we work with"
        tint
        title="Homeowners, contractors, builders and property managers"
      />
      <TeamRow
        action={{ label: 'Find your showroom team', href: '/showrooms' }}
        description="Customers name our showroom staff in their reviews more than anything else about us. These are some of the people who plan kitchens every day."
        kicker="The people"
        people={[
          {
            name: '[Name]',
            role: 'Project Manager · Newington',
            quote:
              '“Most people walk in with a photo and a worry about the budget. My job is to turn both into a plan.”',
          },
          {
            name: '[Name]',
            role: 'Project Manager · Orange',
            quote:
              '“I measure twice. A kitchen that fits the room the first time is the whole job.”',
          },
          {
            name: 'Lanaisha Rodrigues',
            role: 'Project Manager · New London',
            quote:
              '“Bring the kids, bring the contractor, bring nothing. We start wherever you are.”',
            href: '/showrooms/new-london',
          },
          {
            name: '[Name]',
            role: 'Trade Account Manager',
            quote: '“Contractors need the order right and the truck on time. That is what I do.”',
          },
        ]}
        title="The person you deal with is the difference"
      />
      <ShowroomBand
        kicker="Your local design studio"
        showrooms={SHOWROOMS}
        tint
        title="Six showrooms across Connecticut"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
