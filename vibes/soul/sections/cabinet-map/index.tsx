'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { Image } from '~/components/image';

export interface CabinetMapItem {
  /** The number on the picture (two cabinets can share one, like the pair of 21" walls). */
  n: number;
  label: string;
}

export interface CabinetMapMarker {
  n: number;
  /** Percent of the picture's width / height. */
  x: number;
  y: number;
}

export interface CabinetMapImage {
  src: string;
  alt: string;
  /** The kitchen shape, in a red pill at the top-left ("L-Shaped", "Straight"). */
  name: string;
  /** Nudges the picture down on desktop to line it up with its neighbour. */
  offsetY?: 0 | 25 | 50;
  /** The picture's own proportions; the frame takes them so percent positions stay true. */
  width: number;
  height: number;
  markers: CabinetMapMarker[];
}

// Desktop-only nudges (Tailwind needs the classes spelled out).
const OFFSETS: Record<0 | 25 | 50, string | undefined> = {
  0: undefined,
  25: '@3xl:mt-[25px]',
  50: '@3xl:mt-[50px]',
};

interface Props {
  /** Two pictures, left and right, half and half. */
  images: [CabinetMapImage, CabinetMapImage];
  items: CabinetMapItem[];
  className?: string;
}

// The 10×10's cabinets on EK's two numbered renders (an L and a single wall), with the numbered
// list in a two-column table beneath. The numbers are printed on the pictures; an invisible
// hotspot sits over each one, so hovering or focusing it shows the cabinet's name, and hovering a
// row in the table rings its number on both pictures.
export function CabinetMap({ images, items, className }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const labelFor = (n: number) => items.find((i) => i.n === n)?.label ?? '';

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-3xl border border-contrast-100 bg-white shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]',
        className,
      )}
    >
      <div className="grid gap-4 p-4 @3xl:grid-cols-2 @3xl:gap-6 @3xl:p-6">
        {images.map((image) => (
          <div className="relative" key={image.src}>
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[var(--button-primary-background,#d90716)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
              {image.name}
            </span>
            <div
              className={clsx('relative rounded-2xl bg-white', OFFSETS[image.offsetY ?? 0])}
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            >
              <Image
                alt={image.alt}
                className="object-contain"
                fill
                sizes="(min-width: 56rem) 40rem, 100vw"
                src={image.src}
              />
              {image.markers.map((marker, index) => {
                const on = active === marker.n;

                return (
                  // Hover-only: the printed number is the target, and the list beneath carries
                  // every name for keyboards and screen readers.
                  <span
                    aria-hidden
                    className={clsx(
                      'absolute flex aspect-square w-[4.5%] min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-shadow',
                      on &&
                        'z-20 shadow-[0_0_0_3px_white,0_0_0_5px_var(--button-primary-background,#d90716)]',
                    )}
                    data-n={marker.n}
                    key={`${marker.n}-${index}`}
                    onMouseEnter={() => setActive(marker.n)}
                    onMouseLeave={() => setActive(null)}
                    style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  >
                    {on ? (
                      <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--button-primary-background,#d90716)] px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                        {labelFor(marker.n)}
                      </span>
                    ) : null}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <ol className="grid border-t border-contrast-100 @xl:grid-cols-2">
        {items.map((item, index) => {
          const on = active === item.n;
          const rightColumn = index % 2 === 1;

          return (
            <li
              className={clsx(
                'flex items-center gap-3 border-b border-contrast-100 px-4 py-2.5 text-sm transition-colors @xl:px-6',
                rightColumn && '@xl:border-l',
                on ? 'bg-[#fdf3f5] font-semibold' : 'text-foreground',
              )}
              key={`${item.n}-${item.label}`}
              onMouseEnter={() => setActive(item.n)}
              onMouseLeave={() => setActive(null)}
            >
              <span
                className={clsx(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                  on
                    ? 'bg-[var(--button-primary-background,#d90716)] text-white'
                    : 'bg-[#fdf3f5] text-[var(--button-primary-background,#d90716)]',
                )}
              >
                {item.n}
              </span>
              {item.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
