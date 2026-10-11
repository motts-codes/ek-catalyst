import { clsx } from 'clsx';
import { Check } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection } from '@/vibes/soul/sections/home-section';

export interface ProgramTier {
  name: string;
  /** How to qualify, e.g. "From your first $5,000 invoice". */
  qualifier: string;
  perks: string[];
  /** Visually emphasised (the tier most visitors aim for). */
  highlighted?: boolean;
}

interface Props {
  id?: string;
  kicker?: string;
  title: string;
  lede?: string;
  cta?: { label: string; href: string };
  tiers: ProgramTier[];
  footnote?: string;
  tint?: boolean;
  className?: string;
}

// "The Contractor Program — two tiers, real discounts": the tier cards side by side, each with
// its qualifier and perk list. Leads with price because the program is a stated discount.
export function ProgramTiers({
  id,
  kicker,
  title,
  lede,
  cta,
  tiers,
  footnote,
  tint = false,
  className,
}: Props) {
  return (
    <HomeSection className={className} id={id} kicker={kicker} tint={tint} title={title}>
      {(Boolean(lede) || cta) && (
        <div className="-mt-2 mb-6 flex flex-wrap items-end justify-between gap-4">
          {Boolean(lede) && (
            <p className="max-w-3xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
              {lede}
            </p>
          )}
          {cta && (
            <ButtonLink href={cta.href} shape="pill" size="small" variant="primary">
              {cta.label}
            </ButtonLink>
          )}
        </div>
      )}

      <div className="grid gap-5 @3xl:grid-cols-2">
        {tiers.map((tier) => (
          <article
            className={clsx(
              'flex flex-col rounded-3xl border bg-white p-6 @xl:p-8',
              tier.highlighted ? 'border-foreground ring-1 ring-foreground' : 'border-contrast-100',
            )}
            key={tier.name}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
              {tier.highlighted ? '◆ ' : ''}
              {tier.name}
            </p>
            <h3 className="mt-1 font-heading text-xl font-semibold leading-tight @xl:text-2xl">
              {tier.qualifier}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {tier.perks.map((perk) => (
                <li className="flex items-start gap-2" key={perk}>
                  <Check
                    aria-hidden
                    className="mt-0.5 shrink-0 text-[var(--button-primary-background,#d90716)]"
                    size={16}
                    strokeWidth={2.5}
                  />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {Boolean(footnote) && (
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-contrast-500">{footnote}</p>
      )}
    </HomeSection>
  );
}
