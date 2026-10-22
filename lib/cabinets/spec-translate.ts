/**
 * Cabinet specifications, two ways.
 *
 * The staff-authored spec HTML (content.spec_by_program) is a list of "Label: value" lines in a
 * small, stable vocabulary (box, face frame, door, drawer box, shelves, hinges, glides…).
 * `parseSpecLines` turns it into label/value rows for a table, and `howItsBuilt` turns those
 * rows into the customer-facing "How it's built" bullets by rule, so every collection gets the
 * plain-English version without anyone writing forty of them — and it stays in step when a spec
 * changes. Each rule keys on the label and reads a few words of the value; anything it doesn't
 * recognise is simply left out of the bullets (it is still in the table).
 */

export interface SpecLine {
  label: string;
  value: string;
}

export interface BuildPoint {
  /** The short bold lead ("Dovetail drawers."). */
  lead: string;
  /** The plain-English why. */
  detail: string;
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
};

function decode(text: string): string {
  return text.replace(/&(amp|quot|#39|nbsp|lt|gt);/g, (m) => ENTITIES[m] ?? m);
}

/** "Label: value" rows from the spec HTML: one per <li> (or per line when there is no list). */
export function parseSpecLines(html: string): SpecLine[] {
  const items = html.match(/<li[^>]*>[\s\S]*?<\/li>/gi) ?? html.split(/<br\s*\/?>|\n/);

  return items
    .map((item) =>
      decode(item.replace(/<[^>]+>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .map((text) => {
      const i = text.indexOf(':');

      if (i <= 0) return null;

      return {
        label: text.slice(0, i).trim(),
        value: text
          .slice(i + 1)
          .trim()
          .replace(/\.$/, ''),
      };
    })
    .filter((line): line is SpecLine => line != null && line.value !== '');
}

const find = (lines: SpecLine[], pattern: RegExp) =>
  lines.find((l) => pattern.test(l.label))?.value ?? '';

const has = (value: string, pattern: RegExp) => pattern.test(value);

// Thickness as a fraction of an inch, from "½”", "¾\"", "⁵⁄₈”" or "18mm (~3/4”)".
const FRACTIONS: Record<string, string> = { '1/2': '½', '3/4': '¾', '1/4': '¼', '5/8': '⅝' };

function thickness(value: string): string | null {
  const unicode = /[¾½¼⅝]/.exec(value.replace('⁵⁄₈', '⅝'));

  if (unicode) return `${unicode[0]}″`;

  const ascii = /(\d\/\d)/.exec(value);
  const fraction = ascii?.[1] ? FRACTIONS[ascii[1]] : undefined;

  return fraction ? `${fraction}″` : null;
}

function boxPoint(lines: SpecLine[]): BuildPoint | null {
  const box = find(lines, /box construction/i);
  const interior = find(lines, /cabinet interior/i);

  if (box === '') return null;

  const inside = has(interior, /birch/i) ? 'birch' : '';

  if (has(box, /plywood/i)) {
    const t = thickness(box);

    return {
      lead: inside === 'birch' ? 'Plywood box, birch inside and out.' : 'Plywood box.',
      detail: `${t ? `${t} plywood` : 'Plywood'} sides, not particleboard, so it holds screws and stands up to moisture.`,
    };
  }

  if (has(box, /melamine/i)) {
    return {
      lead: 'Melamine-wrapped box.',
      detail: `Furniture board in white or natural maple, edge-banded to match, with a wipe-clean ${
        inside === 'birch' ? 'birch veneer' : 'melamine'
      } interior.`,
    };
  }

  return null;
}

function framePoint(lines: SpecLine[]): BuildPoint | null {
  const frame = find(lines, /face frame/i);
  const overlay = find(lines, /overlay/i);

  if (frame !== '') {
    return {
      lead: has(frame, /birch/i) ? 'Solid birch face frame.' : 'Solid hardwood face frame.',
      detail:
        'A ¾″ hardwood frame around every cabinet, doweled and glued, for a box that stays square.',
    };
  }

  if (has(overlay, /frameless/i)) {
    return {
      lead: 'Frameless, full-access design.',
      detail:
        'No face frame, so doors sit edge to edge and drawers open the full width of the box.',
    };
  }

  return null;
}

function overlayNote(overlay: string): string {
  if (has(overlay, /full overlay/i)) {
    return ' Full overlay, so the doors cover the frame for a clean, built-in look.';
  }

  if (has(overlay, /partial overlay/i)) {
    return ' Partial overlay, the classic look with a little frame showing between doors.';
  }

  return '';
}

function doorPoint(lines: SpecLine[]): BuildPoint | null {
  const door = find(lines, /door/i);
  const overlay = find(lines, /overlay/i);

  if (door === '') return null;

  const panel =
    has(door, /raised/i) && !has(door, /reversed raised/i)
      ? 'a raised center panel'
      : 'a flat center panel';
  const pull = has(door, /finger pull/i) ? ' with a routed finger pull.' : '.';
  const slab = has(door, /slab/i) ? ` Slab drawer fronts${pull}` : '';
  const fit = overlayNote(overlay);

  if (has(door, /hdf/i)) {
    return {
      lead: 'Painted HDF doors that won’t crack.',
      detail: `A five-piece door with ${panel}, built like wood but in HDF, which holds paint and doesn’t move with the seasons.${slab}${fit}`,
    };
  }

  if (has(door, /solid birch frame/i)) {
    return {
      lead: 'Solid birch doors.',
      detail: `A five-piece hardwood frame around ${panel}, joined with mortise and tenon.${slab}${fit}`,
    };
  }

  return null;
}

function drawerBoxPoint(lines: SpecLine[]): BuildPoint | null {
  const box = find(lines, /drawer box/i);

  if (box === '') return null;

  if (has(box, /dovetail/i)) {
    return {
      lead: 'Dovetail drawers.',
      detail: `Solid ${has(box, /birch/i) ? 'birch' : 'hardwood'}, joined like fine furniture, with a plywood bottom that won’t sag.`,
    };
  }

  if (has(box, /plywood/i)) {
    return {
      lead: 'Plywood drawer boxes.',
      detail: 'A captured plywood bottom and plywood sides, sturdier than particleboard drawers.',
    };
  }

  return null;
}

function hingePoint(lines: SpecLine[]): BuildPoint | null {
  const hinges = find(lines, /hinge/i);

  if (hinges === '') return null;

  return {
    lead: has(hinges, /soft.?close/i) ? 'Soft-close doors.' : 'Concealed steel hinges.',
    detail: `${has(hinges, /soft.?close/i) ? 'Close quietly, and' : 'Hidden when the door is shut, and'} adjust six ways for a perfect line.`,
  };
}

function shelfPoint(lines: SpecLine[]): BuildPoint | null {
  const shelves = find(lines, /shel/i);

  if (shelves === '') return null;

  const t = thickness(shelves);

  if (has(shelves, /plywood/i)) {
    return {
      lead: 'Adjustable plywood shelves.',
      detail: `${t ?? '¾″'} thick, so they won’t bow under heavy pots.`,
    };
  }

  return {
    lead: 'Adjustable shelves.',
    detail: `${t ?? '¾″'} thick on metal clips, so you set the heights you need.`,
  };
}

function glidePoints(lines: SpecLine[]): BuildPoint[] {
  const glides = find(lines, /drawer (glides|guides)/i);
  const upgrade = find(lines, /upgrade/i);
  const points: BuildPoint[] = [];

  if (glides !== '') {
    points.push(
      has(glides, /full extension/i) && has(glides, /soft.?close/i)
        ? {
            lead: 'Full-extension, soft-close drawers.',
            detail: 'Drawers pull all the way out and close themselves, as standard.',
          }
        : {
            lead: 'Smooth-rolling drawer glides.',
            detail: 'Undermount steel glides, hidden from view, on nylon rollers.',
          },
    );
  }

  if (upgrade !== '' && has(upgrade, /full extension/i)) {
    points.push({
      lead: 'Optional upgrade: full-extension, soft-close drawer glides.',
      detail: 'Drawers that pull all the way out and close themselves.',
    });
  }

  return points;
}

/** The customer-facing "How it's built" bullets for a set of spec lines. */
export function howItsBuilt(lines: SpecLine[]): BuildPoint[] {
  return [
    boxPoint(lines),
    framePoint(lines),
    doorPoint(lines),
    drawerBoxPoint(lines),
    hingePoint(lines),
    shelfPoint(lines),
    ...glidePoints(lines),
  ].filter((p): p is BuildPoint => p != null);
}

/** Staff-written "How it's built" (content.how_built_by_program): one point per line, the first
 *  sentence as the bold lead. Returns [] for blank text, which means "derive from the specs". */
export function parseHowBuiltText(text: string): BuildPoint[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter((line) => line !== '')
    .map((line) => {
      const m = /^(.+?[.!?])\s+(.*)$/.exec(line);

      return m?.[1] && m[2] ? { lead: m[1], detail: m[2] } : { lead: line, detail: '' };
    });
}
