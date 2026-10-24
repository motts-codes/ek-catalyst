import { clsx } from 'clsx';
import {
  Archive,
  Award,
  BadgeCheck,
  Blocks,
  Bot,
  Check,
  CheckCheck,
  CircleDollarSign,
  Clock,
  Crown,
  DoorOpen,
  Gem,
  Layers,
  LayoutGrid,
  type LucideIcon,
  MoveHorizontal,
  Palette,
  PencilRuler,
  Percent,
  Scissors,
  Shield,
  ShieldCheck,
  Sparkles,
  Square,
  Truck,
  VolumeX,
  Wallet,
  Warehouse,
} from 'lucide-react';
import { type ReactNode } from 'react';

import { ShieldHouse } from '@/vibes/soul/primitives/icons/shield-house';
import { MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

const ICONS = {
  archive: Archive,
  award: Award,
  'badge-check': BadgeCheck,
  'circle-dollar-sign': CircleDollarSign,
  blocks: Blocks,
  bot: Bot,
  'check-check': CheckCheck,
  clock: Clock,
  crown: Crown,
  'door-open': DoorOpen,
  gem: Gem,
  layers: Layers,
  'layout-grid': LayoutGrid,
  'move-horizontal': MoveHorizontal,
  palette: Palette,
  'pencil-ruler': PencilRuler,
  percent: Percent,
  scissors: Scissors,
  shield: Shield,
  'shield-check': ShieldCheck,
  'shield-house': ShieldHouse,
  sparkles: Sparkles,
  square: Square,
  truck: Truck,
  'volume-x': VolumeX,
  wallet: Wallet,
  warehouse: Warehouse,
} satisfies Record<string, LucideIcon | typeof ShieldHouse>;

export type ContentIcon = keyof typeof ICONS;

/**
 * The long-form content at the foot of a program listing, as a list of typed blocks so the
 * Assembled and RTA pages can carry different shapes (a lines table on one, a comparison table
 * and prose on the other). Text fields accept inline `[label](href)` links and `**bold**`.
 */
export type ContentBlock =
  | {
      type: 'lines';
      title: string;
      intro: string;
      lines: Array<{ name: string; construction: string; summary: string }>;
      looksTitle: string;
      looks: Array<{ icon: ContentIcon; name: string; summary: string }>;
      outro: string;
    }
  | {
      type: 'compare';
      title: string;
      intro?: string;
      columns: [string, string];
      rows: Array<[string, string]>;
    }
  | {
      type: 'build';
      title: string;
      intro?: string;
      points: Array<{ icon: ContentIcon; lead: string; detail: string }>;
    }
  | {
      type: 'groups';
      title: string;
      intro?: string;
      items: Array<{ lead: string; text: string }>;
    }
  | {
      type: 'why';
      /** Small red eyebrow above the heading. */
      kicker?: string;
      title: string;
      intro: string;
      reasons: Array<{
        icon: ContentIcon;
        title: string;
        note?: string;
        detail: string;
        /** Bento placement: a tall card spans two rows (for the longest copy). */
        span?: 'tall';
        /** A photo at the top of the card; `imageLabel` alone shows a placeholder for it. */
        image?: { src: string; alt: string };
        imageLabel?: string;
      }>;
    }
  | {
      type: 'choose';
      title: string;
      intro: string;
      rows: Array<{ icon: ContentIcon; factor: string; advice: string }>;
    }
  | {
      type: 'checklist';
      title: string;
      intro: string;
      points: Array<{ lead: string; detail: string }>;
    }
  | {
      type: 'prose';
      title: string;
      paragraphs: string[];
      /** On the grey band (so two prose blocks in a row can alternate). */
      tint?: boolean;
    };

export interface CabinetProgramContent {
  blocks: ContentBlock[];
}

const CONTAINER = 'mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14';
const H2 =
  'font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl';
const COPY = 'text-sm leading-relaxed text-contrast-500 @xl:text-base';
const INLINE_LINK =
  'font-medium text-foreground underline decoration-contrast-300 underline-offset-4 transition-colors hover:decoration-[var(--button-primary-background,#d90716)]';

// Inline markup in copy: [label](href) becomes a link, **text** becomes bold.
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let match = pattern.exec(text);

  while (match) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[1] != null && match[2] != null) {
      parts.push(
        <Link className={INLINE_LINK} href={match[2]} key={`${match.index}-link`}>
          {match[1]}
        </Link>,
      );
    } else if (match[3] != null) {
      parts.push(
        <strong className="font-semibold text-foreground" key={`${match.index}-bold`}>
          {match[3]}
        </strong>,
      );
    }

    last = match.index + match[0].length;
    match = pattern.exec(text);
  }

  if (last < text.length) parts.push(text.slice(last));

  return parts;
}

function Lines({ block }: { block: Extract<ContentBlock, { type: 'lines' }> }) {
  return (
    <section className={clsx(CONTAINER, 'py-12 @4xl:py-16')}>
      <h2 className={H2}>{block.title}</h2>
      <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{inline(block.intro)}</p>
      <div className="mt-6 grid gap-8 @3xl:grid-cols-[3fr_2fr] @3xl:gap-12">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-contrast-200 text-left text-xs uppercase tracking-wide text-contrast-500">
              <th className="py-2 pr-4 font-semibold" scope="col">
                Line
              </th>
              <th className="py-2 pr-4 font-semibold" scope="col">
                Construction
              </th>
              <th className="py-2 font-semibold" scope="col">
                Best for
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-contrast-100">
            {block.lines.map((line) => (
              <tr className="align-top" key={line.name}>
                <th className="py-3 pr-4 text-left font-semibold text-foreground" scope="row">
                  {line.name}
                </th>
                <td className="py-3 pr-4 text-contrast-500">{line.construction}</td>
                <td className="py-3 text-contrast-500">{line.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h3 className="font-[family-name:var(--font-family-heading)] text-base font-semibold">
            {block.looksTitle}
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {block.looks.map((look) => {
              const Icon = ICONS[look.icon];

              return (
                // A bare icon sized to the first line of text, so the two sit on one line.
                <li className="flex items-start gap-2.5" key={look.name}>
                  <Icon
                    aria-hidden
                    className="mt-[3px] shrink-0 text-[var(--button-primary-background,#d90716)]"
                    size={16}
                    strokeWidth={2}
                  />
                  <p className="text-sm leading-relaxed text-contrast-500">
                    <span className="font-semibold text-foreground">{look.name}: </span>
                    {look.summary}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className={clsx(COPY, 'mt-6 max-w-3xl')}>{inline(block.outro)}</p>
    </section>
  );
}

// Two lines side by side, row by row (Star vs Euro Max).
function Compare({ block }: { block: Extract<ContentBlock, { type: 'compare' }> }) {
  return (
    <section className={clsx(CONTAINER, 'py-12 @4xl:py-16')}>
      <h2 className={H2}>{block.title}</h2>
      {block.intro != null && <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{inline(block.intro)}</p>}
      <table className="mt-6 w-full border-collapse overflow-hidden rounded-2xl text-sm ring-1 ring-contrast-100">
        {/* One blush band across the header, a divider down the middle. */}
        <thead>
          <tr className="bg-[#fdf3f5] text-left">
            {block.columns.map((column, index) => (
              <th
                className={clsx(
                  'w-1/2 px-5 py-3 font-[family-name:var(--font-family-heading)] text-base font-semibold text-foreground @xl:px-6',
                  index > 0 && 'border-l border-[#fcb6bb]',
                )}
                key={column}
                scope="col"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-contrast-100">
          {block.rows.map((row) => (
            <tr className="align-top" key={row[0]}>
              {row.map((cell, index) => (
                <td
                  className={clsx(
                    'px-5 py-4 text-contrast-500 @xl:px-6',
                    index > 0 && 'border-l border-contrast-100',
                  )}
                  key={index}
                >
                  {inline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// A brand-red panel inside the page gutters, white text, bare icons.
function Build({ block }: { block: Extract<ContentBlock, { type: 'build' }> }) {
  return (
    <section className={clsx(CONTAINER, 'py-4 @4xl:py-6')}>
      <div className="rounded-3xl bg-[var(--button-primary-background,#d90716)] px-6 py-10 text-white @xl:px-10 @4xl:px-14 @4xl:py-14">
        <h2 className={clsx(H2, '!text-white')}>{block.title}</h2>
        {block.intro != null && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/85 @xl:text-base">
            {block.intro}
          </p>
        )}
        <ul className="mt-6 grid gap-x-12 gap-y-6 @xl:grid-cols-2 @4xl:grid-cols-3 @4xl:gap-x-16">
          {block.points.map((point) => {
            const Icon = ICONS[point.icon];

            return (
              <li className="flex items-start gap-3" key={point.lead}>
                <Icon aria-hidden className="mt-0.5 shrink-0" size={22} strokeWidth={1.75} />
                <p className="text-sm leading-relaxed text-white/85">
                  <span className="font-semibold text-white">{point.lead} </span>
                  {point.detail}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// Bold lead, then copy with collection links.
function Groups({ block }: { block: Extract<ContentBlock, { type: 'groups' }> }) {
  return (
    <section className={clsx(CONTAINER, 'py-12 @4xl:py-16')}>
      <h2 className={H2}>{block.title}</h2>
      {block.intro != null && <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{inline(block.intro)}</p>}
      <ul className="mt-6 grid gap-x-10 gap-y-5 @3xl:grid-cols-2">
        {block.items.map((item) => (
          <li
            className="rounded-2xl border border-contrast-100 bg-white p-5 text-sm leading-relaxed text-contrast-500 transition-colors duration-300 hover:bg-[#fdf3f5]"
            key={item.lead}
          >
            <span className="font-semibold text-foreground">{item.lead} </span>
            {inline(item.text)}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Which cards sit on the light pink: a checkerboard by the card's visual row and column for a
// grid of `columns`, placed the way grid-flow-dense places them (a tall card takes two rows), so
// each row alternates against the one above it.
function checkerTints(reasons: Array<{ span?: 'tall' }>, columns = 3): boolean[] {
  const taken = new Set<string>();
  const free = (row: number, col: number) => !taken.has(`${row}:${col}`);

  return reasons.map((reason) => {
    const rows = reason.span === 'tall' ? 2 : 1;
    let row = 0;
    let col = 0;

    // First cell, row-major, where the card fits.
    for (;;) {
      if (free(row, col) && (rows === 1 || free(row + 1, col))) break;

      col += 1;

      if (col === columns) {
        col = 0;
        row += 1;
      }
    }

    for (let r = row; r < row + rows; r += 1) taken.add(`${r}:${col}`);

    return (row + col) % 2 === 0;
  });
}

// Bento grid: three columns, the tall card spanning two rows so eight cards fill nine cells.
// Hover turns a card brand red with white text and icon.
function Why({ block }: { block: Extract<ContentBlock, { type: 'why' }> }) {
  // The grid is one column on phones, two on tablets, three on desktop, so the checkerboard is
  // worked out per layout (the tall card spans two rows from two columns up).
  const phone = checkerTints(
    block.reasons.map(() => ({})),
    1,
  );
  const tablet = checkerTints(block.reasons, 2);
  const desktop = checkerTints(block.reasons, 3);

  return (
    <section className={clsx(CONTAINER, 'py-12 @4xl:py-16')}>
      {Boolean(block.kicker) && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
          {block.kicker}
        </p>
      )}
      <h2 className={H2}>{block.title}</h2>
      <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{inline(block.intro)}</p>
      <ul className="mt-6 grid grid-flow-dense gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        {block.reasons.map((reason, index) => {
          const Icon = ICONS[reason.icon];

          return (
            // Checkerboard: light pink where the row + column parity says so.
            <li
              className={clsx(
                // Pink cards sit on their fill; white cards take the light red hairline instead.
                'group flex flex-col gap-4 rounded-2xl border p-6 transition-colors duration-300 ease-smooth hover:border-[var(--button-primary-background,#d90716)] hover:bg-[var(--button-primary-background,#d90716)] hover:text-white',
                phone[index] ? 'border-[#fdf3f5] bg-[#fdf3f5]' : 'border-[#fcb6bb] bg-white',
                tablet[index]
                  ? '@xl:border-[#fdf3f5] @xl:bg-[#fdf3f5]'
                  : '@xl:border-[#fcb6bb] @xl:bg-white',
                desktop[index]
                  ? '@4xl:border-[#fdf3f5] @4xl:bg-[#fdf3f5]'
                  : '@4xl:border-[#fcb6bb] @4xl:bg-white',
                reason.span === 'tall' && '@xl:row-span-2',
              )}
              key={reason.title}
            >
              {(reason.image != null || reason.imageLabel != null) && (
                // The tall card's photo grows to fill the extra row.
                <div
                  className={clsx(
                    'relative -mx-2 -mt-2 overflow-hidden rounded-xl bg-contrast-100',
                    reason.span === 'tall'
                      ? 'aspect-[16/10] @xl:aspect-auto @xl:min-h-[16rem] @xl:flex-1'
                      : 'aspect-[16/10]',
                  )}
                >
                  {reason.image ? (
                    <Image
                      alt={reason.image.alt}
                      className="object-cover"
                      fill
                      sizes="(min-width: 56rem) 33vw, 100vw"
                      src={reason.image.src}
                    />
                  ) : (
                    <MediaPlaceholder label={reason.imageLabel ?? reason.title} />
                  )}
                </div>
              )}
              <Icon
                className="text-[var(--button-primary-background,#d90716)] transition-colors duration-300 group-hover:text-white"
                size={32}
                strokeWidth={1.5}
              />
              <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-semibold leading-snug">
                {reason.title}
                {reason.note != null && (
                  <span className="mt-0.5 block text-xs font-normal text-contrast-400 transition-colors duration-300 group-hover:text-white/80">
                    {reason.note}
                  </span>
                )}
              </h3>
              <p className="text-sm leading-relaxed text-contrast-500 transition-colors duration-300 group-hover:text-white/90">
                {reason.detail}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// A factor / advice table; rows tint light pink on hover.
function Choose({ block }: { block: Extract<ContentBlock, { type: 'choose' }> }) {
  return (
    <section className="bg-[#f9fafd] py-12 @4xl:py-16">
      <div className={CONTAINER}>
        <h2 className={H2}>{block.title}</h2>
        <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{inline(block.intro)}</p>
        <table className="mt-6 w-full border-collapse overflow-hidden rounded-2xl bg-white text-sm ring-1 ring-contrast-100">
          <tbody className="divide-y divide-contrast-100">
            {block.rows.map((row) => {
              const Icon = ICONS[row.icon];

              return (
                <tr
                  className="align-top transition-colors duration-300 hover:bg-[#fdf3f5]"
                  key={row.factor}
                >
                  <th className="w-[38%] px-5 py-4 text-left @xl:w-[26%] @xl:px-6" scope="row">
                    <span className="flex items-center gap-3 font-semibold text-foreground">
                      <Icon
                        aria-hidden
                        className="shrink-0 text-[var(--button-primary-background,#d90716)]"
                        size={18}
                        strokeWidth={1.75}
                      />
                      {row.factor}
                    </span>
                  </th>
                  <td className="px-5 py-4 text-contrast-500 @xl:px-6">{inline(row.advice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Checklist({ block }: { block: Extract<ContentBlock, { type: 'checklist' }> }) {
  return (
    <section className={clsx(CONTAINER, 'py-12 @4xl:py-16')}>
      <h2 className={H2}>{block.title}</h2>
      <p className={clsx(COPY, 'mt-3 max-w-3xl')}>{inline(block.intro)}</p>
      <ul className="mt-6 grid gap-x-8 gap-y-7 @xl:grid-cols-2 @4xl:grid-cols-3">
        {block.points.map((point) => (
          <li className="flex items-start gap-2.5" key={point.lead}>
            <Check
              className="mt-0.5 shrink-0 text-[var(--button-primary-background,#d90716)]"
              size={18}
              strokeWidth={2.25}
            />
            <p className="text-sm leading-relaxed text-contrast-500">
              <span className="font-semibold text-foreground">{point.lead} </span>
              {inline(point.detail)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Plain paragraphs (with inline links and bold leads), on the grey band when tinted.
function Prose({ block }: { block: Extract<ContentBlock, { type: 'prose' }> }) {
  return (
    <section className={clsx('py-12 @4xl:py-16', block.tint && 'bg-[#f9fafd]')}>
      <div className={CONTAINER}>
        <h2 className={H2}>{block.title}</h2>
        <div className="mt-4 grid gap-5 @3xl:grid-cols-2 @3xl:gap-10">
          {block.paragraphs.map((paragraph) => (
            <p className={COPY} key={paragraph.slice(0, 40)}>
              {inline(paragraph)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'lines':
      return <Lines block={block} />;

    case 'compare':
      return <Compare block={block} />;

    case 'build':
      return <Build block={block} />;

    case 'groups':
      return <Groups block={block} />;

    case 'why':
      return <Why block={block} />;

    case 'choose':
      return <Choose block={block} />;

    case 'checklist':
      return <Checklist block={block} />;

    case 'prose':
      return <Prose block={block} />;

    default:
      return null;
  }
}

// The long-form content at the foot of a program listing, block by block, in the site's own
// blocks rather than one long run of headings and bullets.
export function CabinetProgramContentSection({
  content,
  id,
  divider = true,
  className,
}: {
  content: CabinetProgramContent;
  /** Anchor for the "How it's built" link in the hero. */
  id?: string;
  /** The diamond rule above the first block (off when the blocks sit among other bands). */
  divider?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx('scroll-mt-24 @container', className)} id={id}>
      {/* The break between the listing and the long-form content: a full-width row of outlined
          diamonds, drawn as a repeating SVG pattern so it tiles to any width. */}
      {divider && (
        <div aria-hidden className={clsx(CONTAINER, 'pt-6 @4xl:pt-8')}>
          <svg
            className="block h-4 w-full text-contrast-300 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
            role="presentation"
          >
            <defs>
              <pattern
                height="16"
                id="diamond-rule"
                patternUnits="userSpaceOnUse"
                width="16"
                x="50%"
              >
                <path
                  d="M8 1 L15 8 L8 15 L1 8 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect fill="url(#diamond-rule)" height="16" width="100%" />
          </svg>
        </div>
      )}
      {content.blocks.map((block) => (
        <Block block={block} key={block.title} />
      ))}
    </div>
  );
}
