import { FAQPage, WithContext } from 'schema-dts';

import { Faq as FaqData } from '~/data-transformers/faq-transformer';

/**
 * FAQPage structured data (JSON-LD) so the FAQ is eligible for Google's FAQ rich results.
 * Renders invisibly (a <script> tag) — no visual output. Emits nothing when there is no FAQ.
 */
export function FaqSchema({ faq }: { faq: FaqData | null }) {
  if (faq == null || faq.items.length === 0) {
    return null;
  }

  const schema: WithContext<FAQPage> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      type="application/ld+json"
    />
  );
}
