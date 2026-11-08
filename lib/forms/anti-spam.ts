import 'server-only';

import { checkBotId } from 'botid/server';

import { BOTID_CHECK_LEVEL } from '@/vibes/soul/form/anti-spam-fields/constants';

import { checkFormSignals, type SignalOptions, type SpamReason } from './anti-spam-check';

export type { SpamReason } from './anti-spam-check';

/**
 * FORM_ANTISPAM_MODE
 *   report  (default) log what would be blocked, let the submission through
 *   enforce          block it
 *
 * Run new forms in report mode for a couple of weeks, compare the log against the inbox, then
 * flip to enforce in the Vercel environment variables. See docs/FORM-SECURITY-PLAN.md.
 */
export type AntiSpamMode = 'report' | 'enforce';

export function antiSpamMode(): AntiSpamMode {
  return process.env.FORM_ANTISPAM_MODE === 'enforce' ? 'enforce' : 'report';
}

export type GuardOptions = Omit<SignalOptions, 'now'>;

export interface GuardResult {
  /** True when the action should NOT proceed (always false in report mode). */
  blocked: boolean;
  /** The failing signal, if any, whether or not it was enforced. */
  reason: SpamReason | null;
  mode: AntiSpamMode;
}

// Runs every server-side bot signal for a form submission: honeypot, page-load timing, link
// count, disposable email, then Vercel BotID. Returns whether to block (never in report mode)
// and the failing signal, if any.
//
// Call it first thing in a server action, before validation, so a bot gets no field-level
// feedback. Lead forms should then take the normal "thanks" path without delivering; auth forms
// should return a generic error. `form` is the short name for the log line, e.g. "contact".
export async function guardForm(
  form: string,
  formData: FormData,
  options: GuardOptions,
): Promise<GuardResult> {
  const mode = antiSpamMode();
  const reason = checkFormSignals(formData, options) ?? (await botIdReason());

  if (reason) {
    log(form, reason, mode);
  }

  return { blocked: mode === 'enforce' && reason !== null, reason, mode };
}

async function botIdReason(): Promise<SpamReason | null> {
  try {
    // In `next dev` this always resolves { isBot: false }. On Vercel it reads the signal the
    // client runtime (instrumentation-client.ts) attached to the request.
    const verdict = await checkBotId({ advancedOptions: { checkLevel: BOTID_CHECK_LEVEL } });

    return verdict.isBot && !verdict.isVerifiedBot ? 'botid' : null;
  } catch (error) {
    // Fail open: a BotID outage must not take the forms down. The other signals still apply.
    // eslint-disable-next-line no-console
    console.error('[antispam] botid check failed', error);

    return null;
  }
}

function log(form: string, reason: SpamReason, mode: AntiSpamMode) {
  // One structured line per flagged submission, no personal data. Grep for "[antispam]".
  // eslint-disable-next-line no-console
  console.warn('[antispam]', JSON.stringify({ form, reason, mode, at: new Date().toISOString() }));
}
