'use client';

import { useState } from 'react';

import { Image } from '~/components/image';

// Collection image gallery for the header: a large main image + a thumbnail strip. images[0] is the
// initial main image; clicking a thumbnail swaps it. Client component so the swap is interactive.
export function Gallery({
  images,
  name,
  doorImages = [],
}: {
  images: string[];
  name: string;
  /** Door-sample photos among `images`: tight crops of a door, so they're shown contained with
   *  padding on the frame's light background instead of filling it. Kitchen photos fill. */
  doorImages?: string[];
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  const isDoor = (src: string | undefined) => src != null && doorImages.includes(src);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100">
        {main != null && (
          <Image
            alt={name}
            className={`size-full ${isDoor(main) ? 'object-contain p-10 @xl:p-14' : 'object-cover'}`}
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
                  className={`size-full ${isDoor(src) ? 'bg-contrast-100 object-contain p-1.5' : 'object-cover'}`}
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
