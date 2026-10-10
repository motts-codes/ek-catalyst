// Helpers for the code-built shop landings (Bath, Sinks & faucets, Cabinet hardware): subcategory
// tiles reuse the mega-menu photos and link to search until each subcategory exists in
// BigCommerce, so every tile already goes somewhere useful.
export const searchHref = (term: string) => `/search?term=${encodeURIComponent(term)}`;

export const tileImage = (file: string, alt: string) => ({ src: `/images/nav/${file}.webp`, alt });
