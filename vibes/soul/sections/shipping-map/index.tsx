'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import {
  doorRange,
  formatDuration,
  inDeliveryZone,
  SHIP_CATEGORIES,
  SHIP_STATE_GRID,
  SHIP_STATE_NAMES,
  type ShipCategory,
  transitDays,
} from '~/lib/pages/shipping';

type Band = 'd7' | 'd8' | 'd9' | 'd10' | 'pickup' | 'none';

interface Tile {
  state: string;
  band: Band;
  /** Short text printed on the tile ("3 wks", "pickup", "call"). */
  label: string;
  /** Full sentence for screen readers and the title tooltip. */
  detail: string;
}

// Band fills are a grey ramp with the duration printed on every tile, so the information never
// rests on colour alone; every fill keeps ≥ 4.5:1 against the dark text.
const BAND_CLASS: Record<Band, string> = {
  d7: 'bg-white',
  d8: 'bg-neutral-200',
  d9: 'bg-neutral-300',
  d10: 'bg-neutral-400',
  pickup: 'bg-foreground text-white',
  none: 'border-dashed bg-transparent text-contrast-500',
};

const LEGEND: Record<ShipCategory['mode'], Array<{ band: Band; label: string }>> = {
  national: [
    { band: 'd7', label: 'Northeast — +7 days' },
    { band: 'd8', label: 'Mid-Atlantic / Southeast — +8 days' },
    { band: 'd9', label: 'Central / South — +9 days' },
    { band: 'd10', label: 'West and far — +10 days' },
    { band: 'none', label: 'Alaska and Hawaii — contact us' },
  ],
  zone: [
    { band: 'd7', label: 'Delivering today' },
    { band: 'none', label: 'Not yet — zone expanding' },
  ],
  pickup: [
    { band: 'pickup', label: 'Pickup point (Bristol, CT)' },
    { band: 'none', label: 'Not shipped' },
  ],
};

function tileFor(state: string, category: ShipCategory): Tile {
  const name = SHIP_STATE_NAMES[state] ?? state;

  if (category.mode === 'pickup') {
    return state === 'CT'
      ? { state, band: 'pickup', label: 'pickup', detail: `${name}: pickup point, Bristol, CT` }
      : { state, band: 'none', label: '', detail: `${name}: pickup only, from Bristol, CT` };
  }

  const lead = category.lead ?? 0;

  if (category.mode === 'zone') {
    return inDeliveryZone(state)
      ? {
          state,
          band: 'd7',
          label: formatDuration(lead + 7),
          detail: `${name}: about ${formatDuration(lead + 7)} to your door`,
        }
      : { state, band: 'none', label: 'soon', detail: `${name}: not yet, delivery zone expanding` };
  }

  const days = transitDays(state);

  if (days === null) {
    return { state, band: 'none', label: 'call', detail: `${name}: contact us for a quote` };
  }

  const total = formatDuration(lead + days);

  return {
    state,
    band: `d${days}`,
    label: total,
    detail: `${name}: about ${total} to your door (${category.ship} make and ship plus ${days} days transit)`,
  };
}

const PANEL_COPY: Record<
  ShipCategory['mode'],
  (c: ShipCategory) => { headline: string; sub: string }
> = {
  pickup: () => ({ headline: 'Pickup', sub: 'Ready in 2 days at Express Kitchens, Bristol, CT' }),
  zone: (c) => ({
    headline: `${c.ship} + about 7 days`,
    sub: 'Make and ship, then transit inside the zone',
  }),
  national: (c) => ({
    headline: doorRange(c),
    sub: `To your door: ${c.ship} make and ship + 7–10 days transit`,
  }),
};

function Panel({ category }: { category: ShipCategory }) {
  const { headline, sub } = PANEL_COPY[category.mode](category);

  return (
    <div
      aria-live="polite"
      className="flex flex-col gap-1.5 rounded-3xl border border-contrast-100 bg-white p-5"
    >
      <h3 className="font-heading text-lg font-semibold">{category.name}</h3>
      <p className="text-sm text-contrast-500">{category.method}</p>
      <p className="mt-2 font-heading text-2xl font-bold leading-tight">{headline}</p>
      <p className="text-sm text-contrast-500">{sub}</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {LEGEND[category.mode].map((item) => (
          <li className="flex items-center gap-2" key={item.label}>
            <span
              aria-hidden
              className={clsx(
                'inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-contrast-300',
                BAND_CLASS[item.band],
              )}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Props {
  kicker?: string;
  title: string;
  description?: string;
  tint?: boolean;
}

// "Delivery time by state": pick a category, and every state tile shows the total time to your
// door for it. Tiles are not interactive — the chips are — so the grid reads as a list.
export function ShippingMap({
  kicker = 'Delivery time by state',
  title,
  description,
  tint,
}: Props) {
  const [selected, setSelected] = useState(SHIP_CATEGORIES[0]?.id ?? 'rta');
  const category = SHIP_CATEGORIES.find((c) => c.id === selected) ?? SHIP_CATEGORIES[0];

  if (!category) return null;

  const groups = [...new Set(SHIP_CATEGORIES.map((c) => c.group))];
  const tiles = Object.keys(SHIP_STATE_GRID).map((state) => tileFor(state, category));

  return (
    <HomeSection description={description} kicker={kicker} tint={tint} title={title}>
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <div className="flex flex-wrap items-center gap-2" key={group}>
            <span className="mr-1 w-full text-xs font-semibold uppercase tracking-wide text-contrast-500 @xl:w-auto">
              {group}
            </span>
            {SHIP_CATEGORIES.filter((c) => c.group === group).map((c) => (
              <button
                aria-pressed={c.id === category.id}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
                  c.id === category.id
                    ? 'border-foreground bg-foreground text-white'
                    : 'border-contrast-200 bg-white hover:border-foreground',
                )}
                key={c.id}
                onClick={() => setSelected(c.id)}
                type="button"
              >
                {c.name}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 @3xl:grid-cols-[1fr_300px]">
        <div className="overflow-x-auto rounded-3xl border border-contrast-100 bg-[#f9fafd] p-3 @xl:p-4">
          <ul
            aria-label={`Delivery time for ${category.name}, by state`}
            className="grid min-w-[34rem] grid-cols-12 gap-1 @xl:gap-1.5"
          >
            {tiles.map((tile) => {
              const [row, column] = SHIP_STATE_GRID[tile.state] ?? [1, 1];

              return (
                <li
                  className={clsx(
                    'relative flex aspect-square items-center justify-center rounded-md border border-contrast-200 pb-2 text-[11px] font-bold @xl:text-xs',
                    BAND_CLASS[tile.band],
                  )}
                  key={tile.state}
                  style={{ gridRow: row, gridColumn: column }}
                  title={tile.detail}
                >
                  <span aria-hidden>{tile.state}</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0.5 truncate text-center text-[8px] font-semibold @xl:text-[9px]"
                  >
                    {tile.label}
                  </span>
                  <span className="sr-only">{tile.detail}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <Panel category={category} />
      </div>
      <p className="mt-3 text-xs text-contrast-500">
        Hover a state for the estimate. Transit is about 7 days near our Connecticut hub and up to
        10 at the far edge; the category&apos;s lead time is added on top. Alaska and Hawaii:
        contact us for a quote.
      </p>
    </HomeSection>
  );
}
