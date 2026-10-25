import { clsx } from 'clsx';
import { ArrowRight, Check } from 'lucide-react';

import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { Stepper, type StepperIcon } from './stepper';

// The education-first explainer sections (v2): a question answered, the two ways a cabinet can
// arrive, what turns up, where it fits in a remodel, the same-cabinet reassurance, who it suits,
// and a glossary. House style throughout: red eyebrow, big heading, rounded cards on blush.

export type ExplainerIcon = StepperIcon;

const RED = 'text-[var(--button-primary-background,#d90716)]';
const EYEBROW = clsx('mb-1.5 text-xs font-semibold uppercase tracking-wide', RED);
const BLUSH = 'bg-[#fdf8f8]';

interface LinkProps {
  label: string;
  href: string;
}

// A red text link with the arrow that nudges on hover. Hash links use a plain anchor so the
// browser scrolls on the same page.
function TextLink({ label, href, className }: LinkProps & { className?: string }) {
  const cls = clsx('group inline-flex items-center gap-1.5 text-sm font-semibold', RED, className);
  const arrow = (
    <ArrowRight
      className="transition-transform group-hover:translate-x-0.5"
      size={16}
      strokeWidth={2.5}
    />
  );

  return href.startsWith('#') ? (
    <a className={cls} href={href}>
      {label}
      {arrow}
    </a>
  ) : (
    <Link className={cls} href={href}>
      {label}
      {arrow}
    </Link>
  );
}

// A red tick in a circle, the proof-point marker the program cards use.
function Tick() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] text-white">
      <Check aria-hidden size={12} strokeWidth={3} />
    </span>
  );
}

// 1 · The hero asks the reader's question and answers it in two sentences; the photo on the
// right shows the finished result. One soft link to the other program; no shop buttons.
export function ExplainerIntro({
  kicker,
  title,
  description,
  link,
  image,
  imageLabel,
  cutout = false,
}: {
  kicker: string;
  title: string;
  description: string;
  link: LinkProps;
  image?: { src: string; alt: string };
  imageLabel: string;
  /** A transparent render: shown whole with no frame, like a cut-out on the page. */
  cutout?: boolean;
}) {
  return (
    <HomeSection>
      <div className="grid items-center gap-10 @3xl:grid-cols-[1.25fr_1fr] @3xl:gap-16">
        <div className="@3xl:py-6">
          <p className={clsx(EYEBROW, 'mb-2')}>{kicker}</p>
          <h1 className="font-heading text-3xl font-bold leading-tight @xl:text-4xl @4xl:text-[44px]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
            {description}
          </p>
          <TextLink className="mt-6" href={link.href} label={link.label} />
        </div>
        <div
          className={clsx(
            'relative',
            cutout
              ? 'aspect-[16/9]'
              : 'aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100 ring-1 ring-contrast-100',
          )}
        >
          {image ? (
            <Image
              alt={image.alt}
              className={cutout ? 'object-contain' : 'object-cover'}
              fill
              preload
              sizes="(min-width: 56rem) 40vw, 100vw"
              src={image.src}
            />
          ) : (
            <MediaPlaceholder label={imageLabel} />
          )}
        </div>
      </div>
    </HomeSection>
  );
}

// 2 · The core idea, once: two plain photos side by side on white, each with a red headline and
// a line beneath; the second sits a little lower so the pair reads as a step, not a grid.
export function TwoWays({
  kicker,
  title,
  ways,
  line,
  rule,
}: {
  kicker: string;
  title: string;
  ways: Array<{
    key: string;
    name: string;
    summary: string;
    image?: { src: string; alt: string };
    visualLabel: string;
  }>;
  current: string;
  line: string;
  rule: string;
}) {
  return (
    <HomeSection kicker={kicker} title={title}>
      <div className="grid gap-10 @2xl:grid-cols-2 @3xl:gap-14">
        {ways.map((way, index) => (
          <article className={clsx(index === 1 && '@2xl:mt-[100px]')} key={way.key}>
            <div className="relative aspect-[16/9] overflow-hidden bg-contrast-100">
              {way.image ? (
                <Image
                  alt={way.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 42rem) 50vw, 100vw"
                  src={way.image.src}
                />
              ) : (
                <MediaPlaceholder label={way.visualLabel} />
              )}
            </div>
            <h3
              className={clsx(
                'mt-6 font-heading text-xl font-bold leading-tight @xl:text-2xl',
                RED,
              )}
            >
              {way.name}
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
              {way.summary}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
          {line}
        </p>
        <p className="mt-4 inline-flex rounded-full border border-[#fcb6bb] bg-white px-5 py-2.5 font-heading text-base font-bold @xl:text-lg">
          {rule}
        </p>
      </div>
    </HomeSection>
  );
}

// 3 · Makes it concrete: what's on the pallet (ticked), the delivery note, the photo.
export function Arrives({
  kicker,
  title,
  description,
  items,
  note,
  image,
  imageLabel,
}: {
  kicker: string;
  title: string;
  description: string;
  items: string[];
  note: string;
  image?: { src: string; alt: string };
  imageLabel: string;
}) {
  return (
    <HomeSection>
      <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <div>
          <p className={EYEBROW}>{kicker}</p>
          <h2 className={homeHeadingClassName}>{title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
            {description}
          </p>
          <ul className="mt-6 space-y-3 text-sm @xl:text-base">
            {items.map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <Tick />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p
            className={clsx(
              'mt-6 max-w-xl rounded-2xl px-5 py-4 text-sm leading-relaxed text-contrast-500',
              BLUSH,
            )}
          >
            {note}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100 ring-1 ring-contrast-100">
          {image ? (
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 50vw, 100vw"
              src={image.src}
            />
          ) : (
            <MediaPlaceholder label={imageLabel} />
          )}
        </div>
      </div>
    </HomeSection>
  );
}

// 4 · Where this step sits in a remodel: the animated stepper (see stepper.tsx).
export function Timeline({
  kicker,
  title,
  description,
  steps,
}: {
  kicker: string;
  title: string;
  description?: string;
  steps: Array<{ icon: ExplainerIcon; lead: string; text: string }>;
}) {
  return (
    <HomeSection className={BLUSH} description={description} kicker={kicker} title={title}>
      <Stepper steps={steps} />
    </HomeSection>
  );
}

// 5 · The reassurance, in plain words: not a premium version, the same cabinet. The build-quality
// red panel from the listing page follows it on the page.
export function SameCabinet({
  kicker,
  title,
  description,
  note,
}: {
  kicker: string;
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <HomeSection halfPadding>
      <p className={EYEBROW}>{kicker}</p>
      <h2 className={homeHeadingClassName}>{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
        {description}
      </p>
      {Boolean(note) && <p className="mt-3 max-w-3xl text-sm text-contrast-400">{note}</p>}
    </HomeSection>
  );
}

// 7 · Who it suits: the reasons as ticked cards, then the line that points the other way.
export function Suits({
  kicker,
  title,
  points,
  line,
  link,
}: {
  kicker: string;
  title: string;
  points: string[];
  line: string;
  link: LinkProps;
}) {
  return (
    <HomeSection className={BLUSH} kicker={kicker} title={title}>
      <ul className="grid gap-4 @xl:grid-cols-2">
        {points.map((point) => (
          <li
            className="flex items-start gap-3 rounded-3xl border border-contrast-100 bg-white p-5 text-sm leading-relaxed @xl:p-6 @xl:text-base"
            key={point}
          >
            <Tick />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-contrast-500 @xl:text-base">
        <span>{line}</span>
        <TextLink href={link.href} label={link.label} />
      </p>
    </HomeSection>
  );
}

// 8 · The words they'll meet on the collection pages, as a two-column definition list.
export function Glossary({
  id,
  kicker,
  title,
  terms,
}: {
  id?: string;
  kicker: string;
  title: string;
  terms: Array<{ term: string; definition: string }>;
}) {
  return (
    <HomeSection id={id} kicker={kicker} title={title}>
      <dl className="grid border-t border-contrast-100 @3xl:grid-cols-2 @3xl:gap-x-14">
        {terms.map((entry) => (
          <div className="border-b border-contrast-100 py-4 @xl:py-5" key={entry.term}>
            <dt className="font-heading text-base font-semibold @xl:text-lg">{entry.term}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-contrast-500 @xl:text-base">
              {entry.definition}
            </dd>
          </div>
        ))}
      </dl>
    </HomeSection>
  );
}
