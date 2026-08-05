import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, setRequestLocale } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CabinetAssembly } from '@/vibes/soul/sections/cabinet-assembly';
import { CabinetCollectionHeader } from '@/vibes/soul/sections/cabinet-collection-header';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetSpecs } from '@/vibes/soul/sections/cabinet-specs';
import { ProductList } from '@/vibes/soul/sections/product-list';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import {
  getCabinetAssemblyVideos,
  getCabinetCollectionContent,
  getCabinetCollectionFaq,
  getCabinetCollectionHeader,
} from '~/lib/cabinets/cabinet-collection';
import {
  type CabinetProgram,
  resolveCabinetCollectionBySlug,
} from '~/lib/cabinets/cabinet-lines-data';

import { fetchFacetedSearch } from '../../../../(faceted)/fetch-faceted-search';

interface Props {
  params: Promise<{ locale: string; program: string; collection: string }>;
}

// Education / inspiration journey for a cabinet collection (homeowner). Content-first: gallery,
// overview, material & factory story, specifications, assembly, FAQ — plus a teaser row of products
// and a "Shop this collection" CTA into the shopping route. The shopping journey (grid + pricing +
// add-to-cart) lives at the BigCommerce category URL (/cabinets/<slug>?program=).
//
// Route: /mykitchen/cabinets/[program]/[collection] e.g. /mykitchen/cabinets/assembled/avon

function parseProgram(value: string): CabinetProgram | null {
  return value === 'assembled' || value === 'rta' ? value : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { program, collection } = await props.params;
  const ref = await resolveCabinetCollectionBySlug(collection);
  const prog = parseProgram(program);

  if (!ref || !prog) return {};

  const label = prog === 'assembled' ? 'Assembled' : 'RTA';

  return {
    title: `${ref.name} ${label} Cabinets — Overview`,
    description: `Explore the ${ref.name} ${label} cabinet collection — materials, construction, and inspiration.`,
  };
}

export default async function CabinetEducationPage(props: Props) {
  const { locale, program, collection } = await props.params;

  setRequestLocale(locale);

  const prog = parseProgram(program);
  const ref = prog ? await resolveCabinetCollectionBySlug(collection) : null;

  if (!prog || !ref) {
    notFound();
  }

  const [header, content, faq, assembly] = await Promise.all([
    getCabinetCollectionHeader(ref.entityId, prog),
    getCabinetCollectionContent(ref.entityId),
    getCabinetCollectionFaq(ref.entityId, prog),
    getCabinetAssemblyVideos(ref.entityId),
  ]);

  // Shopping route for this collection + program (the BigCommerce category URL).
  const shopHref = `${ref.path.replace(/\/$/, '')}?program=${prog}`;
  const programLabel = prog === 'assembled' ? 'Assembled' : 'RTA';

  // Teaser: a few products from the collection, reusing the product card + transformer.
  const currencyCode = await getPreferredCurrencyCode();
  const format = await getFormatter();
  const streamableTeaser = Streamable.from(async () => {
    const search = await fetchFacetedSearch({ category: ref.entityId, limit: 4 }, currencyCode);

    return productCardTransformer(search.products.items, format);
  });

  return (
    <>
      {header && <CabinetCollectionHeader data={header} program={prog} />}

      {/* Material & Factory — placeholder headings for now (to be wired with Makeswift content). */}
      <PlaceholderSection
        subtitle="Details about the materials used in this collection coming soon."
        title="Materials"
      />
      <PlaceholderSection
        subtitle="A look inside how this collection is built coming soon."
        title="Our Factory"
      />

      {Boolean(content?.specifications) && (
        <CabinetSpecs specifications={content?.specifications} />
      )}
      {assembly.length > 0 && <CabinetAssembly videos={assembly} />}
      {faq && <CabinetFaq data={faq} />}

      {/* Product teaser + Shop CTA into the shopping journey. */}
      <section className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @4xl:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight @xl:text-3xl">
            From the {ref.name} collection
          </h2>
          <ButtonLink href={shopHref} shape="pill" size="small" variant="primary">
            Shop {programLabel} →
          </ButtonLink>
        </div>
        <ProductList products={streamableTeaser} />
      </section>

      {Boolean(content?.disclaimer) && <CabinetSpecs disclaimer={content?.disclaimer} />}
    </>
  );
}

function PlaceholderSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8 @xl:px-6 @4xl:px-8">
      <h2 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-contrast-400">{subtitle}</p>
    </section>
  );
}
