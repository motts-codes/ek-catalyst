import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetLines } from '@/vibes/soul/sections/cabinet-lines';
import { CategoryHero } from '@/vibes/soul/sections/category-hero';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { getCabinetLines, getCabinetProgramFaq } from '~/lib/cabinets/cabinet-lines-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'RTA Kitchen Cabinets',
  description:
    'Ready-to-assemble (RTA) cabinets in a range of door styles and finishes at a lower price point.',
};

// RTA (ready-to-assemble) cabinet lines landing page — same view as the Assembled page, driven by
// the child categories' BigCommerce metafields for the RTA program.
export default async function RtaCabinets({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [lines, faq] = await Promise.all([getCabinetLines('rta'), getCabinetProgramFaq('rta')]);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Cabinets', href: '/cabinets' },
          { label: 'RTA', href: '/cabinets/rta-cabinets' },
        ]}
      />
      {/* The same black-panel hero as the category pages, with the home page's program photo. */}
      <CategoryHero
        description="The same cabinets shipped flat from Bristol in two weeks, at a lower price. Pick a collection and finish below."
        image={{
          src: '/images/home/programs/rta.webp',
          alt: 'A kitchen in dark grey shaker cabinets',
        }}
        title="RTA Kitchen Cabinets"
      />
      <CabinetLines explainerHref="/mykitchen/cabinets/rta" lines={lines} program="rta" />
      <CabinetFaq data={faq} />
    </>
  );
}
