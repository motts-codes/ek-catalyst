import { clsx } from 'clsx';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Price } from '@/vibes/soul/primitives/price-label';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Link } from '~/components/link';

import { Rating } from '../rating';

import { AddToCartCta, CTA_BUTTON_CLASS, ProductCardAddToCartAction } from './add-to-cart-cta';
import { Compare } from './compare';
import { DeliveryLine } from './delivery-line';
import { cardSwatchOption, optionsCtaLabel, type RequiredOption } from './options';
import { SwatchAddToCart } from './options-cta';
import {
  CardImage,
  CardLink,
  CardPrice,
  CardVariantProvider,
  type CardVariants,
} from './variant-context';

export type { CardVariants } from './variant-context';

export type { RequiredOption } from './options';

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
  /** A short spec line under the title (cabinets: "2 doors · 1 shelf · 1 drawer"). */
  specLine?: string;
  rating?: number;
  inventoryMessage?: string;
  numberOfReviews?: number;
  /** True when the product has required options; the CTA then links to the PDP to choose them. */
  requiresOptions?: boolean;
  /** The required options themselves (names, swatch colours): swatches on the card or the CTA label. */
  requiredOptions?: RequiredOption[];
  /** Per swatch value: that variant's photo, price and purchasability (swaps in on the card). */
  cardVariants?: CardVariants;
  /** Quoted, not carted (countertops): "Request a quote" CTA, no delivery line. */
  quoteOnly?: boolean;
  /** Unit shown after the price, e.g. "sq. ft.". */
  priceUnit?: string;
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
  /** Where a quote-only product's CTA goes. Defaults to the product page's quote form; listing
   *  pages that render the form themselves pass their in-page anchor. */
  quoteHref?: string;
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
    specLine,
    badge,
    badges,
    salePercent,
    deliveryMessage,
    price,
    image,
    href,
    requiresOptions,
    requiredOptions,
    cardVariants,
    quoteOnly = false,
    priceUnit,
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
  quoteHref,
  imagePriority = false,
  imageSizes = '(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw',
}: ProductCardProps) {
  return (
    <article
      className={clsx(
        // Same shape as the home card: no card chrome at rest, the photo on its own white panel
        // and the copy straight on the page below it. On hover the whole card turns white, lifts
        // and picks up the category tiles' soft shadow, so it reads as one object.
        'group flex h-full min-w-0 max-w-md flex-col rounded-2xl font-[family-name:var(--card-font-family,var(--font-family-body))] transition-[transform,box-shadow,background-color] duration-300 ease-out @container hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]',
        className,
      )}
    >
      <CardVariantProvider
        initial={
          cardSwatchOption(requiredOptions)?.swatches?.find((s) => s.isDefault)?.id ??
          cardSwatchOption(requiredOptions)?.swatches?.[0]?.id
        }
        optionId={cardSwatchOption(requiredOptions)?.id}
        variants={cardVariants}
      >
        <div className="relative flex flex-1 flex-col">
          <div
            className={clsx(
              'relative overflow-hidden rounded-2xl',
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
              <CardImage
                alt={image.alt}
                className={clsx(
                  // Contain (show the whole product, not cropped) and scale DOWN on hover.
                  'h-full w-full scale-100 select-none object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-95',
                  {
                    light: 'bg-[var(--product-card-light-background,hsl(var(--contrast-100))]',
                    dark: 'bg-[var(--product-card-dark-background,hsl(var(--contrast-500))]',
                  }[colorScheme],
                )}
                preload={imagePriority}
                sizes={imageSizes}
                src={image.src}
              />
            ) : (
              <div
                className={clsx(
                  'break-words pl-5 pt-5 text-2xl font-bold leading-snug tracking-tighter opacity-10 transition-transform duration-500 ease-out group-hover:scale-105 @xs:text-4xl',
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

          <div className="flex flex-1 flex-col items-start gap-x-4 gap-y-3 px-4 pb-3 pt-3 @xs:pt-4">
            <div className="flex w-full flex-1 flex-col text-sm @[16rem]:text-base">
              <span
                className={clsx(
                  // Reserve a full 3 lines (min-h) even for short titles so the brand, price and
                  // CTA below align across cards in a row.
                  'line-clamp-3 min-h-[3lh] font-semibold',
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
                    // Brand name in grey (contrast-400 is the lightest grey that passes AA at 12px).
                    {
                      light: 'text-contrast-400',
                      dark: 'text-[var(--product-card-dark-subtitle,hsl(var(--background)/75%))]',
                    }[colorScheme],
                  )}
                >
                  {subtitle}
                </span>
              )}
              {specLine != null && specLine !== '' && (
                <span
                  className={clsx(
                    'mt-1 block text-xs font-normal',
                    {
                      light: 'text-contrast-500',
                      dark: 'text-[var(--product-card-dark-subtitle,hsl(var(--background)/75%))]',
                    }[colorScheme],
                  )}
                >
                  {specLine}
                </span>
              )}
              {/* Grey divider below the brand name, above the price (margin below the line). */}
              <hr className="mb-3 mt-2 border-t border-contrast-100" />
              <CardPrice colorScheme={colorScheme} price={price} unit={priceUnit} />
              <DeliveryLine message={deliveryMessage} />
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
                <div className="relative z-10 mt-auto pt-3">
                  <CardCta
                    addToCartAction={addToCartAction}
                    href={href}
                    id={id}
                    quoteHref={quoteHref}
                    quoteOnly={quoteOnly}
                    requiredOptions={requiredOptions}
                    requiresOptions={requiresOptions}
                  />
                </div>
              )}
            </div>
          </div>
          {href !== '#' && (
            <CardLink
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
            </CardLink>
          )}
        </div>
        {showCompare && (
          // Smaller compare checkbox + label than the default, with a tighter (less rounded) corner
          // so the small box doesn't read as a circle.
          <div className="mx-4 mt-auto shrink-0 pb-3 [&_button]:!size-3.5 [&_button]:!rounded-[3px] [&_label]:!text-xs [&_svg]:!size-2.5">
            <Compare
              colorScheme={colorScheme}
              label={compareLabel}
              paramName={compareParamName}
              product={{ id, title, href, image }}
            />
          </div>
        )}
      </CardVariantProvider>
    </article>
  );
}

// The card's one CTA: "Request a quote" for quote-only products; "Add to Cart" for products
// without options (when the action is wired); swatches + "Add to Cart" for a single small swatch
// option; otherwise "Choose size / finish / options" to the product page.
export function CardCta({
  quoteOnly,
  quoteHref,
  href,
  id,
  requiresOptions,
  requiredOptions,
  addToCartAction,
}: {
  quoteOnly: boolean;
  quoteHref?: string;
  href: string;
  id: string;
  requiresOptions?: boolean;
  requiredOptions?: RequiredOption[];
  addToCartAction?: ProductCardAddToCartAction;
}) {
  if (quoteOnly) {
    return (
      <Link className={CTA_BUTTON_CLASS} href={quoteHref ?? `${href}#request-a-quote`}>
        Request a quote
      </Link>
    );
  }

  if (requiresOptions === false && addToCartAction != null) {
    return <AddToCartCta action={addToCartAction} id={id} />;
  }

  const swatchOption = cardSwatchOption(requiredOptions);

  if (swatchOption != null && addToCartAction != null) {
    return <SwatchAddToCart action={addToCartAction} id={id} option={swatchOption} />;
  }

  return <ViewOptionsCta href={href} label={optionsCtaLabel(requiredOptions)} />;
}

// The link to the product page for products whose options can't be chosen on the card, labelled
// with what there is to choose ("Choose size"); the same outline pill as "Add to Cart". On a
// narrow card (two-up on phones) the specific label would wrap, so it reads "Choose options".
function ViewOptionsCta({ href, label }: { href: string; label: string }) {
  return (
    <Link className={CTA_BUTTON_CLASS} href={href}>
      <span className="@[14rem]:hidden">Choose options</span>
      <span className="hidden @[14rem]:inline">{label}</span>
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
