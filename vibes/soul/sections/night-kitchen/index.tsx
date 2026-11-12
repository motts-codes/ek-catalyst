'use client';

import { clsx } from 'clsx';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { clamp01, prefersReducedMotion } from '@/vibes/soul/sections/why-us-scroll/scroll-utils';
import { Image } from '~/components/image';

// The finished kitchen at night from the "Why us" scroll story (its last frame), with the same
// live touches drawn over it: water running at the faucet and steam rising from the kettle. Here
// it is a plain 16:9 picture that plays on its own, for page heroes (/mykitchen). The frame is a
// normal image (so it paints at once and reads as the hero photo); only the water and steam are
// drawn, on a transparent canvas over it. The visitor can stop them (WCAG 2.2.2); reduced motion
// shows them still.
const FRAME = '/images/why-us/frames/f164.webp';
const FRAME_W = 1600;
const FRAME_H = 900;
// The part of the 1600×900 frame shown: the fridge-to-window run and the island, with the floor's
// reflection but not the white fade along the frame's bottom (from y≈860), nor the bare wall
// above. The effect coordinates below are in frame pixels and are shifted by this crop.
const CROP = { x: 330, y: 140, w: 940, h: 620 };
// Faucet stream (x, top, bottom) and kettle spout (x, y), in frame pixels.
const FX = { water: [1066, 414, 448] as const, steam: [669, 426] as const };

interface Props {
  alt: string;
  className?: string;
  /** Preload the frame (the page's hero). */
  priority?: boolean;
}

export function NightKitchen({ alt, className, priority = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holdRef = useRef<(next: boolean) => void>(() => undefined);
  const [held, setHeld] = useState(false);
  const [canPause, setCanPause] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    const reduce = prefersReducedMotion();
    let stopped = reduce;
    let looping = false;
    let visible = false;
    let frozenAt = 0;
    let pausedFor = 0;
    const t0 = performance.now();
    const clock = () => (stopped ? frozenAt : performance.now() - pausedFor);

    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();

      canvas.width = Math.round(r.width * d);
      canvas.height = Math.round(r.height * d);
    };

    const draw = (now: number) => {
      const W = canvas.width;
      const k = W / CROP.w;
      const t = (now - t0) / 1000;

      ctx.clearRect(0, 0, W, canvas.height);

      // Water: a pale stream with brighter droplets falling through it, and a splash at the sink.
      const x = (FX.water[0] - CROP.x) * k;
      const yA = (FX.water[1] - CROP.y) * k;
      const yB = (FX.water[2] - CROP.y) * k;
      const w = Math.max(1.2, 2.4 * k);

      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#e6f3ff';
      ctx.fillRect(x - w / 2, yA, w, yB - yA);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#fff';

      for (let i = 0; i < 4; i += 1) {
        const f = (t * 2.4 + i / 4) % 1;
        const yd = yA + f * (yB - yA - 4 * k);

        if (yd + 4 * k <= yB) ctx.fillRect(x - w / 4, yd, w / 2, 4 * k);
      }

      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(x, yB, (5 + Math.sin(t * 9)) * k, 1.6 * k, 0, 0, 6.2832);
      ctx.fill();
      ctx.restore();

      // Steam: soft white puffs drifting up from the spout and fading.
      ctx.save();

      for (let i = 0; i < 9; i += 1) {
        const f = (t / 3 + i / 9) % 1;
        const px = (FX.steam[0] - CROP.x + Math.sin(f * 5 + i * 1.7) * 5 * (0.3 + f)) * k;
        const py = (FX.steam[1] - CROP.y - f * 62) * k;
        const r = (4 + f * 13) * k;
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        const alpha = clamp01((1.15 - f) / 0.15) * 0.62 * Math.sin(Math.PI * f ** 0.55);

        g.addColorStop(0, `rgba(255,255,255,${alpha.toFixed(3)})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, 6.2832);
        ctx.fill();
      }

      ctx.restore();
    };

    const loop = () => {
      if (!looping) return;

      draw(clock());
      requestAnimationFrame(loop);
    };

    // Only animate while on screen and not stopped.
    const sync = () => {
      const need = visible && !stopped;

      if (need && !looping) {
        looping = true;
        requestAnimationFrame(loop);
      } else if (!need && looping) {
        looping = false;
      }

      if (!need) draw(clock());
    };

    holdRef.current = (next: boolean) => {
      if (next === stopped) return;

      if (next) frozenAt = clock();
      else pausedFor = performance.now() - frozenAt;

      stopped = next;
      sync();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.05 },
    );

    const onResize = () => {
      size();
      draw(clock());
    };

    size();
    draw(clock());
    setCanPause(!reduce);
    io.observe(canvas);
    window.addEventListener('resize', onResize);

    return () => {
      looping = false;
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const toggle = () => {
    const next = !held;

    setHeld(next);
    holdRef.current(next);
  };

  return (
    // The box takes the crop's shape, and the full frame is laid behind it, oversized and offset
    // so the crop is what shows.
    <div
      className={clsx('relative overflow-hidden rounded-3xl bg-[#1b1a1f]', className)}
      style={{ aspectRatio: `${CROP.w} / ${CROP.h}` }}
    >
      <div
        className="absolute"
        style={{
          left: `${(-CROP.x / CROP.w) * 100}%`,
          top: `${(-CROP.y / CROP.h) * 100}%`,
          width: `${(FRAME_W / CROP.w) * 100}%`,
          height: `${(FRAME_H / CROP.h) * 100}%`,
        }}
      >
        <Image
          alt={alt}
          className="object-cover"
          fill
          preload={priority}
          sizes="(min-width: 56rem) 60vw, 120vw"
          src={FRAME}
        />
      </div>
      <canvas aria-hidden className="absolute inset-0 h-full w-full" ref={canvasRef} />
      {canPause && (
        <button
          aria-label={held ? 'Play the water and steam' : 'Pause the water and steam'}
          aria-pressed={held}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/50 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/45 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white"
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
  );
}
