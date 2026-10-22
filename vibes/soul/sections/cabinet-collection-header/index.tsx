import { clsx } from 'clsx';
import { ArrowDown, Download, Plus, Repeat } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { DeliveryTruckIcon } from '@/vibes/soul/primitives/icons/delivery-truck';
import { Link } from '~/components/link';

import { Gallery } from './gallery';

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

// Expandable Specification with the spec-sheet download on the same row. With no specification
// copy, just the download link; with neither, nothing.
function SpecRow({
  specifications = '',
  specSheetUrl = '',
}: {
  specifications?: string;
  specSheetUrl?: string;
}) {
  const specSheetLink = specSheetUrl !== '' && (
    <a
      className="inline-flex min-h-6 items-center gap-1.5 py-1 text-sm font-semibold underline underline-offset-4 hover:text-[var(--button-primary-background,#d90716)]"
      href={specSheetUrl}
      rel="noreferrer"
      target="_blank"
    >
      <Download size={15} strokeWidth={2} />
      Download spec sheet
    </a>
  );

  if (specifications === '') return specSheetLink || null;

  // The download link sits beside the summary visually but outside <details>, so the summary has
  // no focusable descendant.
  return (
    <div className="relative border-y border-contrast-100">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 py-4 pr-48 font-heading text-lg font-semibold [&::-webkit-details-marker]:hidden">
          <Plus
            className="transition-transform duration-300 group-open:rotate-45"
            size={18}
            strokeWidth={2}
          />
          Specification
        </summary>
        <div
          className="prose prose-sm max-w-none pb-5 text-contrast-500 [&_a]:text-[#2162a1] [&_li]:my-1 [&_table]:w-full [&_td]:border [&_td]:border-contrast-100 [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-contrast-100 [&_th]:px-3 [&_th]:py-1.5 [&_ul]:list-disc [&_ul]:pl-5"

          dangerouslySetInnerHTML={{ __html: specifications }}
        />
      </details>
      {Boolean(specSheetLink) && <div className="absolute right-0 top-3.5">{specSheetLink}</div>}
    </div>
  );
}

// Shop products (70%) beside Order sample (30%), with the free-samples note beneath.
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
      <div className={clsx('grid gap-2.5', hasSample && '@md:grid-cols-[7fr_3fr]')}>
        <ButtonLink
          className="w-full [&>span]:w-full [&>span]:justify-center"
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
            className="w-full [&>span]:w-full [&>span]:justify-center"
            href={sampleHref}
            shape="pill"
            size="medium"
            variant="secondary"
          >
            {samplePrice === '' ? 'Order sample' : `Order sample $${samplePrice}`}
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
const formatPrice = (value = '') => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

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

// The 10×10 "basic kitchen" price for the shown program, with its fixed-list disclaimer.
function PriceCard({
  data,
  program,
}: {
  data: CabinetCollectionHeaderData;
  program: 'assembled' | 'rta';
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-3xl border border-contrast-100 bg-[#f9fafd] p-5 @xl:p-6">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[11px] font-bold leading-none ring-1 ring-contrast-100">
        10×10
      </span>
      <div className="min-w-[12rem] flex-1">
        <p className="font-heading text-lg font-semibold leading-tight">
          {data.name} 10×10 kitchen
        </p>
        <p className="mt-1 text-xs leading-relaxed text-contrast-400">
          The price is based on a fixed list of cabinets that cannot be modified.
        </p>
      </div>
      <div className="@xl:text-right">
        <p className="flex items-baseline gap-2 @xl:justify-end">
          <span className="font-heading text-3xl font-bold leading-none">
            ${formatPrice(data.price)}
          </span>
          {data.strikePrice != null && data.strikePrice !== '' && (
            <span className="text-sm text-contrast-400 line-through">
              ${formatPrice(data.strikePrice)}
            </span>
          )}
        </p>
        {data.emiText != null && data.emiText !== '' && (
          <p className="mt-1 text-xs text-contrast-500">{data.emiText}</p>
        )}
        {data.deliveryTime != null && data.deliveryTime !== '' && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-contrast-500 @xl:justify-end">
            <DeliveryTruckIcon />
            <span>
              {PROGRAM_LABEL[program]} · ships in{' '}
              <span className="font-medium text-foreground">{data.deliveryTime}</span>
            </span>
          </p>
        )}
      </div>
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
                // Overview copy: 13px on phones, 14px from tablet up, 150% line-height.
                className="prose max-w-none text-[13px] leading-[1.5] text-contrast-500 @xl:text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-[#2162a1] [&_li]:my-1 [&_p]:my-2 [&_p]:leading-[1.5] [&_ul]:list-disc [&_ul]:pl-5"

                dangerouslySetInnerHTML={{ __html: data.overview }}
              />
            )}

            {(chips.length > 0 || Boolean(switchHref)) && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      className="rounded-full bg-[#C0EDF6] px-3.5 py-1.5 text-xs font-medium text-foreground"
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

            {hasPricing && <PriceCard data={data} program={program} />}

            <SpecRow specSheetUrl={data.specSheetUrl} specifications={specifications} />

            <Actions data={data} productsHref={productsHref} />
          </div>
        </div>
      </div>
    </div>
  );
}
