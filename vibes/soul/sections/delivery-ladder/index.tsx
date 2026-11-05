import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { ReactNode } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface QuickShipTile {
  name: string;
  meta?: string;
  href: string;
  image?: { src: string; alt: string };
}

interface Props {
  kicker?: string;
  title: string;
  description?: string;
  /** Table header cells. */
  columns: string[];
  /** Table body; each row has one cell per column. A cell starting with "!" renders bold. */
  rows: string[][];
  /** Optional strip of quick-ship door tiles under the table. */
  tiles?: QuickShipTile[];
  cta?: { label: string; href: string };
  /** Small print under the table (may include a link). */
  footnote?: ReactNode;
  /** A compact table, left-aligned under the heading: the feature column fits its longest label and
   *  the whole table is capped. */
  narrow?: boolean;
  /** 'minimal' drops the box, fills and dividers: hairlines between rows, labels up top. */
  look?: 'classic' | 'minimal';
  /** Minimal only: sit left under the heading (the "Money or time" look) instead of centring. */
  inline?: boolean;
  /** Minimal only: the row hover fill. White for a table on a coloured band. */
  highlight?: 'rose' | 'white';
  /** Minimal only: tighter rows and smaller type. */
  compact?: boolean;
  tint?: boolean;
  /** A picture beside the table (table left, picture right from tablet up); `contain` for a cut-out. */
  media?: { image: { src: string; alt: string }; split?: '60/40' | '70/30' };
  className?: string;
}

// "The delivery ladder" — the fulfillment promise per program / category as a plain table (so a
// pro can put a date in front of a client), plus the quick-ship strip and a link to everything
// that ships in two weeks or less.
export function DeliveryLadder({
  kicker,
  title,
  description,
  columns,
  rows,
  tiles = [],
  cta,
  footnote,
  narrow = false,
  look = 'classic',
  inline = false,
  highlight = 'rose',
  compact = false,
  tint = false,
  media,
  className,
}: Props) {
  const body = (
    <>
      {look === 'minimal' ? (
        // Inline tables sit left under the heading at the width of an explainer's half column.
        <div className={clsx(inline && 'max-w-3xl')}>
          <MinimalTable
            columns={columns}
            compact={compact}
            highlight={highlight}
            inline={inline}
            narrow={narrow}
            rows={rows}
          />
        </div>
      ) : (
        <ClassicTable columns={columns} narrow={narrow} rows={rows} />
      )}

      {tiles.length > 0 && (
        <div className="mt-6 grid gap-4 @lg:grid-cols-2 @3xl:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              className="group flex items-center gap-3 rounded-3xl border border-contrast-100 bg-white p-4 transition-colors hover:border-contrast-200"
              href={tile.href}
              key={tile.name}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-contrast-100">
                {tile.image ? (
                  <Image
                    alt={tile.image.alt}
                    className="object-cover"
                    fill
                    sizes="64px"
                    src={tile.image.src}
                  />
                ) : (
                  <MediaPlaceholder className="p-1" label="Door" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{tile.name}</p>
                {Boolean(tile.meta) && <p className="text-xs text-contrast-500">{tile.meta}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {footnote != null && (
        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-contrast-500 [&_a]:underline [&_a]:underline-offset-2">
          {footnote}
        </p>
      )}
      {cta && (
        <div className="mt-6">
          <ButtonLink href={cta.href} shape="pill" size="small" variant="secondary">
            {cta.label}
          </ButtonLink>
        </div>
      )}
    </>
  );

  // With a picture, the whole section splits: heading and table on the left, the picture on the
  // right at the full height of both (the section's own heading row is left empty).
  if (media) {
    return (
      <HomeSection className={className} tint={tint}>
        <div
          className={clsx(
            'grid items-stretch gap-8 @3xl:gap-12',
            media.split === '70/30' ? '@3xl:grid-cols-[7fr_3fr]' : '@3xl:grid-cols-[3fr_2fr]',
          )}
        >
          <div className="min-w-0">
            {Boolean(kicker || title || description) && (
              <div className="mb-5 max-w-3xl @4xl:mb-6">
                {Boolean(kicker) && (
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
                    {kicker}
                  </p>
                )}
                <h2 className={homeHeadingClassName}>{title}</h2>
                {Boolean(description) && (
                  <p className="mt-2 text-sm leading-relaxed text-contrast-500 @xl:text-base">
                    {description}
                  </p>
                )}
              </div>
            )}
            {body}
          </div>
          {/* The picture takes the table's height from tablet up (contained, so a cut-out keeps
              its shape); on phones it sits under the table as a square. */}
          <div className="relative mx-auto aspect-square w-full max-w-sm @3xl:aspect-auto @3xl:h-full @3xl:min-h-[14rem] @3xl:max-w-none">
            <Image
              alt={media.image.alt}
              className="object-contain"
              fill
              sizes="(min-width: 56rem) 40vw, 24rem"
              src={media.image.src}
            />
          </div>
        </div>
      </HomeSection>
    );
  }

  return (
    <HomeSection
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      {body}
    </HomeSection>
  );
}

export interface TableProps {
  columns: string[];
  rows: string[][];
  narrow: boolean;
  /** Minimal table only: width classes for the columns after the feature column. */
  widths?: string[];
  /** Minimal table only: let it sit where it is placed instead of centring and capping it. */
  inline?: boolean;
  /** Let a short table shrink to its container instead of scrolling sideways on phones. */
  fit?: boolean;
  /** Tighter rows and smaller type, for a pair of tables side by side. */
  compact?: boolean;
  /** The row hover fill: a blush by default, white on a coloured band. */
  highlight?: 'rose' | 'white';
}

function cellText(cell: string): { bold: boolean; text: string } {
  const bold = cell.startsWith('!');

  return { bold, text: bold ? cell.slice(1) : cell };
}

// A cell that starts with "✓" renders the lucide check (no circle) in brand red, with "Yes" for
// screen readers, followed by any trailing text ("✓ Six in CT"). Other cells render as typed.
function CellContent({ text }: { text: string }): ReactNode {
  if (!text.startsWith('✓')) return text;

  const rest = text.slice(1).trim();

  return (
    <span className="inline-flex items-start gap-1.5">
      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
      <span className="sr-only">Yes</span>
      {rest ? <span>{rest}</span> : null}
    </span>
  );
}

// The boxed table: red header row, alternating fills, hairlines between every column.
function ClassicTable({ columns, rows, narrow }: TableProps) {
  return (
    <>
      {/* Header row in brand red; body rows alternate white / light pink and tint on hover;
        hairlines between rows and between every column. The first column is the feature. */}
      <div
        className={clsx(
          'overflow-x-auto rounded-3xl border border-[#fcb6bb] bg-white',
          narrow ? 'max-w-4xl' : '@3xl:mx-auto @3xl:w-5/6',
        )}
      >
        <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left text-sm">
          {/* The feature column takes the room the brand columns don't need; narrow tables size
            it to the longest feature label instead. */}
          <colgroup>
            <col className={narrow ? 'w-0' : 'w-[40%]'} />
            {columns.slice(1).map((column) => (
              <col key={column} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-[var(--button-primary-background,#d90716)] text-sm uppercase tracking-wide text-white">
              {columns.map((column, columnIndex) => (
                <th
                  className={clsx(
                    'px-5 py-4 font-semibold',
                    columnIndex > 0 && 'border-l border-white/30 text-center',
                  )}
                  key={column || 'feature'}
                  scope="col"
                >
                  {/* Pages that leave the first heading blank still get a labelled column. */}
                  {columnIndex === 0 && !column ? 'Feature' : column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                className="group/row odd:bg-white even:bg-[#fdf8f8] hover:bg-[#fbeaea]"
                key={rowIndex}
              >
                {row.map((cell, cellIndex) => {
                  const bold = cell.startsWith('!');
                  const text = bold ? cell.slice(1) : cell;
                  const feature = cellIndex === 0;

                  return (
                    <td
                      className={clsx(
                        'border-t border-[#fcb6bb] px-5 py-4 transition-colors',
                        feature && 'text-[15px] @xl:text-base',
                        feature && narrow && 'whitespace-nowrap pr-8',
                        !feature && 'border-l text-center',
                        feature || bold ? 'font-semibold text-foreground' : 'text-[#404040]',
                        !feature &&
                          text.startsWith('✓') &&
                          'text-[var(--button-primary-background,#d90716)]',
                      )}
                      key={cellIndex}
                    >
                      <CellContent text={text} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// The quiet table: no box, no fills, no column rules. Small red labels up top over a black
// rule, a hairline between rows, the feature bold on the left; rows blush on hover.
export function MinimalTable({
  columns,
  rows,
  narrow,
  widths,
  inline = false,
  fit = false,
  compact = false,
  highlight = 'rose',
}: TableProps) {
  let minWidth: string | undefined = inline ? 'min-w-[28rem]' : 'min-w-[36rem]';

  if (fit) minWidth = undefined;

  return (
    // Scrolls sideways on narrow screens, so it must be reachable from the keyboard (WCAG 2.1.1).
    <div
      aria-label={columns.filter(Boolean).join(', ')}
      // `relative` keeps absolutely positioned descendants (the sr-only "Yes" in check cells) inside
      // the scroll container; otherwise they escape it and widen the page on phones.
      className={clsx(
        'relative overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]',
        narrow && !inline && 'mx-auto max-w-4xl',
      )}
      role="region"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be focusable
      tabIndex={0}
    >
      <table className={clsx('w-full border-collapse text-left text-sm', minWidth)}>
        {/* The program columns share the width equally unless widths are given; the feature
            column takes the rest (or, narrow, just what its longest label needs). */}
        <colgroup>
          <col className={narrow ? 'w-0' : 'w-[34%]'} />
          {columns.slice(1).map((column, index) => (
            <col className={widths?.[index] ?? (narrow ? 'w-[38%]' : undefined)} key={column} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b-2 border-foreground">
            {columns.map((column, columnIndex) => (
              <th
                className={clsx(
                  'pr-8 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]',
                  compact ? 'pb-2 text-[11px]' : 'pb-3',
                  columnIndex === 0 && narrow && !fit && 'whitespace-nowrap pr-10',
                )}
                key={column || 'feature'}
                scope="col"
              >
                {columnIndex === 0 && !column ? <span className="sr-only">Feature</span> : column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              className={clsx(
                'border-b border-contrast-100 transition-colors',
                highlight === 'white' ? 'hover:bg-white' : 'hover:bg-[#fdf8f8]',
              )}
              key={rowIndex}
            >
              {row.map((cell, cellIndex) => {
                const { bold, text } = cellText(cell);
                const feature = cellIndex === 0;

                return (
                  <td
                    className={clsx(
                      'pr-8 align-top',
                      compact ? 'py-2.5' : 'py-4',
                      feature && !compact && 'text-[15px] @xl:text-base',
                      // A fitted table must be able to wrap its feature column on phones.
                      feature && narrow && !fit && 'whitespace-nowrap pr-10',
                      feature || bold ? 'font-semibold text-foreground' : 'text-[#404040]',
                      !feature &&
                        text.startsWith('✓') &&
                        'text-[var(--button-primary-background,#d90716)]',
                    )}
                    key={cellIndex}
                  >
                    <CellContent text={text} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
