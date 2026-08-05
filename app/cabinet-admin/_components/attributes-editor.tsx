'use client';

import { useState, useTransition } from 'react';

import {
  type CabinetAttributes,
  type ColorOption,
  type ConstructionOption,
  type ProductLineOption,
} from '~/lib/cabinet-admin/attributes-shape';

import { saveAttributesAction } from '../actions';

import { Group } from './faq-editor';
import { validateHex, validateUrl } from './validators';

// Master-list editor for the reusable cabinet attributes (category 863). Product lines and
// constructions are simple named options; colors carry name + hex + image URL. Each option gets a
// stable id (referenced by collections), assigned when the row is added.
function newId(): string {
  return crypto.randomUUID();
}

export function AttributesEditor({ initial }: { initial: CabinetAttributes }) {
  const [data, setData] = useState<CabinetAttributes>(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await saveAttributesAction(data);

      setStatus({ ok: res.ok, msg: res.ok ? 'Saved.' : (res.error ?? 'Save failed.') });
    });
  };

  // Block save when any color has a malformed hex or image URL (empty allowed).
  const hasErrors = data.colors.some(
    (c) => validateHex(c.hex) != null || validateUrl(c.image) != null,
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Attributes</h1>
      <p className="mb-4 max-w-2xl text-sm text-gray-500">
        Reusable option lists. These appear as dropdowns and swatch pickers when you edit a
        collection. Editing an option here updates it everywhere it&apos;s used.
      </p>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Group title="Product Line">
          <NamedList
            addLabel="+ Add product line"
            emptyLabel="No product lines yet."
            onChange={(productLines) => setData((d) => ({ ...d, productLines }))}
            options={data.productLines}
            placeholder="e.g. Star, Prism, Euro Max"
          />
        </Group>

        <Group title="Construction">
          <NamedList
            addLabel="+ Add construction"
            emptyLabel="No constructions yet."
            onChange={(constructions) => setData((d) => ({ ...d, constructions }))}
            options={data.constructions}
            placeholder="e.g. Framed, Frameless, Slab"
          />
        </Group>

        <Group title="Color">
          <ColorList
            onChange={(colors) => setData((d) => ({ ...d, colors }))}
            options={data.colors}
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

// A simple {id,name} list editor (Product Line / Construction).
function NamedList<T extends ProductLineOption | ConstructionOption>({
  options,
  onChange,
  placeholder,
  addLabel,
  emptyLabel,
}: {
  options: T[];
  onChange: (next: T[]) => void;
  placeholder: string;
  addLabel: string;
  emptyLabel: string;
}) {
  const setName = (i: number, name: string) =>
    onChange(options.map((o, idx) => (idx === i ? { ...o, name } : o)));
  const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i));
  const add = () => onChange([...options, { id: newId(), name: '' } as T]);

  return (
    <div className="space-y-2">
      {options.length === 0 && <p className="text-sm text-gray-400">{emptyLabel}</p>}
      {options.map((o, i) => (
        <div className="flex items-center gap-2" key={o.id}>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
            onChange={(e) => setName(i, e.target.value)}
            placeholder={placeholder}
            type="text"
            value={o.name}
          />
          <button
            className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
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
        {addLabel}
      </button>
    </div>
  );
}

// Color list: name + hex + image URL, with a live swatch preview.
function ColorList({
  options,
  onChange,
}: {
  options: ColorOption[];
  onChange: (next: ColorOption[]) => void;
}) {
  const patch = (i: number, p: Partial<ColorOption>) =>
    onChange(options.map((o, idx) => (idx === i ? { ...o, ...p } : o)));
  const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i));
  const add = () => onChange([...options, { id: newId(), name: '', hex: '', image: '' }]);

  return (
    <div className="space-y-3">
      {options.length === 0 && <p className="text-sm text-gray-400">No colors yet.</p>}
      {options.map((o, i) => (
        <div className="rounded-lg border border-gray-100 p-3" key={o.id}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block size-6 rounded-full border border-gray-200 bg-cover bg-center"
                style={{
                  backgroundColor: o.hex || undefined,
                  backgroundImage: o.image ? `url(${o.image})` : undefined,
                }}
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {o.name || 'New color'}
              </span>
            </div>
            <button
              className="text-xs text-red-600 hover:underline"
              onClick={() => remove(i)}
              type="button"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <LabeledInput
              label="Name"
              onChange={(v) => patch(i, { name: v })}
              placeholder="Bisque"
              value={o.name}
            />
            <LabeledInput
              error={validateHex(o.hex)}
              label="Hex"
              onChange={(v) => patch(i, { hex: v })}
              placeholder="#E3D9C6"
              value={o.hex}
            />
            <LabeledInput
              error={validateUrl(o.image)}
              label="Image URL"
              onChange={(v) => patch(i, { image: v })}
              placeholder="https://…/swatch.jpg"
              value={o.image}
            />
          </div>
        </div>
      ))}
      <button
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        onClick={add}
        type="button"
      >
        + Add color
      </button>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        className={`w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'
        }`}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {error != null && error !== '' && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}
