# Cabinet admin: Microsoft 365 sign-in

EK staff use Microsoft 365, so `/cabinet-admin` offers "Sign in with Microsoft" next to the
agency's Google button. Both buttons end at the same gate: the signed-in email must be on the
`EK_ADMIN_EMAILS` allowlist (exact addresses, compared lowercase). A domain alone is never enough.

The Microsoft button is always on the login card so the provision is visible to the client, but
it stays greyed out with "Not currently active" under it until `MICROSOFT_CLIENT_ID`,
`MICROSOFT_CLIENT_SECRET` and `MICROSOFT_TENANT_ID` are set. Then it goes live on the next load.

## Status (18 Nov 2026)

EK sent the Application (client) ID, the Directory (tenant) ID and the **Secret ID**. The first
two are set in `.env.local` and on Vercel (Production, Preview, Development). The Secret ID is only
the label of the secret, not the secret itself; the button stays inactive until EK sends the secret
**Value** (the long string shown once when the secret is created, usually containing `~`). If that
value was not copied at the time, they add a new client secret and send its Value. Then set
`MICROSOFT_CLIENT_SECRET` in the same three places and redeploy.

## What EK's Microsoft 365 admin does (about ten minutes)

In the [Microsoft Entra admin center](https://entra.microsoft.com) → **Applications → App
registrations → New registration**:

1. **Name:** `Express Kitchens Cabinet Admin`.
2. **Supported account types:** *Accounts in this organizational directory only* (single tenant).
3. **Redirect URI:** platform *Web*, value
   `https://<live-domain>/api/admin-auth/callback/microsoft-entra-id`.
   While the site is still on the preview alias, add
   `https://ek-catalyst-live-test.vercel.app/api/admin-auth/callback/microsoft-entra-id` as a second
   URI (Authentication → Add URI). More than one is fine.
4. Register. From **Overview** copy the **Application (client) ID** and **Directory (tenant) ID**.
5. **Certificates & secrets → New client secret.** Pick the longest expiry offered (24 months) and
   copy the **Value** immediately; it is shown once. Note the expiry date somewhere: sign-in stops
   working the day it lapses and needs a fresh secret.
6. **API permissions** should already list Microsoft Graph `User.Read`. The app only requests
   `openid profile email`, which users can consent to themselves under default tenant settings. If
   the tenant restricts user consent, click **Grant admin consent for <tenant>** once.

Send the three values (client id, tenant id, secret) through a private channel, not email in the
clear. They go into Vercel as the three `MICROSOFT_*` env vars on Production and Preview, then a
redeploy turns the button on.

## Why single tenant

Auth.js validates the ID token's issuer. With a single-tenant registration the issuer is
`https://login.microsoftonline.com/<tenant-id>/v2.0` and matches. A multi-tenant ("common")
registration under another Microsoft account would also work for sign-in but trips that check, so
the registration lives in EK's tenant.

## Adding or removing a person

Edit `EK_ADMIN_EMAILS` on Vercel (comma-separated, all three environments) and redeploy. Removing
an address locks that person out on their next request; an existing session is a signed JWT, so
it is rechecked against the list on every admin action and page load, not only at sign-in.

## Implementation

- Provider, allowlist and `hasMicrosoftSignIn()` in [lib/cabinet-admin/admin-auth.ts](../lib/cabinet-admin/admin-auth.ts).
  The profile is reduced to `sub`, `name`, `email` (falls back to `preferred_username`, the UPN);
  no photo, no Graph call, so the session cookie stays small.
- Buttons in [app/cabinet-admin/_components/login-form.tsx](../app/cabinet-admin/_components/login-form.tsx),
  actions in [app/cabinet-admin/actions.ts](../app/cabinet-admin/actions.ts).
- Verified 18 Nov 2026 with placeholder credentials: the button renders when the vars are set and
  the redirect lands on `login.microsoftonline.com/<tenant>/oauth2/v2.0/authorize` with
  `redirect_uri=/api/admin-auth/callback/microsoft-entra-id` and scope `openid profile email`.
