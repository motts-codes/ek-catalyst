import { Star } from 'lucide-react';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselControls,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import { HomeSection } from '@/vibes/soul/sections/home-section';

export interface CustomerReview {
  /** 1–5 */
  stars: number;
  quote: string;
  name: string;
  /** e.g. the showroom town */
  location?: string;
  /** e.g. "Google" */
  source?: string;
}

interface Props {
  title?: string;
  /** Right of the title, e.g. "4.5 · 360+ Google reviews". */
  summary?: string;
  reviews: CustomerReview[];
  action?: { label: string; href: string };
  tint?: boolean;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
  scrollbarLabel?: string;
}

// "What it was like, in their words" — real customer reviews in a carousel, three visible on
// desktop. Each card: stars, the quote, then name · town · source.
export function ReviewCarousel({
  title = 'What it was like, in their words',
  summary,
  reviews,
  action,
  tint = false,
  className,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  scrollbarLabel = 'Scroll reviews',
}: Props) {
  return (
    <HomeSection action={action} className={className} kicker={summary} tint={tint} title={title}>
      <Carousel>
        <CarouselContent className="-ml-3 @2xl:-ml-4">
          {reviews.map((review, index) => (
            <CarouselItem
              className="basis-full pl-3 @lg:basis-1/2 @2xl:pl-4 @3xl:basis-1/3"
              key={index}
            >
              <figure className="flex h-full flex-col gap-3 rounded-2xl border border-contrast-100 bg-white p-5">
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
                <blockquote className="flex-1 text-sm leading-relaxed">{review.quote}</blockquote>
                <figcaption className="text-xs text-contrast-500">
                  <span className="font-semibold text-foreground">{review.name}</span>
                  {Boolean(review.location) && <> · {review.location}</>}
                  {Boolean(review.source) && <> · {review.source}</>}
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls>
          <CarouselScrollbar label={scrollbarLabel} />
          <CarouselButtons nextLabel={nextLabel} previousLabel={previousLabel} />
        </CarouselControls>
      </Carousel>
    </HomeSection>
  );
}
