'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { HomeSection } from '@/vibes/soul/sections/home-section';
import {
  doorRange,
  formatDuration,
  MAP_CATEGORIES,
  SHIP_STATE_GRID,
  SHIP_STATE_NAMES,
  type ShipCategory,
  transitDays,
} from '~/lib/pages/shipping';

type Band = 'd7' | 'd8' | 'd9' | 'd10' | 'pickup' | 'none';

type Hue = 'red' | 'blue' | 'cream' | 'black';

interface Tile {
  state: string;
  band: Band;
  /** Short text printed on the tile ("3 wks"). */
  label: string;
  /** Full sentence for screen readers and the title tooltip. */
  detail: string;
}

// One colour family per kind of thing: cabinets red, closets blue, appliances the site's cream,
// windows black. Transit bands run light near Connecticut to dark at the far edge.
const HUE_BY_ID: Record<string, Hue> = { closets: 'blue', appliances: 'cream', windows: 'black' };

const hueFor = (category: ShipCategory): Hue => HUE_BY_ID[category.id] ?? 'red';

// Every fill keeps its text at 4.5:1 or better: dark text on the two light steps, white on the
// two dark ones (checked Oct 2026). The duration is printed on every tile, so the information
// never rests on colour alone.
const TILE_CLASS: Record<Hue, Record<Band, string>> = {
  red: {
    d7: 'bg-[#fde3e5] text-[#1a1a1a]',
    d8: 'bg-[#f4b1b6] text-[#1a1a1a]',
    d9: 'bg-[#c1363f] text-white',
    d10: 'bg-[#7f1f26] text-white',
    pickup: 'bg-[#7f1f26] text-white',
    none: 'border border-dashed border-contrast-300 bg-white text-contrast-500',
  },
  blue: {
    d7: 'bg-[#e4ecf9] text-[#1a1a1a]',
    d8: 'bg-[#b7c8ea] text-[#1a1a1a]',
    d9: 'bg-[#3f63a8] text-white',
    d10: 'bg-[#1e3461] text-white',
    pickup: 'bg-[#1e3461] text-white',
    none: 'border border-dashed border-contrast-300 bg-white text-contrast-500',
  },
  cream: {
    d7: 'bg-[#fbf5ea] text-[#1a1a1a]',
    d8: 'bg-[#f6ebd6] text-[#1a1a1a]',
    d9: 'bg-[#e5cfa3] text-[#1a1a1a]',
    d10: 'bg-[#8a6a3a] text-white',
    pickup: 'bg-[#f6ebd6] text-[#1a1a1a]',
    none: 'border border-dashed border-contrast-300 bg-white text-contrast-500',
  },
  black: {
    d7: 'bg-[#efefef] text-[#1a1a1a]',
    d8: 'bg-[#c9c9c9] text-[#1a1a1a]',
    d9: 'bg-[#6a6a6a] text-white',
    d10: 'bg-[#1a1a1a] text-white',
    pickup: 'bg-[#1a1a1a] text-white',
    none: 'border border-dashed border-contrast-300 bg-white text-contrast-500',
  },
};

// The selected chip takes its category's colour.
const CHIP_CLASS: Record<Hue, string> = {
  red: 'border-[#9f3632] bg-[#9f3632] text-white',
  blue: 'border-[#1e3461] bg-[#1e3461] text-white',
  cream: 'border-[#f6ebd6] bg-[#f6ebd6] text-[#1a1a1a]',
  black: 'border-[#1a1a1a] bg-[#1a1a1a] text-white',
};

// The detail card matches the map: the category's deep shade with white text (6.9:1 on the red,
// higher on the blue and black), or the cream with near-black text (14.7:1).
const PANEL_CLASS: Record<Hue, { panel: string; muted: string; swatchRing: string }> = {
  red: { panel: 'bg-[#9f3632] text-white', muted: 'text-white/85', swatchRing: 'ring-white/40' },
  blue: { panel: 'bg-[#1e3461] text-white', muted: 'text-white/85', swatchRing: 'ring-white/40' },
  cream: {
    panel: 'bg-[#f6ebd6] text-[#1a1a1a]',
    muted: 'text-[#4a4a4a]',
    swatchRing: 'ring-black/15',
  },
  black: { panel: 'bg-[#1a1a1a] text-white', muted: 'text-white/85', swatchRing: 'ring-white/40' },
};

const TRANSIT_LEGEND: Array<{ band: Band; label: string }> = [
  { band: 'd7', label: 'Northeast — +7 days' },
  { band: 'd8', label: 'Mid-Atlantic / Southeast — +8 days' },
  { band: 'd9', label: 'Central / South — +9 days' },
  { band: 'd10', label: 'West and far — +10 days' },
];

const LEGEND: Record<ShipCategory['mode'], Array<{ band: Band; label: string }>> = {
  national: [...TRANSIT_LEGEND, { band: 'none', label: 'Alaska and Hawaii — not shipped' }],
  pickup: [
    { band: 'pickup', label: 'Pickup point (Bristol, CT)' },
    { band: 'none', label: 'Not shipped' },
  ],
};

const legendFor = (category: ShipCategory) => LEGEND[category.mode];

function tileFor(state: string, category: ShipCategory): Tile {
  const name = SHIP_STATE_NAMES[state] ?? state;

  if (category.mode === 'pickup') {
    return state === 'CT'
      ? { state, band: 'pickup', label: 'pickup', detail: `${name}: pickup point, Bristol, CT` }
      : { state, band: 'none', label: '', detail: `${name}: pickup only, from Bristol, CT` };
  }

  const lead = category.lead ?? 0;
  const days = transitDays(state);

  if (days === null) {
    return { state, band: 'none', label: 'NA', detail: `${name}: not shipped` };
  }

  const total = formatDuration(lead + days);

  return {
    state,
    band: `d${days}`,
    label: total,
    detail: `${name}: about ${total} to your door (ships in ${category.ship}, plus ${days} days transit)`,
  };
}

function splitLabel(label: string): [string, string | undefined] {
  const at = label.lastIndexOf(' ');

  return at === -1 ? [label, undefined] : [label.slice(0, at), label.slice(at + 1)];
}

const PANEL_COPY: Record<
  ShipCategory['mode'],
  (c: ShipCategory) => { headline: string; sub: string }
> = {
  pickup: () => ({
    headline: 'Pickup',
    sub: 'Usually ready in 2 days at our Bristol Factory Outlet',
  }),
  national: (c) => ({
    headline: doorRange(c),
    sub: `Ships in ${c.ship}, then 7–10 days in transit`,
  }),
};

function Panel({ category }: { category: ShipCategory }) {
  const { headline, sub } = PANEL_COPY[category.mode](category);
  const hue = hueFor(category);
  const tiles = TILE_CLASS[hue];
  const look = PANEL_CLASS[hue];

  return (
    <div
      aria-live="polite"
      className={clsx('relative flex flex-col gap-1.5 overflow-hidden rounded-3xl p-6', look.panel)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white opacity-10 blur-3xl"
      />
      <h3 className="relative font-heading text-lg font-semibold">{category.name}</h3>
      <p className={clsx('relative text-sm', look.muted)}>{category.method}</p>
      <p className="relative mt-2 font-heading text-2xl font-bold leading-tight">{headline}</p>
      <p className={clsx('relative text-sm', look.muted)}>{sub}</p>
      <ul className="relative mt-4 space-y-2 text-sm">
        {legendFor(category).map((item) => (
          <li className="flex items-center gap-2.5" key={item.label}>
            <span
              aria-hidden
              className={clsx(
                'inline-block h-3.5 w-3.5 shrink-0 rounded-sm',
                item.band === 'none'
                  ? 'border border-dashed border-contrast-300 bg-white'
                  : clsx(tiles[item.band], 'ring-1', look.swatchRing),
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
  const [selected, setSelected] = useState(MAP_CATEGORIES[0]?.id ?? 'rta-star');
  const [flipped, setFlipped] = useState<string | null>(null);
  const category = MAP_CATEGORIES.find((c) => c.id === selected) ?? MAP_CATEGORIES[0];

  if (!category) return null;

  const groups = [...new Set(MAP_CATEGORIES.map((c) => c.group))];
  const tiles = Object.keys(SHIP_STATE_GRID).map((state) => tileFor(state, category));
  const tileClass = TILE_CLASS[hueFor(category)];

  return (
    <HomeSection description={description} kicker={kicker} tint={tint} title={title}>
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <div className="flex flex-wrap items-center gap-2" key={group}>
            <span className="mr-1 w-full text-xs font-semibold uppercase tracking-wide text-contrast-500 @xl:w-auto">
              {group}
            </span>
            {MAP_CATEGORIES.filter((c) => c.group === group).map((c) => (
              <button
                aria-pressed={c.id === category.id}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  c.id === category.id
                    ? CHIP_CLASS[hueFor(c)]
                    : 'border-contrast-200 bg-white hover:border-foreground',
                )}
                key={c.id}
                onClick={() => {
                  setSelected(c.id);
                  setFlipped(null);
                }}
                type="button"
              >
                {c.name}
              </button>
            ))}
          </div>
        ))}
      </div>
      {/* From 1100px the map and card sit side by side, shrunk together to 0.8x (CSS zoom scales
          layout and type alike) and centred; below that they stack at full size, as on phones. */}
      <div className="mt-6 grid gap-6 @[1100px]:mx-auto @[1100px]:max-w-[80%] @[1100px]:grid-cols-[1fr_300px] @[1100px]:items-start @[1100px]:gap-12 @[1100px]:[zoom:0.8]">
        {/* No box around the map: the tiles sit on the page, scaled so every state is in view at
            any width. Each tile flips on hover to show the time to your door. */}
        <ul
          aria-label={`Delivery time for ${category.name}, by state`}
          className="grid grid-cols-12 gap-1 @md:gap-1.5 @3xl:gap-2"
        >
          {tiles.map((tile) => {
            const [row, column] = SHIP_STATE_GRID[tile.state] ?? [1, 1];
            // "3.3 wks" reads as the number over the unit on the back of the tile.
            const [amount, unit] = splitLabel(tile.label);
            const face = clsx(
              'absolute inset-0 flex items-center justify-center rounded-md [backface-visibility:hidden] @xl:rounded-lg',
              tileClass[tile.band],
            );
            const isFlipped = flipped === tile.state;

            return (
              <li
                className="group relative aspect-square text-[9px] font-bold [perspective:600px] @md:text-[11px] @xl:text-xs"
                key={tile.state}
                style={{ gridRow: row, gridColumn: column }}
                title={tile.detail}
              >
                {/* The face shows the state only; hovering, tapping or focusing flips the tile
                    over to the time to your door at twice the size. Tiles with nothing to say
                    stay still. */}
                {tile.label ? (
                  <button
                    aria-label={tile.detail}
                    aria-pressed={isFlipped}
                    className="block h-full w-full rounded-md focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 @xl:rounded-lg"
                    onClick={() => setFlipped(isFlipped ? null : tile.state)}
                    type="button"
                  >
                    <span
                      className={clsx(
                        'relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)] motion-reduce:transition-none',
                        isFlipped && '[transform:rotateY(180deg)]',
                      )}
                    >
                      <span aria-hidden className={face}>
                        {tile.state}
                      </span>
                      <span
                        aria-hidden
                        className={clsx(
                          face,
                          'flex-col px-0.5 text-center text-[10px] leading-none [transform:rotateY(180deg)] @md:text-sm @xl:text-xl',
                        )}
                      >
                        {amount}
                        {unit ? (
                          <span className="mt-0.5 text-[7px] font-semibold @md:text-[9px] @xl:text-[11px]">
                            {unit}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                ) : (
                  <>
                    <div aria-hidden className={face}>
                      {tile.state}
                    </div>
                    <span className="sr-only">{tile.detail}</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        <div>
          <Panel category={category} />
          <p className="mt-3 text-xs leading-relaxed text-contrast-500">
            <span className="@xl:hidden">Click</span>
            <span className="hidden @xl:inline">Hover</span> a state for the estimate. Transit takes
            about 7 days near Connecticut, and up to 10 farther away, after your order ships.
          </p>
        </div>
      </div>
    </HomeSection>
  );
}
