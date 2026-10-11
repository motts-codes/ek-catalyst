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
  title: 'Assembled Kitchen Cabinets',
  description:
    'Premium, ready-to-install assembled cabinets in a range of door styles and finishes.',
};

// Assembled cabinet lines landing page. A card per cabinet line/finish (Avon, Dover, …), driven by
// the child categories' BigCommerce metafields (pricing_10x10 / fulfillment / sample) for the
// Assembled program. The RTA sibling page (../rta-cabinets) is the same view with program="rta".
export default async function AssembledCabinets({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [lines, faq] = await Promise.all([
    getCabinetLines('assembled'),
    getCabinetProgramFaq('assembled'),
  ]);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Cabinets', href: '/cabinets' },
          { label: 'Assembled', href: '/cabinets/assembled-cabinets' },
        ]}
      />
      {/* The same black-panel hero as the category pages, with the home page's program photo. */}
      <CategoryHero
        description="Built and checked in Connecticut, delivered ready to hang in three weeks. Pick a collection and finish below."
        image={{
          src: '/images/home/programs/assembled.webp',
          alt: 'A finished kitchen in sage-green shaker cabinets with a white quartz island and black pendants',
        }}
        title="Assembled Kitchen Cabinets"
      />
      <CabinetLines
        explainerHref="/mykitchen/cabinets/assembled"
        lines={lines}
        program="assembled"
      />
      <CabinetFaq data={faq} />
    </>
  );
}
