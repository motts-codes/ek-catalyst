'use client';

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  clamp01,
  frameName,
  loadSequence,
  nearestLoaded,
  onScrollFrame,
  prefersReducedMotion,
  smooth,
} from './scroll-utils';

const FRAMES_DIR = '/images/why-us/frames/';
const ASSEMBLY_FRAMES = 122;
const NIGHT_FRAMES = 42;
const TOTAL = ASSEMBLY_FRAMES + NIGHT_FRAMES;
// Scroll-progress keyframes: assembly plays to A, holds to B, night plays to 1 (of the E-scaled span).
const A = 0.86;
const B = 0.9;
const E = 1;
// Where the live water / steam touches start (0–1 progress), and how long they keep moving.
const WATER_AT = 0.75;
const STEAM_AT = 0.7;
// At rest the scene starts this far below the header (which sits above the section in flow),
// so the kitchen never touches the rounded nav card; the gap closes over the first few percent
// of scroll as the stage pins and the nav slides away.
const TOP_GAP = 14;
const FX = { water: [1075, 414, 453] as const, steam: [669, 426] as const };

interface Props {
  title: string;
  signLine1: string;
  signLine2: string;
  cueLabel?: string;
  cueHint?: string;
}

// The "Why us" opener, as in the client's mockup: a kitchen assembles frame by frame as the
// visitor scrolls (164 WebP frames scrubbed on a canvas), then the lights go down and the
// "Simplifying Kitchens / for 110+ years" sign slides in. Reduced motion shows the finished
// kitchen as a still. Frames load in priority order so a rough scrub works almost immediately.
export function HeroScrub({
  title,
  signLine1,
  signLine2,
  cueLabel = 'Scroll',
  cueHint = 'for your kitchen',
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const heldRef = useRef(false);
  const holdRef = useRef<(next: boolean) => void>(() => undefined);
  const [held, setHeldState] = useState(false);
  const [showPause, setShowPause] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const canvas = canvasRef.current;
    const cue = cueRef.current;
    const sign = signRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const ctx = canvas?.getContext('2d');

    if (!section || !pin || !canvas || !cue || !sign || !line1 || !line2 || !ctx) return;

    const reduce = prefersReducedMotion();
    const frames: HTMLImageElement[] = new Array<HTMLImageElement>(TOTAL);
    const loaded: boolean[] = new Array<boolean>(TOTAL).fill(false);
    let shown = -1;
    let want = reduce ? ASSEMBLY_FRAMES - 1 : 0;
    let progress = 0;
    let looping = false;
    let stopped = heldRef.current;
    const t0 = performance.now();

    const isMobile = () => window.innerWidth <= 760;

    // Stage geometry: the 16:9 frame is as wide as the viewport, or 1.85× its height, whichever
    // is smaller, sitting a little below the bottom edge so the floor runs off the page.
    const stage = (W: number, H: number, gap: number) => {
      const mob = isMobile();
      const sw = mob ? 1.85 * W : Math.min(W, 1.85 * H);
      const sh = (sw * 9) / 16;
      const x0 = (W - sw) / 2;
      const y0 = Math.min(H - (mob ? 0.09 * H : -0.045 * sw) - sh, gap);

      return { sw, sh, x0, y0, k: sw / 1600 };
    };

    const gapAt = (p: number) => (reduce ? 0 : TOP_GAP * (1 - smooth(clamp01(p / 0.06))));

    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();

      canvas.width = Math.round(r.width * d);
      canvas.height = Math.round(r.height * d);
      shown = -1;

      // The cue shows at rest (gap open); the sign at the end (gap closed).
      const start = stage(r.width, r.height, gapAt(0));
      const end = stage(r.width, r.height, 0);

      cue.style.top = `${start.y0 + 400 * start.k - 50}px`;
      sign.style.left = `${(r.width - end.sw) / 2 + 800 * end.k}px`;
      sign.style.top = `${end.y0 + 655 * end.k}px`;

      const { k } = end;

      sign.style.setProperty('--k', k.toFixed(4));
    };

    // Live touches drawn over the frames: water at the faucet, steam from the kettle. They keep
    // moving while the finished scene is on screen; the visitor can stop them with the button
    // (WCAG 2.2.2), and `held` is that choice.
    const fx = (x0: number, y0: number, k: number, now: number) => {
      const t = (now - t0) / 1000;

      if (progress >= WATER_AT) {
        const a = clamp01((progress - WATER_AT) / 0.06);
        const x = x0 + FX.water[0] * k;
        const yA = y0 + FX.water[1] * k;
        const yB = y0 + FX.water[2] * k;
        const w = Math.max(1.2, 2.4 * k);
        const yE = yA + a * (yB - yA);
        const o = clamp01(a * 5);

        ctx.save();
        ctx.globalAlpha = 0.5 * o;
        ctx.fillStyle = '#e6f3ff';
        ctx.fillRect(x - w / 2, yA, w, yE - yA);
        ctx.globalAlpha = 0.85 * o;
        ctx.fillStyle = '#fff';

        for (let i = 0; i < 4; i += 1) {
          const f = (t * 2.4 + i / 4) % 1;
          const yd = yA + f * (yB - yA - 4 * k);

          if (yd + 4 * k <= yE) ctx.fillRect(x - w / 4, yd, w / 2, 4 * k);
        }

        if (a >= 1) {
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.ellipse(x, yB, (5 + Math.sin(t * 9)) * k, 1.6 * k, 0, 0, 6.2832);
          ctx.fill();
        }

        ctx.restore();
      }

      if (progress >= STEAM_AT) {
        const a = clamp01((progress - STEAM_AT) / 0.06);

        ctx.save();

        for (let i = 0; i < 9; i += 1) {
          const f = (t / 3 + i / 9) % 1;
          const px = x0 + (FX.steam[0] + Math.sin(f * 5 + i * 1.7) * 5 * (0.3 + f)) * k;
          const py = y0 + (FX.steam[1] - f * 62) * k;
          const r = (4 + f * 13) * k;
          const g = ctx.createRadialGradient(px, py, 0, px, py, r);
          const alpha = clamp01((a * 1.15 - f) / 0.15) * 0.62 * Math.sin(Math.PI * f ** 0.55);

          g.addColorStop(0, `rgba(255,255,255,${alpha.toFixed(3)})`);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, 6.2832);
          ctx.fill();
        }

        ctx.restore();
      }
    };

    // The effects' clock. It stops advancing while the visitor has paused them.
    let frozenAt = 0;
    let pausedFor = 0;
    const fxClock = () => (stopped ? frozenAt : performance.now() - pausedFor);

    const draw = () => {
      const j = nearestLoaded(loaded, want);

      if (j < 0 || j === shown) return;

      shown = j;

      const im = frames[j];

      if (!im) return;

      const W = canvas.width;
      const H = canvas.height;
      const scale = W / Math.max(1, canvas.clientWidth);
      const { sw, sh, x0, y0 } = stage(W, H, gapAt(progress) * scale);

      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      // Only the frame is drawn; the canvas around it (the strip under the header, and the sides
      // on very wide screens) stays page-white rather than a bleed of the wall colour.

      ctx.drawImage(im, x0, y0, sw, sh);
      // Stopped: the water and steam are still drawn, just not moving.
      if (progress >= Math.min(WATER_AT, STEAM_AT)) fx(x0, y0, sw / 1600, fxClock());
    };

    const loop = () => {
      if (!looping) return;

      shown = -1;
      draw();
      requestAnimationFrame(loop);
    };

    const setHeld = (next: boolean) => {
      if (next === stopped) return;

      if (next) frozenAt = fxClock();
      else pausedFor = performance.now() - frozenAt;

      stopped = next;
      heldRef.current = next;
      shown = -1;
      draw();
    };

    holdRef.current = setHeld;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = rect.height - vh;
      const P = reduce ? 1 : clamp01(span > 0 ? -rect.top / span : 1);
      const p = clamp01(P / E);

      if (p < 0.08 && progress !== p) shown = -1; // the gap is still closing: redraw
      progress = p;
      setShowPause(!reduce && p >= Math.min(WATER_AT, STEAM_AT));

      const need =
        !reduce &&
        !stopped &&
        p >= Math.min(WATER_AT, STEAM_AT) &&
        rect.bottom > 0 &&
        rect.top < vh;

      if (need && !looping) {
        looping = true;
        requestAnimationFrame(loop);
      } else if (!need && looping) {
        looping = false;
      }

      if (reduce) want = ASSEMBLY_FRAMES - 1;
      else if (p <= A) want = Math.round((p / A) * (ASSEMBLY_FRAMES - 1));
      else if (p <= B) want = ASSEMBLY_FRAMES - 1;
      else want = Math.round(ASSEMBLY_FRAMES - 1 + ((p - B) / (1 - B)) * NIGHT_FRAMES);

      draw();
      pin.classList.toggle('night', !reduce && p > 0.9);
      cue.style.opacity = String(1 - clamp01(p / 0.03));

      const a1 = reduce ? 1 : smooth(clamp01((P - 0.925) / 0.02));
      const a2 = reduce ? 1 : smooth(clamp01((P - 0.94) / 0.02));

      line1.style.opacity = String(a1);
      line1.style.transform = `translateX(${-18 * (1 - a1)}px)`;
      line2.style.opacity = String(a2);
      line2.style.transform = `translateX(${18 * (1 - a2)}px)`;
    };

    const sequence = loadSequence(
      TOTAL,
      (i) => FRAMES_DIR + frameName('f', i),
      { priority: reduce ? [ASSEMBLY_FRAMES - 1] : [0], stride: 8 },
      (i, image) => {
        frames[i] = image;
        loaded[i] = true;
        shown = -1;
        draw();
      },
    );

    size();
    sequence.start();

    const onResize = () => {
      size();
      draw();
    };

    window.addEventListener('resize', onResize);

    const stop = onScrollFrame(update);

    return () => {
      sequence.cancel();
      looping = false;
      window.removeEventListener('resize', onResize);
      stop();
    };
  }, []);

  const toggle = () => {
    const next = !held;

    setHeldState(next);
    holdRef.current(next);
    // Resuming: re-run the scroll handler so the effects loop restarts.
    if (!next) window.dispatchEvent(new Event('scroll'));
  };

  return (
    <section
      aria-label="A kitchen assembles as you scroll"
      className="ek-why-hero relative h-[660vh] bg-white motion-reduce:h-auto"
      ref={sectionRef}
    >
      <style>{`
        .ek-why-hero .ek-pin { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; background: #fff; }
        .ek-why-hero .ek-pin::after { content: ""; position: absolute; inset: auto 0 0 0; height: 11vh; background: linear-gradient(transparent, #fff); z-index: 15; pointer-events: none; }
        .ek-why-hero .ek-cue { transition: opacity .3s; }
        .ek-why-hero .ek-mouse::after { content: ""; position: absolute; left: 50%; top: 7px; width: 4px; height: 8px; margin-left: -2px; border-radius: 2px; background: currentColor; animation: ek-wheel 1.6s ease-in-out infinite; }
        @keyframes ek-wheel { 0% { transform: translateY(0); opacity: 1 } 70% { transform: translateY(12px); opacity: 0 } 100% { transform: translateY(0); opacity: 0 } }
        .ek-why-hero .ek-sign { --k: .9; }
        .ek-why-hero .ek-sign span { display: block; opacity: 0; will-change: transform, opacity; }
        .ek-why-hero .ek-s1 { font-size: max(15px, calc(30px * var(--k))); padding: .55em 1em .58em; }
        .ek-why-hero .ek-s2 { font-size: max(11px, calc(18px * var(--k))); padding: .6em 1.1em .62em; margin: -.3em 20px 0 auto; }
        @media (prefers-reduced-motion: reduce) {
          .ek-why-hero .ek-pin { position: relative; }
          .ek-why-hero .ek-mouse::after { animation: none; }
          .ek-why-hero .ek-cue { display: none; }
        }
      `}</style>
      <div className="ek-pin" ref={pinRef}>
        <h1 className="sr-only">{title}</h1>
        <canvas aria-hidden className="absolute inset-0 h-full w-full" ref={canvasRef} />
        <div
          aria-hidden
          className="ek-cue pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 font-heading text-xs font-bold uppercase tracking-[0.16em] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]"
          ref={cueRef}
        >
          <span className="ek-mouse relative block h-[42px] w-[26px] rounded-[14px] border-2 border-current" />
          <span>{cueLabel}</span>
          <small className="mt-0.5 whitespace-pre-line text-center font-heading text-lg font-bold normal-case leading-tight tracking-normal text-foreground [text-shadow:none] @xl:text-xl">
            {cueHint}
          </small>
        </div>
        <div
          aria-hidden
          className="ek-sign pointer-events-none absolute left-1/2 top-[70%] z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-stretch whitespace-nowrap font-heading"
          ref={signRef}
        >
          <span
            className="ek-s1 rounded-full bg-[var(--button-primary-background,#d90716)] font-bold leading-none text-white"
            ref={line1Ref}
          >
            {signLine1}
          </span>
          <span
            className="ek-s2 rounded-full bg-white font-bold leading-none text-foreground shadow-[0_6px_18px_rgba(0,0,0,0.28)]"
            ref={line2Ref}
          >
            {signLine2}
          </span>
        </div>
        {showPause && (
          <button
            aria-label={held ? 'Play the water and steam' : 'Pause the water and steam'}
            aria-pressed={held}
            className="absolute bottom-[13vh] right-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/50 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/45 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white @xl:right-6"
            onClick={toggle}
            type="button"
          >
            {held ? (
              <Play aria-hidden size={14} strokeWidth={2} />
            ) : (
              <Pause aria-hidden size={14} strokeWidth={2} />
            )}
          </button>
        )}
      </div>
    </section>
  );
}
