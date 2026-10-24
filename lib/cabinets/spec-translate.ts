/**
 * Cabinet specifications, two ways.
 *
 * The staff-authored spec HTML (content.spec_by_program) is a list of "Label: value" lines in a
 * small, stable vocabulary (box, face frame, door, drawer box, shelves, hinges, glides…).
 * `parseSpecLines` turns it into label/value rows for the Specifications table, and
 * `howItsBuilt` turns those rows into the customer-facing "How it's built" rows by rule, so every
 * collection gets the plain-English version without anyone writing forty of them — and it stays
 * in step when a spec changes.
 *
 * House rules for the rows (so search and AI treat them as the same features everywhere):
 * short labels written the way customers search ("Plywood box", "Dovetail drawers", "Soft-close
 * doors"), one benefit per row, no measurements (thicknesses and joint types stay in
 * Specifications), and the door row changes with the collection (painted HDF vs solid birch).
 * `schemaProperties` gives the same features as schema.org PropertyValues for structured data.
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

const PAINTED_DOOR =
  'A smooth, durable painted finish that won’t crack at the joints the way solid wood can.';

function boxPoint(lines: SpecLine[]): BuildPoint | null {
  const box = find(lines, /box construction/i);

  if (box === '') return null;

  if (has(box, /plywood/i)) {
    return {
      lead: 'Plywood box',
      detail: 'Not particleboard, so it holds screws tight and stands up to spills under the sink.',
    };
  }

  if (has(box, /melamine/i)) {
    return {
      lead: 'Melamine-wrapped box',
      detail:
        'Furniture board sealed in melamine on every face, so it wipes clean and shrugs off scuffs.',
    };
  }

  return null;
}

function framePoint(lines: SpecLine[]): BuildPoint | null {
  const frame = find(lines, /face frame/i);
  const overlay = find(lines, /overlay/i);

  if (frame !== '') {
    return {
      lead: has(frame, /birch/i) ? 'Solid birch face frame' : 'Solid hardwood face frame',
      detail: 'A hardwood frame keeps every cabinet square and sturdy for years.',
    };
  }

  if (has(overlay, /frameless/i)) {
    return {
      lead: 'Frameless construction',
      detail: 'No face frame, so doors sit edge to edge and you get full access inside.',
    };
  }

  return null;
}

// Door style from the center panel: flat recessed = shaker, raised = raised panel, "reversed
// raised" (the profile on the back) = flat panel.
function doorStyle(door: string): string {
  if (has(door, /reversed raised/i)) return 'flat-panel';
  if (has(door, /raised/i)) return 'raised-panel';

  return 'shaker';
}

// The finish as written, minus stock codes: "Painted Stratus (Stock)" → "Painted Stratus",
// "Textured Matte Finish - Super White (SC 001)" → "Textured Matte Finish, Super White".
function finishName(lines: SpecLine[]): string {
  return find(lines, /^finish/i)
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+-\s+/g, ', ')
    .trim();
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
  const finish = finishName(lines);

  // Euro lines have no door line: flat laminate fronts (or the merchandised style), named by
  // their finish.
  if (door === '') {
    const species = find(lines, /wood species/i);

    if (!has(species, /laminat|furnitureboard/i)) return null;

    const shaker = /shaker/i.test(ctx.doorStyle ?? '');
    const look = finish ? ` in ${euroFinish(finish)}` : '';

    return shaker
      ? {
          lead: 'Shaker doors',
          detail: `A clean recessed-panel front${look}, with no face frame behind it.`,
        }
      : {
          lead: 'Slab doors',
          detail: `Flat, handle-ready fronts${look} that resist stains, scratches and scuffs.`,
        };
  }

  const style = doorStyle(door);

  if (has(door, /hdf/i)) {
    const choice = ctx.multiFinish ? ' Painted in the finish you pick above.' : '';

    return { lead: `Painted ${style} doors`, detail: `${PAINTED_DOOR}${choice}` };
  }

  if (has(door, /solid birch frame/i)) {
    return {
      lead: 'Solid birch doors',
      detail: 'Real wood with a natural grain, built strong at the joints so doors stay flat.',
    };
  }

  return null;
}

// Overlay as its own row, only where there is a face frame to overlay.
function overlayPoint(lines: SpecLine[]): BuildPoint | null {
  const overlay = find(lines, /overlay/i);
  const door = find(lines, /door/i);
  const pull = has(door, /finger pull/i) ? ' Slab drawer fronts with a routed finger pull.' : '';

  if (has(overlay, /full overlay/i)) {
    return {
      lead: 'Full overlay doors',
      detail: `Doors cover the frame for a clean, built-in look.${pull}`,
    };
  }

  if (has(overlay, /partial overlay/i)) {
    return {
      lead: 'Partial overlay doors',
      detail: `A little of the frame shows between doors, the classic look.${pull}`,
    };
  }

  return null;
}

function drawerBoxPoint(lines: SpecLine[]): BuildPoint | null {
  const box = find(lines, /drawer box/i);

  if (box === '') return null;

  if (has(box, /dovetail/i)) {
    return {
      lead: 'Dovetail drawers',
      detail: 'Solid wood drawers joined like fine furniture, with bottoms that won’t sag.',
    };
  }

  if (has(box, /plywood/i)) {
    return {
      lead: 'Plywood drawer boxes',
      detail: 'Sturdier than particleboard drawers, with bottoms that won’t sag.',
    };
  }

  return null;
}

function hingePoint(lines: SpecLine[]): BuildPoint | null {
  const hinges = find(lines, /hinge/i);

  if (hinges === '') return null;

  return has(hinges, /soft.?close/i)
    ? {
        lead: 'Soft-close doors',
        detail: 'Every door closes quietly on its own, with no slamming.',
      }
    : {
        lead: 'Concealed hinges',
        detail: 'Hidden when the door is shut, and adjustable for a perfect line.',
      };
}

function shelfPoint(lines: SpecLine[]): BuildPoint | null {
  const shelves = find(lines, /shel/i);

  if (shelves === '') return null;

  return {
    lead: 'Adjustable shelves',
    detail: has(shelves, /plywood/i)
      ? 'Thick plywood shelves you can move to fit tall bottles or heavy pots.'
      : 'Shelves you can move to fit tall bottles or heavy pots.',
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
            lead: 'Full-extension, soft-close drawers',
            detail: 'Drawers pull all the way out and close themselves.',
          }
        : {
            lead: 'Smooth drawer glides',
            detail: 'Hidden steel glides under each drawer, so it rolls out easily.',
          },
    );
  }

  if (upgrade !== '' && has(upgrade, /full extension/i)) {
    points.push({
      lead: 'Full-extension, soft-close drawers (upgrade)',
      detail: 'Drawers pull all the way out and close themselves. Add it to your order.',
    });
  }

  return points;
}

/** The customer-facing "How it's built" rows for a set of spec lines. */
export function howItsBuilt(lines: SpecLine[], ctx: BuildContext = {}): BuildPoint[] {
  return [
    boxPoint(lines),
    framePoint(lines),
    doorPoint(lines, ctx),
    overlayPoint(lines),
    drawerBoxPoint(lines),
    hingePoint(lines),
    shelfPoint(lines),
    ...glidePoints(lines),
  ].filter((p): p is BuildPoint => p != null);
}

// The first rule whose pattern matches the value, else null.
const pick = (value: string, rules: Array<[RegExp, string]>): string | null =>
  rules.find(([pattern]) => pattern.test(value))?.[1] ?? null;

/** The same features as schema.org PropertyValue pairs (name / value) for structured data:
 *  "Box material: Plywood", "Drawer: Dovetail", "Hinges: Soft-close" and so on. */
export function schemaProperties(
  lines: SpecLine[],
  ctx: BuildContext = {},
): Array<{ name: string; value: string }> {
  const door = find(lines, /door/i);
  const frame = find(lines, /face frame/i);
  const overlay = find(lines, /overlay/i);
  const anyValue = /./;
  const euroDoors = /shaker/i.test(ctx.doorStyle ?? '') ? 'Shaker' : 'Slab';
  const props: Array<{ name: string; value: string | null }> = [
    {
      name: 'Box material',
      value: pick(find(lines, /box construction/i), [
        [/plywood/i, 'Plywood'],
        [/melamine/i, 'Melamine furniture board'],
      ]),
    },
    {
      name: 'Construction',
      value: frame !== '' ? 'Framed' : pick(overlay, [[/frameless/i, 'Frameless']]),
    },
    {
      name: 'Face frame',
      value: pick(frame, [
        [/birch/i, 'Solid birch'],
        [anyValue, 'Solid hardwood'],
      ]),
    },
    {
      name: 'Doors',
      value:
        door === ''
          ? euroDoors
          : pick(door, [
              [/hdf/i, `Painted HDF ${doorStyle(door)}`],
              [/solid birch frame/i, `Solid birch ${doorStyle(door)}`],
            ]),
    },
    {
      name: 'Overlay',
      value: pick(overlay, [
        [/full overlay/i, 'Full'],
        [/partial overlay/i, 'Partial'],
      ]),
    },
    {
      name: 'Drawer',
      value: pick(find(lines, /drawer box/i), [
        [/dovetail/i, 'Dovetail'],
        [/plywood/i, 'Plywood'],
      ]),
    },
    {
      name: 'Hinges',
      value: pick(find(lines, /hinge/i), [
        [/soft.?close/i, 'Soft-close'],
        [anyValue, 'Concealed'],
      ]),
    },
    {
      name: 'Drawer glides',
      value: pick(find(lines, /drawer (glides|guides)/i), [
        [
          /full extension[\s\S]*soft.?close|soft.?close[\s\S]*full extension/i,
          'Full-extension soft-close',
        ],
        [anyValue, 'Undermount'],
      ]),
    },
    {
      name: 'Shelves',
      value: pick(find(lines, /shel/i), [
        [/plywood/i, 'Adjustable plywood'],
        [anyValue, 'Adjustable'],
      ]),
    },
  ];

  return props.filter((p): p is { name: string; value: string } => p.value != null);
}

/** Staff-written "How it's built" (content.how_built_by_program): one row per line as
 *  "Feature: what it means for you". Returns [] for blank text, which means "derive from the
 *  specs". (Older text with a sentence-style lead, "Feature. Why.", still parses.) */
export function parseHowBuiltText(text: string): BuildPoint[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter((line) => line !== '')
    .map((line) => {
      const colon = /^([^:]{2,80}?):\s+(.*)$/.exec(line);

      if (colon?.[1] && colon[2]) return { lead: colon[1], detail: colon[2] };

      const sentence = /^(.+?[.!?])\s+(.*)$/.exec(line);

      return sentence?.[1] && sentence[2]
        ? { lead: sentence[1], detail: sentence[2] }
        : { lead: line, detail: '' };
    });
}
