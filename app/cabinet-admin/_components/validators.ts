// Field validators for the admin editors. All are **empty-allowed** (an empty value is the "unset"
// signal and the write layer drops empties) — they only reject a NON-empty value that is malformed
// in a way that would corrupt what the storefront reads. Each returns an error string or null.
//
// The save-block is derived by running these over the editor's STATE object (see collectErrors
// helpers per editor), NOT per-input — so a critical field rendered inside a custom sub-component
// can't slip past validation.

/** Bare price number: digits with an optional 2-decimal part. The storefront prepends "$", so a
 *  leading "$" or letters would render "$$4999" / "$abc". Empty allowed. */
export function validatePrice(value: string): string | null {
  if (value.trim() === '') return null;

  return /^\d+(\.\d{1,2})?$/.test(value.trim())
    ? null
    : 'Enter a number, e.g. 4999 or 49.99 (no $).';
}

/** Positive integer — a BigCommerce product id. Empty allowed. */
export function validateProductId(value: string): string | null {
  if (value.trim() === '') return null;

  return /^\d+$/.test(value.trim()) ? null : 'Enter a numeric product ID.';
}

/** http(s) URL shape (not semantics). Empty allowed. */
export function validateUrl(value: string): string | null {
  if (value.trim() === '') return null;

  try {
    const u = new URL(value.trim());

    return u.protocol === 'http:' || u.protocol === 'https:'
      ? null
      : 'Use an http:// or https:// URL.';
  } catch {
    return 'Enter a valid URL.';
  }
}

/** Hex color with a leading # (#RGB or #RRGGBB) — the storefront assigns it to backgroundColor.
 *  Empty allowed. */
export function validateHex(value: string): string | null {
  if (value.trim() === '') return null;

  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
    ? null
    : 'Enter a hex color, e.g. #E3D9C6.';
}
