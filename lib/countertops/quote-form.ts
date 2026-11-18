import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { heroImageFor } from '~/lib/category/category-content';
import { ZIP_MESSAGE, ZIP_PATTERN } from '~/lib/forms/fields';

// Countertops are quoted, not carted (they're cut to the kitchen). These pieces are shared by the
// countertop category pages, the countertop PDPs and the /countertops content page so the quote
// path reads the same everywhere.

/** In-page anchor of the quote form on the quote page. */
export const QUOTE_ANCHOR = 'request-a-quote';

/** The one countertop quote page; cards, PDPs and category bands all send shoppers here. */
export const QUOTE_PAGE_HREF = '/countertops/get-a-quote';

// The quote page with the stone being quoted carried in the URL (the form names it).
export function quotePageHref(product?: string): string {
  return product ? `${QUOTE_PAGE_HREF}?product=${encodeURIComponent(product)}` : QUOTE_PAGE_HREF;
}

export const COUNTERTOP_PHONE = { label: 'Call to submit request', href: 'tel:+18602471000' };

/** One photo for the quote card everywhere (listing, PDP): the countertops hero, not the swatch. */
export const COUNTERTOP_QUOTE_IMAGE = heroImageFor('/countertops');

/** The quote form, as rows: related fields share a line so the form stays short. */
export type QuoteFields = Array<Field | Field[]>;

export const COUNTERTOP_QUOTE_FIELDS: QuoteFields = [
  [
    { type: 'text', name: 'name', label: 'Your name', required: true },
    { type: 'email', name: 'email', label: 'Email', required: true },
  ],
  [
    { type: 'tel', name: 'phone', label: 'Phone', required: true },
    {
      type: 'text',
      name: 'zip',
      label: 'ZIP code',
      pattern: ZIP_PATTERN,
      patternMessage: ZIP_MESSAGE,
      required: true,
    },
  ],
  [
    {
      type: 'select',
      name: 'material',
      label: 'Material',
      options: [
        { label: 'Granite', value: 'granite' },
        { label: 'Quartz', value: 'quartz' },
        { label: 'Laminate', value: 'laminate' },
        { label: 'Prefabricated', value: 'prefab' },
        { label: 'Not sure yet', value: 'unsure' },
      ],
    },
    {
      type: 'text',
      name: 'sqft',
      label: 'Approx. square feet',
      pattern: String.raw`^\d{1,3}(,\d{3})*(\.\d+)?$|^\d+(\.\d+)?$`,
      patternMessage: 'Please enter square feet as a number, like 45',
    },
  ],
  {
    type: 'select',
    name: 'cutouts',
    label: 'Cut-outs',
    options: [
      { label: 'Sink', value: 'sink' },
      { label: 'Cooktop', value: 'hob' },
      { label: 'Sink and cooktop', value: 'both' },
      { label: 'None', value: 'none' },
    ],
  },
  { type: 'textarea', name: 'notes', label: 'Anything else: color, edge, timing' },
];

// The same form with the chosen stone carried along (PDP), so the quote names the product.
export function countertopQuoteFields(product?: string): QuoteFields {
  if (!product) return COUNTERTOP_QUOTE_FIELDS;

  return [{ type: 'hidden', name: 'product', defaultValue: product }, ...COUNTERTOP_QUOTE_FIELDS];
}
