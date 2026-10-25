'use client';

import { clsx } from 'clsx';
import { Info } from 'lucide-react';
import { ReactNode } from 'react';

import { Tooltip } from '@/vibes/soul/primitives/tooltip';

// A term in running copy with an explanation on hover or focus: dotted underline, a small info
// mark, a red tooltip. "a <TermTip term="10×10 kitchen">…</TermTip> in that style".
export function TermTip({
  term,
  children,
  className,
}: {
  term: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tooltip
      className="max-w-72 !border-transparent text-xs leading-relaxed text-white [--tooltip-background:var(--button-primary-background,#d90716)]"
      delayDuration={0}
      side="right"
      trigger={
        <button
          className={clsx(
            'inline-flex items-baseline gap-0.5 rounded-sm font-medium text-foreground underline decoration-[var(--button-primary-background,#d90716)] decoration-dotted underline-offset-4 hover:decoration-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2',
            className,
          )}
          type="button"
        >
          {term}
          <Info
            aria-hidden
            className="relative top-px self-center text-[var(--button-primary-background,#d90716)]"
            size={14}
            strokeWidth={2.25}
          />
        </button>
      }
    >
      {children}
    </Tooltip>
  );
}
