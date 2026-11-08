import { initBotId } from 'botid/client/core';

import { BOTID_CHECK_LEVEL } from '@/vibes/soul/form/anti-spam-fields/constants';

// Vercel BotID client runtime. It patches fetch/XHR so every same-origin POST that matches the
// list below carries a bot-detection signal, which `checkBotId()` reads in the server action.
//
// Every public form on this site posts through a Server Action to the page it sits on, and the
// footer newsletter sits on every page, so the pattern is "any POST". That only attaches a
// header; nothing is checked or billed unless an action calls `checkBotId()` (lib/forms/anti-spam).
// `*` expands to any path segment(s). No-op in `next dev`.
initBotId({
  protect: [{ path: '/*', method: 'POST', advancedOptions: { checkLevel: BOTID_CHECK_LEVEL } }],
});
