import { clsx } from 'clsx';

import { homeHeadingClassName, HomeSection } from '@/vibes/soul/sections/home-section';
import { Link } from '~/components/link';

import { ShowroomSelect } from './showroom-select';

interface Props {
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

const ghostButtonClassName =
  'inline-flex min-h-10 items-center justify-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10';

// The last ask on a page — "Ready to design your kitchen?" — as a dark panel with three ways to
// say yes at equal weight: book the consult, visit a showroom (dropdown), or call.
export function ClosingBand({
  title = 'Ready to design your kitchen?',
  description = 'Bring a photo, a rough sketch, or nothing at all. A designer draws it with you — at home, in a showroom or on a call — and you leave with a plan and a price.',
  primary = { label: 'Free design consult', href: '#' },
  secondary,
  showrooms = [],
  phone = { label: 'Call 860-247-1000', href: 'tel:+18602471000' },
  tint = false,
  className,
}: Props) {
  return (
    // Extra bottom padding so the space to the footer matches the space above (which is two
    // sections' padding back to back).
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
          <h2 className={homeHeadingClassName}>{title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/85 @xl:text-base">{description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#9f3632]"
              href={primary.href}
            >
              {primary.label}
            </Link>
            {secondary && (
              <Link className={ghostButtonClassName} href={secondary.href}>
                {secondary.label}
              </Link>
            )}
            {showrooms.length > 0 && <ShowroomSelect showrooms={showrooms} />}
            <Link className={ghostButtonClassName} href={phone.href}>
              {phone.label}
            </Link>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
