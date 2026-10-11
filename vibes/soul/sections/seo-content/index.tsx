import { clsx } from 'clsx';

import { type SeoContent } from '~/lib/category/category-seo';

interface Props {
  content: SeoContent | null;
  /** Small label above the headline, e.g. "About countertops". */
  kicker?: string;
  className?: string;
}

// The long-form copy at the foot of a category page, mainly for search engines. Set on its own
// tinted band so it's clearly separate from the FAQ, but kept quiet: one column, small kicker and
// headline, then the copy across the content width in a smaller, softer grey that still passes AA.
export function SeoContentSection({ content, kicker = 'Good to know', className }: Props) {
  if (content == null) return null;

  return (
    <section className={clsx('border-t border-contrast-100 bg-[#f9fafd] @container', className)}>
      <div className="mx-auto max-w-screen-2xl px-6 py-10 @xl:px-9 @xl:py-12 @4xl:px-14">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
          {kicker}
        </p>
        {content.headline !== '' && (
          <h2 className="font-heading text-xl font-bold leading-tight @xl:text-2xl">
            {content.headline}
          </h2>
        )}
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-contrast-500">
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
    </section>
  );
}
