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

// "Shop by category." — the category tiles in a carousel, five visible on desktop, each a photo,
// the name, a one-line hook and "Shop now →".
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
        <CarouselContent className="-ml-3 @2xl:-ml-4">
          {categories.map((category) => (
            <CarouselItem
              className="basis-1/2 pl-3 @lg:basis-1/3 @2xl:pl-4 @3xl:basis-1/4 @5xl:basis-1/5"
              key={category.href + category.name}
            >
              <Link
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-contrast-100 bg-white transition-colors hover:border-contrast-200 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                href={category.href}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-contrast-100">
                  {category.image ? (
                    <Image
                      alt={category.image.alt}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      fill
                      sizes="(min-width: 64rem) 20vw, (min-width: 42rem) 33vw, 50vw"
                      src={category.image.src}
                    />
                  ) : (
                    <MediaPlaceholder label={category.name} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="font-heading text-base font-semibold leading-tight @xl:text-lg">
                    {category.name}
                  </h3>
                  {Boolean(category.subtitle) && (
                    <p className="text-xs text-contrast-500">{category.subtitle}</p>
                  )}
                  <span className="mt-auto pt-2 text-sm font-semibold text-[var(--button-primary-background,#d90716)]">
                    Shop now →
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
