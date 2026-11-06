import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { LinkCards, PageBreadcrumbs, PageHero, StatsRow } from '@/vibes/soul/sections/page-kit';
import { ProjectGrid } from '@/vibes/soul/sections/page-kit/media';
import { PROJECTS } from '~/lib/pages/projects';

export const metadata: Metadata = {
  title: 'Industries: Beyond Retail',
  description:
    'The same Connecticut-made cabinets at a different scale: retail, the factory outlet, multifamily, wholesale and commercial.',
};

export default async function Industry({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Industry', href: '/industry' }]} />
      <PageHero
        description="Most people meet us through a showroom or this site, but the same cabinets, made in the same Connecticut factory, go out at a very different scale: whole apartment buildings, hotel kitchenettes, office break rooms and wholesale supply for dealers. If you're buying by the unit, the pallet or the project rather than the kitchen, start here and we'll point you to the right team."
        image={{
          src: '/images/pages/industry/multifamily-kitchen.jpg',
          alt: 'A compact apartment kitchen with grey shaker cabinets',
        }}
        imageLabel="A multifamily kitchen, one of many"
        kicker="Industry"
        title="The same cabinets, at a different scale"
      />
      <StatsRow
        stats={[
          { value: '100,000+', label: 'multifamily units delivered' },
          { value: '$40M+', label: 'commercial projects delivered' },
          { value: '50,000+', label: 'cabinets in stock' },
          { value: 'WBE / MBE', label: 'certified' },
          { value: '110', label: 'years in Connecticut' },
        ]}
        tint
      />
      <LinkCards
        cards={[
          {
            title: 'Retail',
            description: 'Homeowners, through this site and six showrooms.',
            href: '/',
            linkLabel: 'Shop',
          },
          {
            title: 'Factory outlet',
            description: 'Clearance stock and floor models, in Bristol.',
            href: 'https://expresskitchensfactoryoutlet.com/',
            linkLabel: 'Visit the outlet ↗',
          },
          {
            title: 'Multifamily',
            description: 'Spec once, furnish every unit. Five-day kitchens from stock.',
            href: '/industry/multifamily',
            linkLabel: 'Multifamily',
          },
          {
            title: 'Wholesale',
            description: 'Supply for dealers and distributors, through Kunal Kitchens.',
            href: 'https://kunalkitchens.com/',
            linkLabel: 'Kunal Kitchens ↗',
          },
          {
            title: 'Commercial',
            description: 'Scoped for the job site, not the showroom.',
            href: '/industry/commercial',
            linkLabel: 'Commercial',
          },
        ]}
        columns={3}
        kicker="Who we serve"
        title="Five ways Express Kitchens works"
      />
      <ProjectGrid
        projects={PROJECTS.filter((p) => p.industry !== 'Residential').slice(0, 3)}
        tint
        title="Recent projects"
      />
    </>
  );
}
