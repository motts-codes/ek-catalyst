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
  columns?: 2 | 3 | 4 | 5;
  /** Hide the image area (text-only reasons-to-believe cards get an accent bar instead). */
  hideImages?: boolean;
  /**
   * 'inset' (default) keeps the photo inside the card padding; 'bleed' runs it edge to edge;
   * 'plain' drops the card chrome: a taller (7:5) rounded photo with the copy straight beneath it.
   */
  imageStyle?: 'inset' | 'bleed' | 'plain';
  tint?: boolean;
  className?: string;
}

// A row of equal cards — inset photo (or an accent bar), heading, one line, a button — with a
// gentle lift on hover. Used for "Three ways to be sure", the Pro audience cards, the spec shelf,
// the four lines and the quality grid.
export function CardsRow({
  kicker,
  title,
  description,
  cards,
  columns = 3,
  hideImages = false,
  imageStyle = 'inset',
  tint = false,
  className,
}: Props) {
  const bleed = imageStyle === 'bleed' && !hideImages;
  const plain = imageStyle === 'plain' && !hideImages;

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
          'grid gap-6',
          {
            2: '@xl:grid-cols-2',
            3: '@lg:grid-cols-2 @3xl:grid-cols-3',
            4: '@lg:grid-cols-2 @3xl:grid-cols-4',
            5: '@lg:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-5',
          }[columns],
        )}
      >
        {cards.map((card) => (
          <article
            className={clsx(
              'flex h-full flex-col',
              plain
                ? 'group'
                : 'overflow-hidden rounded-3xl border border-contrast-100 bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]',
            )}
            key={card.title}
          >
            {bleed && (
              <div className="relative aspect-[16/10] overflow-hidden bg-contrast-100">
                {card.image ? (
                  <Image
                    alt={card.image.alt}
                    className="object-cover"
                    fill
                    sizes="(min-width: 56rem) 25vw, 100vw"
                    src={card.image.src}
                  />
                ) : (
                  <MediaPlaceholder label={card.imageLabel ?? card.title} />
                )}
              </div>
            )}
            <div className={clsx('flex flex-1 flex-col', plain ? 'p-0' : 'p-6 @xl:p-7')}>
              {hideImages && (
                <span
                  aria-hidden
                  className="mb-5 block h-0.5 w-10 rounded-full bg-[var(--button-primary-background,#d90716)]"
                />
              )}
              {!hideImages && !bleed && (
                <div
                  className={clsx(
                    'relative mb-6 overflow-hidden bg-contrast-100',
                    plain ? 'aspect-[4/3] rounded-3xl' : 'aspect-[16/10] rounded-2xl',
                  )}
                >
                  {card.image ? (
                    <Image
                      alt={card.image.alt}
                      className={clsx(
                        'object-cover',
                        plain &&
                          'transition-transform duration-700 ease-smooth group-hover:scale-[1.03]',
                      )}
                      fill
                      sizes="(min-width: 56rem) 33vw, 100vw"
                      src={card.image.src}
                    />
                  ) : (
                    <MediaPlaceholder label={card.imageLabel ?? card.title} />
                  )}
                </div>
              )}
              <h3 className="font-heading text-lg font-semibold leading-tight @xl:text-xl">
                {card.title}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-contrast-500">
                {card.description}
              </p>
              {Boolean(card.ctaLabel) && Boolean(card.href) && (
                <div className="mt-6">
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
