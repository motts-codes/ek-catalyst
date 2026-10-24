import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { homeHeadingClassName, HomeSection } from '@/vibes/soul/sections/home-section';

import { ShowroomSelect } from './showroom-select';

interface Props {
  /** Small eyebrow above the heading (white, since the band is red). */
  kicker?: string;
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  /** Optional second button between the primary and the phone (e.g. "Visit the factory outlet"). */
  secondary?: { label: string; href: string };
  showrooms?: Array<{ name: string; href: string }>;
  phone?: { label: string; href: string };
  tint?: boolean;
  className?: string;
}

// The outline buttons as the site's sliding button: white outline, sweeping to a white fill with
// the panel's red text on hover.
const outlineButtonClassName =
  'transition-colors [--button-ghost-background-hover:white] [--button-ghost-border:rgb(255_255_255/0.3)] [--button-ghost-text:white] hover:[--button-ghost-border:white] hover:[--button-ghost-text:#9f3632] focus-visible:ring-white focus-visible:ring-offset-[#9f3632]';

// The last ask on a page — "Ready to design your kitchen?" — as a dark panel with three ways to
// say yes at equal weight: book the consult, visit a showroom (dropdown), or call.
export function ClosingBand({
  kicker,
  title = 'What would your kitchen actually cost?',
  description = 'Got your number? The next step is a person. A designer plans the layout with you on a video call, or you can see the cabinets up close at one of our six Connecticut showrooms. Either way it is free, and you leave with a plan.',
  primary = { label: 'Free design consult', href: '#' },
  secondary,
  showrooms = [],
  phone = { label: 'Call 860-247-1000', href: 'tel:+18602471000' },
  tint = false,
  className,
}: Props) {
  return (
    // Extra bottom padding so the space to the footer's first content matches the space above
    // (the previous section's bottom padding plus this band's top padding).
    <HomeSection className={clsx('pb-10 lg:pb-14', className)} tint={tint}>
      {/* Deep brand red (#9F3632): white text is 6.9:1 on it. The primary button is black here,
          since the brand-red button would sit at 1.3:1 against this panel. */}
      <div className="relative overflow-hidden rounded-3xl bg-[#9f3632] px-6 py-12 text-center text-white @xl:px-12 @xl:py-16 @4xl:py-20">
        {/* Soft lighter glow, top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          {Boolean(kicker) && (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/85">
              {kicker}
            </p>
          )}
          <h2 className={homeHeadingClassName}>{title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/85 @xl:text-base">{description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {/* The site's sliding button: black, sweeping to white with black text on hover. */}
            <ButtonLink
              className="border-foreground bg-foreground text-white after:!bg-white hover:!text-foreground focus-visible:ring-white focus-visible:ring-offset-[#9f3632] [&>span]:mix-blend-normal"
              href={primary.href}
              shape="pill"
              size="small"
              variant="secondary"
            >
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink
                className={outlineButtonClassName}
                href={secondary.href}
                shape="pill"
                size="small"
                variant="ghost"
              >
                {secondary.label}
              </ButtonLink>
            )}
            {showrooms.length > 0 && <ShowroomSelect showrooms={showrooms} />}
            <ButtonLink
              className={outlineButtonClassName}
              href={phone.href}
              shape="pill"
              size="small"
              variant="ghost"
            >
              {phone.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
