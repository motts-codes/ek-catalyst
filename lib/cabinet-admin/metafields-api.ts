import 'server-only';

import { CABINETS_PARENT_CATEGORY_ID } from './collection-shape-const';

// Server-side BigCommerce Management API wrapper for cabinet metafields. Uses CATALYST_ACCESS_TOKEN
// (management scope) — this module is server-only and the token never reaches the browser. All
// admin reads/writes go through here.

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_ACCESS_TOKEN;
const BASE = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3`;

function headers() {
  if (!TOKEN) throw new Error('CATALYST_ACCESS_TOKEN is not set');

  return {
    'X-Auth-Token': TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export interface Metafield {
  id: number;
  namespace: string;
  key: string;
  value: string;
}

type Entity = 'categories' | 'products';

async function apiFetch(method: string, path: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();

    throw new Error(`BC API ${method} ${path} -> ${res.status}: ${detail.slice(0, 300)}`);
  }

  // DELETE returns 204/no body.
  const text = await res.text();

  return text ? JSON.parse(text) : {};
}

/** All metafields on an entity (category or product). */
export async function listMetafields(entity: Entity, entityId: number): Promise<Metafield[]> {
  const data = await apiFetch('GET', `/catalog/${entity}/${entityId}/metafields?limit=250`);

  return (data.data ?? []) as Metafield[];
}

/**
 * Upsert a metafield: update in place if (namespace,key) exists, otherwise create. Writes with the
 * write_and_sf_access permission set so the storefront GraphQL can read it (matches the pilot seed).
 */
export async function upsertMetafield(
  entity: Entity,
  entityId: number,
  namespace: string,
  key: string,
  value: string,
): Promise<void> {
  const existing = (await listMetafields(entity, entityId)).find(
    (m) => m.namespace === namespace && m.key === key,
  );

  // BigCommerce rejects an empty value (422), so clearing a field removes its metafield instead.
  if (value.trim() === '') {
    if (existing) {
      await apiFetch('DELETE', `/catalog/${entity}/${entityId}/metafields/${existing.id}`);
    }

    return;
  }

  const body = { namespace, key, value, permission_set: 'write_and_sf_access' };

  if (existing) {
    await apiFetch('PUT', `/catalog/${entity}/${entityId}/metafields/${existing.id}`, body);
  } else {
    await apiFetch('POST', `/catalog/${entity}/${entityId}/metafields`, body);
  }
}

/**
 * The cabinet collections (children of the Cabinets parent) with id + name. Filtered server-side
 * by parent so it works on any store size: the live store has 300+ categories across its trees,
 * more than one page.
 */
export async function listCabinetCollections(): Promise<Array<{ id: number; name: string }>> {
  const data = await apiFetch(
    'GET',
    `/catalog/trees/categories?parent_id:in=${CABINETS_PARENT_CATEGORY_ID}&limit=250`,
  );
  const cats = (data.data ?? []) as Array<{ category_id: number; name: string; parent_id: number }>;

  return cats
    .filter((c) => c.parent_id === CABINETS_PARENT_CATEGORY_ID)
    .map((c) => ({ id: c.category_id, name: c.name }));
}
