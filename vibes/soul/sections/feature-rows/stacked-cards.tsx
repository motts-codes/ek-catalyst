'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type ReactNode, useLayoutEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

// Cards that pin as you scroll and stack: each card sticks below the header while the next one
// slides up over it, and GSAP eases the covered card back (a little smaller) as the cover
// arrives; the cards stay opaque, so nothing shows through the one on top. Pure CSS sticky does the pinning, so the layout holds without JavaScript; GSAP
// only adds the overlay motion, and stays out of it for people who prefer reduced motion.
export function StackedCards({ children }: { children: ReactNode[] }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = root.current;

    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-stacked-card]'));
    const context = gsap.context(() => {
      cards.forEach((card, index) => {
        const next = cards[index + 1];

        if (!next) return;

        gsap.to(card, {
          scale: 0.94,
          transformOrigin: 'center top',
          ease: 'none',
          scrollTrigger: {
            trigger: next,
            start: 'top bottom',
            end: 'top top+=112',
            scrub: true,
          },
        });
      });
    }, container);

    return () => context.revert();
  }, [children.length]);

  return (
    <div className="flex flex-col gap-10 @3xl:gap-14" ref={root}>
      {children.map((child, index) => (
        <div
          className="@3xl:sticky @3xl:top-28"
          data-stacked-card
          key={index}
          style={{ zIndex: index + 1 }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
