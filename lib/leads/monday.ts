import 'server-only';

import { z } from 'zod';

// Lead delivery → monday.com CRM. Active when MONDAY_API_TOKEN and MONDAY_BOARD_ID are set.
//
// Every valid lead becomes one item on the board. The item name is "<Form> · <Name>" and the
// full submission is posted as the item's first update (the comment thread), so leads arrive
// readably even before any column mapping exists. MONDAY_COLUMN_MAP, a JSON object of
// { "<form field name>": "<monday column id>" }, additionally fills typed columns: email and
// phone columns get the right shape, "message" goes to long text, everything else to text. Two
// special keys: "form" (the form's short name, e.g. "contact") and "source" (always "website").
//
// Env: MONDAY_API_TOKEN, MONDAY_BOARD_ID (required); MONDAY_GROUP_ID, MONDAY_COLUMN_MAP (optional).

const API = 'https://api.monday.com/v2';
const API_VERSION = '2024-10';

const CREATE_ITEM = `
  mutation ($board: ID!, $group: String, $name: String!, $cols: JSON) {
    create_item(board_id: $board, group_id: $group, item_name: $name, column_values: $cols) { id }
  }
`;

const CREATE_UPDATE = `
  mutation ($item: ID!, $body: String!) {
    create_update(item_id: $item, body: $body) { id }
  }
`;

const FORM_LABELS: Record<string, string> = {
  contact: 'Contact',
  'free-design': 'Free design consult',
  booking: 'Book',
  quote: 'Quote request',
  industry: 'Commercial / multifamily',
  'pro-program': 'Pro Program',
  'refer-a-friend': 'Referral',
  support: 'Support',
  'return-authorization': 'Return',
  'price-match': 'Price match',
  estimate: 'Kitchen estimate',
};

const columnMapSchema = z.record(z.string());
const responseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string().optional() })).optional(),
  error_message: z.string().optional(),
});
const createItemSchema = z.object({ create_item: z.object({ id: z.string() }).nullable() });

export type MondayResult = { ok: true; itemId: string } | { ok: false; error: string };

type GqlResult = { ok: true; data: unknown } | { ok: false; error: string };

export function isMondayConfigured(): boolean {
  return Boolean(process.env.MONDAY_API_TOKEN && process.env.MONDAY_BOARD_ID);
}

interface LeadPayload {
  form: string;
  values: Record<string, unknown>;
}

export async function createMondayLead({ form, values }: LeadPayload): Promise<MondayResult> {
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID;

  if (!token || !boardId) {
    return { ok: false, error: 'monday.com not configured' };
  }

  const created = await gql(token, CREATE_ITEM, {
    board: boardId,
    group: process.env.MONDAY_GROUP_ID ?? null,
    name: itemName(form, values),
    cols: JSON.stringify(buildColumnValues(form, values)),
  });

  if (!created.ok) {
    return created;
  }

  const parsed = createItemSchema.safeParse(created.data);
  const itemId = parsed.success ? parsed.data.create_item?.id : undefined;

  if (!itemId) {
    return { ok: false, error: 'create_item returned no id' };
  }

  // The full submission as the first update, so nothing is lost if a field has no column.
  const update = await gql(token, CREATE_UPDATE, { item: itemId, body: updateBody(form, values) });

  if (!update.ok) {
    // Item exists; the column values (if mapped) carry the essentials. Log and move on.
    // eslint-disable-next-line no-console
    console.error('[lead] monday.com update failed for item', itemId, update.error);
  }

  return { ok: true, itemId };
}

function asText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(asText).join(', ');
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return value == null ? '' : JSON.stringify(value);
}

function itemName(form: string, values: Record<string, unknown>): string {
  const label = FORM_LABELS[form] ?? form;
  const person = [values.firstName, values.lastName]
    .map(asText)
    .filter((v) => v.trim() !== '')
    .join(' ');
  const fallback = asText(values.email);

  return `${label} · ${person || fallback || 'Website lead'}`.slice(0, 255);
}

function columnMap(): Record<string, string> {
  const raw = process.env.MONDAY_COLUMN_MAP;

  if (!raw) {
    return {};
  }

  try {
    const parsed = columnMapSchema.safeParse(JSON.parse(raw));

    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // fall through
  }

  // eslint-disable-next-line no-console
  console.error(
    '[lead] MONDAY_COLUMN_MAP is not a JSON object of strings; sending the update only',
  );

  return {};
}

function fieldValue(field: string, form: string, values: Record<string, unknown>): string {
  if (field === 'form') {
    return FORM_LABELS[form] ?? form;
  }

  if (field === 'source') {
    return 'website';
  }

  return asText(values[field]);
}

function columnValue(field: string, text: string): unknown {
  if (field === 'email') {
    return { email: text, text };
  }

  if (field === 'phone') {
    return { phone: text.replace(/\D+/g, ''), countryShortName: 'US' };
  }

  if (field === 'message') {
    return { text };
  }

  return text;
}

function buildColumnValues(form: string, values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(columnMap())
      .map(([field, columnId]) => [field, columnId, fieldValue(field, form, values)] as const)
      .filter(([, , text]) => text !== '')
      .map(([field, columnId, text]) => [columnId, columnValue(field, text)]),
  );
}

function updateBody(form: string, values: Record<string, unknown>): string {
  const lines = Object.entries(values)
    .map(([key, value]) => [key, asText(value)] as const)
    .filter(([, text]) => text !== '')
    .map(([key, text]) => `<b>${escapeHtml(key)}</b>: ${escapeHtml(text)}`);

  return [`<b>Form</b>: ${escapeHtml(FORM_LABELS[form] ?? form)} (website)`, ...lines].join('<br>');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function gql(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<GqlResult> {
  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        'API-Version': API_VERSION,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });

    const parsed = responseSchema.safeParse(await response.json().catch(() => null));
    const body = parsed.success ? parsed.data : {};
    const apiError = body.errors?.map((e) => e.message ?? 'error').join('; ') ?? body.error_message;

    if (!response.ok || apiError) {
      return { ok: false, error: apiError ?? `HTTP ${response.status}` };
    }

    if (body.data === undefined) {
      return { ok: false, error: 'empty response' };
    }

    return { ok: true, data: body.data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
