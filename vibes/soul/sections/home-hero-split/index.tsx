'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { Pause, Play } from 'lucide-react';
import { Fragment, useCallback, useEffect, useState } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

/** Button color — pick to suit the banner background (photo vs light card). */
export type HeroCtaColor = 'red' | 'black' | 'white';

export interface HeroSlide {
  /** Headline; use "\n" for a manual line break (the wireframe headlines are two lines). */
  title: string;
  image?: { src: string; alt: string };
  /** Whole slide links here when set. */
  href?: string;
  ctaLabel?: string;
  /** Hide the button (default shown). */
  showCta?: boolean;
  /** Default red (sits on the photo). */
  ctaColor?: HeroCtaColor;
  /**
   * Where the words go. `bottom` (default): headline bottom-left, button bottom-right. `top`:
   * headline top-left with the button under it, for a photo whose subject fills the lower half.
   */
  textPosition?: 'bottom' | 'top';
  /** Which side of the photo to keep when the panel is narrower than the image (default centre). */
  imagePosition?: 'left' | 'center' | 'right';
}

export interface HeroOffer {
  kicker: string;
  headline: string;
  description?: string;
  href: string;
  ctaLabel?: string;
  /** Hide the button (default shown). */
  showCta?: boolean;
  /** Default white (sits on the light card). */
  ctaColor?: HeroCtaColor;
  /**
   * Optional photo. With one, the card becomes a photo banner: the picture fills it and the copy
   * sits over it in white with no scrim, so bake any darkening the text needs into the photo
   * (about 510×350 at 1×; double for retina).
   */
  image?: { src: string; alt: string };
}

// Slightly smaller on phones so headline + button share one row at 390px wide.
const CTA_BASE =
  'inline-flex min-h-9 items-center justify-center rounded-full px-3.5 text-[13px] font-semibold transition-colors @xl:min-h-10 @xl:px-5 @xl:text-sm';
const CTA_COLOR: Record<HeroCtaColor, string> = {
  red: 'bg-[var(--button-primary-background,#d90716)] text-white hover:opacity-90',
  black: 'bg-black text-white hover:bg-neutral-800',
  white: 'bg-white text-foreground hover:bg-neutral-100',
};

interface Props {
  slides: HeroSlide[];
  /** The offer card is stationary: the first offer is shown, so it is always on screen. */
  offers: HeroOffer[];
  /** Photo rotation, ms (8 s: three slides, headline and button only). */
  slideInterval?: number;
  className?: string;
}

// Embla wrapper for the photo column: loop + autoplay + fade. Autoplay runs by default, pauses
// while the pointer or keyboard focus is on the banner, and the visitor can stop/start it with the
// button (WCAG 2.2.2). `playing` follows the plugin; `held` is the visitor's own choice to stop.
function useRotator(interval: number, active: boolean) {
  const [ref, api] = useEmblaCarousel({ loop: true, duration: 20 }, [
    Autoplay({ delay: interval, active }),
    Fade(),
  ]);
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [held, setHeld] = useState(false);
  // Bumped whenever playback (re)starts so the progress line's animation restarts in step.
  const [playCount, setPlayCount] = useState(0);

  const onSelect = useCallback((embla: EmblaCarouselType) => {
    setSelected(embla.selectedSnap());
    setCount(embla.snapList().length);
  }, []);

  useEffect(() => {
    if (!api) return;

    onSelect(api);

    const onPlay = () => {
      setPlaying(true);
      setPlayCount((n) => n + 1);
    };
    const onStop = () => setPlaying(false);

    api
      .on('select', onSelect)
      .on('reinit', onSelect)
      .on('autoplay:play', onPlay)
      .on('autoplay:stop', onStop);

    // Embla 9 no longer starts autoplay on init — start it explicitly, and again after a reinit
    // (e.g. a resize). Only when there is something to rotate, and never under "reduce motion".
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startAutoplay = () => {
      if (!reduceMotion && api.snapList().length > 1) api.plugins().autoplay.play();
    };

    startAutoplay();
    api.on('reinit', startAutoplay);

    return () => {
      api
        .off('select', onSelect)
        .off('reinit', onSelect)
        .off('autoplay:play', onPlay)
        .off('autoplay:stop', onStop)
        .off('reinit', startAutoplay);
    };
  }, [api, onSelect]);

  const goTo = useCallback(
    (index: number) => {
      api?.goTo(index);
      // Picking a slide restarts the timer so the new slide gets its full stay.
      if (api && !held) api.plugins().autoplay.play();
    },
    [api, held],
  );

  // The visitor's stop/start button. Acts on their choice (`held`), not on the plugin's momentary
  // state — the pointer is over the banner when they click, so autoplay is already suspended.
  const toggle = useCallback(() => {
    if (!api) return;

    if (held) {
      api.plugins().autoplay.play();
      setHeld(false);
    } else {
      api.plugins().autoplay.stop();
      setHeld(true);
    }
  }, [api, held]);

  // Pointer / focus on the banner pauses it; leaving resumes unless the visitor stopped it.
  const suspend = useCallback(() => api?.plugins().autoplay.stop(), [api]);
  const resume = useCallback(() => {
    if (api && !held) api.plugins().autoplay.play();
  }, [api, held]);

  return {
    ref,
    selected,
    count,
    goTo,
    playing,
    held,
    playCount,
    toggle,
    suspend,
    resume,
    interval,
  };
}

// Slide controls, top-right of the photo: one progress line per slide (the active one fills over
// the slide's stay, so you can see when it will change) and the stop/start button.
function SlideControls({
  count,
  selected,
  playing,
  held,
  playCount,
  interval,
  onSelect,
  onToggle,
}: {
  count: number;
  selected: number;
  /** Autoplay timer currently running (false while hovered / focused / stopped). */
  playing: boolean;
  /** The visitor pressed stop; drives the button's label and icon. */
  held: boolean;
  playCount: number;
  interval: number;
  onSelect: (index: number) => void;
  onToggle: () => void;
}) {
  if (count < 2) return null;

  return (
    <div className="absolute right-2 top-2 z-[1] flex items-center gap-1 @xl:right-3 @xl:top-3">
      <div aria-label="Slides" className="flex items-center" role="group">
        {Array.from({ length: count }).map((_, index) => (
          // 24px-tall hit area (target size) around a 2px line.
          <button
            aria-current={index === selected ? 'true' : undefined}
            aria-label={`Slide ${index + 1} of ${count}`}
            className="flex h-6 items-center px-1 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white"
            key={index}
            onClick={() => onSelect(index)}
            type="button"
          >
            <span className="relative block h-0.5 w-7 overflow-hidden rounded-full bg-white/40 @xl:w-9">
              {index === selected && (
                <span
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white motion-reduce:animate-none"
                  key={`fill-${playCount}`}
                  style={{
                    animation: `ek-hero-progress ${interval}ms linear forwards`,
                    animationPlayState: playing ? 'running' : 'paused',
                    transform: playing ? undefined : 'scaleX(1)',
                  }}
                />
              )}
            </span>
          </button>
        ))}
      </div>
      <button
        aria-label={held ? 'Play slideshow' : 'Pause slideshow'}
        aria-pressed={held}
        className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-white/50 bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/40 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white"
        onClick={onToggle}
        type="button"
      >
        {held ? (
          <Play aria-hidden size={14} strokeWidth={2} />
        ) : (
          <Pause aria-hidden size={14} strokeWidth={2} />
        )}
      </button>
    </div>
  );
}

// Home hero, 65 / 35: a rotating photo slideshow with a two-line headline bottom-left, beside one
// stationary offer card. One moving thing on the screen; the offer is always readable.
export function HomeHeroSplit({ slides, offers, slideInterval = 8000, className }: Props) {
  const photos = useRotator(slideInterval, slides.length > 1);
  const offer = offers[0];

  return (
    <section className={clsx('@container', className)}>
      {/* The hero alone sits on the nav card's edges (not the logo gutter the rest of the page
          uses), so the banner and the floating nav read as one block. */}
      <div className="mx-auto max-w-screen-2xl px-4 pb-2 pt-3 @xl:px-6 @4xl:px-8">
        <div className="grid gap-3.5 @3xl:grid-cols-[65fr_35fr]">
          {/* Left: photo slideshow */}
          <div
            className="relative h-[325px] overflow-hidden rounded-3xl bg-contrast-100 @xl:h-[320px] @3xl:h-[350px]"
            onBlur={photos.resume}
            onFocus={photos.suspend}
            onMouseEnter={photos.suspend}
            onMouseLeave={photos.resume}
          >
            <div className="h-full overflow-hidden" ref={photos.ref}>
              <div className="flex h-full">
                {slides.map((slide, index) => {
                  const content = (
                    <>
                      {slide.image?.src ? (
                        <Image
                          alt={slide.image.alt}
                          className={clsx(
                            'object-cover',
                            slide.imagePosition === 'left' && 'object-left',
                            slide.imagePosition === 'right' && 'object-right',
                          )}
                          fill
                          preload={index === 0}
                          sizes="(min-width: 56rem) 65vw, 100vw"
                          src={slide.image.src}
                        />
                      ) : (
                        <div
                          aria-hidden
                          className="flex h-full w-full items-center justify-center bg-neutral-600 p-6 text-center text-sm text-white/70"
                        >
                          Photo — {slide.image?.alt ?? 'kitchen'}
                        </div>
                      )}
                      {/* Bottom row: headline left, button right. No tint here — any darkening for
                          legibility is baked into the photo itself. The button is a styled span
                          because the whole slide is already the link. */}
                      <div
                        className={clsx(
                          'absolute inset-x-0 px-4 @xl:px-8',
                          slide.textPosition === 'top'
                            ? 'top-0 pb-10 pt-5 @xl:pt-7'
                            : 'bottom-0 pb-10 pt-16 @xl:pb-8',
                        )}
                      >
                        <div
                          className={clsx(
                            'flex gap-x-2 gap-y-3 @xl:gap-x-6',
                            slide.textPosition === 'top'
                              ? 'flex-col items-start pr-28 @xl:pr-36'
                              : 'flex-wrap items-end justify-between',
                          )}
                        >
                          <h1
                            className={clsx(
                              'm-0 max-w-xl font-heading text-[28px] font-bold leading-[1.05] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35),0_2px_14px_rgb(0_0_0/0.25)]',
                              // Top-left copy shares the frame with the photo's subject, so a step smaller.
                              slide.textPosition === 'top'
                                ? '@xl:text-2xl @4xl:text-[27px]'
                                : '@xl:text-3xl @4xl:text-[2.5rem]',
                            )}
                          >
                            {slide.title.split('\n').map((line, lineIndex) => (
                              <Fragment key={lineIndex}>
                                {lineIndex > 0 && <br />}
                                {line}
                              </Fragment>
                            ))}
                          </h1>
                          {slide.showCta !== false &&
                            Boolean(slide.ctaLabel) &&
                            Boolean(slide.href) && (
                              <span
                                className={clsx(
                                  CTA_BASE,
                                  'shrink-0',
                                  CTA_COLOR[slide.ctaColor ?? 'red'],
                                )}
                              >
                                {slide.ctaLabel}
                              </span>
                            )}
                        </div>
                      </div>
                    </>
                  );

                  return (
                    <div className="relative h-full min-w-0 shrink-0 grow-0 basis-full" key={index}>
                      {slide.href ? (
                        <Link className="block h-full" href={slide.href}>
                          {content}
                        </Link>
                      ) : (
                        <div className="block h-full">{content}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <SlideControls
              count={photos.count}
              held={photos.held}
              interval={photos.interval}
              onSelect={photos.goTo}
              onToggle={photos.toggle}
              playCount={photos.playCount}
              playing={photos.playing}
              selected={photos.selected}
            />
          </div>

          {/* Right: the offer card, stationary */}
          {/* Auto height on phones (the offer copy + button set it); fixed heights from @xl. */}
          {offer && (
            <div
              className={clsx(
                'relative h-auto overflow-hidden rounded-3xl @xl:h-[320px] @3xl:h-[350px]',
                offer.image
                  ? 'min-h-[240px] bg-contrast-100 text-white'
                  : 'border border-contrast-100 bg-[#f9fafd]',
              )}
            >
              {offer.image && (
                <Image
                  alt={offer.image.alt}
                  className="object-cover"
                  fill
                  preload
                  sizes="(min-width: 56rem) 35vw, 100vw"
                  src={offer.image.src}
                />
              )}
              {/* Eyebrow top-left; headline and line bottom-left; button bottom-right. Bottom
                  padding matches the photo banner's (@xl:pb-8) so both buttons sit on one line
                  across the two banners. No scrim: any darkening is baked into the photo. */}
              <div className="relative flex h-full flex-col p-6 pb-8 @xl:p-8 @xl:pb-8">
                <p className="self-start rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)] ring-1 ring-contrast-100">
                  {offer.kicker}
                </p>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-6">
                  <div className="max-w-[30ch]">
                    <p
                      className={clsx(
                        'font-heading text-xl font-bold leading-[1.1] @xl:text-2xl',
                        offer.image && '[text-shadow:0_1px_2px_rgb(0_0_0/0.35)]',
                      )}
                    >
                      {offer.headline.split('\n').map((line, lineIndex) => (
                        <Fragment key={lineIndex}>
                          {lineIndex > 0 && <br />}
                          {line}
                        </Fragment>
                      ))}
                    </p>
                    {Boolean(offer.description) && (
                      <p
                        className={clsx(
                          'mt-2 text-sm',
                          offer.image ? 'text-white' : 'text-contrast-500',
                        )}
                      >
                        {offer.description}
                      </p>
                    )}
                  </div>
                  {offer.showCta !== false && (
                    <Link
                      className={clsx(CTA_BASE, CTA_COLOR[offer.ctaColor ?? 'white'])}
                      href={offer.href}
                    >
                      {offer.ctaLabel ?? 'See the offer'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
