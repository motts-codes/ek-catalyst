import { clsx } from 'clsx';
import { Phone } from 'lucide-react';

import { Link } from '~/components/link';

// Thin utility strip above the main header. Static (same for both audience modes) — the
// Homeowner/Pro toggle lives in the main nav row, not here. Edit the phone number / links below.
const PHONE = { label: '860-247-1000', href: 'tel:+18602471000' };

// `mobile: true` links stay in the bar on small screens; the rest are hidden below md.
const UTILITY_LINKS: Array<{ label: string; href: string; highlight?: boolean; mobile?: boolean }> = [
  { label: 'Sale', href: '#', highlight: true, mobile: true },
  { label: 'Free Samples', href: '#' },
  { label: '0% Financing', href: '#' },
  { label: 'Download Catalog', href: '#' },
  { label: 'Showrooms', href: '#', mobile: true },
];

// Colors come from CSS variables (see globals.css --utility-bar-*) so the bar can be restyled in
// one place. In Pro audience mode the background shifts to the Pro blue tint. Shown at all sizes;
// on mobile only the `mobile` links (Sale, Showrooms) remain alongside the call number.
export function UtilityBar({ mode }: { mode?: 'homeowner' | 'pro' }) {
  return (
    <div
      className="text-[var(--utility-bar-text,#d1d1d1)]"
      style={{ background: mode === 'pro' ? '#a9d6e073' : 'var(--utility-bar-background,#111111)' }}
    >
      {/* Desktop L/R padding is tuned so the call number lines up under the EK logo and the right
          links line up under the shopping icons in the main nav below. */}
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-1.5 text-xs md:pl-10 md:pr-7">
        {/* Left: call number */}
        <Link
          className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[var(--utility-bar-text-hover,#fff)]"
          href={PHONE.href}
        >
          <Phone size={13} strokeWidth={1.75} />
          <span className="hidden sm:inline">Call </span>
          {PHONE.label}
        </Link>

        {/* Right: utility links, separated by dividers. Non-mobile links (and their dividers) are
            hidden below md; the divider sits before each link and hides on the first shown one via
            the flex container's first-child rule. */}
        <nav aria-label="Utility" className="flex items-center [&>span:first-child>[data-divider]]:hidden">
          {UTILITY_LINKS.map((link) => (
            <span
              className={clsx('flex items-center', !link.mobile && 'hidden md:flex')}
              key={link.label}
            >
              <span
                aria-hidden
                className="mx-3 h-3 w-px bg-[var(--utility-bar-divider,#3a3a3a)]"
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
        </nav>
      </div>
    </div>
  );
}
