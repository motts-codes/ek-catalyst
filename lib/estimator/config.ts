// Constants behind the kitchen estimator. See docs/ESTIMATOR-LOGIC.md for the reasoning. Lines
// marked `confirm` are placeholders for the business to set.

export type Layout = 'l' | 'straight' | 'u' | 'galley';
export type Package = 'essentials' | 'premium' | 'luxe';

export const LAYOUTS: Record<
  Layout,
  { label: string; walls: number; corners: number; description: string }
> = {
  l: {
    label: 'L-shaped',
    walls: 2,
    corners: 1,
    description:
      'Cabinets along two walls that meet in a corner. The most common layout; it works in most rooms and leaves space for a table or island.',
  },
  straight: {
    label: 'Straight',
    walls: 1,
    corners: 0,
    description: 'Everything on one wall. Best for small kitchens, open-plan rooms and apartments.',
  },
  u: {
    label: 'U-shaped',
    walls: 3,
    corners: 2,
    description:
      'Cabinets on three walls. The most storage and counter space; needs a room at least 8 ft wide.',
  },
  galley: {
    label: 'Galley',
    walls: 2,
    corners: 0,
    description:
      'Two parallel runs facing each other. Efficient for cooking; common in older homes and condos.',
  },
};

export const PACKAGES: Record<
  Package,
  { label: string; tier: string; description: string; includes: string[] }
> = {
  essentials: {
    label: 'Essentials',
    tier: '$',
    description: 'Cabinets and a countertop: the kitchen that works, at the lowest price per foot.',
    includes: [
      'Stained and laminate shaker collections',
      'Standard handles',
      'Laminate countertop',
      'No appliances',
    ],
  },
  premium: {
    label: 'Premium',
    tier: '$$',
    description: 'Painted cabinets, quartz and the sink: the kitchen most people order.',
    includes: [
      'Painted collections — white, gray, navy',
      'Soft-close throughout',
      'Quartz countertop',
      'Sink and faucet',
    ],
  },
  luxe: {
    label: 'Luxe',
    tier: '$$$',
    description: 'Everything, delivered as one order: cabinets, stone, sink and the appliances.',
    includes: [
      'Painted and frameless collections',
      'Quartz countertop (waterfall optional)',
      'Sink, faucet and handles',
      'Appliance bundle — range, hood, dishwasher, fridge',
    ],
  },
};

/** Minimum cabinet run, ft. */
export const MIN_RUN_FT = 6;
/** Each inside corner is served by one corner cabinet: subtract this per corner. */
export const CORNER_OVERLAP_FT = 2;
/** Wall-cabinet height follows the ceiling; taller uppers cost more. */
export const CEILING_FACTOR: Record<'8' | '9' | '10', number> = { 8: 1.0, 9: 1.08, 10: 1.15 };
/** A typical island: six feet of base cabinets, at the base-only share of the per-foot rate. */
export const ISLAND_RUN_FT = 6;
export const ISLAND_BASE_SHARE = 0.6;
/** Countertop depth, in feet of counter per foot of run (25 in. deep). */
export const COUNTER_DEPTH_FT = 2.1;
export const ISLAND_COUNTER_SQFT = 18;
/** Countertop price per sq ft by package. Granite/quartz are EK's published prices. */
export const COUNTERTOP_RATE: Record<Package, { label: string; rate: number }> = {
  essentials: { label: 'Laminate countertop', rate: 19.99 }, // confirm
  premium: { label: 'Quartz countertop', rate: 59.99 },
  luxe: { label: 'Quartz countertop', rate: 59.99 },
};
export const SINK_FAUCET = 450; // confirm
export const HANDLE_PRICE: Record<Package, number> = { essentials: 6, premium: 0, luxe: 9 }; // confirm
export const HANDLES_PER_FT = 1.6;
export const APPLIANCE_BUNDLE = 4500; // confirm
/** Range around the point estimate. */
export const RANGE_LOW = 0.9;
export const RANGE_HIGH = 1.15;
/** 10×10 prices used when the catalog has fewer than two priced collections. */
export const FALLBACK_10X10: Record<Package, number> = {
  essentials: 2800,
  premium: 3300,
  luxe: 4100,
}; // confirm
/** RTA price as a share of assembled, when the catalog can't supply it. */
export const FALLBACK_RTA_RATIO = 0.91;
/** Display split of the cabinet figure. */
export const CABINET_SPLIT = { wall: 0.4, base: 0.5, trim: 0.1 };
