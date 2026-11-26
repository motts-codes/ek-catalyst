'use client';

import { useSearchParams } from 'next/navigation';
import { type ComponentPropsWithoutRef } from 'react';

import { Link } from '~/components/link';

// The params a "Shop by …" tile narrows the listing with (finish / type / width by search term,
// brand by id). A plain child-category link has neither and is never "on".
const NARROWING = ['term', 'brand'];
// Paging is dropped whenever the narrowing changes, so the visitor starts at page one.
const PAGING = ['page', 'before', 'after'];

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> & { href: string };

// eslint-disable-next-line valid-jsdoc
/**
 * A "Shop by …" tile link that knows when it is the one already applied: the page's current
 * `?term=` / `?brand=` match its own. It is then marked `aria-current="true"` (the tiles style
 * that as the selected state) and its link flips to *clear* that narrowing, so clicking the lit
 * tile again takes the visitor back to the whole listing.
 */
export function FacetLink({ href, ...props }: Props) {
  const current = useSearchParams();
  const [path = '', query = ''] = href.split('?');
  const own = new URLSearchParams(query);
  const keys = NARROWING.filter((key) => own.has(key));
  const same = (key: string) =>
    (current.get(key) ?? '').trim().toLowerCase() === (own.get(key) ?? '').trim().toLowerCase();
  const active = keys.length > 0 && keys.every(same);

  let target = href;

  if (active) {
    const next = new URLSearchParams(current.toString());

    [...keys, ...PAGING].forEach((key) => next.delete(key));

    const rest = next.toString();

    target = rest ? `${path}?${rest}` : path;
  }

  return <Link {...props} aria-current={active ? 'true' : undefined} href={target} />;
}
