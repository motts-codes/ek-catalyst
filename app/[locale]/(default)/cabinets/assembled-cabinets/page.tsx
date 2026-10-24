import { ArrowRight, BookOpen } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetFilterPanel } from '@/vibes/soul/sections/cabinet-filter-panel';
import { CabinetLineFilter } from '@/vibes/soul/sections/cabinet-line-filter';
import { CabinetLines } from '@/vibes/soul/sections/cabinet-lines';
import { ListingFiltersProvider } from '@/vibes/soul/sections/cabinet-lines/filters-visibility';
import { CabinetProgramContentSection } from '@/vibes/soul/sections/cabinet-program-content';
import { CategoryHero, CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';
import { CABINET_LINE_COPY } from '~/lib/cabinets/cabinet-line-copy';
import {
  cabinetLineOptions,
  getCabinetLines,
  getCabinetProgramFaq,
} from '~/lib/cabinets/cabinet-lines-data';
import {
  applyLineFilters,
  hasPanelFilters,
  lineFilterGroups,
  lineFilterHref,
  lineTabHref,
  panelOpen,
  panelToggleHref,
  parseLineFilters,
} from '~/lib/cabinets/cabinet-lines-filter';
import { CABINET_PROGRAM_CONTENT } from '~/lib/cabinets/program-content';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
  const query = await searchParams;
  const filters = parseLineFilters(query);
  const selectedLine = filters.line;
  const showPanel = panelOpen(query, filters);

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
        // Brand red, like the other category pages.
        description="Assembled and finished in our factory. Choose framed or frameless cabinets in shaker, modern and traditional styles, in 100+ colors, stains and finishes. Most collections ship in 3 weeks."
        eyebrow="Assembled Kitchen Cabinets"
        image={{
          src: '/images/home/programs/assembled.webp',
          alt: 'A finished kitchen in sage-green shaker cabinets with a white quartz island and black pendants',
        }}
        imageOverlay={
          // A frosted-glass chip, top-right of the photo, to the guide page; it grows leftwards on hover.
          <Link
            aria-label="Assembled explained"
            className="group inline-flex items-center gap-2 rounded-full bg-black/25 py-1.5 pl-3 pr-3.5 text-xs text-white shadow-sm ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-black/40"
            href="/mykitchen/cabinets/assembled"
          >
            <BookOpen size={15} strokeWidth={2} />
            <span className="font-semibold">
              Assembled
              {/* "explained" slides open on hover. */}
              <span
                aria-hidden
                className="inline-block max-w-0 overflow-hidden whitespace-nowrap align-bottom opacity-0 transition-[max-width,opacity,padding] duration-300 ease-smooth group-hover:max-w-[9ch] group-hover:pl-1 group-hover:opacity-100 motion-reduce:transition-none"
              >
                explained
              </span>
            </span>
            <ArrowRight size={14} strokeWidth={2.25} />
          </Link>
        }
        imageOverlayPosition="top-right"
        title="The kitchen you pictured, ready to install"
        tone="red"
      />
      {/* The row of program promises under the hero, as on the category pages. */}
      <CategoryPoints
        action={{ label: 'See how they’re built', href: '#about-assembled' }}
        points={[
          { icon: 'clock', label: 'Save Time' },
          { icon: 'price', label: 'Save Money' },
          { icon: 'thumbs', label: 'Hassle-Free' },
          { icon: 'plywood', label: 'All-Plywood Semi-Custom' },
          { icon: 'shield', label: 'CARB2 Compliant' },
        ]}
      />
      <ListingFiltersProvider open={showPanel}>
        <CabinetLineFilter
          className="pt-8 @4xl:pt-10"
          descriptions={CABINET_LINE_COPY.assembled}
          hrefFor={(slug) => lineTabHref('/cabinets/assembled-cabinets', query, slug)}
          options={cabinetLineOptions(lines)}
          panelToggle={{
            href: panelToggleHref('/cabinets/assembled-cabinets', query, !showPanel),
            open: showPanel,
          }}
          selected={selectedLine}
          total={lines.length}
        />
        {/* The grey band meets the filter's rule; the cards start a little lower inside it. */}
        <CabinetLines
          aside={
            <CabinetFilterPanel
              groups={lineFilterGroups(lines, filters, '/cabinets/assembled-cabinets', query)}
              resetHref={
                hasPanelFilters(filters)
                  ? lineFilterHref('/cabinets/assembled-cabinets', query, null)
                  : undefined
              }
            />
          }
          className="pt-2 @4xl:pt-3"
          lines={applyLineFilters(lines, filters)}
          program="assembled"
        />
      </ListingFiltersProvider>
      {/* The long-form content (styles, build quality, why Express Kitchens, how to choose). */}
      {CABINET_PROGRAM_CONTENT.assembled != null && (
        <CabinetProgramContentSection
          content={CABINET_PROGRAM_CONTENT.assembled}
          id="about-assembled"
        />
      )}
      <CabinetFaq data={faq} />
    </>
  );
}
