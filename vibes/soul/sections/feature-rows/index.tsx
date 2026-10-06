import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

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
  className?: string;
}

// Images are `unoptimized` because collection photos come from the store's own domain, which is
// not on the image-optimizer allowlist (same as the collection cards).
// Alternating photo / copy rows — "Find your style", "Our cabinet lines". Each row can carry a
// strip of door tiles (the collections in that style) and a button.
export function FeatureRows({ id, kicker, title, description, rows, cta, tint, className }: Props) {
  return (
    <HomeSection
      className={className}
      description={description}
      id={id}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <div className="flex flex-col gap-6 @3xl:gap-8">
        {rows.map((row, index) => {
          const flip = index % 2 === 1;

          return (
            <article
              className="grid items-center gap-6 overflow-hidden rounded-3xl border border-contrast-100 bg-white @3xl:grid-cols-2 @3xl:gap-10"
              key={row.title}
            >
              <div
                className={clsx(
                  'relative aspect-[4/3] bg-contrast-100 @3xl:aspect-auto @3xl:h-full @3xl:min-h-[360px]',
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
              <div
                className={clsx(
                  'px-6 pb-7 @3xl:py-8 @3xl:pl-0 @3xl:pr-10',
                  flip && '@3xl:order-1 @3xl:pl-10 @3xl:pr-0',
                )}
              >
                {Boolean(row.kicker) && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-contrast-400">
                    {row.kicker}
                  </p>
                )}
                <h3 className="font-heading text-xl font-bold leading-tight @xl:text-2xl">
                  {row.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
                  {row.description}
                </p>
                {row.tiles != null && row.tiles.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-contrast-400">
                      {row.tilesLabel ?? 'Collections'}
                    </p>
                    <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] @3xl:mx-0 @3xl:px-0 [&::-webkit-scrollbar]:hidden">
                      {row.tiles.map((tile) => (
                        <Link
                          className="group w-[7.5rem] shrink-0"
                          href={tile.href}
                          key={tile.name}
                        >
                          <span className="relative block aspect-square overflow-hidden rounded-2xl bg-contrast-100 ring-1 ring-contrast-100">
                            {tile.image ? (
                              <Image
                                alt={tile.image.alt}
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                fill
                                sizes="120px"
                                src={tile.image.src}
                                unoptimized
                              />
                            ) : (
                              <MediaPlaceholder label={tile.name} />
                            )}
                          </span>
                          <span className="mt-2 block text-sm font-semibold leading-tight">
                            {tile.name}
                          </span>
                          <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--button-primary-background,#d90716)]">
                            {row.tileCtaLabel ?? 'Shop this look'}
                            <ArrowRight
                              className="transition-transform group-hover:translate-x-0.5"
                              size={12}
                              strokeWidth={2.5}
                            />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {row.action != null && (
                  <div className="mt-6">
                    <ButtonLink
                      href={row.action.href}
                      shape="pill"
                      size="small"
                      variant="secondary"
                    >
                      {row.action.label}
                    </ButtonLink>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
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
