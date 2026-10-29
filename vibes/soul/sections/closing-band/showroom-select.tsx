'use client';

import { MapPin } from 'lucide-react';

import { useRouter } from '~/i18n/routing';

interface Props {
  label?: string;
  showrooms: Array<{ name: string; href: string }>;
}

// "Visit a showroom ⌄" — a select styled as a button; picking one navigates to that showroom.
export function ShowroomSelect({ label = 'Visit a showroom', showrooms }: Props) {
  const router = useRouter();

  return (
    <span className="relative inline-flex">
      <MapPin
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground"
        size={16}
        strokeWidth={2}
      />
      <select
        aria-label={label}
        className="inline-flex min-h-10 cursor-pointer appearance-none items-center rounded-full border border-contrast-200 bg-white py-2 pl-10 pr-9 text-sm font-semibold text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
        defaultValue=""
        onChange={(event) => {
          const href = event.currentTarget.value;

          if (href !== '' && href !== '#') router.push(href);
        }}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23111' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
      >
        <option disabled value="">
          {label}
        </option>
        {showrooms.map((showroom) => (
          <option key={showroom.name} value={showroom.href}>
            {showroom.name}
          </option>
        ))}
      </select>
    </span>
  );
}
