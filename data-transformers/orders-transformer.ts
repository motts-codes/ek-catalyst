import { getFormatter, getTranslations } from 'next-intl/server';

import { Order } from '@/vibes/soul/sections/order-list';
import { getCustomerOrders } from '~/app/[locale]/(default)/account/orders/page-data';
import { ExistingResultType } from '~/client/util';
import { orderProgress } from '~/lib/orders/progress';

export const ordersTransformer = (
  orders: ExistingResultType<typeof getCustomerOrders>['orders'],
  format: ExistingResultType<typeof getFormatter>,
  tGiftCertificate: ExistingResultType<typeof getTranslations<'Cart.GiftCertificate'>>,
  tProgress: ExistingResultType<typeof getTranslations<'Account.Orders.Progress'>>,
  tOrders?: ExistingResultType<typeof getTranslations<'Account.Orders'>>,
): Order[] => {
  return orders.map((order) => {
    const lineItems =
      order.consignments.shipping?.flatMap((consignment) => {
        return consignment.lineItems.map((lineItem) => {
          const price = lineItem.catalogProductWithOptionSelections?.prices?.price
            ? format.number(lineItem.catalogProductWithOptionSelections.prices.price.value, {
                style: 'currency',
                currency: lineItem.catalogProductWithOptionSelections.prices.price.currencyCode,
              })
            : format.number(lineItem.subTotalListPrice.value / lineItem.quantity, {
                style: 'currency',
                currency: lineItem.subTotalListPrice.currencyCode,
              });

          return {
            id: lineItem.entityId.toString(),
            href: lineItem.baseCatalogProduct?.path ?? '#',
            title: lineItem.name,
            // Same line the cart shows under a product: chosen options, then the brand.
            subtitle:
              [
                ...lineItem.productOptions.map((option) => `${option.name}: ${option.value}`),
                lineItem.brand ? `Brand: ${lineItem.brand}` : '',
              ]
                .filter(Boolean)
                .join(', ') || undefined,
            quantity: lineItem.quantity,
            price,
            totalPrice: format.number(lineItem.subTotalListPrice.value, {
              style: 'currency',
              currency: lineItem.subTotalListPrice.currencyCode,
            }),
            image: lineItem.image
              ? {
                  src: lineItem.image.url,
                  alt: lineItem.image.altText,
                }
              : undefined,
          };
        });
      }) ?? [];

    const giftCertificates =
      order.consignments.email?.flatMap((consignment) => {
        return consignment.lineItems.map((lineItem) => {
          const formattedAmount = format.number(lineItem.salePrice.value, {
            style: 'currency',
            currency: lineItem.salePrice.currencyCode,
          });

          return {
            id: lineItem.entityId.toString(),
            href: '#',
            title: tGiftCertificate('giftCertificate'),
            quantity: 1,
            price: formattedAmount,
            totalPrice: formattedAmount,
            image: undefined,
          };
        });
      }) ?? [];

    const allItems = [...lineItems, ...giftCertificates];
    const count = allItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: order.entityId.toString(),
      href: `/account/orders/${order.entityId}`,
      date: format.dateTime(new Date(order.orderedAt.utc), { dateStyle: 'medium' }),
      itemsSummary: tOrders?.('itemsCount', { count }),
      status: order.status.label,
      progress: orderProgress(order.status.value, tProgress),
      totalPrice: format.number(order.totalIncTax.value, {
        style: 'currency',
        currency: order.totalIncTax.currencyCode,
      }),
      lineItems: allItems,
    } satisfies Order;
  });
};
