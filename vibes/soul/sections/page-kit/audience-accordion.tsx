'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import { ArrowRight, ChevronDown, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface AudienceAccordionItem {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  image: { src: string; alt: string };
}

interface Props {
  items: AudienceAccordionItem[];
  headingLevel?: 3 | 4;
}

/** How long each row stays open before the next one takes over. */
const DWELL_MS = 6000;

// Rows of copy on the left, one photo on the right: the open row shows its paragraph and link,
// and the photo crossfades to that row's picture. The rows walk themselves every six seconds until
// someone taps a row or the pause button; they also wait while hovered or focused, and hold still
// under reduced motion. On phones the photo sits above the rows.
export function AudienceAccordion({ items, headingLevel = 3 }: Props) {
  const Heading = headingLevel === 4 ? 'h4' : 'h3';
  const [value, setValue] = useState(items[0]?.title ?? '');
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (paused || stopped || still || items.length < 2) return;

    const timer = window.setTimeout(() => {
      const i = items.findIndex((item) => item.title === value);

      setValue(items[(i + 1) % items.length]?.title ?? '');
    }, DWELL_MS);

    return () => window.clearTimeout(timer);
  }, [paused, stopped, still, items, value]);

  const current = items.find((item) => item.title === value) ?? items[0];
  // The open row's bottom hairline fills red over the dwell time, in step with the timer: both
  // restart whenever the row changes or the rows resume after a pause.
  const running = !paused && !stopped && !still && items.length > 1;
  const runKey = `${value}:${String(running)}`;

  return (
    <div
      className="grid items-start gap-8 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @3xl:gap-14"
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* The photo: every image is stacked and only the open row's shows, so the swap is a fade. */}
      <div className="relative aspect-[5/3] overflow-hidden rounded-3xl bg-contrast-100 @3xl:order-last @3xl:aspect-[5/4]">
        {items.map((item) => (
          <Image
            alt={item.image.alt}
            aria-hidden={item.title !== current?.title}
            className={clsx(
              'object-cover transition-opacity duration-700 ease-smooth motion-reduce:transition-none',
              item.title === current?.title ? 'opacity-100' : 'opacity-0',
            )}
            fill
            key={item.image.src}
            sizes="(min-width: 56rem) 50vw, 100vw"
            src={item.image.src}
          />
        ))}
      </div>

      <div>
        <AccordionPrimitive.Root
          className="border-t border-contrast-200"
          onValueChange={(next) => {
            // A tap takes over from the timer; an open row stays open (no collapsible).
            if (!next) return;
            setStopped(true);
            setValue(next);
          }}
          type="single"
          value={value}
        >
          {items.map((item) => (
            <AccordionPrimitive.Item
              className="group/item relative border-b border-contrast-200"
              key={item.title}
              value={item.title}
            >
              {item.title === value && (
                <span
                  aria-hidden
                  className={clsx(
                    'absolute inset-x-0 -bottom-px h-px origin-left bg-[var(--button-primary-background,#d90716)]',
                    running && 'animate-fill-bar motion-reduce:animate-none',
                  )}
                  key={runKey}
                  style={{ animationDuration: `${DWELL_MS}ms` }}
                />
              )}
              <AccordionPrimitive.Header asChild>
                <Heading className="m-0">
                  <AccordionPrimitive.Trigger className="group flex w-full cursor-pointer items-center gap-4 py-5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 @xl:py-6">
                    <span className="flex-1 font-heading text-xl font-bold leading-tight transition-colors duration-300 group-data-[state=open]:text-[var(--button-primary-background,#d90716)] @xl:text-2xl">
                      {item.title}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className="shrink-0 text-contrast-400 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180 group-data-[state=open]:text-[var(--button-primary-background,#d90716)]"
                      size={20}
                    />
                  </AccordionPrimitive.Trigger>
                </Heading>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
                <div className="pb-6">
                  <p className="max-w-xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
                    {item.description}
                  </p>
                  <Link
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--button-primary-background,#d90716)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
                    href={item.href}
                  >
                    {item.linkLabel}
                    <ArrowRight aria-hidden size={16} />
                  </Link>
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
        {still ? null : (
          <div className="mt-3 flex justify-end">
            <button
              aria-label={stopped ? 'Play the rows' : 'Pause the rows'}
              aria-pressed={stopped}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setStopped((v) => !v)}
              type="button"
            >
              {stopped ? (
                <Play aria-hidden size={14} strokeWidth={2} />
              ) : (
                <Pause aria-hidden size={14} strokeWidth={2} />
              )}
            </button>
          </div>
        )}
        <p aria-live="polite" className="sr-only">
          {current ? current.title : ''}
        </p>
      </div>
    </div>
  );
}
