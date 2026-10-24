'use client';

import { ArrowRight } from 'lucide-react';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import { MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface TileCarouselTile {
  name: string;
  href: string;
  image?: { src: string; alt: string };
}

// The door tiles under a style row as a slider: four in view, arrows and a scrollbar so every
// collection is reachable. Door photos fit the square (contained, no crop) with no corner radius
// and no background, so the door reads as a door rather than a thumbnail.
export function TileCarousel({
  tiles,
  label,
  ctaLabel = 'Shop this look',
}: {
  tiles: TileCarouselTile[];
  label: string;
  ctaLabel?: string;
}) {
  return (
    <Carousel opts={{ align: 'start', slidesToScroll: 1 }}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
          {label}
        </p>
        {tiles.length > 4 && <CarouselButtons className="shrink-0" />}
      </div>
      <CarouselContent className="-ml-5">
        {tiles.map((tile) => (
          <CarouselItem className="basis-1/2 pl-5 @sm:basis-1/3 @lg:basis-1/4" key={tile.name}>
            <Link className="group block" href={tile.href}>
              <span className="relative block aspect-square">
                {tile.image ? (
                  <Image
                    alt={tile.image.alt}
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="160px"
                    src={tile.image.src}
                    unoptimized
                  />
                ) : (
                  <MediaPlaceholder label={tile.name} />
                )}
              </span>
              <span className="mt-3 block text-sm font-semibold leading-tight">{tile.name}</span>
              <span className="mt-1 inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-[var(--button-primary-background,#d90716)]">
                {ctaLabel}
                <ArrowRight
                  className="transition-transform group-hover:translate-x-0.5"
                  size={12}
                  strokeWidth={2.5}
                />
              </span>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {tiles.length > 4 && <CarouselScrollbar className="mt-4" />}
    </Carousel>
  );
}
