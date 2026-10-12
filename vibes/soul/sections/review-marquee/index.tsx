import { clsx } from 'clsx';
import { Quote, Star } from 'lucide-react';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import { type CustomerReview } from '@/vibes/soul/sections/review-carousel';

import { MarqueeFrame } from './marquee-frame';

interface Props {
  title?: string;
  /** Right of the title, e.g. "4.5 · 360+ Google reviews". */
  summary?: string;
  reviews: CustomerReview[];
  action?: { label: string; href: string };
  /** Seconds for one full loop of the slowest column. */
  speed?: number;
  /** Column height on desktop, px. */
  height?: number;
  /** Ignored: the reviews band always sits on the site's light red (#fdf8f8), on every page. */
  tint?: boolean;
  className?: string;
}

const COLUMN_COUNT = 3;

// Initials avatar from "Scott B." → "SB".
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) =>
      part
        .replace(/[^A-Za-z]/g, '')
        .charAt(0)
        .toUpperCase(),
    )
    .filter(Boolean)
    .slice(0, 2)
    .join('');
}

function ReviewCard({ review }: { review: CustomerReview }) {
  return (
    <figure className="flex flex-col gap-3 rounded-3xl border border-contrast-100 bg-white p-6 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.12)]">
      <div className="flex items-center justify-between">
        <div
          aria-label={`${review.stars} out of 5 stars`}
          className="flex gap-0.5 text-[#f5a623]"
          role="img"
        >
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <Star
              aria-hidden
              className={starIndex < review.stars ? 'fill-current' : 'opacity-25'}
              key={starIndex}
              size={14}
            />
          ))}
        </div>
        <Quote aria-hidden className="text-contrast-200" size={18} strokeWidth={1.5} />
      </div>
      <blockquote className="text-sm leading-relaxed text-foreground">{review.quote}</blockquote>
      <figcaption className="mt-1 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] text-xs font-semibold text-white">
          {initials(review.name)}
        </span>
        <span className="min-w-0 text-xs text-contrast-500">
          <span className="block truncate font-semibold text-foreground">{review.name}</span>
          <span className="block truncate">
            {[review.location, review.source].filter(Boolean).join(' · ')}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

// "What it was like, in their words" — three columns of review cards drifting vertically, the
// middle one the other way and each at its own pace; hover a column to pause it. Columns fade at
// the top and bottom. Reduced-motion users get a static grid. Below tablet width it is one column.
export function ReviewMarquee({
  title = 'What it was like, in their words',
  summary,
  reviews,
  action,
  speed = 45,
  height = 560,
  className,
}: Props) {
  // Round-robin the reviews into columns; each column's track is duplicated so the loop is seamless.
  const columns = Array.from({ length: COLUMN_COUNT }, (_, column) =>
    reviews.filter((_review, index) => index % COLUMN_COUNT === column),
  ).filter((column) => column.length > 0);

  return (
    <HomeSection
      action={action}
      className={clsx('bg-[#fdf8f8]', className)}
      kicker={summary}
      tint={false}
      title={title}
    >
      <style>{`
        @keyframes ek-marquee-up { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes ek-marquee-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
        .ek-marquee-column:hover .ek-marquee-track,
        .ek-marquee-column:focus-within .ek-marquee-track,
        [data-paused='true'] .ek-marquee-track { animation-play-state: paused !important; }
        @media (prefers-reduced-motion: reduce) { .ek-marquee-track { animation: none !important; } }
      `}</style>
      <MarqueeFrame>
        <div
          className="grid gap-5 @lg:grid-cols-2 @3xl:grid-cols-3"
          style={{ height: `${height}px` }}
        >
          {columns.map((column, columnIndex) => {
            const down = columnIndex % 2 === 1;
            // Slightly different pace per column so they never move in lockstep.
            const duration = speed * (1 + columnIndex * 0.18);

            return (
              <div
                className={clsx(
                  'ek-marquee-column relative h-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]',
                  columnIndex === 1 && 'hidden @lg:block',
                  columnIndex === 2 && 'hidden @3xl:block',
                )}
                key={columnIndex}
              >
                <div
                  // The pause-on-hover and reduced-motion rules live in the <style> block above
                  // because the inline `animation` shorthand would otherwise override utility classes.
                  className="ek-marquee-track flex flex-col gap-5 will-change-transform"
                  style={{
                    animation: `${down ? 'ek-marquee-down' : 'ek-marquee-up'} ${duration}s linear infinite`,
                  }}
                >
                  {[...column, ...column].map((review, index) => (
                    <div aria-hidden={index >= column.length ? true : undefined} key={index}>
                      <ReviewCard review={review} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </MarqueeFrame>
    </HomeSection>
  );
}
