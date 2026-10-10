import { HomeSection } from '@/vibes/soul/sections/home-section';
import { Link } from '~/components/link';
import { type LegalSection } from '~/lib/pages/legal';

// Long-form policy text: a sticky list of sections on the left, the sections on the right.
export function LegalDocument({
  sections,
  updated,
}: {
  sections: LegalSection[];
  updated?: string;
}) {
  return (
    <HomeSection>
      <div className="grid gap-10 @3xl:grid-cols-[16rem_1fr] @3xl:gap-16">
        <nav aria-label="Sections" className="@3xl:sticky @3xl:top-28 @3xl:self-start">
          {Boolean(updated) && (
            <p className="mb-4 text-xs text-contrast-400">Last updated {updated}</p>
          )}
          <ol className="space-y-1.5 text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  className="text-contrast-500 underline-offset-4 hover:text-foreground hover:underline"
                  href={`#${section.id}`}
                >
                  {section.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl">
          {sections.map((section) => (
            <section
              className="scroll-mt-28 border-b border-contrast-100 py-8 first:pt-0 last:border-0"
              id={section.id}
              key={section.id}
            >
              <h2 className="font-heading text-xl font-bold leading-tight @xl:text-2xl">
                {section.title}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  className="mt-3 text-sm leading-relaxed text-contrast-500 @xl:text-base"
                  key={p.slice(0, 40)}
                >
                  {p}
                </p>
              ))}
              {section.bullets != null && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-contrast-500 @xl:text-base">
                  {section.bullets.map((b) => (
                    <li key={b.slice(0, 40)}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
