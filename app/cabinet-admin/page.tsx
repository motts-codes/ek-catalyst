import { Metadata } from 'next';

import { getAdminEmail } from '~/lib/cabinet-admin/admin-auth';
import { readCabinetAttributes } from '~/lib/cabinet-admin/attributes-shape';
import {
  listCollectionRows,
  readCollectionMetafields,
  readProgramFaq,
} from '~/lib/cabinet-admin/collection-shape';
import { readGalleryConfig } from '~/lib/cabinet-admin/gallery-shape';
import { listCabinetCollections } from '~/lib/cabinet-admin/metafields-api';
import { readCabinetOffers } from '~/lib/cabinet-admin/offers-shape';
import { readProduct } from '~/lib/cabinet-admin/product-shape';
import { getAdminProducts } from '~/lib/cabinet-admin/products-list';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { galleryKitchens, kitchenOptions } from '~/lib/inspiration/kitchen-gallery-data';

import { AdminShell, type AdminTab } from './_components/admin-shell';
import { AttributesEditor } from './_components/attributes-editor';
import { CollectionsTable } from './_components/collections-table';
import { GalleryEditor } from './_components/gallery-editor';
import { LoginForm } from './_components/login-form';
import { OffersEditor } from './_components/offers-editor';
import { ProductsTable } from './_components/products-table';
import { ProgramFaqEditor } from './_components/program-faq-editor';

export const metadata: Metadata = {
  title: 'Cabinet Admin',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{
    tab?: string;
    edit?: string; // collection id being edited (Collections tab)
    page?: string;
    q?: string;
  }>;
}

export default async function CabinetAdminPage(props: Props) {
  const adminEmail = await getAdminEmail();

  if (!adminEmail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <LoginForm />
      </main>
    );
  }

  const sp = await props.searchParams;
  const validTabs: AdminTab[] = [
    'collections',
    'products',
    'attributes',
    'program-faq',
    'offers',
    'gallery',
  ];
  const tab: AdminTab = validTabs.includes(sp.tab as AdminTab)
    ? (sp.tab as AdminTab)
    : 'collections';

  return (
    <AdminShell adminEmail={adminEmail} tab={tab}>
      {tab === 'collections' && (
        <CollectionsContent editId={sp.edit ? Number(sp.edit) : undefined} />
      )}
      {tab === 'products' && (
        <ProductsContent
          editId={sp.edit ? Number(sp.edit) : undefined}
          page={sp.page ? Number(sp.page) : 1}
          search={sp.q ?? ''}
        />
      )}
      {tab === 'attributes' && <AttributesContent />}
      {tab === 'program-faq' && <ProgramFaqContent />}
      {tab === 'offers' && <OffersContent />}
      {tab === 'gallery' && <GalleryContent />}
    </AdminShell>
  );
}

async function AttributesContent() {
  const initial = await readCabinetAttributes();

  return <AttributesEditor initial={initial} />;
}

async function OffersContent() {
  const [offers, attributes, collections] = await Promise.all([
    readCabinetOffers(),
    readCabinetAttributes(),
    listCabinetCollections(),
  ]);

  return (
    <OffersEditor
      collections={collections}
      initial={offers}
      productLines={attributes.productLines}
    />
  );
}

async function GalleryContent() {
  const [config, lines] = await Promise.all([readGalleryConfig(), getCabinetLines('assembled')]);
  const options = kitchenOptions(lines).map((k) => ({
    ref: k.ref,
    name: k.name,
    src: k.image.src,
  }));
  // The page's own mix, dealt into three columns, as a starting point when nothing is saved.
  const mix = galleryKitchens(lines);
  const per = Math.ceil(mix.length / 3);
  const suggested = [0, 1, 2].map((c) =>
    mix.slice(c * per, (c + 1) * per).map((k) => ({ ref: k.ref })),
  );

  return <GalleryEditor initial={config} options={options} suggested={suggested} />;
}

async function ProgramFaqContent() {
  const initial = await readProgramFaq();

  return <ProgramFaqEditor initial={initial} />;
}

async function CollectionsContent({ editId }: { editId?: number }) {
  // When editing one collection, load its full structured metafields for the form.
  if (editId) {
    const collections = await listCabinetCollections();
    const target = collections.find((c) => c.id === editId);

    if (target) {
      const [metafields, attributes] = await Promise.all([
        readCollectionMetafields(editId),
        readCabinetAttributes(),
      ]);
      const { CollectionEditor } = await import('./_components/collection-editor');

      return (
        <CollectionEditor
          attributes={attributes}
          collection={{ id: target.id, name: target.name, metafields }}
        />
      );
    }
  }

  const rows = await listCollectionRows();

  return <CollectionsTable rows={rows} />;
}

async function ProductsContent({
  page,
  search,
  editId,
}: {
  page: number;
  search: string;
  editId?: number;
}) {
  // When editing one product, load its view fields + editable content metafields.
  if (editId) {
    const product = await readProduct(editId);

    if (product) {
      const { ProductEditor } = await import('./_components/product-editor');

      return <ProductEditor product={product} />;
    }
  }

  const data = await getAdminProducts({ page, perPage: 25, search });

  return <ProductsTable data={data} search={search} />;
}
