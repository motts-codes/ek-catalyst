import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { StackedCards } from '@/vibes/soul/sections/feature-rows/stacked-cards';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface OfferStackItem {
  title: string;
  description: string;
  /** "Until November 30, 2026", or "Ongoing offer" */
  ends: string;
  href: string;
  ctaLabel?: string;
  banner: { src: string; alt: string; width: number; height: number };
}

interface Props {
  kicker?: string;
  title?: string;
  description?: string;
  offers: OfferStackItem[];
  className?: string;
}

// The offers, one card each: EK's banner scaled to the card's width with the offer in words
// beneath it and a button to the offer page. The cards pin and stack as you scroll (the same
// GSAP overlay as "Find your style" on the Cabinets page), so each one gets the screen to itself.
export function OfferStack({ kicker, title, description, offers, className }: Props) {
  return (
    <HomeSection className={className} description={description} kicker={kicker} title={title}>
      <StackedCards>
        {offers.map((offer, index) => (
          <OfferCard key={offer.href} offer={offer} preload={index === 0} />
        ))}
      </StackedCards>
    </HomeSection>
  );
}

function OfferCard({ offer, preload }: { offer: OfferStackItem; preload: boolean }) {
  return (
    <article className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]">
      {/* The banner is clickable too, but the button below is the link people read, so the
          banner link stays out of the tab order. */}
      <Link aria-hidden className="block" href={offer.href} tabIndex={-1}>
        <Image
          alt={offer.banner.alt}
          className="h-auto w-full"
          height={offer.banner.height}
          preload={preload}
          sizes="(min-width: 64rem) 1024px, 100vw"
          src={offer.banner.src}
          width={offer.banner.width}
        />
      </Link>
      {/* The thin red outline on the copy strip only, open where it meets the banner. */}
      <div className="flex flex-col gap-5 rounded-b-3xl border border-t-0 border-[#fcb6bb] px-6 py-6 @xl:flex-row @xl:items-center @xl:justify-between @xl:px-8 @xl:py-7">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
            {offer.ends}
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold leading-tight @xl:text-2xl">
            {offer.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-contrast-500 @xl:text-[15px]">
            {offer.description}
          </p>
        </div>
        <ButtonLink
          className="shrink-0 self-start @xl:self-center"
          href={offer.href}
          shape="pill"
          size="small"
          variant="primary"
        >
          {offer.ctaLabel ?? 'View details'}
        </ButtonLink>
      </div>
    </article>
  );
}
