import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { type SeoContent } from '~/lib/category/category-seo';

interface Props {
  content: SeoContent | null;
  className?: string;
}

// The long-form copy at the foot of a category page: a headline, then paragraphs, sub-headings
// and lists. Set quieter than the page body (it's for people who want the detail, and for search
// engines), but at a size and grey that still pass AA.
export function SeoContentSection({ content, className }: Props) {
  if (content == null) return null;

  return (
    <SectionLayout className={className} containerSize="2xl">
      <div className="max-w-[72ch]">
        {content.headline !== '' && (
          <h2 className="font-heading text-xl font-bold leading-tight @xl:text-2xl">
            {content.headline}
          </h2>
        )}
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-contrast-500 @xl:text-[15px]">
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
    </SectionLayout>
  );
}
