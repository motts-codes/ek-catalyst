'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { type CollectionMetafields } from '~/lib/cabinet-admin/collection-shape';

import { saveCollectionAction } from '../actions';

import { FaqEditor, Field, Group } from './faq-editor';

interface CollectionData {
  id: number;
  name: string;
  metafields: CollectionMetafields;
}

export function CollectionEditor({ collection }: { collection: CollectionData }) {
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
    <div>
      <Link
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        href="/cabinet-admin?tab=collections"
      >
        ← Back to collections
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">
          {collection.name}{' '}
          <span className="font-normal text-gray-400">(category {collection.id})</span>
        </h2>

        <Group title="10×10 Kitchen Pricing">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

        {/* FAQ — one editor per program (RTA and Assembled have different questions). */}
        {(['assembled', 'rta'] as const).map((prog) => (
          <Group key={prog} title={`FAQ — ${prog === 'assembled' ? 'Assembled' : 'RTA'}`}>
            <FaqEditor
              onChange={(next) => setData((d) => ({ ...d, faq: { ...d.faq, [prog]: next } }))}
              value={data.faq[prog]}
            />
          </Group>
        ))}

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
    </div>
  );
}

function set<T>(obj: T, path: string[], value: string): T {
  const record = obj as Record<string, unknown>;
  const head = path[0];

  if (head === undefined) return obj;
  if (path.length === 1) return { ...record, [head]: value } as T;

  return { ...record, [head]: set(record[head], path.slice(1), value) } as T;
}
