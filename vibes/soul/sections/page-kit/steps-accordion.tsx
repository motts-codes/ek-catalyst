'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { clsx } from 'clsx';
import { ChevronDown, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface AccordionStep {
  title: string;
  description: string;
}

interface Props {
  steps: AccordionStep[];
  /** The heading level under which the step titles sit. */
  headingLevel?: 3 | 4;
  /** `false` drops the number discs: rows that are options, not steps ("the honest take on each"). */
  numbered?: boolean;
}

/** How long each step stays open before the next one takes over. */
const DWELL_MS = 5000;

// Numbered steps as a stack of boxes: the open step is red with white copy, the rest show their
// headline only. The stack walks itself one step every five seconds until someone taps a step or
// the pause button; it also waits while hovered or focused, and holds still under reduced motion.
export function StepsAccordion({ steps, headingLevel = 3, numbered = true }: Props) {
  const Heading = headingLevel === 4 ? 'h4' : 'h3';
  const [value, setValue] = useState(steps[0]?.title ?? '');
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (paused || stopped || still || steps.length < 2) return;

    const timer = window.setTimeout(() => {
      const i = steps.findIndex((s) => s.title === value);

      setValue(steps[(i + 1) % steps.length]?.title ?? '');
    }, DWELL_MS);

    return () => window.clearTimeout(timer);
  }, [paused, stopped, still, steps, value]);

  const current = steps.find((s) => s.title === value);

  return (
    <div
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
            className="group/item rounded-2xl border border-contrast-100 bg-white transition-colors duration-300 data-[state=open]:border-[var(--button-primary-background,#d90716)] data-[state=open]:bg-[var(--button-primary-background,#d90716)]"
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
                  <span className="flex-1 font-heading text-base font-semibold leading-tight transition-colors duration-300 group-data-[state=open]:text-white">
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
                  'px-5 pb-4 text-sm leading-relaxed text-white',
                  numbered && 'pl-[4.25rem]',
                )}
              >
                {step.description}
              </p>
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
  );
}
