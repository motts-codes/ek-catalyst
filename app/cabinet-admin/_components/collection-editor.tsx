'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { type CabinetAttributes } from '~/lib/cabinet-admin/attributes-shape';
import {
  type AssemblyVideo,
  type CollectionMetafields,
} from '~/lib/cabinet-admin/collection-shape';

import { saveCollectionAction } from '../actions';

import { FaqEditor, Field, Group } from './faq-editor';

interface CollectionData {
  id: number;
  name: string;
  metafields: CollectionMetafields;
}

export function CollectionEditor({
  collection,
  attributes,
}: {
  collection: CollectionData;
  attributes: CabinetAttributes;
}) {
  const [data, setData] = useState<CollectionMetafields>(collection.metafields);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await saveCollectionAction(collection.id, data);

      setStatus({ ok: res.ok, msg: res.ok ? 'Saved.' : (res.error ?? 'Save failed.') });
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

        <Group title="Specification">
          <Select
            emptyLabel="— Select a product line —"
            label="Product Line"
            onChange={(v) => setData((d) => ({ ...d, spec: { ...d.spec, productLineId: v } }))}
            options={attributes.productLines}
            value={data.spec.productLineId}
          />
          <Select
            emptyLabel="— Select a construction —"
            label="Construction"
            onChange={(v) => setData((d) => ({ ...d, spec: { ...d.spec, constructionId: v } }))}
            options={attributes.constructions}
            value={data.spec.constructionId}
          />
          {attributes.productLines.length === 0 && attributes.constructions.length === 0 && (
            <p className="text-xs text-gray-400">
              Add options in the Attributes tab to populate these dropdowns.
            </p>
          )}
        </Group>

        <Group title="Colors / Finishes">
          <ColorPicker
            colors={attributes.colors}
            defaultColorId={data.spec.defaultColorId}
            onChange={(spec) => setData((d) => ({ ...d, spec: { ...d.spec, ...spec } }))}
            selectedIds={data.spec.colorIds}
          />
        </Group>

        <Group title="Assembly Instructions">
          <AssemblyEditor
            onChange={(videos) => setData((d) => ({ ...d, assembly: { videos } }))}
            videos={data.assembly.videos}
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

// Single-select dropdown fed by an attribute master-list ({id, name}).
function Select({
  label,
  value,
  options,
  onChange,
  emptyLabel,
}: {
  label: string;
  value: string;
  options: Array<{ id: string; name: string }>;
  onChange: (v: string) => void;
  emptyLabel: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <select
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}

// Multi-select of colors from the master palette, with one marked as the default (lead) finish.
function ColorPicker({
  colors,
  selectedIds,
  defaultColorId,
  onChange,
}: {
  colors: Array<{ id: string; name: string; hex: string; image: string }>;
  selectedIds: string[];
  defaultColorId: string;
  onChange: (spec: { colorIds: string[]; defaultColorId: string }) => void;
}) {
  if (colors.length === 0) {
    return (
      <p className="text-xs text-gray-400">Add colors in the Attributes tab to pick finishes.</p>
    );
  }

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    // Keep default valid: clear it if it was just removed; adopt the first if none set.
    const def = next.includes(defaultColorId) ? defaultColorId : (next[0] ?? '');

    onChange({ colorIds: next, defaultColorId: def });
  };

  const setDefault = (id: string) => {
    const next = selectedIds.includes(id) ? selectedIds : [...selectedIds, id];

    onChange({ colorIds: next, defaultColorId: id });
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {colors.map((c) => {
          const selected = selectedIds.includes(c.id);
          const isDefault = defaultColorId === c.id;

          return (
            <div
              className={`flex items-center gap-3 rounded-lg border p-2 ${
                selected ? 'border-gray-900' : 'border-gray-200'
              }`}
              key={c.id}
            >
              <label className="flex flex-1 items-center gap-2">
                <input checked={selected} onChange={() => toggle(c.id)} type="checkbox" />
                <span
                  aria-hidden
                  className="inline-block size-5 rounded-full border border-gray-200 bg-cover bg-center"
                  style={{
                    backgroundColor: c.hex || undefined,
                    backgroundImage: c.image ? `url(${c.image})` : undefined,
                  }}
                />
                <span className="text-sm">{c.name}</span>
              </label>
              {selected &&
                (isDefault ? (
                  <span className="rounded bg-gray-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                    Default
                  </span>
                ) : (
                  <button
                    className="text-[10px] text-gray-500 hover:text-gray-900 hover:underline"
                    onClick={() => setDefault(c.id)}
                    type="button"
                  >
                    Set default
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Repeatable assembly video rows (name + YouTube URL) — authored per collection.
function AssemblyEditor({
  videos,
  onChange,
}: {
  videos: AssemblyVideo[];
  onChange: (next: AssemblyVideo[]) => void;
}) {
  const patch = (i: number, p: Partial<AssemblyVideo>) =>
    onChange(videos.map((v, idx) => (idx === i ? { ...v, ...p } : v)));
  const remove = (i: number) => onChange(videos.filter((_, idx) => idx !== i));
  const add = () => onChange([...videos, { name: '', url: '' }]);

  return (
    <div className="space-y-3">
      {videos.length === 0 && <p className="text-sm text-gray-400">No videos yet.</p>}
      {videos.map((v, i) => (
        <div className="rounded-lg border border-gray-100 p-3" key={i}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Video {i + 1}
            </span>
            <button
              className="text-xs text-red-600 hover:underline"
              onClick={() => remove(i)}
              type="button"
            >
              Remove
            </button>
          </div>
          <Field label="Title" onChange={(val) => patch(i, { name: val })} value={v.name} />
          <div className="mt-2">
            <Field label="YouTube URL" onChange={(val) => patch(i, { url: val })} value={v.url} />
          </div>
        </div>
      ))}
      <button
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={add}
        type="button"
      >
        + Add video
      </button>
    </div>
  );
}
