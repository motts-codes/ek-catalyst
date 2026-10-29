'use client';

import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import { Actions, type PageAction } from '@/vibes/soul/sections/page-kit';
import { Image } from '~/components/image';

export interface SpotlightReview {
  name: string;
  /** 1–5 */
  stars: number;
  /** The reviewer's own summary line, e.g. "Exactly what I wanted!" */
  headline: string;
  quote: string;
  /** A photo of the reviewer, landscape. */
  image: { src: string; alt: string };
}

interface Props {
  kicker?: string;
  title?: string;
  /** Words in the title to pick out in cream. */
  accentWords?: string[];
  description?: string;
  reviews: SpotlightReview[];
  actions?: PageAction[];
  className?: string;
}

// The title with its accent words in cream, so "Don't take our word for it." reads the way the
// landing page set it. Matched on whole words, case-insensitively.
function AccentedTitle({ title, accentWords }: { title: string; accentWords: string[] }) {
  if (accentWords.length === 0) return title;

  const pattern = new RegExp(`(${accentWords.join('|')})`, 'i');
  const parts = title.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        pattern.test(part) ? (
          <span className="text-[#f6ebd6]" key={index}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div aria-label={`${count} out of 5 stars`} className="flex gap-0.5 text-[#f5a623]" role="img">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          aria-hidden
          className={index < count ? 'fill-current' : 'opacity-25'}
          key={index}
          size={15}
        />
      ))}
    </div>
  );
}

// How many cards show behind the front one, and how far each steps back.
const DEPTH = 3;
const DECK_POSITION = [
  'translate-x-0 translate-y-0 scale-100 opacity-100',
  'translate-x-4 translate-y-4 scale-100 opacity-100 brightness-[0.94]',
  'translate-x-8 translate-y-8 scale-100 opacity-100 brightness-[0.88]',
];

// Bare arrows under the deck: white, dimming on hover, with a generous hit area.
const arrowButtonClassName =
  'flex h-11 w-11 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#9f3632]';

// "Don't take our word for it": the landing page's testimonial band, rebuilt. A deep red band:
// a deck of photo cards on the left, the next two peeking out behind the front one, with the
// arrows beneath, and the copy on the right. Next sends the front card fading away and brings the one behind it
// forward; Previous brings it back. Reduced motion swaps without the animation.
export function ReviewSpotlight({
  kicker = 'Real kitchens. Real families.',
  title = "Don't take our word for it.",
  accentWords = ['take our word'],
  description = 'Rated A+ by the Better Business Bureau, and reviewed on Google, BBB and Houzz.',
  reviews,
  actions = [],
  className,
}: Props) {
  const [active, setActive] = useState(0);
  const count = reviews.length;
  const current = reviews[active];

  if (!current) return null;

  const step = (delta: number) => setActive((index) => (index + delta + count) % count);

  return (
    // Deep brand red (#9F3632): white text is 6.9:1 on it, the cream accent 9.8:1.
    <HomeSection className={clsx('bg-[#9f3632] text-white', className)}>
      <div className="grid gap-10 @3xl:grid-cols-[11fr_9fr] @3xl:items-center @3xl:gap-16">
        <div className="max-w-xl">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white">
            {kicker}
          </p>
          <h2 className="font-heading text-2xl font-bold leading-tight @xl:text-3xl @4xl:text-4xl">
            <AccentedTitle accentWords={accentWords} title={title} />
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/85 @xl:text-base">{description}</p>
          {actions.length > 0 && <Actions actions={actions} className="mt-8" onRed />}
        </div>
        {/* Phones read the copy first; from tablet width the deck takes the left column. */}
        <div className="@3xl:order-first">
          {/* Every card sits in the same grid cell, so the deck is as tall as the tallest card;
              the padding leaves room for the two cards peeking out behind. */}
          <div className="grid pb-8 pr-8">
            {reviews.map((review, index) => {
              const offset = (index - active + count) % count;
              const shown = offset < DEPTH;

              return (
                <figure
                  aria-hidden={!shown || offset > 0}
                  className={clsx(
                    'col-start-1 row-start-1 grid overflow-hidden rounded-3xl bg-white text-foreground shadow-[0_16px_40px_-20px_rgb(0_0_0/0.45)] transition-[transform,opacity,filter] duration-500 ease-out @xl:grid-cols-[2fr_3fr] motion-reduce:transition-none',
                    shown
                      ? DECK_POSITION[offset]
                      : // Leaving the front: lift, grow a touch and fade.
                        'pointer-events-none -translate-y-6 scale-[1.03] opacity-0',
                  )}
                  inert={offset !== 0}
                  key={review.name}
                  style={{ zIndex: shown ? DEPTH - offset : 0 }}
                >
                  {/* Wide card: the photo fills the left 40% edge to edge, the review sits on
                    the right. Phones stack it, photo on top. */}
                  <div className="relative aspect-[16/9] bg-contrast-100 @xl:aspect-auto @xl:min-h-[19.5rem]">
                    <Image
                      alt={review.image.alt}
                      className="object-cover"
                      fill
                      sizes="(min-width: 56rem) 25vw, (min-width: 32rem) 40vw, 100vw"
                      src={review.image.src}
                    />
                  </div>
                  <figcaption className="flex flex-col justify-center gap-2.5 p-5 @xl:p-8">
                    <span className="font-semibold">{review.name}</span>
                    <Stars count={review.stars} />
                    <span className="font-heading text-base font-bold text-[var(--button-primary-background,#d90716)]">
                      {review.headline}
                    </span>
                    <blockquote className="text-sm leading-relaxed text-[#404040]">
                      “{review.quote}”
                    </blockquote>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-end gap-5">
            <button
              aria-label="Previous review"
              className={arrowButtonClassName}
              onClick={() => step(-1)}
              type="button"
            >
              <ArrowLeft aria-hidden size={26} strokeWidth={1.75} />
            </button>
            <button
              aria-label="Next review"
              className={arrowButtonClassName}
              onClick={() => step(1)}
              type="button"
            >
              <ArrowRight aria-hidden size={26} strokeWidth={1.75} />
            </button>
            <p aria-live="polite" className="text-sm text-white/85">
              <span aria-hidden>
                {active + 1} / {count}
              </span>
              <span className="sr-only">
                Review {active + 1} of {count}: {current.name}
              </span>
            </p>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
