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
      <div className="overflow-x-auto rounded-2xl border border-contrast-100 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-contrast-100 text-xs uppercase tracking-wide text-contrast-400">
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className="border-b border-contrast-100 last:border-b-0" key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const bold = cell.startsWith('!');
                  const text = bold ? cell.slice(1) : cell;

                  return (
                    <td
                      className={
                        cellIndex === 0 || bold
                          ? 'px-4 py-3 font-semibold text-foreground'
                          : 'px-4 py-3 text-contrast-500'
                      }
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

      {tiles.length > 0 && (
        <div className="mt-6 grid gap-4 @lg:grid-cols-2 @3xl:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              className="group flex items-center gap-3 rounded-2xl border border-contrast-100 bg-white p-3 transition-colors hover:border-contrast-200"
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
