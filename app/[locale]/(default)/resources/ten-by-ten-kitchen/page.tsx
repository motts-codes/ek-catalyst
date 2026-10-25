import { clsx } from 'clsx';
import { CircleCheck, CircleX } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder, MinimalTable } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { Image } from '~/components/image';
import { SHOWROOMS } from '~/lib/home/home-content';
import {
  TEN_BY_TEN_CLOSING,
  TEN_BY_TEN_COVERS,
  TEN_BY_TEN_FAQ,
  TEN_BY_TEN_HERO,
  TEN_BY_TEN_HOW,
  TEN_BY_TEN_LINES,
  TEN_BY_TEN_LIST,
  TEN_BY_TEN_META,
  TEN_BY_TEN_PAGE_HREF,
} from '~/lib/pages/ten-by-ten-kitchen';

export const metadata: Metadata = TEN_BY_TEN_META;

const RED = 'text-[var(--button-primary-background,#d90716)]';
// The site's outline button: thin black outline, solid black on hover.
const OUTLINE_BUTTON =
  'transition-colors [--button-ghost-background:white] [--button-ghost-background-hover:hsl(var(--foreground))] [--button-ghost-border:hsl(var(--foreground))] hover:[--button-ghost-text:white]';

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
        <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-14">
          <MinimalTable
            columns={TEN_BY_TEN_LIST.columns}
            fit
            inline
            narrow
            rows={TEN_BY_TEN_LIST.rows}
            widths={['w-[76%]', 'w-[12%]']}
          />
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white">
              <Image
                alt={TEN_BY_TEN_HERO.image.alt}
                className="object-contain"
                fill
                sizes="(min-width: 56rem) 40rem, 100vw"
                src={TEN_BY_TEN_HERO.image.src}
              />
            </div>
            <figcaption className="mt-3 text-center text-xs text-contrast-500">
              {TEN_BY_TEN_LIST.renderLabel}
            </figcaption>
          </figure>
        </div>
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

      <HomeSection tint title={TEN_BY_TEN_HOW.title}>
        <ol className="grid gap-8 @3xl:grid-cols-3 @3xl:gap-12">
          {TEN_BY_TEN_HOW.steps.map((step, index) => (
            <li className="flex items-start gap-3" key={step.title}>
              <span className={clsx('font-heading text-sm font-bold leading-6', RED)}>
                0{index + 1}
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold leading-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-contrast-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-3xl rounded-2xl border-l-4 border-[var(--button-primary-background,#d90716)] bg-white px-5 py-4 text-sm leading-relaxed text-foreground">
          <span className="font-semibold">For example: </span>
          {TEN_BY_TEN_HOW.example}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {TEN_BY_TEN_HOW.actions.map((action) => (
            <ButtonLink
              className={action.primary ? undefined : OUTLINE_BUTTON}
              href={action.href}
              key={action.label}
              shape="pill"
              size="small"
              variant={action.primary ? 'primary' : 'ghost'}
            >
              {action.label}
            </ButtonLink>
          ))}
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
        showrooms={SHOWROOMS}
        tint
        title={TEN_BY_TEN_CLOSING.title}
      />
    </>
  );
}
