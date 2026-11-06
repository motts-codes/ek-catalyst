import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { OUTLINE_BUTTON } from '@/vibes/soul/sections/page-kit';
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
  /** A short label in a white pill over the photo's top-left corner ("Most popular"). */
  badge?: string;
  /** A price (or similar) set on the title line, pushed to the right edge ("from $2,800"). */
  price?: string;
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
  /** The band opens the page (no hero above): its title is the h1 and it sits under the breadcrumb. */
  opensPage?: boolean;
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
  /**
   * `outline`: the card buttons as the site's outline button (black outline on white and light
   * cards, white outline on red ones) instead of the solid black one. `primary` cards stay red.
   */
  ctaStyle?: 'solid' | 'outline';
  className?: string;
}

// The white outline button for a red card, as on the red box and the closing band.
const OUTLINE_ON_RED_BUTTON =
  'transition-colors [--button-ghost-background-hover:white] [--button-ghost-border:rgb(255_255_255/0.3)] [--button-ghost-text:white] hover:[--button-ghost-border:white] hover:[--button-ghost-text:#9f3632] focus-visible:ring-white focus-visible:ring-offset-[#9f3632]';

// A row of equal cards — inset photo (or an accent bar), heading, one line, a button — with a
// gentle lift on hover. Store-hosted photos (absolute URLs) skip the Next optimizer, which only
// knows the CDN hosts. Used for "Three ways to be sure", the Pro audience cards, the spec shelf,
// the four lines and the quality grid.
// The title line: the title on the left and, when the card has a price, the price on the right
// in the same style.
function CardTitle({
  card,
  className,
  level: Heading = 'h3',
}: {
  card: RowCard;
  className: string;
  /** `h2` when the band opens the page and its own title is the h1. */
  level?: 'h2' | 'h3';
}) {
  if (card.price == null) return <Heading className={className}>{card.title}</Heading>;

  return (
    <div className="flex items-baseline justify-between gap-3">
      <Heading className={className}>{card.title}</Heading>
      <span className={clsx(className, 'shrink-0')}>{card.price}</span>
    </div>
  );
}

// A short label in a white pill over the photo's top-left corner ("Most popular").
function CardBadge({ label }: { label?: string }) {
  if (!label) return null;

  return (
    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)] ring-1 ring-contrast-100">
      {label}
    </span>
  );
}

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
  opensPage = false,
  tone = 'default',
  titleTone = 'default',
  cardTitleTone = 'default',
  cardTone = 'default',
  cardBorder = 'default',
  ctaStyle = 'solid',
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
      headingLevel={opensPage ? 'h1' : 'h2'}
      kicker={kicker}
      openTop={opensPage}
      tint={tint}
      title={title}
      titleTone={titleTone}
      tone={tone}
    >
      <div
        className={clsx(
          'grid gap-6',
          // Checkered cards go straight from one column to three: at two columns the even/odd
          // checker would turn into stripes (red, light / red, light).
          cardTone === 'alternate' && columns === 3
            ? '@3xl:grid-cols-3'
            : {
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
                    <CardBadge label={card.badge} />
                  </div>
                )}
                <CardTitle
                  card={card}
                  className={cardTitleClassName(reversed, card.titleTone ?? cardTitleTone)}
                  level={opensPage ? 'h2' : 'h3'}
                />
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
                      {...ctaProps(card, ctaStyle, surface)}
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

// The card button: red for a `primary` card; otherwise solid black, or the outline button
// (white outline on a red card) when the row asks for `outline`.
function ctaProps(
  card: RowCard,
  ctaStyle: 'solid' | 'outline',
  surface: 'red' | 'light' | 'white',
): { variant: 'primary' | 'secondary' | 'ghost'; className?: string } {
  if (card.primary) return { variant: 'primary' };
  if (ctaStyle === 'solid') return { variant: 'secondary' };

  return {
    variant: 'ghost',
    className: surface === 'red' ? OUTLINE_ON_RED_BUTTON : OUTLINE_BUTTON,
  };
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
