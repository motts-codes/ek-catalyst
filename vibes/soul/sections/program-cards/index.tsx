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

// "Assembled or RTA?" — the program decision as two side-by-side cards: photo, tag, title, one
// paragraph, two proofs and a shop button. Used on the home page and the Cabinets landing so the
// decision looks identical wherever it appears.
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

      <div className="grid gap-5 @3xl:grid-cols-2">
        {cards.map((card) => (
          <article
            className="grid overflow-hidden rounded-2xl border border-contrast-100 bg-white @md:grid-cols-[38%_1fr]"
            key={card.title}
          >
            <div className="relative aspect-[4/3] @md:aspect-auto @md:min-h-[260px]">
              {card.image ? (
                <Image
                  alt={card.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 56rem) 20vw, 100vw"
                  src={card.image.src}
                />
              ) : (
                <MediaPlaceholder label={card.title} />
              )}
            </div>
            <div className="flex flex-col p-5 @xl:p-6">
              {Boolean(card.tag) && (
                <span className="self-start rounded-full border border-contrast-200 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-contrast-500">
                  {card.tag}
                </span>
              )}
              <h3 className="mt-3 font-heading text-xl font-semibold leading-tight @xl:text-2xl">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-contrast-500">{card.description}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {card.points.map((point) => (
                  <li className="flex items-start gap-2" key={point}>
                    <Check
                      aria-hidden
                      className="mt-0.5 shrink-0 text-[var(--button-primary-background,#d90716)]"
                      size={16}
                      strokeWidth={2.5}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                <ButtonLink href={card.href} shape="pill" size="small" variant="primary">
                  {card.ctaLabel}
                </ButtonLink>
              </div>
            </div>
          </article>
        ))}
      </div>

      {Boolean(footnote) && (
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-contrast-500">{footnote}</p>
      )}
    </HomeSection>
  );
}
