'use client';

import { clsx } from 'clsx';
import {
  Award,
  BadgeDollarSign,
  Building2,
  CalendarDays,
  type LucideIcon,
  MapPin,
  Package,
  Pause,
  PencilRuler,
  Play,
  ShieldCheck,
  Star,
  Truck,
  Users,
} from 'lucide-react';
import { useState } from 'react';

const ICONS = {
  package: Package,
  star: Star,
  design: PencilRuler,
  pin: MapPin,
  shield: ShieldCheck,
  truck: Truck,
  building: Building2,
  users: Users,
  dollar: BadgeDollarSign,
  award: Award,
  calendar: CalendarDays,
} satisfies Record<string, LucideIcon>;

export interface Metric {
  icon: keyof typeof ICONS;
  value: string;
  label: string;
}

interface Props {
  metrics: Metric[];
  /** Seconds for one full pass of the list (92 ≈ 1.2× the original 110s pace). */
  duration?: number;
  className?: string;
}

// A slow horizontal ticker of headline figures under the hero: red Gilroy numbers, a small label
// and a Lucide icon, separated by hairlines. The track is doubled so the loop is seamless. It
// pauses while hovered or focused and has a stop/start button (WCAG 2.2.2); reduced motion lays
// the figures out in a wrapped row instead.
export function MetricsTicker({ metrics, duration = 92, className }: Props) {
  const [paused, setPaused] = useState(false);

  const row = (hidden: boolean) =>
    metrics.map((metric) => {
      const Icon = ICONS[metric.icon];

      return (
        <li
          aria-hidden={hidden || undefined}
          className={clsx(
            'flex shrink-0 items-center gap-3.5 border-l border-[#fcb6bb] px-8 @xl:px-12',
            hidden && 'ek-copy',
          )}
          key={`${metric.label}${hidden ? '-copy' : ''}`}
        >
          <Icon
            aria-hidden
            className="shrink-0 text-[var(--button-primary-background,#d90716)]"
            size={22}
            strokeWidth={1.75}
          />
          <span className="font-heading text-2xl font-bold leading-none text-[var(--button-primary-background,#d90716)] @xl:text-[28px]">
            {metric.value}
          </span>
          <span className="whitespace-nowrap text-sm text-[#404040] @xl:text-base">
            {metric.label}
          </span>
        </li>
      );
    });

  return (
    <section
      aria-label="Express Kitchens in numbers"
      className={clsx(
        'ek-ticker relative mb-12 overflow-hidden border-y border-[#fcb6bb] bg-white @container @xl:mb-16',
        className,
      )}
      data-paused={paused}
    >
      <style>{`
        @keyframes ek-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ek-ticker .ek-track { animation: ek-ticker ${duration}s linear infinite; }
        .ek-ticker:hover .ek-track, .ek-ticker:focus-within .ek-track, .ek-ticker[data-paused='true'] .ek-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .ek-ticker .ek-track { animation: none; flex-wrap: wrap; width: auto; } .ek-ticker .ek-copy { display: none; } }
      `}</style>
      <ul className="ek-track flex w-max items-center py-5 will-change-transform">
        {row(false)}
        {row(true)}
      </ul>
      <button
        aria-label={paused ? 'Play the numbers' : 'Pause the numbers'}
        aria-pressed={paused}
        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setPaused((value) => !value)}
        type="button"
      >
        {paused ? (
          <Play aria-hidden size={12} strokeWidth={2} />
        ) : (
          <Pause aria-hidden size={12} strokeWidth={2} />
        )}
      </button>
    </section>
  );
}
