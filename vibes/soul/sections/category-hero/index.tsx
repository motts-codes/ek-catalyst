import { clsx } from 'clsx';
import {
  ArrowDown,
  ArrowRight,
  CircleDollarSign,
  Clock,
  DoorOpen,
  Footprints,
  Gift,
  Hammer,
  Layers,
  MapPin,
  PackageCheck,
  PencilRuler,
  Phone,
  ShieldCheck,
  Store,
  Tag,
  ThumbsUp,
  Truck,
  Undo2,
  Wrench,
  Zap,
} from 'lucide-react';
import { type ReactNode } from 'react';

import { animatedUnderlineClassName } from '@/vibes/soul/primitives/animated-underline';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { ShieldHouse } from '@/vibes/soul/primitives/icons/shield-house';
import { MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

const containerClassName = 'mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14';

// Below @md a tile row is one swipeable line (bleeding to the screen edge, snapping per tile,
// no scrollbar) instead of a stacked grid; from @md up each row lays its own grid.
const swipeRowClassName =
  '-mx-6 flex snap-x scroll-px-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @md:mx-0 @md:grid @md:overflow-visible @md:px-0';
const swipeItemClassName = 'w-[42%] shrink-0 snap-start @md:w-auto';

// The hero's buttons share the closing band's swipe: the primary is black and fills white from the
// left on hover; the outline is a white hairline that fills white, its text taking the panel's
// colour. The focus ring offsets against the panel.
const outlineBase =
  'transition-colors [--button-ghost-background-hover:white] [--button-ghost-border:rgb(255_255_255/0.3)] [--button-ghost-text:white] hover:[--button-ghost-border:white] focus-visible:ring-white';
const darkPrimary =
  'border-foreground bg-foreground text-white after:!bg-white hover:!text-foreground focus-visible:ring-white [&>span]:mix-blend-normal';

const HERO_BUTTON = {
  'deep-red': {
    primary: `${darkPrimary} focus-visible:ring-offset-[#9f3632]`,
    outline: `${outlineBase} hover:[--button-ghost-text:#9f3632] focus-visible:ring-offset-[#9f3632]`,
  },
  red: {
    primary: `${darkPrimary} focus-visible:ring-offset-[#d90716]`,
    outline: `${outlineBase} hover:[--button-ghost-text:#d90716] focus-visible:ring-offset-[#d90716]`,
  },
  black: {
    // On black the primary is white and swipes brand red.
    primary:
      'border-white bg-white text-foreground after:!bg-[var(--button-primary-background,#d90716)] hover:!text-white focus-visible:ring-white focus-visible:ring-offset-foreground [&>span]:mix-blend-normal',
    outline: `${outlineBase} hover:[--button-ghost-text:hsl(var(--foreground))] focus-visible:ring-offset-foreground`,
  },
};

interface HeroProps {
  title: string;
  description?: string;
  image?: { src: string; alt: string };
  /** Placeholder label shown until the category has an image. */
  imageLabel?: string;
  actions?: Array<{ label: string; href: string }>;
  /**
   * Subcategory pages (Granite, Vanity Tops…): about 40% shorter, the heading and a short line,
   * on the dark-grey panel rather than black.
   */
  compact?: boolean;
  /** Panel colour: brand red (default) or black. Subcategory pages ignore it (black, compact). */
  /** 'deep-red' is the closing band's #9f3632 (white text 6.9:1). */
  tone?: 'black' | 'red' | 'deep-red';
  /** A small line above the headline (the category name when the headline is a promise). */
  eyebrow?: string;
  /** A ready-made eyebrow (e.g. a live status pill) shown instead of the plain one. */
  eyebrowSlot?: ReactNode;
  /** Rendered over the photo (e.g. the 'Watch the explainer' chip). */
  imageOverlay?: ReactNode;
  /** Where on the photo: top-right (default) or bottom-left, the usual spot for a video chip. */
  imageOverlayPosition?: 'top-right' | 'bottom-left';
  /** A taller panel (the Assembled / RTA listings): more vertical padding, a taller photo. */
  tall?: boolean;
  /** Promises shown inside the panel under the description (instead of the CategoryPoints row). */
  promises?: Array<{ icon: keyof typeof POINT_ICONS; label: string }>;
  /** A link at the end of the promises row (e.g. "See how they're built"). */
  promisesAction?: { label: string; href: string };
  /** 'columns' (default) stacks the promises in two columns; 'row' runs them along one line. */
  promisesLayout?: 'columns' | 'row';
  className?: string;
}

const POINT_ICONS = {
  truck: Truck,
  returns: Undo2,
  stock: PackageCheck,
  clock: Clock,
  pickup: MapPin,
  price: CircleDollarSign,
  gift: Gift,
  tag: Tag,
  phone: Phone,
  zap: Zap,
  // Cabinet program promises.
  'shield-house': ShieldHouse,
  thumbs: ThumbsUp,
  plywood: Layers,
  shield: ShieldCheck,
  wrench: Wrench,
  hammer: Hammer,
  // Showroom promises.
  design: PencilRuler,
  door: DoorOpen,
  walk: Footprints,
  store: Store,
};

interface HeroPromise {
  icon: keyof typeof POINT_ICONS;
  label: string;
}

// The promises in the panel: two stacked columns (3 + 2) with the link in a narrower third
// column at the right, the columns wrapping under each other on phones; or one wrapping row.
function HeroPromises({
  promises,
  action,
  layout,
}: {
  promises: HeroPromise[];
  action?: { label: string; href: string };
  layout: 'columns' | 'row';
}) {
  const row = layout === 'row';
  const columns = row
    ? [promises]
    : [
        promises.slice(0, Math.ceil(promises.length / 2)),
        promises.slice(Math.ceil(promises.length / 2)),
      ];

  return (
    <div
      className={clsx(
        'mt-12 gap-x-8 gap-y-4 text-xs font-medium text-white @xl:mt-14',
        row ? 'flex flex-wrap items-start' : 'grid @md:grid-cols-[auto_auto_1fr] @md:items-start',
      )}
    >
      {columns.map((column, index) => (
        <ul className={clsx('flex gap-2.5', row ? 'flex-wrap gap-x-6' : 'flex-col')} key={index}>
          {column.map((point) => {
            const Icon = POINT_ICONS[point.icon];

            return (
              <li className="inline-flex items-center gap-2" key={point.label}>
                <Icon aria-hidden size={16} strokeWidth={1.75} />
                {point.label}
              </li>
            );
          })}
        </ul>
      ))}
      {action != null && (
        <a
          className="inline-flex items-center gap-1 self-start font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white @md:self-end @md:justify-self-end"
          href={action.href}
        >
          {action.label}
          <ArrowDown size={14} strokeWidth={2.25} />
        </a>
      )}
    </div>
  );
}

// Category page header, 50 / 50: the headline and one paragraph on a black panel, the category
// photo beside it. Same rounded panel as the home hero. Stacks on narrow screens (text first).
// Top-level categories sit on the brand red; subcategories get the compact version: shorter,
// black, heading plus a short line.
export function CategoryHero({
  title,
  description,
  image,
  imageLabel,
  actions = [],
  compact = false,
  tone = 'red',
  eyebrow,
  eyebrowSlot,
  imageOverlay,
  imageOverlayPosition = 'top-right',
  tall = false,
  promises = [],
  promisesAction,
  promisesLayout = 'columns',
  className,
}: HeroProps) {
  return (
    <section className={clsx('@container', className)}>
      <div className={clsx(containerClassName, 'pt-3')}>
        <div className="grid overflow-hidden rounded-3xl @3xl:grid-cols-2">
          <div
            className={clsx(
              'flex flex-col justify-center text-white @4xl:px-14',
              compact
                ? 'bg-foreground px-6 py-6 @xl:px-10 @xl:py-7'
                : clsx(
                    // Tall: the spare room goes above the promises, not under them.
                    tall
                      ? 'px-6 pb-8 pt-12 @xl:px-10 @xl:pb-10 @xl:pt-16'
                      : 'px-6 py-9 @xl:px-10 @xl:py-12',
                    // Brand red (#d90716): white text sits at 5.3:1. The lighter #F20819 was tried and
                    // misses 4.5:1 for the description line.
                    {
                      'bg-[var(--button-primary-background,#d90716)]': tone === 'red',
                      'bg-[#9f3632]': tone === 'deep-red',
                      'bg-foreground': tone === 'black',
                    },
                  ),
            )}
          >
            {eyebrowSlot}
            {eyebrowSlot == null && Boolean(eyebrow) && (
              <p className="mb-5 inline-flex w-fit items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                {eyebrow}
              </p>
            )}
            <h1
              className={clsx(
                'm-0 max-w-[26ch] font-heading font-bold leading-[1.1]',
                compact ? 'text-[22px] @xl:text-3xl' : 'text-[26px] @xl:text-[40px]',
              )}
            >
              {title}
            </h1>
            {Boolean(description) && (
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-white @xl:text-base">
                {description}
              </p>
            )}
            {promises.length > 0 && (
              <HeroPromises action={promisesAction} layout={promisesLayout} promises={promises} />
            )}
            {actions.length > 0 && (
              <div className={clsx('flex flex-wrap gap-3', compact ? 'mt-4' : 'mt-6')}>
                {actions.map((action, index) => (
                  <ButtonLink
                    className={index === 0 ? HERO_BUTTON[tone].primary : HERO_BUTTON[tone].outline}
                    href={action.href}
                    key={action.label}
                    shape="pill"
                    size="small"
                    variant={index === 0 ? 'secondary' : 'ghost'}
                  >
                    {action.label}
                  </ButtonLink>
                ))}
              </div>
            )}
          </div>
          <div
            className={clsx(
              'relative bg-contrast-100',
              compact && 'min-h-[140px] @3xl:min-h-[190px]',
              !compact && !tall && 'min-h-[200px] @3xl:min-h-[320px]',
              !compact && tall && 'min-h-[240px] @3xl:min-h-[400px]',
            )}
          >
            {image ? (
              <Image
                alt={image.alt}
                className="object-cover"
                fill
                preload
                sizes="(min-width: 56rem) 40vw, 100vw"
                src={image.src}
              />
            ) : (
              <MediaPlaceholder className="absolute inset-0" label={imageLabel ?? title} />
            )}
            {imageOverlay != null && (
              <div
                className={clsx(
                  'absolute',
                  imageOverlayPosition === 'bottom-left'
                    ? 'bottom-4 left-4 @xl:bottom-5 @xl:left-5'
                    : 'right-4 top-4 @xl:right-5 @xl:top-5',
                )}
              >
                {imageOverlay}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface PointsProps {
  points: Array<{ icon: keyof typeof POINT_ICONS; label: string }>;
  fine?: string;
  /** A text link at the right end of the row (e.g. "See how they're built" → the content below). */
  action?: { label: string; href: string };
  className?: string;
}

// The row of promises under the hero — stock, delivery, returns — with the small print at the end.
export function CategoryPoints({ points, fine, action, className }: PointsProps) {
  if (points.length === 0) return null;

  return (
    <section className={clsx('@container', className)}>
      <div className={containerClassName}>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-contrast-100 py-5">
          {points.map((point) => {
            const Icon = POINT_ICONS[point.icon];

            return (
              <div className="flex items-center gap-2.5 text-sm font-semibold" key={point.label}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f9fafd] text-[var(--button-primary-background,#d90716)] ring-1 ring-contrast-100">
                  <Icon size={17} strokeWidth={1.75} />
                </span>
                {point.label}
              </div>
            );
          })}
          {Boolean(fine) && <p className="text-xs text-contrast-400 @3xl:ml-auto">{fine}</p>}
          {action != null && (
            // A plain anchor: an in-page hash link scrolls natively (honouring scroll-margin and
            // smooth scrolling), which the router link does not do reliably on the same path.
            <a
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-[var(--button-primary-background,#d90716)] @3xl:ml-auto"
              href={action.href}
            >
              <span className={animatedUnderlineClassName}>{action.label}</span>
              <ArrowDown size={15} strokeWidth={2.25} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export interface SubcategoryTile {
  name: string;
  href: string;
  image?: { src: string; alt: string };
  /** A flat colour panel when there is no photo (a finish swatch). */
  color?: string;
}

interface TilesProps {
  title?: string;
  items: SubcategoryTile[];
  /** A row that follows another tile row: trims the top padding so the two read as one block. */
  stacked?: boolean;
  className?: string;
}

// "Shop by type" — the category's subcategories as photo tiles with the name beneath; the fastest
// way to narrow before the filters. Renders nothing for a category with no subcategories.
export function SubcategoryTiles({
  title = 'Shop by type',
  items,
  stacked = false,
  className,
}: TilesProps) {
  if (items.length === 0) return null;

  return (
    <section className={clsx('@container', className)}>
      <div
        className={clsx(
          containerClassName,
          'pb-8 @4xl:pb-10',
          stacked ? 'pt-0' : 'pt-8 @4xl:pt-10',
        )}
      >
        <h2 className="mb-4 font-heading text-lg font-bold leading-tight @xl:text-xl @4xl:text-[22px]">
          {title}
        </h2>
        <div
          className={clsx(
            swipeRowClassName,
            'gap-4 @md:grid-cols-2 @lg:grid-cols-3 @3xl:grid-cols-4 @5xl:grid-cols-6 @5xl:gap-5',
          )}
        >
          {items.map((item) => (
            <Link
              className={clsx(
                swipeItemClassName,
                'group flex flex-col overflow-hidden rounded-3xl border border-contrast-100 bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
              )}
              href={item.href}
              key={item.href}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-contrast-100">
                {item.image ? (
                  <Image
                    alt={item.image.alt}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    fill
                    sizes="(min-width: 64rem) 17vw, (min-width: 42rem) 25vw, 50vw"
                    src={item.image.src}
                  />
                ) : (
                  <TilePanel color={item.color} label={item.name} />
                )}
              </div>
              <span className="flex items-center justify-between gap-2 px-4 py-3.5 text-sm font-semibold transition-colors group-hover:text-[var(--button-primary-background,#d90716)]">
                {item.name}
                <ArrowRight
                  className="shrink-0 text-[var(--button-primary-background,#d90716)] transition-transform duration-300 group-hover:-translate-x-1"
                  size={15}
                  strokeWidth={2.5}
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// A tile with no photo: a flat colour (finish swatch) or the labelled placeholder.
function TilePanel({ color, label }: { color?: string; label: string }) {
  if (color == null || color === '') return <MediaPlaceholder label={label} />;

  return <span aria-hidden className="absolute inset-0 block" style={{ backgroundColor: color }} />;
}

// "Shop by finish": the brand row's small boxes, the swatch filling each one, with the finish
// name beneath the box so the swatch keeps the brand box's full height.
export function SwatchTiles({
  title = 'Shop by finish',
  items,
  stacked = false,
  className,
}: TilesProps) {
  if (items.length === 0) return null;

  return (
    <section className={clsx('@container', className)}>
      <div
        className={clsx(
          containerClassName,
          'pb-8 @4xl:pb-10',
          stacked ? 'pt-0' : 'pt-8 @4xl:pt-10',
        )}
      >
        <h2 className="mb-4 font-heading text-lg font-bold leading-tight @xl:text-xl @4xl:text-[22px]">
          {title}
        </h2>
        <ul
          className={clsx(swipeRowClassName, 'gap-3 @md:grid-cols-4 @3xl:grid-cols-8 @3xl:gap-4')}
        >
          {items.map((item) => (
            <li className={swipeItemClassName} key={item.href}>
              <Link
                className="group flex flex-col gap-2 focus-visible:outline-0 [&:focus-visible>span:first-child]:ring-2 [&:focus-visible>span:first-child]:ring-primary"
                href={item.href}
              >
                <span className="relative block aspect-[5/3] overflow-hidden rounded-2xl border border-[#fcb6bb] bg-contrast-100 transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]">
                  {item.image ? (
                    <Image
                      alt={item.image.alt}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      fill
                      sizes="(min-width: 64rem) 12vw, (min-width: 36rem) 25vw, 50vw"
                      src={item.image.src}
                    />
                  ) : (
                    <TilePanel color={item.color} label={item.name} />
                  )}
                </span>
                <span className="line-clamp-2 text-center text-xs font-semibold leading-tight text-foreground transition-colors group-hover:text-[var(--button-primary-background,#d90716)] @3xl:text-[11px] @5xl:text-xs">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface BrandTilesProps {
  title?: string;
  brands: Array<{ name: string; href: string; logo?: { src: string; alt: string } }>;
  /** Follows another tile row: trims the top padding so the rows read as one block. */
  stacked?: boolean;
  className?: string;
}

// "Shop by brand": a row of equal boxes, one logo each, centred with the same inset, in the pink
// hairline the rest of the site's tiles use. Logos are SVGs, so they're served as-is.
export function BrandTiles({
  title = 'Shop by brand',
  brands,
  stacked = false,
  className,
}: BrandTilesProps) {
  if (brands.length === 0) return null;

  return (
    <section className={clsx('@container', className)}>
      <div
        className={clsx(
          containerClassName,
          'pb-8 @4xl:pb-10',
          stacked ? 'pt-0' : 'pt-8 @4xl:pt-10',
        )}
      >
        <h2 className="mb-4 font-heading text-lg font-bold leading-tight @xl:text-xl @4xl:text-[22px]">
          {title}
        </h2>
        <ul
          className={clsx(swipeRowClassName, 'gap-3 @md:grid-cols-4 @3xl:grid-cols-8 @3xl:gap-4')}
        >
          {brands.map((item) => (
            <li className={swipeItemClassName} key={item.name}>
              <Link
                aria-label={item.name}
                className="group flex aspect-[5/3] items-center justify-center rounded-2xl border border-[#fcb6bb] bg-white px-5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                href={item.href}
              >
                {item.logo ? (
                  <span className="relative block h-full w-full">
                    <Image
                      alt={item.logo.alt}
                      className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105 @3xl:p-3"
                      fill
                      sizes="(min-width: 64rem) 12vw, (min-width: 36rem) 25vw, 50vw"
                      src={item.logo.src}
                      unoptimized
                    />
                  </span>
                ) : (
                  // No logo on file: the name, set like a wordmark.
                  <span className="text-center text-sm font-bold leading-tight tracking-tight transition-colors group-hover:text-[var(--button-primary-background,#d90716)]">
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface FacetChipsProps {
  title: string;
  items: Array<{ label: string; href: string; swatch?: string }>;
  /** `dimension`: measurement tiles (arrow brackets around the value) instead of pills. */
  look?: 'pill' | 'dimension';
  /** Follows another row: trims the top padding so the rows read as one block. */
  stacked?: boolean;
  className?: string;
}

// One half of the dimension line: the end bar and the arrow pointing at it. The right half is
// the same drawing mirrored.
function DimensionArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      className={clsx('h-5 w-9 shrink-0', flip && '-scale-x-100')}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.25"
      viewBox="0 0 36 20"
    >
      <path d="M2 2v16" />
      <path d="M11 4.5 5.5 10l5.5 5.5" />
      <path d="M5.5 10H35" />
    </svg>
  );
}

// `24"` reads as `24 in` on the tile, the way a tape measure is written.
const dimensionLabel = (label: string) => label.replace(/\s*(?:"|”|in\.?|inch(?:es)?)$/i, ' in');

export function FacetChips({
  title,
  items,
  look = 'pill',
  stacked = false,
  className,
}: FacetChipsProps) {
  if (items.length === 0) return null;

  return (
    <section className={clsx('@container', className)}>
      <div
        className={clsx(
          containerClassName,
          'pb-8 @4xl:pb-10',
          stacked ? 'pt-0' : 'pt-8 @4xl:pt-10',
        )}
      >
        <h2 className="mb-3 font-heading text-lg font-bold leading-tight @xl:text-xl @4xl:text-[22px]">
          {title}
        </h2>
        <ul className={clsx('flex flex-wrap', look === 'dimension' ? 'gap-3' : 'gap-2')}>
          {items.map((item) =>
            look === 'dimension' ? (
              <li key={item.label}>
                <Link
                  className="flex items-center gap-1.5 rounded-xl border border-contrast-200 bg-white px-4 py-3 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                  href={item.href}
                >
                  <DimensionArrow />
                  <span className="font-heading text-xl font-bold leading-none tracking-tight text-[var(--button-primary-background,#d90716)]">
                    {dimensionLabel(item.label)}
                  </span>
                  <DimensionArrow flip />
                </Link>
              </li>
            ) : (
              <li key={item.label}>
                <Link
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full border border-contrast-200 bg-white py-1.5 pr-3.5 text-sm font-medium transition-colors hover:border-[var(--button-primary-background,#d90716)] hover:text-[var(--button-primary-background,#d90716)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
                    item.swatch ? 'pl-1.5' : 'pl-3.5',
                  )}
                  href={item.href}
                >
                  {item.swatch != null && item.swatch !== '' && (
                    <span
                      aria-hidden
                      className="size-5 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ backgroundColor: item.swatch }}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}
