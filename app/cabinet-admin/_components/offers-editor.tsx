'use client';

import { useState, useTransition } from 'react';

import { type ProductLineOption } from '~/lib/cabinet-admin/attributes-shape';
import { type CabinetOffer } from '~/lib/cabinet-admin/offers-shape';

import { saveOffersAction } from '../actions';

import { Field } from './faq-editor';
import { validateUrl } from './validators';

const toScope = (v: string): CabinetOffer['scope'] =>
  v === 'line' || v === 'collection' ? v : 'all';
const toProgram = (v: string): CabinetOffer['program'] =>
  v === 'assembled' || v === 'rta' ? v : 'both';

// A blank offer (client-side; the shape module is server-only).
function emptyOffer(): CabinetOffer {
  return {
    id: `offer-${Math.random().toString(36).slice(2, 10)}`,
    text: '',
    highlight: '',
    url: '',
    scope: 'all',
    lineId: '',
    collectionId: '',
    program: 'both',
    active: true,
    startsOn: '',
    endsOn: '',
  };
}

// Offers registry editor: one card per offer with its text, the word to pick out, where it shows
// (all cabinets / a product line / one collection + program), an on/off switch and optional dates.
export function OffersEditor({
  initial,
  productLines,
  collections,
}: {
  initial: CabinetOffer[];
  productLines: ProductLineOption[];
  collections: Array<{ id: number; name: string }>;
}) {
  const [offers, setOffers] = useState<CabinetOffer[]>(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const update = (i: number, patch: Partial<CabinetOffer>) =>
    setOffers((list) => list.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const remove = (i: number) => setOffers((list) => list.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setOffers((list) => {
      const j = i + dir;

      if (j < 0 || j >= list.length) return list;

      const next = [...list];
      const [row] = next.splice(i, 1);

      if (row) next.splice(j, 0, row);

      return next;
    });

  const hasErrors = offers.some(
    (o) =>
      o.text.trim() === '' ||
      (o.highlight !== '' && !o.text.includes(o.highlight)) ||
      validateUrl(o.url) != null ||
      (o.scope === 'line' && o.lineId === '') ||
      (o.scope === 'collection' && o.collectionId === ''),
  );

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await saveOffersAction(offers);

      setStatus({ ok: res.ok, msg: res.ok ? 'Saved.' : (res.error ?? 'Save failed.') });
    });
  };

  const select =
    'w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none';

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Offers</h1>
      <p className="mb-4 max-w-2xl text-sm text-gray-500">
        Shown in the &ldquo;Offers&rdquo; row on cabinet collection pages. Each offer applies to
        every collection, to one product line, or to one collection (optionally one program). Order
        here is the order on the page.
      </p>

      <section className="space-y-4">
        {offers.length === 0 && <p className="text-sm text-gray-400">No offers yet.</p>}

        {offers.map((offer, i) => {
          const highlightBad = offer.highlight !== '' && !offer.text.includes(offer.highlight);

          return (
            <div
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                offer.active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70'
              }`}
              key={offer.id}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    checked={offer.active}
                    onChange={(e) => update(i, { active: e.target.checked })}
                    type="checkbox"
                  />
                  Active
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
                    onClick={() => move(i, -1)}
                    type="button"
                  >
                    ↑
                  </button>
                  <button
                    className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
                    onClick={() => move(i, 1)}
                    type="button"
                  >
                    ↓
                  </button>
                  <button
                    className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                    onClick={() => remove(i)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <Field
                error={offer.text.trim() === '' ? 'Offer text is required.' : null}
                label="Offer"
                onChange={(v) => update(i, { text: v })}
                placeholder="Free shipping on purchases above $2,500."
                value={offer.text}
              />
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field
                  error={highlightBad ? 'Must be part of the offer text.' : null}
                  label="Pick out in black (optional)"
                  onChange={(v) => update(i, { highlight: v })}
                  placeholder="$2,500"
                  value={offer.highlight}
                />
                <Field
                  error={validateUrl(offer.url)}
                  label="Details link (optional) — shown as an arrow after the text"
                  onChange={(v) => update(i, { url: v })}
                  placeholder="/promotions/free-samples"
                  value={offer.url}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-600">Shows on</span>
                  <select
                    className={select}
                    onChange={(e) => update(i, { scope: toScope(e.target.value) })}
                    value={offer.scope}
                  >
                    <option value="all">All cabinet collections</option>
                    <option value="line">One product line</option>
                    <option value="collection">One collection</option>
                  </select>
                </label>
                {offer.scope === 'line' && (
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      Product line
                    </span>
                    <select
                      className={select}
                      onChange={(e) => update(i, { lineId: e.target.value })}
                      value={offer.lineId}
                    >
                      <option value="">— Select —</option>
                      {productLines.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {offer.scope === 'collection' && (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-600">
                        Collection
                      </span>
                      <select
                        className={select}
                        onChange={(e) => update(i, { collectionId: e.target.value })}
                        value={offer.collectionId}
                      >
                        <option value="">— Select —</option>
                        {collections.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-600">Program</span>
                      <select
                        className={select}
                        onChange={(e) => update(i, { program: toProgram(e.target.value) })}
                        value={offer.program}
                      >
                        <option value="both">Assembled and RTA</option>
                        <option value="assembled">Assembled only</option>
                        <option value="rta">RTA only</option>
                      </select>
                    </label>
                  </>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 md:max-w-sm">
                <Field
                  label="Starts (YYYY-MM-DD, optional)"
                  onChange={(v) => update(i, { startsOn: v })}
                  value={offer.startsOn}
                />
                <Field
                  label="Ends (YYYY-MM-DD, optional)"
                  onChange={(v) => update(i, { endsOn: v })}
                  value={offer.endsOn}
                />
              </div>
            </div>
          );
        })}

        <button
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => setOffers((list) => [...list, emptyOffer()])}
          type="button"
        >
          + Add offer
        </button>
      </section>

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
    </div>
  );
}
