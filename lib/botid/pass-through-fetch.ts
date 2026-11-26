/**
 * Same-origin paths that must never trigger the Vercel BotID challenge.
 *
 * BotID patches `window.fetch` so a POST matching the protect list first loads its challenge
 * script (Kasada, `/149e9513-…/c.js`) and attaches the `x-is-human` header. Our rule is
 * "any POST" because the footer newsletter posts to whichever page it sits on, but Vercel's own
 * Web Analytics and Speed Insights beacons (`POST /_vercel/insights/view`,
 * `/_vercel/speed-insights/vitals`) are same-origin POSTs too, so every page view pulled in the
 * challenge script, which logs a handful of bare "Error" lines while it probes the browser
 * (EK audit, 27 Nov 2026). Nothing of ours ever calls `checkBotId()` for those beacons.
 */
export const BOTID_PASS_THROUGH = /^\/(?:_vercel|_next)\//;

// Wraps the BotID-patched fetch (`guarded`) so pass-through paths go straight to the original
// (`raw`, captured before `initBotId()` ran). Returns a drop-in `window.fetch`.
export function passThroughFetch(raw: typeof fetch, guarded: typeof fetch): typeof fetch {
  return function fetchWithPassThrough(input, init) {
    const { location } = window;
    const target = new URL(input instanceof Request ? input.url : String(input), location.href);
    const bypass = target.origin === location.origin && BOTID_PASS_THROUGH.test(target.pathname);

    return (bypass ? raw : guarded).call(window, input, init);
  };
}
