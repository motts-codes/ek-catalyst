import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

export interface RowCard {
  title: string;
  description: string;
  ctaLabel?: string;
  href?: string;
  /** Primary (red) button instead of the default outline. */
  primary?: boolean;
  image?: { src: string; alt: string };
  /** Placeholder caption shown until a photo is supplied. */
  imageLabel?: string;
}

interface Props {
  kicker?: string;
  title?: string;
  description?: string;
  cards: RowCard[];
  columns?: 3 | 4 | 5;
  /** Hide the image area (text-only reasons-to-believe cards). */
  hideImages?: boolean;
  tint?: boolean;
  className?: string;
}

// A row of equal cards — photo, heading, one line, a button. Used for "Three ways to be sure",
// "Start wherever you are", and the reasons-to-believe band.
export function CardsRow({
  kicker,
  title,
  description,
  cards,
  columns = 3,
  hideImages = false,
  tint = false,
  className,
}: Props) {
  return (
    <HomeSection
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <div
        className={clsx(
          'grid gap-5',
          {
            3: '@lg:grid-cols-2 @3xl:grid-cols-3',
            4: '@lg:grid-cols-2 @3xl:grid-cols-4',
            5: '@lg:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-5',
          }[columns],
        )}
      >
        {cards.map((card) => (
          <article
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-contrast-100 bg-white"
            key={card.title}
          >
            {!hideImages && (
              <div className="relative aspect-[16/9] bg-contrast-100">
                {card.image ? (
                  <Image
                    alt={card.image.alt}
                    className="object-cover"
                    fill
                    sizes="(min-width: 56rem) 33vw, 100vw"
                    src={card.image.src}
                  />
                ) : (
                  <MediaPlaceholder label={card.imageLabel ?? card.title} />
                )}
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-lg font-semibold leading-tight">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-contrast-500">
                {card.description}
              </p>
              {Boolean(card.ctaLabel) && Boolean(card.href) && (
                <div className="mt-4">
                  <ButtonLink
                    href={card.href ?? '#'}
                    shape="pill"
                    size="small"
                    variant={card.primary ? 'primary' : 'secondary'}
                  >
                    {card.ctaLabel}
                  </ButtonLink>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </HomeSection>
  );
}
