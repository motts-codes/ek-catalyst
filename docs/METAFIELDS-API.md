# Metafields: how they are written and read

How the Express Kitchens Catalyst storefront stores and reads BigCommerce metafields.
For the list of every namespace and key the cabinet feature uses, see
[CABINET-METAFIELDS.md](CABINET-METAFIELDS.md). This page is about the mechanics.

## Two APIs, one rule

| Direction | API | Where in code |
|---|---|---|
| **Create / update / delete** | BigCommerce **Management API (REST v3)**, `X-Auth-Token` | [lib/cabinet-admin/metafields-api.ts](../lib/cabinet-admin/metafields-api.ts), the Python seed scripts under `scripts/` |
| **Read on the storefront** | BigCommerce **Storefront GraphQL API** | Any `page-data.ts` or `lib/**` read module, through the shared client in [client/](../client/) |

There is no GraphQL mutation in this codebase for metafields. The Storefront GraphQL API is
read-only for them; writes go through REST.

**The one rule:** every metafield must be created with
`permission_set: "write_and_sf_access"`. Without it the Storefront GraphQL API cannot see the
field and the query silently returns no edges. This is the most common reason a metafield
"doesn't show up".

Values are strings. The storefront stores JSON in them (`JSON.stringify` on write,
`JSON.parse` on read) except the rich-text `content.*` fields, which hold raw HTML.

---

## Writing (REST v3)

### Endpoints

```
GET    /stores/{store_hash}/v3/catalog/categories/{category_id}/metafields?limit=250
POST   /stores/{store_hash}/v3/catalog/categories/{category_id}/metafields
PUT    /stores/{store_hash}/v3/catalog/categories/{category_id}/metafields/{metafield_id}
DELETE /stores/{store_hash}/v3/catalog/categories/{category_id}/metafields/{metafield_id}
```

Replace `categories` with `products` for product metafields. The token needs the
**Products: modify** scope (the `CATALYST_ACCESS_TOKEN` in `.env.local` has it).

### Create

```bash
curl -X POST "https://api.bigcommerce.com/stores/$BIGCOMMERCE_STORE_HASH/v3/catalog/categories/864/metafields" \
  -H "X-Auth-Token: $CATALYST_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "faq",
    "key": "by_program",
    "value": "{\"assembled\":{\"headline\":\"Questions about assembled cabinets\",\"items\":[{\"q\":\"Do they arrive built?\",\"a\":\"Yes.\"}]},\"rta\":{\"headline\":\"\",\"items\":[]}}",
    "permission_set": "write_and_sf_access",
    "description": "Per-collection FAQ split by program"
  }'
```

BigCommerce returns the new metafield with its `id`. `namespace` + `key` must be unique per
entity; a second POST with the same pair fails with 409, which is why the code upserts.

### Update

Only `value` (and optionally `permission_set` / `description`) go in the body. `namespace` and
`key` cannot change on PUT.

```bash
curl -X PUT "https://api.bigcommerce.com/stores/$BIGCOMMERCE_STORE_HASH/v3/catalog/categories/864/metafields/123456" \
  -H "X-Auth-Token: $CATALYST_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "value": "{\"assembled\":{...}}", "permission_set": "write_and_sf_access" }'
```

### Delete

```bash
curl -X DELETE "https://api.bigcommerce.com/stores/$BIGCOMMERCE_STORE_HASH/v3/catalog/categories/864/metafields/123456" \
  -H "X-Auth-Token: $CATALYST_ACCESS_TOKEN"
```

BigCommerce rejects an empty `value` with 422, so "clearing" a field means deleting it.

### The upsert helper the admin panel uses

This is the server-only wrapper behind `/cabinet-admin`. The token never reaches the browser.

```ts
// lib/cabinet-admin/metafields-api.ts (abridged)
import 'server-only';

const BASE = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3`;

type Entity = 'categories' | 'products';

async function apiFetch(method: string, path: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'X-Auth-Token': process.env.CATALYST_ACCESS_TOKEN!,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`BC API ${method} ${path} -> ${res.status}: ${await res.text()}`);

  const text = await res.text();

  return text ? JSON.parse(text) : {}; // DELETE returns 204 with no body
}

export async function listMetafields(entity: Entity, entityId: number) {
  const data = await apiFetch('GET', `/catalog/${entity}/${entityId}/metafields?limit=250`);

  return data.data ?? [];
}

/** Update in place if (namespace, key) exists, otherwise create. Empty value = delete. */
export async function upsertMetafield(
  entity: Entity,
  entityId: number,
  namespace: string,
  key: string,
  value: string,
) {
  const existing = (await listMetafields(entity, entityId)).find(
    (m) => m.namespace === namespace && m.key === key,
  );

  if (value.trim() === '') {
    if (existing) await apiFetch('DELETE', `/catalog/${entity}/${entityId}/metafields/${existing.id}`);

    return;
  }

  const body = { namespace, key, value, permission_set: 'write_and_sf_access' };

  if (existing) {
    await apiFetch('PUT', `/catalog/${entity}/${entityId}/metafields/${existing.id}`, body);
  } else {
    await apiFetch('POST', `/catalog/${entity}/${entityId}/metafields`, body);
  }
}
```

The Python seed and import scripts (`scripts/seed-cabinet-metafields.py`,
`scripts/live/import-category-metafields.py`) do exactly the same thing: list, match on
namespace + key, PUT or POST, always with `write_and_sf_access`.

---

## Reading (Storefront GraphQL)

### The query shape

Both `category` and `product` expose a `metafields` connection. It takes `namespace`
(required) and an optional `keys` list.

```graphql
query CabinetCollectionQuery($entityId: Int!) {
  site {
    category(entityId: $entityId) {
      name
      # One alias per namespace, each returns every key in it.
      pricing: metafields(namespace: "pricing_10x10") {
        edges { node { key value } }
      }
      merch: metafields(namespace: "merch") {
        edges { node { key value } }
      }
      faq: metafields(namespace: "faq") {
        edges { node { key value } }
      }
      content: metafields(namespace: "content") {
        edges { node { key value } }
      }
    }
  }
}
```

Aliases (`pricing:`, `merch:` …) let one request pull several namespaces. Without an alias the
second `metafields` selection would clash with the first.

When you only want one key, pass `keys` and `first: 1`. This is the product page's pattern:

```graphql
query ProductPageQuery($entityId: Int!) {
  site {
    product(entityId: $entityId) {
      # Features grid (headline + description + feature cells), one JSON metafield.
      featuresMetafield: metafields(namespace: "features", keys: ["grid"], first: 1) {
        edges { node { value } }
      }
      # FAQ (headline + Q/A items), one JSON metafield.
      faqMetafield: metafields(namespace: "faq", keys: ["list"], first: 1) {
        edges { node { value } }
      }
      productInfoFeaturesMetafield: metafields(
        namespace: "product_info"
        keys: ["features"]
        first: 1
      ) {
        edges { node { value } }
      }
    }
  }
}
```

Category pages read `faq` and `seo` the same way (see
[app/[locale]/(default)/(faceted)/category/[slug]/page-data.ts](../app/%5Blocale%5D/(default)/(faceted)/category/%5Bslug%5D/page-data.ts)).

### Running it through the Catalyst client

Queries are written with the `graphql()` tag so gql.tada types the result, then sent with the
shared client. Never hand-roll a fetch to the GraphQL endpoint.

```ts
// lib/inspiration/kitchen-gallery-read.ts (the smallest real example)
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BestSellersGalleryQuery = graphql(`
  query BestSellersGalleryQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        gallery: metafields(namespace: "gallery") {
          edges {
            node {
              key
              value
            }
          }
        }
      }
    }
  }
`);

export const getBestSellersGallery = cache(async () => {
  const { data } = await client.fetch({
    document: BestSellersGalleryQuery,
    variables: { entityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });

  const raw = data.site.category?.gallery.edges?.find((e) => e.node.key === 'best_sellers')
    ?.node.value;

  return raw ? normalizeGalleryConfig(raw) : null;
});
```

Notes on that pattern:

- `cache()` memoises per request, so several components can call the reader without a second
  round trip.
- `fetchOptions: { next: { revalidate } }` uses the app's standard ISR window. Pass
  `{ cache: 'no-store' }` instead when the request carries a customer token.
- The value is a string. Parse it (`JSON.parse`) and validate the shape; the `lib/cabinet-admin/*-shape.ts`
  modules hold the zod schemas for each field so reads and the admin editor agree.
- After adding a new query, run `pnpm run generate` so the GraphQL types pick it up.

### Testing a query by hand

The app proxies `/graphql` to the Storefront API for the checkout SDK, and it only answers
requests that carry that SDK's requester header. From a running dev server:

```bash
curl -s http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "x-catalyst-graphql-proxy-requester: checkout-sdk-js" \
  -d '{"query":"{ site { category(entityId: 804) { name faq: metafields(namespace: \"faq\") { edges { node { key value } } } } } }"}' | jq .
```

An empty `edges` array for a field you know exists almost always means it was created without
`write_and_sf_access`. Fix it with a PUT that sets the permission set; no need to recreate.

---

## Gotchas collected so far

- **Permission set is per metafield**, not per namespace. One field written by hand in the
  control panel without it will be invisible while its neighbours work.
- **Storefront GraphQL caches** for about 10 minutes behind the BigCommerce CDN. A value you just
  wrote may take that long to appear on the storefront even with revalidation set low.
- **Category ids differ per tree.** Sandbox 863/864 became live tree-3 ids; code reads the parent
  from `CABINETS_CATEGORY_ID` / `CABINETS_PARENT_CATEGORY_ID`, never a literal.
- **Product metafields follow the product, not the channel.** A product metafield written once is
  visible on every channel the product is assigned to.
- **Limit 250 per page** on the list endpoint; the Python scripts page, the TS helper assumes one
  entity never holds more than 250 fields (true today, max is about 20).
