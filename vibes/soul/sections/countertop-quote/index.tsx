import { type DynamicFormAction } from '@/vibes/soul/form/dynamic-form';
import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { FormCard } from '@/vibes/soul/sections/page-kit';

interface Props<F extends Field> {
  /** Anchor id the "Request a quote" buttons jump to. */
  id: string;
  action: DynamicFormAction<F>;
  fields: F[];
  /** The stone being quoted (PDP); names it in the heading. */
  product?: string;
}

// The countertop quote form band: tinted, red-edged form card, below the listing or the PDP.
export function CountertopQuote<F extends Field>({ id, action, fields, product }: Props<F>) {
  return (
    <HomeSection
      description={
        product
          ? `Tell us roughly how much ${product} you need and we'll price it, usually the same day. A rough number is fine: we measure before we cut, so nothing is final until it's exact.`
          : "Tell us your counters and we'll price them, usually the same day. A rough number is fine: we measure before we cut, so nothing is final until it's exact."
      }
      id={id}
      kicker="Get a countertop quote"
      tint
      title={product ? `Request a quote for ${product}` : 'Request your quote'}
    >
      <FormCard>
        <DynamicFormSection action={action} fields={fields} submitLabel="Request my quote" />
      </FormCard>
    </HomeSection>
  );
}
