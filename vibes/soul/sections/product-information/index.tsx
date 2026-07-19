import { clsx } from 'clsx';

import { ProductInfoFeatures } from '~/data-transformers/product-info-features-transformer';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';

interface SpecRow {
  name: string;
  value: string;
}

interface Props {
  features: ProductInfoFeatures | null;
  specifications: SpecRow[];
  className?: string;
}

/**
 * "Product Information" section: two columns side by side —
 *  - Features (from the product_info/features metafield) — a simple list under a grey header.
 *    Only rendered when the product has that metafield; otherwise the layout is single-column.
 *  - Product Details — the spec rows (SKU, weight, etc.) as a 2-col table with alternating grey
 *    rows, under a grey header.
 */
export function ProductInformation({ features, specifications, className }: Props) {
  if (specifications.length === 0 && features == null) {
    return null;
  }

  const hasFeatures = features != null;

  return (
    <SectionLayout className={className} containerSize="2xl">
      <h2 className="mb-6 font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
        Product Information
      </h2>

      <div
        className={clsx(
          'grid grid-cols-1 items-start gap-8',
          hasFeatures && 'lg:grid-cols-[3fr_2fr]',
        )}
      >
        {/* Col 1: Features (optional) */}
        {hasFeatures && (
          <div className="overflow-hidden rounded-lg border border-contrast-100">
            <div className="bg-contrast-100 px-4 py-2.5 font-[family-name:var(--font-family-heading)] text-sm font-semibold uppercase">
              {features.headline}
            </div>
            <dl>
              {features.items.map((item, index) => (
                <div
                  className={clsx(
                    'grid grid-cols-2 gap-2 px-4 py-2.5 text-sm',
                    index % 2 === 1 && 'bg-[#f5f5f5]',
                  )}
                  key={index}
                >
                  <dt className={clsx('font-semibold', !item.value && 'col-span-2')}>
                    {item.name}
                  </dt>
                  {item.value && (
                    <dd className="text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
                      {item.value}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Col 2: Product Details (specifications table) */}
        {specifications.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-contrast-100">
            <div className="bg-contrast-100 px-4 py-2.5 font-[family-name:var(--font-family-heading)] text-sm font-semibold uppercase">
              Product Details
            </div>
            <dl>
              {specifications.map((spec, index) => (
                <div
                  className={clsx(
                    'grid grid-cols-2 gap-2 px-4 py-2.5 text-sm',
                    index % 2 === 1 && 'bg-[#f5f5f5]',
                  )}
                  key={index}
                >
                  <dt className="font-semibold">{spec.name}</dt>
                  <dd className="text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
