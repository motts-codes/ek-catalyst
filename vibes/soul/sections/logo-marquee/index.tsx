'use client';

import { clsx } from 'clsx';
import { Pause, Play } from 'lucide-react';
import { useState } from 'react';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

export interface MarqueeLogo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  kicker?: string;
  title?: string;
  description?: string;
  logos: MarqueeLogo[];
  /** Seconds for one full pass of the list. */
  duration?: number;
  tint?: boolean;
  className?: string;
}

// A slow, seamless row of client logos (the "trusted by" band). The track is doubled so the loop
// never shows a gap, the edges fade out, and it pauses while hovered or focused and has a
// stop/start button (WCAG 2.2.2); reduced motion lays the logos out in a wrapped row instead.
export function LogoMarquee({
  kicker,
  title,
  description,
  logos,
  duration = 40,
  tint = false,
  className,
}: Props) {
  const [paused, setPaused] = useState(false);

  const row = (hidden: boolean) =>
    logos.map((logo) => (
      <li
        aria-hidden={hidden || undefined}
        className={clsx('flex shrink-0 items-center px-7 @xl:px-10', hidden && 'ek-copy')}
        key={`${logo.src}${hidden ? '-copy' : ''}`}
      >
        <Image
          alt={hidden ? '' : logo.alt}
          className="h-12 w-auto @xl:h-14"
          height={logo.height}
          // The track scrolls, so every logo must be ready before it enters view.
          loading="eager"
          src={logo.src}
          width={logo.width}
        />
      </li>
    ));

  return (
    <HomeSection
      className={className}
      compact
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <div
        aria-label="Clients we have supplied"
        className="ek-logos relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        data-paused={paused}
        role="group"
      >
        <style>{`
          @keyframes ek-logos { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .ek-logos .ek-track { animation: ek-logos ${duration}s linear infinite; }
          .ek-logos:hover .ek-track, .ek-logos:focus-within .ek-track, .ek-logos[data-paused='true'] .ek-track { animation-play-state: paused; }
          @media (prefers-reduced-motion: reduce) { .ek-logos .ek-track { animation: none; flex-wrap: wrap; width: auto; justify-content: center; row-gap: 1.5rem; } .ek-logos .ek-copy { display: none; } }
        `}</style>
        <ul className="ek-track flex w-max items-center py-4 will-change-transform">
          {row(false)}
          {row(true)}
        </ul>
        <button
          aria-label={paused ? 'Play the logos' : 'Pause the logos'}
          aria-pressed={paused}
          className="absolute bottom-0 right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setPaused((value) => !value)}
          type="button"
        >
          {paused ? (
            <Play aria-hidden size={12} strokeWidth={2} />
          ) : (
            <Pause aria-hidden size={12} strokeWidth={2} />
          )}
        </button>
      </div>
    </HomeSection>
  );
}
