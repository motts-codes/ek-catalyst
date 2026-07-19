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

  const { headline, items } = faq;

  return (
    <SectionLayout className={className} containerSize="2xl">
      <FaqSchema faq={faq} />
      {headline && (
        <h2 className="mb-8 font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
          {headline}
        </h2>
      )}

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
    </SectionLayout>
  );
}
