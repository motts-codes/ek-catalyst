import Link from 'next/link';

import { type CollectionRow } from '~/lib/cabinet-admin/collection-shape';

// Edit-only data table of cabinet collections. No delete action (per requirement).
export function CollectionsTable({ rows }: { rows: CollectionRow[] }) {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Collections</h1>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Line</th>
              <th className="px-4 py-3">Door Style</th>
              <th className="px-4 py-3">Default Finish</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={5}>
                  No collections found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr className="hover:bg-gray-50" key={r.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.line || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.doorStyle || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.defaultFinish || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      href={`/cabinet-admin?tab=collections&edit=${r.id}`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
