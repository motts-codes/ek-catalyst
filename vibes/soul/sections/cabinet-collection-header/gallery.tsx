'use client';

import { useState } from 'react';

import { Image } from '~/components/image';

// Collection image gallery for the header: a large main image + a thumbnail strip. images[0] is the
// initial main image; clicking a thumbnail swaps it. Client component so the swap is interactive.
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  return (
    <div className="mb-6">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-contrast-100">
        {main != null && (
          <Image
            alt={name}
            className="size-full object-cover"
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
              className={`relative size-16 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? 'border-foreground' : 'border-transparent hover:border-contrast-200'
              }`}
              key={i}
              onClick={() => setActive(i)}
              type="button"
            >
              <Image
                alt={`${name} ${i + 1}`}
                className="size-full object-cover"
                height={128}
                sizes="64px"
                src={src}
                unoptimized
                width={128}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
