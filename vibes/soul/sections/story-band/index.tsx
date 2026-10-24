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
  /** 'soft' gives the photo a lighter hairline and smaller corners (photos on a white field);
   *  'none' drops the frame entirely (a cut-out on white). */
  imageFrame?: 'default' | 'soft' | 'none';
  /** 'red' sets the band on brand red with white copy, 60/40 copy to photo. */
  tone?: 'default' | 'red';
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
  tone = 'default',
  className,
}: Props) {
  const red = tone === 'red';

  return (
    <HomeSection
      className={clsx(red && 'bg-[var(--button-primary-background,#d90716)] text-white', className)}
      tint={tint}
    >
      <div
        className={clsx(
          'grid items-center gap-10 @3xl:gap-16',
          red ? '@3xl:grid-cols-[3fr_2fr]' : '@3xl:grid-cols-[1.25fr_1fr]',
        )}
      >
        <div className={clsx('@3xl:py-6', imagePosition === 'left' && '@3xl:order-2')}>
          {Boolean(kicker) && (
            <p
              className={clsx(
                'mb-2 text-xs font-semibold uppercase tracking-wide',
                red ? 'text-white/85' : 'text-[var(--button-primary-background,#d90716)]',
              )}
            >
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
          <p
            className={clsx(
              'mt-4 max-w-2xl text-sm leading-relaxed @xl:text-base',
              red ? 'text-white/90' : 'text-contrast-500',
            )}
          >
            {description}
          </p>
          {Boolean(note) && (
            <p
              className={clsx(
                'mt-3 max-w-2xl text-sm',
                red ? 'text-white/75' : 'text-contrast-400',
              )}
            >
              {note}
            </p>
          )}
          {actions.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-3">
              {actions.map((action) => (
                <ButtonLink
                  href={action.href}
                  key={action.label}
                  shape="pill"
                  size="small"
                  variant={buttonVariant(Boolean(action.primary), red)}
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
            className={clsx('relative overflow-hidden', frameClassName(imageFrame, red, imageFit), {
              'aspect-[40/21]': imageHeight === 'short',
              'aspect-[3/2]': imageHeight === 'medium',
              'aspect-[4/3]': imageHeight === 'full',
            })}
          >
            {image ? (
              <Image
                alt={image.alt}
                className={imageFit === 'contain' ? 'object-contain' : 'object-cover'}
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

// On the red band the primary action turns white (red on red would vanish); the secondary stays
// black.
function buttonVariant(primary: boolean, red: boolean): 'primary' | 'secondary' | 'tertiary' {
  if (!primary) return 'secondary';

  return red ? 'tertiary' : 'primary';
}

// The photo's frame: hairline + corners by variant, and the field behind a contained photo.
function frameClassName(
  frame: 'default' | 'soft' | 'none',
  red: boolean,
  fit: 'cover' | 'contain',
): string {
  if (frame === 'none') return 'bg-transparent';

  const field = fit === 'contain' ? 'bg-white' : 'bg-contrast-100';

  if (frame === 'soft') return `rounded-2xl ring-1 ring-black/[0.06] ${field}`;

  return `rounded-3xl ring-1 ${red ? 'ring-white/20' : 'ring-contrast-100'} ${field}`;
}
