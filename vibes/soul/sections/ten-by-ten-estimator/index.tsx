'use client';

import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight, Check, HandCoins, Info, RotateCcw } from 'lucide-react';
import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
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

import { fireConfetti } from './confetti';

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
const CARD_SHADOW = 'shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]';
const OUTLINE_BUTTON =
  'transition-colors [--button-ghost-background:white] [--button-ghost-background-hover:hsl(var(--foreground))] [--button-ghost-border:hsl(var(--foreground))] hover:[--button-ghost-text:white]';
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
  /** Whether the current step's pick is made, so Continue is live. */
  canContinue: boolean;
  go: (step: number) => void;
  next: () => void;
  back: () => void;
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

  const canContinue = [true, lineReady, door !== null, color !== null][step - 1] ?? false;

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
    canContinue,
    go: setStep,
    // Door → price when there is no color to pick; otherwise one step on.
    next: () => setStep(step === 3 && colorMode !== 'pick' ? RESULT : step + 1),
    back: () => setStep(step === RESULT && colorMode !== 'pick' ? 3 : step - 1),
    pickShape: setShape,
    pickLine: (id) => {
      setLineId(id);
      setProgram(LINES.find((l) => l.id === id)?.defaultProgram);
      setDoor(null);
      setColor(null);
    },
    pickProgram: (p) => {
      setProgram(p);
      setDoor(null);
      setColor(null);
    },
    pickDoor: (d) => {
      const next = line ? colorsFor(line.id, program, d) : [];
      const mode = colorModeFor(next, visuals);

      setDoor(d);
      // One finish, or a laminate list with nothing to show: decided for them.
      setColor(mode === 'pick' ? null : (next[0]?.name ?? null));
    },
    pickColor: setColor,
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
// color), each answered by picking a picture, then the price card. Continue moves on once the
// pick is made; Back and the rail at the top go back.
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
    <div
      className={clsx(
        'flex min-h-[70svh] scroll-mt-24 flex-col @container @3xl:min-h-[78svh]',
        className,
      )}
      ref={top}
    >
      <Rail current={w.step} go={w.go} reach={w.reach} />
      <div
        className="flex flex-1 flex-col motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
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
              <span className="h-0.5 min-w-4 flex-1 rounded-full bg-[#f5cdd2]">
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

// A step's frame: "Step n of 4", the question, one line of help, the choices, and the Back /
// Continue buttons pinned to the bottom. Continue is live once the step's pick is made.
function Panel({
  n,
  title,
  help,
  w,
  children,
}: {
  n: number;
  title: string;
  help?: string;
  w: Wizard;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`estimator-step-${n}`} className="flex flex-1 flex-col">
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
      <StepButtons
        canContinue={w.canContinue}
        onBack={n > 1 ? w.back : undefined}
        onContinue={w.next}
      />
    </section>
  );
}

// Back (white outline) on the left, Continue (red) on the right.
function StepButtons({
  onBack,
  onContinue,
  canContinue,
  continueLabel = 'Continue',
}: {
  onBack?: () => void;
  onContinue?: () => void;
  canContinue: boolean;
  continueLabel?: string;
}) {
  return (
    <div className="mt-auto flex items-center justify-between gap-4 pt-10">
      {onBack ? (
        <Button
          className={OUTLINE_BUTTON}
          onClick={onBack}
          shape="pill"
          size="small"
          type="button"
          variant="ghost"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back
        </Button>
      ) : (
        <span />
      )}
      {onContinue ? (
        <Button
          disabled={!canContinue}
          onClick={onContinue}
          shape="pill"
          size="small"
          type="button"
          variant="primary"
        >
          {continueLabel}
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      ) : null}
    </div>
  );
}

// 1 · Shape: the four layout renders; the description sits in a tooltip after the name.
function ShapeStep({ w }: { w: Wizard }) {
  return (
    <Panel n={1} title="What shape is your kitchen?" w={w}>
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

// 2 · Line: a kitchen per line, then the build (Star) or tier (Euro) as a toggle.
function LineStep({ w, visuals }: { w: Wizard; visuals: EstimatorVisuals }) {
  const variants = w.line?.variants ?? [];

  return (
    <Panel
      help="The line decides how the cabinet is built. You'll pick the door and color next."
      n={2}
      title="Which cabinet line?"
      w={w}
    >
      <div
        aria-label="Cabinet line"
        className="grid gap-3 @xl:grid-cols-3 @xl:gap-4"
        role="radiogroup"
      >
        {LINES.map((l) => (
          <PictureChoice
            aspect="aspect-[16/10]"
            bigLabel
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
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in">
          <p className="text-sm font-semibold" id="estimator-variant-label">
            {w.line.id === 'star' ? 'How should it arrive?' : 'Which Euro?'}
          </p>
          <Segmented
            labelledBy="estimator-variant-label"
            onPick={w.pickProgram}
            options={variants.map((v) => ({ value: v.program, label: v.label, note: v.note }))}
            value={w.program}
          />
        </div>
      ) : null}
    </Panel>
  );
}

// 3 · Door style: door samples in boxes, the name beneath.
function DoorStep({ w, visuals }: { w: Wizard; visuals: EstimatorVisuals }) {
  const doors = w.line ? doorsFor(w.line.id, w.program) : [];

  return (
    <Panel n={3} title="Which door style?" w={w}>
      <BalancedRows
        colsFor={(width) => columnsFor(width, 6)}
        items={doors}
        keyOf={(d) => d}
        label="Door style"
      >
        {(d) => (
          <PictureChoice
            aspect="aspect-square"
            compact
            fit="contain"
            label={d}
            on={w.door === d}
            onPick={() => w.pickDoor(d)}
            picture={w.line ? visuals.doors[doorKey(w.line.id, d)] : undefined}
            sizes="(min-width: 56rem) 11rem, 30vw"
          />
        )}
      </BalancedRows>
    </Panel>
  );
}

// 4 · Color: big swatches, standard first, the premium ones tagged.
function ColorStep({ w, visuals }: { w: Wizard; visuals: EstimatorVisuals }) {
  const premium = w.colors.some((c) => c.tier === 'premium');

  return (
    <Panel
      help={
        premium
          ? 'Standard colors share one price; the three premium colors cost a little more.'
          : 'Color doesn’t change the price.'
      }
      n={4}
      title={`Which color for ${w.door ?? 'the door'}?`}
      w={w}
    >
      <BalancedRows
        colsFor={(width) => columnsFor(width, 5)}
        gap={20}
        items={w.colors}
        keyOf={(c) => c.name}
        label="Color"
      >
        {(c) => (
          <Swatch
            hex={visuals.colors[c.name]?.hex}
            name={c.name}
            on={w.color === c.name}
            onPick={() => w.pickColor(c.name)}
            premium={c.tier === 'premium'}
          />
        )}
      </BalancedRows>
    </Panel>
  );
}

// A picture to pick: the image on top, the name (and an optional tooltip) beneath. Chosen =
// red outline, a red check and the kitchen-card shadow.
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
  bigLabel = false,
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
  bigLabel?: boolean;
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
            ? clsx(
                'border-[var(--button-primary-background,#d90716)] shadow-[0_0_0_1px_var(--button-primary-background,#d90716),0_24px_48px_-28px_rgb(0_0_0/0.3)]',
              )
            : 'border-contrast-200 hover:border-[#fcb6bb] hover:shadow-[0_18px_36px_-28px_rgb(0_0_0/0.3)]',
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
            <Check size={13} strokeWidth={3} />
          </span>
        </span>
        <span className={clsx('block w-full', compact ? 'px-2 py-2 text-center' : 'px-4 py-3')}>
          <span
            className={clsx(
              'block font-heading font-bold leading-tight',
              compact && 'text-sm',
              !compact && !bigLabel && 'text-base',
              bigLabel && clsx('text-xl @xl:text-2xl', RED),
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
            className="max-w-56 !border-transparent text-xs leading-relaxed text-white [--tooltip-background:var(--button-primary-background,#d90716)]"
            delayDuration={0}
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

// A toggle between a few options (Assembled / Ready to assemble; the Euro tiers): one white
// track, the chosen option a red pill.
function Segmented({
  options,
  value,
  onPick,
  labelledBy,
}: {
  options: Array<{ value: string; label: string; note?: string }>;
  value?: string;
  onPick: (value: string) => void;
  labelledBy: string;
}) {
  return (
    <div
      aria-labelledby={labelledBy}
      className="inline-flex flex-wrap gap-1 rounded-full border border-contrast-200 bg-white p-1"
      role="radiogroup"
    >
      {options.map((o) => {
        const on = o.value === value;

        return (
          <button
            aria-checked={on}
            className={clsx(
              'inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              RING,
              on
                ? 'bg-[var(--button-primary-background,#d90716)] text-white shadow-sm'
                : 'text-foreground hover:bg-[#fdf3f5]',
            )}
            key={o.value}
            onClick={() => onPick(o.value)}
            role="radio"
            type="button"
          >
            {o.label}
            {o.note ? (
              <span
                className={clsx(
                  'hidden rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide @xl:inline',
                  on
                    ? 'bg-white text-[var(--button-primary-background,#d90716)]'
                    : 'bg-[#F6EBD6] text-foreground',
                )}
              >
                {o.note}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
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
      className={clsx(
        'group flex w-full flex-col items-center gap-3 rounded-2xl bg-white p-3 text-center transition-[box-shadow,transform] @xl:p-4',
        RING,
        on
          ? clsx(
              CARD_SHADOW,
              'ring-2 ring-[var(--button-primary-background,#d90716)] ring-offset-4 ring-offset-[#fdf3f5]',
            )
          : 'shadow-[0_18px_36px_-28px_rgb(0_0_0/0.3)] hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.35)]',
      )}
      onClick={onPick}
      role="radio"
      type="button"
    >
      <span
        className="flex aspect-square w-full items-center justify-center rounded-xl border border-black/10"
        style={{ backgroundColor: hex ?? '#e5e5e5' }}
      >
        {on ? (
          <Check className={darkInk(hex) ? 'text-black' : 'text-white'} size={28} strokeWidth={3} />
        ) : null}
      </span>
      <span
        className={clsx(
          'font-heading text-sm font-bold leading-tight @xl:text-base',
          on ? RED : 'text-foreground',
        )}
      >
        {name}
      </span>
      {premium ? (
        <span className="-mt-2 rounded-full bg-[#F6EBD6] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide">
          Premium
        </span>
      ) : null}
    </button>
  );
}

// Rows of equal tiles, centred, balanced so a short last row doesn't sit alone on the left:
// 7 doors at 6 per row become 4 + 3. Columns follow the measured width (the container queries'
// breakpoints), tile width follows the columns.
function BalancedRows<T>({
  items,
  keyOf,
  colsFor,
  gap = 16,
  label,
  children,
}: {
  items: T[];
  keyOf: (item: T) => string;
  colsFor: (width: number) => number;
  gap?: number;
  label: string;
  children: (item: T) => ReactNode;
}) {
  const [ref, width] = useContainerWidth<HTMLDivElement>();
  const cols = colsFor(width || 1200);
  const tile = width ? (width - gap * (cols - 1)) / cols : undefined;

  return (
    <div aria-label={label} className="flex flex-col" ref={ref} role="radiogroup" style={{ gap }}>
      {balancedRows(items, cols).map((row) => (
        <div className="flex justify-center" key={row.map(keyOf).join('|')} style={{ gap }}>
          {row.map((item) => (
            <div className="shrink-0" key={keyOf(item)} style={{ width: tile }}>
              {children(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Columns at the container-query breakpoints (@3xl = 56rem, @xl = 36rem): `wide` on desktop,
// four on a tablet, three on a phone.
function columnsFor(width: number, wide: number): number {
  if (width >= 896) return wide;
  if (width >= 576) return 4;

  return 3;
}

function balancedRows<T>(items: T[], cols: number): T[][] {
  const rows = Math.max(1, Math.ceil(items.length / cols));
  const base = Math.floor(items.length / rows);
  let extra = items.length % rows;
  const out: T[][] = [];
  let i = 0;

  for (let r = 0; r < rows; r += 1) {
    const n = base + (extra > 0 ? 1 : 0);

    if (extra > 0) extra -= 1;
    out.push(items.slice(i, i + n));
    i += n;
  }

  return out;
}

function useContainerWidth<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return [ref, width];
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

  // A little celebration the moment the price lands.
  useEffect(() => fireConfetti(), []);

  if (!w.estimate || !shape) return null;

  return (
    <section aria-labelledby="estimator-result" className="flex flex-1 flex-col">
      <p className={clsx('text-xs font-semibold uppercase tracking-wide', RED)}>Your 10×10 price</p>
      <h2
        className="mt-1 font-heading text-2xl font-bold leading-tight @xl:text-3xl"
        id="estimator-result"
      >
        Here’s what that kitchen costs
      </h2>
      <div
        className={clsx(
          'mt-6 overflow-hidden rounded-3xl border border-contrast-100 bg-white',
          CARD_SHADOW,
        )}
      >
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
      <p className="mt-5 max-w-3xl text-[11px] leading-relaxed text-contrast-500">
        {TEN_BY_TEN_FINE_PRINT}
      </p>
      <div className="mt-auto flex items-center justify-between gap-4 pt-8">
        <Button
          className={OUTLINE_BUTTON}
          onClick={w.back}
          shape="pill"
          size="small"
          type="button"
          variant="ghost"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back
        </Button>
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

// The price, counting up to the figure; per foot and the monthly payment beneath; the financing
// note in a green band; then the one next step.
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
      <p className="text-xs font-medium text-contrast-500">Your 10×10 kitchen</p>
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
      <p className="mt-3 flex items-center gap-2.5 rounded-2xl bg-[#e4f3e8] px-4 py-2.5 text-xs font-medium text-[#1f4d2b]">
        <HandCoins aria-hidden className="shrink-0" size={18} strokeWidth={2} />
        GreenSky financing at {estimate.apr}% APR for {estimate.months} months, in showrooms only.
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
