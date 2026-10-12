import { clsx } from 'clsx';
import { Truck, WalletMinimal } from 'lucide-react';

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
  /** Fit the cover with object-contain instead of object-cover (used for the contractor door-sample
   *  cover, which shouldn't be cropped). */
  containCover?: boolean;
  /** Second gallery image (e.g. door sample) — revealed on hover, bottom-right, sliding up. */
  hoverImage?: { src: string; alt: string };
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
  /** "New to RTA? Watch the explainer" — the guided page for this program. */
  explainerHref?: string;
  className?: string;
}

export function CabinetLines({
  title,
  description,
  program = 'assembled',
  lines,
  explainerHref,
  className,
}: Props) {
  return (
    <div className={clsx('bg-[#f9fafd] @container', className)}>
      <div className="mx-auto max-w-screen-2xl px-6 pb-12 pt-6 @xl:px-9 @4xl:px-14">
        {(Boolean(title) || Boolean(description) || Boolean(explainerHref)) && (
          <div className="mb-8 flex flex-wrap items-end justify-end gap-x-8 gap-y-4">
            <div className="mr-auto max-w-3xl empty:hidden">
              {Boolean(title) && (
                <h1 className="font-heading text-3xl font-medium leading-tight @lg:text-4xl @2xl:text-5xl">
                  {title}
                </h1>
              )}
              {Boolean(description) && (
                <p className="mt-3 text-sm leading-relaxed text-contrast-500 @xl:text-base">
                  {description}
                </p>
              )}
            </div>
            {Boolean(explainerHref) && (
              <Link
                className="inline-flex items-center gap-1.5 rounded-full border border-contrast-200 bg-white px-4 py-2 text-sm text-contrast-500 transition-colors hover:border-foreground hover:text-foreground"
                href={explainerHref ?? '#'}
              >
                New to {program === 'rta' ? 'RTA' : 'assembled'}?
                <span className="font-semibold text-foreground">Watch the explainer ▶</span>
              </Link>
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

// Exported so other sections (e.g. the home page's best-sellers grid) can reuse the exact card.
export function CabinetLineCard({ line }: { line: CabinetLine }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-contrast-100 bg-white transition-colors duration-200 @container hover:border-contrast-200">
      {/* Image (whole card links to the category page). Neutral placeholder when the category has no
          image (Avon/Dover currently don't). */}
      <Link
        aria-label={line.name}
        className="relative block aspect-[16/11] overflow-hidden bg-contrast-100"
        href={line.href}
      >
        {line.image ? (
          <Image
            alt={line.image.alt}
            className={`h-full w-full transition-transform duration-500 ease-out group-hover:scale-105 ${
              line.containCover ? 'object-contain p-4' : 'object-cover'
            }`}
            fill
            sizes="(min-width: 56rem) 33vw, (min-width: 36rem) 50vw, 100vw"
            src={line.image.src}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="px-4 text-center text-2xl font-bold leading-snug tracking-tighter text-contrast-400 @xs:text-4xl">
              {line.name}
            </span>
          </div>
        )}

        {/* Door-sample reveal: hidden bottom-right, slides up + fades in on card hover. */}
        {line.hoverImage && (
          <div className="pointer-events-none absolute bottom-3 right-3 w-1/3 max-w-[8rem] translate-y-[130%] overflow-hidden rounded-lg border-2 border-white opacity-0 shadow-lg transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <div className="relative aspect-square">
              <Image
                alt={line.hoverImage.alt}
                className="h-full w-full object-cover"
                fill
                sizes="128px"
                src={line.hoverImage.src}
                unoptimized
              />
            </div>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        {/* Collection in black, the finish (any words after the first) in brand red, all caps. */}
        <h2 className="font-heading text-[23px] font-bold uppercase leading-tight">
          <Link className="transition-colors hover:text-contrast-500" href={line.href}>
            <LineName name={line.name} />
          </Link>
        </h2>

        {/* The facts strip, sized from the live landing page's price grid: current price, was-price,
            finance and lead time in one bordered row. Two of its colours failed WCAG on the pink
            (was-price #d4d4d4, finance #f9858d) and are replaced with #6b6b6b and brand red. */}
        {hasFacts(line) && (
          <>
            <p className="mt-4 text-[0.583rem] font-semibold tracking-wide text-[#6b6b6b]">
              10x10 Kitchen starting
            </p>
            {/* Two cells: the price (and was-price) on the left; on the right the finance line and
                the ship line, stacked and left-aligned. Stacks top/bottom on narrow screens. */}
            <div className="mt-1.5 grid grid-cols-1 rounded-xl border border-[#fcb6bb] bg-[#fdf8f8] text-[#404040] @[26rem]:grid-cols-[1fr_auto]">
              {line.price != null && line.price !== '' && (
                <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 px-[13px] py-3">
                  <span className="font-heading font-bold leading-none text-[var(--button-primary-background,#d90716)]">
                    <Amount
                      cents={17}
                      formatted={`$${withCommas(line.price)}`}
                      symbol={15}
                      whole={28}
                    />
                  </span>
                  {line.strikePrice != null && line.strikePrice !== '' && (
                    <span className="leading-none text-[#6b6b6b]">
                      <Amount
                        cents={12}
                        formatted={`$${withCommas(line.strikePrice)}`}
                        strike
                        symbol={12}
                        whole={18}
                      />
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-col justify-center gap-1.5 border-t border-[#fcb6bb] px-[13px] py-2.5 @[26rem]:border-l @[26rem]:border-t-0 @[26rem]:px-4">
                {line.emiText != null && line.emiText !== '' && (
                  <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium leading-none">
                    <WalletMinimal
                      aria-hidden
                      className="shrink-0 text-[var(--button-primary-background,#d90716)]"
                      size={16}
                      strokeWidth={1.5}
                    />
                    <Finance text={line.emiText} />
                  </div>
                )}
                {line.deliveryTime != null && line.deliveryTime !== '' && (
                  <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium leading-none">
                    <Truck
                      aria-hidden
                      className="shrink-0 text-[var(--button-primary-background,#d90716)]"
                      size={16}
                      strokeWidth={1.5}
                    />
                    <span>Ships {line.deliveryTime}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* CTAs pinned to the card bottom so they align across the row. Shop is the brand red;
            Order sample is outlined black and fills black on hover (the same slide as every button). */}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <ButtonLink href={line.href} shape="pill" size="small" variant="primary">
            Shop Now
          </ButtonLink>
          <ButtonLink
            className="!border-[0.5px] border-foreground bg-white text-foreground after:!bg-foreground hover:!text-white"
            href={line.orderSampleHref ?? line.href}
            shape="pill"
            size="small"
            variant="tertiary"
          >
            Order Sample
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

function hasFacts(line: CabinetLine): boolean {
  return [line.price, line.emiText, line.deliveryTime].some((v) => v != null && v !== '');
}

// A price as the landing page sets it: small symbol, big dollars, raised cents, each at its own
// pixel size. Falls back to the raw string when it isn't <symbol><whole>.<cents>.
function Amount({
  formatted,
  symbol,
  whole,
  cents,
  strike = false,
}: {
  formatted: string;
  symbol: number;
  whole: number;
  cents: number;
  /** Strike each piece (a decoration on the wrapper doesn't reach into an inline-flex). */
  strike?: boolean;
}) {
  const match = /^(\D*)(\d[\d,]*)(?:[.,](\d+))?(\D*)$/.exec(formatted);

  if (!match) return formatted;

  const [, sym, dollars, cent, suffix] = match;
  const piece = clsx('leading-none', strike && 'line-through');

  return (
    <span aria-label={formatted} className="inline-flex items-start">
      {Boolean(sym) && (
        <span className={piece} style={{ fontSize: symbol }}>
          {sym}
        </span>
      )}
      <span className={piece} style={{ fontSize: whole }}>
        {dollars}
      </span>
      {Boolean(cent) && (
        <span className={piece} style={{ fontSize: cents }}>
          {cent}
        </span>
      )}
      {suffix || null}
    </span>
  );
}

// "Avon" → AVON; "Derry Stratus" → DERRY + STRATUS in red. The first word is the collection, the
// rest the finish.
function LineName({ name }: { name: string }) {
  const [collection, ...finish] = name.trim().split(/\s+/);

  return (
    <>
      {collection}
      {finish.length > 0 && (
        <>
          {' '}
          <span className="text-[var(--button-primary-background,#d90716)]">
            {finish.join(' ')}
          </span>
        </>
      )}
    </>
  );
}

// "As Low As $50.73/Month" → the words on one line, the amount and its suffix on the next, at the
// landing page's sizes. Anything that doesn't fit that shape renders as given.
function Finance({ text }: { text: string }) {
  const match = /^(.*?)\s*(\$[\d,]+(?:\.\d+)?)(.*)$/.exec(text);

  if (!match) return text;

  const [, label, amount, suffix] = match;

  return (
    <span className="inline-flex items-baseline gap-1">
      {Boolean(label) && <span>{label}</span>}
      <span className="inline-flex items-start">
        <Amount cents={8} formatted={amount ?? ''} symbol={10} whole={11} />
        {suffix}
      </span>
    </span>
  );
}

// Add thousands separators to a raw price string ("3289.55" -> "3,289.55"). Preserves the cents and
// is a no-op if the value already has commas.
function withCommas(value: string): string {
  const [whole = '', cents] = value.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return cents != null ? `${grouped}.${cents}` : grouped;
}
