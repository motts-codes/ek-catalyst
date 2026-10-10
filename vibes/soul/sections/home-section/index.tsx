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
  /** Minimal top padding — for a band that should sit right under the hero. */
  tightTop?: boolean;
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
  tightTop = false,
  className,
  children,
}: Props) {
  let verticalPadding = 'py-10 @4xl:py-14';

  if (compact) verticalPadding = 'py-8 @4xl:py-10';
  if (tightTop) verticalPadding = 'pb-10 pt-2 @4xl:pb-14 @4xl:pt-3';

  const hasHeading = Boolean(kicker || title || description || action);

  return (
    <section className={clsx('@container', tint && 'bg-[#f9fafd]', className)} id={id}>
      <div className={clsx('mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14', verticalPadding)}>
        {hasHeading && (
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 @4xl:mb-6">
            <div className="max-w-3xl">
              {Boolean(kicker) && (
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-contrast-400">
                  {kicker}
                </p>
              )}
              {Boolean(title) && <h2 className={homeHeadingClassName}>{title}</h2>}
              {Boolean(description) && (
                <p className="mt-2 text-sm leading-relaxed text-contrast-500 @xl:text-base">
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
