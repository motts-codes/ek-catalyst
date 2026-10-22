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

/** What the spec lines alone can't tell: whether the collection comes in several finishes
 *  (Prism — the colour is the customer's choice, not a fact of the door) and the merchandised
 *  door style (Euro specs carry no door line). */
export interface BuildContext {
  multiFinish?: boolean;
  doorStyle?: string;
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

// The finish as written, minus stock codes: "Painted Stratus (Stock)" → "Painted Stratus",
// "Textured Matte Finish - Super White (SC 001)" → "Textured Matte Finish, Super White".
function finishName(lines: SpecLine[]): string {
  return find(lines, /^finish/i)
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+-\s+/g, ', ')
    .trim();
}

// The center panel, in the customer's words: flat recessed = shaker, raised = raised panel,
// "reversed raised" (the profile on the back) = flat panel.
function panelPhrase(door: string): { style: string; panel: string } {
  if (has(door, /reversed raised/i)) return { style: 'flat-panel', panel: 'a flat center panel' };
  if (has(door, /raised/i)) return { style: 'raised-panel', panel: 'a raised center panel' };

  return { style: 'shaker', panel: 'a recessed shaker panel' };
}

// Euro finish names read as product codes ("Textured Matte Finish, Super White"); turn them into
// prose: "Super White (textured matte)", "textured woodgrain", "lacquered high gloss".
function euroFinish(finish: string): string {
  const [desc, name] = finish.split(', ');
  const plain = (desc ?? '')
    .replace(/\bfinish\b/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return name ? `${name} (${plain})` : plain;
}

function doorPoint(lines: SpecLine[], ctx: BuildContext): BuildPoint | null {
  const door = find(lines, /door/i);
  const overlay = find(lines, /overlay/i);
  const finish = finishName(lines);
  const pull = has(door, /finger pull/i) ? ' with a routed finger pull.' : '.';
  const slab = has(door, /slab/i) ? ` Slab drawer fronts${pull}` : '';
  const fit = overlayNote(overlay);

  // Euro lines have no door line: flat laminate fronts (or the merchandised style), named by
  // their finish.
  if (door === '') {
    const species = find(lines, /wood species/i);

    if (!has(species, /laminat|furnitureboard/i)) return null;

    const shaker = /shaker/i.test(ctx.doorStyle ?? '');
    const look = finish ? ` in ${euroFinish(finish)}` : '';

    return shaker
      ? {
          lead: 'Shaker doors, European style.',
          detail: `A clean recessed-panel front${look}, with no face frame behind it.`,
        }
      : { lead: 'Flat slab doors.', detail: `Modern, handle-ready flat fronts${look}.` };
  }

  const { style, panel } = panelPhrase(door);

  if (has(door, /hdf/i)) {
    // A multi-finish collection is painted in the customer's choice; a single-finish one in its
    // named colour.
    const lead = ctx.multiFinish
      ? `Painted ${style} doors that won’t crack.`
      : `${finish || 'Painted'} ${style} doors that won’t crack.`;
    const choice = ctx.multiFinish ? ' Painted in the finish you pick above.' : '';

    return {
      lead,
      detail: `Five-piece doors built like wood, in HDF that holds paint and doesn’t move with the seasons.${choice}${slab}${fit}`,
    };
  }

  if (has(door, /solid birch frame/i)) {
    return {
      lead: finish ? `Solid birch doors in ${finish}.` : 'Solid birch doors.',
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
export function howItsBuilt(lines: SpecLine[], ctx: BuildContext = {}): BuildPoint[] {
  return [
    boxPoint(lines),
    framePoint(lines),
    doorPoint(lines, ctx),
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
