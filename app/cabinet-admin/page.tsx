import { Metadata } from 'next';

import { getAdminEmail } from '~/lib/cabinet-admin/admin-auth';
import { readCabinetAttributes } from '~/lib/cabinet-admin/attributes-shape';
import {
  listCollectionRows,
  readCollectionMetafields,
  readProgramFaq,
} from '~/lib/cabinet-admin/collection-shape';
import { listCabinetCollections } from '~/lib/cabinet-admin/metafields-api';
import { getAdminProducts } from '~/lib/cabinet-admin/products-list';

import { AdminShell, type AdminTab } from './_components/admin-shell';
import { CollectionsTable } from './_components/collections-table';
import { LoginForm } from './_components/login-form';
import { AttributesEditor } from './_components/attributes-editor';
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
  const validTabs: AdminTab[] = ['collections', 'products', 'attributes', 'program-faq'];
  const tab: AdminTab = validTabs.includes(sp.tab as AdminTab)
    ? (sp.tab as AdminTab)
    : 'collections';

  return (
    <AdminShell adminEmail={adminEmail} tab={tab}>
      {tab === 'collections' && (
        <CollectionsContent editId={sp.edit ? Number(sp.edit) : undefined} />
      )}
      {tab === 'products' && (
        <ProductsContent page={sp.page ? Number(sp.page) : 1} search={sp.q ?? ''} />
      )}
      {tab === 'attributes' && <AttributesContent />}
      {tab === 'program-faq' && <ProgramFaqContent />}
    </AdminShell>
  );
}

async function AttributesContent() {
  const initial = await readCabinetAttributes();

  return <AttributesEditor initial={initial} />;
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

async function ProductsContent({ page, search }: { page: number; search: string }) {
  const data = await getAdminProducts({ page, perPage: 25, search });

  return <ProductsTable data={data} search={search} />;
}
