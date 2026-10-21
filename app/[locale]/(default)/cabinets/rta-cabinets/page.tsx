import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetLineFilter } from '@/vibes/soul/sections/cabinet-line-filter';
import { CabinetLines } from '@/vibes/soul/sections/cabinet-lines';
import { CategoryHero } from '@/vibes/soul/sections/category-hero';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';
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
  title: 'RTA Kitchen Cabinets',
  description:
    'Ready-to-assemble (RTA) cabinets in a range of door styles and finishes at a lower price point.',
};

// RTA (ready-to-assemble) cabinet lines landing page — same view as the Assembled page, driven by
// the child categories' BigCommerce metafields for the RTA program.
export default async function RtaCabinets({ params, searchParams }: Props) {
  const { locale } = await params;
  const lineParam = (await searchParams).line;
  const selectedLine = (Array.isArray(lineParam) ? lineParam[0] : lineParam) || null;

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
        // A program listing is a sub-page of Cabinets, so it takes the subcategory black.
        description="The same cabinets shipped flat from Bristol in two weeks, at a lower price. Pick a collection and finish below."
        image={{
          src: '/images/home/programs/rta.webp',
          alt: 'A kitchen in dark grey shaker cabinets',
        }}
        imageOverlay={
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-contrast-200 bg-white px-4 py-2 text-sm text-contrast-500 shadow-sm transition-colors hover:border-foreground hover:text-foreground"
            href="/mykitchen/cabinets/rta"
          >
            New to RTA?
            <span className="font-semibold text-foreground">Watch the explainer ▶</span>
          </Link>
        }
        title="RTA Kitchen Cabinets"
        tone="black"
      />
      <CabinetLineFilter
        className="pb-2 pt-8 @4xl:pt-10"
        hrefFor={(slug) =>
          slug ? `/cabinets/rta-cabinets?line=${slug}` : '/cabinets/rta-cabinets'
        }
        options={cabinetLineOptions(lines)}
        selected={selectedLine}
        total={lines.length}
      />
      <CabinetLines lines={filterCabinetLines(lines, selectedLine)} program="rta" />
      <CabinetFaq data={faq} />
    </>
  );
}
