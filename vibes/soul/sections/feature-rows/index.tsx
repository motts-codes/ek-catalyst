import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

import { StackedCards } from './stacked-cards';
import { TileCarousel } from './tile-carousel';

export interface FeatureRowTile {
  name: string;
  href: string;
  image?: { src: string; alt: string };
}

export interface FeatureRow {
  kicker?: string;
  title: string;
  description: string;
  image?: { src: string; alt: string };
  imageLabel?: string;
  action?: { label: string; href: string };
  /** Small door tiles under the copy — the collections that carry this look. */
  tiles?: FeatureRowTile[];
  tilesLabel?: string;
  tileCtaLabel?: string;
}

interface Props {
  id?: string;
  kicker?: string;
  title?: string;
  description?: string;
  rows: FeatureRow[];
  cta?: { label: string; href: string };
  tint?: boolean;
  /** Pin-and-stack the rows as you scroll (GSAP overlay); off = a plain column. */
  stacked?: boolean;
  className?: string;
}

// Images are `unoptimized` because collection photos come from the store's own domain, which is
// not on the image-optimizer allowlist (same as the collection cards).
// Alternating photo / copy rows — "Find your style", "Our cabinet lines". Each row can carry a
// strip of door tiles (the collections in that style) and a button.
export function FeatureRows({
  id,
  kicker,
  title,
  description,
  rows,
  cta,
  tint,
  stacked = false,
  className,
}: Props) {
  const cards = rows.map((row, index) => (
    <FeatureCard flip={index % 2 === 1} key={row.title} row={row} />
  ));

  return (
    <HomeSection
      className={className}
      description={description}
      id={id}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      {stacked ? (
        <StackedCards>{cards}</StackedCards>
      ) : (
        <div className="flex flex-col gap-20 @3xl:gap-28">{cards}</div>
      )}
      {cta != null && (
        <div className="mt-8 flex justify-center">
          <ButtonLink href={cta.href} shape="pill" size="small" variant="secondary">
            {cta.label}
          </ButtonLink>
        </div>
      )}
    </HomeSection>
  );
}

// One row: the photo on one side (taller than before, so the row reads as a card), the copy on
// the other with room around it, the door tiles as a slider.
function FeatureCard({ row, flip }: { row: FeatureRow; flip: boolean }) {
  return (
    <article className="grid items-center overflow-hidden rounded-3xl bg-white shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] @3xl:min-h-[560px] @3xl:grid-cols-2">
      <div
        className={clsx(
          'relative aspect-[4/3] bg-contrast-100 @3xl:aspect-auto @3xl:h-full',
          flip && '@3xl:order-2',
        )}
      >
        {row.image ? (
          <Image
            alt={row.image.alt}
            className="object-cover"
            fill
            sizes="(min-width: 56rem) 50vw, 100vw"
            src={row.image.src}
            unoptimized
          />
        ) : (
          <MediaPlaceholder label={row.imageLabel ?? row.title} />
        )}
      </div>
      {/* The thin red outline sits on the copy half only, open on the side that meets the photo
          (its top on phones, where the photo is above). */}
      <div
        className={clsx(
          'flex flex-col justify-center rounded-b-3xl border border-t-0 border-[#fcb6bb] px-7 py-9 @xl:px-10 @3xl:h-full @3xl:rounded-b-none @3xl:border-t @3xl:py-12 @4xl:px-14',
          flip
            ? '@3xl:order-1 @3xl:rounded-l-3xl @3xl:border-r-0'
            : '@3xl:rounded-r-3xl @3xl:border-l-0',
        )}
      >
        {Boolean(row.kicker) && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
            {row.kicker}
          </p>
        )}
        <h3 className="font-heading text-2xl font-bold leading-tight @xl:text-3xl">{row.title}</h3>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
          {row.description}
        </p>
        {row.tiles != null && row.tiles.length > 0 && (
          <div className="mt-8">
            <TileCarousel
              ctaLabel={row.tileCtaLabel}
              label={row.tilesLabel ?? 'Collections'}
              tiles={row.tiles}
            />
          </div>
        )}
        {row.action != null && (
          <div className="mt-8">
            <ButtonLink href={row.action.href} shape="pill" size="small" variant="secondary">
              {row.action.label}
            </ButtonLink>
          </div>
        )}
      </div>
    </article>
  );
}
