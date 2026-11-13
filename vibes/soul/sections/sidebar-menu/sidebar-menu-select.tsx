'use client';

import { Select } from '@/vibes/soul/form/select';
import { usePathname, useRouter } from '~/i18n/routing';

export function SidebarMenuSelect({ links }: { links: Array<{ href: string; label: string }> }) {
  const pathname = usePathname();
  const router = useRouter();
  // Hrefs carry a trailing slash ("/account/wishlists/"), the pathname does not; without this the
  // dropdown matched nothing and showed empty.
  const trim = (path: string) => path.replace(/\/+$/, '');
  const current = links.find((link) => trim(link.href) === trim(pathname))?.href ?? pathname;

  return (
    <Select
      name="sidebar-layout-link-select"
      onValueChange={(value) => {
        router.push(value);
      }}
      options={links.map((link) => ({ value: link.href, label: link.label }))}
      value={current}
    />
  );
}
