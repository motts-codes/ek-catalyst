'use client';

import { clsx } from 'clsx';
import { Hammer, type LucideIcon, Ruler, ShoppingCart, Sparkles, Truck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Icons by name, resolved here: a server component can't hand a client one a component.
export type StepperIcon = 'cart' | 'truck' | 'hammer' | 'ruler' | 'sparkles';

const ICONS: Record<StepperIcon, LucideIcon> = {
  cart: ShoppingCart,
  truck: Truck,
  hammer: Hammer,
  ruler: Ruler,
  sparkles: Sparkles,
};

export interface StepperStep {
  icon: StepperIcon;
  lead: string;
  text: string;
}

const RED = 'var(--button-primary-background,#d90716)';
// How long the line takes to travel from one circle to the next (linear, so it reads as steady
// motion); the next step lights up the moment the line reaches it.
const LINE_MS = 1600;

// The remodel timeline as an animated stepper. At rest only the outline circles (each holding
// its step's icon) and the grey line between them show. Once it scrolls into view the steps light up one
// after another: the line travels from the lit circle to the next at a steady pace, and when it
// arrives that circle fills red and its words fade in under it.
// Click a circle to jump to that step. People who prefer reduced motion see the finished state.
export function Stepper({ steps }: { steps: StepperStep[] }) {
  const root = useRef<HTMLOListElement>(null);
  // How many steps have lit up (0 = none yet); the last lit one is "current".
  const [lit, setLit] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = root.current;

    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLit(steps.length);

      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [steps.length]);

  // Once in view, light the steps up one at a time.
  useEffect(() => {
    if (!started || lit >= steps.length) return;

    const timer = window.setTimeout(
      () => setLit((n) => Math.max(n, n + 1)),
      lit === 0 ? 150 : LINE_MS,
    );

    return () => window.clearTimeout(timer);
  }, [started, lit, steps.length]);

  return (
    <ol className="grid [--line-ms:1600ms] @3xl:grid-cols-5" ref={root}>
      {steps.map((step, index) => {
        const active = index < lit;
        const current = index === lit - 1;
        const last = index === steps.length - 1;
        const Icon = ICONS[step.icon];

        return (
          <li
            className="relative flex gap-5 pb-8 @3xl:flex-col @3xl:items-center @3xl:gap-0 @3xl:pb-0 @3xl:text-center"
            key={step.lead}
          >
            {/* Phones: the rail runs down from this circle to the next. Desktop: across to it. */}
            {!last && (
              <>
                <span
                  aria-hidden
                  className="absolute left-[22px] top-11 h-full w-0.5 -translate-x-1/2 bg-contrast-200 @3xl:hidden"
                >
                  <span
                    className={clsx(
                      'block h-full w-full origin-top transition-transform [transition-duration:var(--line-ms)] [transition-timing-function:linear]',
                      index < lit ? 'scale-y-100' : 'scale-y-0',
                    )}
                    style={{ backgroundColor: RED }}
                  />
                </span>
                <span
                  aria-hidden
                  className="absolute left-1/2 top-[22px] hidden h-0.5 w-full bg-contrast-200 @3xl:block"
                >
                  <span
                    className={clsx(
                      'block h-full w-full origin-left transition-transform [transition-duration:var(--line-ms)] [transition-timing-function:linear]',
                      index < lit ? 'scale-x-100' : 'scale-x-0',
                    )}
                    style={{ backgroundColor: RED }}
                  />
                </span>
              </>
            )}

            <button
              aria-current={current ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${step.lead}`}
              className={clsx(
                'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,border-color,color,box-shadow] duration-300',
                active
                  ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
                  : 'border-contrast-300 bg-white text-contrast-500 hover:border-contrast-400',
                current && 'ring-4 ring-[rgb(217_7_22/0.15)]',
              )}
              onClick={() => setLit(index + 1)}
              type="button"
            >
              <Icon aria-hidden size={20} strokeWidth={2} />
            </button>

            <div
              className={clsx(
                'min-w-0 transition-[opacity,transform] duration-500 ease-out @3xl:mt-5 @3xl:px-3',
                active ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
              )}
            >
              <h3 className="font-heading text-lg font-semibold leading-tight">{step.lead}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-contrast-500">{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
