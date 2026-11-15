import type { OrderProgressStep } from '@/vibes/soul/primitives/order-progress';

type Labels = (key: 'placed' | 'processing' | 'shipped' | 'readyForPickup' | 'completed') => string;

export interface OrderProgress {
  steps: OrderProgressStep[];
  /** Index of the step the order is on; everything before it is done. */
  current: number;
}

// Where a BigCommerce order status sits on the four-step track the customer sees:
// placed → processing → shipped (or ready for pickup) → completed. Statuses that leave the
// track (cancelled, declined, refunded, disputed) return nothing; the status badge says it.
const STAGE: Record<string, { current: number; pickup?: boolean } | undefined> = {
  PENDING: { current: 0 },
  AWAITING_PAYMENT: { current: 0 },
  INCOMPLETE: { current: 0 },
  MANUAL_VERIFICATION_REQUIRED: { current: 0 },
  AWAITING_FULFILLMENT: { current: 1 },
  AWAITING_SHIPMENT: { current: 1 },
  PARTIALLY_SHIPPED: { current: 2 },
  SHIPPED: { current: 2 },
  AWAITING_PICKUP: { current: 2, pickup: true },
  COMPLETED: { current: 3 },
};

export function orderProgress(status: string | null, t: Labels): OrderProgress | undefined {
  const stage = status ? STAGE[status] : undefined;

  if (!stage) return undefined;

  return {
    current: stage.current,
    steps: [
      { label: t('placed'), icon: 'placed' },
      { label: t('processing'), icon: 'processing' },
      stage.pickup
        ? { label: t('readyForPickup'), icon: 'pickup' }
        : { label: t('shipped'), icon: 'shipped' },
      { label: t('completed'), icon: 'completed' },
    ],
  };
}
