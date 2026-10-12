'use client';

import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

import { homeHeadingClassName, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

import { onScrollFrame, pinnedProgress, prefersReducedMotion } from './scroll-utils';

export interface Station {
  title: string;
  description: string;
  image?: { src: string; alt: string };
  imageLabel?: string;
}

interface Props {
  kicker: string;
  title: string;
  stations: Station[];
}

// "The factory": a dark band pinned for three screens while a rail of stations (cut, paint,
// assemble, stock, ship) slides sideways with the scroll. Reduced motion lays them out in a wrap.
export function FactoryRail({ kicker, title, stations }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const rail = railRef.current;

    if (!section || !rail || prefersReducedMotion()) return;

    return onScrollFrame(() => {
      const p = pinnedProgress(section);
      const max = Math.max(0, rail.scrollWidth - window.innerWidth);

      rail.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
    });
  }, []);

  return (
    <section
      aria-label={title}
      className="ek-factory relative h-[320vh] bg-foreground text-white @container motion-reduce:h-auto motion-reduce:py-16"
      ref={sectionRef}
    >
      <style>{`
        .ek-factory .ek-pin { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; display: flex; flex-direction: column; justify-content: center; gap: 28px; }
        @media (prefers-reduced-motion: reduce) { .ek-factory .ek-pin { position: relative; height: auto; overflow: visible; } .ek-factory .ek-rail { flex-wrap: wrap; } }
      `}</style>
      <div className="ek-pin">
        <div className="mx-auto w-full max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#F9858D]">
            {kicker}
          </p>
          <h2 className={clsx(homeHeadingClassName, 'text-white @4xl:text-4xl')}>{title}</h2>
        </div>
        <div
          className="ek-rail flex gap-6 px-6 will-change-transform @xl:px-9 @4xl:px-14"
          ref={railRef}
        >
          {stations.map((station) => (
            <div className="flex w-[min(78vw,560px)] shrink-0 flex-col gap-3" key={station.title}>
              <div className="relative aspect-[5/3] overflow-hidden rounded-2xl bg-white/10">
                {station.image ? (
                  <Image
                    alt={station.image.alt}
                    className="object-cover"
                    fill
                    sizes="(min-width: 42rem) 560px, 78vw"
                    src={station.image.src}
                  />
                ) : (
                  <MediaPlaceholder label={station.imageLabel ?? station.title} />
                )}
              </div>
              <h3 className="font-heading text-2xl font-bold">{station.title}</h3>
              <p className="text-white/75">{station.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
