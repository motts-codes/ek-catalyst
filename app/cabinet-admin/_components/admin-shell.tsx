import Link from 'next/link';
import { PropsWithChildren } from 'react';

import { signOutAction } from '../actions';

const TABS = [
  { key: 'collections', label: 'Collections', href: '/cabinet-admin?tab=collections' },
  { key: 'products', label: 'Products', href: '/cabinet-admin?tab=products' },
  { key: 'attributes', label: 'Attributes', href: '/cabinet-admin?tab=attributes' },
  { key: 'program-faq', label: 'Cabinet Assembly', href: '/cabinet-admin?tab=program-faq' },
] as const;

export type AdminTab = (typeof TABS)[number]['key'];

export function AdminShell({
  adminEmail,
  tab,
  children,
}: PropsWithChildren<{ adminEmail: string; tab: AdminTab }>) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-200 px-5 py-4">
          <p className="text-sm font-semibold">Cabinet Admin</p>
        </div>
        <nav className="flex-1 p-3">
          {TABS.map((t) => (
            <Link
              className={`mb-1 block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              href={t.href}
              key={t.key}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          {/* Mobile tab switcher */}
          <nav className="flex gap-1 md:hidden">
            {TABS.map((t) => (
              <Link
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  tab === t.key ? 'bg-gray-900 text-white' : 'text-gray-700'
                }`}
                href={t.href}
                key={t.key}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <span className="hidden md:block" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:inline">{adminEmail}</span>
            <form action={signOutAction}>
              <button
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
