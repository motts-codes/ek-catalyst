'use client';

import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { type ProgramCard } from '@/vibes/soul/sections/program-cards';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

interface Props {
  kicker?: string;
  title?: string;
  /** Text link on the right of the heading, e.g. "Not sure? Talk to a designer →". */
  helper?: { label: string; href: string };
  /** Two programs: the first is expanded by default. */
  cards: ProgramCard[];
  footnote?: string;
  tint?: boolean;
  className?: string;
}

// "Assembled or RTA?" as two photo panels side by side. One is open — title, a line, the proof
// points and a button over the photo — and the other sits narrower showing just its name. Hover
// (or keyboard focus, or a tap on touch) opens the other and the first slides narrower. On phones
// both stack, open. Text sits on a dark scrim so it reads on any photo.
export function ProgramSplit({
  kicker = 'Make the right call for your timeline',
  title = 'Assembled or RTA?',
  helper,
  cards,
  footnote,
  tint = false,
  className,
}: Props) {
  const [active, setActive] = useState(0);

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
            className="text-sm font-semibold text-foreground transition-colors hover:text-[var(--button-primary-background,#d90716)]"
            href={helper.href}
          >
            {helper.label}
          </Link>
        )}
      </div>

      <div
        className="flex flex-col gap-3 @3xl:h-[520px] @3xl:flex-row"
        onMouseLeave={() => setActive(0)}
      >
        {cards.map((card, index) => {
          const open = index === active;

          return (
            <article
              aria-label={card.title}
              className={clsx(
                'group/panel relative overflow-hidden rounded-3xl bg-contrast-100 text-white transition-[flex-grow] duration-500 ease-smooth motion-reduce:transition-none',
                // Flex-grow is what animates: the open panel takes the larger share.
                open ? '@3xl:grow-[1.65]' : '@3xl:grow',
                'grow basis-auto @3xl:basis-0',
              )}
              key={card.title}
              onFocus={() => setActive(index)}
              onMouseEnter={() => setActive(index)}
              onTouchStart={() => setActive(index)}
            >
              {card.image ? (
                <Image
                  alt={card.image.alt}
                  className="object-cover transition-transform duration-700 ease-smooth group-hover/panel:scale-[1.03]"
                  fill
                  sizes="(min-width: 56rem) 60vw, 100vw"
                  src={card.image.src}
                />
              ) : (
                <MediaPlaceholder className="absolute inset-0" label={`${card.title} kitchen`} />
              )}
              {/* Scrim: heavy at the bottom for the open panel's copy, lighter at the top for the
                  collapsed label. Both always present so the crossfade is calm. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35"
              />

              {/* Collapsed label, top-left. Fades out as the panel opens. */}
              <p
                aria-hidden
                className={clsx(
                  'absolute left-6 top-6 font-heading text-lg font-bold drop-shadow transition-opacity duration-300 @xl:text-xl',
                  open ? 'opacity-0 @3xl:opacity-0' : 'opacity-0 @3xl:opacity-100',
                )}
              >
                {card.title}
              </p>

              {/* Open content, bottom-left. On phones it sits in normal flow (the panel grows to
                  fit it, with room for the photo above); from @3xl it's pinned to the bottom. */}
              <div
                className={clsx(
                  'relative p-6 pt-40 transition-[opacity,transform] duration-500 ease-smooth @xl:p-8 @xl:pt-44 @3xl:absolute @3xl:inset-x-0 @3xl:bottom-0 @3xl:pt-0',
                  open
                    ? 'translate-y-0 opacity-100'
                    : 'opacity-100 @3xl:translate-y-3 @3xl:opacity-0',
                )}
              >
                <div className="max-w-md">
                  {Boolean(card.tag) && (
                    <span className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/30 backdrop-blur-sm">
                      {card.tag}
                    </span>
                  )}
                  <h3 className="font-heading text-2xl font-bold leading-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.4)] @xl:text-3xl">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/90 @xl:text-base">
                    {card.description}
                  </p>
                  {card.points.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {card.points.map((point) => (
                        <li className="flex items-start gap-2" key={point}>
                          <Check
                            aria-hidden
                            className="mt-0.5 shrink-0 text-white"
                            size={16}
                            strokeWidth={2.5}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-5">
                    <ButtonLink href={card.href} shape="pill" size="small" variant="primary">
                      {card.ctaLabel}
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {Boolean(footnote) && (
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-contrast-500">{footnote}</p>
      )}
    </HomeSection>
  );
}
