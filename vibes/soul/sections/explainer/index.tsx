import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

interface HeroProps {
  kicker?: string;
  title: string;
  description: string;
  actions: Array<{ label: string; href: string; primary?: boolean }>;
  className?: string;
}

// Plain-words opener for a guided explainer: kicker, a long headline, one paragraph and the
// shop button first (the escape to the catalog is never more than one click away).
export function ExplainerHero({ kicker, title, description, actions, className }: HeroProps) {
  return (
    <HomeSection className={className} compact>
      <div className="max-w-3xl">
        {Boolean(kicker) && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-contrast-400">
            {kicker}
          </p>
        )}
        <h1 className="font-heading text-3xl font-bold leading-tight @xl:text-4xl @4xl:text-[44px]">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-contrast-500 @xl:text-base">
          {description}
        </p>
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
      </div>
    </HomeSection>
  );
}

export interface ExplainerStep {
  label: string;
  value: string;
}

interface StepsProps {
  title: string;
  description: string;
  /** Three quick facts (Time / Tools / People) shown as a row of small cards above the paragraph. */
  steps?: ExplainerStep[];
  /** Two-column schedule ("Order → day 0") shown under the paragraph. */
  schedule?: Array<[string, string]>;
  mediaLabel: string;
  media?: { src: string; alt: string };
  tint?: boolean;
  className?: string;
}

// "Can I do this?" (RTA) / "What factory assembly includes" (assembled): copy on the left, a
// video or photo on the right.
export function ExplainerSteps({
  title,
  description,
  steps = [],
  schedule = [],
  mediaLabel,
  media,
  tint,
  className,
}: StepsProps) {
  return (
    <HomeSection className={className} tint={tint}>
      <div className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-14">
        <div>
          <h2 className={homeHeadingClassName}>{title}</h2>
          {steps.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {steps.map((step) => (
                <div
                  className="rounded-2xl border border-contrast-100 bg-white px-4 py-3.5"
                  key={step.label}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-contrast-400">
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug">{step.value}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
            {description}
          </p>
          {schedule.length > 0 && (
            <dl className="mt-6 divide-y divide-contrast-100 rounded-2xl border border-contrast-100 bg-white">
              {schedule.map(([step, when]) => (
                <div
                  className="flex items-center justify-between gap-6 px-5 py-3 text-sm"
                  key={step}
                >
                  <dt className="font-semibold">{step}</dt>
                  <dd className="text-contrast-500">{when}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100 ring-1 ring-contrast-100">
          {media ? (
            <Image
              alt={media.alt}
              className="object-cover"
              fill
              sizes="(min-width: 56rem) 50vw, 100vw"
              src={media.src}
              unoptimized
            />
          ) : (
            <MediaPlaceholder label={mediaLabel} />
          )}
        </div>
      </div>
    </HomeSection>
  );
}

export interface PairCard {
  kicker: string;
  title: string;
  description: string;
  cta: { label: string; href: string; primary?: boolean };
}

interface PairProps {
  cards: PairCard[];
  tint?: boolean;
  className?: string;
}

// The escape hatch: "Not sure? Get it assembled." beside "Have us design it".
export function ExplainerPair({ cards, tint, className }: PairProps) {
  return (
    <HomeSection className={className} compact tint={tint}>
      <div className="grid gap-5 @3xl:grid-cols-2">
        {cards.map((card) => (
          <div
            className={clsx(
              'flex flex-col rounded-3xl border border-contrast-100 bg-white p-7 @xl:p-8',
            )}
            key={card.title}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-contrast-400">
              {card.kicker}
            </p>
            <h3 className="mt-2 font-heading text-xl font-bold leading-tight @xl:text-2xl">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-contrast-500 @xl:text-base">
              {card.description}
            </p>
            <div className="mt-6">
              <ButtonLink
                href={card.cta.href}
                shape="pill"
                size="small"
                variant={card.cta.primary ? 'primary' : 'secondary'}
              >
                {card.cta.label}
              </ButtonLink>
            </div>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
