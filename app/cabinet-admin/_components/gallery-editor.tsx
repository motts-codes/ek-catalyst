'use client';

import { useState, useTransition } from 'react';

import {
  CUSTOM_REF,
  type GalleryConfig,
  type GallerySlot,
} from '~/lib/inspiration/kitchen-gallery-config';

import { saveGalleryAction } from '../actions';

import { validateUrl } from './validators';

export interface KitchenOption {
  ref: string;
  name: string;
  src: string;
}

const select =
  'w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none';
const input = select;
const small = 'rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50';

// The best-sellers gallery layout: a column per card, a row per kitchen. Each row is a dropdown
// of every collection's kitchen photo (and every finish's), or a custom picture by URL. Rows and
// columns can be reordered; the page shows the columns as laid out here.
export function GalleryEditor({
  initial,
  options,
  suggested,
}: {
  initial: GalleryConfig | null;
  options: KitchenOption[];
  suggested: GallerySlot[][];
}) {
  const [columns, setColumns] = useState<GallerySlot[][]>(initial?.columns ?? suggested);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const bySrc = new Map(options.map((o) => [o.ref, o]));

  const setSlot = (c: number, r: number, patch: Partial<GallerySlot>) =>
    setColumns((cols) =>
      cols.map((col, ci) =>
        ci === c ? col.map((slot, ri) => (ri === r ? { ...slot, ...patch } : slot)) : col,
      ),
    );
  const changeRef = (c: number, r: number, ref: string) =>
    setSlot(
      c,
      r,
      ref === CUSTOM_REF
        ? { ref, src: '', name: '', href: '' }
        : { ref, src: undefined, name: undefined, href: undefined },
    );
  const addRow = (c: number) =>
    setColumns((cols) =>
      cols.map((col, ci) => (ci === c ? [...col, { ref: options[0]?.ref ?? CUSTOM_REF }] : col)),
    );
  const removeRow = (c: number, r: number) =>
    setColumns((cols) => cols.map((col, ci) => (ci === c ? col.filter((_, ri) => ri !== r) : col)));
  const moveRow = (c: number, r: number, dir: -1 | 1) =>
    setColumns((cols) =>
      cols.map((col, ci) => {
        if (ci !== c) return col;

        const j = r + dir;

        if (j < 0 || j >= col.length) return col;

        const next = [...col];
        const [row] = next.splice(r, 1);

        if (row) next.splice(j, 0, row);

        return next;
      }),
    );
  const addColumn = () => setColumns((cols) => (cols.length < 4 ? [...cols, []] : cols));
  const removeColumn = (c: number) => setColumns((cols) => cols.filter((_, ci) => ci !== c));
  const moveColumn = (c: number, dir: -1 | 1) =>
    setColumns((cols) => {
      const j = c + dir;

      if (j < 0 || j >= cols.length) return cols;

      const next = [...cols];
      const [col] = next.splice(c, 1);

      if (col) next.splice(j, 0, col);

      return next;
    });

  const customError = (slot: GallerySlot) =>
    slot.ref === CUSTOM_REF
      ? (!slot.src?.trim() ? 'Image URL is required.' : validateUrl(slot.src)) ||
        (slot.href ? validateUrl(slot.href) : null)
      : null;
  const hasErrors = columns.some((col) => col.some((slot) => customError(slot) != null));
  const total = columns.reduce((n, col) => n + col.length, 0);

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await saveGalleryAction({ columns });

      setStatus({ ok: res.ok, msg: res.ok ? 'Saved.' : (res.error ?? 'Save failed.') });
    });
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Best sellers gallery</h1>
      <p className="mb-4 max-w-2xl text-sm text-gray-500">
        The kitchens on /inspiration/best-sellers, one column per card below. Pick any
        collection&rsquo;s kitchen photo (Prism lists every colour), or paste a picture of your own.
        Rows run top to bottom in each column and loop; the page shows up to three columns on a
        laptop and two on a phone.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <button className={small} onClick={addColumn} type="button">
          + Add column
        </button>
        <button className={small} onClick={() => setColumns(suggested)} type="button">
          Reset to the automatic mix
        </button>
        <span className="text-gray-500">
          {columns.length} column{columns.length === 1 ? '' : 's'}, {total} kitchen
          {total === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {columns.map((col, c) => (
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm" key={c}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Column {c + 1}</h2>
              <div className="flex gap-1">
                <button className={small} onClick={() => moveColumn(c, -1)} type="button">
                  ←
                </button>
                <button className={small} onClick={() => moveColumn(c, 1)} type="button">
                  →
                </button>
                <button
                  className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => removeColumn(c)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>

            <ol className="space-y-2">
              {col.map((slot, r) => {
                const option = bySrc.get(slot.ref);
                const preview = slot.ref === CUSTOM_REF ? slot.src : option?.src;
                const error = customError(slot);

                return (
                  <li className="rounded-lg border border-gray-100 bg-gray-50 p-2" key={r}>
                    <div className="flex items-start gap-2">
                      <span className="w-5 shrink-0 pt-1.5 text-right text-xs text-gray-400">
                        {r + 1}
                      </span>
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="h-12 w-16 shrink-0 rounded object-cover"
                          src={preview}
                        />
                      ) : (
                        <span className="h-12 w-16 shrink-0 rounded bg-gray-200" />
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <select
                          aria-label={`Column ${c + 1}, row ${r + 1}: kitchen`}
                          className={select}
                          onChange={(e) => changeRef(c, r, e.target.value)}
                          value={slot.ref}
                        >
                          {!option && slot.ref !== CUSTOM_REF && (
                            <option value={slot.ref}>(no longer available)</option>
                          )}
                          {options.map((o) => (
                            <option key={o.ref} value={o.ref}>
                              {o.name}
                            </option>
                          ))}
                          <option value={CUSTOM_REF}>Custom image…</option>
                        </select>
                        {slot.ref === CUSTOM_REF && (
                          <>
                            <input
                              aria-label="Image URL"
                              className={input}
                              onChange={(e) => setSlot(c, r, { src: e.target.value })}
                              placeholder="https://… image URL"
                              value={slot.src ?? ''}
                            />
                            <input
                              aria-label="Name"
                              className={input}
                              onChange={(e) => setSlot(c, r, { name: e.target.value })}
                              placeholder="Name shown on hover"
                              value={slot.name ?? ''}
                            />
                            <input
                              aria-label="Link"
                              className={input}
                              onChange={(e) => setSlot(c, r, { href: e.target.value })}
                              placeholder="/cabinets/… where View collection goes"
                              value={slot.href ?? ''}
                            />
                            {error ? <p className="text-xs text-red-600">{error}</p> : null}
                          </>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button className={small} onClick={() => moveRow(c, r, -1)} type="button">
                          ↑
                        </button>
                        <button className={small} onClick={() => moveRow(c, r, 1)} type="button">
                          ↓
                        </button>
                        <button
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          onClick={() => removeRow(c, r)}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <button className={`${small} mt-3`} onClick={() => addRow(c)} type="button">
              + Add kitchen
            </button>
          </section>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={pending || hasErrors || total === 0}
          onClick={save}
          type="button"
        >
          {pending ? 'Saving…' : 'Save gallery'}
        </button>
        {status && (
          <p className={`text-sm ${status.ok ? 'text-green-700' : 'text-red-600'}`}>{status.msg}</p>
        )}
        {hasErrors && <p className="text-sm text-red-600">Fix the custom image fields first.</p>}
      </div>
    </div>
  );
}
