'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { homeHeadingClassName } from '@/vibes/soul/sections/home-section';

import {
  clamp01,
  frameName,
  loadSequence,
  nearestLoaded,
  onScrollFrame,
  prefersReducedMotion,
  smooth,
} from './scroll-utils';

const CAB_DIR = '/images/why-us/cab/';
const LOUPE_DIR = '/images/why-us/loupe/';
const FRAME_COUNT = 206;
const KEYFRAMES = [0, 41, 82, 123, 164, 205];
// [start, end, from keyframe, to keyframe] in 0–1 progress: five moves with holds between them.
const SEGMENTS: Array<[number, number, number, number]> = [
  [0, 0.04, 0, 0],
  [0.04, 0.17, 0, 1],
  [0.17, 0.24, 1, 1],
  [0.24, 0.37, 1, 2],
  [0.37, 0.44, 2, 2],
  [0.44, 0.57, 2, 3],
  [0.57, 0.64, 3, 3],
  [0.64, 0.77, 3, 4],
  [0.77, 0.84, 4, 4],
  [0.84, 0.94, 4, 5],
  [0.94, 1.01, 5, 5],
];
// Progress at which each feature in the list becomes the active one.
const FEATURE_AT = [0.11, 0.31, 0.51, 0.71, 0.9];
// Magnifier insets: [file, hotspot x, y, inset x, y, hold start, hold end] in 1024×768 frame space.
const LOUPES: Array<[string, number, number, number, number, number, number]> = [
  ['plywood', 512, 410, 880, 330, 0.17, 0.24],
  ['hinge', 399, 279, 135, 118, 0.37, 0.44],
  ['dovetail', 717, 210, 900, 430, 0.57, 0.64],
  ['glide', 538, 141, 170, 320, 0.77, 0.84],
];
const HOT = '#d90716';

export interface CabinetFeature {
  title: string;
  description: string;
}

interface Props {
  kicker: string;
  title: string;
  features: CabinetFeature[];
}

// Builds the "sheen" mask from the last frame: the cabinet's silhouette, so the light sweep at the
// end only crosses the cabinet and not the white around it.
function makeMask(image: HTMLImageElement) {
  try {
    const m = document.createElement('canvas');

    m.width = 1024;
    m.height = 768;

    const x = m.getContext('2d');

    if (!x) return null;

    x.drawImage(image, 0, 0, 1024, 768);

    const d = x.getImageData(0, 0, 1024, 768);
    const a = d.data;

    for (let y = 0; y < 768; y += 1) {
      let lo = -1;
      let hi = -1;
      const o = y * 4096;

      for (let i = 0; i < 1024; i += 1) {
        const idx = o + i * 4;

        if ((a[idx] ?? 0) + (a[idx + 1] ?? 0) + (a[idx + 2] ?? 0) < 735) {
          if (lo < 0) lo = i;
          hi = i;
        }
      }

      for (let i = 0; i < 1024; i += 1) {
        const idx = o + i * 4;

        a[idx] = 255;
        a[idx + 1] = 255;
        a[idx + 2] = 255;
        a[idx + 3] = lo >= 0 && i >= lo && i <= hi ? 255 : 0;
      }
    }

    x.putImageData(d, 0, 0);

    return m;
  } catch {
    return null;
  }
}

// "What makes an EK cabinet": one cabinet on white turns and opens as the visitor scrolls (206
// frames on a canvas). Magnifier insets pop up on plywood, hinge, dovetail and glide, the matching
// line in the list turns red, and a light sweeps the finished cabinet at the end.
export function CabinetFilm({ kicker, title, features }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const section = sectionRef.current;
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const cc = canvas?.getContext('2d');

    if (!section || !box || !canvas || !cc) return;

    const reduce = prefersReducedMotion();
    const frames: HTMLImageElement[] = new Array<HTMLImageElement>(FRAME_COUNT);
    const loaded: boolean[] = new Array<boolean>(FRAME_COUNT).fill(false);
    const loupeImages: Array<HTMLImageElement | undefined> = [];
    const loupeAlpha = [0, 0, 0, 0];
    let loupeKey = '';
    let shown = -1;
    let want = 0;
    let started = false;
    let sheenX = 0;
    let mask: HTMLCanvasElement | null = null;
    const sheen = document.createElement('canvas');

    sheen.width = 1024;
    sheen.height = 768;

    const drawLoupes = () => {
      const R = 118;

      LOUPES.forEach((l, i) => {
        const a = loupeAlpha[i] ?? 0;
        const im = loupeImages[i];

        if (a <= 0 || !im) return;

        const r = R * (0.82 + 0.18 * a);
        const dx = l[3] - l[1];
        const dy = l[4] - l[2];
        const d = Math.sqrt(dx * dx + dy * dy);

        cc.save();
        cc.globalAlpha = a;
        cc.strokeStyle = HOT;
        cc.lineWidth = 1;
        cc.beginPath();
        cc.moveTo(l[1], l[2]);
        cc.lineTo(l[3] - (dx / d) * r, l[4] - (dy / d) * r);
        cc.stroke();
        cc.fillStyle = 'rgba(255,255,255,.55)';
        cc.lineWidth = 1.5;
        cc.beginPath();
        cc.arc(l[1], l[2], 7, 0, 6.2832);
        cc.fill();
        cc.stroke();
        cc.beginPath();
        cc.arc(l[3], l[4], r, 0, 6.2832);
        cc.fillStyle = '#fff';
        cc.fill();
        cc.save();
        cc.clip();
        cc.drawImage(im, l[3] - r, l[4] - r, 2 * r, 2 * r);
        cc.restore();
        cc.lineWidth = 1.5;
        cc.beginPath();
        cc.arc(l[3], l[4], r, 0, 6.2832);
        cc.stroke();
        cc.restore();
      });
    };

    const drawSheen = () => {
      if (!mask || sheenX <= 0 || sheenX >= 1) return;

      const x = sheen.getContext('2d');

      if (!x) return;

      const c = 120 + sheenX * 880;
      const w = 260;

      x.globalCompositeOperation = 'source-over';
      x.clearRect(0, 0, 1024, 768);
      x.save();
      x.transform(1, 0, -0.32, 1, 768 * 0.16, 0);

      let g = x.createLinearGradient(c - w, 0, c + w, 0);

      for (let k = 0; k <= 24; k += 1) {
        const t = k / 24;
        const e = (t - 0.5) / 0.5;

        g.addColorStop(
          t,
          `rgba(112,126,142,${(0.13 * Math.cos((e * Math.PI) / 2) ** 2).toFixed(3)})`,
        );
      }

      x.fillStyle = g;
      x.fillRect(c - w, -50, 2 * w, 900);
      g = x.createLinearGradient(c - w, 0, c + w, 0);

      for (let k = 0; k <= 24; k += 1) {
        const t = k / 24;
        const e = (t - 0.5) / 0.2;

        g.addColorStop(t, `rgba(255,255,255,${(0.85 * Math.exp(-e * e)).toFixed(3)})`);
      }

      x.fillStyle = g;
      x.fillRect(c - w, -50, 2 * w, 900);
      x.restore();
      x.globalCompositeOperation = 'destination-in';
      x.drawImage(mask, 0, 0);
      cc.save();
      cc.globalAlpha = Math.sin(Math.PI * sheenX);
      cc.drawImage(sheen, 0, 0);
      cc.restore();
    };

    const draw = () => {
      const j = nearestLoaded(loaded, want);

      if (j < 0 || j === shown) return;

      shown = j;

      const im = frames[j];

      if (!im) return;

      cc.drawImage(im, 0, 0, canvas.width, canvas.height);
      drawLoupes();
      if (j === FRAME_COUNT - 1) drawSheen();
    };

    const sequence = loadSequence(
      FRAME_COUNT,
      (i) => CAB_DIR + frameName('c', i),
      { priority: KEYFRAMES, stride: 6 },
      (i, image) => {
        frames[i] = image;
        loaded[i] = true;
        if (i === FRAME_COUNT - 1) mask = makeMask(image);
        shown = -1;
        draw();
      },
    );

    LOUPES.forEach((l, i) => {
      const im = new Image();

      im.decoding = 'async';

      im.onload = () => {
        loupeImages[i] = im;
        shown = -1;
        draw();
      };

      im.src = `${LOUPE_DIR}${l[0]}.webp`;
    });

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = rect.height - vh;

      // Frames load only once the section is near.
      if (!started && rect.top < vh * 2.5 && rect.bottom > -vh) {
        started = true;
        sequence.start();
      }

      const p = reduce ? 0 : clamp01(span > 0 ? -rect.top / span : 0);

      for (let k = 0; k < SEGMENTS.length; k += 1) {
        const s = SEGMENTS[k];

        if (!s) break;

        if (p < s[1] || k === SEGMENTS.length - 1) {
          const t = smooth(clamp01((p - s[0]) / (s[1] - s[0])));
          const from = KEYFRAMES[s[2]] ?? 0;
          const to = KEYFRAMES[s[3]] ?? 0;

          want = Math.round(from + (to - from) * t);
          break;
        }
      }

      let key = '';

      LOUPES.forEach((l, k) => {
        const u = smooth(clamp01((p - (l[5] - 0.04)) / 0.04));
        const v = 1 - clamp01((p - l[6]) / 0.03);

        loupeAlpha[k] = reduce ? 0 : u * v;
        key += (loupeAlpha[k] ?? 0).toFixed(2);
      });

      if (key !== loupeKey) {
        loupeKey = key;
        shown = -1;
      }

      draw();

      const zoom = smooth(reduce ? 0 : clamp01((p - 0.93) / 0.06));

      box.style.setProperty('--zoom', (1 + 0.14 * zoom).toFixed(4));

      const nextSheen = reduce ? 0 : clamp01((p - 0.945) / 0.05);

      if (nextSheen !== sheenX) {
        sheenX = nextSheen;
        shown = -1;
        draw();
      }

      let act = -1;

      FEATURE_AT.forEach((at, k) => {
        if (p >= at) act = k;
      });
      setActive(reduce ? -1 : act);
    };

    const stop = onScrollFrame(update);

    return () => {
      sequence.cancel();
      stop();
    };
  }, []);

  return (
    <section
      aria-label={title}
      className="ek-cabinet-film relative h-[620vh] bg-white @container motion-reduce:h-auto"
      ref={sectionRef}
    >
      <style>{`
        .ek-cabinet-film .ek-pin { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; }
        .ek-cabinet-film .ek-zoom { transform: scale(var(--zoom, 1)); transform-origin: 50% 52%; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .ek-cabinet-film .ek-pin { position: relative; height: auto; overflow: visible; } }
      `}</style>
      <div className="ek-pin mx-auto grid max-w-screen-2xl items-center gap-5 px-6 pb-[4vh] pt-[calc(64px+2vh)] @xl:px-9 @3xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] @3xl:gap-12 @4xl:px-14">
        <div
          className="relative w-full max-w-[calc(38vh*4/3)] justify-self-center @3xl:max-w-[calc(78vh*4/3)]"
          ref={boxRef}
        >
          <div className="ek-zoom relative">
            <canvas
              aria-label="A white shaker base cabinet turns and opens to show how it is built"
              className="block aspect-[4/3] w-full"
              height={768}
              ref={canvasRef}
              role="img"
              width={1024}
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <p className="mb-0 text-xs font-semibold uppercase tracking-wide text-contrast-500">
            {kicker}
          </p>
          <h2 className={clsx(homeHeadingClassName, 'hidden @3xl:block @4xl:text-4xl')}>{title}</h2>
          <ol className="mt-2 flex flex-col">
            {features.map((feature, index) => {
              const on = index === active;

              return (
                <li
                  aria-current={on ? 'step' : undefined}
                  className={clsx(
                    'grid gap-0.5 border-l-[3px] border-t border-t-contrast-100 py-2.5 pl-4 transition-colors @3xl:py-3.5',
                    on
                      ? 'border-l-[var(--button-primary-background,#d90716)] text-foreground'
                      : 'border-l-transparent text-contrast-500',
                  )}
                  key={feature.title}
                >
                  <b
                    className={clsx(
                      'font-heading text-base font-bold @xl:text-lg @4xl:text-xl',
                      on ? 'text-[var(--button-primary-background,#d90716)]' : 'text-foreground',
                    )}
                  >
                    {feature.title}
                  </b>
                  <span className={clsx('text-sm @xl:text-base', !on && 'hidden @3xl:block')}>
                    {feature.description}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
