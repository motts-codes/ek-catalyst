import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { type Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

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
}

// Breadcrumb at the top of a page. Small and grey like the PDP's, at a size/grey that passes AA.
export function PageBreadcrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  const trail = [{ label: 'Home', href: '/' }, ...breadcrumbs];

  return (
    <div className="bg-white @container">
      <div className="mx-auto max-w-screen-2xl px-6 pt-[15px] @xl:px-9 @4xl:px-14">
        <Breadcrumbs
          breadcrumbs={trail}
          className="[&_a]:!text-contrast-400 [&_ol]:!text-[11px] [&_span]:!text-contrast-400 [&_svg]:!text-contrast-400"
        />
      </div>
    </div>
  );
}

export function Actions({ actions, className }: { actions: PageAction[]; className?: string }) {
  if (actions.length === 0) return null;

  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
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
  );
}

interface HeroProps {
  kicker?: string;
  title: string;
  description?: string;
  /** Short facts under the paragraph ("A full layout · An itemized quote · …"). */
  chips?: string[];
  actions?: PageAction[];
  image?: PageImage;
  imageLabel?: string;
  /** `plain` shows the photo as it is: no frame, rounding or backdrop (for shots on white). */
  imageStyle?: 'framed' | 'plain';
  /** No photo column — the copy runs the full width. */
  textOnly?: boolean;
  /** `2` when the page already has an h1 above (e.g. a scroll hero). */
  headingLevel?: 1 | 2;
  className?: string;
}

// Page opener: kicker, h1, one paragraph, optional chips and buttons; a photo beside it unless
// `textOnly`.
export function PageHero({
  kicker,
  title,
  description,
  chips = [],
  actions = [],
  image,
  imageLabel,
  imageStyle = 'framed',
  textOnly = false,
  headingLevel = 1,
  className,
}: HeroProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1';

  return (
    <HomeSection className={className} compact>
      <div
        className={clsx(
          'grid items-center gap-8',
          !textOnly && '@3xl:grid-cols-[1.2fr_1fr] @3xl:gap-14',
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
          {chips.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li
                  className="rounded-full border border-contrast-200 bg-white px-3.5 py-1.5 text-xs font-medium text-contrast-500"
                  key={chip}
                >
                  {chip}
                </li>
              ))}
            </ul>
          )}
          <Actions actions={actions} className="mt-7" />
        </div>
        {!textOnly && (
          <div
            className={clsx(
              'relative overflow-hidden',
              imageStyle === 'plain' && image
                ? 'aspect-[6/5]'
                : 'aspect-[4/3] rounded-3xl bg-contrast-100 ring-1 ring-contrast-100',
            )}
          >
            {image ? (
              <Image
                alt={image.alt}
                className={imageStyle === 'plain' ? 'object-contain' : 'object-cover'}
                fill
                preload
                sizes="(min-width: 56rem) 45vw, 100vw"
                src={image.src}
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
  children?: ReactNode;
  className?: string;
}

// A heading, some paragraphs, optional buttons — and anything else as children. With an image
// (or image label) it becomes a two-column split.
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
      <HomeSection className={className} id={id} tint={tint}>
        {copy}
      </HomeSection>
    );
  }

  return (
    <HomeSection className={className} id={id} tint={tint}>
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

export interface Person {
  name: string;
  role: string;
  quote?: string;
  image?: PageImage;
  href?: string;
}

// "The people" — portrait, name, role and a line in their own words.
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
              <span className="relative block aspect-square overflow-hidden rounded-2xl bg-contrast-100">
                {person.image ? (
                  <Image
                    alt={person.image.alt}
                    className="object-cover"
                    fill
                    sizes="(min-width: 64rem) 25vw, 50vw"
                    src={person.image.src}
                  />
                ) : (
                  <MediaPlaceholder label="Portrait" />
                )}
              </span>
              <span className="mt-4 block font-heading text-lg font-semibold leading-tight">
                {person.name}
              </span>
              <span className="mt-0.5 block text-sm text-contrast-500">{person.role}</span>
              {Boolean(person.quote) && (
                <span className="mt-3 block text-sm leading-relaxed text-contrast-500">
                  {person.quote}
                </span>
              )}
            </>
          );
          const cardClassName = 'flex flex-col rounded-3xl border border-contrast-100 bg-white p-5';

          return (
            <li key={person.name + person.role}>
              {person.href ? (
                <Link
                  className={clsx(
                    className,
                    'transition-shadow hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]',
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
export function FinePrint({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <HomeSection className={className} compact>
      <div className="max-w-3xl rounded-2xl border border-contrast-100 bg-[#f9fafd] px-5 py-4 text-xs leading-relaxed text-contrast-500">
        {children}
      </div>
    </HomeSection>
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
