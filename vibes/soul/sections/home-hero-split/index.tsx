'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
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
  /** Default white (sits on the photo). */
  ctaColor?: HeroCtaColor;
}

export interface HeroOffer {
  kicker: string;
  headline: string;
  description?: string;
  href: string;
  ctaLabel?: string;
  /** Hide the button (default shown). */
  showCta?: boolean;
  /** Default red (sits on the light card). */
  ctaColor?: HeroCtaColor;
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
  offers: HeroOffer[];
  /** Photo rotation, ms (wireframe: 15 s). */
  slideInterval?: number;
  /** Offer rotation, ms (wireframe: 8 s). */
  offerInterval?: number;
  className?: string;
}

// Minimal embla wrapper shared by both columns: loop + autoplay + fade, exposing the selected
// index so each column can draw its own dots.
function useRotator(interval: number, active: boolean) {
  const [ref, api] = useEmblaCarousel({ loop: true, duration: 20 }, [
    Autoplay({ delay: interval, active }),
    Fade(),
  ]);
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(0);

  const onSelect = useCallback((embla: EmblaCarouselType) => {
    setSelected(embla.selectedSnap());
    setCount(embla.snapList().length);
  }, []);

  useEffect(() => {
    if (!api) return;

    onSelect(api);
    api.on('select', onSelect).on('reinit', onSelect);

    // Embla 9 no longer starts autoplay on init — start it explicitly, and again after a reinit
    // (e.g. a resize). Only when there is something to rotate.
    const startAutoplay = () => {
      if (api.snapList().length > 1) api.plugins().autoplay.play();
    };

    startAutoplay();
    api.on('reinit', startAutoplay);

    return () => {
      api.off('select', onSelect).off('reinit', onSelect).off('reinit', startAutoplay);
    };
  }, [api, onSelect]);

  const goTo = useCallback((index: number) => api?.goTo(index), [api]);

  return { ref, selected, count, goTo };
}

function Dots({
  count,
  selected,
  onSelect,
  dark = false,
  label,
}: {
  count: number;
  selected: number;
  onSelect: (index: number) => void;
  dark?: boolean;
  label: string;
}) {
  if (count < 2) return null;

  const activeClass = dark ? 'bg-foreground' : 'bg-white';
  const inactiveClass = dark
    ? 'bg-foreground/25 hover:bg-foreground/50'
    : 'bg-white/50 hover:bg-white/80';

  return (
    // Dots: bottom-right on phones, top-right from @xl (keeps the bottom row free for the button).
    <div className="absolute inset-x-0 bottom-3 z-10 flex justify-end gap-1.5 pr-4 @xl:bottom-auto @xl:top-4 @xl:pr-5">
      {Array.from({ length: count }).map((_, index) => (
        <button
          aria-label={`${label} ${index + 1} of ${count}`}
          className={clsx(
            'h-2 w-2 rounded-full transition-colors',
            index === selected ? activeClass : inactiveClass,
          )}
          key={index}
          onClick={() => onSelect(index)}
          type="button"
        />
      ))}
    </div>
  );
}

// Home hero, 65 / 35: a rotating photo slideshow with a two-line headline bottom-left, beside a
// rotating stack of offer cards. Stacks on narrow screens.
export function HomeHeroSplit({
  slides,
  offers,
  slideInterval = 15000,
  offerInterval = 8000,
  className,
}: Props) {
  const photos = useRotator(slideInterval, slides.length > 1);
  const promos = useRotator(offerInterval, offers.length > 1);

  return (
    <section className={clsx('@container', className)}>
      <div className="mx-auto max-w-screen-2xl px-4 pb-2 pt-3 @xl:px-6 @4xl:px-8">
        <div className="grid gap-3.5 @3xl:grid-cols-[65fr_35fr]">
          {/* Left: photo slideshow */}
          <div className="relative h-[325px] overflow-hidden rounded-3xl bg-contrast-100 @xl:h-[320px] @3xl:h-[350px]">
            <div className="h-full overflow-hidden" ref={photos.ref}>
              <div className="flex h-full">
                {slides.map((slide, index) => {
                  const content = (
                    <>
                      {slide.image?.src ? (
                        <Image
                          alt={slide.image.alt}
                          className="object-cover"
                          fill
                          preload={index === 0}
                          sizes="(min-width: 56rem) 65vw, 100vw"
                          src={slide.image.src}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-contrast-200 p-6 text-center text-sm text-contrast-500">
                          Photo — {slide.image?.alt ?? 'kitchen'}
                        </div>
                      )}
                      {/* Bottom row: headline left, button right. No tint here — any darkening for
                          legibility is baked into the photo itself. The button is a styled span
                          because the whole slide is already the link. */}
                      <div className="absolute inset-x-0 bottom-0 px-4 pb-10 pt-16 @xl:px-8 @xl:pb-8">
                        <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-3 @xl:gap-x-6">
                          <h1 className="m-0 max-w-xl font-heading text-[22px] font-bold leading-tight text-white @xl:text-3xl @4xl:text-4xl">
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
                                  CTA_COLOR[slide.ctaColor ?? 'white'],
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
            <Dots
              count={photos.count}
              label="Slide"
              onSelect={photos.goTo}
              selected={photos.selected}
            />
          </div>

          {/* Right: offer cards */}
          {/* Auto height on phones (the offer copy + button set it); fixed heights from @xl. */}
          <div className="relative h-auto overflow-hidden rounded-3xl border border-contrast-100 bg-[#f9fafd] @xl:h-[320px] @3xl:h-[350px]">
            <div className="h-full overflow-hidden" ref={promos.ref}>
              <div className="flex h-full">
                {offers.map((offer, index) => (
                  <div className="relative h-full min-w-0 shrink-0 grow-0 basis-full" key={index}>
                    {/* Bottom padding matches the photo banner's (@xl:pb-8) so both buttons sit
                        on the same line across the two banners. */}
                    <div className="flex h-full flex-col gap-2 p-6 pb-8 @xl:p-8 @xl:pb-8">
                      <p className="self-start rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-contrast-500 ring-1 ring-contrast-100">
                        {offer.kicker}
                      </p>
                      <p className="font-heading text-xl font-bold leading-tight @xl:text-2xl">
                        {offer.headline}
                      </p>
                      {Boolean(offer.description) && (
                        <p className="text-sm text-contrast-500">{offer.description}</p>
                      )}
                      {offer.showCta !== false && (
                        <div className="mt-auto pt-3">
                          <Link
                            className={clsx(CTA_BASE, CTA_COLOR[offer.ctaColor ?? 'red'])}
                            href={offer.href}
                          >
                            {offer.ctaLabel ?? 'See the offer'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Dots
              count={promos.count}
              dark
              label="Offer"
              onSelect={promos.goTo}
              selected={promos.selected}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
