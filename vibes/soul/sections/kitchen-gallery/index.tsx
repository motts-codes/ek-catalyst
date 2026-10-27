'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Modal } from '@/vibes/soul/primitives/modal';
import { Image } from '~/components/image';
import type { GalleryKitchen } from '~/lib/inspiration/kitchen-gallery-data';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  kitchens: GalleryKitchen[];
  /** A hand-picked layout (from the admin): these columns, in this order, on tablet and up. */
  layout?: GalleryKitchen[][];
  /** The fewest screens of scrolling the gallery pins for (it pins longer to play one full loop). */
  screens?: number;
  className?: string;
}

// Every column travels the same distance, but each eases to its target over a different
// duration (the reference's 0.5 / 0.8 / 0.6 / 0.2s, power3), so the slow ones trail and catch up.
const DURATIONS = [0.5, 0.8, 0.3];
// Column travel per pixel scrolled (the reference's deltaY / 2).
const PACE = 0.5;
const COLUMNS = { base: 2, md: 3, lg: 3 };
// Tile heights vary so the wall reads as a gallery, not a grid; adjacent columns start at
// different points in the cycle.
const SHAPES = ['aspect-[4/3]', 'aspect-[16/10]', 'aspect-[5/4]', 'aspect-[3/2]', 'aspect-square'];
const START_OFFSETS = ['pt-0', 'pt-28', 'pt-12'];

function columnCount(width: number): number {
  if (width >= 896) return COLUMNS.lg;
  if (width >= 640) return COLUMNS.md;

  return COLUMNS.base;
}

// A wall of kitchen photos on white, in columns that follow the page's scroll with different
// lags and loop without end while the section is pinned. Click a kitchen for its details (no prices) and a
// way into the collection. With reduced motion, or no JavaScript, it's a plain grid.
export function KitchenGallery({ kitchens, layout, screens = 4, className }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<GalleryKitchen | null>(null);
  const [columns, setColumns] = useState(COLUMNS.lg);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setStill(motion.matches);
      setColumns(columnCount(window.innerWidth));
    };

    sync();
    window.addEventListener('resize', sync);
    motion.addEventListener('change', sync);

    return () => {
      window.removeEventListener('resize', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  useLayoutEffect(() => {
    const container = root.current;

    if (!container || still) return;

    const cols = Array.from(container.querySelectorAll<HTMLElement>('[data-gallery-col]'));
    const context = gsap.context(() => {
      // Each column follows the same target with its own duration and ease; its position wraps
      // at half the column's height (every column holds its photos twice), so the loop never ends.
      const followers = cols.map((col, index) => {
        const state = { travel: 0 };
        // The loop's period is the exact distance from a tile to its copy (one set plus one
        // gap); half the scroll height would be off by the column's top offset and the gap.
        const tiles = col.querySelectorAll<HTMLElement>('[data-gallery-tile]');
        const first = tiles[0];
        const twin = tiles[tiles.length / 2];
        const period = first && twin ? twin.offsetTop - first.offsetTop : col.scrollHeight / 2;
        const place = () => {
          // wrap() treats 0 as exclusive and would snap a resting column up a whole period.
          gsap.set(col, { y: state.travel >= 0 ? 0 : gsap.utils.wrap(-period, 0, state.travel) });
        };

        const move = (travel: number) => {
          gsap.to(state, {
            travel,
            duration: DURATIONS[index % DURATIONS.length] ?? 0.5,
            ease: 'power3',
            overwrite: true,
            onUpdate: place,
          });
        };

        return { move, period };
      });
      const periods = followers.map((f) => f.period);

      // Pin for exactly one loop of the longest column, so every kitchen passes once and the
      // last frame is the first: the section then releases to the content below.
      const longest = Math.max(...periods);
      const pinDistance = Math.max(longest / PACE, (screens - 1) * window.innerHeight);

      container.style.height = `${pinDistance + window.innerHeight}px`;
      ScrollTrigger.refresh();

      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          // The page's scroll is the input, as the wheel is in the reference, and like the
          // reference the columns move at half of it.
          const travel = -self.progress * pinDistance * PACE;

          followers.forEach((follow) => {
            follow.move(travel);
          });
        },
      });
    }, container);

    return () => context.revert();
  }, [still, columns, kitchens.length, layout, screens]);

  // A hand-picked layout is used as laid out on tablet and up; on a phone (two columns) its
  // kitchens are re-dealt in order. Otherwise each column takes a run of the list, so the
  // Star-first weave holds within every column.
  const usePreset = layout !== undefined && layout.length > 0 && columns >= COLUMNS.md;
  const count = usePreset ? layout.length : columns;
  const perColumn = Math.ceil(kitchens.length / count);
  const byColumn = usePreset
    ? layout
    : Array.from({ length: count }, (_, c) => kitchens.slice(c * perColumn, (c + 1) * perColumn));

  return (
    <>
      <div
        className={clsx('bg-white', className)}
        data-gallery-root
        ref={root}
        style={still ? undefined : { minHeight: `${screens * 100}svh` }}
      >
        <div className={clsx('px-5 @xl:px-8', !still && 'sticky top-0 h-svh overflow-hidden')}>
          <div
            className="grid h-full gap-5 @xl:gap-8"
            style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
          >
            {byColumn.map((items, c) => (
              <div
                className={clsx(
                  'flex flex-col gap-5 will-change-transform @xl:gap-8',
                  !still && START_OFFSETS[c % START_OFFSETS.length],
                )}
                data-gallery-col
                key={c}
              >
                {(still ? [items] : [items, items]).map((set, copy) => (
                  <div className="contents" key={copy}>
                    {set.map((kitchen, row) => (
                      <Tile
                        duplicate={copy === 1}
                        eager={copy === 0 && row < 3}
                        key={`${kitchen.id}-${copy}`}
                        kitchen={kitchen}
                        onOpen={() => setOpen(kitchen)}
                        shape={SHAPES[(row + c * 2) % SHAPES.length] ?? 'aspect-[4/3]'}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Details kitchen={open} onClose={() => setOpen(null)} />
    </>
  );
}

// The second copy of each column exists only for the seamless loop: hidden from assistive tech
// and out of the tab order.
function Tile({
  kitchen,
  onOpen,
  duplicate,
  eager,
  shape,
}: {
  kitchen: GalleryKitchen;
  onOpen: () => void;
  duplicate: boolean;
  eager: boolean;
  shape: string;
}) {
  return (
    <button
      aria-hidden={duplicate || undefined}
      aria-label={`${kitchen.name} kitchen: see details`}
      className={clsx(
        'group relative block w-full shrink-0 overflow-hidden rounded-lg bg-[#f3f2ee] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--button-primary-background,#d90716)]',
        shape,
      )}
      data-gallery-tile
      onClick={onOpen}
      tabIndex={duplicate ? -1 : 0}
      type="button"
    >
      <Image
        alt=""
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        fill
        loading={eager ? 'eager' : 'lazy'}
        sizes="(min-width: 40rem) 33vw, 50vw"
        src={kitchen.image.src}
        unoptimized={kitchen.image.src.startsWith('http')}
      />
      <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-left text-sm font-semibold text-white opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {kitchen.name}
      </span>
    </button>
  );
}

// The kitchen's details: photo, collection, line, how it's built, finishes, colors, delivery.
// No prices here; the collection page has them.
function Details({ kitchen, onClose }: { kitchen: GalleryKitchen | null; onClose: () => void }) {
  const facts = kitchen
    ? [
        ['Line', kitchen.line],
        ['Construction', kitchen.construction],
        ['Door style', kitchen.style],
        ['Finish', (kitchen.finish ?? kitchen.finishTypes.join(', ')) || undefined],
        ['Colors', kitchen.colorCount > 1 ? `${kitchen.colorCount} to choose from` : undefined],
        [
          'Ships in',
          kitchen.deliveryTime ? `about ${kitchen.deliveryTime.toLowerCase()}` : undefined,
        ],
      ].filter((f): f is [string, string] => typeof f[1] === 'string' && f[1] !== '')
    : [];

  return (
    <Modal
      className="w-full max-w-5xl [&>div>div:last-child]:!m-0 [&>div>div:last-child]:!p-0"
      hideHeader
      isOpen={kitchen !== null}
      setOpen={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={kitchen ? `${kitchen.name} kitchen` : 'Kitchen'}
    >
      {kitchen ? (
        <div className="relative grid @3xl:grid-cols-2">
          <Dialog.Close asChild>
            <button
              aria-label="Close"
              className="group absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full text-[var(--button-primary-background,#d90716)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]"
              type="button"
            >
              <X
                aria-hidden
                className="transition-transform duration-300 group-hover:rotate-90"
                size={24}
                strokeWidth={2.5}
              />
            </button>
          </Dialog.Close>
          <div className="relative aspect-[4/3] bg-[#f3f2ee] @3xl:aspect-auto @3xl:min-h-[30rem]">
            <Image
              alt={kitchen.image.alt}
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 40rem, 100vw"
              src={kitchen.image.src}
              unoptimized={kitchen.image.src.startsWith('http')}
            />
          </div>
          <div className="flex flex-col p-7 @xl:p-9 @3xl:p-12">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
              Best seller
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold leading-tight">{kitchen.name}</h2>
            <dl className="mt-5 divide-y divide-contrast-100 border-y border-contrast-100 text-sm">
              {facts.map(([label, value]) => (
                <div className="flex items-baseline justify-between gap-4 py-2.5" key={label}>
                  <dt className="text-contrast-500">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3 @3xl:mt-auto @3xl:pt-6">
              <ButtonLink href={kitchen.href} shape="pill" size="small" variant="primary">
                View collection
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
