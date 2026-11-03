# Storefront GraphQL API returns empty catalog on Catalyst channel 1908757

**Store hash:** dsdbflh9ev
**Channel:** 1908757 "EK Catalyst Live" (platform `catalyst`, type `storefront`, status `active`, created 28 Oct 2026)
**Category tree:** 3 "EK Catalyst Live", assigned to channel 1908757
**Date of capture:** 3 Nov 2026

> **RESOLVED 3 Nov 2026, no BigCommerce action needed.** Root cause: Control panel > Customers >
> Customer Groups > default **Guest** group > Category Access was set to specific categories and the
> newly created tree-3 categories were unchecked. Guest (anonymous) storefront tokens therefore got
> `null` for those categories and their products. Ticking the categories fixed it immediately.
> **Rule going forward: every new category created in tree 3 must be ticked in the guest group's
> Category Access.** The evidence below is kept for reference.

## Summary

The Management API shows category 799 and product 75049 correctly set up on channel 1908757,
but the channel's Storefront GraphQL API returns null or empty for `category`, `route`, `product`,
`products` and `searchProducts`. The `categoryTree(rootEntityId: 799)` resolver does see the
category with `productCount: 1`. The same storefront token works on channel 1, and an identical
setup on our sandbox store (4smdoosoqx, channel 1874778) works. BigCommerce's hosted storefront
for this channel (`https://store-dsdbflh9ev-1908757.catalyst-sandbox-vercel.store`) returns 404 on
`/`, `/testing/` and the product URL.

It looks like the channel's storefront catalog index was never built after the channel was created.
**Request:** trigger a catalog reindex / storefront sync for channel 1908757, or advise what is missing.

## Already ruled out

- Token: same token returns catalog data on the default channel host (section 3).
- Data: category visible, product visible and available, channel listing `active`, channel `active`,
  USD enabled and default on the channel (`GET /v3/channels/1908757/currency-assignments`), no price lists.
- Cache: unchanged for many hours, after re-saving the category and toggling channel status prelaunch -> active.
- Our code: BigCommerce's own hosted storefront for the channel 404s as well.

## 1. Management API (all return the expected data)

Headers on each call: `X-Auth-Token: <v3 API token>`, `Accept: application/json`

```
GET https://api.bigcommerce.com/stores/dsdbflh9ev/v3/catalog/trees
HTTP 200
```
```json
{"data":[
  {"id":1,"name":"Default catalog tree","channels":[1]},
  {"id":2,"name":"buykitchens","channels":[]},
  {"id":3,"name":"EK Catalyst Live","channels":[1908757]}
]}
```

```
GET https://api.bigcommerce.com/stores/dsdbflh9ev/v3/catalog/trees/3/categories
HTTP 200
```
```json
{"data":[{"id":799,"parent_id":0,"name":"Testing","is_visible":true,"depth":0,"path":[],"children":[],"url":"/testing/"}]}
```

```
GET https://api.bigcommerce.com/stores/dsdbflh9ev/v3/catalog/products/channel-assignments?product_id:in=75049
HTTP 200
```
```json
{"data":[
  {"channel_id":1,"product_id":75049},
  {"channel_id":1877828,"product_id":75049},
  {"channel_id":1879105,"product_id":75049},
  {"channel_id":1908757,"product_id":75049}
]}
```

```
GET https://api.bigcommerce.com/stores/dsdbflh9ev/v3/channels/1908757/listings
HTTP 200
```
```json
{"data":[{"channel_id":1908757,"listing_id":1337543416,"product_id":75049,"state":"active",
  "date_created":"2026-11-03T14:30:20Z",
  "variants":[{"channel_id":1908757,"product_id":75049,"variant_id":237533,"state":"active","date_created":"2026-11-03T14:30:20Z"}]}]}
```

## 2. Storefront GraphQL on the Catalyst channel host (the failing call)

Headers: `Authorization: Bearer <storefront API token>` (created via `POST /v3/storefront/api-token`
with `channel_ids: []`), `Content-Type: application/json`

```
POST https://store-dsdbflh9ev-1908757.mybigcommerce.com/graphql
```

Request body:

```json
{"query": "{ site { settings { channelId } categoryTree { entityId name } tree799: categoryTree(rootEntityId: 799) { entityId name path productCount } category(entityId: 799) { entityId name } route(path: \"/testing/\") { node { __typename } } product(entityId: 75049) { entityId name } products(first: 3) { edges { node { entityId } } } search { searchProducts(filters: { searchTerm: \"Crystal\" }) { products(first: 3) { edges { node { entityId } } } } } } }"}
```

Response, HTTP 200:

```json
{"data":{"site":{
  "settings":{"channelId":1908757},
  "categoryTree":[],
  "tree799":[{"entityId":799,"name":"Testing","path":"/testing/","productCount":1}],
  "category":null,
  "route":{"node":null},
  "product":null,
  "products":{"edges":[]},
  "search":{"searchProducts":{"products":{"edges":[]}}}
}}}
```

`tree799` sees category 799 with `productCount: 1`, yet `category(entityId: 799)`, `route`,
`product(entityId: 75049)`, `products` and `searchProducts` are all null or empty.

## 3. Control call: same token, same body, default channel host (works)

```
POST https://store-dsdbflh9ev.mybigcommerce.com/graphql
```

Response, HTTP 200 (category tree trimmed):

```json
{"data":{"site":{
  "settings":{"channelId":1},
  "categoryTree":[{"entityId":21,"name":"Cabinets"},{"entityId":42,"name":"Kitchen Countertops"},{"entityId":99,"name":"Bath"},{"entityId":20,"name":"Sinks"},{"entityId":19,"name":"Faucets"},{"entityId":138,"name":"Appliances"},{"entityId":673,"name":"Closet"},{"entityId":665,"name":"Doors"},{"entityId":266,"name":"Windows"}],
  "tree799":[],
  "category":null,
  "route":{"node":null},
  "product":{"entityId":75049,"name":"Crystal 1600 Series 59-½\" W x 79-½\" H White Vinyl  Sliding Patio Door Low-E Argon w/ Half Screen"},
  "products":{"edges":[{"node":{"entityId":187}},{"node":{"entityId":202}},{"node":{"entityId":203}}]},
  "search":{"searchProducts":{"products":{"edges":[{"node":{"entityId":26673}},{"node":{"entityId":26780}},{"node":{"entityId":11400}}]}}}
}}}
```

On channel 1, `category` and `route` are null only because 799 and `/testing/` belong to tree 3,
which is expected. `product`, `products` and `searchProducts` all resolve, so the token and the
product are fine. The failure is specific to channel 1908757.

## 4. BigCommerce-hosted storefront for the channel

```
GET https://store-dsdbflh9ev-1908757.catalyst-sandbox-vercel.store/            -> HTTP 404
GET https://store-dsdbflh9ev-1908757.catalyst-sandbox-vercel.store/testing/    -> HTTP 404
GET https://store-dsdbflh9ev-1908757.catalyst-sandbox-vercel.store/crystal-1600-series-59-w-x-79-h-white-vinyl-sliding-patio-door-low-e-argon-w-half-screen/ -> HTTP 404
```

The 404 pages are rendered by the Catalyst Next.js app, so the app is running and getting the same
empty API responses shown in section 2.
