import {
  APPLIANCE_BUNDLE,
  CABINET_SPLIT,
  CEILING_FACTOR,
  CORNER_OVERLAP_FT,
  COUNTER_DEPTH_FT,
  COUNTERTOP_RATE,
  FALLBACK_10X10,
  FALLBACK_RTA_RATIO,
  HANDLE_PRICE,
  HANDLES_PER_FT,
  ISLAND_BASE_SHARE,
  ISLAND_COUNTER_SQFT,
  ISLAND_RUN_FT,
  type Layout,
  LAYOUTS,
  MIN_RUN_FT,
  type Package,
  RANGE_HIGH,
  RANGE_LOW,
  SINK_FAUCET,
  // eslint-disable-next-line import/extensions -- so Node's test runner can import this without a bundler
} from './config.ts';

export interface EstimateInput {
  layout: Layout;
  /** Wall lengths in feet, in layout order (A, B, C). Extra walls are ignored. */
  walls: number[];
  ceiling: 8 | 9 | 10;
  island: boolean;
  package: Package;
}

/** 10×10 reference prices per package, and the RTA share — normally from the live catalog. */
export interface PriceBook {
  tenByTen: Record<Package, number>;
  rtaRatio: number;
}

export interface EstimateLine {
  item: string;
  qty: string;
  price: number;
}

export interface Estimate {
  runFt: number;
  counterSqft: number;
  cabinets: number;
  island: number;
  countertop: number;
  extras: number;
  total: number;
  low: number;
  high: number;
  rtaSaving: number;
  lines: EstimateLine[];
}

const round = (n: number) => Math.round(n);
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

// Build the price book from the live collection 10×10 prices: lowest → Essentials, median →
// Premium, highest → Luxe. With fewer than two priced collections, use the fallbacks.
export function priceBookFromCollections(
  assembledPrices: number[],
  rtaRatio = FALLBACK_RTA_RATIO,
): PriceBook {
  const prices = assembledPrices.filter((p) => Number.isFinite(p) && p > 0).sort((a, b) => a - b);

  if (prices.length < 2) return { tenByTen: FALLBACK_10X10, rtaRatio };

  const lowest = prices[0] ?? FALLBACK_10X10.essentials;
  const highest = prices[prices.length - 1] ?? FALLBACK_10X10.luxe;
  const median = prices[Math.floor(prices.length / 2)] ?? FALLBACK_10X10.premium;

  return { tenByTen: { essentials: lowest, premium: median, luxe: highest }, rtaRatio };
}

export function cabinetRunFt(layout: Layout, walls: number[]): number {
  const { walls: count, corners } = LAYOUTS[layout];
  const sum = walls
    .slice(0, count)
    .reduce((acc, w) => acc + (Number.isFinite(w) ? Math.max(0, w) : 0), 0);

  return Math.max(MIN_RUN_FT, sum - corners * CORNER_OVERLAP_FT);
}

export function estimate(input: EstimateInput, book: PriceBook): Estimate {
  const runFt = cabinetRunFt(input.layout, input.walls);
  const rate = book.tenByTen[input.package] / 20;
  const cabinets = runFt * rate * CEILING_FACTOR[input.ceiling];
  const island = input.island ? ISLAND_RUN_FT * rate * ISLAND_BASE_SHARE : 0;
  const counterSqft = round(runFt * COUNTER_DEPTH_FT + (input.island ? ISLAND_COUNTER_SQFT : 0));
  const counter = COUNTERTOP_RATE[input.package];
  const countertop = counterSqft * counter.rate;

  const lines: EstimateLine[] = [
    {
      item: 'Wall cabinets',
      qty: `${round(runFt)} ft run`,
      price: round(cabinets * CABINET_SPLIT.wall),
    },
    {
      item: 'Base cabinets',
      qty: `${round(runFt)} ft run`,
      price: round(cabinets * CABINET_SPLIT.base),
    },
    { item: 'Trim and fillers', qty: '—', price: round(cabinets * CABINET_SPLIT.trim) },
  ];

  if (island > 0)
    lines.push({
      item: 'Island (base cabinets)',
      qty: `${ISLAND_RUN_FT} ft`,
      price: round(island),
    });

  lines.push({ item: counter.label, qty: `${counterSqft} sq ft`, price: round(countertop) });

  let extras = 0;

  if (input.package !== 'essentials') {
    extras += SINK_FAUCET;
    lines.push({ item: 'Sink and faucet', qty: '1', price: SINK_FAUCET });
  }

  const handlePrice = HANDLE_PRICE[input.package];

  if (handlePrice > 0) {
    const count = round(runFt * HANDLES_PER_FT);
    const handles = count * handlePrice;

    extras += handles;
    lines.push({ item: 'Handles', qty: `${count}`, price: round(handles) });
  }

  if (input.package === 'luxe') {
    extras += APPLIANCE_BUNDLE;
    lines.push({
      item: 'Appliance bundle — range, hood, dishwasher, fridge',
      qty: '1',
      price: APPLIANCE_BUNDLE,
    });
  }

  const total = cabinets + island + countertop + extras;

  return {
    runFt: round(runFt),
    counterSqft,
    cabinets: round(cabinets),
    island: round(island),
    countertop: round(countertop),
    extras: round(extras),
    total: round(total),
    low: roundTo(total * RANGE_LOW, 10),
    high: roundTo(total * RANGE_HIGH, 10),
    rtaSaving: roundTo((cabinets + island) * (1 - book.rtaRatio), 10),
    lines,
  };
}
