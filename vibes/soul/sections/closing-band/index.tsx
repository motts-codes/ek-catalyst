import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection } from '@/vibes/soul/sections/home-section';

import { ShowroomSelect } from './showroom-select';

interface Props {
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  /** Optional second button between the primary and the phone (e.g. "Visit the factory outlet"). */
  secondary?: { label: string; href: string };
  showrooms?: Array<{ name: string; href: string }>;
  phone?: { label: string; href: string };
  tint?: boolean;
  className?: string;
}

// The last ask on a page — "Ready to design your kitchen?" — with three ways to say yes at equal
// weight: book the consult, visit a showroom (dropdown), or call.
export function ClosingBand({
  title = 'Ready to design your kitchen?',
  description = 'Bring a photo, a rough sketch, or nothing at all. A designer draws it with you — at home, in a showroom or on a call — and you leave with a plan and a price.',
  primary = { label: 'Free design consult', href: '#' },
  secondary,
  showrooms = [],
  phone = { label: 'Call 860-247-1000', href: 'tel:+18602471000' },
  tint = true,
  className,
}: Props) {
  return (
    <HomeSection className={className} tint={tint}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-2xl font-medium leading-tight @xl:text-3xl @4xl:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-contrast-500 @xl:text-base">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={primary.href} shape="pill" size="small" variant="primary">
            {primary.label}
          </ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} shape="pill" size="small" variant="secondary">
              {secondary.label}
            </ButtonLink>
          )}
          {showrooms.length > 0 && <ShowroomSelect showrooms={showrooms} />}
          <ButtonLink href={phone.href} shape="pill" size="small" variant="secondary">
            {phone.label}
          </ButtonLink>
        </div>
      </div>
    </HomeSection>
  );
}
