// A short confetti burst on a full-screen canvas: two cannons at the lower corners firing toward
// the top centre, paper falling under gravity, gone in about three seconds. No dependency, no
// layout impact (the canvas is fixed, pointer-events none, removed when the last piece is off
// screen). Skipped when the visitor prefers reduced motion.

const COLORS = ['#d90716', '#fcb6bb', '#f6c343', '#7fc8a9', '#ffffff', '#1f1f1f'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  spin: number;
  color: string;
  tilt: number;
  tiltSpeed: number;
}

function cannon(x: number, y: number, angle: number, count: number): Piece[] {
  return Array.from({ length: count }, () => {
    const a = angle + (Math.random() - 0.5) * 0.9;
    const speed = 14 + Math.random() * 14;

    return {
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#d90716',
      tilt: Math.random() * Math.PI,
      tiltSpeed: 0.1 + Math.random() * 0.15,
    };
  });
}

// Returns a cancel function that stops the burst and removes the canvas.
export function fireConfetti(): () => void {
  const noop = () => undefined;

  if (typeof window === 'undefined') return noop;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return noop;

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60;';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx.scale(dpr, dpr);

  const pieces = [
    ...cannon(0, height * 0.8, -Math.PI / 3.4, 90),
    ...cannon(width, height * 0.8, Math.PI + Math.PI / 3.4, 90),
  ];
  const start = performance.now();
  let frame = 0;

  const tick = (now: number) => {
    const elapsed = now - start;

    ctx.clearRect(0, 0, width, height);

    let alive = 0;

    pieces.forEach((p) => {
      p.vy += 0.42;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      p.tilt += p.tiltSpeed;

      if (p.y > height + 20) return;

      alive += 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = elapsed > 2200 ? Math.max(0, 1 - (elapsed - 2200) / 800) : 1;
      ctx.fillStyle = p.color;
      ctx.fillRect((-p.w / 2) * Math.cos(p.tilt), -p.h / 2, p.w * Math.cos(p.tilt), p.h);
      ctx.restore();
    });

    if (alive > 0 && elapsed < 3000) {
      frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      canvas.remove();
    }
  };

  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    canvas.remove();
  };
}
