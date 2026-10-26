'use client';

import { clsx } from 'clsx';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Modal } from '@/vibes/soul/primitives/modal';
import { Image } from '~/components/image';
import type { GalleryKitchen } from '~/lib/inspiration/kitchen-gallery-data';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  kitchens: GalleryKitchen[];
  /** How many screens of scrolling the gallery pins for. */
  screens?: number;
  className?: string;
}

// Each column drifts at its own pace; the page's scroll drives them all.
const SPEEDS = [1, 1.55, 0.8, 1.3, 1.1];
const COLUMNS = { base: 2, md: 3, lg: 4, xl: 5 };

function columnCount(width: number): number {
  if (width >= 1280) return COLUMNS.xl;
  if (width >= 896) return COLUMNS.lg;
  if (width >= 640) return COLUMNS.md;

  return COLUMNS.base;
}

// A wall of kitchen photos, cream tiles on black, in columns that scroll at different speeds and
// loop without end while the section is pinned. Click a kitchen for its details (no prices) and a
// way into the collection. With reduced motion, or no JavaScript, it's a plain grid.
export function KitchenGallery({ kitchens, screens = 4, className }: Props) {
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
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          const travel = self.progress * (container.offsetHeight - window.innerHeight) * 1.4;

          cols.forEach((col, index) => {
            // Each column holds its photos twice; wrapping at half its height loops it seamlessly.
            const half = col.scrollHeight / 2;
            const speed = SPEEDS[index % SPEEDS.length] ?? 1;

            gsap.set(col, { y: gsap.utils.wrap(-half, 0, -travel * speed) });
          });
        },
      });
    }, container);

    return () => context.revert();
  }, [still, columns, kitchens.length]);

  const byColumn = Array.from({ length: columns }, (_, c) =>
    kitchens.filter((_kitchen, i) => i % columns === c),
  );

  return (
    <>
      <div
        className={clsx('bg-black', className)}
        ref={root}
        style={still ? undefined : { height: `${screens * 100}svh` }}
      >
        <div
          className={clsx(
            'mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14',
            !still && 'sticky top-0 h-svh overflow-hidden',
          )}
        >
          <div
            className="grid h-full gap-4 @xl:gap-6"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {byColumn.map((items, c) => (
              <div
                className="flex flex-col gap-4 will-change-transform @xl:gap-6"
                data-gallery-col
                key={c}
                style={still ? undefined : { paddingTop: `${(c % 3) * 4}rem` }}
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
}: {
  kitchen: GalleryKitchen;
  onOpen: () => void;
  duplicate: boolean;
  eager: boolean;
}) {
  return (
    <button
      aria-hidden={duplicate || undefined}
      aria-label={`${kitchen.name} kitchen: see details`}
      className="group relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-[#efeee6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
      onClick={onOpen}
      tabIndex={duplicate ? -1 : 0}
      type="button"
    >
      <Image
        alt=""
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        fill
        loading={eager ? 'eager' : 'lazy'}
        sizes="(min-width: 80rem) 20vw, (min-width: 56rem) 25vw, (min-width: 40rem) 33vw, 50vw"
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
      className="w-full max-w-4xl"
      hideHeader
      isOpen={kitchen !== null}
      setOpen={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={kitchen ? `${kitchen.name} kitchen` : 'Kitchen'}
    >
      {kitchen ? (
        <div className="grid gap-6 @3xl:grid-cols-[1.2fr_1fr] @3xl:gap-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#efeee6]">
            <Image
              alt={kitchen.image.alt}
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 40rem, 100vw"
              src={kitchen.image.src}
              unoptimized={kitchen.image.src.startsWith('http')}
            />
          </div>
          <div className="flex flex-col">
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
