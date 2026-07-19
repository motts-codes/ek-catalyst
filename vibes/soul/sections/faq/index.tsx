import { clsx } from 'clsx';

import { Image } from '~/components/image';
import { Faq as FaqData } from '~/data-transformers/faq-transformer';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';

import { FaqSchema } from './faq-schema';

interface Props {
  faq: FaqData | null;
  className?: string;
}

/**
 * PDP FAQ section: a headline, then a static (always-open) list of question/answer pairs.
 * Renders nothing when there is no FAQ data, so products without an FAQ don't show the section.
 */
export function Faq({ faq, className }: Props) {
  if (faq == null) {
    return null;
  }

  const { headline, items, image } = faq;
  const hasImage = Boolean(image);

  return (
    <SectionLayout className={className} containerSize="2xl">
      <FaqSchema faq={faq} />
      {headline && (
        <h2 className="mb-8 font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
          {headline}
        </h2>
      )}

      {/* 60/40 split (FAQ list | image) when an image is present; full-width list otherwise. */}
      <div
        className={clsx(
          'grid grid-cols-1 gap-10',
          hasImage && 'lg:grid-cols-[3fr_2fr] lg:gap-x-20',
        )}
      >
        <dl className="space-y-6">
          {items.map((item, index) => (
            <div key={index}>
              <dt className="mb-2 font-[family-name:var(--font-family-heading)] text-lg font-semibold leading-snug">
                {index + 1}. {item.q}
              </dt>
              <dd className="leading-relaxed text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>

        {hasImage && image != null && (
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Image
              alt={headline || 'FAQ'}
              className="h-auto w-full rounded-xl object-contain"
              height={800}
              sizes="(min-width: 64rem) 40vw, 100vw"
              src={image}
              unoptimized
              width={600}
            />
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
