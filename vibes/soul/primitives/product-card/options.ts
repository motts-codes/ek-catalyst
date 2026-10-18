// Server-safe helpers for the card's options CTA (the swatch picker itself is a client component).

export interface RequiredOption {
  id: number;
  name: string;
  /** Present when BigCommerce shows this option as colour/image swatches. */
  swatches?: Array<{
    id: number;
    label: string;
    color?: string;
    image?: string;
    isDefault: boolean;
  }>;
}

// Up to this many swatches fit on a card; beyond it the shopper chooses on the product page.
const MAX_CARD_SWATCHES = 4;

const SIZE_WORDS = /\b(width|height|size|length|depth)\b/i;

// "Choose size" / "Choose finish" / "Choose color": the CTA names the one thing the shopper has
// to pick, from the product's own required option names. Several options -> "Choose options".
export function optionsCtaLabel(options: RequiredOption[] | undefined): string {
  if (options == null || options.length === 0) return 'Choose options';

  const names = options.map((option) => option.name.trim());

  if (names.every((candidate) => SIZE_WORDS.test(candidate))) return 'Choose size';

  const only = names.length === 1 ? names[0] : undefined;

  if (only == null) return 'Choose options';
  if (/colou?r/i.test(only)) return 'Choose color';
  if (/finish/i.test(only)) return 'Choose finish';

  return only.length <= 14 ? `Choose ${only.toLowerCase()}` : 'Choose options';
}

// A single small swatch option can be chosen on the card itself: the swatches sit above
// "Add to Cart", the first (or default) one preselected, so a colour pick is one click and the
// add is the next, with no product page in between.
export function cardSwatchOption(options: RequiredOption[] | undefined): RequiredOption | null {
  if (options?.length !== 1) return null;

  const [option] = options;
  const count = option?.swatches?.length ?? 0;

  return option != null && count >= 2 && count <= MAX_CARD_SWATCHES ? option : null;
}
