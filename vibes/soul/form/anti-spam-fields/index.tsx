'use client';

import { useEffect, useState } from 'react';

import { HONEYPOT_FIELD, LOADED_AT_FIELD } from './constants';

// Two hidden inputs every public form carries. Checked on the server by `guardForm`
// (lib/forms/anti-spam.ts); nothing here blocks anything on its own.
//
// - Honeypot: off-screen text input real visitors never see or tab into. A bot that fills every
//   field fills this one.
// - Loaded-at: set to Date.now() after hydration, so a request replayed from the static HTML
//   arrives with it empty, and a script that runs the page and submits at once arrives with it
//   a few hundred milliseconds old.
//
// The timestamp is advisory, not signed: lead-form pages are statically rendered, so the server
// cannot stamp them per visitor without making every page dynamic. BotID covers forged values.
export function AntiSpamFields() {
  const [loadedAt, setLoadedAt] = useState('');

  useEffect(() => {
    setLoadedAt(String(Date.now()));
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        data-antispam
      >
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input
          autoComplete="off"
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          type="text"
        />
      </div>
      <input name={LOADED_AT_FIELD} type="hidden" value={loadedAt} />
    </>
  );
}
