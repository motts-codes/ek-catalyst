import {
  TEN_BY_TEN_APR,
  TEN_BY_TEN_LINEAR_FEET,
  TEN_BY_TEN_ROWS,
  TEN_BY_TEN_TERM_MONTHS,
  type TenByTenRow,
} from './ten-by-ten-prices';

/**
 * The 10x10 kitchen estimator (v1, client brief of 25 Oct 2026). Everything is priced off a
 * standard 10x10: 13 cabinets, about 20 linear feet, cabinets only. The customer picks a shape,
 * a cabinet line, a door style and a color; shape and color never change the price (same cabinet
 * mix for every shape; color isn't a price driver within a style), the line and door do. The
 * price table is generated from EK's workbook by scripts/build-ten-by-ten-prices.py; the maths
 * here mirrors the workbook's "Estimator" tab.
 */

export type ShapeId = 'l-shape' | 'u-shape' | 'galley' | 'single-wall';

export interface Shape {
  id: ShapeId;
  label: string;
  blurb: string;
  image: { src: string; alt: string };
}

export const SHAPES: Shape[] = [
  {
    id: 'l-shape',
    label: 'L-Shape',
    blurb: 'Two walls that meet in a corner. The layout the 10×10 is based on.',
    image: {
      src: '/images/estimator/layout-l-shaped.jpg',
      alt: 'An L-shaped kitchen: white shaker cabinets along two walls meeting in a corner',
    },
  },
  {
    id: 'u-shape',
    label: 'U-Shape',
    blurb: 'Three walls of cabinets. The most storage and counter space.',
    image: {
      src: '/images/estimator/layout-u-shaped-a.jpg',
      alt: 'A U-shaped kitchen: white shaker cabinets along three walls',
    },
  },
  {
    id: 'galley',
    label: 'Galley',
    blurb: 'Two parallel runs with a walkway between them.',
    image: {
      src: '/images/estimator/layout-galley.jpg',
      alt: 'A galley kitchen: two parallel runs of white shaker cabinets',
    },
  },
  {
    id: 'single-wall',
    label: 'Single Wall',
    blurb: 'Everything along one wall. Small kitchens and apartments.',
    image: {
      src: '/images/estimator/layout-single-wall.jpg',
      alt: 'A single-wall kitchen: white shaker cabinets along one wall',
    },
  },
];

/** The three lines the customer chooses from; each maps to one or more workbook programs. */
export type LineId = 'star' | 'prism' | 'euro';

export interface LineVariant {
  /** The workbook program name this variant prices from. */
  program: string;
  label: string;
  note?: string;
}

export interface Line {
  id: LineId;
  label: string;
  tagline: string;
  blurb: string;
  /** Where "Browse the line" goes. */
  href: string;
  /**
   * Build / tier choices inside the line (Star: assembled or RTA; Euro: Value, Max, Max Custom,
   * Max RTA). Prism has none: its tier follows the color (standard or premium).
   */
  variants: LineVariant[];
  /** The variant the toggle starts on (Star: Assembled; Euro: Euro Max). */
  defaultProgram?: string;
}

export const LINES: Line[] = [
  {
    id: 'star',
    label: 'Star',
    tagline: 'Framed · Standard finish',
    blurb:
      'Our core line: framed cabinets with a plywood box and a solid birch face frame, in 12 door styles. Assembled or ready to assemble.',
    href: '/cabinets/assembled-cabinets?line=star',
    defaultProgram: 'Framed Star Assembled',
    variants: [
      { program: 'Framed Star Assembled', label: 'Assembled', note: 'Built in our factory' },
      { program: 'Framed Star RTA', label: 'Ready to assemble', note: 'You build it, you save' },
    ],
  },
  {
    id: 'prism',
    label: 'Prism',
    tagline: 'Framed · 10 painted colors',
    blurb:
      'Star’s framed cabinets, painted in designer colors. Seven standard colors, and three premium ones at a higher price.',
    href: '/cabinets/assembled-cabinets?line=prism',
    variants: [],
  },
  {
    id: 'euro',
    label: 'Euro',
    tagline: 'Frameless · modern',
    blurb:
      'European-style frameless cabinets: full-overlay doors, more room inside. Euro Value is the lower price; Euro Max adds a plywood box.',
    href: '/cabinets/assembled-cabinets?line=euro-max',
    defaultProgram: 'Frameless Euro Max',
    variants: [
      { program: 'Frameless Euro Value', label: 'Euro Value', note: 'Engineered board box' },
      { program: 'Frameless Euro Max', label: 'Euro Max', note: 'Plywood box' },
      { program: 'Frameless Euro Max Custom', label: 'Euro Max Custom', note: 'Custom sizes' },
      { program: 'Frameless Euro Max RTA', label: 'Euro Max RTA', note: 'Ready to assemble' },
    ],
  },
];

/** The workbook programs a Prism pick can price from, by tier. */
const PRISM_PROGRAMS = ['Framed Prism', 'Framed Prism Premium'];

export interface ColorOption {
  name: string;
  /** Prism only: 'premium' colors price higher than 'standard'. */
  tier: 'standard' | 'premium';
}

// The programs a line prices from (all of them, for the door-style list).
export function programsFor(line: LineId, program?: string): string[] {
  if (line === 'prism') return PRISM_PROGRAMS;

  const spec = LINES.find((l) => l.id === line);

  if (!spec) return [];
  if (program) return [program];

  return spec.variants.map((v) => v.program);
}

// Door styles offered by a line (and, for Star / Euro, the chosen build or tier).
export function doorsFor(line: LineId, program?: string): string[] {
  const programs = programsFor(line, program);
  const doors = new Set<string>();

  TEN_BY_TEN_ROWS.forEach((row) => {
    if (programs.includes(row.program)) doors.add(row.door);
  });

  return [...doors].sort((a, b) => a.localeCompare(b));
}

// Colors offered for a door style (standard first, then premium for Prism).
export function colorsFor(line: LineId, program: string | undefined, door: string): ColorOption[] {
  const programs = programsFor(line, program);
  const seen = new Map<string, ColorOption>();

  TEN_BY_TEN_ROWS.forEach((row) => {
    if (!programs.includes(row.program) || row.door !== door || seen.has(row.color)) return;

    seen.set(row.color, {
      name: row.color,
      tier: row.program === 'Framed Prism Premium' ? 'premium' : 'standard',
    });
  });

  const rank = (tier: ColorOption['tier']) => (tier === 'standard' ? 0 : 1);

  return [...seen.values()].sort(
    (a, b) => rank(a.tier) - rank(b.tier) || a.name.localeCompare(b.name),
  );
}

// The priced row for a complete pick, or null while the pick is incomplete.
export function rowFor(
  line: LineId,
  program: string | undefined,
  door: string,
  color: string,
): TenByTenRow | null {
  const programs = programsFor(line, program);

  return (
    TEN_BY_TEN_ROWS.find(
      (row) => programs.includes(row.program) && row.door === door && row.color === color,
    ) ?? null
  );
}

export interface TenByTenEstimate {
  /** The 10x10 cabinet price, dollars. */
  price: number;
  /** Price per linear foot of cabinet run. */
  perFoot: number;
  /** The GreenSky payment, dollars per month. */
  monthly: number;
  apr: number;
  months: number;
  linearFeet: number;
}

// The workbook's maths: price / 20 ft, and a standard amortised payment at APR over the term.
export function estimateFor(price: number): TenByTenEstimate {
  const r = TEN_BY_TEN_APR / 1200;
  const n = TEN_BY_TEN_TERM_MONTHS;
  const monthly = Math.round(((price * (r * (1 + r) ** n)) / ((1 + r) ** n - 1)) * 100) / 100;

  return {
    price,
    perFoot: Math.round((price / TEN_BY_TEN_LINEAR_FEET) * 100) / 100,
    monthly,
    apr: TEN_BY_TEN_APR,
    months: n,
    linearFeet: TEN_BY_TEN_LINEAR_FEET,
  };
}

// The lowest 10x10 price in a line, for the "from" badge on the line cards.
export function fromPriceFor(line: LineId): number {
  const programs = programsFor(line);

  return TEN_BY_TEN_ROWS.filter((row) => programs.includes(row.program)).reduce(
    (min, row) => Math.min(min, row.price),
    Number.POSITIVE_INFINITY,
  );
}

// "$2,510" style, whole dollars.
export function dollars(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

// "$30.10" style, to the cent.
export function dollarsAndCents(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** What's in the 13-cabinet 10x10, in plain words (from the workbook's layout tab), each with
 *  a photo of the cabinet that stands for the line (EK's product shots, Oct 2026). */
export interface TenByTenCabinet {
  label: string;
  image: { src: string; alt: string };
}

const cabinetPhoto = (file: string, alt: string) => ({
  src: `/images/estimator/cabinets/${file}.jpg`,
  alt,
});

export const TEN_BY_TEN_CABINETS: TenByTenCabinet[] = [
  {
    label: 'Three base cabinets (12", 15" and 18")',
    image: cabinetPhoto('base-18', 'An 18-inch base cabinet with one drawer over one door'),
  },
  {
    label: 'A 36" sink base',
    image: cabinetPhoto(
      'sink-base-36',
      'A 36-inch sink base with two false drawer fronts and two doors',
    ),
  },
  {
    label: 'A blind corner base',
    image: cabinetPhoto(
      'blind-corner-base',
      'A blind corner base cabinet with one drawer and one door',
    ),
  },
  {
    label: 'Four wall cabinets (12", 21" × 2, 39")',
    image: cabinetPhoto('wall-39', 'A 39-inch wall cabinet with two doors'),
  },
  {
    label: 'A diagonal corner wall cabinet',
    image: cabinetPhoto('diagonal-corner-wall', 'A diagonal corner wall cabinet with one door'),
  },
  {
    label: 'Two bridge cabinets, over the range hood and the fridge',
    image: cabinetPhoto('bridge-30x12', 'A 30 by 12 inch bridge wall cabinet with two doors'),
  },
  {
    label: 'A 3" base filler',
    image: cabinetPhoto('base-filler', 'A 3-inch base filler strip'),
  },
];

export const TEN_BY_TEN_FINE_PRINT =
  'Estimates are for cabinets only, based on a standard 13-cabinet 10×10 layout (about 20 linear feet). They do not include countertops, appliances, hardware, delivery or installation. Monthly payments are based on GreenSky financing at 11.99% APR for 180 months, subject to credit approval, and are available in showrooms only. Final pricing is confirmed after a free design consultation. Prices as of October 16, 2026.';
