// Pure, dependency-free signal checks so they can be unit-tested with plain Node.
// The server wrapper (anti-spam.ts) adds BotID, mode handling and logging.

import { HONEYPOT_FIELD, LOADED_AT_FIELD } from '@/vibes/soul/form/anti-spam-fields/constants';

export type SpamReason =
  | 'honeypot'
  | 'no-timestamp'
  | 'too-fast'
  | 'stale-page'
  | 'too-many-links'
  | 'disposable-email'
  | 'botid';

export interface SignalOptions {
  /** Minimum milliseconds between page load and submit. */
  minMs: number;
  /** Maximum page age before we assume a stored/replayed token. Default 24h. */
  maxMs?: number;
  /** Links allowed across all free-text values before the submission is flagged. Default 3. */
  maxLinks?: number;
  /**
   * Skip the page-age checks. For login and password reset, where a password manager can
   * legitimately fill and submit in well under a second.
   */
  skipTiming?: boolean;
  /** Injected for tests. */
  now?: number;
}

const DAY = 24 * 60 * 60 * 1000;
const LINK_PATTERN = /https?:\/\/|www\./gi;

/**
 * Throwaway-mail domains seen in lead spam. Short on purpose: the goal is to stop the obvious
 * ones for free, not to maintain a registry. Extend when a new one shows up in the logs.
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'mailinator.com',
  'sharklasers.com',
  'temp-mail.org',
  'tempmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
  'getnada.com',
  'dispostable.com',
  'maildrop.cc',
  'fakeinbox.com',
]);

export function emailDomain(email: string): string {
  const at = email.lastIndexOf('@');

  return at === -1
    ? ''
    : email
        .slice(at + 1)
        .trim()
        .toLowerCase();
}

export function countLinks(values: string[]): number {
  return values.reduce((n, v) => n + (v.match(LINK_PATTERN)?.length ?? 0), 0);
}

/**
 * Runs the request-only bot signals, cheapest and most certain first.
 *
 * @param formData The submitted form.
 * @param options Timing floor and limits.
 * @returns The first failing signal, or null when the submission looks human.
 */
export function checkFormSignals(formData: FormData, options: SignalOptions): SpamReason | null {
  const { minMs, maxMs = DAY, maxLinks = 3, skipTiming = false, now = Date.now() } = options;

  const honeypot = formData.get(HONEYPOT_FIELD);

  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return 'honeypot';
  }

  if (!skipTiming) {
    const loadedRaw = formData.get(LOADED_AT_FIELD);
    const loadedAt = typeof loadedRaw === 'string' ? Number(loadedRaw) : NaN;

    if (!Number.isFinite(loadedAt) || loadedAt <= 0) {
      return 'no-timestamp';
    }

    const age = now - loadedAt;

    if (age < minMs) {
      return 'too-fast';
    }

    if (age > maxMs) {
      return 'stale-page';
    }
  }

  const entries = Array.from(formData.entries()).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );

  if (countLinks(entries.map(([, value]) => value)) > maxLinks) {
    return 'too-many-links';
  }

  const email = entries.find(([key]) => key === 'email')?.[1];

  if (email && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain(email))) {
    return 'disposable-email';
  }

  return null;
}
