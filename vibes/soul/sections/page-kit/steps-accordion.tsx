'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import { ArrowRight, ChevronDown, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface AccordionStep {
  title: string;
  description: string;
  /** With a photo on every step, the stack sits beside one photo that swaps with the open step. */
  image?: { src: string; alt: string };
  /** A text link under the open step's copy ("Measuring guide →"). */
  link?: { label: string; href: string };
}

interface Props {
  steps: AccordionStep[];
  /** The heading level under which the step titles sit. */
  headingLevel?: 3 | 4;
  /** `false` drops the number discs: rows that are options, not steps ("the honest take on each"). */
  numbered?: boolean;
  /** With photos: `even` splits photo and stack 50/50 from tablet up (default favours the photo 60/40). */
  split?: 'default' | 'even';
  /** `large` steps the row title and body up a size (18px / 16px). */
  size?: 'default' | 'large';
  /** With photos: `match` makes the photo as tall as the step stack from tablet up (4:3 on
   *  phones); the default keeps it 4:3 everywhere. */
  photoHeight?: 'ratio' | 'match';
}

/** How long each step stays open before the next one takes over. */
const DWELL_MS = 5000;

// Numbered steps as a stack of boxes: the open step is red with white copy, the rest show their
// headline only. The stack walks itself one step every five seconds, but only while it is on
// screen: it holds on step 1 until scrolled into view (so nobody arrives to find it on the last
// step) and pauses again when scrolled away. A tap or the pause button stops it; it also waits
// while hovered or focused, and holds still under reduced motion.
export function StepsAccordion({
  steps,
  headingLevel = 3,
  numbered = true,
  split = 'default',
  size = 'default',
  photoHeight = 'ratio',
}: Props) {
  const Heading = headingLevel === 4 ? 'h4' : 'h3';
  const [value, setValue] = useState(steps[0]?.title ?? '');
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [still, setStill] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Only run the timer while a good part of the stack is actually visible.
  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.4 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused || stopped || still || steps.length < 2) return;

    const timer = window.setTimeout(() => {
      const i = steps.findIndex((s) => s.title === value);

      setValue(steps[(i + 1) % steps.length]?.title ?? '');
    }, DWELL_MS);

    return () => window.clearTimeout(timer);
  }, [inView, paused, stopped, still, steps, value]);

  const current = steps.find((s) => s.title === value);
  const withPhotos = steps.every((s) => s.image != null);

  return (
    <div
      // Split layout (every step has a photo): the photo takes the wider left column from tablet
      // up, so the stack on the right runs a little taller; on phones the photo sits above.
      className={clsx(
        withPhotos && 'grid gap-8 @3xl:gap-12',
        withPhotos && (photoHeight === 'match' ? 'items-stretch' : 'items-start'),
        withPhotos && (split === 'even' ? '@3xl:grid-cols-2' : '@3xl:grid-cols-[3fr_2fr]'),
      )}
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      ref={rootRef}
    >
      {withPhotos && (
        <div
          className={clsx(
            'relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100',
            photoHeight === 'match' && '@3xl:aspect-auto @3xl:h-full @3xl:min-h-[20rem]',
          )}
        >
          {steps.map((step) =>
            step.image ? (
              <Image
                alt={step.image.alt}
                aria-hidden={step.title !== current?.title}
                className={clsx(
                  'object-cover transition-opacity duration-700 ease-smooth motion-reduce:transition-none',
                  step.title === current?.title ? 'opacity-100' : 'opacity-0',
                )}
                fill
                key={step.image.src}
                loading="eager"
                sizes={
                  split === 'even'
                    ? '(min-width: 56rem) 50vw, 100vw'
                    : '(min-width: 56rem) 60vw, 100vw'
                }
                src={step.image.src}
              />
            ) : null,
          )}
        </div>
      )}
      <div>
        <AccordionPrimitive.Root
          className="grid gap-3"
          collapsible
          onValueChange={(next) => {
            // A tap takes over from the timer.
            setStopped(true);
            setValue(next);
          }}
          type="single"
          value={value}
        >
          {steps.map((step, i) => (
            <AccordionPrimitive.Item
              className="group/item rounded-2xl border border-[#fcb6bb] bg-white transition-colors duration-300 data-[state=open]:border-[var(--button-primary-background,#d90716)] data-[state=open]:bg-[var(--button-primary-background,#d90716)]"
              key={step.title}
              value={step.title}
            >
              <AccordionPrimitive.Header asChild>
                <Heading className="m-0">
                  <AccordionPrimitive.Trigger className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl px-5 py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2">
                    {numbered && (
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] font-heading text-sm font-bold text-white transition-colors duration-300 group-data-[state=open]:bg-white group-data-[state=open]:text-[var(--button-primary-background,#d90716)]"
                      >
                        {i + 1}
                      </span>
                    )}
                    <span
                      className={clsx(
                        'flex-1 font-heading font-semibold leading-tight transition-colors duration-300 group-data-[state=open]:text-white',
                        size === 'large' ? 'text-lg' : 'text-base',
                      )}
                    >
                      {step.title}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className="shrink-0 text-contrast-400 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180 group-data-[state=open]:text-white"
                      size={18}
                    />
                  </AccordionPrimitive.Trigger>
                </Heading>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
                <p
                  className={clsx(
                    'px-5 pb-4 leading-relaxed text-white',
                    size === 'large' ? 'text-base' : 'text-sm',
                    numbered && 'pl-[4.25rem]',
                  )}
                >
                  {step.description}
                </p>
                {step.link != null && (
                  <Link
                    className={clsx(
                      'group/link mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                      numbered ? 'ml-[4.25rem]' : 'ml-5',
                    )}
                    href={step.link.href}
                  >
                    {step.link.label}
                    <ArrowRight
                      aria-hidden
                      className="transition-transform group-hover/link:translate-x-1"
                      size={14}
                      strokeWidth={2.5}
                    />
                  </Link>
                )}
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
        {still ? null : (
          <div className="mt-3 flex justify-end">
            <button
              aria-label={stopped ? 'Play the steps' : 'Pause the steps'}
              aria-pressed={stopped}
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-lg border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
              )}
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
          {current && numbered ? `Step ${steps.indexOf(current) + 1}: ${current.title}` : ''}
          {current && !numbered ? current.title : ''}
        </p>
      </div>
    </div>
  );
}
