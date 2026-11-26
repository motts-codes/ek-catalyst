import { ArrowRight, BookOpen } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetFilterPanel } from '@/vibes/soul/sections/cabinet-filter-panel';
import { CabinetLineFilter } from '@/vibes/soul/sections/cabinet-line-filter';
import { CabinetLines } from '@/vibes/soul/sections/cabinet-lines';
import { ListingFiltersProvider } from '@/vibes/soul/sections/cabinet-lines/filters-visibility';
import { CabinetProgramContentSection } from '@/vibes/soul/sections/cabinet-program-content';
import { CategoryHero } from '@/vibes/soul/sections/category-hero';
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
  title: 'RTA Kitchen Cabinets',
  description:
    'Ready-to-assemble kitchen cabinets at a lower price, shipped flat in about two weeks. Shaker, modern and traditional doors, all-plywood boxes, first two door samples free.',
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
          // A frosted-glass chip, top-right of the photo, to the guide page; it grows leftwards on hover.
          <Link
            aria-label="New to RTA? RTA explained"
            className="group inline-flex items-center gap-2 rounded-full bg-black/25 py-1.5 pl-3 pr-3.5 text-xs text-white shadow-sm ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-black/40"
            href="/mykitchen/what-are-rta-cabinets"
          >
            <BookOpen size={15} strokeWidth={2} />
            {/* "New to RTA" at rest; on hover it crossfades to "RTA explained". Both sit in
                the same grid cell so the chip keeps one width. */}
            <span className="grid font-semibold">
              <span className="col-start-1 row-start-1 whitespace-nowrap transition-[opacity,transform] duration-300 ease-smooth group-hover:-translate-y-1 group-hover:opacity-0 motion-reduce:transition-none">
                New to RTA?
              </span>
              <span
                aria-hidden
                className="col-start-1 row-start-1 translate-y-1 whitespace-nowrap opacity-0 transition-[opacity,transform] duration-300 ease-smooth group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none"
              >
                RTA explained
              </span>
            </span>
            <ArrowRight size={14} strokeWidth={2.25} />
          </Link>
        }
        imageOverlayPosition="top-right"
        promises={[
          { icon: 'price', label: 'Save Money' },
          { icon: 'wrench', label: 'Easy to Assemble' },
          { icon: 'plywood', label: 'All-Plywood' },
          { icon: 'shield-house', label: 'CARB2 Compliant' },
          { icon: 'hammer', label: 'DIY Friendly' },
        ]}
        promisesAction={{ label: 'How it’s built', href: '#about-rta' }}
        tall
        title="Your dream kitchen, for less"
        tone="deep-red"
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
      {/* The long-form content (Star vs Euro Max, build quality, styles, why Express Kitchens). */}
      {CABINET_PROGRAM_CONTENT.rta != null && (
        <CabinetProgramContentSection content={CABINET_PROGRAM_CONTENT.rta} id="about-rta" />
      )}
      <CabinetFaq data={faq} />
    </>
  );
}
