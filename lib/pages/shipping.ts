// Shipping data behind /shipping-policy: what each category is, how it ships, and how long it
// takes to reach each state. Lead times are the wireframe's per-line figures (to confirm against
// product data); transit bands are estimates by distance from the Bristol, CT hub.

export type ShipMode = 'national' | 'zone' | 'pickup';

export interface ShipCategory {
  id: string;
  group: string;
  name: string;
  mode: ShipMode;
  /** Make-and-ship lead time as copy ("2 weeks"). Absent for pickup. */
  ship?: string;
  /** Make-and-ship lead time in days. Absent for pickup. */
  lead?: number;
  method: string;
}

export const SHIP_CATEGORIES: ShipCategory[] = [
  {
    group: 'Ships nationwide',
    id: 'rta',
    name: 'RTA cabinets',
    mode: 'national',
    ship: '2 weeks',
    lead: 14,
    method: 'Freight, flat-packed and ready to ship',
  },
  {
    group: 'Ships nationwide',
    id: 'star',
    name: 'Assembled — Star',
    mode: 'national',
    ship: '3 weeks',
    lead: 21,
    method: 'Freight, assembled to order in our Connecticut shop',
  },
  {
    group: 'Ships nationwide',
    id: 'euro',
    name: 'Assembled — Euro',
    mode: 'national',
    ship: '4 weeks',
    lead: 28,
    method: 'Freight, Euro lines made to order',
  },
  {
    group: 'Ships nationwide',
    id: 'prism',
    name: 'Prism (painted)',
    mode: 'national',
    ship: '8 weeks',
    lead: 56,
    method: 'Made to order, painted, all-plywood',
  },
  {
    group: 'Ships nationwide',
    id: 'hardware',
    name: 'Cabinet hardware',
    mode: 'national',
    ship: '1–2 days',
    lead: 2,
    method: 'Small parcel by UPS or FedEx Ground',
  },
  {
    group: 'Ships nationwide',
    id: 'kb',
    name: 'Sinks, faucets & bath',
    mode: 'national',
    ship: '2 days',
    lead: 2,
    method: 'Small parcel, then transit',
  },
  {
    group: 'Connecticut zone',
    id: 'closets',
    name: 'Closets',
    mode: 'zone',
    ship: '2 weeks',
    lead: 14,
    method: 'Freight, inside the Connecticut delivery zone',
  },
  {
    group: 'Pickup only',
    id: 'appliances',
    name: 'Appliances',
    mode: 'pickup',
    method: 'Collect from the Bristol factory outlet',
  },
  {
    group: 'Pickup only',
    id: 'windows',
    name: 'Windows',
    mode: 'pickup',
    method: 'Collect from the Bristol factory outlet',
  },
];

// Tile-map position [row, column] on a 12-column grid, roughly where the state sits.
export const SHIP_STATE_GRID: Record<string, [number, number]> = {
  AK: [1, 1],
  ME: [1, 12],
  VT: [2, 11],
  NH: [2, 12],
  WA: [3, 1],
  ID: [3, 2],
  MT: [3, 3],
  ND: [3, 4],
  MN: [3, 5],
  WI: [3, 6],
  MI: [3, 8],
  NY: [3, 10],
  MA: [3, 11],
  RI: [3, 12],
  OR: [4, 1],
  NV: [4, 2],
  WY: [4, 3],
  SD: [4, 4],
  IA: [4, 5],
  IL: [4, 6],
  IN: [4, 7],
  OH: [4, 8],
  PA: [4, 9],
  NJ: [4, 10],
  CT: [4, 11],
  CA: [5, 1],
  UT: [5, 2],
  CO: [5, 3],
  NE: [5, 4],
  MO: [5, 5],
  KY: [5, 6],
  WV: [5, 7],
  VA: [5, 8],
  MD: [5, 9],
  DE: [5, 10],
  AZ: [6, 2],
  NM: [6, 3],
  KS: [6, 4],
  AR: [6, 5],
  TN: [6, 6],
  NC: [6, 7],
  SC: [6, 8],
  DC: [6, 9],
  OK: [7, 4],
  LA: [7, 5],
  MS: [7, 6],
  AL: [7, 7],
  GA: [7, 8],
  HI: [8, 1],
  TX: [8, 4],
  FL: [8, 9],
};

const STATE_LATLON: Record<string, [number, number]> = {
  AL: [32.8, -86.8],
  AK: [64, -152],
  AZ: [34.3, -111.7],
  AR: [34.9, -92.4],
  CA: [37.2, -119.3],
  CO: [39, -105.5],
  CT: [41.6, -72.7],
  DE: [39, -75.5],
  DC: [38.9, -77],
  FL: [28.6, -82.4],
  GA: [32.6, -83.4],
  HI: [20.3, -156.4],
  ID: [44.4, -114.6],
  IL: [40, -89.2],
  IN: [39.9, -86.3],
  IA: [42, -93.5],
  KS: [38.5, -98.4],
  KY: [37.5, -85.3],
  LA: [31, -92],
  ME: [45.4, -69.2],
  MD: [39, -76.7],
  MA: [42.3, -71.8],
  MI: [44.3, -85.4],
  MN: [46.3, -94.3],
  MS: [32.7, -89.7],
  MO: [38.4, -92.5],
  MT: [47, -109.6],
  NE: [41.5, -99.8],
  NV: [39.3, -116.6],
  NH: [43.7, -71.6],
  NJ: [40.2, -74.7],
  NM: [34.4, -106.1],
  NY: [42.9, -75.5],
  NC: [35.5, -79.4],
  ND: [47.5, -100.3],
  OH: [40.3, -82.8],
  OK: [35.6, -97.5],
  OR: [43.9, -120.6],
  PA: [40.9, -77.8],
  RI: [41.7, -71.5],
  SC: [33.9, -80.9],
  SD: [44.4, -100.2],
  TN: [35.9, -86.4],
  TX: [31.5, -99.3],
  UT: [39.3, -111.7],
  VT: [44.1, -72.7],
  VA: [37.5, -78.9],
  WA: [47.4, -120.4],
  WV: [38.6, -80.6],
  WI: [44.6, -89.9],
  WY: [43, -107.5],
};

export const SHIP_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'Washington DC',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

const HUB = STATE_LATLON.CT ?? [41.6, -72.7];

// Straight-line miles from the Connecticut hub; good enough to pick a transit band.
export function milesFromHub(state: string): number {
  const point = STATE_LATLON[state];

  if (!point) return Number.POSITIVE_INFINITY;

  const dLat = point[0] - HUB[0];
  const dLon = (point[1] - HUB[1]) * Math.cos((HUB[0] * Math.PI) / 180);

  return 69 * Math.sqrt(dLat * dLat + dLon * dLon);
}

export type TransitDays = 7 | 8 | 9 | 10;

// Transit band by distance. Null for Alaska and Hawaii (quoted).
export function transitDays(state: string): TransitDays | null {
  if (state === 'AK' || state === 'HI') return null;

  const miles = milesFromHub(state);

  if (miles <= 400) return 7;
  if (miles <= 900) return 8;
  if (miles <= 1600) return 9;

  return 10;
}

export const inDeliveryZone = (state: string) =>
  state !== 'AK' && state !== 'HI' && milesFromHub(state) <= 200;

// "17 days" under three weeks, otherwise "3.5 wks".
export function formatDuration(days: number): string {
  if (days < 21) return `${Math.round(days)} days`;

  const weeks = Math.round((days / 7) * 10) / 10;

  return `${weeks % 1 === 0 ? weeks.toFixed(0) : weeks.toFixed(1)} wks`;
}

// The "Total to your door" column of the by-product table.
export function doorRange(category: ShipCategory): string {
  if (category.mode === 'pickup' || category.lead == null) return 'Ready in 2 days';
  if (category.mode === 'zone') return `${formatDuration(category.lead + 7)} in zone`;

  return `${formatDuration(category.lead + 7)} – ${formatDuration(category.lead + 10)}`;
}
