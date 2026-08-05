import { SectionLayout } from '@/vibes/soul/sections/section-layout';

interface Props {
  /** Specifications HTML (staff-authored). */
  specifications?: string;
  /** Disclaimer HTML — small print rendered after the specifications. */
  disclaimer?: string;
  className?: string;
}

/**
 * Collection Specifications section (rich text) with an optional Disclaimer as small print beneath
 * it. Both are staff-authored HTML (same trust boundary as the native BC category description) and
 * rendered directly. Renders nothing when neither is present.
 */
export function CabinetSpecs({ specifications, disclaimer, className }: Props) {
  const hasSpecs = specifications != null && specifications !== '';
  const hasDisclaimer = disclaimer != null && disclaimer !== '';

  if (!hasSpecs && !hasDisclaimer) return null;

  return (
    <SectionLayout className={className} containerSize="2xl">
      {hasSpecs && (
        <>
          <h2 className="mb-6 font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
            Specifications
          </h2>
          <div
            className="prose prose-sm max-w-none text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))] @xl:prose-base [&_a]:text-[#2162a1] [&_li]:my-1 [&_table]:w-full [&_td]:border [&_td]:border-contrast-100 [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-contrast-100 [&_th]:px-3 [&_th]:py-1.5 [&_ul]:list-disc [&_ul]:pl-5"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: specifications }}
          />
        </>
      )}

      {hasDisclaimer && (
        <div
          className="mt-8 border-t border-contrast-100 pt-4 text-xs leading-relaxed text-contrast-400 [&_a]:underline"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: disclaimer }}
        />
      )}
    </SectionLayout>
  );
}
