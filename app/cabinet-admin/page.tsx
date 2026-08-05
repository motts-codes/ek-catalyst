import { Metadata } from 'next';

import { getAdminEmail } from '~/lib/cabinet-admin/admin-auth';
import { readCollectionMetafields } from '~/lib/cabinet-admin/collection-shape';
import { listCabinetCollections } from '~/lib/cabinet-admin/metafields-api';

import { CabinetAdminPanel } from './_components/panel';
import { LoginForm } from './_components/login-form';

// Internal admin panel for editing the cabinet collections' metafields. Google sign-in restricted to
// an allowlist of EK staff emails (see lib/cabinet-admin/admin-auth.ts). Not indexed.
export const metadata: Metadata = {
  title: 'Cabinet Admin',
  robots: { index: false, follow: false },
};

export default async function CabinetAdminPage() {
  const adminEmail = await getAdminEmail();

  if (!adminEmail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <LoginForm />
      </main>
    );
  }

  const collections = await listCabinetCollections();
  const withData = await Promise.all(
    collections.map(async (c) => ({
      id: c.id,
      name: c.name,
      metafields: await readCollectionMetafields(c.id),
    })),
  );

  return <CabinetAdminPanel adminEmail={adminEmail} collections={withData} />;
}
