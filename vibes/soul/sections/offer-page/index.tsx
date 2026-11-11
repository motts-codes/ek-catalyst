import { clsx } from 'clsx';
import { ReactNode } from 'react';

import { CabinetFaq, type CabinetFaqItem } from '@/vibes/soul/sections/cabinet-faq';
import { MinimalTable } from '@/vibes/soul/sections/delivery-ladder';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { Actions, type PageAction, type PageImage } from '@/vibes/soul/sections/page-kit';
import { Image } from '~/components/image';

export interface OfferDetailsTable {
  /** Column labels; omit for a plain label / value table. */
  columns?: [string, string];
  rows: Array<[string, string]>;
}

interface Props {
  /** EK's HD banner (about 2080×756), full width. The hero is the banner and nothing else. */
  banner: PageImage & { width?: number; height?: number };
  /** A portrait version of the banner for phones, when EK supplies one. */
  mobileBanner?: PageImage & { width?: number; height?: number };
  /** The page heading. The banner's text is pixels, so this is the h1 for search engines and
   *  screen readers; it is visually hidden once the banner is wide enough to read. */
  title: string;
  /** The real buttons, directly under the banner (the button drawn in the banner can't be clicked). */
  actions: PageAction[];
  details: OfferDetailsTable;
  detailsTitle?: string;
  terms: string[];
  faq: CabinetFaqItem[];
  faqHeadline: string;
  /** Extra sections after the FAQ. */
  children?: ReactNode;
}

// The offer page template: banner, buttons, a quiet details table, short terms, a few questions.
// Same shape on every offer so the client can compare them side by side.
export function OfferPage({
  banner,
  mobileBanner,
  title,
  actions,
  details,
  detailsTitle = 'Offer details',
  terms,
  faq,
  faqHeadline,
  children,
}: Props) {
  return (
    <>
      <HomeSection halfPadding openTop>
        {/* 1 · Banner. Below tablet width the banner's text is too small to read, so the h1 shows
            there (or the portrait banner, when there is one). */}
        <div className={clsx('overflow-hidden rounded-3xl', mobileBanner && 'hidden @3xl:block')}>
          <Image
            alt={banner.alt}
            className="h-auto w-full"
            height={banner.height ?? 756}
            preload
            sizes="(min-width: 96rem) 1536px, 100vw"
            src={banner.src}
            width={banner.width ?? 2079}
          />
        </div>
        {mobileBanner && (
          <div className="overflow-hidden rounded-3xl @3xl:hidden">
            <Image
              alt={mobileBanner.alt}
              className="h-auto w-full"
              height={mobileBanner.height ?? 1350}
              preload
              sizes="100vw"
              src={mobileBanner.src}
              width={mobileBanner.width ?? 1080}
            />
          </div>
        )}
        <h1
          className={clsx(
            'mt-6 font-heading text-2xl font-semibold leading-tight',
            mobileBanner ? 'sr-only' : '@3xl:sr-only',
          )}
        >
          {title}
        </h1>
        {/* 2 · Buttons */}
        <Actions actions={actions} className="mt-6" />
      </HomeSection>

      {/* 3 · Offer details */}
      <HomeSection halfPadding kicker="The offer" title={detailsTitle}>
        <div className="max-w-3xl">
          <MinimalTable
            columns={details.columns ?? ['', '']}
            fit
            inline
            narrow={false}
            rows={details.rows}
          />
        </div>
      </HomeSection>

      {/* 4 · Terms and conditions */}
      <HomeSection
        className="bg-[#fdf3f5]"
        halfPadding
        id="terms"
        kicker="The small print"
        title="Terms and conditions"
      >
        <ul className="max-w-3xl space-y-3 text-sm leading-relaxed text-[#404040] @xl:text-[15px]">
          {terms.map((term) => (
            <li className="flex gap-3" key={term}>
              <span
                aria-hidden
                className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[var(--button-primary-background,#d90716)]"
              />
              <span>{term}</span>
            </li>
          ))}
        </ul>
      </HomeSection>

      {/* 5 · FAQ */}
      <CabinetFaq data={{ headline: faqHeadline, items: faq }} />

      {children}
    </>
  );
}
