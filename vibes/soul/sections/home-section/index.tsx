import { clsx } from 'clsx';
import { ReactNode } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';

export interface HomeSectionAction {
  label: string;
  href: string;
}

/** Section heading (h2) style shared by every home/Pro band: smaller and bold. */
export const homeHeadingClassName =
  'font-heading text-xl font-bold leading-tight @xl:text-2xl @4xl:text-[28px]';

// The quieter variant: h3-sized. Still an h2 in the outline, so heading order and screen-reader
// navigation are unchanged.
export const smallHeadingClassName = 'font-heading text-lg font-bold leading-tight @xl:text-xl';

interface Props {
  /** Anchor id for in-page jump links (e.g. "pro-program"). */
  id?: string;
  /** Small uppercase line above the title (e.g. "Best sellers"). */
  kicker?: string;
  title?: string;
  description?: string;
  /** Optional button rendered on the right of the heading row (e.g. "View all"). */
  action?: HomeSectionAction;
  /** Tinted background (the wireframe's alternating "alt" bands). */
  tint?: boolean;
  /** Tighter vertical padding (used for narrow bands). */
  compact?: boolean;
  /** Half the default vertical padding. */
  halfPadding?: boolean;
  /** Minimal top padding — for a band that should sit right under the hero. */
  tightTop?: boolean;
  /** `small`: an h3-sized title, for a band that shouldn't compete with the hero. */
  headingStyle?: 'default' | 'small';
  /** `red`: the band on brand red with the heading row in white. */
  tone?: 'default' | 'red';
  /** `red`: just the title in brand red (on a normal band). */
  titleTone?: 'default' | 'red';
  className?: string;
  children: ReactNode;
}

// Shared shell for the home-page bands: the page-width container, alternating tint, and the
// kicker / title / description / action heading row. Every home section uses it so spacing and
// typography match across the page.
export function HomeSection({
  id,
  kicker,
  title,
  description,
  action,
  tint = false,
  compact = false,
  halfPadding = false,
  tightTop = false,
  headingStyle = 'default',
  className,
  children,
  tone = 'default',
  titleTone = 'default',
}: Props) {
  let verticalPadding = 'py-10 @4xl:py-14';

  if (compact) verticalPadding = 'py-8 @4xl:py-10';
  if (halfPadding) verticalPadding = 'py-5 @4xl:py-7';
  if (tightTop) verticalPadding = 'pb-10 pt-2 @4xl:pb-14 @4xl:pt-3';

  const hasHeading = Boolean(kicker || title || description || action);

  return (
    <section
      className={clsx(
        '@container',
        tint && 'bg-[#f9fafd]',
        tone === 'red' && 'bg-[var(--button-primary-background,#d90716)] text-white',
        className,
      )}
      id={id}
    >
      <div className={clsx('mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14', verticalPadding)}>
        {hasHeading && (
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 @4xl:mb-6">
            <div className="max-w-3xl">
              {Boolean(kicker) && (
                <p
                  className={clsx(
                    'mb-1.5 text-xs font-semibold uppercase tracking-wide',
                    tone === 'red'
                      ? 'text-white'
                      : 'text-[var(--button-primary-background,#d90716)]',
                  )}
                >
                  {kicker}
                </p>
              )}
              {Boolean(title) && (
                <h2
                  className={clsx(
                    headingStyle === 'small' ? smallHeadingClassName : homeHeadingClassName,
                    titleTone === 'red' && 'text-[var(--button-primary-background,#d90716)]',
                  )}
                >
                  {title}
                </h2>
              )}
              {Boolean(description) && (
                <p
                  className={clsx(
                    'mt-2 text-sm leading-relaxed @xl:text-base',
                    tone === 'red' ? 'text-white' : 'text-contrast-500',
                  )}
                >
                  {description}
                </p>
              )}
            </div>
            {action && (
              <ButtonLink href={action.href} shape="pill" size="small" variant="secondary">
                {action.label}
              </ButtonLink>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// Neutral image placeholder used by home cards when no photo has been supplied yet.
export function MediaPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    // Decorative until a real image replaces it — hidden from assistive tech.
    <div
      aria-hidden
      className={clsx(
        'flex h-full w-full items-center justify-center bg-contrast-100 p-4 text-center',
        className,
      )}
    >
      <span className="text-lg font-bold leading-snug tracking-tighter text-contrast-400 @xs:text-2xl">
        {label}
      </span>
    </div>
  );
}
