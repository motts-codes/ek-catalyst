import type { OrderStatusTone } from '@/vibes/soul/primitives/order-status-pill';

// Which brand hue a BigCommerce order status wears on its pill:
//   cream  — received, being prepared (pending, awaiting fulfillment/shipment, under review)
//   blue   — on the move or ready to collect (shipped, partially shipped, awaiting pickup)
//   green  — completed
//   red    — needs attention or stopped (awaiting payment, incomplete, disputed, cancelled, declined)
//   grey   — closed out with money back (refunded, partially refunded)
const TONE: Record<string, OrderStatusTone | undefined> = {
  PENDING: 'cream',
  AWAITING_FULFILLMENT: 'cream',
  AWAITING_SHIPMENT: 'cream',
  MANUAL_VERIFICATION_REQUIRED: 'cream',
  SHIPPED: 'blue',
  PARTIALLY_SHIPPED: 'blue',
  AWAITING_PICKUP: 'blue',
  COMPLETED: 'green',
  AWAITING_PAYMENT: 'red',
  INCOMPLETE: 'red',
  DISPUTED: 'red',
  CANCELLED: 'red',
  DECLINED: 'red',
  REFUNDED: 'grey',
  PARTIALLY_REFUNDED: 'grey',
};

export function orderStatusTone(status: string | null): OrderStatusTone {
  return (status ? TONE[status] : undefined) ?? 'grey';
}
