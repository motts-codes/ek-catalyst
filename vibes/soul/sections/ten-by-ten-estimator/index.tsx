'use client';

import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight, Check, Info, RotateCcw } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Tooltip } from '@/vibes/soul/primitives/tooltip';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import {
  type ColorOption,
  colorsFor,
  dollars,
  dollarsAndCents,
  doorsFor,
  estimateFor,
  fromPriceFor,
  type Line,
  type LineId,
  LINES,
  rowFor,
  type ShapeId,
  SHAPES,
  TEN_BY_TEN_FINE_PRINT,
  type TenByTenEstimate,
} from '~/lib/estimator/ten-by-ten';
import { doorKey, type EstimatorVisuals, type Picture } from '~/lib/estimator/ten-by-ten-visuals';

interface Props {
  /** Where "Book a free design" goes. */
  designHref: string;
  /** Kitchen per line, door sample per door style, swatch per color (from the live collections). */
  visuals: EstimatorVisuals;
  className?: string;
}

const RED = 'text-[var(--button-primary-background,#d90716)]';
const RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2';
const STEPS = ['Shape', 'Line', 'Door style', 'Color'] as const;
const SINGLE_FINISH = 'Standard finish (single color)';
const RESULT = 5;

// How the color step resolves for a door style: shown as swatches, or decided for the visitor.
type ColorMode = 'pick' | 'single' | 'any';

interface Wizard {
  step: number;
  shape: ShapeId;
  line: Line | undefined;
  program: string | undefined;
  door: string | null;
  color: string | null;
  colors: ColorOption[];
  colorMode: ColorMode;
  estimate: TenByTenEstimate | null;
  /** The furthest step the picks so far allow. */
  reach: number;
  go: (step: number) => void;
  pickShape: (id: ShapeId) => void;
  pickLine: (id: LineId) => void;
  pickProgram: (program: string) => void;
  pickDoor: (door: string) => void;
  pickColor: (color: string) => void;
  reset: () => void;
}

// Whether the color is a real choice (swatches to show), or there is only one, or the door comes
// in a long list of finishes with no swatch to show (Euro laminates: same price for every one).
function colorModeFor(colors: ColorOption[], visuals: EstimatorVisuals): ColorMode {
  if (colors.length <= 1) return 'single';
  if (colors.some((c) => visuals.colors[c.name])) return 'pick';

  return 'any';
}

function useWizard(visuals: EstimatorVisuals): Wizard {
  const [step, setStep] = useState(1);
  const [shape, setShape] = useState<ShapeId>('l-shape');
  const [lineId, setLineId] = useState<LineId | null>(null);
  const [program, setProgram] = useState<string | undefined>(undefined);
  const [door, setDoor] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const line = LINES.find((l) => l.id === lineId);
  const lineReady = line !== undefined && (line.variants.length === 0 || program !== undefined);
  const colors = line && door ? colorsFor(line.id, program, door) : [];
  const colorMode = colorModeFor(colors, visuals);
  const row = line && door && color ? rowFor(line.id, program, door, color) : null;
  const estimate = row ? estimateFor(row.price) : null;

  let reach = 2;

  if (lineReady) reach = 3;
  if (door) reach = colorMode === 'pick' ? 4 : RESULT;
  if (estimate) reach = RESULT;

  // A short beat after a pick so the selection is seen before the next step slides in.
  const goSoon = (next: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStep(next), 320);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    step,
    shape,
    line,
    program,
    door,
    color,
    colors,
    colorMode,
    estimate,
    reach,
    go: setStep,
    pickShape: (id) => {
      setShape(id);
      goSoon(2);
    },
    pickLine: (id) => {
      const next = LINES.find((l) => l.id === id);

      setLineId(id);
      setProgram(undefined);
      setDoor(null);
      setColor(null);

      if (next?.variants.length === 0) goSoon(3);
    },
    pickProgram: (p) => {
      setProgram(p);
      setDoor(null);
      setColor(null);
      goSoon(3);
    },
    pickDoor: (d) => {
      const next = line ? colorsFor(line.id, program, d) : [];
      const mode = colorModeFor(next, visuals);

      setDoor(d);
      // One finish, or a laminate list with nothing to show: decide it and go to the price.
      setColor(mode === 'pick' ? null : (next[0]?.name ?? null));
      goSoon(mode === 'pick' ? 4 : RESULT);
    },
    pickColor: (c) => {
      setColor(c);
      goSoon(RESULT);
    },
    reset: () => {
      setLineId(null);
      setProgram(undefined);
      setDoor(null);
      setColor(null);
      setStep(1);
    },
  };
}

// The estimator as a multi-step form: one question on screen at a time (shape, line, door style,
// color), each answered by picking a picture, then the price card. Picks advance the step;
// the rail at the top and the Back link go back.
export function TenByTenEstimator({ designHref, visuals, className }: Props) {
  const w = useWizard(visuals);
  const top = useRef<HTMLDivElement>(null);

  // Keep the question in view when the step changes and the top has scrolled away.
  useEffect(() => {
    const el = top.current;

    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [w.step]);

  return (
    <div className={clsx('scroll-mt-24 @container', className)} ref={top}>
      <Rail current={w.step} go={w.go} reach={w.reach} />
      <div
        className="motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
        key={w.step}
      >
        {w.step === 1 ? <ShapeStep w={w} /> : null}
        {w.step === 2 ? <LineStep visuals={visuals} w={w} /> : null}
        {w.step === 3 ? <DoorStep visuals={visuals} w={w} /> : null}
        {w.step === 4 ? <ColorStep visuals={visuals} w={w} /> : null}
        {w.step === RESULT ? <ResultStep designHref={designHref} visuals={visuals} w={w} /> : null}
      </div>
    </div>
  );
}

// The four steps as a rail; done steps are red and clickable, the current one outlined.
function Rail({ current, reach, go }: { current: number; reach: number; go: (n: number) => void }) {
  return (
    <ol aria-label="Steps" className="mb-8 flex items-center gap-2 @xl:mb-10">
      {STEPS.map((label, index) => {
        const n = index + 1;
        const done = n < current && n < RESULT;
        const active = n === current;
        const canGo = n <= reach && !active;

        return (
          <li className="flex min-w-0 flex-1 items-center gap-2" key={label}>
            <button
              aria-current={active ? 'step' : undefined}
              aria-label={`Step ${n}: ${label}`}
              className={clsx(
                'group flex min-w-0 items-center gap-2',
                RING,
                !canGo && 'cursor-default',
              )}
              disabled={!canGo}
              onClick={() => go(n)}
              type="button"
            >
              <span
                className={clsx(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  done || active
                    ? 'border-[var(--button-primary-background,#d90716)]'
                    : 'border-contrast-200',
                  done ? 'bg-[var(--button-primary-background,#d90716)] text-white' : 'bg-white',
                  active ? RED : '',
                  !done && !active ? 'text-contrast-500' : '',
                )}
              >
                {done ? <Check size={14} strokeWidth={3} /> : n}
              </span>
              <span
                className={clsx(
                  'hidden truncate text-xs font-semibold @md:inline',
                  active ? RED : 'text-contrast-500',
                  canGo && 'group-hover:text-foreground',
                )}
              >
                {label}
              </span>
            </button>
            {index < STEPS.length - 1 ? (
              <span className="h-0.5 min-w-4 flex-1 rounded-full bg-contrast-100">
                <span
                  className={clsx(
                    'block h-full rounded-full bg-[var(--button-primary-background,#d90716)] transition-[width] duration-500',
                    done ? 'w-full' : 'w-0',
                  )}
                />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

// A step's frame: "Step n of 4", the question, one line of help, the choices, and Back.
function Panel({
  n,
  title,
  help,
  back,
  children,
}: {
  n: number;
  title: string;
  help?: string;
  back?: () => void;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`estimator-step-${n}`}>
      <p className={clsx('text-xs font-semibold uppercase tracking-wide', RED)}>
        Step {n} of {STEPS.length}
      </p>
      <h2
        className="mt-1 font-heading text-2xl font-bold leading-tight @xl:text-3xl"
        id={`estimator-step-${n}`}
      >
        {title}
      </h2>
      {help ? <p className="mt-2 max-w-2xl text-sm text-contrast-500">{help}</p> : null}
      <div className="mt-6">{children}</div>
      {back ? <BackLink onClick={back} /> : null}
    </section>
  );
}

function BackLink({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      className={clsx(
        'mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-contrast-500 hover:text-foreground',
        RING,
      )}
      onClick={onClick}
      type="button"
    >
      <ArrowLeft size={15} strokeWidth={2.5} />
      {label}
    </button>
  );
}

// 1 · Shape: the four layout renders; the description sits in a tooltip after the name.
function ShapeStep({ w }: { w: Wizard }) {
  return (
    <Panel
      help="Shape changes the picture, not the price."
      n={1}
      title="What shape is your kitchen?"
    >
      <div
        aria-label="Kitchen shape"
        className="grid grid-cols-2 gap-3 @xl:grid-cols-4 @xl:gap-4"
        role="radiogroup"
      >
        {SHAPES.map((s) => (
          <PictureChoice
            aspect="aspect-[4/3]"
            fit="contain"
            info={s.blurb}
            key={s.id}
            label={s.label}
            on={w.shape === s.id}
            onPick={() => w.pickShape(s.id)}
            picture={s.image}
            sizes="(min-width: 56rem) 16rem, 45vw"
          />
        ))}
      </div>
    </Panel>
  );
}

// 2 · Line: a kitchen per line, then the build or tier inside it.
function LineStep({ w, visuals }: { w: Wizard; visuals: EstimatorVisuals }) {
  const variants = w.line?.variants ?? [];

  return (
    <Panel
      back={() => w.go(1)}
      help="The line decides how the cabinet is built. You'll pick the door and color next."
      n={2}
      title="Which cabinet line?"
    >
      <div
        aria-label="Cabinet line"
        className="grid gap-3 @xl:grid-cols-3 @xl:gap-4"
        role="radiogroup"
      >
        {LINES.map((l) => (
          <PictureChoice
            aspect="aspect-[16/10]"
            badge={`from ${dollars(fromPriceFor(l.id))}`}
            key={l.id}
            label={l.label}
            note={l.tagline}
            on={w.line?.id === l.id}
            onPick={() => w.pickLine(l.id)}
            picture={visuals.lines[l.id]}
            sizes="(min-width: 56rem) 22rem, 100vw"
          />
        ))}
      </div>
      {w.line && variants.length > 0 ? (
        <div className="mt-6 motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in">
          <p className="mb-2 text-sm font-semibold">
            {w.line.id === 'star' ? 'How should it arrive?' : 'Which Euro?'}
          </p>
          <div
            aria-label={w.line.id === 'star' ? 'How should it arrive' : 'Which Euro'}
            className="flex flex-wrap gap-2"
            role="radiogroup"
          >
            {variants.map((v) => (
              <Pill
                key={v.program}
                note={v.note}
                on={w.program === v.program}
                onPick={() => w.pickProgram(v.program)}
              >
                {v.label}
              </Pill>
            ))}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

// 3 · Door style: door samples in boxes, the name beneath.
function DoorStep({ w, visuals }: { w: Wizard; visuals: EstimatorVisuals }) {
  const doors = w.line ? doorsFor(w.line.id, w.program) : [];

  return (
    <Panel back={() => w.go(2)} n={3} title="Which door style?">
      <div
        aria-label="Door style"
        className="grid grid-cols-3 gap-3 @xl:grid-cols-4 @3xl:grid-cols-6 @3xl:gap-4"
        role="radiogroup"
      >
        {doors.map((d) => (
          <PictureChoice
            aspect="aspect-square"
            compact
            fit="contain"
            key={d}
            label={d}
            on={w.door === d}
            onPick={() => w.pickDoor(d)}
            picture={w.line ? visuals.doors[doorKey(w.line.id, d)] : undefined}
            sizes="(min-width: 56rem) 11rem, 30vw"
          />
        ))}
      </div>
    </Panel>
  );
}

// 4 · Color: big swatches, standard first, the premium ones tagged.
function ColorStep({ w, visuals }: { w: Wizard; visuals: EstimatorVisuals }) {
  const premium = w.colors.some((c) => c.tier === 'premium');

  return (
    <Panel
      back={() => w.go(3)}
      help={
        premium
          ? 'Standard colors share one price; the three premium colors cost a little more.'
          : 'Color doesn’t change the price.'
      }
      n={4}
      title={`Which color for ${w.door ?? 'the door'}?`}
    >
      <div aria-label="Color" className="flex flex-wrap gap-x-5 gap-y-6" role="radiogroup">
        {w.colors.map((c) => (
          <Swatch
            hex={visuals.colors[c.name]?.hex}
            key={c.name}
            name={c.name}
            on={w.color === c.name}
            onPick={() => w.pickColor(c.name)}
            premium={c.tier === 'premium'}
          />
        ))}
      </div>
    </Panel>
  );
}

// A picture to pick: the image on top, the name (and an optional tooltip) beneath. Chosen =
// red ring and a red check.
function PictureChoice({
  label,
  picture,
  aspect,
  fit = 'cover',
  sizes,
  note,
  info,
  badge,
  compact = false,
  on,
  onPick,
}: {
  label: string;
  picture?: Picture;
  aspect: string;
  fit?: 'cover' | 'contain';
  sizes: string;
  note?: string;
  info?: string;
  badge?: string;
  compact?: boolean;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <div className="relative">
      <button
        aria-checked={on}
        className={clsx(
          'group flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left transition-[border-color,box-shadow]',
          RING,
          on
            ? 'border-[var(--button-primary-background,#d90716)] shadow-[0_0_0_1px_var(--button-primary-background,#d90716)]'
            : 'border-contrast-200 hover:border-[#fcb6bb]',
        )}
        onClick={onPick}
        role="radio"
        type="button"
      >
        <span
          className={clsx('relative block w-full bg-[#f6f6f8]', aspect, fit === 'contain' && 'p-3')}
        >
          {picture ? (
            <Image
              alt=""
              className={clsx(
                'transition-transform duration-500 group-hover:scale-[1.03]',
                fit === 'contain' ? 'object-contain' : 'object-cover',
              )}
              fill
              sizes={sizes}
              src={picture.src}
              unoptimized={picture.src.startsWith('http')}
            />
          ) : null}
          <span
            className={clsx(
              'absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full border border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white transition-opacity',
              on ? 'opacity-100' : 'opacity-0',
            )}
          >
            {on ? <Check size={13} strokeWidth={3} /> : null}
          </span>
        </span>
        <span className={clsx('block w-full', compact ? 'px-2 py-2 text-center' : 'px-4 py-3')}>
          <span
            className={clsx(
              'block font-heading font-bold leading-tight',
              compact ? 'text-sm' : 'text-base',
              info && 'pr-6',
            )}
          >
            {label}
          </span>
          {note ? (
            <span
              className={clsx('mt-0.5 block text-xs font-semibold', on ? RED : 'text-contrast-500')}
            >
              {note}
            </span>
          ) : null}
          {badge ? <span className="mt-2 block text-xs font-semibold">{badge}</span> : null}
        </span>
      </button>
      {info ? (
        <span className="absolute bottom-3 right-3">
          <Tooltip
            className="max-w-56 text-xs leading-relaxed"
            trigger={
              <button
                aria-label={`About ${label}`}
                className={clsx(
                  'flex size-6 items-center justify-center rounded-full text-contrast-500 hover:text-foreground',
                  RING,
                )}
                type="button"
              >
                <Info size={16} strokeWidth={2} />
              </button>
            }
          >
            {info}
          </Tooltip>
        </span>
      ) : null}
    </div>
  );
}

function Pill({
  on,
  onPick,
  note,
  children,
}: {
  on: boolean;
  onPick: () => void;
  note?: string;
  children: ReactNode;
}) {
  return (
    <button
      aria-checked={on}
      className={clsx(
        'inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors',
        RING,
        on
          ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
          : 'border-contrast-200 bg-white text-foreground hover:border-[#fcb6bb] hover:bg-[#fdf3f5]',
      )}
      onClick={onPick}
      role="radio"
      type="button"
    >
      {children}
      {note ? (
        <span
          className={clsx(
            'rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide',
            on
              ? 'bg-white text-[var(--button-primary-background,#d90716)]'
              : 'bg-[#F6EBD6] text-foreground',
          )}
        >
          {note}
        </span>
      ) : null}
    </button>
  );
}

// Light or dark check on a swatch, from the hex's luminance.
function darkInk(hex?: string): boolean {
  const m = /^#([0-9a-f]{6})$/i.exec(hex ?? '');

  if (!m) return true;

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1]?.slice(i, i + 2) ?? '0', 16));
  const l = (0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)) / 255;

  return l > 0.6;
}

function Swatch({
  name,
  hex,
  premium,
  on,
  onPick,
}: {
  name: string;
  hex?: string;
  premium: boolean;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      aria-checked={on}
      className={clsx('group flex w-24 flex-col items-center gap-2 rounded-2xl text-center', RING)}
      onClick={onPick}
      role="radio"
      type="button"
    >
      <span
        className={clsx(
          'flex size-20 items-center justify-center rounded-full border border-black/10 shadow-inner transition-[transform,box-shadow]',
          on
            ? 'scale-105 shadow-[0_0_0_3px_white,0_0_0_5px_var(--button-primary-background,#d90716)]'
            : 'group-hover:scale-105',
        )}
        style={{ backgroundColor: hex ?? '#e5e5e5' }}
      >
        {on ? (
          <Check className={darkInk(hex) ? 'text-black' : 'text-white'} size={24} strokeWidth={3} />
        ) : null}
      </span>
      <span className={clsx('text-xs font-semibold leading-tight', on ? RED : 'text-foreground')}>
        {name}
      </span>
      {premium ? (
        <span className="-mt-1 rounded-full bg-[#F6EBD6] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide">
          Premium
        </span>
      ) : null}
    </button>
  );
}

// What the color pick reads as on the card.
function colorLabel(w: Wizard): string {
  if (w.colorMode === 'any') return `Your choice of ${w.colors.length} finishes`;
  if (w.color === SINGLE_FINISH) return 'Standard finish';

  return w.color ?? '—';
}

// The price card: the layout render, the four picks with their pictures, the price, the
// per-foot and monthly figures, and the one next step.
function ResultStep({
  w,
  visuals,
  designHref,
}: {
  w: Wizard;
  visuals: EstimatorVisuals;
  designHref: string;
}) {
  const shape = SHAPES.find((s) => s.id === w.shape);
  const build = w.line?.variants.find((v) => v.program === w.program)?.label;
  const door = w.line && w.door ? visuals.doors[doorKey(w.line.id, w.door)] : undefined;
  const hex = w.color ? visuals.colors[w.color]?.hex : undefined;

  if (!w.estimate || !shape) return null;

  return (
    <section aria-labelledby="estimator-result">
      <p className={clsx('text-xs font-semibold uppercase tracking-wide', RED)}>Your 10×10 price</p>
      <h2
        className="mt-1 font-heading text-2xl font-bold leading-tight @xl:text-3xl"
        id="estimator-result"
      >
        Here’s what that kitchen costs
      </h2>
      <div className="mt-6 overflow-hidden rounded-3xl border border-contrast-100 bg-white shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]">
        <div className="grid @3xl:grid-cols-[1.1fr_1fr]">
          <div className="relative aspect-[4/3] bg-[#f9fafd] @3xl:aspect-auto @3xl:min-h-[26rem]">
            <Image
              alt={shape.image.alt}
              className="object-cover"
              fill
              preload
              sizes="(min-width: 56rem) 40rem, 100vw"
              src={shape.image.src}
            />
            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm">
              {shape.label}
            </span>
          </div>
          <div className="p-6 @xl:p-8">
            <dl className="space-y-3 text-sm">
              <PickRow edit={() => w.go(1)} label="Shape" value={shape.label} />
              <PickRow
                edit={() => w.go(2)}
                label="Line"
                value={[w.line?.label, build].filter(Boolean).join(' · ')}
              />
              <PickRow edit={() => w.go(3)} label="Door style" value={w.door ?? '—'}>
                {door ? (
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-contrast-100 bg-[#f6f6f8]">
                    <Image
                      alt=""
                      className="object-contain p-0.5"
                      fill
                      sizes="36px"
                      src={door.src}
                      unoptimized={door.src.startsWith('http')}
                    />
                  </span>
                ) : null}
              </PickRow>
              <PickRow
                edit={w.colorMode === 'pick' ? () => w.go(4) : undefined}
                label="Color"
                value={colorLabel(w)}
              >
                {hex ? (
                  <span
                    className="size-9 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: hex }}
                  />
                ) : null}
              </PickRow>
            </dl>
            <div className="mt-6 border-t border-contrast-100 pt-6">
              <Result designHref={designHref} estimate={w.estimate} lineHref={w.line?.href} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-3xl text-[11px] leading-relaxed text-contrast-400">
          {TEN_BY_TEN_FINE_PRINT}
        </p>
        <button
          className={clsx(
            'inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-contrast-500 hover:text-foreground',
            RING,
          )}
          onClick={w.reset}
          type="button"
        >
          <RotateCcw size={14} strokeWidth={2} />
          Start over
        </button>
      </div>
    </section>
  );
}

function PickRow({
  label,
  value,
  edit,
  children,
}: {
  label: string;
  value: string;
  edit?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <dt className="w-20 shrink-0 text-contrast-500">{label}</dt>
      <dd className="flex min-w-0 flex-1 items-center gap-3 font-semibold">
        {children}
        <span className="min-w-0 flex-1 truncate">{value}</span>
        {edit ? (
          <button
            aria-label={`Change ${label.toLowerCase()}`}
            className={clsx('shrink-0 text-xs font-semibold hover:underline', RED, RING)}
            onClick={edit}
            type="button"
          >
            Change
          </button>
        ) : null}
      </dd>
    </div>
  );
}

// The price, counting up to the figure; per foot and the monthly payment beneath; then the one
// next step.
function Result({
  estimate,
  designHref,
  lineHref,
}: {
  estimate: TenByTenEstimate;
  designHref: string;
  lineHref?: string;
}) {
  const shown = useCountUp(estimate.price);

  return (
    <div>
      <p className={clsx('font-heading text-5xl font-bold tabular-nums', RED)}>{dollars(shown)}</p>
      <p className="mt-1 text-xs text-contrast-500">
        Cabinets only · 13 cabinets · about {estimate.linearFeet} linear feet
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#f9fafd] px-4 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-contrast-500">
            Per linear foot
          </dt>
          <dd className="mt-0.5 font-heading text-lg font-bold">
            {dollarsAndCents(estimate.perFoot)}
          </dd>
        </div>
        <div className="rounded-2xl bg-[#f9fafd] px-4 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-contrast-500">
            As low as
          </dt>
          <dd className="mt-0.5 font-heading text-lg font-bold">
            {dollarsAndCents(estimate.monthly)}
            <span className="text-xs font-normal text-contrast-500">/month</span>
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] text-contrast-500">
        GreenSky at {estimate.apr}% APR for {estimate.months} months, in showrooms only.
      </p>
      <div className="mt-5 flex flex-col gap-2 @md:flex-row @md:items-center">
        <ButtonLink
          className="@md:flex-1"
          href={designHref}
          shape="pill"
          size="small"
          variant="primary"
        >
          Book a free design
        </ButtonLink>
        {lineHref ? (
          <Link
            className={clsx(
              'group inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold',
              RED,
              RING,
            )}
            href={lineHref}
          >
            Browse the line
            <ArrowRight
              className="transition-transform group-hover:translate-x-0.5"
              size={15}
              strokeWidth={2.5}
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

// Eases a number toward its target over ~600ms (instant with reduced motion).
function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      from.current = target;

      return;
    }

    const start = performance.now();
    const begin = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 600);
      const eased = 1 - (1 - t) ** 3;

      setValue(begin + (target - begin) * eased);

      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}
