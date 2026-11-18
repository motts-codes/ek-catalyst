import { clsx } from 'clsx';
import { ArrowRight, Check, Quote, User, X } from 'lucide-react';
import { ReactNode } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { StarCheck } from '@/vibes/soul/primitives/icons/star-check';
import { type Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { AudienceAccordion, type AudienceAccordionItem } from './audience-accordion';
import { StoryTimelineList } from './story-timeline';

// Building blocks shared by the content pages (about, financing, showrooms, resources…), in the
// home page's design language: the same container, section rhythm, rounded panels and type.

export interface PageImage {
  src: string;
  alt: string;
}

export interface PageAction {
  label: string;
  href: string;
  primary?: boolean;
  /** `outline`: thin black outline, solid black on hover (the site's secondary button). */
  style?: 'solid' | 'outline' | 'outline-red';
}

export const OUTLINE_BUTTON =
  'transition-colors [--button-ghost-background:white] [--button-ghost-background-hover:hsl(var(--foreground))] [--button-ghost-border:hsl(var(--foreground))] hover:[--button-ghost-text:white]';

// Brand-red outline and text, filling red on hover.
export const OUTLINE_RED_BUTTON =
  'transition-colors [--button-ghost-background:white] [--button-ghost-background-hover:var(--button-primary-background,#d90716)] [--button-ghost-border:var(--button-primary-background,#d90716)] [--button-ghost-text:var(--button-primary-background,#d90716)] hover:[--button-ghost-text:white]';

// The outline styles ride on the ghost variant with their own colours.
function outlineClass(action: PageAction): string | undefined {
  if (action.primary) return undefined;
  if (action.style === 'outline') return OUTLINE_BUTTON;
  if (action.style === 'outline-red') return OUTLINE_RED_BUTTON;

  return undefined;
}

function actionVariant(action: PageAction): 'primary' | 'secondary' | 'ghost' {
  if (action.primary) return 'primary';

  return action.style === 'outline' || action.style === 'outline-red' ? 'ghost' : 'secondary';
}

// Breadcrumb at the top of a page. Small, in the body's secondary grey (34%): the lighter 45%
// read as washed out on Windows screens (client feedback, 12 Nov 2026).
export function PageBreadcrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  const trail = [{ label: 'Home', href: '/' }, ...breadcrumbs];

  return (
    <div className="bg-white @container">
      <div className="mx-auto max-w-screen-2xl px-6 pt-[15px] @xl:px-9 @4xl:px-14">
        <Breadcrumbs
          breadcrumbs={trail}
          className="[&_a]:!text-contrast-500 [&_ol]:!text-[11px] [&_span]:!text-contrast-500 [&_svg]:!text-contrast-400"
        />
      </div>
    </div>
  );
}

// Buttons inside the red box: black primary (the brand-red button would sit at 1.3:1 on the
// panel) and white-outline secondaries, as on the closing band.
const RED_BOX_PRIMARY_BUTTON =
  'border-foreground bg-foreground text-white after:!bg-white hover:!text-foreground focus-visible:ring-white focus-visible:ring-offset-[#9f3632] [&>span]:mix-blend-normal';
const RED_BOX_OUTLINE_BUTTON =
  'transition-colors [--button-ghost-background-hover:white] [--button-ghost-border:rgb(255_255_255/0.3)] [--button-ghost-text:white] hover:[--button-ghost-border:white] hover:[--button-ghost-text:#9f3632] focus-visible:ring-white focus-visible:ring-offset-[#9f3632]';

const redBoxClass = (action: PageAction) =>
  action.primary ? RED_BOX_PRIMARY_BUTTON : RED_BOX_OUTLINE_BUTTON;
const redBoxVariant = (action: PageAction): 'secondary' | 'ghost' =>
  action.primary ? 'secondary' : 'ghost';

export function Actions({
  actions,
  className,
  onRed = false,
}: {
  actions: PageAction[];
  className?: string;
  /** Inside a `RedBox`: black primary, white outlines. */
  onRed?: boolean;
}) {
  if (actions.length === 0) return null;

  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      {actions.map((action) => (
        <ButtonLink
          className={onRed ? redBoxClass(action) : outlineClass(action)}
          href={action.href}
          key={action.label}
          shape="pill"
          size="small"
          variant={onRed ? redBoxVariant(action) : actionVariant(action)}
        >
          {action.label}
        </ButtonLink>
      ))}
    </div>
  );
}

// "EK red box content": a section's content inset in a rounded deep-red panel with white copy,
// instead of a full-width band. The same panel as the closing band: #9F3632, on which white text
// is 6.9:1, with a soft white glow in one corner. Pass `onRed` to any `Actions` inside it.
const MEDIA_SPLIT = {
  '70/30': '@3xl:grid-cols-[7fr_3fr]',
  '60/40': '@3xl:grid-cols-[3fr_2fr]',
  '50/50': '@3xl:grid-cols-2',
};

export function RedBox({
  kicker,
  title,
  children,
  media,
  size = 'default',
  tone = 'red',
  className,
}: {
  kicker?: string;
  title?: string;
  children: ReactNode;
  /** `black`: the same panel on near-black (#141414) instead of brand red, copy still white. */
  tone?: 'red' | 'black';
  /**
   * A photo (or its placeholder) on the right of the panel, the copy on the left. `bleed`
   * (default) runs the photo to the panel's edges; `enclosed` keeps it inside the panel padding
   * as a rounded picture, for a subject on its own ground (an icon render) rather than a scene.
   */
  media?: {
    image?: PageImage;
    imageLabel?: string;
    split?: '70/30' | '60/40' | '50/50';
    style?: 'bleed' | 'enclosed';
  };
  /** `tall`: a bigger panel (more vertical padding, a taller photo) for a statement band. */
  size?: 'default' | 'tall';
  className?: string;
}) {
  const copy = (
    <>
      {(Boolean(kicker) || Boolean(title)) && (
        <div className={clsx('max-w-3xl', media ? 'mb-4' : 'mb-6 @4xl:mb-8')}>
          {Boolean(kicker) && (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/85">
              {kicker}
            </p>
          )}
          {Boolean(title) && <h2 className={homeHeadingClassName}>{title}</h2>}
        </div>
      )}
      {children}
    </>
  );

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-3xl text-white',
        tone === 'black' ? 'bg-[#141414]' : 'bg-[#9f3632]',
        !media && 'px-6 py-10 @xl:px-12 @xl:py-14',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl"
      />
      {media ? (
        // The photo covers its column edge to edge, no gap; the copy keeps the panel's padding.
        <div className={clsx('relative grid', MEDIA_SPLIT[media.split ?? '70/30'])}>
          <div
            className={clsx(
              'px-6 @xl:px-12',
              size === 'tall' ? 'py-14 @xl:py-20' : 'py-10 @xl:py-12',
            )}
          >
            {copy}
          </div>
          <div
            className={clsx(
              'relative',
              media.style === 'enclosed'
                ? 'px-6 pb-6 @xl:px-12 @xl:pb-12 @xl:@3xl:pr-10 @3xl:py-10 @3xl:pl-0 @3xl:pr-8'
                : 'aspect-[16/9] bg-contrast-100 @3xl:aspect-auto',
              media.style !== 'enclosed' &&
                (size === 'tall' ? '@3xl:min-h-[24rem]' : '@3xl:min-h-[14rem]'),
            )}
          >
            <div
              className={clsx(
                media.style === 'enclosed' &&
                  'relative aspect-[4/3] overflow-hidden rounded-2xl bg-contrast-100 @3xl:aspect-auto @3xl:h-full @3xl:min-h-[14rem]',
              )}
            >
              {media.image ? (
                <Image
                  alt={media.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 56rem) 50vw, 100vw"
                  src={media.image.src}
                />
              ) : (
                <MediaPlaceholder label={media.imageLabel ?? 'Photo'} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">{copy}</div>
      )}
    </div>
  );
}

interface HeroProps {
  kicker?: string;
  title: string;
  description?: ReactNode;
  /** Small print under the paragraph (what the number is and isn't). */
  note?: ReactNode;
  /** Short facts under the paragraph ("A full layout · An itemized quote · …"). */
  chips?: string[];
  /** 'checks' drops the pills: a red star-check before each fact, plain text after it. */
  chipStyle?: 'outline' | 'checks';
  actions?: PageAction[];
  image?: PageImage;
  imageLabel?: string;
  /** `plain` shows the photo as it is: no frame, rounding or backdrop (for shots on white);
   *  `soft` keeps the rounded corners but drops the outline. */
  imageStyle?: 'framed' | 'plain' | 'soft';
  /** `small` keeps a plain image to about two thirds of its column (an illustration, not a photo);
   *  `medium` is 1.3x that, for an illustration that should carry a little more weight. */
  imageSize?: 'default' | 'small' | 'medium';
  /** No photo column — the copy runs the full width. */
  textOnly?: boolean;
  /** `2` when the page already has an h1 above (e.g. a scroll hero). */
  headingLevel?: 1 | 2;
  /** `roomy` gives the opener the full section padding instead of the compact one. */
  spacing?: 'compact' | 'roomy';
  /** `even` splits copy and photo 50/50 instead of giving the copy the wider column. */
  split?: 'default' | 'even';
  /** Sits beside the buttons (a partner logo, say). */
  actionsAside?: ReactNode;
  className?: string;
}

// How the hero photo is drawn. Plain cutouts sit on white: multiply drops their near-white
// backdrop so no box shows and keeps the soft floor shadows; a higher quality keeps those shadows.
function heroImageProps(imageStyle: HeroProps['imageStyle']): {
  className: string;
  quality?: number;
} {
  if (imageStyle === 'plain')
    return { className: 'object-contain mix-blend-multiply', quality: 90 };

  return { className: 'object-cover' };
}

// Page opener: kicker, h1, one paragraph, optional chips and buttons; a photo beside it unless
// The hero's media box. A plain photo sits as it is; a plain placeholder stays square-cornered,
// like the photo that will replace it; everything else gets the rounded grey box.
function heroMediaClassName(
  imageStyle: HeroProps['imageStyle'],
  hasImage: boolean,
  size: HeroProps['imageSize'],
): string {
  const plain = imageStyle === 'plain';

  return clsx(
    'relative overflow-hidden',
    plain && hasImage ? 'aspect-[6/5]' : 'aspect-[4/3] bg-contrast-100',
    !plain && !hasImage && 'rounded-3xl',
    imageStyle === 'framed' && 'ring-1 ring-contrast-100',
    size === 'small' && 'mx-auto w-2/3 @3xl:w-[62%]',
    size === 'medium' && 'mx-auto w-[87%] @3xl:w-[80%]',
  );
}

// `textOnly`.
export function PageHero({
  kicker,
  title,
  description,
  note,
  chips = [],
  chipStyle = 'outline',
  actions = [],
  image,
  imageLabel,
  imageStyle = 'framed',
  imageSize = 'default',
  textOnly = false,
  headingLevel = 1,
  spacing = 'compact',
  split = 'default',
  actionsAside,
  className,
}: HeroProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1';

  return (
    <HomeSection className={className} compact={spacing === 'compact'}>
      <div
        className={clsx(
          'grid items-center gap-8',
          !textOnly && '@3xl:gap-14',
          !textOnly && (split === 'even' ? '@3xl:grid-cols-2' : '@3xl:grid-cols-[1.2fr_1fr]'),
        )}
      >
        <div className={clsx(textOnly && 'max-w-3xl')}>
          {Boolean(kicker) && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
              {kicker}
            </p>
          )}
          <Heading className="font-heading text-3xl font-bold leading-tight @xl:text-4xl @4xl:text-[44px]">
            {title}
          </Heading>
          {Boolean(description) && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
              {description}
            </p>
          )}
          {Boolean(note) && (
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-contrast-500">{note}</p>
          )}
          {chips.length > 0 && (
            <ul
              className={clsx(
                'mt-5',
                // Star-checks sit in two columns (a 2 x 2 for four promises), each column as wide
                // as its longest line so the pair reads as one block; pills wrap freely.
                // One column on phones; two content-sized columns once the copy column is wide
                // enough for the longest pair (the @lg container breakpoint, 32rem).
                chipStyle === 'checks'
                  ? 'grid w-fit max-w-full gap-x-10 gap-y-2.5 @lg:grid-cols-[max-content_max-content]'
                  : 'flex flex-wrap gap-2',
              )}
            >
              {chips.map((chip) => (
                <li
                  className={clsx(
                    'inline-flex items-center gap-2',
                    chipStyle === 'checks'
                      ? 'text-sm font-medium'
                      : 'rounded-full border border-contrast-200 bg-white px-3.5 py-1.5 text-xs font-medium text-contrast-500',
                  )}
                  key={chip}
                >
                  {chipStyle === 'checks' && (
                    <StarCheck
                      aria-hidden
                      className="shrink-0 text-[var(--button-primary-background,#d90716)]"
                      size={18}
                    />
                  )}
                  {chip}
                </li>
              ))}
            </ul>
          )}
          {actionsAside == null ? (
            <Actions actions={actions} className="mt-7" />
          ) : (
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Actions actions={actions} />
              {actionsAside}
            </div>
          )}
        </div>
        {!textOnly && (
          <div className={heroMediaClassName(imageStyle, image != null, imageSize)}>
            {image ? (
              <Image
                alt={image.alt}
                fill
                preload
                sizes="(min-width: 56rem) 45vw, 100vw"
                src={image.src}
                {...heroImageProps(imageStyle)}
              />
            ) : (
              <MediaPlaceholder label={imageLabel ?? title} />
            )}
          </div>
        )}
      </div>
    </HomeSection>
  );
}

interface ProseProps {
  id?: string;
  kicker?: string;
  title?: string;
  /** Paragraphs. */
  body?: string[];
  actions?: PageAction[];
  /** Photo beside the copy (right by default). */
  image?: PageImage;
  imageLabel?: string;
  imagePosition?: 'left' | 'right';
  tint?: boolean;
  /** Almost no top padding: a short follow-on to the section above (a "still not right?" line). */
  tightTop?: boolean;
  children?: ReactNode;
  className?: string;
}

// A heading, some paragraphs, optional buttons — and anything else as children. With an image
// (or image label) it becomes a two-column split.
// A centered, stacked hero for pages led by one wide photo (the About page's team shot):
// eyebrow and headline centered, the photo full width beneath, then the description and the
// buttons centered under it. The photo keeps its wide ratio on desktop and crops to 16:9 on
// phones so the people stay legible.
export function StackedHero({
  kicker,
  title,
  description,
  actions = [],
  image,
  imageLabel,
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: PageAction[];
  image?: PageImage;
  imageLabel?: string;
  className?: string;
}) {
  return (
    <HomeSection className={className} compact>
      <div className="flex flex-col items-center text-center">
        {Boolean(kicker) && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
            {kicker}
          </p>
        )}
        <h1 className="max-w-3xl font-heading text-3xl font-bold leading-tight @xl:text-4xl @4xl:text-[44px]">
          {title}
        </h1>
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-contrast-100 @xl:aspect-[2.4/1] @3xl:mt-10 @3xl:aspect-[1920/518]">
          {image ? (
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              preload
              sizes="(min-width: 80rem) 1280px, 100vw"
              src={image.src}
            />
          ) : (
            <MediaPlaceholder label={imageLabel ?? title} />
          )}
        </div>
        {Boolean(description) && (
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-contrast-500 @xl:text-base @3xl:mt-10">
            {description}
          </p>
        )}
        <Actions actions={actions} className="mt-7 justify-center" />
      </div>
    </HomeSection>
  );
}

export function Prose({
  id,
  kicker,
  title,
  body = [],
  actions = [],
  image,
  imageLabel,
  imagePosition = 'right',
  tint,
  tightTop,
  children,
  className,
}: ProseProps) {
  const hasMedia = image != null || imageLabel != null;
  const copy = (
    <div className={clsx(!hasMedia && 'max-w-3xl')}>
      {Boolean(kicker) && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
          {kicker}
        </p>
      )}
      {Boolean(title) && <h2 className={homeHeadingClassName}>{title}</h2>}
      {body.map((paragraph) => (
        <p
          className="mt-4 text-sm leading-relaxed text-contrast-500 @xl:text-base"
          key={paragraph.slice(0, 40)}
        >
          {paragraph}
        </p>
      ))}
      <Actions actions={actions} className="mt-6" />
      {children}
    </div>
  );

  if (!hasMedia) {
    return (
      <HomeSection className={className} id={id} tightTop={tightTop} tint={tint}>
        {copy}
      </HomeSection>
    );
  }

  return (
    <HomeSection className={className} id={id} tightTop={tightTop} tint={tint}>
      <div className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-14">
        <div className={clsx(imagePosition === 'left' && '@3xl:order-2')}>{copy}</div>
        <div
          className={clsx(
            'relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100 ring-1 ring-contrast-100',
            imagePosition === 'left' && '@3xl:order-1',
          )}
        >
          {image ? (
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 50vw, 100vw"
              src={image.src}
            />
          ) : (
            <MediaPlaceholder label={imageLabel ?? ''} />
          )}
        </div>
      </div>
    </HomeSection>
  );
}

export interface Stat {
  value: string;
  label: string;
}

// "110 years · 100,000+ kitchens · 6 showrooms" — big numbers in a row.
export function StatsRow({
  stats,
  tint,
  className,
}: {
  stats: Stat[];
  tint?: boolean;
  className?: string;
}) {
  return (
    <HomeSection className={className} compact tint={tint}>
      <dl className="grid grid-cols-2 gap-4 @xl:grid-cols-3 @4xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            className="rounded-3xl border border-contrast-100 bg-white px-6 py-6"
            key={stat.label}
          >
            <dd className="font-heading text-3xl font-bold leading-none @xl:text-4xl">
              {stat.value}
            </dd>
            <dt className="mt-2 text-sm text-contrast-500">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </HomeSection>
  );
}

export interface TimelineItem {
  when: string;
  title: string;
  description: string;
}

// "Our story" — a vertical timeline with the year on the left.
export function Timeline({
  kicker,
  title,
  description,
  items,
  tint,
  className,
}: {
  kicker?: string;
  title?: string;
  description?: string;
  items: TimelineItem[];
  tint?: boolean;
  className?: string;
}) {
  return (
    <HomeSection
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <ol className="relative ml-3 border-l border-contrast-200 @xl:ml-24">
        {items.map((item) => (
          <li className="relative pb-8 pl-8 last:pb-0 @xl:pl-10" key={item.when + item.title}>
            <span
              aria-hidden
              className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[var(--button-primary-background,#d90716)] ring-1 ring-contrast-200"
            />
            <p className="font-heading text-sm font-bold text-[var(--button-primary-background,#d90716)] @xl:absolute @xl:-left-24 @xl:top-0 @xl:w-16 @xl:text-right">
              {item.when}
            </p>
            <h3 className="mt-1 font-heading text-lg font-semibold leading-tight @xl:mt-0">
              {item.title}
            </h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-contrast-500">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}

// "Our story" as a step-by-step scroll timeline (see story-timeline.tsx). Same props as Timeline.
export function StoryTimeline({
  kicker,
  title,
  description,
  items,
  tint,
  surfaceClassName,
  className,
}: {
  kicker?: string;
  title?: string;
  description?: string;
  items: TimelineItem[];
  tint?: boolean;
  /** The band's background class, repeated inside the upcoming circles (default white). */
  surfaceClassName?: string;
  className?: string;
}) {
  return (
    <HomeSection
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <StoryTimelineList
        className="mt-10 pb-8 @xl:mt-16 @xl:pb-12"
        items={items}
        surfaceClassName={surfaceClassName}
      />
    </HomeSection>
  );
}

// "Who we work with": rows of copy that open one at a time beside a photo that swaps with them
// (see audience-accordion.tsx).
export function AudienceRows({
  kicker,
  title,
  description,
  items,
  tint,
  className,
}: {
  kicker?: string;
  title?: string;
  description?: string;
  items: AudienceAccordionItem[];
  tint?: boolean;
  className?: string;
}) {
  return (
    <HomeSection
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <AudienceAccordion items={items} />
    </HomeSection>
  );
}

export interface Person {
  name: string;
  role: string;
  quote?: string;
  image?: PageImage;
  href?: string;
}

// "The people": equal-height cards, the portrait running edge to edge across the top, a light-red
// quote mark over their line in their own words, and the name with a person-icon role line held
// to the bottom so the names sit level across the row.
export function TeamRow({
  kicker,
  title,
  description,
  people,
  action,
  tint,
  className,
}: {
  kicker?: string;
  title?: string;
  description?: string;
  people: Person[];
  action?: PageAction;
  tint?: boolean;
  className?: string;
}) {
  return (
    <HomeSection
      action={action}
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <ul className="grid gap-5 @xl:grid-cols-2 @4xl:grid-cols-4">
        {people.map((person) => {
          const card = (
            <>
              <span className="relative block aspect-[4/3] overflow-hidden bg-contrast-100">
                {person.image ? (
                  <Image
                    alt={person.image.alt}
                    className="object-cover object-top transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                    fill
                    sizes="(min-width: 64rem) 25vw, 50vw"
                    src={person.image.src}
                  />
                ) : (
                  <MediaPlaceholder label="Portrait" />
                )}
              </span>
              <span className="flex flex-1 flex-col p-5 @xl:p-6">
                {Boolean(person.quote) && (
                  <span className="flex-1">
                    <Quote
                      aria-hidden
                      className="mb-3 fill-current text-[#f3c0c5]"
                      size={28}
                      strokeWidth={0}
                    />
                    <span className="block text-sm leading-relaxed text-contrast-500 @xl:text-base">
                      {person.quote}
                    </span>
                  </span>
                )}
                <span className="mt-5 block border-t border-contrast-100 pt-4">
                  <span className="block font-heading text-lg font-semibold leading-tight text-[var(--button-primary-background,#d90716)]">
                    {person.name}
                  </span>
                  <span className="mt-1.5 flex items-center gap-2 text-xs text-contrast-500 @xl:text-sm">
                    <User
                      aria-hidden
                      className="shrink-0 text-[var(--button-primary-background,#d90716)]"
                      size={14}
                    />
                    {person.role}
                  </span>
                </span>
              </span>
            </>
          );
          const cardClassName =
            'group flex h-full flex-col overflow-hidden rounded-3xl border border-contrast-100 bg-white';

          return (
            <li key={person.name + person.role}>
              {person.href ? (
                <Link
                  className={clsx(
                    cardClassName,
                    'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]',
                  )}
                  href={person.href}
                >
                  {card}
                </Link>
              ) : (
                <div className={cardClassName}>{card}</div>
              )}
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
}

export interface LinkCard {
  title: string;
  description: string;
  href: string;
  linkLabel?: string;
}

// Text cards that are each one link — "Who we work with", "Where next".
export function LinkCards({
  kicker,
  title,
  description,
  cards,
  columns = 4,
  tint,
  className,
}: {
  kicker?: string;
  title?: string;
  description?: string;
  cards: LinkCard[];
  columns?: 2 | 3 | 4;
  tint?: boolean;
  className?: string;
}) {
  return (
    <HomeSection
      className={className}
      description={description}
      kicker={kicker}
      tint={tint}
      title={title}
    >
      <ul
        className={clsx(
          'grid gap-5',
          { 2: '@xl:grid-cols-2', 3: '@xl:grid-cols-3', 4: '@xl:grid-cols-2 @4xl:grid-cols-4' }[
            columns
          ],
        )}
      >
        {cards.map((card) => (
          <li key={card.title}>
            <Link
              className="group flex h-full flex-col rounded-3xl border border-contrast-100 bg-white p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              href={card.href}
            >
              <span className="font-heading text-lg font-semibold leading-tight transition-colors group-hover:text-[var(--button-primary-background,#d90716)] @xl:text-xl">
                {card.title}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-contrast-500">
                {card.description}
              </span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[var(--button-primary-background,#d90716)]">
                {card.linkLabel ?? card.title}
                <ArrowRight
                  className="transition-transform group-hover:-translate-x-1"
                  size={15}
                  strokeWidth={2.5}
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

// Small print (disclosures, legal notes) at the end of a section.
export function FinePrint({
  children,
  variant = 'box',
  className,
}: {
  children: ReactNode;
  /** `plain` drops the grey box: a bare footnote line that starts with an asterisk. */
  variant?: 'box' | 'plain';
  className?: string;
}) {
  return (
    <HomeSection className={className} compact>
      <p
        className={clsx(
          'max-w-3xl text-xs leading-relaxed text-contrast-500',
          variant === 'box' && 'rounded-2xl border border-contrast-100 bg-[#f9fafd] px-5 py-4',
        )}
      >
        {variant === 'plain' && '*'}
        {children}
      </p>
    </HomeSection>
  );
}

export interface RowStep {
  title: string;
  description: string;
}

// A single compact row of numbered steps ("How it works"): big red number, bold title, one
// line. Compact padding so it never pushes what follows (usually a form) far down the page.
export function StepsRow({
  kicker,
  title,
  steps,
  actions = [],
  note,
  tint = false,
  look = 'band',
  className,
}: {
  kicker?: string;
  title: string;
  steps: RowStep[];
  /** Buttons under the steps ("Start a claim"). */
  actions?: PageAction[];
  /** One quiet line beside or under the buttons ("Prefer to talk? Call or text…"). */
  note?: string;
  tint?: boolean;
  /** `red-box`: the steps inset in the EK red box (white copy) instead of a full-width band. */
  look?: 'band' | 'red-box';
  /** For a band colour other than the grey tint (the light red `bg-[#fdf3f5]`, say). */
  className?: string;
}) {
  const onRed = look === 'red-box';
  const body = (
    <>
      <ol className="grid gap-6 @xl:grid-cols-3 @xl:gap-8">
        {steps.map((step, i) => (
          <li className="flex gap-4" key={step.title}>
            <span
              aria-hidden
              className={clsx(
                'font-heading text-4xl font-bold leading-none',
                onRed ? 'text-white' : 'text-[var(--button-primary-background,#d90716)]',
              )}
            >
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="font-heading text-base font-semibold leading-tight @xl:text-lg">
                {step.title}
              </h3>
              <p
                className={clsx(
                  'mt-1.5 text-sm leading-relaxed',
                  onRed ? 'text-white/85' : 'text-contrast-500',
                )}
              >
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {(actions.length > 0 || Boolean(note)) && (
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Actions actions={actions} onRed={onRed} />
          {Boolean(note) && (
            <p className={clsx('text-sm', onRed ? 'text-white/85' : 'text-contrast-500')}>{note}</p>
          )}
        </div>
      )}
    </>
  );

  if (onRed) {
    return (
      <HomeSection className={className} compact tint={tint}>
        <RedBox kicker={kicker} title={title}>
          {body}
        </RedBox>
      </HomeSection>
    );
  }

  return (
    <HomeSection className={className} compact kicker={kicker} tint={tint} title={title}>
      {body}
    </HomeSection>
  );
}

export interface SplitCard {
  title: string;
  /** A short red line under the title (the monthly example, say). */
  meta?: string;
  description: string;
}

// Copy on the left (about a third), a 2 x 2 of numbered cards on the right (about two thirds).
// Every other card is brand red with white copy, checkerboard fashion, and the rest are white
// with a red outline, so the four read as a set. Used for the financing plans.
export function SplitCardGrid({
  kicker,
  title,
  description,
  footnote,
  cards,
  tint = false,
}: {
  kicker?: string;
  title: string;
  description?: string;
  /** Small print under the copy on the left. */
  footnote?: ReactNode;
  cards: SplitCard[];
  tint?: boolean;
}) {
  return (
    <HomeSection tint={tint}>
      <div className="grid gap-10 @3xl:grid-cols-[1fr_2fr] @3xl:gap-16">
        <div>
          {Boolean(kicker) && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
              {kicker}
            </p>
          )}
          <h2 className={homeHeadingClassName}>{title}</h2>
          {Boolean(description) && (
            <p className="mt-3 text-sm leading-relaxed text-contrast-500 @xl:text-base">
              {description}
            </p>
          )}
          {footnote != null && (
            <p className="mt-5 text-xs leading-relaxed text-contrast-500">{footnote}</p>
          )}
        </div>
        <ol className="grid gap-5 @xl:grid-cols-2">
          {cards.map((card, i) => {
            // Checkerboard: the 2nd and 3rd of four are red.
            const red = i % 3 !== 0;

            return (
              <li
                className={clsx(
                  'flex h-full flex-col rounded-3xl p-6 @xl:p-7',
                  red
                    ? 'bg-[var(--button-primary-background,#d90716)] text-white'
                    : 'border border-[var(--button-primary-background,#d90716)] bg-white',
                )}
                key={card.title}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'mb-3 block font-heading text-4xl font-bold leading-none',
                    red ? 'text-white' : 'text-[var(--button-primary-background,#d90716)]',
                  )}
                >
                  {i + 1}
                </span>
                <h3 className="font-heading text-lg font-semibold leading-tight @xl:text-xl">
                  {card.title}
                </h3>
                {card.meta != null && (
                  <p
                    className={clsx(
                      'mt-1 text-xs font-semibold',
                      red ? 'text-white' : 'text-[var(--button-primary-background,#d90716)]',
                    )}
                  >
                    {card.meta}
                  </p>
                )}
                <p
                  className={clsx(
                    'mt-2.5 text-sm leading-relaxed',
                    red ? 'text-white' : 'text-contrast-500',
                  )}
                >
                  {card.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </HomeSection>
  );
}

export interface CheckItem {
  text: string;
  /** A don't: red cross instead of the check. */
  no?: boolean;
}

// A checklist in the quiet table look: small red label over a black rule, a hairline between
// rows, a red check (or cross for a don't) before each line. No box, fill or rounding.
export function CheckTable({ title, items }: { title: string; items: Array<CheckItem | string> }) {
  const rows = items.map((item) => (typeof item === 'string' ? { text: item } : item));

  return (
    <div>
      <h3 className="border-b-2 border-foreground pb-3 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
        {title}
      </h3>
      <ul>
        {rows.map((row) => (
          <li
            className="flex items-start gap-3 border-b border-contrast-100 py-3.5 text-sm leading-relaxed text-[#404040]"
            key={row.text.slice(0, 40)}
          >
            {row.no ? (
              <X
                aria-label="Don't"
                className="mt-0.5 shrink-0 text-[var(--button-primary-background,#d90716)]"
                size={18}
                strokeWidth={2.5}
              />
            ) : (
              <Check
                aria-label="Do"
                className="mt-0.5 shrink-0 text-[var(--button-primary-background,#d90716)]"
                size={18}
                strokeWidth={2.5}
              />
            )}
            <span>{row.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The card every lead form sits in: pale rose, red rule top and bottom, soft shadow, with the
// privacy line underneath. Pass the form as children; anything after it (notes) goes in `after`.
export function FormCard({ children, after }: { children: ReactNode; after?: ReactNode }) {
  return (
    <div className="rounded-xl border-y-4 border-[var(--form-border-focus,#d90716)] bg-[var(--form-card,#fdf8f8)] p-6 shadow-[0_15px_40px_rgb(0_0_0/0.04)] @xl:p-10">
      {children}
      {after}
      <p className="mt-5 text-center text-xs text-contrast-500">
        *Your details stay with us. No spam, ever.{' '}
        <Link className="underline underline-offset-4" href="/privacy">
          View our privacy policy
        </Link>
      </p>
    </div>
  );
}

// The legal text of a policy (the warranty terms, say), printed in full under a heading in the
// FAQ accordion's style, so it sits as the FAQ's companion at the foot of a policy page. Plain
// paragraphs, no collapse: "Read the full terms" in the hero anchors here.
export function LegalText({
  id,
  title,
  paragraphs,
}: {
  id?: string;
  title: string;
  /** The text, word for word, one string per paragraph. */
  paragraphs: string[];
}) {
  return (
    <SectionLayout containerSize="2xl" id={id}>
      <h2 className="mb-6 font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
        {title}
      </h2>
      <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-contrast-500">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </SectionLayout>
  );
}
