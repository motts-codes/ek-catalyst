import { type DynamicFormAction } from '@/vibes/soul/form/dynamic-form';
import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';

interface Props<F extends Field> {
  /** Anchor id the "Request a quote" buttons jump to. */
  id: string;
  action: DynamicFormAction<F>;
  /** Fields, or rows of fields rendered side by side. */
  fields: Array<F | F[]>;
  /** The stone being quoted (PDP); names it in the heading. */
  product?: string;
  /** Photo for the left column (the product on a PDP, the category hero on a listing). */
  image?: { src: string; alt: string };
}

// The countertop quote form: the customer-form card with countertop copy.
export function CountertopQuote<F extends Field>({ id, action, fields, product, image }: Props<F>) {
  return (
    <LeadFormCard
      action={action}
      description="A rough number is fine: we measure before we cut."
      fields={fields}
      id={id}
      image={image}
      kicker="Get a countertop quote"
      submitLabel="Request my quote"
      title={product ? `Request a quote for ${product}` : 'Request your quote'}
    />
  );
}
