// Shared between the client-side hidden fields and the server-side check. Kept in a plain
// module (no 'use client') so server code can import the strings directly.

/**
 * Honeypot input name. Must contain no word a browser's autofill heuristics recognise: Chrome
 * filled an earlier name that contained "company" with a real visitor's company (8 Nov 2026),
 * which would have flagged a human. Keep it meaningless.
 */
export const HONEYPOT_FIELD = 'ek_x7q';

/** Hidden input carrying the client's page-load time (ms since epoch), set after hydration. */
export const LOADED_AT_FIELD = 'ek_t';

/**
 * Vercel BotID check level. Must be the SAME value on the client (instrumentation-client.ts)
 * and the server (checkBotId), or verification fails. 'basic' is free on every plan;
 * 'deepAnalysis' is billed per check on Pro and must also be enabled in the Vercel dashboard
 * (Project → Firewall → Rules → Vercel BotID Deep Analysis).
 */
export const BOTID_CHECK_LEVEL: 'basic' | 'deepAnalysis' = 'basic';
