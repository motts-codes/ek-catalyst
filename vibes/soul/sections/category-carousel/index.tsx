import { ArrowRight } from 'lucide-react';

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
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
  scrollbarLabel?: string;
}

// "Shop by category." — portrait photo tiles in a carousel, five visible on desktop. The name,
// hook and an arrow chip sit on a gradient at the foot of the photo; the tile lifts on hover.
export function CategoryCarousel({
  title = 'Shop by category.',
  kicker,
  categories,
  tint = false,
  className,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  scrollbarLabel = 'Scroll categories',
}: Props) {
  return (
    <HomeSection className={className} kicker={kicker} tint={tint} title={title}>
      <Carousel>
        <CarouselContent className="-ml-4 pb-2 pt-1 @2xl:-ml-5">
          {categories.map((category) => (
            <CarouselItem
              className="basis-[70%] pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:pl-5 @3xl:basis-1/4 @5xl:basis-1/5"
              key={category.href + category.name}
            >
              <Link
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-contrast-100 ring-1 ring-contrast-100 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.35)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                href={category.href}
              >
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 text-white">
                  <h3 className="font-heading text-lg font-semibold leading-tight @xl:text-xl">
                    {category.name}
                  </h3>
                  {Boolean(category.subtitle) && (
                    <p className="mt-1 text-xs text-white/80">{category.subtitle}</p>
                  )}
                  <span className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-white pl-4 pr-1.5 text-xs font-semibold text-foreground transition-transform duration-300 group-hover:translate-x-1">
                    Shop now
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-white">
                      <ArrowRight size={13} strokeWidth={2.5} />
                    </span>
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
