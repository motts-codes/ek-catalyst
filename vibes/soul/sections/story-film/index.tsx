'use client';

import { clsx } from 'clsx';
import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { homeHeadingClassName, HomeSection } from '@/vibes/soul/sections/home-section';

export interface FilmChapter {
  label: string;
  /** Seconds into the film where this chapter starts. */
  start: number;
}

interface Props {
  kicker?: string;
  title: string;
  description: string;
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
  /** The film: `src` is the MP4 every browser plays; `webm` is offered first where supported. */
  video: { src: string; webm?: string; poster?: string; title?: string };
  /** Four or so captions under the film; each one jumps to its moment. */
  chapters?: FilmChapter[];
  tint?: boolean;
  className?: string;
}

// The brand-story band as a film: copy on top, the film centred below with a poster and a play
// button, and chapter captions underneath that jump to their moment and fill as the film plays.
// The film only plays when asked (it has sound), with the browser's own controls once it starts.
export function StoryFilm({
  kicker,
  title,
  description,
  actions = [],
  video,
  chapters = [],
  tint = false,
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = videoRef.current;

    if (!el) return;

    const onTime = () => setTime(el.currentTime);
    const onMeta = () => setDuration(el.duration);

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);

    if (el.duration) setDuration(el.duration);

    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
    };
  }, []);

  const play = (from?: number) => {
    const el = videoRef.current;

    if (!el) return;

    if (from != null) el.currentTime = from;

    setStarted(true);
    void el.play();
  };

  const chapterEnd = (index: number) =>
    chapters[index + 1]?.start ?? (duration > 0 ? duration : Number.POSITIVE_INFINITY);
  const activeIndex = chapters.reduce(
    (found, chapter, index) => (started && time >= chapter.start ? index : found),
    -1,
  );
  const chapterProgress = (index: number) => {
    if (activeIndex > index) return 1;
    if (activeIndex < index) return 0;

    const chapter = chapters[index];

    if (!chapter) return 0;

    const length = Math.max(0.1, chapterEnd(index) - chapter.start);

    return Math.min(1, (time - chapter.start) / length);
  };

  return (
    <HomeSection className={className} tint={tint}>
      <div className="max-w-3xl">
        {Boolean(kicker) && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
            {kicker}
          </p>
        )}
        <h2 className={homeHeadingClassName}>{title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-contrast-500 @xl:text-base">
          {description}
        </p>
        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) =>
              action.primary ? (
                <ButtonLink
                  href={action.href}
                  key={action.label}
                  shape="pill"
                  size="small"
                  variant="primary"
                >
                  {action.label}
                </ButtonLink>
              ) : (
                <ButtonLink
                  className="!border-[0.5px] border-foreground bg-white text-foreground after:!bg-foreground hover:!text-white"
                  href={action.href}
                  key={action.label}
                  shape="pill"
                  size="small"
                  variant="tertiary"
                >
                  {action.label}
                </ButtonLink>
              ),
            )}
          </div>
        )}
      </div>

      {/* The film, centred at 80% of the band on wide screens, chapters aligned under it. */}
      <div className="mx-auto mt-10 w-full @3xl:w-4/5 @4xl:mt-14">
        <div className="relative aspect-[35/18] overflow-hidden rounded-3xl bg-contrast-100">
          <video
            className="h-full w-full object-cover"
            controls={started}
            playsInline
            poster={video.poster}
            preload="metadata"
            ref={videoRef}
          >
            {video.webm ? <source src={video.webm} type="video/webm" /> : null}
            <source src={video.src} type="video/mp4" />
            <track kind="captions" />
          </video>
          {!started && (
            <button
              aria-label={`Play: ${video.title ?? title}`}
              className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
              onClick={() => play()}
              type="button"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-foreground shadow-[0_12px_40px_-12px_rgb(0_0_0/0.5)] transition-transform duration-300 ease-smooth group-hover:scale-105">
                <Play aria-hidden className="ml-1" fill="currentColor" size={28} strokeWidth={0} />
              </span>
            </button>
          )}
        </div>

        {/* Chapters: a line per chapter that fills as the film plays through it. */}
        {chapters.length > 0 && (
          <div
            aria-label="Chapters"
            className="mt-8 grid gap-x-4 gap-y-3 @lg:grid-cols-2 @3xl:grid-cols-4"
            role="group"
          >
            {chapters.map((chapter, index) => {
              const progress = chapterProgress(index);
              const active = activeIndex === index;

              return (
                <button
                  aria-current={active ? 'true' : undefined}
                  className="group text-left focus-visible:outline-none"
                  key={chapter.label}
                  onClick={() => play(chapter.start)}
                  type="button"
                >
                  <span
                    aria-hidden
                    className="block h-0.5 w-full overflow-hidden rounded-full bg-contrast-200"
                  >
                    <span
                      className="block h-full bg-[var(--button-primary-background,#d90716)] transition-[width] duration-300 ease-linear"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </span>
                  <span
                    className={clsx(
                      'mt-3 block text-sm font-semibold transition-colors group-hover:text-foreground group-focus-visible:text-[var(--button-primary-background,#d90716)]',
                      active ? 'text-foreground' : 'text-contrast-500',
                    )}
                  >
                    {chapter.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </HomeSection>
  );
}
