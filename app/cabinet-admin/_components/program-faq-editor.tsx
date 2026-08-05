'use client';

import { useState, useTransition } from 'react';

import { type ProgramFaq } from '~/lib/cabinet-admin/collection-shape';

import { saveProgramFaqAction } from '../actions';

import { FaqEditor, Group } from './faq-editor';

// Editor for the program-wide FAQ (Cabinets parent category 863), shown on the
// /cabinets/assembled-cabinets and /rta-cabinets listing pages. One FAQ per program.
export function ProgramFaqEditor({ initial }: { initial: ProgramFaq }) {
  const [data, setData] = useState<ProgramFaq>(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const save = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await saveProgramFaqAction(data);

      setStatus({ ok: res.ok, msg: res.ok ? 'Saved.' : res.error ?? 'Save failed.' });
    });
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Cabinet Assembly</h1>
      <p className="mb-4 max-w-2xl text-sm text-gray-500">
        Content shown on the cabinet shop pages (Assembled and RTA). For now this is the program-wide
        FAQ — questions that apply to the whole program. For questions specific to one collection
        (Avon, Dover…), edit that collection instead. More sections can be added here later.
      </p>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {(['assembled', 'rta'] as const).map((prog) => (
          <Group key={prog} title={`FAQ — ${prog === 'assembled' ? 'Assembled' : 'RTA'}`}>
            <FaqEditor
              onChange={(next) => setData((d) => ({ ...d, [prog]: next }))}
              value={data[prog]}
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
