'use client';

import { clsx } from 'clsx';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
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

interface Props {
  /** Where "Book a free design" goes. */
  designHref: string;
  className?: string;
}

const RED = 'text-[var(--button-primary-background,#d90716)]';
const STEPS = ['Shape', 'Line', 'Door style', 'Color'] as const;
const SINGLE_FINISH = 'Standard finish (single color)';

// Everything the estimator knows: the four picks and what follows from them.
interface Picks {
  shape: ShapeId;
  line: Line | undefined;
  program: string | undefined;
  door: string | null;
  color: string | null;
  /** Star and Euro need a build / tier before the doors can be listed; Prism doesn't. */
  lineReady: boolean;
  doors: string[];
  colors: ColorOption[];
  estimate: TenByTenEstimate | null;
  /** The step you're on: the first pick still missing (1–4), 5 when complete. */
  step: number;
  setShape: (id: ShapeId) => void;
  pickLine: (id: LineId) => void;
  pickProgram: (program: string) => void;
  pickDoor: (door: string) => void;
  setColor: (color: string) => void;
  reset: () => void;
}

function usePicks(): Picks {
  const [shape, setShape] = useState<ShapeId>('l-shape');
  const [lineId, setLineId] = useState<LineId | null>(null);
  const [program, setProgram] = useState<string | undefined>(undefined);
  const [door, setDoor] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);

  const line = LINES.find((l) => l.id === lineId);
  const needsVariant = (line?.variants.length ?? 0) > 0;
  const lineReady = line !== undefined && (!needsVariant || program !== undefined);
  const doors = useMemo(
    () => (line && lineReady ? doorsFor(line.id, program) : []),
    [line, lineReady, program],
  );
  const colors = useMemo(
    () => (line && door ? colorsFor(line.id, program, door) : []),
    [line, program, door],
  );
  const row = line && door && color ? rowFor(line.id, program, door, color) : null;
  const estimate = row ? estimateFor(row.price) : null;

  return {
    shape,
    line,
    program,
    door,
    color,
    lineReady,
    doors,
    colors,
    estimate,
    step: stepFor(lineReady, door, color),
    setShape,
    pickLine: (id) => {
      setLineId(id);
      setProgram(undefined);
      setDoor(null);
      setColor(null);
    },
    pickProgram: (p) => {
      setProgram(p);
      setDoor(null);
      setColor(null);
    },
    pickDoor: (d) => {
      setDoor(d);

      // A single-color style needs no color step: pick it for them.
      const next = line ? colorsFor(line.id, program, d) : [];

      setColor(next.length === 1 ? (next[0]?.name ?? null) : null);
    },
    setColor,
    reset: () => {
      setLineId(null);
      setProgram(undefined);
      setDoor(null);
      setColor(null);
    },
  };
}

function stepFor(lineReady: boolean, door: string | null, color: string | null): number {
  if (!lineReady) return 1;
  if (!door) return 2;
  if (!color) return 3;

  return 4;
}

// The estimator: four picks on the left (shape, line, door style, color), each a row of cards,
// and a panel on the right that shows the kitchen shape you chose, your picks so far, and the
// price the moment the pick is complete. Nothing is hidden behind an email.
export function TenByTenEstimator({ designHref, className }: Props) {
  const picks = usePicks();

  return (
    <div className={clsx('@container', className)}>
      <div className="grid gap-10 @3xl:grid-cols-[1fr_22rem] @3xl:gap-14 @5xl:grid-cols-[1fr_26rem]">
        <div className="min-w-0">
          <Progress current={picks.step} done={picks.estimate !== null} />
          <ShapeStep picks={picks} />
          <LineStep picks={picks} />
          <DoorStep picks={picks} />
          <ColorStep picks={picks} />
          {picks.line ? (
            <button
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-contrast-500 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
              onClick={picks.reset}
              type="button"
            >
              <RotateCcw size={14} strokeWidth={2} />
              Start over
            </button>
          ) : null}
        </div>
        <Summary designHref={designHref} picks={picks} />
      </div>
    </div>
  );
}

// 1 · Shape
function ShapeStep({ picks }: { picks: Picks }) {
  return (
    <Section
      help="Shape changes the picture, not the price. Every shape uses the same 13-cabinet 10×10 mix."
      number={1}
      title="Pick your kitchen shape"
    >
      <div
        aria-label="Kitchen shape"
        className="grid grid-cols-2 gap-3 @xl:grid-cols-4"
        role="radiogroup"
      >
        {SHAPES.map((s) => (
          <div key={s.id}>
            <Choice
              label={s.label}
              note={s.blurb}
              on={picks.shape === s.id}
              onPick={() => picks.setShape(s.id)}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

// 2 · Line, and the build / tier inside it
function LineStep({ picks }: { picks: Picks }) {
  const { line } = picks;
  const variants = line?.variants ?? [];

  return (
    <Section
      help="The line decides how the cabinet is built; the door style and color decide the look."
      number={2}
      title="Pick your cabinet line"
    >
      <div aria-label="Cabinet line" className="grid gap-3 @xl:grid-cols-3" role="radiogroup">
        {LINES.map((l) => (
          <div key={l.id}>
            <Choice
              badge={`from ${dollars(fromPriceFor(l.id))}`}
              label={l.label}
              note={l.tagline}
              on={line?.id === l.id}
              onPick={() => picks.pickLine(l.id)}
              tall
            >
              {l.blurb}
            </Choice>
          </div>
        ))}
      </div>
      {line && variants.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-contrast-500">
            {line.id === 'star' ? 'Built how?' : 'Which Euro?'}
          </p>
          <div
            aria-label={line.id === 'star' ? 'Built how' : 'Which Euro'}
            className="flex flex-wrap gap-2"
            role="radiogroup"
          >
            {variants.map((v) => (
              <div key={v.program}>
                <Pill
                  note={v.note}
                  on={picks.program === v.program}
                  onPick={() => picks.pickProgram(v.program)}
                >
                  {v.label}
                </Pill>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Section>
  );
}

// 3 · Door style
function DoorStep({ picks }: { picks: Picks }) {
  return (
    <Section
      help="Only the styles made in that line are listed."
      locked={!picks.lineReady}
      lockedHint="Pick a cabinet line first."
      number={3}
      title="Pick a door style"
    >
      <div aria-label="Door style" className="flex flex-wrap gap-2" role="radiogroup">
        {picks.doors.map((d) => (
          <div key={d}>
            <Pill on={picks.door === d} onPick={() => picks.pickDoor(d)}>
              {d}
            </Pill>
          </div>
        ))}
      </div>
    </Section>
  );
}

// 4 · Color
function ColorStep({ picks }: { picks: Picks }) {
  const { colors, door } = picks;
  const only = colors.length === 1 ? colors[0] : undefined;

  return (
    <Section
      help={
        picks.line?.id === 'prism'
          ? 'Standard colors share one price; the three premium colors cost a little more.'
          : 'Color doesn’t change the price.'
      }
      locked={!door}
      lockedHint="Pick a door style first."
      number={4}
      title="Pick a color"
    >
      {only ? (
        <p className="text-sm text-contrast-500">
          {only.name === SINGLE_FINISH
            ? `${door} comes in one finish, so it’s chosen for you.`
            : `${door} comes in ${only.name}, so it’s chosen for you.`}
        </p>
      ) : (
        <div aria-label="Color" className="flex flex-wrap gap-2" role="radiogroup">
          {colors.map((c) => (
            <div key={c.name}>
              <Pill
                note={c.tier === 'premium' ? 'premium' : undefined}
                on={picks.color === c.name}
                onPick={() => picks.setColor(c.name)}
              >
                {c.name}
              </Pill>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// The panel: the shape you chose, your picks, and the price. Sticky on desktop.
function Summary({ picks, designHref }: { picks: Picks; designHref: string }) {
  const { line, program, door, color, estimate, step } = picks;
  const build = line?.variants.find((v) => v.program === program)?.label;
  const hints: Record<number, string> = {
    1: 'Pick a cabinet line to see a price.',
    2: 'Pick a door style to see a price.',
    3: 'Pick a color to see your price.',
  };

  return (
    <aside className="@3xl:sticky @3xl:top-6 @3xl:self-start">
      <div className="overflow-hidden rounded-3xl border border-contrast-100 bg-white shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]">
        <ShapePicture shape={picks.shape} />
        <div className="p-6">
          <dl className="space-y-2 text-sm">
            <Pick label="Shape" value={SHAPES.find((s) => s.id === picks.shape)?.label} />
            <Pick
              label="Line"
              value={line ? [line.label, build].filter(Boolean).join(' · ') : undefined}
            />
            <Pick label="Door style" value={door ?? undefined} />
            <Pick
              label="Color"
              value={color === SINGLE_FINISH ? 'Standard finish' : (color ?? undefined)}
            />
          </dl>
          <div aria-live="polite" className="mt-6 border-t border-contrast-100 pt-6">
            {estimate ? (
              <Result designHref={designHref} estimate={estimate} lineHref={line?.href} />
            ) : (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-contrast-500">
                  Your 10×10 price
                </p>
                <p className="mt-2 font-heading text-3xl font-bold text-contrast-500">$ —</p>
                <p className="mt-2 text-sm text-contrast-500">{hints[step]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-contrast-400">{TEN_BY_TEN_FINE_PRINT}</p>
    </aside>
  );
}

// The four steps as a thin progress rail, the current one red.
function Progress({ current, done }: { current: number; done: boolean }) {
  return (
    <ol aria-label="Progress" className="mb-8 flex items-center gap-2">
      {STEPS.map((label, index) => {
        const n = index + 1;
        const complete = done || n < current;
        const active = !done && n === current;

        return (
          <li className="flex flex-1 items-center gap-2" key={label}>
            <span
              className={clsx(
                'flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors',
                complete || active
                  ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
                  : 'border-contrast-200 bg-white text-contrast-500',
              )}
            >
              {complete ? <Check size={12} strokeWidth={3} /> : n}
            </span>
            <span
              className={clsx(
                'hidden text-xs font-semibold @md:inline',
                active ? RED : 'text-contrast-500',
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="h-0.5 flex-1 rounded-full bg-contrast-100">
                <span
                  className={clsx(
                    'block h-full rounded-full bg-[var(--button-primary-background,#d90716)] transition-[width] duration-500',
                    complete ? 'w-full' : 'w-0',
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

// One numbered step: a red number, the question, a hint, and the choices; faded and inert while
// a previous step is still needed.
function Section({
  number,
  title,
  help,
  locked = false,
  lockedHint,
  children,
}: {
  number: number;
  title: string;
  help?: string;
  locked?: boolean;
  lockedHint?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-contrast-100 py-7">
      <div className="mb-4 flex items-start gap-3">
        <span
          className={clsx(
            'font-heading text-sm font-bold leading-6',
            locked ? 'text-contrast-500' : RED,
          )}
        >
          0{number}
        </span>
        <div>
          <h2
            className={clsx(
              'font-heading text-lg font-bold leading-tight @xl:text-xl',
              locked ? 'text-contrast-500' : 'text-foreground',
            )}
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-contrast-500">
            {locked && lockedHint ? lockedHint : help}
          </p>
        </div>
      </div>
      <div className={clsx(locked && 'pointer-events-none')} inert={locked ? true : undefined}>
        {children}
      </div>
    </section>
  );
}

// A card choice (shape, line): outlined at rest, red outline + blush when chosen.
function Choice({
  label,
  note,
  badge,
  on,
  onPick,
  tall = false,
  children,
}: {
  label: string;
  note?: string;
  badge?: string;
  on: boolean;
  onPick: () => void;
  tall?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      aria-checked={on}
      className={clsx(
        'flex h-full w-full flex-col rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2',
        on
          ? 'border-[var(--button-primary-background,#d90716)] bg-[#fdf3f5] shadow-[0_0_0_1px_var(--button-primary-background,#d90716)]'
          : 'border-contrast-200 bg-white hover:border-[#fcb6bb] hover:bg-[#fdf8f8]',
        tall && 'min-h-[9rem]',
      )}
      onClick={onPick}
      role="radio"
      type="button"
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="font-heading text-base font-bold leading-tight">{label}</span>
        <span
          className={clsx(
            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            on
              ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
              : 'border-contrast-300 bg-white',
          )}
        >
          {on ? <Check size={12} strokeWidth={3} /> : null}
        </span>
      </span>
      {note ? (
        <span className={clsx('mt-1 text-xs font-semibold', on ? RED : 'text-contrast-500')}>
          {note}
        </span>
      ) : null}
      {children ? (
        <span className="mt-2 text-xs leading-relaxed text-contrast-500">{children}</span>
      ) : null}
      {badge ? (
        <span className="mt-auto pt-3 text-xs font-semibold text-foreground">{badge}</span>
      ) : null}
    </button>
  );
}

// A pill choice (build, door style, color).
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
        'inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2',
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

// The chosen shape's render, crossfading when it changes.
function ShapePicture({ shape }: { shape: ShapeId }) {
  return (
    <div className="relative aspect-[4/3] bg-[#f9fafd]">
      {SHAPES.map((s) => (
        <Image
          alt={s.image.alt}
          aria-hidden={s.id !== shape}
          className={clsx(
            'object-cover transition-opacity duration-500',
            s.id === shape ? 'opacity-100' : 'opacity-0',
          )}
          fill
          key={s.id}
          sizes="(min-width: 56rem) 26rem, 100vw"
          src={s.image.src}
        />
      ))}
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm">
        {SHAPES.find((s) => s.id === shape)?.label}
      </span>
    </div>
  );
}

function Pick({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-contrast-500">{label}</dt>
      <dd
        className={clsx(
          'text-right font-semibold',
          value ? 'text-foreground' : 'text-contrast-300',
        )}
      >
        {value ?? '—'}
      </dd>
    </div>
  );
}

// The price, counting up to the new figure when it changes; per foot and the monthly payment
// beneath; then the one next step.
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
      <p className="text-xs font-semibold uppercase tracking-wide text-contrast-500">
        Your 10×10 price
      </p>
      <p className={clsx('mt-1 font-heading text-4xl font-bold tabular-nums', RED)}>
        {dollars(shown)}
      </p>
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
      <p className="mt-2 text-[11px] text-contrast-400">
        GreenSky at {estimate.apr}% APR for {estimate.months} months, in showrooms only.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <ButtonLink
          className="w-full"
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
              'group inline-flex items-center justify-center gap-1.5 py-1 text-sm font-semibold',
              RED,
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
  const [value, setValue] = useState(target);
  const from = useRef(target);

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
