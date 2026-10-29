import { clsx } from 'clsx';
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
  /** The small pill above the title. */
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

// "Don't take our word for it": the landing page's testimonial band, rebuilt. A deep red band
// with a centred heading, then photo cards in the site's carousel (three across on desktop),
// each with the reviewer's photo, name, stars, their own headline and an excerpt.
export function ReviewSpotlight({
  kicker = 'Real kitchens. Real families.',
  title = "Don't take our word for it.",
  accentWords = ['take our word'],
  description = '5,000+ verified reviews across Google, BBB and Houzz. Rated A+ by the Better Business Bureau.',
  reviews,
  actions = [],
  className,
}: Props) {
  return (
    // Deep brand red (#9F3632): white text is 6.9:1 on it, the cream accent 9.8:1.
    <HomeSection className={clsx('bg-[#9f3632] text-white', className)}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="inline-block rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {kicker}
        </p>
        <h2 className="mt-4 font-heading text-2xl font-bold leading-tight @xl:text-3xl @4xl:text-4xl">
          <AccentedTitle accentWords={accentWords} title={title} />
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/85 @xl:text-base">{description}</p>
      </div>
      <Carousel className="mt-8 @4xl:mt-10">
        <CarouselContent className="-ml-4 @2xl:-ml-6">
          {reviews.map((review) => (
            <CarouselItem
              className="basis-full pl-4 @lg:basis-1/2 @2xl:pl-6 @3xl:basis-1/3"
              key={review.name}
            >
              <figure className="flex h-full flex-col overflow-hidden rounded-3xl bg-white text-foreground shadow-[0_16px_40px_-20px_rgb(0_0_0/0.45)]">
                <div className="relative aspect-[16/9] bg-contrast-100">
                  <Image
                    alt={review.image.alt}
                    className="object-cover"
                    fill
                    sizes="(min-width: 56rem) 33vw, (min-width: 32rem) 50vw, 100vw"
                    src={review.image.src}
                  />
                </div>
                <figcaption className="flex flex-1 flex-col gap-2 p-5 @xl:p-6">
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls className="mt-6">
          <CarouselScrollbar colorScheme="dark" label="Scroll reviews" />
          <CarouselButtons
            colorScheme="dark"
            nextLabel="Next review"
            previousLabel="Previous review"
          />
        </CarouselControls>
      </Carousel>
      {actions.length > 0 && <Actions actions={actions} className="mt-8 justify-center" onRed />}
    </HomeSection>
  );
}
