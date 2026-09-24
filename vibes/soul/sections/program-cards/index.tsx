import { clsx } from 'clsx';
import { Check } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface ProgramCard {
  title: string;
  /** Short badge above the title, e.g. "Most hands-off". */
  tag?: string;
  description: string;
  /** Tick-list proof points. */
  points: string[];
  ctaLabel: string;
  href: string;
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
  className?: string;
}

// Alternating soft tints so the two programs read as a pair, not a duplicate.
const CARD_TINTS = ['bg-[#fbf4ef]', 'bg-[#eef3fb]'];

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
  className,
}: Props) {
  return (
    <HomeSection className={className} tint={tint}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 @4xl:mb-8">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-contrast-400">
            {kicker}
          </p>
          <h2 className="font-heading text-2xl font-medium leading-tight @xl:text-3xl @4xl:text-4xl">
            {title}
          </h2>
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
              'flex flex-col rounded-3xl p-6 @xl:p-8',
              CARD_TINTS[index % CARD_TINTS.length],
            )}
            key={card.title}
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-white/60">
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
            <h3 className="mt-6 font-heading text-2xl font-semibold leading-tight @xl:text-3xl">
              {card.title}
            </h3>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-contrast-500 @xl:text-base">
              {card.description}
            </p>
            {card.points.length > 0 && (
              <ul className="mt-5 space-y-2.5 text-sm">
                {card.points.map((point) => (
                  <li className="flex items-start gap-3" key={point}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] text-white">
                      <Check aria-hidden size={12} strokeWidth={3} />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto pt-7">
              <ButtonLink href={card.href} shape="pill" size="small" variant="primary">
                {card.ctaLabel}
              </ButtonLink>
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
