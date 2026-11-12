import { clsx } from 'clsx';
import { Check } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface ProgramCard {
  title: string;
  /** Short badge above the title, e.g. "Most hands-off". */
  tag?: string;
  description?: string;
  /** Tick-list proof points. */
  points: string[];
  ctaLabel: string;
  href: string;
  /** A second, outline button beside the first. */
  secondary?: { label: string; href: string };
  image?: { src: string; alt: string };
}

interface Props {
  kicker?: string;
  title?: string;
  /** Text link on the right of the heading, e.g. "Not sure? Talk to a designer →". */
  helper?: { label: string; href: string };
  cards: ProgramCard[];
  /** One line under the cards. */
  footnote?: string;
  tint?: boolean;
  /**
   * 'tint': inset photo on soft blush / blue cards (default). 'bold': the photo bleeds to the
   * card's edges on top, and the copy sits on brand red (first card) and near-black (second),
   * in white.
   */
  palette?: 'tint' | 'bold';
  className?: string;
}

// Alternating soft tints so the two programs read as a pair, not a duplicate.
const CARD_TINTS = ['bg-[#fbf4ef]', 'bg-[#eef3fb]'];
// The bold pair: EK red, then near-black.
const CARD_BOLD = ['bg-[#9f3632]', 'bg-[#141414]'];

// Buttons on a dark card: white lead button with dark text, white outline second button.
const BOLD_PRIMARY_BUTTON =
  'border-white bg-white text-foreground after:!bg-foreground hover:!text-white focus-visible:ring-white focus-visible:ring-offset-[#9f3632] [&>span]:mix-blend-normal';
const BOLD_OUTLINE_BUTTON =
  'transition-colors [--button-ghost-background-hover:white] [--button-ghost-border:rgb(255_255_255/0.45)] [--button-ghost-text:white] hover:[--button-ghost-border:white] hover:[--button-ghost-text:hsl(var(--foreground))] focus-visible:ring-white';
const TINT_OUTLINE_BUTTON =
  'transition-colors [--button-ghost-background-hover:hsl(var(--foreground))] [--button-ghost-border:hsl(var(--foreground))] hover:[--button-ghost-text:white]';

// "Assembled or RTA?" — the program decision as two generous cards: inset photo, tag pill, title,
// one paragraph, ticked proofs and a shop button. Used on the home page, the Cabinets landing and
// the Pro page so the decision looks identical wherever it appears.
export function ProgramCards({
  kicker = 'Make the right call for your timeline',
  title = 'Assembled or RTA?',
  helper,
  cards,
  footnote,
  tint = false,
  palette = 'tint',
  className,
}: Props) {
  const bold = palette === 'bold';

  return (
    <HomeSection className={className} tint={tint}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 @4xl:mb-8">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
            {kicker}
          </p>
          <h2 className={homeHeadingClassName}>{title}</h2>
        </div>
        {helper && (
          <Link
            className="text-sm font-semibold underline underline-offset-4 hover:text-[var(--button-primary-background,#d90716)]"
            href={helper.href}
          >
            {helper.label}
          </Link>
        )}
      </div>

      <div className="grid gap-6 @3xl:grid-cols-2">
        {cards.map((card, index) => (
          <article
            className={clsx(
              'flex flex-col overflow-hidden rounded-3xl',
              bold ? clsx('text-white', CARD_BOLD[index % CARD_BOLD.length]) : 'p-6 @xl:p-8',
              !bold && CARD_TINTS[index % CARD_TINTS.length],
            )}
            key={card.title}
          >
            <div
              className={clsx(
                'relative overflow-hidden',
                bold ? 'aspect-[16/9] bg-black/20' : 'aspect-[16/9] rounded-2xl bg-white/60',
              )}
            >
              {card.image ? (
                <Image
                  alt={card.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 56rem) 45vw, 100vw"
                  src={card.image.src}
                />
              ) : (
                <MediaPlaceholder label={card.title} />
              )}
              {Boolean(card.tag) && (
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
                  {card.tag}
                </span>
              )}
            </div>
            <div className={clsx('flex grow flex-col', bold && 'p-6 @xl:p-8')}>
              <h3
                className={clsx(
                  'font-heading text-xl font-semibold leading-tight @xl:text-2xl',
                  !bold && 'mt-6',
                )}
              >
                {card.title}
              </h3>
              <p
                className={clsx(
                  'mt-3 max-w-prose text-sm leading-relaxed @xl:text-base',
                  bold ? 'text-white/85' : 'text-contrast-500',
                )}
              >
                {card.description}
              </p>
              {card.points.length > 0 && (
                <ul className="mt-5 grid gap-x-6 gap-y-2.5 text-sm @7xl:grid-cols-2">
                  {card.points.map((point) => (
                    <li className={clsx('flex items-start', bold ? 'gap-2' : 'gap-3')} key={point}>
                      {/* Bold cards use the bare check from the home RTA/assembled split; tint keeps the disc. */}
                      {bold ? (
                        <Check
                          aria-hidden
                          className="mt-0.5 shrink-0 text-white"
                          size={16}
                          strokeWidth={2.5}
                        />
                      ) : (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] text-white">
                          <Check aria-hidden size={12} strokeWidth={3} />
                        </span>
                      )}
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
                <ButtonLink
                  className={clsx(bold && BOLD_PRIMARY_BUTTON)}
                  href={card.href}
                  shape="pill"
                  size="small"
                  variant={bold ? 'secondary' : 'primary'}
                >
                  {card.ctaLabel}
                </ButtonLink>
                {card.secondary != null && (
                  <ButtonLink
                    className={bold ? BOLD_OUTLINE_BUTTON : TINT_OUTLINE_BUTTON}
                    href={card.secondary.href}
                    shape="pill"
                    size="small"
                    variant="ghost"
                  >
                    {card.secondary.label}
                  </ButtonLink>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {Boolean(footnote) && (
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-contrast-500">{footnote}</p>
      )}
    </HomeSection>
  );
}
