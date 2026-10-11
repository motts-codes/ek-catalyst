// Shared helpers for the scroll-driven "Why us" sections (ported from the client's mockup).

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

// Smoothstep: eases a 0–1 progress at both ends.
export const smooth = (t: number) => t * t * (3 - 2 * t);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 0 at the top of a pinned section, 1 when its sticky stage has scrolled through.
export function pinnedProgress(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const span = rect.height - window.innerHeight;

  return clamp01(span > 0 ? -rect.top / span : 1);
}

// Zero-padded "f001"-style frame file names.
export const frameName = (prefix: string, index: number) =>
  `${prefix}${String(index + 1).padStart(3, '0')}.webp`;

// Loads an image sequence in a sensible order (the `priority` indexes first, then every `stride`th
// frame so a rough scrub works early, then the rest), four at a time. `onFrame` fires as each
// frame lands so the caller can redraw.
export function loadSequence(
  count: number,
  src: (index: number) => string,
  { priority = [0], stride = 8 }: { priority?: number[]; stride?: number },
  onFrame: (index: number, image: HTMLImageElement) => void,
) {
  const order: number[] = [...priority];

  for (let i = 0; i < count; i += stride) if (!order.includes(i)) order.push(i);
  for (let i = 0; i < count; i += 1) if (!order.includes(i)) order.push(i);

  let live = 0;
  let cancelled = false;

  const loadOne = (index: number, next: () => void) => {
    const image = new Image();

    image.decoding = 'async';

    image.onload = () => {
      live -= 1;
      if (!cancelled) onFrame(index, image);
      next();
    };

    image.onerror = () => {
      live -= 1;
      next();
    };

    image.src = src(index);
  };

  const pump = () => {
    if (cancelled || live >= 4) return;

    const index = order.shift();

    if (index === undefined) return;

    live += 1;
    loadOne(index, pump);
    pump();
  };

  return {
    start: pump,
    cancel: () => {
      cancelled = true;
    },
  };
}

// The nearest loaded frame at or below `want` (or the first one above it).
export function nearestLoaded(loaded: boolean[], want: number) {
  let j = want;

  while (j >= 0 && !loaded[j]) j -= 1;
  if (j >= 0) return j;

  j = want;
  while (j < loaded.length && !loaded[j]) j += 1;

  return j < loaded.length ? j : -1;
}

// One scroll/resize listener that coalesces into a single animation frame.
export function onScrollFrame(handler: () => void) {
  let ticking = false;

  const run = () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      handler();
    });
  };

  window.addEventListener('scroll', run, { passive: true });
  window.addEventListener('resize', run);
  run();

  return () => {
    window.removeEventListener('scroll', run);
    window.removeEventListener('resize', run);
  };
}
