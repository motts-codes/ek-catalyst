import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

export interface RowCard {
  title: string;
  /** A small grey line under the title ("Framed · RTA or assembled"). */
  meta?: string;
  description: string;
  ctaLabel?: string;
  href?: string;
  /** Primary (red) button instead of the default outline. */
  primary?: boolean;
  image?: { src: string; alt: string };
  /** Placeholder caption shown until a photo is supplied. */
  imageLabel?: string;
  /** Text-only cards (`hideImages`): a red icon in a pale disc in place of the accent bar. */
  icon?: LucideIcon;
  /** `red`: this card's title in brand red (overrides the row's `cardTitleTone`). */
  titleTone?: 'default' | 'red';
}

interface Props {
  kicker?: string;
  title?: string;
  description?: string;
  cards: RowCard[];
  columns?: 2 | 3 | 4 | 5;
  /** Hide the image area (text-only reasons-to-believe cards get an accent bar instead). */
  hideImages?: boolean;
  /** With `hideImages`: a big red number (1, 2, 3…) in place of the accent bar. */
  numbered?: boolean;
  /**
   * 'inset' (default) keeps the photo inside the card padding; 'bleed' runs it edge to edge;
   * 'plain' drops the card chrome: a wide (5:3) rounded photo with the copy straight beneath it.
   */
  imageStyle?: 'inset' | 'bleed' | 'plain';
  tint?: boolean;
  /** `red`: the band on brand red, the copy reversed to white (plain photo cards). */
  tone?: 'default' | 'red';
  /** `red`: just the section title in brand red. */
  titleTone?: 'default' | 'red';
  /** `red`: each card's title in brand red. */
  cardTitleTone?: 'default' | 'red';
  /**
   * `red`: each card is a deep-red panel with white copy (the "ek red box" look).
   * `alternate`: the cards checker between that deep red and a light-red panel (red, light,
   * red / light, red, light on three columns; red, light, red… down a phone).
   */
  cardTone?: 'default' | 'red' | 'alternate';
  /** A thin brand-red hairline at half opacity around each white card instead of the grey one. */
  cardBorder?: 'default' | 'red';
  className?: string;
}

// A row of equal cards — inset photo (or an accent bar), heading, one line, a button — with a
// gentle lift on hover. Store-hosted photos (absolute URLs) skip the Next optimizer, which only
// knows the CDN hosts. Used for "Three ways to be sure", the Pro audience cards, the spec shelf,
// the four lines and the quality grid.
export function CardsRow({
  kicker,
  title,
  description,
  cards,
  columns = 3,
  hideImages = false,
  numbered = false,
  imageStyle = 'inset',
  tint = false,
  tone = 'default',
  titleTone = 'default',
  cardTitleTone = 'default',
  cardTone = 'default',
  cardBorder = 'default',
  className,
}: Props) {
  const bleed = imageStyle === 'bleed' && !hideImages;
  const plain = imageStyle === 'plain' && !hideImages;
  const insetImage = !hideImages && !bleed;
  // Deep brand red (#9F3632): white copy is 6.9:1 on it. Alternating rows put the even cards
  // on red and the odd ones on the light-red panel (#fdf3f5).
  const surfaceOf = (i: number): 'red' | 'light' | 'white' => {
    if (cardTone === 'red') return 'red';
    if (cardTone === 'alternate') return i % 2 === 0 ? 'red' : 'light';

    return 'white';
  };
  const whiteCard =
    cardBorder === 'red'
      ? 'border-[0.5px] border-[#d90716]/50 bg-white'
      : 'border-contrast-100 bg-white';
  const SURFACE = {
    red: 'border-transparent bg-[#9f3632]',
    light: 'border-transparent bg-[#fdf3f5]',
    white: whiteCard,
  };
  const cardClassName = (surface: 'red' | 'light' | 'white') =>
    plain
      ? 'group'
      : clsx(
          'overflow-hidden rounded-3xl border transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]',
          SURFACE[surface],
        );

  return (
    <HomeSection
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
      titleTone={titleTone}
      tone={tone}
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
        {cards.map((card, i) => {
          const surface = surfaceOf(i);
          const reversed = tone === 'red' || surface === 'red';

          return (
            <article
              className={clsx('flex h-full flex-col', cardClassName(surface))}
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
                      unoptimized={card.image.src.startsWith('http')}
                    />
                  ) : (
                    <MediaPlaceholder label={card.imageLabel ?? card.title} />
                  )}
                </div>
              )}
              <div className={clsx('flex flex-1 flex-col', plain ? 'p-0' : 'p-6 @xl:p-7')}>
                {hideImages && (
                  <CardLead
                    icon={card.icon}
                    number={numbered ? i + 1 : undefined}
                    onLight={surface === 'light'}
                    onRed={surface === 'red'}
                  />
                )}
                {insetImage && (
                  <div
                    className={clsx(
                      'relative mb-6 overflow-hidden bg-contrast-100',
                      plain ? 'aspect-[5/3] rounded-t-3xl' : 'aspect-[16/10] rounded-2xl',
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
                        unoptimized={card.image.src.startsWith('http')}
                      />
                    ) : (
                      <MediaPlaceholder label={card.imageLabel ?? card.title} />
                    )}
                  </div>
                )}
                <h3 className={cardTitleClassName(reversed, card.titleTone ?? cardTitleTone)}>
                  {card.title}
                </h3>
                {card.meta != null && (
                  <p className="mt-1 text-xs font-semibold text-[var(--button-primary-background,#d90716)]">
                    {card.meta}
                  </p>
                )}
                <p
                  className={clsx(
                    'mt-2.5 flex-1 text-sm leading-relaxed',
                    reversed ? 'text-white' : 'text-contrast-500',
                  )}
                >
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
          );
        })}
      </div>
    </HomeSection>
  );
}

// What tops a text-only card: a big red number when the row is numbered, an icon in a pale
// red disc when the card has one, else the short red accent bar.
function CardLead({
  icon: Icon,
  number,
  onRed = false,
  onLight = false,
}: {
  icon?: LucideIcon;
  number?: number;
  /** On a red card: a white icon in a translucent disc, a white number. */
  onRed?: boolean;
  /** On a light-red card: the red icon sits in a white disc so it still reads as a disc. */
  onLight?: boolean;
}) {
  if (Icon) {
    return (
      <span
        className={clsx(
          'mb-4 flex size-12 items-center justify-center rounded-full',
          onRed && 'bg-white/15 text-white',
          onLight && 'bg-white text-[var(--button-primary-background,#d90716)]',
          !onRed && !onLight && 'bg-[#fdf3f5] text-[var(--button-primary-background,#d90716)]',
        )}
      >
        <Icon aria-hidden size={24} strokeWidth={2} />
      </span>
    );
  }

  if (number != null) {
    return (
      <span
        className={clsx(
          'mb-3 block font-heading text-4xl font-bold leading-none',
          onRed ? 'text-white' : 'text-[var(--button-primary-background,#d90716)]',
        )}
      >
        {number}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="mb-5 block h-0.5 w-10 rounded-full bg-[var(--button-primary-background,#d90716)]"
    />
  );
}

function cardTitleClassName(reversed: boolean, tone: 'default' | 'red'): string {
  return clsx(
    'font-heading text-lg font-semibold leading-tight @xl:text-xl',
    reversed && 'text-white',
    !reversed && tone === 'red' && 'text-[var(--button-primary-background,#d90716)]',
  );
}
