'use client';

import { Pause, Play } from 'lucide-react';
import { type ReactNode, useState } from 'react';

// Holds the marquee's stop/start state (WCAG 2.2.2). The button flips `data-paused` on the frame;
// the CSS in ReviewMarquee pauses every column's animation off that attribute, so the server-
// rendered columns need no state of their own.
export function MarqueeFrame({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative" data-paused={paused}>
      <button
        aria-label={paused ? 'Play reviews' : 'Pause reviews'}
        aria-pressed={paused}
        className="absolute bottom-1 right-1 z-[1] flex h-8 w-8 items-center justify-center rounded-lg border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setPaused((value) => !value)}
        type="button"
      >
        {paused ? (
          <Play aria-hidden size={14} strokeWidth={2} />
        ) : (
          <Pause aria-hidden size={14} strokeWidth={2} />
        )}
      </button>
      {children}
    </div>
  );
}
