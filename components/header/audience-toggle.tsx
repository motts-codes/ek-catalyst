'use client';

import { clsx } from 'clsx';
import { useTransition } from 'react';

import { usePathname } from '~/i18n/routing';
import { AudienceMode } from '~/lib/navigation/menu-config';
import { switchAudienceMode } from '~/lib/navigation/switch-audience-action';

interface Props {
  mode: AudienceMode;
}

// Mode colors: Homeowner = brand red, Pro = brand blue (same blue as the header CTA). Used for the
// switch track and the active label.
const MODE_COLOR: Record<AudienceMode, string> = {
  homeowner: 'var(--button-primary-background, #d90716)',
  pro: '#2162a1',
};

// Strip the leading locale segment (e.g. "/en/pro" -> "/pro", "/en" -> "/") so we can tell whether
// we're on the home page or the Pro landing page regardless of locale.
function pathWithoutLocale(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/i, '');

  return withoutLocale === '' ? '/' : withoutLocale;
}

// Homeowner ⟷ Pro audience switch — "Homeowner [●  ] Pro", as in the wireframe utility strip.
// The track is red in Homeowner mode and blue in Pro mode; the knob sits on the active side.
// Clicking sets the ek_audience cookie via a server action, then navigates:
//  - Pro selected on the home page  → /pro (the Pro landing page)
//  - Homeowner selected on /pro      → / (home)
//  - anywhere else                   → reload in place (just swap menu/branding)
export function AudienceToggle({ mode }: Props) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const isPro = mode === 'pro';
  const next: AudienceMode = isPro ? 'homeowner' : 'pro';

  return (
    <button
      aria-checked={isPro}
      aria-label={`Audience mode: ${isPro ? 'Pro' : 'Homeowner'}. Switch to ${isPro ? 'Homeowner' : 'Pro'}.`}
      className="inline-flex select-none items-center gap-2 text-xs disabled:cursor-wait"
      data-pending={isPending ? true : null}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await switchAudienceMode(next);

          // Decide where to go based on the current page. The locale prefix (e.g. "/en") is
          // preserved so navigation stays within the active locale.
          const relative = pathWithoutLocale(pathname);
          const localePrefix = /^\/[a-z]{2}(?=\/|$)/i.exec(pathname)?.[0] ?? '';
          let destination: string | null = null;

          if (next === 'pro' && relative === '/') {
            destination = `${localePrefix}/pro`;
          } else if (next === 'homeowner' && relative === '/pro') {
            destination = localePrefix || '/';
          }

          if (destination) {
            // Navigate to the audience landing page (full load re-reads the cookie).
            window.location.href = destination;
          } else {
            // Same page — full reload so the server re-renders the header in the new mode.
            // (router.refresh() doesn't reliably bust the cached header shell here.)
            window.location.reload();
          }
        })
      }
      role="switch"
      type="button"
    >
      {/* Title-case labels; the selected side is medium weight in its mode color, the other is
          regular and faded. */}
      <span
        className={clsx('transition-colors', isPro ? 'font-normal opacity-70' : 'font-medium')}
        style={isPro ? undefined : { color: MODE_COLOR.homeowner }}
      >
        {/* "HO" on phones to save room in the utility strip; the full word from md up. */}
        <span className="md:hidden">HO</span>
        <span className="hidden md:inline">Homeowner</span>
      </span>
      {/* Track + knob. Knob slides to the right in Pro mode. */}
      <span
        aria-hidden
        className="relative h-[18px] w-[34px] shrink-0 rounded-full transition-colors"
        style={{ background: MODE_COLOR[mode] }}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-[left] duration-200',
            isPro ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </span>
      <span
        className={clsx('transition-colors', isPro ? 'font-medium' : 'font-normal opacity-70')}
        style={isPro ? { color: MODE_COLOR.pro } : undefined}
      >
        Pro
      </span>
    </button>
  );
}
