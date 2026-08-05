'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import {
  type FeatureCell,
  type InfoItem,
  type ProductContent,
  type ProductView,
} from '~/lib/cabinet-admin/product-shape';

import { saveProductAction } from '../actions';

import { FaqEditor, Field, Group } from './faq-editor';
import { validateUrl } from './validators';

interface ProductData {
  view: ProductView;
  content: ProductContent;
}

export function ProductEditor({ product }: { product: ProductData }) {
  const [content, setContent] = useState<ProductContent>(product.content);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const { view } = product;

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await saveProductAction(view.id, content);

      setStatus({ ok: res.ok, msg: res.ok ? 'Saved.' : (res.error ?? 'Save failed.') });
    });
  };

  // Block save when any feature-cell image URL is malformed (empty allowed).
  const hasErrors = content.features.cells.some((c) => validateUrl(c.image) != null);

  return (
    <div>
      <Link
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        href="/cabinet-admin?tab=products"
      >
        ← Back to products
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">
          {view.name} <span className="font-normal text-gray-400">(product {view.id})</span>
        </h2>

        {/* VIEW-ONLY sections — managed in BigCommerce admin. */}
        <Group title="Basic (view only)">
          <ReadRow label="Name" value={view.name} />
          <ReadRow label="SKU" value={view.sku || '—'} />
          <ReadRow label="Status" value={view.isVisible ? 'Active' : 'Hidden'} />
        </Group>

        <Group title="Categories (view only)">
          {view.categoryNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {view.categoryNames.map((name, i) => (
                <span
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600"
                  key={i}
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No categories.</p>
          )}
        </Group>

        <Group title="Program Sibling (view only)">
          {view.sibling ? (
            <ReadRow
              label="Other-program twin"
              value={`${view.sibling.name} (#${view.sibling.productId})`}
            />
          ) : (
            <p className="text-sm text-gray-400">No sibling link set.</p>
          )}
        </Group>

        {/* EDITABLE content metafields. */}
        <Group title="Features Grid">
          <Field
            label="Headline"
            onChange={(v) =>
              setContent((c) => ({ ...c, features: { ...c.features, headline: v } }))
            }
            value={content.features.headline}
          />
          <Field
            label="Description"
            onChange={(v) =>
              setContent((c) => ({ ...c, features: { ...c.features, description: v } }))
            }
            value={content.features.description}
          />
          <FeatureCells
            cells={content.features.cells}
            onChange={(cells) => setContent((c) => ({ ...c, features: { ...c.features, cells } }))}
          />
        </Group>

        <Group title="FAQ">
          <FaqEditor
            onChange={(next) => setContent((c) => ({ ...c, faq: next }))}
            value={content.faq}
          />
        </Group>

        <Group title="Product Information">
          <Field
            label="Headline"
            onChange={(v) => setContent((c) => ({ ...c, info: { ...c.info, headline: v } }))}
            value={content.info.headline}
          />
          <InfoRows
            items={content.info.items}
            onChange={(items) => setContent((c) => ({ ...c, info: { ...c.info, items } }))}
          />
        </Group>

        <div className="mt-6 flex items-center gap-3">
          <button
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            disabled={pending || hasErrors}
            onClick={save}
            type="button"
          >
            {pending ? 'Saving…' : 'Save changes'}
          </button>
          {hasErrors && (
            <span className="text-sm text-red-600">Fix the highlighted fields to save.</span>
          )}
          {status && !hasErrors && (
            <span className={status.ok ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
              {status.msg}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-50 py-1.5 last:border-0">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

// Repeatable feature cells (image + title + text) for the PDP features grid.
function FeatureCells({
  cells,
  onChange,
}: {
  cells: FeatureCell[];
  onChange: (next: FeatureCell[]) => void;
}) {
  const patch = (i: number, p: Partial<FeatureCell>) =>
    onChange(cells.map((c, idx) => (idx === i ? { ...c, ...p } : c)));
  const remove = (i: number) => onChange(cells.filter((_, idx) => idx !== i));
  const add = () => onChange([...cells, { image: '', title: '', text: '' }]);

  return (
    <div className="space-y-3">
      {cells.length === 0 && <p className="text-sm text-gray-400">No feature cells yet.</p>}
      {cells.map((cell, i) => (
        <div className="rounded-lg border border-gray-100 p-3" key={i}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Cell {i + 1}
            </span>
            <button
              className="text-xs text-red-600 hover:underline"
              onClick={() => remove(i)}
              type="button"
            >
              Remove
            </button>
          </div>
          <Field label="Title" onChange={(v) => patch(i, { title: v })} value={cell.title} />
          <div className="mt-2">
            <Field label="Text" onChange={(v) => patch(i, { text: v })} value={cell.text} />
          </div>
          <div className="mt-2">
            <Field
              error={validateUrl(cell.image)}
              label="Image URL"
              onChange={(v) => patch(i, { image: v })}
              value={cell.image}
            />
          </div>
        </div>
      ))}
      <button
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={add}
        type="button"
      >
        + Add cell
      </button>
    </div>
  );
}

// Repeatable name/value rows for the Product Information section.
function InfoRows({
  items,
  onChange,
}: {
  items: InfoItem[];
  onChange: (next: InfoItem[]) => void;
}) {
  const patch = (i: number, p: Partial<InfoItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { name: '', value: '' }]);

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-gray-400">No rows yet.</p>}
      {items.map((it, i) => (
        <div className="flex items-start gap-2" key={i}>
          <div className="flex-1">
            <Field
              label={i === 0 ? 'Name' : ''}
              onChange={(v) => patch(i, { name: v })}
              value={it.name}
            />
          </div>
          <div className="flex-1">
            <Field
              label={i === 0 ? 'Value' : ''}
              onChange={(v) => patch(i, { value: v })}
              value={it.value}
            />
          </div>
          <button
            className="mt-6 shrink-0 rounded-lg px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
            onClick={() => remove(i)}
            type="button"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={add}
        type="button"
      >
        + Add row
      </button>
    </div>
  );
}
