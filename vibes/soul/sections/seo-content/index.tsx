import { clsx } from 'clsx';

import { type SeoContent } from '~/lib/category/category-seo';

interface Props {
  content: SeoContent | null;
  /** Small label above the headline, e.g. "About countertops". */
  kicker?: string;
  className?: string;
}

// The long-form copy at the foot of a category page. Set on its own tinted band so it reads as a
// section, not a tail on the FAQ: kicker + headline in the left third, the copy beside it at a
// readable measure (~72 characters a line). Paragraphs, sub-headings and lists; quieter than the
// page body but at a size and grey that pass AA.
export function SeoContentSection({ content, kicker = 'Good to know', className }: Props) {
  if (content == null) return null;

  return (
    <section className={clsx('border-t border-contrast-100 bg-[#f9fafd] @container', className)}>
      <div className="mx-auto max-w-screen-2xl px-6 py-10 @xl:px-9 @xl:py-14 @4xl:px-14 @4xl:py-16">
        <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @3xl:gap-14">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-contrast-500">
              {kicker}
            </p>
            {content.headline !== '' && (
              <h2 className="font-heading text-xl font-bold leading-tight @xl:text-2xl">
                {content.headline}
              </h2>
            )}
          </div>
          <div className="max-w-[72ch] space-y-4 text-sm leading-relaxed text-contrast-500 @xl:text-[15px]">
            {content.blocks.map((block, index) => {
              if (block.type === 'h3') {
                return (
                  <h3 className="pt-2 font-heading text-base font-bold text-foreground" key={index}>
                    {block.text}
                  </h3>
                );
              }

              if (block.type === 'ul') {
                return (
                  <ul className="list-disc space-y-1.5 pl-5" key={index}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              }

              return <p key={index}>{block.text}</p>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
