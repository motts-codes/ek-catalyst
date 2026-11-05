'use client';

import { clsx } from 'clsx';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

export interface ShowcaseProject {
  src: string;
  name: string;
  location?: string;
  /** Number of units in the project, as the sheet states it. */
  units?: number;
}

interface Props {
  kicker?: string;
  title?: string;
  description?: string;
  projects: ShowcaseProject[];
  /** Milliseconds each project stays centred. */
  interval?: number;
  tint?: boolean;
  className?: string;
}

// A centred project carousel: the current project sits in the middle at full size, the
// neighbours peek in from both sides smaller and faded (the active one carries a thin red outline
// and a soft shadow), and it advances on its own, slowly: the sheets are dense. It pauses
// while hovered or focused, has prev/next and a stop/start button (WCAG 2.2.2), and never
// auto-advances when the visitor prefers reduced motion. The caption names the centred project.
export function ProjectShowcase({
  kicker,
  title,
  description,
  projects,
  interval = 5800,
  tint = false,
  className,
}: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [selected, setSelected] = useState(0);

  const [viewportRef, api] = useEmblaCarousel({ loop: true, align: 'center', skipSnaps: false }, [
    Autoplay({ delay: interval }),
  ]);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setSelected(api.selectedSnap());

    onSelect();
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  useEffect(() => {
    const autoplay = api?.plugins().autoplay;

    if (!autoplay) return;

    if (reduceMotion || stopped) autoplay.stop();
    else autoplay.play();
  }, [api, reduceMotion, stopped]);

  // Back to auto-advance after a hover or focus, unless the visitor stopped it or prefers less motion.
  const resume = useCallback(() => {
    if (!reduceMotion && !stopped) api?.plugins().autoplay.play();
  }, [api, reduceMotion, stopped]);
  const scrollPrev = useCallback(() => api?.goToPrev(), [api]);
  const scrollNext = useCallback(() => api?.goToNext(), [api]);
  const current = projects[selected];

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
        aria-roledescription="carousel"
        className="relative"
        onBlur={() => resume()}
        onFocus={() => api?.plugins().autoplay.stop()}
        onMouseEnter={() => api?.plugins().autoplay.stop()}
        onMouseLeave={() => resume()}
        role="group"
      >
        <div className="overflow-hidden pb-12 pt-6" ref={viewportRef}>
          <div className="flex touch-pan-y">
            {projects.map((project, index) => {
              const active = index === selected;

              return (
                <div
                  aria-hidden={!active}
                  aria-label={`${index + 1} of ${projects.length}`}
                  aria-roledescription="slide"
                  className="min-w-0 shrink-0 grow-0 basis-[86%] px-2 @xl:basis-[72%] @xl:px-3 @3xl:basis-[62%]"
                  key={project.src}
                  role="group"
                >
                  <div
                    className={clsx(
                      'relative aspect-[1600/1035] overflow-hidden rounded-2xl bg-contrast-100 transition-[transform,opacity,box-shadow] duration-700 ease-smooth @xl:rounded-3xl motion-reduce:transition-none',
                      active
                        ? 'scale-100 opacity-100 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)] ring-1 ring-[color:var(--button-primary-background,#d90716)]'
                        : 'scale-[0.9] opacity-30 ring-1 ring-contrast-100',
                    )}
                  >
                    <Image
                      alt={`${project.name}${project.location ? `, ${project.location}` : ''}: project sheet`}
                      className="object-cover"
                      fill
                      loading={index < 3 ? 'eager' : 'lazy'}
                      sizes="(min-width: 56rem) 62vw, 86vw"
                      src={project.src}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between @xl:gap-4">
          <p aria-live="polite" className="min-w-0 text-sm text-contrast-500">
            <span className="font-semibold text-foreground">{current?.name}</span>
            {current?.location ? ` · ${current.location}` : ''}
            {current?.units != null && (
              <>
                {' · '}
                <span className="font-semibold text-[var(--button-primary-background,#d90716)]">
                  {current.units.toLocaleString('en-US')} units
                </span>
              </>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="me-1 text-xs tabular-nums text-contrast-500">
              {selected + 1}/{projects.length}
            </span>
            <button
              aria-label="Previous project"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              onClick={scrollPrev}
              type="button"
            >
              <ArrowLeft aria-hidden size={16} strokeWidth={1.75} />
            </button>
            <button
              aria-label="Next project"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              onClick={scrollNext}
              type="button"
            >
              <ArrowRight aria-hidden size={16} strokeWidth={1.75} />
            </button>
            <button
              aria-label={stopped ? 'Play the projects' : 'Pause the projects'}
              aria-pressed={stopped}
              className="ms-1 flex h-9 w-9 items-center justify-center rounded-full border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setStopped((value) => !value)}
              type="button"
            >
              {stopped ? (
                <Play aria-hidden size={14} strokeWidth={2} />
              ) : (
                <Pause aria-hidden size={14} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
