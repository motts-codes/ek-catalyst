import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

/**
 * One cabinet line/finish card (e.g. Avon, Dover). Data comes from the child category's BigCommerce
 * metafields (pricing_10x10 / fulfillment / sample) for the selected program (Assembled or RTA) —
 * see the category page's cabinet-lines data path.
 */
export interface CabinetLine {
  entityId: number;
  name: string;
  /** Category page URL, e.g. /cabinets/avon/ */
  href: string;
  image?: { src: string; alt: string };
  /** "Basic Kitchen Starting" price for the selected program. */
  price?: string;
  /** Strikethrough / was-price. */
  strikePrice?: string;
  /** e.g. "As Low As $46.16/Month". */
  emiText?: string;
  /** Delivery promise for the program, e.g. "3 Weeks". */
  deliveryTime?: string;
  /** Order-sample link (falls back to the category page when absent). */
  orderSampleHref?: string;
}

interface Props {
  title?: string;
  description?: string;
  /** Which program these prices/delivery represent — drives the heading and lets the RTA page reuse
   *  this section with the same shape. */
  program?: 'assembled' | 'rta';
  lines: CabinetLine[];
  className?: string;
}

export function CabinetLines({ title, description, lines, className }: Props) {
  return (
    <div className={clsx('bg-[#f9fafd] @container', className)}>
      <div className="mx-auto max-w-screen-2xl px-4 pb-12 pt-6 @xl:px-6 @4xl:px-8">
        {(title || description) && (
          <div className="mb-8 max-w-3xl">
            {title && (
              <h1 className="font-heading text-3xl font-medium leading-tight @lg:text-4xl @2xl:text-5xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-3 text-sm leading-relaxed text-contrast-500 @xl:text-base">
                {description}
              </p>
            )}
          </div>
        )}

        {lines.length === 0 ? (
          <p className="text-contrast-500">No cabinet lines found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
            {lines.map((line) => (
              <CabinetLineCard key={line.entityId} line={line} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CabinetLineCard({ line }: { line: CabinetLine }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-contrast-100 bg-white transition-colors duration-200 hover:border-contrast-200">
      {/* Image (whole card links to the category page). Neutral placeholder when the category has no
          image (Avon/Dover currently don't). */}
      <Link aria-label={line.name} className="relative block aspect-[4/3] overflow-hidden bg-contrast-100" href={line.href}>
        {line.image ? (
          <Image
            alt={line.image.alt}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            fill
            sizes="(min-width: 56rem) 33vw, (min-width: 36rem) 50vw, 100vw"
            src={line.image.src}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="px-4 text-center text-2xl font-bold leading-snug tracking-tighter text-foreground opacity-10 @xs:text-4xl">
              {line.name}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-heading text-xl font-medium leading-tight">
          <Link className="hover:text-[#2162a1]" href={line.href}>
            {line.name}
          </Link>
        </h2>

        {/* "Basic Kitchen Starting" pricing block. */}
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-contrast-400">
          Basic Kitchen Starting
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          {line.price != null && line.price !== '' && (
            <span className="text-2xl font-semibold">${line.price}</span>
          )}
          {line.strikePrice != null && line.strikePrice !== '' && (
            <span className="text-sm text-contrast-400 line-through">${line.strikePrice}</span>
          )}
        </div>
        {line.emiText != null && line.emiText !== '' && (
          <p className="mt-0.5 text-xs text-contrast-500">{line.emiText}</p>
        )}

        {line.deliveryTime != null && line.deliveryTime !== '' && (
          <p className="mt-2 text-sm text-contrast-500">
            Ships: <span className="font-medium text-foreground">{line.deliveryTime}</span>
          </p>
        )}

        {/* CTAs pinned to the card bottom so they align across the row. */}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <ButtonLink href={line.href} shape="pill" size="small" variant="primary">
            Shop Now
          </ButtonLink>
          <ButtonLink
            href={line.orderSampleHref ?? line.href}
            shape="pill"
            size="small"
            variant="secondary"
          >
            Order Sample
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
