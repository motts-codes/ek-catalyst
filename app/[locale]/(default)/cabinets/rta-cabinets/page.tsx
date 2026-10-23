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
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-contrast-200 bg-white px-4 py-2 text-sm text-contrast-500 shadow-sm transition-colors hover:border-foreground hover:text-foreground"
            href="/mykitchen/cabinets/rta"
          >
            New to RTA?
            <span className="font-semibold text-foreground">Watch the explainer ▶</span>
          </Link>
        }
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
