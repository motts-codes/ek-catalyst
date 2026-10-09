import { clsx } from 'clsx';
import { Phone } from 'lucide-react';

import { Link } from '~/components/link';

// Thin utility strip above the main header, per the wireframe:
//   Call 860-247-1000 ······ Free Samples | 0% Financing | Showrooms | [Homeowner ⟷ Pro]
// The Homeowner/Pro switch is passed in as `audienceToggle` and sits at the right end.
//
// Layout: the fade runs full-bleed (mode tint at the top → transparent at the bottom); the
// content sits in the same container as the nav card and the hero. The side padding is the
// container padding (px-4 / @xl:px-6 / @4xl:px-8) plus the nav card's inner padding, so the call
// number lines up with the logo and the switch with the icons.
const PHONE = { label: '860-247-1000', href: 'tel:+18602471000' };

// Same links for both audiences. `href: '#'` = page not built yet. `mobile: true` links stay in the
// bar on small screens; the rest are hidden below md (on phones: call number · Showrooms · the
// HO/Pro switch). `highlight: true` renders a link in brand red.
const UTILITY_LINKS: Array<{ label: string; href: string; highlight?: boolean; mobile?: boolean }> =
  [
    { label: 'Free Samples', href: '/samples' },
    { label: '0% Financing', href: '/financing' },
    { label: 'Showrooms', href: '/showrooms', mobile: true },
  ];

// Top color of the fade per mode (the pink tint for Homeowner, the Pro blue tint for Pro). Colors
// come from CSS variables (see globals.css --utility-bar-*) so the bar can be restyled in one place.
const FADE_FROM: Record<'homeowner' | 'pro', string> = {
  homeowner: 'var(--utility-bar-background, #fbe7e7)',
  pro: '#a9d6e073',
};

export function UtilityBar({
  mode = 'homeowner',
  audienceToggle,
}: {
  mode?: 'homeowner' | 'pro';
  audienceToggle?: React.ReactNode;
}) {
  return (
    // Full-bleed fade; the content inside is constrained to the same container as the nav card and
    // the hero, so the text lines up with them while the color runs edge to edge.
    <div
      className="text-[var(--utility-bar-text,#d1d1d1)]"
      style={{ background: `linear-gradient(to bottom, ${FADE_FROM[mode]}, transparent)` }}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-7 py-1.5 text-xs @xl:px-9 @4xl:px-14">
        {/* Left: call number */}
        <Link
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium transition-colors hover:text-[var(--utility-bar-text-hover,#fff)]"
          href={PHONE.href}
        >
          <Phone size={13} strokeWidth={1.75} />
          <span className="hidden sm:inline">Call </span>
          {PHONE.label}
        </Link>

        {/* Right: utility links, separated by dividers. Non-mobile links (and their dividers) are
            hidden below md; the divider sits before each link and hides on the first shown one via
            the flex container's first-child rule. */}
        <nav
          aria-label="Utility"
          className="flex items-center [&>span:first-child>[data-divider]]:hidden"
        >
          {UTILITY_LINKS.map((link) => (
            <span
              className={clsx('flex items-center', !link.mobile && 'hidden md:flex')}
              key={link.label}
            >
              {/* A mobile-visible link is the first thing after the phone number on phones, so
                  its divider only appears from md up (where the desktop links precede it). */}
              <span
                aria-hidden
                className={clsx(
                  'mx-2 h-3 w-px bg-[var(--utility-bar-divider,#3a3a3a)] md:mx-3',
                  link.mobile && 'hidden md:block',
                )}
                data-divider
              />
              <Link
                className={clsx(
                  'transition-colors',
                  link.highlight
                    ? 'font-semibold text-[var(--button-primary-background,#d90716)] hover:opacity-80'
                    : 'hover:text-[var(--utility-bar-text-hover,#fff)]',
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            </span>
          ))}
          {audienceToggle != null && (
            <span className="flex shrink-0 items-center">
              <span
                aria-hidden
                className="mx-2 h-3 w-px bg-[var(--utility-bar-divider,#3a3a3a)] md:mx-3"
                data-divider
              />
              {audienceToggle}
            </span>
          )}
        </nav>
      </div>
    </div>
  );
}
