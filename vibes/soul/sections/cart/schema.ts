import { z } from 'zod';

export const cartLineItemActionFormDataSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('increment'),
    id: z.string(),
  }),
  z.object({
    intent: z.literal('decrement'),
    id: z.string(),
  }),
  z.object({
    intent: z.literal('delete'),
    id: z.string(),
  }),
  // The counter sends the quantity it has settled on (a burst of clicks, or a typed number) as
  // one update rather than one request per click.
  z.object({
    intent: z.literal('set'),
    id: z.string(),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  }),
]);

export const couponCodeActionFormDataSchema = ({
  required_error = 'Please enter a valid promo code',
}: {
  required_error?: string;
}) =>
  z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('apply'),
      couponCode: z.string({ required_error }),
    }),
    z.object({
      intent: z.literal('delete'),
      couponCode: z.string(),
    }),
  ]);

export const giftCertificateCodeActionFormDataSchema = ({
  required_error = 'Please enter a valid gift certificate code',
}: {
  required_error?: string;
}) =>
  z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('apply'),
      giftCertificateCode: z.string({ required_error }),
    }),
    z.object({
      intent: z.literal('delete'),
      giftCertificateCode: z.string(),
    }),
  ]);

// EK ships within the US only: the country is fixed and a ZIP is all the estimate asks for. Town
// and state are filled in server-side from the ZIP when they can be.
export const shippingActionFormDataSchema = ({
  required_error = 'Enter a 5-digit ZIP code',
}: {
  required_error?: string;
}) =>
  z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('add-address'),
      country: z.string().default('US'),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z
        .string({ required_error })
        .trim()
        .regex(/^\d{5}$/, { message: required_error }),
    }),
    z.object({
      intent: z.literal('add-shipping'),
      shippingOption: z.string(),
    }),
  ]);
