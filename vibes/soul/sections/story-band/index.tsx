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
  /** 'even' splits copy and photo 50/50 on desktop instead of favouring the copy. */
  split?: 'default' | 'even';
  /** 'down' nudges the copy 50px down on desktop so it sits a little below the photo's top. */
  copyOffset?: 'none' | 'down';
  /**
   * 'red' is the boxed version: a brand-red rounded box inside the page margins, white copy on
   * the left 60%, the photo covering the right 40% top to bottom.
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
  split = 'default',
  copyOffset = 'none',
  tone = 'default',
  className,
}: Props) {
  const copy = { kicker, title, description, note, actions, headingLevel };

  if (tone === 'red') {
    return (
      <HomeSection className={className} tint={tint}>
        <div className="grid overflow-hidden rounded-3xl bg-[var(--button-primary-background,#d90716)] text-white @3xl:grid-cols-[3fr_2fr]">
          <div className="px-7 py-10 @xl:px-10 @3xl:py-14 @4xl:px-14">
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
      </HomeSection>
    );
  }

  return (
    <HomeSection className={className} tint={tint}>
      <div
        className={clsx(
          'grid items-center gap-10 @3xl:gap-16',
          split === 'even' ? '@3xl:grid-cols-2' : '@3xl:grid-cols-[1.25fr_1fr]',
        )}
      >
        <div
          className={clsx(
            '@3xl:py-6',
            imagePosition === 'left' && '@3xl:order-2',
            copyOffset === 'down' && '@3xl:translate-y-[50px]',
          )}
        >
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
// white and the lead button goes white too (red on red would vanish).
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
          {actions.map((action, index) => (
            <ButtonLink
              className={clsx(
                index > 0 &&
                  (red
                    ? 'transition-colors [--button-ghost-background-hover:white] [--button-ghost-border:white] [--button-ghost-text:white] hover:[--button-ghost-text:var(--button-primary-background,#d90716)]'
                    : 'transition-colors [--button-ghost-background-hover:hsl(var(--foreground))] [--button-ghost-border:hsl(var(--foreground))] hover:[--button-ghost-text:white]'),
              )}
              href={action.href}
              key={action.label}
              shape="pill"
              size="small"
              variant={buttonVariant(Boolean(action.primary), index, red)}
            >
              {action.label}
            </ButtonLink>
          ))}
        </div>
      )}
    </>
  );
}

// The first button is solid (brand red when primary, else black; white on the red band); every
// button after it is a thin outline that fills solid on hover (black with white text; white with
// red text on the red band), so a pair reads as lead + alternative.
function buttonVariant(
  primary: boolean,
  index: number,
  red: boolean,
): 'primary' | 'secondary' | 'tertiary' | 'ghost' {
  if (index > 0) return 'ghost';
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
