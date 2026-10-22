'use client';

import { useState } from 'react';

import { Image } from '~/components/image';

// Collection image gallery for the header: a large main image + a thumbnail strip. images[0] is the
// initial main image; clicking a thumbnail swaps it. Client component so the swap is interactive.
export function Gallery({
  images,
  name,
  doorImages = [],
  kitchenImages = [],
}: {
  images: string[];
  name: string;
  /** Door-sample photos: tight crops of a door, shown contained with generous padding. */
  doorImages?: string[];
  /** Kitchen photos: the only images that fill (cover) the frame. Anything else — spec sheets,
   *  detail graphics — fits inside the frame with light padding, never cropped. */
  kitchenImages?: string[];
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  const fitClass = (src: string | undefined, thumb = false) => {
    if (src != null && kitchenImages.includes(src)) return 'object-cover';
    if (src != null && doorImages.includes(src))
      return thumb ? 'bg-contrast-100 object-contain p-1.5' : 'object-contain p-10 @xl:p-14';

    return thumb ? 'bg-contrast-100 object-contain p-0.5' : 'object-contain p-4 @xl:p-6';
  };

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100">
        {main != null && (
          <Image
            alt={name}
            className={`size-full ${fitClass(main)}`}
            height={900}
            sizes="(min-width: 48rem) 40vw, 100vw"
            src={main}
            unoptimized
            width={1200}
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              aria-label={`View image ${i + 1}`}
              // Thin brand-red outline on the active thumbnail with 2px of white inside it — the
              // same treatment as the PDP gallery and the finish swatches.
              className={`size-16 rounded-xl border p-[2px] transition-colors ${
                i === active
                  ? 'border-[var(--button-primary-background,#d90716)]'
                  : 'border-transparent hover:border-contrast-200'
              }`}
              key={i}
              onClick={() => setActive(i)}
              type="button"
            >
              <span className="relative block size-full overflow-hidden rounded-[10px]">
                <Image
                  alt={`${name} ${i + 1}`}
                  className={`size-full ${fitClass(src, true)}`}
                  height={128}
                  sizes="64px"
                  src={src}
                  unoptimized
                  width={128}
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
