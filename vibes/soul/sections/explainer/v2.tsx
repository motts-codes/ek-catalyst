import { clsx } from 'clsx';
import { ArrowRight, Check } from 'lucide-react';

import { StarCheck } from '@/vibes/soul/primitives/icons/star-check';
import { MinimalTable } from '@/vibes/soul/sections/delivery-ladder';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { type GlossaryTerm, GlossaryWords } from './glossary-words';
import { Stepper, type StepperIcon } from './stepper';

// The education-first explainer sections (v2): a question answered, the two ways a cabinet can
// arrive, what turns up, where it fits in a remodel, the same-cabinet reassurance, and who it
// suits beside a glossary. House style throughout: red eyebrow, big heading, rounded cards on blush.

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
// right (an even split, so it sits centred) shows the finished result. No shop buttons.
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
  link?: LinkProps;
  image?: { src: string; alt: string };
  imageLabel: string;
  /** A transparent render: shown whole with no frame, like a cut-out on the page. */
  cutout?: boolean;
}) {
  return (
    <HomeSection>
      <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <div className="@3xl:py-6">
          <p className={clsx(EYEBROW, 'mb-2')}>{kicker}</p>
          <h1 className="font-heading text-3xl font-bold leading-tight @xl:text-4xl @4xl:text-[44px]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
            {description}
          </p>
          {link && <TextLink className="mt-6" href={link.href} label={link.label} />}
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
// a line beneath.
export function TwoWays({
  kicker,
  title,
  ways,
  line,
  rules,
}: {
  kicker: string;
  title: string;
  ways: Array<{
    key: string;
    name: string;
    summary: string;
    image?: { src: string; alt: string };
    visualLabel: string;
    /** A soft link under the summary (the other program's card links to its page). */
    link?: LinkProps;
  }>;
  current: string;
  line: string;
  rules: string[];
}) {
  return (
    <HomeSection kicker={kicker} title={title}>
      {/* The one-line truth and the rule of thumb sit under the heading, above the photos. */}
      <div className="-mt-1 mb-10 @3xl:mb-12">
        <p className="max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">{line}</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {rules.map((rule) => (
            <li
              className="inline-flex items-center gap-2 font-heading text-base font-bold @xl:text-lg"
              key={rule}
            >
              <StarCheck aria-hidden className={clsx('shrink-0', RED)} size={20} />
              {rule}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-10 @2xl:grid-cols-2 @3xl:gap-14">
        {ways.map((way) => (
          <article className="flex flex-col" key={way.key}>
            {/* The 16:9 photos sit in a slightly wider frame anchored at the bottom, which trims
                about 50px of empty space off the top at desktop width. */}
            <div className="relative aspect-[2.07/1] overflow-hidden bg-contrast-100">
              {way.image ? (
                <Image
                  alt={way.image.alt}
                  className="object-cover object-bottom"
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
            <p className="mt-2 max-w-[30rem] text-sm leading-relaxed text-contrast-500 @xl:text-base">
              {way.summary}
            </p>
            {way.link && <TextLink className="mt-3" href={way.link.href} label={way.link.label} />}
            {/* A thin red rule closes each column; mt-auto keeps the two rules level. */}
            <div className="mt-auto pt-6">
              <span
                aria-hidden
                className="block h-px w-full bg-[var(--button-primary-background,#d90716)]"
              />
            </div>
          </article>
        ))}
      </div>
    </HomeSection>
  );
}

// 3 · Makes it concrete: the photo on the left; what's on the pallet (ticked) and the delivery
// note on the right.
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
        <div className="@3xl:order-2">
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
        <div className="relative aspect-[4/3] @3xl:order-1">
          {image ? (
            <Image
              alt={image.alt}
              className="object-contain"
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
  media,
}: {
  kicker: string;
  title: string;
  description?: string;
  steps: Array<{ icon: ExplainerIcon; lead: string; text: string }>;
  /** An optional clip under the steps (RTA: one base cabinet built, start to finish). */
  media?: {
    label: string;
    youtubeId?: string;
    video?: { mp4?: string; webm?: string; poster?: string; captions: string };
    link?: LinkProps;
  };
}) {
  return (
    <HomeSection className={BLUSH} description={description} kicker={kicker} title={title}>
      <Stepper steps={steps} />
      {media && (
        <div className="mt-12 grid items-center gap-8 @3xl:grid-cols-[3fr_2fr] @3xl:gap-14">
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-contrast-100 ring-1 ring-contrast-100">
            <TimelineMedia media={media} />
          </div>
          <div>
            <p className="text-sm leading-relaxed text-contrast-500 @xl:text-base">{media.label}</p>
            {media.link && (
              <TextLink className="mt-4" href={media.link.href} label={media.link.label} />
            )}
          </div>
        </div>
      )}
    </HomeSection>
  );
}

type TimelineMediaProps = NonNullable<Parameters<typeof Timeline>[0]['media']>;

// The clip itself: a YouTube embed, a self-hosted video with captions, or the placeholder.
function TimelineMedia({ media }: { media: TimelineMediaProps }) {
  if (media.youtubeId) {
    return (
      <iframe
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 size-full"
        loading="lazy"
        src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}`}
        title={media.label}
      />
    );
  }

  if (media.video?.mp4 || media.video?.webm) {
    return (
      <video
        className="h-full w-full object-cover"
        controls
        playsInline
        poster={media.video.poster}
        preload="metadata"
      >
        {media.video.webm ? <source src={media.video.webm} type="video/webm" /> : null}
        {media.video.mp4 ? <source src={media.video.mp4} type="video/mp4" /> : null}
        <track default kind="captions" label="English" src={media.video.captions} srcLang="en" />
      </video>
    );
  }

  return <MediaPlaceholder label={media.label} />;
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

// 6 · Money or time: an even split. Heading, paragraph, the quiet table and the 10×10 footnote
// on the left; the Avon kitchen the table prices fills the whole right-hand column.
export function MoneyOrTime({
  kicker,
  title,
  description,
  columns,
  rows,
  footnote,
  footnoteLink,
  image,
  imageLabel,
}: {
  kicker: string;
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
  footnote: string;
  footnoteLink?: LinkProps;
  image?: { src: string; alt: string };
  imageLabel: string;
}) {
  return (
    <HomeSection>
      <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <div>
          <p className={EYEBROW}>{kicker}</p>
          <h2 className={homeHeadingClassName}>{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-contrast-500 @xl:text-base">
            {description}
          </p>
          <div className="mt-8">
            {/* The feature column fits its labels; RTA runs a little wider than Assembled. */}
            <MinimalTable
              columns={columns}
              inline
              narrow
              rows={rows}
              widths={['w-[36%]', 'w-[28%]']}
            />
          </div>
          <p className="mt-5 text-xs leading-relaxed text-contrast-400">
            {footnote}{' '}
            {footnoteLink && (
              <a className="underline underline-offset-2" href={footnoteLink.href}>
                {footnoteLink.label} →
              </a>
            )}
          </p>
        </div>
        <div className="relative min-h-[18rem] overflow-hidden rounded-3xl bg-contrast-100 ring-1 ring-contrast-100 @3xl:min-h-full">
          {image ? (
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 50vw, 100vw"
              src={image.src}
              unoptimized
            />
          ) : (
            <MediaPlaceholder label={imageLabel} />
          )}
        </div>
      </div>
    </HomeSection>
  );
}

// 7 + 8 · A full-width band split in two: who it suits (brand red, ticked bullets) and the
// glossary (a light tint of the collection pages' blue, a run of words whose meaning shows beneath and
// cycles). The id anchors the
// 10×10 link.
export function SuitsAndGlossary({
  id,
  suits,
  glossary,
}: {
  id?: string;
  suits: { kicker: string; title: string; points: string[]; line: string; link: LinkProps };
  glossary: {
    kicker: string;
    title: string;
    terms: GlossaryTerm[];
    link?: LinkProps;
  };
}) {
  return (
    // Full bleed: the left half red, the right half black, meeting in the middle. Each half keeps
    // the page's side margin: the container padding plus the slack once the 96rem column is
    // centred.
    <div className="scroll-mt-24 @container" id={id}>
      <div className="grid @3xl:grid-cols-2">
        <section className="flex flex-col bg-[var(--button-primary-background,#d90716)] px-6 py-12 text-white @xl:px-9 @3xl:py-16 @4xl:pl-[max(3.5rem,calc((100cqw-96rem)/2+3.5rem))] @4xl:pr-14">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white">
            {suits.kicker}
          </p>
          <h2 className={homeHeadingClassName}>{suits.title}</h2>
          <ul className="mt-6 space-y-3.5 text-sm @xl:text-base">
            {suits.points.map((point) => (
              <li className="flex items-start gap-3" key={point}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[var(--button-primary-background,#d90716)]">
                  <Check aria-hidden size={12} strokeWidth={3} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-8 text-sm text-white">
            <span>{suits.line}</span>
            <Link
              className="group inline-flex items-center gap-1.5 font-semibold text-white underline-offset-4 hover:underline"
              href={suits.link.href}
            >
              {suits.link.label}
              <ArrowRight
                className="transition-transform group-hover:translate-x-0.5"
                size={16}
                strokeWidth={2.5}
              />
            </Link>
          </p>
        </section>
        <section className="bg-[#C0EDF6]/40 px-6 py-12 text-foreground @xl:px-9 @3xl:py-16 @4xl:pl-14 @4xl:pr-[max(3.5rem,calc((100cqw-96rem)/2+3.5rem))]">
          <p className={EYEBROW}>{glossary.kicker}</p>
          <h2 className={homeHeadingClassName}>{glossary.title}</h2>
          <div className="mt-6">
            <GlossaryWords link={glossary.link} terms={glossary.terms} />
          </div>
        </section>
      </div>
    </div>
  );
}
