import { clsx } from 'clsx';
import {
  CircleCheck,
  CircleX,
  ClipboardCheck,
  LayoutGrid,
  type LucideIcon,
  Ruler,
} from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetMap } from '@/vibes/soul/sections/cabinet-map';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import {
  TEN_BY_TEN_CLOSING,
  TEN_BY_TEN_COVERS,
  TEN_BY_TEN_FAQ,
  TEN_BY_TEN_HERO,
  TEN_BY_TEN_HOW,
  TEN_BY_TEN_LINES,
  TEN_BY_TEN_LIST,
  TEN_BY_TEN_MAP_IMAGES,
  TEN_BY_TEN_MAP_ITEMS,
  TEN_BY_TEN_META,
  TEN_BY_TEN_PAGE_HREF,
} from '~/lib/pages/ten-by-ten-kitchen';

export const metadata: Metadata = TEN_BY_TEN_META;

const RED = 'text-[var(--button-primary-background,#d90716)]';
// The site's outline button on red: white outline, filling white with red text on hover.
const RED_OUTLINE_BUTTON =
  'transition-colors [--button-ghost-background-hover:white] [--button-ghost-border:white] [--button-ghost-text:white] hover:[--button-ghost-text:var(--button-primary-background,#d90716)]';
const HOW_ICONS: Record<(typeof TEN_BY_TEN_HOW.steps)[number]['icon'], LucideIcon> = {
  compare: LayoutGrid,
  scale: Ruler,
  quote: ClipboardCheck,
};

// What a 10×10 kitchen is: the 13 cabinets (from the estimator's data), what the price covers,
// how to scale it to your room, the lines priced from the workbook, FAQ, then the estimator.
export default async function TenByTen({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'What is a 10×10 kitchen', href: TEN_BY_TEN_PAGE_HREF },
        ]}
      />
      <PageHero
        actions={TEN_BY_TEN_HERO.actions}
        description={TEN_BY_TEN_HERO.description}
        image={TEN_BY_TEN_HERO.image}
        imageLabel={TEN_BY_TEN_HERO.imageLabel}
        imageStyle="plain"
        kicker={TEN_BY_TEN_HERO.kicker}
        spacing="roomy"
        title={TEN_BY_TEN_HERO.title}
      />

      <HomeSection
        className="bg-[#fdf3f5]"
        description={TEN_BY_TEN_LIST.description}
        kicker={TEN_BY_TEN_LIST.kicker}
        title={TEN_BY_TEN_LIST.title}
      >
        <CabinetMap images={TEN_BY_TEN_MAP_IMAGES} items={TEN_BY_TEN_MAP_ITEMS} />
      </HomeSection>

      <HomeSection title={TEN_BY_TEN_COVERS.title}>
        <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-14">
          <div>
            <span className="flex size-12 items-center justify-center rounded-full bg-[#e4f3e8] text-[#1f4d2b]">
              <CircleCheck aria-hidden size={24} strokeWidth={2} />
            </span>
            <h3 className="mt-4 font-heading text-lg font-bold">
              {TEN_BY_TEN_COVERS.included.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-contrast-500">
              {TEN_BY_TEN_COVERS.included.body}
            </p>
          </div>
          <div>
            <span
              className={clsx(
                'flex size-12 items-center justify-center rounded-full bg-[#fdf3f5]',
                RED,
              )}
            >
              <CircleX aria-hidden size={24} strokeWidth={2} />
            </span>
            <h3 className="mt-4 font-heading text-lg font-bold">
              {TEN_BY_TEN_COVERS.excluded.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-contrast-500">
              {TEN_BY_TEN_COVERS.excluded.body}
            </p>
            <p className="mt-2 text-xs text-contrast-500">{TEN_BY_TEN_COVERS.excluded.note}</p>
          </div>
        </div>
      </HomeSection>

      <HomeSection>
        <div className="rounded-3xl bg-[var(--button-primary-background,#d90716)] px-6 py-10 text-white @xl:px-10 @3xl:px-14 @3xl:py-14">
          <h2 className="font-heading text-2xl font-bold leading-tight @xl:text-3xl">
            {TEN_BY_TEN_HOW.title}
          </h2>
          <ol className="mt-8 grid gap-8 @3xl:grid-cols-3 @3xl:gap-12">
            {TEN_BY_TEN_HOW.steps.map((step) => {
              const Icon = HOW_ICONS[step.icon];

              return (
                <li key={step.title}>
                  <span className="flex size-12 items-center justify-center rounded-full bg-white/15">
                    <Icon aria-hidden size={24} strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-bold leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white">{step.body}</p>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            {TEN_BY_TEN_HOW.actions.map((action) => (
              <ButtonLink
                className={action.primary ? undefined : RED_OUTLINE_BUTTON}
                href={action.href}
                key={action.label}
                shape="pill"
                size="small"
                variant={action.primary ? 'secondary' : 'ghost'}
              >
                {action.label}
              </ButtonLink>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-white">
            {TEN_BY_TEN_HOW.footnote}
          </p>
        </div>
      </HomeSection>

      <DeliveryLadder
        columns={TEN_BY_TEN_LINES.columns}
        description={TEN_BY_TEN_LINES.description}
        footnote={TEN_BY_TEN_LINES.footnote}
        look="minimal"
        rows={TEN_BY_TEN_LINES.rows}
        title={TEN_BY_TEN_LINES.title}
      />

      <CabinetFaq data={TEN_BY_TEN_FAQ} />

      <ClosingBand
        description={TEN_BY_TEN_CLOSING.description}
        primary={TEN_BY_TEN_CLOSING.primary}
        secondary={TEN_BY_TEN_CLOSING.secondary}
        tint
        title={TEN_BY_TEN_CLOSING.title}
      />
    </>
  );
}
