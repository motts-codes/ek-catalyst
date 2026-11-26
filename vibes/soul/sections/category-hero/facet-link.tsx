'use client';

import { useSearchParams } from 'next/navigation';
import { type ComponentPropsWithoutRef } from 'react';

import { Link } from '~/components/link';

// Paging is dropped whenever the narrowing changes, so the visitor starts at page one.
const PAGING = ['page', 'before', 'after'];

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> & { href: string };

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// eslint-disable-next-line valid-jsdoc
/**
 * A "Shop by …" tile link that knows when it is the one already applied: every query parameter
 * its own href carries (`?term=` for type / width, `?attr_Product Finish=` for a finish,
 * `?brand=` for a brand) is already in the page's URL with the same value. It is then marked
 * `aria-current="true"` (the tiles style that as the selected state) and its link flips to
 * *clear* just that narrowing, so clicking the lit tile again takes the visitor back. A plain
 * child-category link has no query and is never "on".
 */
export function FacetLink({ href, ...props }: Props) {
  const current = useSearchParams();
  const [path = '', query = ''] = href.split('?');
  const own = [...new URLSearchParams(query).entries()];
  const active =
    own.length > 0 &&
    own.every(([key, value]) => current.getAll(key).some((have) => same(have, value)));

  let target = href;

  if (active) {
    const next = new URLSearchParams(current.toString());

    own.forEach(([key, value]) => {
      // Multi-valued filters (a finish next to another finish): drop only this value.
      const kept = next.getAll(key).filter((have) => !same(have, value));

      next.delete(key);
      kept.forEach((have) => next.append(key, have));
    });
    PAGING.forEach((key) => next.delete(key));

    const rest = next.toString();

    target = rest ? `${path}?${rest}` : path;
  }

  return <Link {...props} aria-current={active ? 'true' : undefined} href={target} />;
}
