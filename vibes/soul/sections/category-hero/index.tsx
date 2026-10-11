import { clsx } from 'clsx';
import {
  ArrowRight,
  BadgeDollarSign,
  Clock,
  Gift,
  MapPin,
  PackageCheck,
  Phone,
  Tag,
  Truck,
  Undo2,
  Zap,
} from 'lucide-react';
import { type ReactNode } from 'react';

import { homeHeadingClassName, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

const containerClassName = 'mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14';

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
  /** Rendered over the photo, top-right (e.g. the 'Watch the explainer' pill). */
  imageOverlay?: ReactNode;
  className?: string;
}

// Category page header, 50 / 50: the headline and one paragraph on a black panel, the category
// photo beside it. Same rounded panel as the home hero. Stacks on narrow screens (text first).
// Subcategories get the compact version: shorter, dark grey, heading plus a short line.
export function CategoryHero({
  title,
  description,
  image,
  imageLabel,
  actions = [],
  compact = false,
  imageOverlay,
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
                ? 'bg-[#2a2a2a] px-6 py-6 @xl:px-10 @xl:py-7'
                : 'bg-foreground px-6 py-9 @xl:px-10 @xl:py-12',
            )}
          >
            <h1
              className={clsx(
                'm-0 max-w-[26ch] font-heading font-bold leading-tight',
                compact ? 'text-[22px] @xl:text-3xl' : 'text-[26px] @xl:text-4xl',
              )}
            >
              {title}
            </h1>
            {Boolean(description) && (
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-white @xl:text-base">
                {description}
              </p>
            )}
            {actions.length > 0 && (
              <div className={clsx('flex flex-wrap gap-3', compact ? 'mt-4' : 'mt-6')}>
                {actions.map((action, index) => (
                  <Link
                    className={clsx(
                      'inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors',
                      index === 0
                        ? 'bg-white text-foreground hover:bg-neutral-200'
                        : 'border border-white/40 text-white hover:border-white hover:bg-white/10',
                    )}
                    href={action.href}
                    key={action.label}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div
            className={clsx(
              'relative bg-contrast-100',
              compact ? 'min-h-[140px] @3xl:min-h-[190px]' : 'min-h-[200px] @3xl:min-h-[320px]',
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
              <div className="absolute right-4 top-4 @xl:right-5 @xl:top-5">{imageOverlay}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const POINT_ICONS = {
  truck: Truck,
  returns: Undo2,
  stock: PackageCheck,
  clock: Clock,
  pickup: MapPin,
  price: BadgeDollarSign,
  gift: Gift,
  tag: Tag,
  phone: Phone,
  zap: Zap,
};

interface PointsProps {
  points: Array<{ icon: keyof typeof POINT_ICONS; label: string }>;
  fine?: string;
  className?: string;
}

// The row of promises under the hero — stock, delivery, returns — with the small print at the end.
export function CategoryPoints({ points, fine, className }: PointsProps) {
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
        </div>
      </div>
    </section>
  );
}

export interface SubcategoryTile {
  name: string;
  href: string;
  image?: { src: string; alt: string };
}

interface TilesProps {
  title?: string;
  items: SubcategoryTile[];
  className?: string;
}

// "Shop by type" — the category's subcategories as photo tiles with the name beneath; the fastest
// way to narrow before the filters. Renders nothing for a category with no subcategories.
export function SubcategoryTiles({ title = 'Shop by type', items, className }: TilesProps) {
  if (items.length === 0) return null;

  return (
    <section className={clsx('@container', className)}>
      <div className={clsx(containerClassName, 'py-8 @4xl:py-10')}>
        <h2 className={clsx(homeHeadingClassName, 'mb-5 @4xl:mb-6')}>{title}</h2>
        <div className="grid grid-cols-2 gap-4 @lg:grid-cols-3 @3xl:grid-cols-4 @5xl:grid-cols-6 @5xl:gap-5">
          {items.map((item) => (
            <Link
              className="group flex flex-col overflow-hidden rounded-3xl border border-contrast-100 bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
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
                  <MediaPlaceholder label={item.name} />
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
