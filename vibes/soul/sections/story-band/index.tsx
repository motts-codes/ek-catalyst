import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

interface Props {
  kicker?: string;
  title: string;
  description: string;
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
  image?: { src: string; alt: string };
  imageLabel?: string;
  imagePosition?: 'left' | 'right';
  /** 1 when the band opens a page (bigger title, h1). */
  headingLevel?: 1 | 2;
  /** Small line under the paragraph, e.g. a stock/line count. */
  note?: string;
  tint?: boolean;
  /** The blush plate offset behind the photo (off for a cleaner hero). */
  plate?: boolean;
  /** 'short' trims the photo to about 70% of the usual height, 'medium' to about 88%. */
  imageHeight?: 'full' | 'medium' | 'short';
  /** 'soft' gives the photo a lighter hairline and smaller corners (photos on a white field). */
  imageFrame?: 'default' | 'soft';
  /** 'contain' shows a product shot whole on a white field instead of cropping it to the frame. */
  imageFit?: 'cover' | 'contain';
  className?: string;
}

// One brand-story band: text on one side (kicker, title, paragraph, buttons), a photo on the
// other with a soft tinted plate behind it. "Made in Connecticut. In stock in Connecticut."
export function StoryBand({
  kicker,
  title,
  description,
  actions = [],
  image,
  imageLabel,
  imagePosition = 'right',
  headingLevel = 2,
  note,
  tint = false,
  plate = true,
  imageHeight = 'full',
  imageFrame = 'default',
  imageFit = 'cover',
  className,
}: Props) {
  return (
    <HomeSection className={className} tint={tint}>
      <div className="grid items-center gap-10 @3xl:grid-cols-[1.25fr_1fr] @3xl:gap-16">
        <div className={clsx('@3xl:py-6', imagePosition === 'left' && '@3xl:order-2')}>
          {Boolean(kicker) && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
              {kicker}
            </p>
          )}
          {headingLevel === 1 ? (
            <h1 className="font-heading text-3xl font-bold leading-tight @xl:text-4xl @4xl:text-[44px]">
              {title}
            </h1>
          ) : (
            <h2 className={homeHeadingClassName}>{title}</h2>
          )}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
            {description}
          </p>
          {Boolean(note) && <p className="mt-3 max-w-2xl text-sm text-contrast-400">{note}</p>}
          {actions.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-3">
              {actions.map((action) => (
                <ButtonLink
                  href={action.href}
                  key={action.label}
                  shape="pill"
                  size="small"
                  variant={action.primary ? 'primary' : 'secondary'}
                >
                  {action.label}
                </ButtonLink>
              ))}
            </div>
          )}
        </div>
        <div className={clsx('relative', imagePosition === 'left' && '@3xl:order-1')}>
          {/* Tinted plate offset behind the photo */}
          {plate && (
            <div
              aria-hidden
              className={clsx(
                'absolute -bottom-4 -top-4 -z-10 w-full rounded-[2rem] bg-[#fbe7e7]',
                imagePosition === 'left' ? '-left-4' : '-right-4',
              )}
            />
          )}
          <div
            className={clsx(
              'relative overflow-hidden ring-1',
              imageFrame === 'soft'
                ? 'rounded-2xl ring-black/[0.06]'
                : 'rounded-3xl ring-contrast-100',
              imageFit === 'contain' ? 'bg-white' : 'bg-contrast-100',
              {
                'aspect-[40/21]': imageHeight === 'short',
                'aspect-[3/2]': imageHeight === 'medium',
                'aspect-[4/3]': imageHeight === 'full',
              },
            )}
          >
            {image ? (
              <Image
                alt={image.alt}
                className={imageFit === 'contain' ? 'object-contain p-4' : 'object-cover'}
                fill
                sizes="(min-width: 56rem) 40vw, 100vw"
                src={image.src}
              />
            ) : (
              <MediaPlaceholder label={imageLabel ?? title} />
            )}
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
