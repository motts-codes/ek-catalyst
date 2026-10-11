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
// both stack, open. The copy sits on a bottom
// scrim so it reads on any photo; the top of the photo stays clean.
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
              {/* Scrim only through the bottom band, where the copy sits; the top of the photo
                  stays clean. Measured against the photos' brightest patches so white text holds
                  4.5:1 (3:1 for the title). */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 via-45% to-transparent to-90% @3xl:via-30% @3xl:to-60%"
              />
              {/* A short fade from the top edge, only while collapsed, for the name. */}
              <div
                aria-hidden
                className={clsx(
                  'pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300',
                  open ? 'opacity-0' : 'opacity-0 @3xl:opacity-100',
                )}
              />

              {/* Top-left: the eyebrow pill while open, the name while collapsed. */}
              {Boolean(card.tag) && (
                <span
                  className={clsx(
                    'absolute left-6 top-6 rounded-full bg-[var(--button-primary-background,#d90716)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white transition-opacity duration-300 @xl:left-8 @xl:top-8',
                    open ? 'opacity-100' : 'opacity-100 @3xl:opacity-0',
                  )}
                >
                  {card.tag}
                </span>
              )}
              <p
                aria-hidden
                className={clsx(
                  'absolute left-6 top-6 font-heading text-lg font-bold drop-shadow transition-opacity duration-300 @xl:left-8 @xl:top-8 @xl:text-xl',
                  open ? 'opacity-0' : 'opacity-0 @3xl:opacity-100',
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
                <h3 className="font-heading text-2xl font-bold leading-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.4)] @xl:text-3xl">
                  {card.title}
                </h3>
                {Boolean(card.description) && (
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white @xl:text-base">
                    {card.description}
                  </p>
                )}
                {/* The proof points on the left and the button on the right, bottoms level. */}
                <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                  {card.points.length > 0 && (
                    <ul className="max-w-md space-y-1.5 text-sm">
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
                  <ButtonLink href={card.href} shape="pill" size="small" variant="primary">
                    {card.ctaLabel}
                  </ButtonLink>
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
