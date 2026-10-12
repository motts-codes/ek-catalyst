import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import { type CabinetLine, CabinetLineCard } from '@/vibes/soul/sections/cabinet-lines';

interface Props {
  lines: Streamable<CabinetLine[]>;
  placeholderCount?: number;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
  scrollbarLabel?: string;
}

const itemClassName = 'basis-full pl-4 @md:basis-[60%] @2xl:pl-5 @3xl:basis-1/2 @5xl:basis-1/3';

// Cabinet collection cards (the same card as the listing pages: 10×10 price, ship time, Shop +
// Order sample) in a single-row carousel — three to a row on wide screens — with
// the same scrollbar and arrows as the category row. Renders nothing when there are no collections.
export function CollectionCarousel({
  lines,
  placeholderCount = 4,
  className,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  scrollbarLabel = 'Scroll collections',
}: Props) {
  return (
    <Stream
      fallback={
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <div
              className="aspect-[4/5] w-full shrink-0 animate-pulse rounded-2xl bg-contrast-100 @md:w-[60%] @3xl:w-1/2 @5xl:w-1/3"
              key={index}
            />
          ))}
        </div>
      }
      value={lines}
    >
      {(resolved) =>
        resolved.length === 0 ? null : (
          <Carousel className={className}>
            <CarouselContent className="-ml-4 pb-2 pt-1 @2xl:-ml-5">
              {resolved.map((line) => (
                <CarouselItem className={itemClassName} key={line.entityId}>
                  <CabinetLineCard line={line} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-6 flex w-full items-center justify-between gap-8">
              <CarouselScrollbar label={scrollbarLabel} />
              <CarouselButtons nextLabel={nextLabel} previousLabel={previousLabel} />
            </div>
          </Carousel>
        )
      }
    </Stream>
  );
}
