import { Phone } from 'lucide-react';

import { Link } from '~/components/link';

// Thin utility strip above the main header. Static (same for both audience modes) — the
// Homeowner/Pro toggle lives in the main nav row, not here. Edit the phone number / links below.
const PHONE = { label: '860-247-1000', href: 'tel:+18602471000' };

const UTILITY_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Free Samples', href: '#' },
  { label: '0% Financing', href: '#' },
  { label: 'Download Catalog', href: '#' },
  { label: 'Showrooms', href: '#' },
];

// Colors come from CSS variables (see globals.css --utility-bar-*) so the bar can be restyled in
// one place. Dark by default.
export function UtilityBar() {
  return (
    <div className="hidden bg-[var(--utility-bar-background,#111111)] text-[var(--utility-bar-text,#d1d1d1)] md:block">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-1.5 text-xs @xl:px-6 @4xl:px-8">
        {/* Left: call number */}
        <Link
          className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[var(--utility-bar-text-hover,#fff)]"
          href={PHONE.href}
        >
          <Phone size={13} strokeWidth={1.75} />
          Call {PHONE.label}
        </Link>

        {/* Right: utility links, divider-separated */}
        <nav aria-label="Utility" className="flex items-center">
          {UTILITY_LINKS.map((link, i) => (
            <span className="flex items-center" key={link.label}>
              {i > 0 && (
                <span
                  aria-hidden
                  className="mx-3 h-3 w-px bg-[var(--utility-bar-divider,#3a3a3a)]"
                />
              )}
              <Link
                className="transition-colors hover:text-[var(--utility-bar-text-hover,#fff)]"
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
