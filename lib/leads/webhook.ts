import 'server-only';

// Lead delivery → webhooks (Pabbly Connect, Google Apps Script, Zapier, anything that takes a
// JSON POST). This is how the old Stencil landing page reached monday.com: the page posted one
// flat JSON payload to a Pabbly workflow, and Pabbly mapped the keys onto board columns. Doing
// the same from the server keeps the URLs private and keeps the field mapping in Pabbly.
//
// Env: LEAD_WEBHOOK_URLS, comma-separated. Every URL gets the same payload; one failing does
// not stop the others.

export interface WebhookResult {
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
}

export function leadWebhookUrls(): string[] {
  return (process.env.LEAD_WEBHOOK_URLS ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter((u) => u.startsWith('https://'));
}

export async function postLeadWebhooks(payload: Record<string, string>): Promise<WebhookResult[]> {
  const urls = leadWebhookUrls();

  const results = await Promise.allSettled(urls.map((url) => postOne(url, payload)));

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          url: urls[i] ?? '',
          ok: false,
          error: r.reason instanceof Error ? r.reason.message : 'failed',
        },
  );
}

async function postOne(url: string, payload: Record<string, string>): Promise<WebhookResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
    redirect: 'follow',
  });

  return { url, ok: response.ok, status: response.status };
}
