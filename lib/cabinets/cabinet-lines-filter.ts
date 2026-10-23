import { type CabinetLine } from '@/vibes/soul/sections/cabinet-lines';

import { cabinetLineSlug } from './cabinet-lines-data';

/**
 * The "Show all filters" panel on the Assembled / RTA listings: colour, construction, style and
 * finish type, each multi-select, carried in the URL (?color=…&construction=…&style=…&finish=…)
 * alongside the line tabs' ?line=. Every option links to the listing with that value toggled;
 * counts are taken against the other active filters.
 */

export type LineFilterKey = 'color' | 'construction' | 'style' | 'finish';

export interface LineFilterSelection {
  /** The line tab (slug), or null for All. */
  line: string | null;
  color: string[];
  construction: string[];
  style: string[];
  finish: string[];
}

export interface LineFilterOption {
  value: string;
  count: number;
  active: boolean;
  href: string;
}

export interface LineFilterGroup {
  key: LineFilterKey;
  label: string;
  options: LineFilterOption[];
}

export const LINE_FILTER_KEYS: LineFilterKey[] = ['color', 'construction', 'style', 'finish'];
/** ?filters=1 opens the sidebar and ?filters=0 closes it. With neither, it is open whenever a
 *  panel filter is active (so a shared link with filters shows them). */
export const FILTER_PANEL_PARAM = 'filters';

const LABELS: Record<LineFilterKey, string> = {
  color: 'Color',
  construction: 'Construction',
  style: 'Style',
  finish: 'Finish type',
};

type Params = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value;

  return value == null ? [] : [value];
};

export function parseLineFilters(searchParams: Params): LineFilterSelection {
  return {
    line: list(searchParams.line)[0] ?? null,
    color: list(searchParams.color),
    construction: list(searchParams.construction),
    style: list(searchParams.style),
    finish: list(searchParams.finish),
  };
}

export const hasPanelFilters = (sel: LineFilterSelection): boolean =>
  LINE_FILTER_KEYS.some((key) => sel[key].length > 0);

export function panelOpen(searchParams: Params, sel: LineFilterSelection): boolean {
  const flag = list(searchParams[FILTER_PANEL_PARAM])[0];

  if (flag === '1') return true;
  if (flag === '0') return false;

  return hasPanelFilters(sel);
}

// The values a collection carries for a filter key.
function valuesOf(line: CabinetLine, key: LineFilterKey): string[] {
  const facets = line.facets;

  if (!facets) return [];

  switch (key) {
    case 'color':
      return facets.colors;

    case 'construction':
      return facets.construction ? [facets.construction] : [];

    case 'style':
      return facets.style ? [facets.style] : [];

    case 'finish':
      return facets.finishTypes;

    default:
      return [];
  }
}

const matchesKey = (line: CabinetLine, key: LineFilterKey, wanted: string[]) =>
  wanted.length === 0 || valuesOf(line, key).some((v) => wanted.includes(v));

const matchesLine = (line: CabinetLine, slug: string | null) =>
  slug == null || (line.productLine != null && cabinetLineSlug(line.productLine) === slug);

/** The collections that match the line tab and every panel filter. */
export function applyLineFilters(lines: CabinetLine[], sel: LineFilterSelection): CabinetLine[] {
  return lines.filter(
    (line) =>
      matchesLine(line, sel.line) &&
      LINE_FILTER_KEYS.every((key) => matchesKey(line, key, sel[key])),
  );
}

/** The listing URL with one value toggled on `key`; with key null, every panel filter cleared.
 *  The panel stays open either way. */
export function lineFilterHref(
  basePath: string,
  searchParams: Params,
  key: LineFilterKey | null,
  value?: string,
): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([k, raw]) => {
    const dropped = key == null ? LINE_FILTER_KEYS.some((f) => f === k) : k === key;

    if (dropped || k === FILTER_PANEL_PARAM || raw == null) return;

    list(raw).forEach((item) => params.append(k, item));
  });

  if (key != null && value != null) {
    const current = list(searchParams[key]);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

    next.forEach((item) => params.append(key, item));
  }

  params.set(FILTER_PANEL_PARAM, '1');

  return `${basePath}?${params.toString()}`;
}

/** The listing URL with the sidebar opened or closed (filters untouched; closing while filters
 *  are ticked keeps them applied, just out of view). */
export function panelToggleHref(basePath: string, searchParams: Params, open: boolean): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([k, raw]) => {
    if (k === FILTER_PANEL_PARAM || raw == null) return;

    list(raw).forEach((item) => params.append(k, item));
  });

  if (open) params.set(FILTER_PANEL_PARAM, '1');
  else if (LINE_FILTER_KEYS.some((key) => list(searchParams[key]).length > 0)) {
    params.set(FILTER_PANEL_PARAM, '0');
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

/** The panel's groups for the collections of a program: every value present, with the count of
 *  collections it leaves given the line tab and the OTHER panel filters. */
export function lineFilterGroups(
  lines: CabinetLine[],
  sel: LineFilterSelection,
  basePath: string,
  searchParams: Params,
): LineFilterGroup[] {
  return LINE_FILTER_KEYS.map((key) => {
    const others = { ...sel, [key]: [] };
    const pool = applyLineFilters(lines, others);
    const counts = new Map<string, number>();

    pool.forEach((line) => {
      valuesOf(line, key).forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
    });

    // Values present anywhere in the program (so a ticked value with no matches still shows).
    lines.forEach((line) => {
      valuesOf(line, key).forEach((v) => {
        if (!counts.has(v)) counts.set(v, 0);
      });
    });

    const options = [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, count]) => ({
        value,
        count,
        active: sel[key].includes(value),
        href: lineFilterHref(basePath, searchParams, key, value),
      }));

    return { key, label: LABELS[key], options };
  }).filter((group) => group.options.length > 0);
}

/** A line tab's link: ?line=<slug> (or none for All) with the panel filters and its open state
 *  kept, so switching line doesn't drop a colour or construction already ticked. */
export function lineTabHref(basePath: string, searchParams: Params, slug: string | null): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([k, raw]) => {
    if (k === 'line' || raw == null) return;

    list(raw).forEach((item) => params.append(k, item));
  });

  if (slug) params.set('line', slug);

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}
