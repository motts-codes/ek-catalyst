'use client';

import { clsx } from 'clsx';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Image } from '~/components/image';

export interface SamplesVideo {
  webm?: string;
  mp4?: string;
  poster?: string;
}

interface Props {
  /** Small red-on-red label above the title, e.g. "How samples work". */
  kicker?: string;
  title?: string;
  /** One paragraph, or several. */
  description?: string | string[];
  cta?: { label: string; href: string };
  /** An optional second, outlined button beside the first. */
  secondaryCta?: { label: string; href: string };
  /** A short, silent looping clip for the right panel (omit for copy only). */
  video?: SamplesVideo;
  /** A still photo for the right panel instead of the clip (the Pro windows offer). */
  image?: { src: string; alt: string };
  /** A small disclaimer line under the buttons ("* up to 101 united inches"). */
  note?: string;
  className?: string;
}

// "Hold the real door first" — the free-samples band under the best-seller cards. Copy on the
// closing-band red (60%), a looping clip of the samples on the right (40%). The clip is muted
// and decorative, starts paused for people who prefer reduced motion, and has its own pause
// button (WCAG 2.2.2). Stacks on phones.
export function SamplesCallout({
  kicker,
  title = 'Try the finish at home. First two are on us.',
  description = 'Screens get colours wrong. Order a real door sample to hold against your walls, floors and countertop in your own light. Your first two (Quarter door samples) are free with code FREESAMPLES.',
  cta = { label: 'Order samples', href: '/samples' },
  secondaryCta,
  video,
  image,
  note,
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const el = videoRef.current;

    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const toggle = () => {
    const el = videoRef.current;

    if (!el) return;

    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className={clsx(
        'grid overflow-hidden rounded-3xl bg-[#9f3632] text-white @3xl:min-h-[330px]',
        (video ?? image) && '@3xl:grid-cols-[3fr_2fr]',
        className,
      )}
    >
      <div className="flex flex-col justify-center gap-3 px-6 py-7 @xl:px-8">
        {Boolean(kicker) && (
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{kicker}</p>
        )}
        <h3 className="font-heading text-xl font-bold leading-tight @xl:text-2xl">{title}</h3>
        {(Array.isArray(description) ? description : [description]).map((paragraph) => (
          <p className="max-w-[60ch] text-sm leading-relaxed @xl:text-base" key={paragraph}>
            {paragraph}
          </p>
        ))}
        <div className="mt-1 flex flex-wrap gap-3">
          <ButtonLink
            className="border-foreground bg-foreground text-white after:!bg-white hover:!text-foreground [&>span]:mix-blend-normal"
            href={cta.href}
            shape="pill"
            size="small"
            variant="secondary"
          >
            {cta.label}
          </ButtonLink>
          {secondaryCta && (
            <ButtonLink
              className="border-white bg-transparent text-white after:!bg-white hover:!text-[#9f3632] [&>span]:mix-blend-normal"
              href={secondaryCta.href}
              shape="pill"
              size="small"
              variant="secondary"
            >
              {secondaryCta.label}
            </ButtonLink>
          )}
        </div>
        {Boolean(note) && <p className="text-xs text-white/85">{note}</p>}
      </div>
      {image && !video && (
        <div className="relative aspect-video @3xl:aspect-auto @3xl:h-full">
          <Image
            alt={image.alt}
            className="object-cover"
            fill
            sizes="(min-width: 56rem) 40vw, 100vw"
            src={image.src}
          />
        </div>
      )}
      {video && (
        <div className="relative aspect-video @3xl:aspect-auto @3xl:h-full">
          <video
            aria-hidden
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted
            playsInline
            poster={video.poster}
            ref={videoRef}
          >
            {Boolean(video.webm) && <source src={video.webm} type="video/webm" />}
            {Boolean(video.mp4) && <source src={video.mp4} type="video/mp4" />}
          </video>
          <button
            aria-label={playing ? 'Pause video' : 'Play video'}
            aria-pressed={!playing}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg border border-white/50 bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white"
            onClick={toggle}
            type="button"
          >
            {playing ? (
              <Pause aria-hidden size={14} strokeWidth={2} />
            ) : (
              <Play aria-hidden size={14} strokeWidth={2} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
