import { clsx } from 'clsx';
import { ArrowDown, LayoutGrid, Repeat, Truck, WalletMinimal } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Amount, Finance, withCommas } from '@/vibes/soul/sections/cabinet-lines';
import { Link } from '~/components/link';

import { Gallery } from './gallery';
import { HEADER_COPY_CLASS, SpecRow } from './spec-row';

/**
 * Collection detail header shown ABOVE the product grid on a cabinet collection category page
 * (Avon, Dover). Fifty-fifty: the gallery on the left, the decision column on the right — name and
 * program, the overview, the 10×10 price, an expandable Specification, then Shop products beside
 * Order sample. Everything comes from the category's BigCommerce metafields — see
 * lib/cabinets/cabinet-collection.ts.
 */
export interface CabinetSwatch {
  id: string;
  name: string;
  hex?: string;
  image?: string;
  /** URL slug used by ?finish= when finishes are selectable. */
  slug?: string;
  /** Swatch image from the colour master list (shown as-is). */
  swatch?: string;
  /** The finish's door photo — used zoomed-in as the swatch when there's no hex or swatch image
   *  (a whole door is two panels with a white gap, which reads as a line at 20px). */
  photo?: string;
}

export interface CabinetCollectionHeaderData {
  name: string;
  /** Overview HTML — the collection's long copy (replaces the native BC category description). */
  overview?: string;
  /** Gallery image URLs; images[0] is the main image. */
  images?: string[];
  /** Contain (not crop) the main gallery image — used for the contractor door-sample lead. */
  containMainImage?: boolean;
  /** Merch info: line / door style / default finish. */
  line?: string;
  doorStyle?: string;
  defaultFinish?: string;
  /** Attribute selections resolved against the master lists: product line, construction, colors. */
  productLine?: string;
  construction?: string;
  colors?: CabinetSwatch[];
  /** The selected finish name (multi-finish collections); pricing/photos above reflect it. */
  selectedFinish?: string;
  /** "Basic Kitchen Starting" pricing for the shown program. */
  price?: string;
  strikePrice?: string;
  emiText?: string;
  deliveryTime?: string;
  /** Spec-sheet PDF for the shown program. */
  specSheetUrl?: string;
  /** Order-sample link (add-to-cart of the sample product; category link fallback for now). */
  orderSampleHref?: string;
  orderSamplePrice?: string;
}

// Shop products (60%) beside Order sample (40%, black outline, price in regular weight), with the
// free-samples note beneath. Both stay single-line so the row keeps one height.
function Actions({
  data,
  productsHref,
}: {
  data: CabinetCollectionHeaderData;
  productsHref: string;
}) {
  const sampleHref = data.orderSampleHref ?? '';
  const samplePrice = data.orderSamplePrice ?? '';
  const hasSample = sampleHref !== '';

  return (
    <div>
      <div className={clsx('grid gap-2.5', hasSample && '@md:grid-cols-[3fr_2fr]')}>
        <ButtonLink
          className="w-full whitespace-nowrap [&>span]:w-full [&>span]:justify-center"
          href={productsHref}
          shape="pill"
          size="medium"
          variant="primary"
        >
          <span className="inline-flex items-center gap-2">
            Shop products
            <ArrowDown size={17} strokeWidth={2.25} />
          </span>
        </ButtonLink>
        {hasSample && (
          <ButtonLink
            // Same outlined-black treatment as the listing cards (fills black on hover).
            className="w-full whitespace-nowrap !border-[0.5px] border-foreground bg-white text-foreground after:!bg-foreground hover:!text-white [&>span]:w-full [&>span]:justify-center"
            href={sampleHref}
            shape="pill"
            size="medium"
            variant="tertiary"
          >
            <span className="inline-flex items-baseline gap-1.5">
              Order sample
              {samplePrice !== '' && <span className="font-normal">${samplePrice}</span>}
            </span>
          </ButtonLink>
        )}
      </div>
      <p className="mt-2.5 text-xs text-contrast-400">
        First two quarter-door samples free with code FREESAMPLES.
      </p>
    </div>
  );
}

interface Props {
  data: CabinetCollectionHeaderData;
  program?: 'assembled' | 'rta';
  /** Specifications HTML (staff-authored) for the expandable Specification row. */
  specifications?: string;
  /** The same collection in the other program ("Switch to RTA"). */
  switchHref?: string;
  /** When given, finish chips become links (multi-finish collections); null clears the finish. */
  finishHrefFor?: (slug: string | null) => string;
  /** Where "Shop products" scrolls to. */
  productsHref?: string;
  className?: string;
}

const PROGRAM_LABEL = { assembled: 'Assembled', rta: 'RTA' };

// Metafield prices arrive as plain numbers ("3289.55"); show them with thousands separators.
// Finish chips. Display-only on single-finish collections; on multi-finish ones (Prism) each chip
// is a link that sets ?finish= — the price, photos and product grid follow the selection. The
// selected chip gets the brand-red outline (plus aria-current); clicking it again clears.
function Finishes({
  colors = [],
  selected,
  hrefFor,
}: {
  colors?: CabinetSwatch[];
  selected?: string;
  hrefFor?: (slug: string | null) => string;
}) {
  const selectable = hrefFor != null && colors.length > 1;

  // Only multi-finish collections show the chips (as the finish selector); a single finish is
  // already in the collection name and adds nothing here.
  if (!selectable) return null;

  const chipClass =
    'inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs transition-colors';
  const swatch = (c: CabinetSwatch) => {
    // Master-list values come through as '' when unset, so test truthiness, not nullishness.
    const usePhoto = !c.hex && !c.swatch && Boolean(c.photo);
    const image = c.swatch || (usePhoto ? c.photo : undefined);

    return (
      <span
        className="inline-block size-5 rounded-full border border-contrast-100 bg-center"
        style={{
          backgroundColor: c.hex || undefined,
          backgroundImage: image ? `url(${image})` : undefined,
          // Door photo: sample a solid patch of the left panel rather than the whole door.
          backgroundSize: usePhoto ? '400%' : 'cover',
          backgroundPosition: usePhoto ? '22% 50%' : 'center',
        }}
        title={c.name}
      />
    );
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
        Choose a finish
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => {
          const active = selected != null && c.name === selected;

          if (c.slug == null) {
            return (
              <span className={clsx(chipClass, 'border-contrast-100 text-contrast-500')} key={c.id}>
                {swatch(c)}
                {c.name}
              </span>
            );
          }

          return (
            <Link
              aria-current={active ? 'true' : undefined}
              className={clsx(
                chipClass,
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-1',
                // Selected: a hairline (half-pixel on retina) brand-red outline, bold text, aria-current.
                active
                  ? 'border-[0.5px] border-[var(--button-primary-background,#d90716)] font-semibold text-foreground'
                  : 'border-contrast-100 text-contrast-500 hover:border-contrast-300 hover:text-foreground',
              )}
              href={hrefFor(active ? null : c.slug)}
              key={c.id}
            >
              {swatch(c)}
              {c.name}
              {active && <span className="sr-only"> (selected)</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// The 10×10 "basic kitchen" price, in the kitchen card's facts-strip style (pink hairline, blush
// background): price | 10×10 badge | three fact rows (kitchen, finance, lead time). The fixed-list
// disclaimer sits under the strip.
function PriceCard({ data }: { data: CabinetCollectionHeaderData }) {
  const row = 'flex items-center gap-2 py-2 text-sm font-medium leading-snug';
  const icon = 'shrink-0 text-[var(--button-primary-background,#d90716)]';

  return (
    <div>
      <div className="grid grid-cols-1 rounded-xl border border-[#fcb6bb] bg-white text-[#404040] @md:grid-cols-[auto_auto_1fr]">
        {/* Was-price above the deal price. */}
        <div className="flex items-center gap-x-3 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[9px] font-bold leading-none ring-1 ring-[#fcb6bb] @md:hidden">
            10×10
          </span>
          <span className="flex flex-col items-start gap-1">
            {data.strikePrice != null && data.strikePrice !== '' && (
              <span className="leading-none text-[#6b6b6b]">
                <Amount
                  cents={12}
                  formatted={`$${withCommas(data.strikePrice)}`}
                  strike
                  symbol={12}
                  whole={18}
                />
              </span>
            )}
            <span className="font-heading font-bold leading-none text-[var(--button-primary-background,#d90716)]">
              <Amount
                cents={20}
                formatted={`$${withCommas(data.price ?? '')}`}
                symbol={18}
                whole={36}
              />
            </span>
          </span>
        </div>
        <div className="hidden items-center justify-center border-l border-[#fcb6bb] px-5 py-3 @md:flex">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[11px] font-bold leading-none ring-1 ring-[#fcb6bb]">
            10×10
          </span>
        </div>
        {/* Three fact rows with hairlines between them. */}
        <div className="flex flex-col justify-center divide-y divide-[#fcb6bb] border-t border-[#fcb6bb] px-5 py-1.5 @md:border-l @md:border-t-0">
          <div className={row}>
            <LayoutGrid aria-hidden className={icon} size={16} strokeWidth={1.5} />
            <span>{data.name} 10×10 kitchen</span>
          </div>
          {data.emiText != null && data.emiText !== '' && (
            <div className={row}>
              <WalletMinimal aria-hidden className={icon} size={16} strokeWidth={1.5} />
              <Finance cents={10} symbol={11} text={data.emiText} whole={14} />
            </div>
          )}
          {data.deliveryTime != null && data.deliveryTime !== '' && (
            <div className={row}>
              <Truck aria-hidden className={icon} size={16} strokeWidth={1.5} />
              <span>Ships in {data.deliveryTime}</span>
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-[10px] text-contrast-400">
        * The price is based on a fixed list of cabinets that cannot be modified.
      </p>
    </div>
  );
}

export function CabinetCollectionHeader({
  data,
  program = 'assembled',
  specifications,
  switchHref,
  finishHrefFor,
  productsHref = '#products',
  className,
}: Props) {
  const hasPricing = data.price != null && data.price !== '';

  const images = (data.images ?? []).filter((u) => u !== '');
  const other = program === 'rta' ? 'assembled' : 'rta';

  // Only the door style is shown as a chip (Arun, Oct 22 2026): product line and construction stay
  // in the data (listing filter, admin) but not on the collection page.
  const chips = [data.doorStyle].filter((chip): chip is string => Boolean(chip));

  return (
    <div className={clsx('bg-white @container', className)}>
      <div className="mx-auto max-w-screen-2xl px-6 pb-10 pt-4 @xl:px-9 @4xl:px-14 @4xl:pb-14">
        <div className="grid grid-cols-1 gap-8 @3xl:grid-cols-2 @3xl:items-start @3xl:gap-x-14 @4xl:gap-x-20">
          {/* Left: gallery */}
          {images.length > 0 ? (
            <Gallery containMain={data.containMainImage} images={images} name={data.name} />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-contrast-100 p-6 text-center text-2xl font-bold tracking-tighter text-foreground/10">
              {data.name} kitchen
            </div>
          )}

          {/* Right: the decision column */}
          <div className="flex flex-col gap-5">
            {/* The program tag is identification, not a highlight: a small light-grey label sitting
                on the name's baseline, bottom-right. */}
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="m-0 font-heading text-3xl font-bold leading-tight @xl:text-4xl">
                {data.name}
              </h1>
              <span className="rounded-full bg-contrast-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                {PROGRAM_LABEL[program]}
              </span>
            </div>

            {data.overview != null && data.overview !== '' && (
              // Staff-authored HTML (same trust boundary as the native BC category description).
              <div
                // Overview copy shares the specification body style (see spec-row.tsx).
                className={HEADER_COPY_CLASS}

                dangerouslySetInnerHTML={{ __html: data.overview }}
              />
            )}

            {(chips.length > 0 || Boolean(switchHref)) && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      className="rounded-full bg-[#C0EDF6]/50 px-3.5 py-1.5 text-xs font-medium text-foreground"
                      key={chip}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                {Boolean(switchHref) && (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-foreground px-3.5 py-1.5 text-xs font-semibold transition-colors hover:bg-foreground hover:text-white"
                    href={switchHref ?? '#'}
                  >
                    <Repeat size={13} strokeWidth={2.25} />
                    Switch to {PROGRAM_LABEL[other]}
                  </Link>
                )}
              </div>
            )}

            <Finishes colors={data.colors} hrefFor={finishHrefFor} selected={data.selectedFinish} />

            {hasPricing && <PriceCard data={data} />}

            <SpecRow specSheetUrl={data.specSheetUrl} specifications={specifications} />

            <Actions data={data} productsHref={productsHref} />
          </div>
        </div>
      </div>
    </div>
  );
}
