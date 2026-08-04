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
  /** Marketing pills (Bestseller / Trending / New / Sale) shown top-left on the image.
   *  `textColor` overrides the default dark text (used by the solid-red Sale pill for white text). */
  badges?: Array<{ label: string; color: string; textColor?: string }>;
  /** Sale percentage from the __sale custom field; drives the top-right "UP TO N% OFF" blurb. */
  salePercent?: number;
  /** Delivery/pickup message from the __delivery custom field; shown after the price. */
  deliveryMessage?: string;
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
    salePercent,
    deliveryMessage,
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
                style={{ backgroundColor: b.color, color: b.textColor }}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Sale blurb — top-right, driven by the __sale custom field (percentage). Placeholder red
            disc for now; will be replaced with the supplied SVG shape. "UP TO / N% / OFF" in 3 lines. */}
        {typeof salePercent === 'number' && salePercent > 0 && (
          <div className="absolute right-0 top-0 flex size-[52px] flex-col items-center justify-center rounded-full bg-[var(--pill-sale-background,#d90716)] text-center leading-none text-[var(--pill-sale-text,#fff)] @md:size-[58px]">
            <span className="text-[7px] font-semibold uppercase tracking-wide">Up to</span>
            <span className="text-[15px] font-bold @md:text-base">{salePercent}%</span>
            <span className="text-[7px] font-semibold uppercase tracking-wide">Off</span>
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
            {/* Delivery/pickup message from the __delivery custom field — after the price, with the
                delivery icon (brand color, 1.3x). Blue text like the PDP trust links (no hover
                underline here — the whole card is the link, so a text underline would trigger on
                any card hover, which looks wrong). */}
            {deliveryMessage != null && deliveryMessage !== '' && (
              <span className="mt-1 flex items-center gap-1.5 text-xs">
                <svg
                  className="size-[1.3rem] shrink-0"
                  fill="none"
                  height="21"
                  viewBox="0 0 24 24"
                  width="21"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.15933 17.8214C5.93537 17.5975 5.76685 17.3502 5.65377 17.0795C5.45715 16.6089 5.06731 16.1786 4.55728 16.1786H3.98647C3.68999 16.1786 3.46946 15.9045 3.53296 15.6149C3.57967 15.4018 3.76837 15.25 3.98647 15.25H5.04531C5.45217 15.25 5.8014 14.9874 6.05989 14.6732C6.19267 14.5118 6.34963 14.3686 6.53076 14.2437C6.90451 13.986 7.32832 13.8571 7.8022 13.8571C8.27609 13.8571 8.6999 13.986 9.07365 14.2437C9.25478 14.3686 9.41174 14.5118 9.54452 14.6732C9.80301 14.9874 10.1522 15.25 10.5591 15.25H14.1736L16.213 6.42857H6.13859C6.09084 6.42857 6.05556 6.38406 6.06647 6.33757C6.11166 6.0946 6.2292 5.89426 6.4191 5.73655C6.60899 5.57885 6.83309 5.5 7.09138 5.5H16.1159C16.7592 5.5 17.2352 6.09864 17.0902 6.7254L16.9053 7.5246C16.7603 8.15136 17.2362 8.75 17.8795 8.75H18.0523C18.367 8.75 18.6634 8.8982 18.8523 9.15002L20.8027 11.7508C20.9729 11.9777 21.0387 12.2662 20.9838 12.5444L20.36 15.7044C20.3056 15.98 20.064 16.1786 19.7831 16.1786C19.4584 16.1786 19.2045 16.4459 19.1269 16.7612C19.029 17.1591 18.8255 17.5125 18.5165 17.8214C18.0642 18.2738 17.5165 18.5 16.8737 18.5C16.2308 18.5 15.6831 18.2738 15.2308 17.8214C15.0263 17.617 14.868 17.393 14.756 17.1496C14.525 16.6479 14.1045 16.1786 13.5522 16.1786H11.1236C10.5713 16.1786 10.1508 16.6479 9.91989 17.1496C9.80784 17.393 9.64957 17.617 9.44508 17.8214C8.99271 18.2738 8.44509 18.5 7.8022 18.5C7.15932 18.5 6.6117 18.2738 6.15933 17.8214ZM15.8753 11.934C15.7293 12.5611 16.2053 13.1607 16.8492 13.1607H19.363C19.6806 13.1607 19.954 12.9363 20.0159 12.6248C20.0527 12.4396 20.0092 12.2475 19.8961 12.0963L18.388 10.0797C18.1992 9.82722 17.9024 9.67857 17.5871 9.67857H17.1943C16.7293 9.67857 16.3257 9.99901 16.2203 10.4518L15.8753 11.934ZM15.988 7.359L16.213 6.42857L14.1736 15.25L14.3985 14.3196L15.1344 11.0733L15.988 7.359ZM2.98607 12.9267C2.68401 12.9267 2.46238 12.6429 2.53564 12.3498C2.58731 12.1431 2.77302 11.9981 2.98606 11.9981H6.18961C6.49166 11.9981 6.71329 12.282 6.64003 12.575C6.58836 12.7817 6.40266 12.9267 6.18961 12.9267H2.98607ZM4.84321 9.68043C4.54116 9.68043 4.31953 9.39657 4.39278 9.10354C4.44446 8.89685 4.63016 8.75186 4.84321 8.75186H8.97533C9.27738 8.75186 9.49901 9.03572 9.42575 9.32875C9.37408 9.53543 9.18837 9.68043 8.97533 9.68043H4.84321ZM7.8022 17.5714C8.18431 17.5714 8.51202 17.4349 8.78533 17.1617C9.05848 16.8884 9.19506 16.5607 9.19506 16.1786C9.19506 15.7965 9.05848 15.4688 8.78533 15.1954C8.51202 14.9223 8.18431 14.7857 7.8022 14.7857C7.4201 14.7857 7.09239 14.9223 6.81908 15.1954C6.54592 15.4688 6.40935 15.7965 6.40935 16.1786C6.40935 16.5607 6.54592 16.8884 6.81908 17.1617C7.09239 17.4349 7.4201 17.5714 7.8022 17.5714ZM16.8737 17.5714C17.2558 17.5714 17.5835 17.4349 17.8568 17.1617C18.1299 16.8884 18.2665 16.5607 18.2665 16.1786C18.2665 15.7965 18.1299 15.4688 17.8568 15.1954C17.5835 14.9223 17.2558 14.7857 16.8737 14.7857C16.4915 14.7857 16.1638 14.9223 15.8905 15.1954C15.6174 15.4688 15.4808 15.7965 15.4808 16.1786C15.4808 16.5607 15.6174 16.8884 15.8905 17.1617C16.1638 17.4349 16.4915 17.5714 16.8737 17.5714Z"
                    fill="#FA9AA1"
                  />
                </svg>
                <span className="font-normal text-[#2162a1]">{deliveryMessage}</span>
              </span>
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
