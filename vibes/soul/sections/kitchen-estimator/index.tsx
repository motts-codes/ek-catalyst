'use client';

import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DynamicForm, type DynamicFormAction } from '@/vibes/soul/form/dynamic-form';
import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { type Layout, LAYOUTS, type Package, PACKAGES } from '~/lib/estimator/config';
import { estimate, type EstimateInput, type PriceBook } from '~/lib/estimator/estimate';

const LAYOUT_KEYS: Layout[] = ['l', 'straight', 'u', 'galley'];
const PACKAGE_KEYS: Package[] = ['essentials', 'premium', 'luxe'];

const STEPS = ['Kitchen layout', 'Measurements', 'Package', 'Your estimate'];
const WALL_NAMES = ['A', 'B', 'C'];

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

const pickClassName = (on: boolean) =>
  clsx(
    'flex w-full flex-col rounded-3xl border bg-white p-5 text-left transition-[border-color,box-shadow] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
    on
      ? 'border-foreground shadow-[0_18px_36px_-24px_rgb(0_0_0/0.35)]'
      : 'border-contrast-100 hover:border-contrast-300',
  );

const inputClassName =
  'w-full rounded-xl border border-contrast-200 bg-white px-4 py-3 text-sm focus:border-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';

interface Props {
  book: PriceBook;
  emailAction: DynamicFormAction<Field>;
  links: { design: string; cabinets: string; samples: string };
}

// Four steps to a price range. The maths lives in lib/estimator (see docs/ESTIMATOR-LOGIC.md);
// this component only collects the inputs and shows the result. The number is never behind an
// email: the email form is optional and the estimate stays on screen.
export function KitchenEstimator({ book, emailAction, links }: Props) {
  const [step, setStep] = useState(0);
  const [layout, setLayout] = useState<Layout>('l');
  const [walls, setWalls] = useState<string[]>(['10', '12', '10']);
  const [ceiling, setCeiling] = useState<8 | 9 | 10>(8);
  const [island, setIsland] = useState(false);
  const [pack, setPack] = useState<Package>('premium');

  const wallCount = LAYOUTS[layout].walls;
  const input: EstimateInput = useMemo(
    () => ({
      layout,
      walls: walls.slice(0, wallCount).map(Number),
      ceiling,
      island,
      package: pack,
    }),
    [layout, walls, wallCount, ceiling, island, pack],
  );
  const result = useMemo(() => estimate(input, book), [input, book]);
  const wallsValid = walls.slice(0, wallCount).every((w) => Number(w) >= 3 && Number(w) <= 40);
  const summary = `${LAYOUTS[layout].label} · ${walls.slice(0, wallCount).join(' × ')} ft · ${ceiling} ft ceiling${island ? ' · island' : ''} · ${PACKAGES[pack].label}`;

  const emailFields: Field[] = [
    { type: 'email', name: 'email', label: 'Your email', required: true },
    {
      type: 'hidden',
      name: 'summary',
      label: 'Summary',
      defaultValue: `${summary} → ${money(result.low)} – ${money(result.high)}`,
    },
  ];

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="rounded-3xl border border-contrast-100 bg-white p-5 @xl:p-8">
      {/* Step rail */}
      <ol aria-label="Steps" className="mb-8 grid grid-cols-4 gap-2">
        {STEPS.map((label, i) => (
          <li className="flex flex-col gap-2" key={label}>
            <span
              className={clsx(
                'h-1 rounded-full',
                i <= step ? 'bg-[var(--button-primary-background,#d90716)]' : 'bg-contrast-100',
              )}
            />
            <span
              aria-current={i === step ? 'step' : undefined}
              className={clsx(
                'text-xs font-semibold',
                i === step ? 'text-foreground' : 'text-contrast-400',
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section aria-labelledby="est-step-1">
          <h2 className="font-heading text-2xl font-bold" id="est-step-1">
            Select the layout of your kitchen
          </h2>
          <p className="mt-2 text-sm text-contrast-500">
            Not sure which one? Each card explains it.
          </p>
          <div className="mt-6 grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-4">
            {LAYOUT_KEYS.map((key) => (
              <button
                aria-pressed={layout === key}
                className={pickClassName(layout === key)}
                key={key}
                onClick={() => setLayout(key)}
                type="button"
              >
                <span className="relative mb-4 block aspect-[4/3] overflow-hidden rounded-2xl bg-contrast-100">
                  <MediaPlaceholder label={`${LAYOUTS[key].label} plan`} />
                </span>
                <span className="font-heading text-lg font-semibold">{LAYOUTS[key].label}</span>
                <span className="mt-1 text-sm leading-relaxed text-contrast-500">
                  {LAYOUTS[key].description}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section aria-labelledby="est-step-2">
          <h2 className="font-heading text-2xl font-bold" id="est-step-2">
            Measure your walls
          </h2>
          <p className="mt-2 text-sm text-contrast-500">
            Rough is fine. A designer checks every number before anything is ordered.
          </p>
          <div className="mt-6 grid gap-8 @3xl:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-contrast-100">
              <MediaPlaceholder
                label={`${LAYOUTS[layout].label} — walls ${WALL_NAMES.slice(0, wallCount).join(', ')} labelled`}
              />
            </div>
            <div className="grid gap-4">
              {WALL_NAMES.slice(0, wallCount).map((name, i) => (
                <label className="block text-sm font-medium" key={name}>
                  Wall {name} length (ft)
                  <input
                    className={clsx(inputClassName, 'mt-1.5')}
                    inputMode="decimal"
                    max={40}
                    min={3}
                    onChange={(e) =>
                      setWalls((w) => w.map((v, j) => (j === i ? e.target.value : v)))
                    }
                    step={0.5}
                    type="number"
                    value={walls[i] ?? ''}
                  />
                </label>
              ))}
              <fieldset>
                <legend className="text-sm font-medium">Ceiling height</legend>
                <div className="mt-1.5 flex gap-2">
                  {([8, 9, 10] as const).map((h) => (
                    <button
                      aria-pressed={ceiling === h}
                      className={clsx(
                        'rounded-full border px-4 py-2 text-sm font-medium',
                        ceiling === h
                          ? 'border-foreground bg-foreground text-white'
                          : 'border-contrast-200 hover:border-foreground',
                      )}
                      key={h}
                      onClick={() => setCeiling(h)}
                      type="button"
                    >
                      {h === 10 ? '10 ft or more' : `${h} ft`}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium">Island?</legend>
                <div className="mt-1.5 flex gap-2">
                  {[false, true].map((v) => (
                    <button
                      aria-pressed={island === v}
                      className={clsx(
                        'rounded-full border px-4 py-2 text-sm font-medium',
                        island === v
                          ? 'border-foreground bg-foreground text-white'
                          : 'border-contrast-200 hover:border-foreground',
                      )}
                      key={String(v)}
                      onClick={() => setIsland(v)}
                      type="button"
                    >
                      {v ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </fieldset>
              {!wallsValid && (
                <p className="text-sm text-[var(--button-primary-background,#d90716)]" role="alert">
                  Each wall should be between 3 and 40 feet.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section aria-labelledby="est-step-3">
          <h2 className="font-heading text-2xl font-bold" id="est-step-3">
            Pick your package
          </h2>
          <p className="mt-2 text-sm text-contrast-500">
            What goes into the kitchen. Collection and finish are chosen with your designer; every
            package uses the same all-plywood cabinet.
          </p>
          <div className="mt-6 grid gap-4 @3xl:grid-cols-3">
            {PACKAGE_KEYS.map((key) => (
              <button
                aria-pressed={pack === key}
                className={pickClassName(pack === key)}
                key={key}
                onClick={() => setPack(key)}
                type="button"
              >
                <span className="flex items-baseline justify-between">
                  <span className="font-heading text-lg font-semibold">{PACKAGES[key].label}</span>
                  <span className="text-sm font-semibold text-contrast-400">
                    {PACKAGES[key].tier}
                  </span>
                </span>
                <span className="mt-1 text-sm leading-relaxed text-contrast-500">
                  {PACKAGES[key].description}
                </span>
                <span className="relative my-4 block aspect-[16/9] overflow-hidden rounded-2xl bg-contrast-100">
                  <MediaPlaceholder label={`${PACKAGES[key].label} kitchen`} />
                </span>
                <ul className="space-y-1.5 text-sm">
                  {PACKAGES[key].includes.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <Check
                        aria-hidden
                        className="mt-0.5 shrink-0 text-[var(--button-primary-background,#d90716)]"
                        size={15}
                        strokeWidth={2.5}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-contrast-400">
            Package contents and price bands to be confirmed.
          </p>
        </section>
      )}

      {step === 3 && (
        <section aria-labelledby="est-step-4" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
            Estimated cost — {PACKAGES[pack].label} package
          </p>
          <h2
            className="mt-2 font-heading text-4xl font-bold leading-none @xl:text-5xl"
            id="est-step-4"
          >
            {money(result.low)} – {money(result.high)}
          </h2>
          <p className="mt-3 text-sm text-contrast-500">{summary}</p>
          <p className="mt-1 text-sm text-contrast-500">
            Assembled cabinets, 3 weeks · ready-to-assemble saves about {money(result.rtaSaving)}
          </p>
          <div className="mt-8 grid gap-8 @3xl:grid-cols-[1.2fr_1fr]">
            <div>
              <h3 className="font-heading text-lg font-semibold">What&apos;s in that number</h3>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-contrast-400">
                    <th className="py-2 pr-4" scope="col">
                      Item
                    </th>
                    <th className="py-2 pr-4" scope="col">
                      Qty
                    </th>
                    <th className="py-2 text-right" scope="col">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.lines.map((line) => (
                    <tr className="border-t border-contrast-100" key={line.item}>
                      <td className="py-2.5 pr-4 font-medium">{line.item}</td>
                      <td className="py-2.5 pr-4 text-contrast-500">{line.qty}</td>
                      <td className="py-2.5 text-right">{money(line.price)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-contrast-200 font-semibold">
                    <td className="py-2.5 pr-4">Estimate</td>
                    <td />
                    <td className="py-2.5 text-right">{money(result.total)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-xs text-contrast-400">
                Excludes installation, delivery and tax. We&apos;d rather say so now than at the
                quote.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-contrast-100 bg-[#f9fafd] p-5">
                <h3 className="font-heading text-lg font-semibold">Email me this estimate</h3>
                <p className="mt-1 text-sm text-contrast-500">
                  Optional. The number stays on screen either way.
                </p>
                <div className="mt-3">
                  <DynamicForm
                    action={emailAction}
                    fields={emailFields}
                    submitLabel="Send it to me"
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-contrast-100 p-5">
                <h3 className="font-heading text-lg font-semibold">Have a designer validate it</h3>
                <p className="mt-1 text-sm text-contrast-500">
                  Free. They check sizes against your room and give you a fixed price.
                </p>
                <div className="mt-3">
                  <ButtonLink href={links.design} shape="pill" size="small" variant="primary">
                    Free design consult
                  </ButtonLink>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <ButtonLink href={links.cabinets} shape="pill" size="small" variant="secondary">
                  See the collections
                </ButtonLink>
                <ButtonLink href={links.samples} shape="pill" size="small" variant="secondary">
                  Order free samples
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-contrast-100 pt-5">
        <button
          className="rounded-full border border-contrast-200 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
          disabled={step === 0}
          onClick={back}
          type="button"
        >
          Back
        </button>
        {step < 3 ? (
          <button
            className="rounded-full bg-[var(--button-primary-background,#d90716)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            disabled={step === 1 && !wallsValid}
            onClick={next}
            type="button"
          >
            {step === 2 ? 'Show my estimate' : 'Next'}
          </button>
        ) : (
          <button
            className="rounded-full border border-contrast-200 px-5 py-2.5 text-sm font-semibold"
            onClick={() => setStep(0)}
            type="button"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
