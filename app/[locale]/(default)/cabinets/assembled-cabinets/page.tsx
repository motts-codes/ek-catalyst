import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetLineFilter } from '@/vibes/soul/sections/cabinet-line-filter';
import { CabinetLines } from '@/vibes/soul/sections/cabinet-lines';
import { CategoryHero, CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';
import { CABINET_LINE_COPY } from '~/lib/cabinets/cabinet-line-copy';
import {
  cabinetLineOptions,
  filterCabinetLines,
  getCabinetLines,
  getCabinetProgramFaq,
} from '~/lib/cabinets/cabinet-lines-data';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ line?: string | string[] }>;
}

export const metadata: Metadata = {
  title: 'Assembled Kitchen Cabinets',
  description:
    'Premium, ready-to-install assembled cabinets in a range of door styles and finishes.',
};

// Assembled cabinet lines landing page. A card per cabinet line/finish (Avon, Dover, …), driven by
// the child categories' BigCommerce metafields (pricing_10x10 / fulfillment / sample) for the
// Assembled program. The RTA sibling page (../rta-cabinets) is the same view with program="rta".
export default async function AssembledCabinets({ params, searchParams }: Props) {
  const { locale } = await params;
  const lineParam = (await searchParams).line;
  const selectedLine = (Array.isArray(lineParam) ? lineParam[0] : lineParam) || null;

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
        // A program listing is a sub-page of Cabinets, so it takes the subcategory black.
        description="Built and checked in Connecticut, delivered ready to hang in three weeks. Pick a collection and finish below."
        image={{
          src: '/images/home/programs/assembled.webp',
          alt: 'A finished kitchen in sage-green shaker cabinets with a white quartz island and black pendants',
        }}
        imageOverlay={
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-contrast-200 bg-white px-4 py-2 text-sm text-contrast-500 shadow-sm transition-colors hover:border-foreground hover:text-foreground"
            href="/mykitchen/cabinets/assembled"
          >
            New to assembled?
            <span className="font-semibold text-foreground">Watch the explainer ▶</span>
          </Link>
        }
        title="Assembled Kitchen Cabinets"
        tone="black"
      />
      {/* The row of program promises under the hero, as on the category pages. */}
      <CategoryPoints
        points={[
          { icon: 'clock', label: 'Save Time' },
          { icon: 'price', label: 'Save Money' },
          { icon: 'thumbs', label: 'Hassle-Free' },
          { icon: 'plywood', label: 'All-Plywood Semi-Custom' },
          { icon: 'shield', label: 'CARB2 Compliant' },
        ]}
      />
      <CabinetLineFilter
        className="pt-8 @4xl:pt-10"
        descriptions={CABINET_LINE_COPY.assembled}
        hrefFor={(slug) =>
          slug ? `/cabinets/assembled-cabinets?line=${slug}` : '/cabinets/assembled-cabinets'
        }
        options={cabinetLineOptions(lines)}
        selected={selectedLine}
        total={lines.length}
      />
      {/* The grey band meets the filter's rule; the cards start a little lower inside it. */}
      <CabinetLines
        className="pt-6 @4xl:pt-8"
        lines={filterCabinetLines(lines, selectedLine)}
        program="assembled"
      />
      <CabinetFaq data={faq} />
    </>
  );
}
