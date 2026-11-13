'use client';

import { clsx } from 'clsx';
import React from 'react';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';

export function SidebarMenuLink({
  className,
  href,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Link>) {
  const pathname = usePathname();
  const linkPathname = typeof href === 'string' ? href : (href.pathname ?? null);
  // Trailing slashes differ between the configured hrefs ("/account/wishlists/") and the
  // current pathname ("/account/wishlists"), so compare without them; a sub-route
  // ("/account/wishlists/123") keeps its parent highlighted.
  const trim = (path: string) => path.replace(/\/+$/, '');
  const isActive =
    linkPathname !== null &&
    (trim(pathname) === trim(linkPathname) || trim(pathname).startsWith(`${trim(linkPathname)}/`));

  return (
    <Link
      {...rest}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'flex min-h-10 items-center rounded-md px-3 text-sm font-semibold transition-colors',
        // Active: brand red on the light red band; the rest grey on hover.
        isActive
          ? 'bg-[#fdf3f5] text-[var(--button-primary-background,#d90716)]'
          : 'hover:bg-contrast-100',
        className,
      )}
      href={href}
    />
  );
}
