import { ArrowRight, BookOpen } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetFilterPanel } from '@/vibes/soul/sections/cabinet-filter-panel';
import { CabinetLineFilter } from '@/vibes/soul/sections/cabinet-line-filter';
import { CabinetLines } from '@/vibes/soul/sections/cabinet-lines';
import { ListingFiltersProvider } from '@/vibes/soul/sections/cabinet-lines/filters-visibility';
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

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
  const query = await searchParams;
  const filters = parseLineFilters(query);
  const selectedLine = filters.line;
  const showPanel = panelOpen(query, filters);

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
        // Brand red, like the other category pages.
        description="Quality kitchen cabinets, shipped flat for you to put together and priced lower than assembled. Every one has a plywood box and soft-close doors and drawers, in framed or frameless styles. Star collections ship in 2 weeks."
        eyebrow="RTA Kitchen Cabinets"
        image={{
          src: '/images/home/programs/rta.webp',
          alt: 'A kitchen in dark grey shaker cabinets',
        }}
        imageOverlay={
          // A frosted-glass chip, bottom-left of the photo, to the guide page (a read, not a video).
          <Link
            aria-label="RTA explained"
            className="group inline-flex items-center gap-2 rounded-full bg-black/25 py-1.5 pl-3 pr-3.5 text-xs text-white shadow-sm ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-black/40"
            href="/mykitchen/cabinets/rta"
          >
            <BookOpen size={15} strokeWidth={2} />
            <span className="font-semibold">
              RTA
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
        imageOverlayPosition="bottom-left"
        title="Your dream kitchen, for less"
        tone="red"
      />
      {/* The row of program promises under the hero, as on the category pages. */}
      <CategoryPoints
        points={[
          { icon: 'price', label: 'Save Money' },
          { icon: 'wrench', label: 'Easy to Assemble' },
          { icon: 'plywood', label: 'All-Plywood' },
          { icon: 'shield', label: 'CARB2 Compliant' },
          { icon: 'hammer', label: 'DIY Friendly' },
        ]}
      />
      <ListingFiltersProvider open={showPanel}>
        <CabinetLineFilter
          className="pt-8 @4xl:pt-10"
          descriptions={CABINET_LINE_COPY.rta}
          hrefFor={(slug) => lineTabHref('/cabinets/rta-cabinets', query, slug)}
          options={cabinetLineOptions(lines)}
          panelToggle={{
            href: panelToggleHref('/cabinets/rta-cabinets', query, !showPanel),
            open: showPanel,
          }}
          selected={selectedLine}
          total={lines.length}
        />
        {/* The grey band meets the filter's rule; the cards start a little lower inside it. */}
        <CabinetLines
          aside={
            <CabinetFilterPanel
              groups={lineFilterGroups(lines, filters, '/cabinets/rta-cabinets', query)}
              resetHref={
                hasPanelFilters(filters)
                  ? lineFilterHref('/cabinets/rta-cabinets', query, null)
                  : undefined
              }
            />
          }
          className="pt-2 @4xl:pt-3"
          lines={applyLineFilters(lines, filters)}
          program="rta"
        />
      </ListingFiltersProvider>
      <CabinetFaq data={faq} />
    </>
  );
}
