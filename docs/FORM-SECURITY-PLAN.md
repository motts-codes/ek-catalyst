# Form security plan: layered bot and spam protection

Status: 8 Nov 2026. Phases 1 and 2 are built (see section 8); the Vercel project is on Pro, so
phase 3 is unblocked. Covers the Catalyst storefront on Vercel. The old Stencil site gets a short
note at the end.

## 1. What we are defending against

Spam arrives in four shapes, and no single layer stops all of them:

| Attacker                              | How it hits a form                                        | What stops it                                                                  |
| ------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Direct-POST scripts                   | Replay the form's HTTP request, never run JavaScript      | Server-side honeypot, BotID token check, rate limit                            |
| Headless browsers                     | Load the page, fill every field, submit in under a second | Honeypot, fill-time check, BotID signals                                       |
| Captcha farms and residential proxies | Real browsers, humans solving captchas                    | BotID Deep Analysis, rate limits, delivery hygiene (double opt-in, quarantine) |
| Credential stuffing and account abuse | Login and forgot-password hammering                       | Rate limit, BotID, BigCommerce lockout                                         |

Design rule: every check is enforced on the server. Client-side scripts only collect signals. A
check that fails open on error is fine for lead forms, never for login or register.

## 2. Form inventory and current state

| Form                                                                                                                                                                                               | Where                                   | Action                                                                        | Server validation     | Bot protection today                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| Lead forms (contact, design consult, countertop quote, book, siding, support, returns, price match, Pro Program, referral, multifamily, commercial, accessibility, category and PDP quote prompts) | 14 pages, see `grep -rl submitLead app` | `lib/forms/submit-lead.ts`                                                    | zod via conform       | **None.** Delivery is `console.info`, no CRM yet                      |
| Newsletter                                                                                                                                                                                         | Footer on every page                    | `components/subscribe/_actions/subscribe.ts` (BigCommerce subscribe mutation) | email only            | **None**                                                              |
| Register                                                                                                                                                                                           | `/register`                             | `register-customer.ts`                                                        | BigCommerce           | reCAPTCHA v2 checkbox, BigCommerce-managed, token checked server-side |
| Login                                                                                                                                                                                              | `/login`                                | `login.ts`                                                                    | Auth.js + BigCommerce | **None** in our code (BigCommerce lockout after failed attempts)      |
| Forgot password                                                                                                                                                                                    | `/login/forgot-password`                | `reset-password.ts`                                                           | BigCommerce           | **None**                                                              |
| Product review                                                                                                                                                                                     | PDP                                     | `submit-review.ts`                                                            | zod                   | reCAPTCHA v2                                                          |
| BigCommerce web-page contact form                                                                                                                                                                  | `/webpages/[id]/contact`                | `submit-contact-form.ts`                                                      | zod                   | reCAPTCHA v2                                                          |
| Account forms (addresses, settings, wishlists), cart and gift-certificate actions                                                                                                                  | Signed-in or cart-bound                 | various                                                                       | zod                   | Session-bound, low spam value. Rate limit only                        |

## 3. The layers, cheapest first

### Layer 0: server-side validation (exists, tighten)

Already in place through zod schemas in every server action. Add to the shared lead schema:

- Email: syntactic check plus a disposable-domain blocklist (a small list in `lib/forms/`, refreshed
  occasionally). Reject with a field error, not a silent drop.
- Phone: normalise to digits, require 10 digits for US numbers. Rejects "abc" (feedback point 18
  on checkout is BigCommerce's form, out of our hands, but ours should not accept it).
- Message fields: cap length, reject if more than N links, reject if no letters at all.
- Hard cap on field count and total body size so a replayed request cannot stuff extra fields.

Cost: none. Friction: none.

### Layer 1: honeypot and fill-time, enforced in the server action

Add two hidden inputs to `DynamicForm` so every form built on it gets them for free:

- `ek_company_site` (text, visually hidden, `tabindex=-1`, `autocomplete="off"`, not named
  anything a browser autofills such as "website" or "url"). Must be empty.
- `ek_t` (hidden, set to the page-load time after hydration). The action requires at least
  3 seconds for multi-field forms and 1.5 seconds for the single-field newsletter, and rejects
  pages older than 24 hours. A request replayed from the static HTML arrives with it empty.

  Why it is not signed: the lead-form pages are statically rendered, so the server cannot stamp a
  per-visitor token without making every page dynamic. The timestamp is therefore advisory: it
  catches scripts that do not bother, and BotID (Layer 2) covers the ones that forge it.

Enforcement in `submitLead` (and `subscribe`): a failing honeypot or timing check returns the
normal "thanks" redirect to the bot but does not deliver the lead. Logging records the reason. The
bot learns nothing; a wrongly flagged human loses one submission, which the fill-time floor keeps
rare. Lives in `vibes/soul/form/anti-spam-fields/` (the inputs), `lib/forms/anti-spam-check.ts`
(the pure checks) and `lib/forms/anti-spam.ts` (`guardForm`, which adds BotID, mode and logging).

Also covers `register`, `login` and forgot-password: the same hidden fields render in those forms,
with the timing floor skipped there because a password manager legitimately fills and submits in
under a second.

Cost: none. Friction: none. Stops: dumb form-fillers and request replays that copy the field set.

### Layer 2: Vercel BotID

The main layer for the lead forms, newsletter, login and forgot-password. Invisible to visitors.

- `botid` is installed. `instrumentation-client.ts` calls `initBotId` with one rule, `POST` to
  `/*`: every public form posts through a Server Action to the page it sits on, the quote prompts
  sit on dynamic category and product URLs, and the footer newsletter is on every page, so one
  wildcard is both simpler and safer than a path list. The rule only attaches a header; nothing is
  checked or billed unless an action calls `checkBotId()`. (Vercel now routes the BotID
  challenge requests itself, so no `next.config` wrapper is needed.)
- `guardForm` calls `checkBotId()` after the request-only signals. `isBot` on a lead form takes
  the silent path; on login and register it returns the generic "Something went wrong" error.
- Tiers: **Basic** is free on every plan. **Deep Analysis** (Kasada) is billed at about $1 per
  1,000 `checkBotId()` calls on Pro; only calls are billed, not page views. Running on Basic now.
  To move to Deep Analysis: enable it in the Vercel dashboard (Project, Firewall, Rules, "Vercel
  BotID Deep Analysis"), then change `BOTID_CHECK_LEVEL` in
  `vibes/soul/form/anti-spam-fields/constants.ts`. One constant feeds both client and server,
  because the two levels must match or verification fails.
- Local dev: `checkBotId()` always returns not-a-bot in `next dev`, and the client runtime is a
  no-op there. Use `developmentOptions: { bypass: 'BAD-BOT' }` in a test run to see the rejection
  path. On a Vercel preview, `curl` against a protected route is blocked by design; test from a page.

Cost: free (Basic) or a few dollars a month (Deep Analysis). Friction: none. Stops: direct-POST
scripts (no valid token), headless browsers, most automation frameworks.

### Layer 3: reCAPTCHA, kept where BigCommerce already enforces it

Register, product reviews and the BigCommerce web-page contact form keep the v2 checkbox. It is
verified by BigCommerce itself, so it is the one layer we do not have to maintain. Keep it on the
last step of the stepped register form (done, commit dd7e204).

Do not add reCAPTCHA to the lead forms or newsletter. The checkbox costs conversions on a quote
form, and Layers 1, 2 and 4 cover the same ground without it. Revisit only if Deep Analysis data
shows captcha-solving humans getting through in volume.

Decision for EK: once BotID Deep Analysis is live and quiet for a month, consider switching the
register checkbox off in BigCommerce to remove the last visible friction. Reversible in one setting.

### Layer 4: rate limiting

Two options; the plan uses both at different scopes.

- **Vercel WAF rate-limit rules** (Pro and Enterprise, usage-billed at roughly $0.50 per million
  allowed requests). Rules in the Firewall tab, no code. Start with:
  - `POST` to `/login` and `/login/forgot-password`: 10 per minute per IP, then challenge.
  - `POST` to `/register`: 5 per 10 minutes per IP, then deny.
  - `POST` to any lead-form path: 5 per minute per IP, then deny.
  - Also turn on the managed rulesets and Attack Challenge Mode as the emergency switch.
- **Application-level limits** for things the WAF cannot see, keyed by email or phone rather than
  IP: same email submitting a lead three times in an hour, same phone across forms. Use Upstash
  Redis (adapter already in `lib/kv/adapters/upstash.ts`, needs `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` in Vercel env) with a fixed window. On the limit, lead forms take the
  silent path; newsletter says "You're already subscribed".

Cost: WAF billed per allowed request, pennies at our traffic; Upstash free tier is enough.
Friction: none for normal visitors.

### Layer 5: delivery hygiene (when leads and newsletter are wired)

This is where captcha-farm spam, which passes every technical check, gets stopped from costing
anyone time.

- **Newsletter: MailerLite with double opt-in.** Unconfirmed addresses never enter the list, so
  fake subscribers are self-cleaning. Already requested by EK (feedback point 20). Built in
  `lib/newsletter/mailerlite.ts`: the subscribe action posts to MailerLite with status
  `unconfirmed` when `MAILERLITE_API_KEY` is set (plus optional `MAILERLITE_GROUP_ID`), and falls
  back to BigCommerce's list when it is not. To go live: create an API token in MailerLite
  (Integrations, API), turn on double opt-in for API signups (Subscribers, Settings), pick or
  create a "Website" group, and add the two variables in Vercel. First real signup should be
  checked end to end: confirmation email arrives, clicking it moves the subscriber to active.
- **Leads: monday.com.** Every lead form except account creation delivers to a monday.com board
  (`lib/leads/monday.ts`), active once `MONDAY_API_TOKEN` and `MONDAY_BOARD_ID` are set. Each
  lead is one item named "Form · Name" with the whole submission as its first update, plus typed
  columns when `MONDAY_COLUMN_MAP` lists the board's column ids. A failed delivery still shows the
  visitor the confirmation page and logs the lead under `[lead:undelivered]` for manual entry.
  Needed from EK: an API token with write access to the board, the board id, and (optionally)
  the column ids to map, or a read token so we can look them up.
- **Lead quarantine.** Every lead carries a score built from the layer results (BotID verdict,
  fill time, link count, disposable email, repeat email or phone). Score above a threshold goes to
  a "review" bucket in the CRM instead of the sales inbox, with a weekly glance by EK.
- **Dedupe** by normalised phone and email across a 24-hour window.
- **Honest confirmation.** The thank-you page tells real humans the phone number as the fallback
  ("If you don't hear from us within one business day, call 860-247-1000"), so a wrongly filtered
  lead still has a path.

### Layer 6: observability and tuning

- Log one structured line per rejection: form, reason code (`honeypot`, `too-fast`, `botid`,
  `rate-limit`, `disposable-email`), hashed IP, user agent family. No personal data in logs.
- Vercel Firewall overview for WAF and BotID counts; Vercel log drain or a daily query for the
  reason-code counts.
- Two-week report-only window for new layers on the lead forms: log what would be blocked, deliver
  anyway, compare against the inbox, then flip to enforce. The old Stencil site did the report-only
  idea with `console.warn`, which nobody could see. Here it goes to server logs.
- False-positive channel: the confirmation page and the showroom staff know to ask "did you
  submit a form?" and we can look the attempt up by reason code.

## 4. Phasing

| Phase | When                           | Work                                                                                                                                                  | Depends on                                       |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1     | Now, 1 to 2 days               | Layer 0 tightening, Layer 1 honeypot and signed timestamp in `DynamicForm` and the actions, Layer 6 logging. Report-only on lead forms for two weeks. | Nothing                                          |
| 2     | Same week                      | Layer 2 BotID Basic on lead forms, newsletter, login, forgot-password, register. Local and preview tests.                                             | `botid` package, Vercel deploy                   |
| 3     | After confirming Vercel Pro    | Layer 4 WAF rules and Attack Challenge Mode. BotID Deep Analysis on lead forms and login.                                                             | Vercel Pro plan                                  |
| 4     | With CRM and MailerLite wiring | Layer 5 double opt-in, quarantine scoring, dedupe. Upstash env for application rate limits.                                                           | EK picks the CRM and provides MailerLite API key |
| 5     | One month after launch         | Review reason-code counts, decide on removing the register captcha, tune thresholds.                                                                  | Data from phases 1 to 4                          |

## 5. Decisions needed

1. **Vercel plan.** Deep Analysis and WAF rate limiting need Pro. Confirm which plan the
   `ek-catalyst` project will run on at launch.
2. **CRM target for leads.** Nothing is delivered today. Layer 5 cannot be built without it.
3. **MailerLite** account access for the newsletter switch.
4. **Register captcha**: keep the BigCommerce checkbox at launch (recommended) and revisit later.
5. **Budget line** for BotID Deep Analysis: estimate under $5 a month at current form volumes.

## 6. Test plan

Playwright, run against local and preview:

- Honeypot filled: lead form shows the thank-you page, no `[lead:...]` log line, a
  `[antispam] honeypot` line instead.
- Submit within 1 second of render: same silent path with reason `too-fast`.
- Tampered or missing timestamp token: rejected.
- `curl` POST replaying a captured server-action request without a BotID token: rejected on
  preview (BotID only runs on Vercel).
- Human path: a normal fill at human speed delivers and redirects, axe and overflow unchanged.
- Login: 11 bad attempts from one IP in a minute hits the WAF challenge on preview.
- Newsletter: duplicate email within an hour returns "already subscribed" without a second
  mutation.

## 7. Status of the build (8 Nov 2026)

Done, local commit, report mode:

- Hidden fields in every public form: the shared `DynamicForm` (all 14 lead forms, register), the
  footer newsletter, login, forgot-password.
- `guardForm` wired into `submit-lead.ts`, `subscribe.ts`, `login.ts`, `reset-password.ts` and
  `register-customer.ts`. Lead forms and newsletter take the silent path when blocked; login and
  register return the generic error; forgot-password returns its normal "check your email" text.
- Layer 0 inside the same check: more than 3 links across the text fields, or a disposable email
  domain, counts as a signal. The domain list is the `disposable-email-domains` package (about
  120k exact domains plus 400 wildcard suffixes), matched case-insensitively on the part after the
  `@`; bump the package now and then to pick up new services. Phone already required 10 US digits.
- BotID Basic on every POST. Vercel project `ek-catalyst` is on the Pro team, so Deep Analysis
  and WAF rate limits are available when wanted.
- Mode switch: `FORM_ANTISPAM_MODE=enforce` in the Vercel environment flips from log-only to
  blocking. Default is report. Grep the logs for `[antispam]`.

Still to do, in order: two weeks of report-mode logs on preview, WAF rate-limit rules (section 3,
Layer 4), Deep Analysis on lead forms and login, then Layer 5 with the CRM and MailerLite.

## 8. The old Stencil site, while it is still live

Not our build, but three cheap fixes if EK wants them before cut-over:

- Rename the honeypot from `website` to something browsers will not autofill, and flip
  `REPORT_ONLY` to false only after the "would block" events are sent somewhere visible (a GA4
  event is enough).
- Protect the phone-uniqueness endpoint on the Laravel server: it is a public GET that confirms
  whether any phone number is an EK customer. Require a session token and rate-limit it, or move
  the check to the server side of the account-creation request.
- Move the footer newsletter to the MailerLite embed with double opt-in now; it carries over to
  the new site unchanged.
