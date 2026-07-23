import { clsx } from 'clsx';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { Rating } from '../rating';

import { AddToCartCta, ProductCardAddToCartAction } from './add-to-cart-cta';
import { Compare } from './compare';
import { OptionsIcon } from './cta-icons';

export type { ProductCardAddToCartAction } from './add-to-cart-cta';

export interface Product {
  id: string;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  subtitle?: string;
  badge?: string;
  /** Marketing pills (Bestseller / Trending / New) shown top-left on the image. */
  badges?: Array<{ label: string; color: string }>;
  rating?: number;
  inventoryMessage?: string;
  numberOfReviews?: number;
  /** True when the product has required options; the CTA then links to the PDP to choose them. */
  requiresOptions?: boolean;
}

export interface ProductCardProps {
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showCompare?: boolean;
  imagePriority?: boolean;
  imageSizes?: string;
  compareLabel?: string;
  compareParamName?: string;
  /** Direct add-to-cart action; the icon CTA on no-option products fires it. When omitted, even
   *  no-option products fall back to a PDP link. */
  addToCartAction?: ProductCardAddToCartAction;
  product: Product;
  showRating?: boolean;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-card-focus: hsl(var(--primary));
 *   --product-card-light-offset: hsl(var(--background));
 *   --product-card-light-background: hsl(var(--contrast-100));
 *   --product-card-light-title: hsl(var(--foreground));
 *   --product-card-light-subtitle: hsl(var(--foreground) / 75%);
 *   --product-card-light-message: hsl(var(--foreground) / 75%);
 *   --product-card-dark-offset: hsl(var(--foreground));
 *   --product-card-dark-background: hsl(var(--contrast-500));
 *   --product-card-dark-title: hsl(var(--background));
 *   --product-card-dark-subtitle: hsl(var(--background) / 75%);
 *   --product-card-dark-message: hsl(var(--background) / 75%);
 *   --product-card-font-family: var(--font-family-body);
 * }
 * ```
 */
export function ProductCard({
  product: {
    id,
    title,
    subtitle,
    badge,
    badges,
    price,
    image,
    href,
    requiresOptions,
    inventoryMessage,
    rating,
    numberOfReviews,
  },
  showRating = false,
  colorScheme = 'light',
  className,
  showCompare = false,
  aspectRatio = '5:6',
  compareLabel,
  compareParamName,
  addToCartAction,
  imagePriority = false,
  imageSizes = '(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw',
}: ProductCardProps) {
  return (
    <article
      className={clsx(
        // White card with a border wrapping the whole thing, inner padding so content doesn't
        // touch the edge (stands out against the tinted listing-page background). Border darkens
        // slightly on hover.
        'group flex h-full min-w-0 max-w-md flex-col gap-3 rounded-2xl border border-contrast-100 bg-white p-3 font-[family-name:var(--card-font-family,var(--font-family-body))] transition-colors duration-200 hover:border-contrast-200 @container @md:p-4',
        className,
      )}
    >
      <div className="relative flex flex-1 flex-col">
        <div
          className={clsx(
            'relative overflow-hidden rounded-xl @md:rounded-2xl',
            {
              '5:6': 'aspect-[5/6]',
              '3:4': 'aspect-[3/4]',
              '1:1': 'aspect-square',
            }[aspectRatio],
            // White image backdrop (products are shot on white). The border now lives on the whole
            // card, not the image.
            {
              light: 'bg-white',
              dark: 'bg-[var(--product-card-dark-background,hsl(var(--contrast-500)))]',
            }[colorScheme],
          )}
        >
          {image != null ? (
            <Image
              alt={image.alt}
              className={clsx(
                // Contain (show the whole product, not cropped) and scale DOWN on hover.
                'h-full w-full scale-100 select-none object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-95',
                {
                  light: 'bg-[var(--product-card-light-background,hsl(var(--contrast-100))]',
                  dark: 'bg-[var(--product-card-dark-background,hsl(var(--contrast-500))]',
                }[colorScheme],
              )}
              fill
              preload={imagePriority}
              sizes={imageSizes}
              src={image.src}
            />
          ) : (
            <div
              className={clsx(
                'break-words pl-5 pt-5 text-4xl font-bold leading-[0.8] tracking-tighter opacity-25 transition-transform duration-500 ease-out group-hover:scale-105 @xs:text-7xl',
                {
                  light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
                  dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
                }[colorScheme],
              )}
            >
              {title}
            </div>
          )}
          {badge != null && badge !== '' && (
            <Badge className="absolute left-3 top-3" shape="rounded">
              {badge}
            </Badge>
          )}
        </div>
        {/* Marketing pills — positioned against the (non-clipped) card wrapper, NOT the image
            container (which is overflow-hidden and would clip them at the corner). */}
        {badges != null && badges.length > 0 && (
          <div className="absolute left-0 top-0 flex flex-wrap items-start gap-1">
            {badges.map((b) => (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground"
                key={b.label}
                style={{ backgroundColor: b.color }}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-1 flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3">
          <div className="flex w-full flex-1 flex-col text-sm @[16rem]:text-base">
            <span
              className={clsx(
                // Reserve a full 2 lines (min-h) even for 1-line titles so the price and CTA
                // below align across cards in a row.
                'line-clamp-2 block min-h-[2lh] font-semibold',
                {
                  light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
                  dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
                }[colorScheme],
              )}
            >
              {title}
            </span>
            {subtitle != null && subtitle !== '' && (
              <span
                className={clsx(
                  'block text-xs font-normal',
                  // Brand name in light grey, matching the PDP.
                  {
                    light: 'text-contrast-300',
                    dark: 'text-[var(--product-card-dark-subtitle,hsl(var(--background)/75%))]',
                  }[colorScheme],
                )}
              >
                {subtitle}
              </span>
            )}
            {/* Grey divider below the brand name, above the price (margin below the line). */}
            <hr className="mb-3 mt-2 border-t border-contrast-100" />
            {price != null && (
              <PriceLabel
                className="mt-0.5 text-base [&_abbr]:cursor-default [&_abbr]:no-underline @[16rem]:text-lg"
                colorScheme={colorScheme}
                price={price}
                superscript
              />
            )}
            {showRating && typeof rating === 'number' && rating > 0 && (
              <Rating className="mb-2 mt-1" numberOfReviews={numberOfReviews} rating={rating} />
            )}
            <span
              className={clsx(
                'block text-sm font-normal',
                {
                  light: 'text-[var(--product-card-light-message,hsl(var(--foreground)/75%))]',
                  dark: 'text-[var(--product-card-dark-message,hsl(var(--background)/75%))]',
                }[colorScheme],
              )}
            >
              {inventoryMessage}
            </span>
            {href !== '#' && (
              // CTA wrapper: mt-auto pins it to the card bottom so buttons align across a row;
              // pt-2 guarantees a little space above the button even on the tallest card.
              <div className="relative z-10 mt-auto pt-2">
                {requiresOptions === false && addToCartAction != null ? (
                  <AddToCartCta action={addToCartAction} id={id} />
                ) : (
                  <ViewOptionsCta href={href} />
                )}
              </div>
            )}
          </div>
        </div>
        {href !== '#' && (
          <Link
            aria-label={title}
            className={clsx(
              'absolute inset-0 rounded-b-lg rounded-t-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--product-card-focus,hsl(var(--primary)))] focus-visible:ring-offset-4',
              {
                light: 'ring-offset-[var(--product-card-light-offset,hsl(var(--background)))]',
                dark: 'ring-offset-[var(--product-card-dark-offset,hsl(var(--foreground)))]',
              }[colorScheme],
            )}
            href={href}
            id={id}
          >
            <span className="sr-only">View product</span>
          </Link>
        )}
      </div>
      {showCompare && (
        // Smaller compare checkbox + label than the default, with a tighter (less rounded) corner
        // so the small box doesn't read as a circle.
        <div className="ml-1 mt-auto shrink-0 [&_button]:!size-3.5 [&_button]:!rounded-[3px] [&_label]:!text-xs [&_svg]:!size-2.5">
          <Compare
            colorScheme={colorScheme}
            label={compareLabel}
            paramName={compareParamName}
            product={{ id, title, href, image }}
          />
        </div>
      )}
    </article>
  );
}

// Shared CTA button look: pill, red outline / red icon at rest, with the PDP add-to-cart's
// left-to-right slide-fill hover (an ::after that translates in), turning it solid red + white.
const CTA_BUTTON_CLASS =
  'group/cta relative inline-flex min-h-7 items-center justify-center overflow-hidden rounded-full border border-[var(--button-primary-background,hsl(var(--primary)))] bg-transparent text-xs font-semibold tracking-wide text-[var(--button-primary-background,hsl(var(--primary)))] transition-[width] duration-300 ease-out after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:rounded-full after:bg-[var(--button-primary-background,hsl(var(--primary)))] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:text-white hover:after:translate-x-0';

/**
 * "View Options" CTA for products with required options: a red-outline circle with an options
 * icon that expands on hover to reveal the label (desktop). On touch/small screens (no hover) the
 * label is always shown, so it's never a bare, ambiguous icon. Links to the PDP to choose options.
 */
function ViewOptionsCta({ href }: { href: string }) {
  return (
    <Link
      aria-label="See options"
      // A perfect 36px circle at rest (fixed h-9, min-w-9, no horizontal padding — the icon-only
      // content makes it exactly square). On hover — and always on touch (max-lg) — horizontal
      // padding appears and the label expands, so it grows into a pill.
      className={clsx(
        CTA_BUTTON_CLASS,
        // hover:px-4 (not group-hover) — the padding is on the button itself, which can't be
        // targeted by its own group-hover. max-lg keeps it padded on touch.
        'h-7 min-w-7 hover:px-3.5 max-lg:px-3.5',
      )}
      href={href}
    >
      <OptionsIcon className="size-5 shrink-0" />
      {/* Label: collapsed on desktop until hover; always open on touch (max-lg). Slightly smaller
          than the base text; a small icon-to-label gap so both clear the padded edges. */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] transition-[max-width,margin,opacity] duration-300 ease-out group-hover/cta:ml-1.5 group-hover/cta:max-w-[12rem] group-hover/cta:opacity-100 max-lg:ml-1.5 max-lg:max-w-[12rem] max-lg:opacity-100 lg:opacity-0">
        See options
      </span>
    </Link>
  );
}

export function ProductCardSkeleton({
  className,
  aspectRatio = '5:6',
}: Pick<ProductCardProps, 'className' | 'aspectRatio'>) {
  return (
    <Skeleton.Root className={clsx(className)}>
      <Skeleton.Box
        className={clsx(
          'rounded-[var(--product-card-border-radius,1rem)]',
          {
            '5:6': 'aspect-[5/6]',
            '3:4': 'aspect-[3/4]',
            '1:1': 'aspect-square',
          }[aspectRatio],
        )}
      />
      <div className="mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @2xl:flex-row">
        <div className="w-full text-sm @[16rem]:text-base">
          <Skeleton.Text characterCount={10} className="rounded" />
          <Skeleton.Text characterCount={8} className="rounded" />
          <Skeleton.Text characterCount={6} className="rounded" />
        </div>
      </div>
    </Skeleton.Root>
  );
}
