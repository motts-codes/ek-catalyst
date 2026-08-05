'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { type ProductsPage } from '~/lib/cabinet-admin/products-list';

// Edit-only, searchable, paginated data table of products. Search + pagination are server-side
// (via URL params) so it scales to thousands of products.
export function ProductsTable({ data, search }: { data: ProductsPage; search: string }) {
  const router = useRouter();
  const [term, setTerm] = useState(search);

  const go = (params: Record<string, string | number>) => {
    const sp = new URLSearchParams({ tab: 'products' });
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v != null) sp.set(k, String(v));
    });
    router.push(`/cabinet-admin?${sp.toString()}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    go({ q: term, page: 1 });
  };

  const start = (data.page - 1) * data.perPage + 1;
  const end = Math.min(data.page * data.perPage, data.total);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <form className="flex items-center gap-2" onSubmit={submitSearch}>
          <input
            className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products…"
            type="search"
            value={term}
          />
          <button
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            type="submit"
          >
            Search
          </button>
          {search && (
            <button
              className="text-sm text-gray-500 hover:text-gray-900"
              onClick={() => {
                setTerm('');
                go({ q: '', page: 1 });
              }}
              type="button"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={5}>
                  No products found{search ? ` for “${search}”` : ''}.
                </td>
              </tr>
            ) : (
              data.rows.map((p) => (
                <tr className="hover:bg-gray-50" key={p.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.sku || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.isVisible
                          ? 'text-xs font-medium text-green-600'
                          : 'text-xs font-medium text-gray-400'
                      }
                    >
                      {p.isVisible ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {/* Phase B: opens the per-product content editor (FAQ / features / info). */}
                    <Link
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      href={`/cabinet-admin?tab=products&edit=${p.id}`}
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

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <span>
          {data.total === 0
            ? 'No entries'
            : `Showing ${start} to ${end} of ${data.total} entries`}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
            disabled={data.page <= 1}
            onClick={() => go({ q: search, page: data.page - 1 })}
            type="button"
          >
            Previous
          </button>
          <span className="px-2">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
            disabled={data.page >= data.totalPages}
            onClick={() => go({ q: search, page: data.page + 1 })}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
