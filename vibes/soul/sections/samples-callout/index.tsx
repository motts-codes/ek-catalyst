import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';

interface Props {
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
  className?: string;
}

// "Hold the real door first." — the free-samples strip under the best-seller cards.
export function SamplesCallout({
  title = 'Hold the real door first.',
  description = 'First two quarter-door samples are free with code FREESAMPLES.',
  cta = { label: 'Order samples', href: '#' },
  className,
}: Props) {
  return (
    <div
      className={clsx(
        'flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-contrast-200 bg-white px-5 py-4',
        className,
      )}
    >
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-contrast-500">{description}</p>
      </div>
      <ButtonLink href={cta.href} shape="pill" size="small" variant="secondary">
        {cta.label}
      </ButtonLink>
    </div>
  );
}
