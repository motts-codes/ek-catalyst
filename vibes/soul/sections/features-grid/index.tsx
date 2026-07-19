import { clsx } from 'clsx';

import { Image } from '~/components/image';

import { FeaturesGrid as FeaturesGridData } from '~/data-transformers/features-grid-transformer';

interface Props {
  featuresGrid: FeaturesGridData | null;
  className?: string;
}

/**
 * PDP features section: a headline + description, then a grid of feature cells (image on top,
 * title + text below). Renders 3 columns on wide screens (so 6 features = 2 rows). Empty image
 * strings show a placeholder box, ready to swap for real image URLs later.
 */
export function FeaturesGrid({ featuresGrid, className }: Props) {
  if (featuresGrid == null) {
    return null;
  }

  const { headline, description, features } = featuresGrid;

  return (
    <section
      className={clsx('mx-auto w-full max-w-[1320px] px-4 py-10 @xl:px-6 @4xl:px-8', className)}
    >
      {(headline || description) && (
        <div className="mb-10 max-w-3xl">
          {headline && (
            <h2 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight @xl:text-3xl">
              {headline}
            </h2>
          )}
          {description && (
            <p className="mt-3 text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div key={index}>
            <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-contrast-100">
              {feature.image ? (
                <Image
                  alt={feature.title}
                  className="object-cover"
                  fill
                  sizes="(min-width: 56rem) 33vw, (min-width: 42rem) 50vw, 100vw"
                  src={feature.image}
                  // Feature images may be hosted outside the store CDN (a separate asset store),
                  // so skip Next's optimizer/host-allowlist. They're already optimized .webp.
                  unoptimized
                />
              ) : null}
            </div>
            {feature.title && (
              <h3 className="mb-1.5 font-[family-name:var(--font-family-heading)] text-lg font-semibold leading-snug">
                {feature.title}
              </h3>
            )}
            {feature.text && (
              <p className="text-sm leading-relaxed text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
                {feature.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
