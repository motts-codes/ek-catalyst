'use client';

import { useState, useTransition } from 'react';

import { type CollectionMetafields } from '~/lib/cabinet-admin/collection-shape';

import { logoutAction, saveCollectionAction } from '../actions';

interface CollectionData {
  id: number;
  name: string;
  metafields: CollectionMetafields;
}

export function CabinetAdminPanel({ collections }: { collections: CollectionData[] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Cabinet Admin</h1>
            <p className="text-sm text-gray-500">Edit the metafields for each cabinet collection.</p>
          </div>
          <form action={logoutAction}>
            <button
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {collections.map((c) => (
          <CollectionEditor collection={c} key={c.id} />
        ))}
      </main>
    </div>
  );
}

function CollectionEditor({ collection }: { collection: CollectionData }) {
  const [data, setData] = useState<CollectionMetafields>(collection.metafields);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await saveCollectionAction(collection.id, data);

      setStatus({ ok: res.ok, msg: res.ok ? 'Saved.' : res.error ?? 'Save failed.' });
    });
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">
        {collection.name}{' '}
        <span className="font-normal text-gray-400">(category {collection.id})</span>
      </h2>

      {/* Pricing — RTA + Assembled */}
      <Group title="10×10 Kitchen Pricing">
        <div className="grid grid-cols-1 gap-6 @2xl:grid-cols-2 md:grid-cols-2">
          {(['assembled', 'rta'] as const).map((prog) => (
            <div className="rounded-lg border border-gray-100 p-4" key={prog}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {prog}
              </p>
              <Field
                label="Price"
                onChange={(v) => setData((d) => set(d, ['pricing', prog, 'price'], v))}
                value={data.pricing[prog].price}
              />
              <Field
                label="Strike price"
                onChange={(v) => setData((d) => set(d, ['pricing', prog, 'strike_price'], v))}
                value={data.pricing[prog].strike_price}
              />
              <Field
                label="EMI text"
                onChange={(v) => setData((d) => set(d, ['pricing', prog, 'emi_text'], v))}
                value={data.pricing[prog].emi_text}
              />
            </div>
          ))}
        </div>
      </Group>

      {/* Merch */}
      <Group title="Merchandising">
        <Field
          label="Line"
          onChange={(v) => setData((d) => set(d, ['merch', 'line'], v))}
          value={data.merch.line}
        />
        <Field
          label="Door style"
          onChange={(v) => setData((d) => set(d, ['merch', 'door_style'], v))}
          value={data.merch.door_style}
        />
        <Field
          label="Default finish"
          onChange={(v) => setData((d) => set(d, ['merch', 'default_finish'], v))}
          value={data.merch.default_finish}
        />
      </Group>

      {/* Delivery */}
      <Group title="Delivery">
        <Field
          label="Assembled"
          onChange={(v) => setData((d) => set(d, ['delivery', 'assembled'], v))}
          value={data.delivery.assembled}
        />
        <Field
          label="RTA"
          onChange={(v) => setData((d) => set(d, ['delivery', 'rta'], v))}
          value={data.delivery.rta}
        />
      </Group>

      {/* Spec sheets */}
      <Group title="Spec Sheet URLs">
        <Field
          label="Assembled"
          onChange={(v) => setData((d) => set(d, ['specSheets', 'assembled'], v))}
          value={data.specSheets.assembled}
        />
        <Field
          label="RTA"
          onChange={(v) => setData((d) => set(d, ['specSheets', 'rta'], v))}
          value={data.specSheets.rta}
        />
      </Group>

      {/* Sample */}
      <Group title="Order Sample">
        <Field
          label="Sample product ID"
          onChange={(v) => setData((d) => set(d, ['sample', 'product_id'], v))}
          value={data.sample.product_id}
        />
        <Field
          label="Sample price"
          onChange={(v) => setData((d) => set(d, ['sample', 'price'], v))}
          value={data.sample.price}
        />
      </Group>

      <div className="mt-6 flex items-center gap-3">
        <button
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          disabled={pending}
          onClick={save}
          type="button"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        {status && (
          <span className={status.ok ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
            {status.msg}
          </span>
        )}
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}

// Immutable nested set for the 2/3-level metafield paths used above.
function set<T>(obj: T, path: string[], value: string): T {
  const record = obj as Record<string, unknown>;
  const head = path[0];

  if (head === undefined) {
    return obj;
  }

  if (path.length === 1) {
    return { ...record, [head]: value } as T;
  }

  return { ...record, [head]: set(record[head], path.slice(1), value) } as T;
}
