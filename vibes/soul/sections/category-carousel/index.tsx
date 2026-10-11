import { ArrowRight, Redo2 } from 'lucide-react';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface CategoryTile {
  name: string;
  href: string;
  /** One-line hook under the name, e.g. "50,000 in stock". */
  subtitle?: string;
  image?: { src: string; alt: string };
}

interface Props {
  title?: string;
  kicker?: string;
  categories: CategoryTile[];
  tint?: boolean;
  /** Sit right under the hero (minimal top padding). */
  tightTop?: boolean;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
  scrollbarLabel?: string;
}

// "Shop by category" — photo tiles in a carousel, five visible on desktop: photo on top, then the
// name, the hook line and a "Shop now →" text link; the tile lifts on hover.
export function CategoryCarousel({
  title = "Shop what you're working on",
  kicker,
  categories,
  tint = false,
  tightTop = false,
  className,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  scrollbarLabel = 'Scroll categories',
}: Props) {
  return (
    <HomeSection className={className} kicker={kicker} tightTop={tightTop} tint={tint}>
      {/* The heading sits at the right with a curved arrow turning down toward the cards; small,
          so it doesn't compete with the hero above. Still the section's h2. */}
      {Boolean(title) && (
        <div className="mb-1 flex items-end justify-end gap-1.5">
          <h2 className="ek-heading-light font-heading text-sm leading-tight @xl:text-base">
            {title}
          </h2>
          {/* Redo2 turned a quarter clockwise: the curve leaves the heading and the head points
              down at the cards. */}
          <Redo2
            aria-hidden
            className="mb-px shrink-0 rotate-90 text-[var(--button-primary-background,#d90716)]"
            size={18}
            strokeWidth={1.5}
          />
        </div>
      )}
      <Carousel>
        <CarouselContent className="-ml-4 pb-2 pt-1 @2xl:-ml-5">
          {categories.map((category) => (
            <CarouselItem
              className="basis-[70%] pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:pl-5 @3xl:basis-1/4 @5xl:basis-1/5"
              key={category.href + category.name}
            >
              <Link
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-contrast-100 bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                href={category.href}
              >
                <div className="relative aspect-[25/18] overflow-hidden bg-contrast-100">
                  {category.image ? (
                    <Image
                      alt={category.image.alt}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      fill
                      sizes="(min-width: 64rem) 20vw, (min-width: 42rem) 33vw, 70vw"
                      src={category.image.src}
                    />
                  ) : (
                    <MediaPlaceholder label={category.name} />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 pb-4">
                  <h3 className="font-heading text-lg font-semibold leading-tight transition-colors group-hover:text-[var(--button-primary-background,#d90716)] @xl:text-xl">
                    {category.name}
                  </h3>
                  {Boolean(category.subtitle) && (
                    <p className="mt-1 text-sm text-contrast-500">{category.subtitle}</p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2.5 text-sm font-semibold text-[var(--button-primary-background,#d90716)]">
                    Shop now
                    <ArrowRight
                      className="transition-transform duration-300 group-hover:-translate-x-1"
                      size={15}
                      strokeWidth={2.5}
                    />
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-6 flex w-full items-center justify-between gap-8">
          <CarouselScrollbar label={scrollbarLabel} />
          <CarouselButtons nextLabel={nextLabel} previousLabel={previousLabel} />
        </div>
      </Carousel>
    </HomeSection>
  );
}
