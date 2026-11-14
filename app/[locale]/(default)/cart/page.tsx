import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { Price } from '@/vibes/soul/primitives/price-label';
import { Cart as CartComponent, CartEmptyState } from '@/vibes/soul/sections/cart';
import { CartAnalyticsProvider } from '~/app/[locale]/(default)/cart/_components/cart-analytics-provider';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getCartId } from '~/lib/cart';
import { describeShippingOption } from '~/lib/cart/shipping-option-label';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getDeliveryZip } from '~/lib/delivery/zip';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { Slot } from '~/lib/makeswift/slot';
import { exists } from '~/lib/utils';

import { restoreLineItem } from './_actions/restore-line-item';
import { updateCouponCode } from './_actions/update-coupon-code';
import { updateGiftCertificate } from './_actions/update-gift-certificate';
import { updateLineItem } from './_actions/update-line-item';
import { updateShippingInfo } from './_actions/update-shipping-info';
import { CartViewed } from './_components/cart-viewed';
import { CheckoutPreconnect } from './_components/checkout-preconnect';
import { ShippingAutoEstimate } from './_components/shipping-auto-estimate';
import { getCart } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

const CHECKOUT_URL = process.env.TRAILING_SLASH !== 'false' ? '/checkout/' : '/checkout';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Cart' });
  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: '/cart', locale });

  return {
    title: makeswiftMetadata?.title || t('title'),
    description: makeswiftMetadata?.description || undefined,
  };
}

const getAnalyticsData = async (cartId: string) => {
  const data = await getCart({ cartId });

  const cart = data.site.cart;

  if (!cart) {
    return [];
  }

  const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems].filter(
    (item) => !item.parentEntityId, // Only include top-level items
  );

  return lineItems.map((item) => {
    return {
      entityId: item.entityId,
      id: item.productEntityId,
      name: item.name,
      brand: item.brand ?? '',
      sku: item.sku ?? '',
      price: item.listPrice.value,
      quantity: item.quantity,
      currency: item.listPrice.currencyCode,
    };
  });
};

// eslint-disable-next-line complexity
export default async function Cart({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Cart');
  const tGiftCertificates = await getTranslations('GiftCertificates');
  const format = await getFormatter();
  const cartId = await getCartId();

  const emptyState = (
    <>
      <Slot label="Cart top content" snapshotId="cart-top-content" />
      <CartEmptyState
        cta={{ label: t('Empty.cta'), href: '/shop-all' }}
        subtitle={t('Empty.subtitle')}
        title={t('Empty.title')}
      />
      <Slot label="Cart bottom content" snapshotId="cart-bottom-content" />
    </>
  );

  if (!cartId) {
    return emptyState;
  }

  const currencyCode = await getPreferredCurrencyCode();
  const data = await getCart({ cartId, currencyCode });

  const cart = data.site.cart;
  const checkout = data.site.checkout;
  const giftCertificatesEnabled = data.site.settings?.giftCertificates?.isEnabled ?? false;

  if (!cart) {
    return emptyState;
  }

  const taxIncluded = cart.isTaxIncluded;

  const lineItems = [
    ...cart.lineItems.giftCertificates,
    ...cart.lineItems.physicalItems,
    ...cart.lineItems.digitalItems,
  ].filter((item) => !('parentEntityId' in item) || !item.parentEntityId);

  const formattedLineItems = lineItems.map((item) => {
    if (item.__typename === 'CartGiftCertificate') {
      return {
        typename: item.__typename,
        id: item.entityId,
        title: t('GiftCertificate.giftCertificate'),
        subtitle: `${t('GiftCertificate.to')}: ${item.recipient.name} (${item.recipient.email})${item.message ? `, ${t('GiftCertificate.message')}: ${item.message}` : ''}`,
        quantity: 1,
        price: format.number(item.amount.value, {
          style: 'currency',
          currency: item.amount.currencyCode,
        }),
        sender: item.sender,
        recipient: item.recipient,
        message: item.message,
        href: undefined,
        selectedOptions: [],
        productEntityId: 0,
        variantEntityId: 0,
      };
    }

    let inventoryMessages;

    if (item.__typename === 'CartPhysicalItem') {
      if (item.stockPosition?.quantityOutOfStock === item.quantity) {
        inventoryMessages = {
          outOfStockMessage: data.site.settings?.inventory?.showOutOfStockMessage
            ? data.site.settings.inventory.defaultOutOfStockMessage
            : undefined,
        };
      } else {
        inventoryMessages = {
          quantityReadyToShipMessage:
            data.site.settings?.inventory?.showQuantityOnHand &&
            !!item.stockPosition?.quantityOnHand
              ? t('quantityReadyToShip', {
                  quantity: Number(item.stockPosition.quantityOnHand),
                })
              : undefined,
          quantityBackorderedMessage:
            data.site.settings?.inventory?.showQuantityOnBackorder &&
            !!item.stockPosition?.quantityBackordered
              ? t('quantityOnBackorder', {
                  quantity: Number(item.stockPosition.quantityBackordered),
                })
              : undefined,
          quantityOutOfStockMessage:
            data.site.settings?.inventory?.showOutOfStockMessage &&
            !!item.stockPosition?.quantityOutOfStock
              ? t('partiallyAvailable', {
                  quantity: item.quantity - Number(item.stockPosition.quantityOutOfStock),
                })
              : undefined,
          backorderMessage:
            data.site.settings?.inventory?.showBackorderMessage &&
            !!item.stockPosition?.quantityBackordered
              ? (item.stockPosition.backorderMessage ?? undefined)
              : undefined,
        };
      }
    }

    const catalogProduct = item.catalogProductWithOptionSelections;
    const price: Price =
      (catalogProduct && pricesTransformer(catalogProduct, format, taxIncluded ? 'INC' : 'EX')) ??
      format.number(item.listPrice.value, {
        style: 'currency',
        currency: item.listPrice.currencyCode,
      });

    return {
      typename: item.__typename,
      id: item.entityId,
      quantity: item.quantity,
      price,
      subtitle: item.selectedOptions
        .map((option) => {
          switch (option.__typename) {
            case 'CartSelectedMultipleChoiceOption':
            case 'CartSelectedCheckboxOption':
              return `${option.name}: ${option.value}`;

            case 'CartSelectedNumberFieldOption':
              return `${option.name}: ${option.number}`;

            case 'CartSelectedMultiLineTextFieldOption':
            case 'CartSelectedTextFieldOption':
              return `${option.name}: ${option.text}`;

            case 'CartSelectedDateFieldOption':
              return `${option.name}: ${format.dateTime(new Date(option.date.utc))}`;

            default:
              return '';
          }
        })
        .join(', '),
      title: item.name,
      image: item.image?.url ? { src: item.image.url, alt: item.name } : undefined,
      href: new URL(item.url).pathname,
      selectedOptions: item.selectedOptions,
      productEntityId: item.productEntityId,
      variantEntityId: item.variantEntityId,
      inventoryMessages,
    };
  });

  const totalCouponDiscount =
    checkout?.coupons.reduce((sum, coupon) => sum + coupon.discountedAmount.value, 0) ?? 0;

  const totalLineItemDiscount = [
    ...cart.lineItems.physicalItems,
    ...cart.lineItems.digitalItems,
  ].reduce((sum, item) => sum + item.discountedAmount.value, 0);

  const totalDiscount = cart.discountedAmount.value + totalLineItemDiscount;

  const giftCertificatesSummary =
    checkout?.giftCertificates.reduce<Array<{ code: string; used: number }>>((acc, c) => {
      acc.push({
        code: c.code,
        used: c.used.value,
      });

      return acc;
    }, []) ?? [];

  const shippingConsignment =
    checkout?.shippingConsignments?.find((consignment) => consignment.selectedShippingOption) ||
    checkout?.shippingConsignments?.[0];

  // The visitor's remembered ZIP (utility bar). When the cart has no estimate yet, the page quotes
  // shipping for it on load, so the summary is right without anyone typing.
  const deliveryZip = await getDeliveryZip();
  const needsEstimate = Boolean(deliveryZip) && !shippingConsignment?.address;

  const showShippingForm =
    shippingConsignment?.address && !shippingConsignment.selectedShippingOption;

  const checkoutUrl = data.site.settings?.url.checkoutUrl;

  return (
    <>
      <Slot label="Cart top content" snapshotId="cart-top-content" />
      {needsEstimate && deliveryZip ? <ShippingAutoEstimate value={deliveryZip} /> : null}
      <CartAnalyticsProvider data={Streamable.from(() => getAnalyticsData(cartId))}>
        {checkoutUrl ? <CheckoutPreconnect url={checkoutUrl} /> : null}
        <CartComponent
          cart={{
            lineItems: formattedLineItems,
            total: format.number(checkout?.grandTotal?.value || 0, {
              style: 'currency',
              currency: cart.currencyCode,
            }),
            totalLabel: t('CheckoutSummary.total'),
            totalSubtitle:
              taxIncluded && checkout?.taxTotal
                ? t('CheckoutSummary.totalIncludesTax', {
                    tax: format.number(checkout.taxTotal.value, {
                      style: 'currency',
                      currency: cart.currencyCode,
                    }),
                  })
                : undefined,
            summaryItems: [
              {
                label: t('CheckoutSummary.subTotal'),
                value: format.number(checkout?.subtotal?.value ?? 0, {
                  style: 'currency',
                  currency: cart.currencyCode,
                }),
              },
              totalDiscount > 0
                ? {
                    label: t('CheckoutSummary.discounts'),
                    value: `-${format.number(totalDiscount, {
                      style: 'currency',
                      currency: cart.currencyCode,
                    })}`,
                  }
                : null,
              totalCouponDiscount > 0
                ? {
                    label: t('CheckoutSummary.CouponCode.couponCode'),
                    value: `-${format.number(totalCouponDiscount, {
                      style: 'currency',
                      currency: cart.currencyCode,
                    })}`,
                  }
                : null,
              ...giftCertificatesSummary.map((gc) => ({
                label: `${t('GiftCertificate.giftCertificate')} (${gc.code})`,
                value: `-${format.number(gc.used, {
                  style: 'currency',
                  currency: cart.currencyCode,
                })}`,
              })),
              !taxIncluded && checkout?.taxTotal
                ? {
                    label: t('CheckoutSummary.tax'),
                    value: format.number(checkout.taxTotal.value, {
                      style: 'currency',
                      currency: cart.currencyCode,
                    }),
                  }
                : null,
            ].filter(exists),
          }}
          checkoutAction={CHECKOUT_URL}
          checkoutLabel={t('proceedToCheckout')}
          couponCode={{
            action: updateCouponCode,
            couponCodes: checkout?.coupons.map((coupon) => coupon.code) ?? [],
            ctaLabel: t('CheckoutSummary.CouponCode.apply'),
            label: t('CheckoutSummary.CouponCode.couponCode'),
            placeholder: t('CheckoutSummary.CouponCode.placeholder'),
            removeLabel: t('CheckoutSummary.CouponCode.removeCouponCode'),
          }}
          decrementLineItemLabel={t('decrement')}
          deleteLineItemLabel={t('removeItem')}
          emptyState={{
            title: t('Empty.title'),
            subtitle: t('Empty.subtitle'),
            cta: { label: t('Empty.cta'), href: '/shop-all' },
          }}
          giftCertificate={
            giftCertificatesEnabled
              ? {
                  action: updateGiftCertificate,
                  giftCertificateCodes: checkout?.giftCertificates.map((gc) => gc.code) ?? [],
                  ctaLabel: t('GiftCertificate.apply'),
                  label: t('GiftCertificate.giftCertificateCode'),
                  placeholder: tGiftCertificates('CheckBalance.inputPlaceholder'),
                  removeLabel: t('GiftCertificate.removeGiftCertificate'),
                }
              : undefined
          }
          incrementLineItemLabel={t('increment')}
          key={`${cart.entityId}-${cart.version}`}
          lineItemAction={updateLineItem}
          lineItemActionPendingLabel={t('cartUpdateInProgress')}
          offersLabel={t('CheckoutSummary.offersAndRewards')}
          restoreLineItemAction={restoreLineItem}
          shipping={{
            action: updateShippingInfo,
            address: shippingConsignment?.address
              ? {
                  country: shippingConsignment.address.countryCode,
                  city:
                    shippingConsignment.address.city !== ''
                      ? (shippingConsignment.address.city ?? undefined)
                      : undefined,
                  // Prefer the code ("CT") for the "Bristol, CT 06010" line; BigCommerce fills the
                  // name field with "Connecticut" once the code is set.
                  state:
                    shippingConsignment.address.stateOrProvinceCode ||
                    shippingConsignment.address.stateOrProvince ||
                    undefined,
                  postalCode:
                    shippingConsignment.address.postalCode !== ''
                      ? (shippingConsignment.address.postalCode ?? undefined)
                      : undefined,
                }
              : undefined,
            shippingOptions: shippingConsignment?.availableShippingOptions
              ? shippingConsignment.availableShippingOptions.map((option) => ({
                  ...describeShippingOption(option.description),
                  value: option.entityId,
                  price: format.number(option.cost.value, {
                    style: 'currency',
                    currency: checkout?.cart?.currencyCode,
                  }),
                }))
              : undefined,
            shippingOption: shippingConsignment?.selectedShippingOption
              ? {
                  value: shippingConsignment.selectedShippingOption.entityId,
                  ...describeShippingOption(shippingConsignment.selectedShippingOption.description),
                  price: format.number(shippingConsignment.selectedShippingOption.cost.value, {
                    style: 'currency',
                    currency: checkout?.cart?.currencyCode,
                  }),
                }
              : undefined,
            showShippingForm,
            shippingLabel: taxIncluded
              ? t('CheckoutSummary.Shipping.shippingExcludingTax')
              : t('CheckoutSummary.Shipping.shipping'),
            addLabel: t('CheckoutSummary.Shipping.add'),
            changeLabel: t('CheckoutSummary.Shipping.change'),
            postalCodeLabel: t('CheckoutSummary.Shipping.zipCode'),
            postalCodeHint: t('CheckoutSummary.Shipping.zipHint'),
            estimateNote: t('CheckoutSummary.Shipping.estimateNote'),
            defaultPostalCode: deliveryZip?.zip,
            updateShippingOptionsLabel: t('CheckoutSummary.Shipping.updatedShippingOptions'),
            viewShippingOptionsLabel: t('CheckoutSummary.Shipping.viewShippingOptions'),
            cancelLabel: t('CheckoutSummary.Shipping.cancel'),
            editAddressLabel: t('CheckoutSummary.Shipping.editAddress'),
            shippingOptionsLabel: t('CheckoutSummary.Shipping.shippingOptions'),
            updateShippingLabel: t('CheckoutSummary.Shipping.updateShipping'),
            addShippingLabel: t('CheckoutSummary.Shipping.addShipping'),
            noShippingOptionsLabel: t('CheckoutSummary.Shipping.noShippingOptions'),
          }}
          summaryTitle={t('CheckoutSummary.title')}
          title={t('title')}
        />
      </CartAnalyticsProvider>
      <Slot label="Cart bottom content" snapshotId="cart-bottom-content" />
      <CartViewed
        currencyCode={cart.currencyCode}
        lineItems={lineItems}
        subtotal={checkout?.subtotal?.value}
      />
    </>
  );
}
