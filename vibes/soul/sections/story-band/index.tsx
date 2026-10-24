import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

interface Action {
  label: string;
  href: string;
  primary?: boolean;
}

interface Props {
  kicker?: string;
  title: string;
  description: string;
  actions?: Action[];
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
  /** 'contain' shows a product shot whole on a white field instead of cropping it to the frame. */
  imageFit?: 'cover' | 'contain';
  /** Where a contained photo sits in its frame ('left' hugs the copy). */
  imageAlign?: 'center' | 'left';
  /**
   * 'red' is the full-bleed version: brand red edge to edge, white copy on the left 60%, the
   * photo covering the right 40% top to bottom.
   */
  tone?: 'default' | 'red';
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
  imageAlign = 'center',
  tone = 'default',
  className,
}: Props) {
  const copy = { kicker, title, description, note, actions, headingLevel };

  if (tone === 'red') {
    return (
      <section
        className={clsx(
          'bg-[var(--button-primary-background,#d90716)] text-white @container',
          className,
        )}
      >
        <div className="grid @3xl:grid-cols-[3fr_2fr]">
          {/* The copy keeps the page's left edge: the container's side padding, plus the slack
              left over once the page column (96rem) is centred. */}
          <div className="px-6 py-10 @xl:px-9 @3xl:py-14 @4xl:py-16 @4xl:pl-[max(3.5rem,calc((100cqw-96rem)/2+3.5rem))] @4xl:pr-14">
            <Copy {...copy} red />
          </div>
          <div className="relative min-h-[16rem] @3xl:min-h-full">
            {image ? (
              <Image
                alt={image.alt}
                className="object-cover"
                fill
                sizes="(min-width: 56rem) 40vw, 100vw"
                src={image.src}
              />
            ) : (
              <MediaPlaceholder label={imageLabel ?? title} />
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <HomeSection className={className} tint={tint}>
      <div className="grid items-center gap-10 @3xl:grid-cols-[1.25fr_1fr] @3xl:gap-16">
        <div className={clsx('@3xl:py-6', imagePosition === 'left' && '@3xl:order-2')}>
          <Copy {...copy} />
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
            className={clsx('relative overflow-hidden', frameClassName(imageFrame, imageFit), {
              'aspect-[40/21]': imageHeight === 'short',
              'aspect-[3/2]': imageHeight === 'medium',
              'aspect-[4/3]': imageHeight === 'full',
            })}
          >
            {image ? (
              <Image
                alt={image.alt}
                className={clsx(
                  imageFit === 'contain' ? 'object-contain' : 'object-cover',
                  imageAlign === 'left' && 'object-left',
                )}
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

// The band's words: eyebrow, heading, paragraph, note and buttons. On red, everything turns
// white and the primary button goes white too (red on red would vanish); the secondary stays
// black.
function Copy({
  kicker,
  title,
  description,
  note,
  actions,
  headingLevel,
  red = false,
}: {
  kicker?: string;
  title: string;
  description: string;
  note?: string;
  actions: Action[];
  headingLevel: 1 | 2;
  red?: boolean;
}) {
  return (
    <>
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
        <p className={clsx('mt-3 max-w-2xl text-sm', red ? 'text-white/75' : 'text-contrast-400')}>
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
    </>
  );
}

function buttonVariant(primary: boolean, red: boolean): 'primary' | 'secondary' | 'tertiary' {
  if (!primary) return 'secondary';

  return red ? 'tertiary' : 'primary';
}

// The photo's frame: hairline + corners by variant, and the field behind a contained photo.
function frameClassName(frame: 'default' | 'soft' | 'none', fit: 'cover' | 'contain'): string {
  if (frame === 'none') return 'bg-transparent';

  const field = fit === 'contain' ? 'bg-white' : 'bg-contrast-100';

  return frame === 'soft'
    ? `rounded-2xl ring-1 ring-black/[0.06] ${field}`
    : `rounded-3xl ring-1 ring-contrast-100 ${field}`;
}
