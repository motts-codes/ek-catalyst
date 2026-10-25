import { clsx } from 'clsx';
import { ReactNode } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
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
  tint?: boolean;
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
  tint = false,
  className,
}: Props) {
  return (
    <HomeSection
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      {look === 'minimal' ? (
        <MinimalTable columns={columns} narrow={narrow} rows={rows} />
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
        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-contrast-400 [&_a]:underline [&_a]:underline-offset-2">
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
}

function cellText(cell: string): { bold: boolean; text: string } {
  const bold = cell.startsWith('!');

  return { bold, text: bold ? cell.slice(1) : cell };
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
                      {text}
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
}: TableProps) {
  let minWidth: string | undefined = inline ? 'min-w-[28rem]' : 'min-w-[36rem]';

  if (fit) minWidth = undefined;

  return (
    // Scrolls sideways on narrow screens, so it must be reachable from the keyboard (WCAG 2.1.1).
    <div
      aria-label={columns.filter(Boolean).join(', ')}
      className={clsx(
        'overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]',
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
                  'pb-3 pr-8 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]',
                  columnIndex === 0 && narrow && 'whitespace-nowrap pr-10',
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
              className="border-b border-contrast-100 transition-colors hover:bg-[#fdf8f8]"
              key={rowIndex}
            >
              {row.map((cell, cellIndex) => {
                const { bold, text } = cellText(cell);
                const feature = cellIndex === 0;

                return (
                  <td
                    className={clsx(
                      'py-4 pr-8 align-top',
                      feature && 'text-[15px] @xl:text-base',
                      feature && narrow && 'whitespace-nowrap pr-10',
                      feature || bold ? 'font-semibold text-foreground' : 'text-[#404040]',
                      !feature &&
                        text.startsWith('✓') &&
                        'text-[var(--button-primary-background,#d90716)]',
                    )}
                    key={cellIndex}
                  >
                    {text}
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
