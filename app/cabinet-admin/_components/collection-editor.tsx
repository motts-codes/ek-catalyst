'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { type CollectionMetafields, type FaqItem } from '~/lib/cabinet-admin/collection-shape';

import { saveCollectionAction } from '../actions';

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

function set<T>(obj: T, path: string[], value: string): T {
  const record = obj as Record<string, unknown>;
  const head = path[0];

  if (head === undefined) return obj;
  if (path.length === 1) return { ...record, [head]: value } as T;

  return { ...record, [head]: set(record[head], path.slice(1), value) } as T;
}

// Repeatable Q&A editor for one program's FAQ. Add / remove / edit question-answer rows.
function FaqEditor({
  value,
  onChange,
}: {
  value: { headline: string; items: FaqItem[] };
  onChange: (next: { headline: string; items: FaqItem[] }) => void;
}) {
  const setItem = (i: number, patch: Partial<FaqItem>) => {
    const items = value.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange({ ...value, items });
  };
  const addItem = () => onChange({ ...value, items: [...value.items, { q: '', a: '' }] });
  const removeItem = (i: number) =>
    onChange({ ...value, items: value.items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <Field
        label="Section headline"
        onChange={(v) => onChange({ ...value, headline: v })}
        value={value.headline}
      />

      {value.items.length === 0 && (
        <p className="text-sm text-gray-400">No questions yet.</p>
      )}

      {value.items.map((it, i) => (
        <div className="rounded-lg border border-gray-100 p-3" key={i}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Q&amp;A {i + 1}
            </span>
            <button
              className="text-xs text-red-600 hover:underline"
              onClick={() => removeItem(i)}
              type="button"
            >
              Remove
            </button>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Question</span>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
              onChange={(e) => setItem(i, { q: e.target.value })}
              type="text"
              value={it.q}
            />
          </label>
          <label className="mt-2 block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Answer</span>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
              onChange={(e) => setItem(i, { a: e.target.value })}
              rows={3}
              value={it.a}
            />
          </label>
        </div>
      ))}

      <button
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={addItem}
        type="button"
      >
        + Add question
      </button>
    </div>
  );
}
