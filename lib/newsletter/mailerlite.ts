import 'server-only';

// Footer newsletter → MailerLite (Connect API). Active when MAILERLITE_API_KEY is set; otherwise
// the subscribe action falls back to BigCommerce's own newsletter list.
//
// Double opt-in: we send status "unconfirmed" so MailerLite emails the confirmation link and the
// address only joins the list once the visitor clicks it. That requires double opt-in to be ON
// for API signups in the MailerLite account (Subscribers → Settings → Double opt-in). Set
// MAILERLITE_DOUBLE_OPT_IN=false to add subscribers as active instead.
//
// Env: MAILERLITE_API_KEY (required), MAILERLITE_GROUP_ID (optional; the "Website" group id from
// GET /api/groups), MAILERLITE_DOUBLE_OPT_IN (optional, default true).

const API = 'https://connect.mailerlite.com/api';

export type MailerLiteResult =
  | { ok: true; outcome: 'created' | 'updated' }
  | { ok: false; kind: 'invalid-email' | 'rate-limited' | 'error'; status?: number };

export function isMailerLiteConfigured(): boolean {
  return Boolean(process.env.MAILERLITE_API_KEY);
}

export async function subscribeToMailerLite(
  email: string,
  options: { ip?: string | null } = {},
): Promise<MailerLiteResult> {
  const apiKey = process.env.MAILERLITE_API_KEY;

  if (!apiKey) {
    return { ok: false, kind: 'error' };
  }

  const groupId = process.env.MAILERLITE_GROUP_ID?.trim();
  const doubleOptIn = process.env.MAILERLITE_DOUBLE_OPT_IN !== 'false';

  const body: Record<string, unknown> = {
    email,
    status: doubleOptIn ? 'unconfirmed' : 'active',
    ...(groupId ? { groups: [groupId] } : {}),
    ...(options.ip ? { ip_address: options.ip } : {}),
  };

  try {
    const response = await fetch(`${API}/subscribers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });

    if (response.status === 201) {
      return { ok: true, outcome: 'created' };
    }

    if (response.status === 200) {
      // Upsert of an address MailerLite already knows. Treated as success so the form never
      // reveals whether an email is on the list.
      return { ok: true, outcome: 'updated' };
    }

    if (response.status === 422) {
      return { ok: false, kind: 'invalid-email', status: 422 };
    }

    if (response.status === 429) {
      return { ok: false, kind: 'rate-limited', status: 429 };
    }

    // eslint-disable-next-line no-console
    console.error('[newsletter] MailerLite responded', response.status, await safeText(response));

    return { ok: false, kind: 'error', status: response.status };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[newsletter] MailerLite request failed', error);

    return { ok: false, kind: 'error' };
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return '';
  }
}
