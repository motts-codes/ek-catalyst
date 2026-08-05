import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';

import { Gallery } from './gallery';

/**
 * Collection detail header shown ABOVE the product grid on a cabinet collection category page
 * (Avon, Dover). Everything here comes from the category's BigCommerce metafields — see
 * lib/cabinets/cabinet-collection.ts. Deferred (Laravel-fed in Stencil, not seeded here): image
 * carousel, badges, specifications, assembly instructions, category color swatches.
 */
export interface CabinetSwatch {
  id: string;
  name: string;
  hex?: string;
  image?: string;
}

export interface CabinetCollectionHeaderData {
  name: string;
  /** Overview HTML — the collection's long copy (replaces the native BC category description). */
  overview?: string;
  /** Gallery image URLs; images[0] is the main image. */
  images?: string[];
  /** Merch info: line / door style / default finish. */
  line?: string;
  doorStyle?: string;
  defaultFinish?: string;
  /** Attribute selections resolved against the master lists: product line, construction, colors. */
  productLine?: string;
  construction?: string;
  colors?: CabinetSwatch[];
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

interface Props {
  data: CabinetCollectionHeaderData;
  program?: 'assembled' | 'rta';
  className?: string;
}

export function CabinetCollectionHeader({ data, className }: Props) {
  const hasPricing = data.price != null && data.price !== '';

  const images = (data.images ?? []).filter((u) => u !== '');

  return (
    <div className={clsx('border-b border-contrast-100 bg-white @container', className)}>
      <div className="mx-auto max-w-screen-2xl px-4 py-8 @xl:px-6 @4xl:px-8">
        <div className="grid grid-cols-1 gap-8 @3xl:grid-cols-[1fr_auto] @3xl:items-start">
          {/* Left: gallery, name, merch line, overview, spec sheet. */}
          <div className="max-w-2xl">
            {images.length > 0 && <Gallery images={images} name={data.name} />}

            <h1 className="font-heading text-3xl font-medium leading-tight @lg:text-4xl">
              {data.name}
            </h1>

            {(() => {
              // Prefer the attribute selections (Product Line / Construction); fall back to the
              // legacy free-text merch fields for collections not yet migrated.
              const line = data.productLine || data.line;
              const construction = data.construction || data.doorStyle;
              const meta = [
                line,
                construction,
                data.colors?.length ? undefined : data.defaultFinish,
              ]
                .filter(Boolean)
                .join(' · ');

              return meta ? <p className="mt-2 text-sm text-contrast-400">{meta}</p> : null;
            })()}

            {data.colors != null && data.colors.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-contrast-400">
                  Available Finishes
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.colors.map((c) => (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-contrast-100 py-1 pl-1 pr-3 text-xs text-contrast-500"
                      key={c.id}
                    >
                      <span
                        className="inline-block size-5 rounded-full border border-contrast-100 bg-cover bg-center"
                        style={{
                          backgroundColor: c.hex || undefined,
                          backgroundImage: c.image ? `url(${c.image})` : undefined,
                        }}
                        title={c.name}
                      />
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.overview != null && data.overview !== '' && (
              // Staff-authored HTML (same trust boundary as the native BC category description).
              <div
                className="prose prose-sm mt-4 max-w-none text-contrast-500 @xl:prose-base [&_a]:text-[#2162a1] [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: data.overview }}
              />
            )}

            {data.specSheetUrl != null && data.specSheetUrl !== '' && (
              <a
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#2162a1] underline-offset-2 hover:underline"
                href={data.specSheetUrl}
                rel="noreferrer"
                target="_blank"
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                Specification Sheet
              </a>
            )}
          </div>

          {/* Right: pricing + order-sample card. */}
          {(hasPricing || data.orderSampleHref) && (
            <div className="w-full max-w-sm rounded-2xl border border-contrast-100 bg-[#f9fafd] p-5 @3xl:w-80">
              {hasPricing && (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-contrast-400">
                    Basic Kitchen Starting
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">${data.price}</span>
                    {data.strikePrice != null && data.strikePrice !== '' && (
                      <span className="text-sm text-contrast-400 line-through">
                        ${data.strikePrice}
                      </span>
                    )}
                  </div>
                  {data.emiText != null && data.emiText !== '' && (
                    <p className="mt-0.5 text-xs text-contrast-500">{data.emiText}</p>
                  )}
                  {data.deliveryTime != null && data.deliveryTime !== '' && (
                    <p className="mt-2 text-sm text-contrast-500">
                      Ships:{' '}
                      <span className="font-medium text-foreground">{data.deliveryTime}</span>
                    </p>
                  )}
                </>
              )}

              {data.orderSampleHref != null && data.orderSampleHref !== '' && (
                <ButtonLink
                  className="mt-4 w-full [&>span]:w-full [&>span]:justify-center"
                  href={data.orderSampleHref}
                  shape="pill"
                  size="small"
                  variant="secondary"
                >
                  {data.orderSamplePrice != null && data.orderSamplePrice !== ''
                    ? `Order Sample $${data.orderSamplePrice}`
                    : 'Order Sample'}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
