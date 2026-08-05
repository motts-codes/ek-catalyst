'use client';

import { type FaqItem } from '~/lib/cabinet-admin/collection-shape';

// Shared admin form primitives + a repeatable Q&A editor, used by both the collection editor
// (per-collection FAQ) and the program-FAQ editor (category 863). Keeping these in one place means
// the two FAQ editors stay visually and behaviourally identical.

export function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function Field({
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

// Repeatable Q&A editor for one FAQ list. Add / remove / edit question-answer rows.
export function FaqEditor({
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

      {value.items.length === 0 && <p className="text-sm text-gray-400">No questions yet.</p>}

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
