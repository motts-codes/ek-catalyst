import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { OrderProgress, OrderProgressStep } from '@/vibes/soul/primitives/order-progress';
import { OrderStatusPill, OrderStatusTone } from '@/vibes/soul/primitives/order-status-pill';
import { type Product } from '@/vibes/soul/primitives/product-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface Order {
  id: string;
  totalPrice: string;
  status: string;
  /** Brand hue for the status pill; grey when unknown. */
  statusTone?: OrderStatusTone;
  href: string;
  /** "Nov 14, 2026" */
  date?: string;
  /** "3 items" — the collapsed summary of the line items. */
  itemsSummary?: string;
  /** Where the order is on the placed → completed track; absent for cancelled/refunded orders. */
  progress?: { steps: OrderProgressStep[]; current: number };
  lineItems: OrderLineItem[];
}

export interface OrderLineItem extends Product {
  price: string;
  totalPrice: string;
  quantity?: number;
}

export interface OrderListProps {
  className?: string;
  title?: string;
  orders: Streamable<Order[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  orderNumberLabel?: string;
  dateLabel?: string;
  totalLabel?: string;
  viewDetailsLabel?: string;
  progressLabel?: string;
  showItemsLabel?: string;
  hideItemsLabel?: string;
  quantityLabel?: string;
  emptyStateTitle?: string;
  emptyStateActionLabel?: string;
  emptyStateActionHref?: string;
}

/** Thumbnails shown in the collapsed strip before "+N". */
const STRIP_SIZE = 4;

const borderClassName = 'border-[var(--order-list-border,hsl(var(--contrast-100)))]';

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --order-list-title-font-family: var(--font-family-heading);
 *   --order-list-label-font-family: var(--font-family-mono);
 *   --order-list-title: hsl(var(--foreground));
 *   --order-list-label: hsl(var(--contrast-500));
 *   --order-list-info: hsl(var(--foreground));
 *   --order-list-border: hsl(var(--contrast-100));
 *   --order-list-empty-state-title: hsl(var(--foreground));
 * }
 * ```
 */
export function OrderList({
  className,
  title = 'Orders',
  orders: streamableOrders,
  paginationInfo,
  orderNumberLabel = 'Order #',
  dateLabel = 'Placed',
  totalLabel = 'Total',
  viewDetailsLabel = 'View details',
  progressLabel = 'Order progress',
  showItemsLabel = 'Show items',
  hideItemsLabel = 'Hide items',
  quantityLabel = 'Qty',
  emptyStateTitle = "You don't have any orders",
  emptyStateActionLabel = 'Shop now',
  emptyStateActionHref = '/',
}: OrderListProps) {
  return (
    <section className="group/order-list w-full @container">
      <header className={clsx('mb-4 @2xl:min-h-[72px] @2xl:border-b', borderClassName)}>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="hidden font-[family-name:var(--order-list-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none tracking-tight text-[var(--order-list-title,hsl(var(--foreground)))] @2xl:block">
            {title}
          </h1>
        </div>
      </header>
      <Stream fallback={<OrderListSkeleton />} value={streamableOrders}>
        {(orders) => {
          if (orders.length === 0) {
            return (
              <OrderListEmptyState
                emptyStateActionHref={emptyStateActionHref}
                emptyStateActionLabel={emptyStateActionLabel}
                emptyStateTitle={emptyStateTitle}
              />
            );
          }

          // One card per order: the essentials and the progress track up top, the items folded
          // away beneath (a thumbnail strip while closed, cart-style rows when opened), so a
          // twenty-line order takes no more room than a one-line one until you ask.
          return (
            <div className="flex flex-col gap-4 @container @lg:gap-5">
              {orders.map((order) => (
                <article
                  // A soft lift that deepens when the pointer is over the card or something inside it has focus.
                  className={clsx(
                    'rounded-2xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.06)] transition-shadow duration-200 focus-within:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.12)] @lg:p-6',
                    borderClassName,
                    className,
                  )}
                  key={order.id}
                >
                  <div className="flex flex-col justify-between gap-x-10 gap-y-4 @lg:flex-row @lg:items-start">
                    <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
                      <Fact label={orderNumberLabel} value={order.id} />
                      {order.date != null && <Fact label={dateLabel} value={order.date} />}
                      <Fact label={totalLabel} value={order.totalPrice} />
                      <OrderStatusPill className="mt-0.5" tone={order.statusTone}>
                        {order.status}
                      </OrderStatusPill>
                    </div>
                    <ButtonLink href={order.href} size="small">
                      {viewDetailsLabel}
                    </ButtonLink>
                  </div>
                  {order.progress && (
                    <OrderProgress
                      className="mt-6 max-w-2xl"
                      current={order.progress.current}
                      label={progressLabel}
                      steps={order.progress.steps}
                    />
                  )}
                  {order.lineItems.length > 0 && (
                    <details className={clsx('group/items mt-6 border-t pt-4', borderClassName)}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus,hsl(var(--primary)))] focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex items-center gap-1.5 group-open/items:hidden">
                            {order.lineItems.slice(0, STRIP_SIZE).map((lineItem, index) => (
                              // Phones fit three thumbnails beside the toggle; the fourth joins
                              // from tablet up.
                              <span
                                className={clsx(index === STRIP_SIZE - 1 && 'hidden @sm:block')}
                                key={lineItem.id}
                              >
                                <Thumb lineItem={lineItem} size="small" />
                              </span>
                            ))}
                            {order.lineItems.length > STRIP_SIZE && (
                              <span className="flex size-11 items-center justify-center rounded-lg bg-[var(--order-list-image-background,hsl(var(--contrast-100)))] text-xs font-semibold text-[var(--order-list-label,hsl(var(--contrast-500)))]">
                                +{order.lineItems.length - STRIP_SIZE}
                              </span>
                            )}
                          </span>
                          {order.itemsSummary != null && (
                            <span className="hidden truncate text-sm text-[var(--order-list-label,hsl(var(--contrast-500)))] group-open/items:inline @sm:inline">
                              {order.itemsSummary}
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold">
                          <span className="group-open/items:hidden">{showItemsLabel}</span>
                          <span className="hidden group-open/items:inline">{hideItemsLabel}</span>
                          <ChevronDown
                            aria-hidden
                            className="transition-transform duration-300 group-open/items:rotate-180"
                            size={16}
                            strokeWidth={2}
                          />
                        </span>
                      </summary>
                      <ul
                        className={clsx(
                          'mt-3 divide-y divide-[var(--order-list-border,hsl(var(--contrast-100)))] border-t',
                          borderClassName,
                        )}
                      >
                        {order.lineItems.map((lineItem) => (
                          <li className="flex items-center gap-4 py-3" key={lineItem.id}>
                            <Thumb lineItem={lineItem} />
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                              {lineItem.href !== '#' ? (
                                <Link
                                  className="self-start text-sm font-medium leading-snug underline-offset-2 transition-colors hover:text-[var(--button-primary-background,#d90716)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
                                  href={lineItem.href}
                                >
                                  {lineItem.title}
                                </Link>
                              ) : (
                                <span className="text-sm font-medium leading-snug">
                                  {lineItem.title}
                                </span>
                              )}
                              {lineItem.subtitle != null && lineItem.subtitle !== '' && (
                                <span className="text-xs text-[var(--order-list-label,hsl(var(--contrast-500)))]">
                                  {lineItem.subtitle}
                                </span>
                              )}
                              <span className="text-xs text-[var(--order-list-label,hsl(var(--contrast-500)))]">
                                {lineItem.quantity != null &&
                                  `${quantityLabel} ${lineItem.quantity} · `}
                                {lineItem.price}
                              </span>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums">
                              {lineItem.totalPrice}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </article>
              ))}
            </div>
          );
        }}
      </Stream>
      {paginationInfo && <CursorPagination info={paginationInfo} />}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-[family-name:var(--order-list-label-font-family,var(--font-family-mono))] text-xs uppercase leading-normal text-[var(--order-list-label,hsl(var(--contrast-500)))]">
        {label}
      </span>
      <span className="block text-lg font-semibold leading-normal text-[var(--order-list-info,hsl(var(--foreground)))]">
        {value}
      </span>
    </div>
  );
}

// A product photo on the light grey tile the cart uses; the strip's are 44px, the rows' 64px.
function Thumb({
  lineItem,
  size = 'default',
}: {
  lineItem: OrderLineItem;
  size?: 'small' | 'default';
}) {
  return (
    <span
      className={clsx(
        'relative block shrink-0 overflow-hidden rounded-lg bg-[var(--order-list-image-background,hsl(var(--contrast-100)))]',
        size === 'small' ? 'size-11' : 'size-16',
      )}
    >
      {lineItem.image != null && (
        <Image
          alt={lineItem.image.alt}
          className="object-cover"
          fill
          sizes={size === 'small' ? '44px' : '64px'}
          src={lineItem.image.src}
        />
      )}
    </span>
  );
}

function OrderListSkeleton() {
  return (
    <Skeleton.Root
      className="flex flex-col gap-4 group-has-[[data-pending]]/order-list:animate-pulse @lg:gap-5"
      pending
    >
      {Array.from({ length: 3 }).map((_, id) => (
        <div
          className={clsx(
            'rounded-2xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.06)] @lg:p-6',
            borderClassName,
          )}
          data-pending
          key={id}
        >
          <div className="flex flex-col justify-between gap-x-10 gap-y-4 @lg:flex-row">
            <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
              <div>
                <Skeleton.Text characterCount={7} className="rounded text-xs" />
                <Skeleton.Text characterCount={7} className="rounded text-lg" />
              </div>
              <div>
                <Skeleton.Text characterCount={6} className="rounded text-xs" />
                <Skeleton.Text characterCount={12} className="rounded text-lg" />
              </div>
              <div>
                <Skeleton.Text characterCount={8} className="rounded text-xs" />
                <Skeleton.Text characterCount={6} className="rounded text-lg" />
              </div>
              <Skeleton.Box className="mt-0.5 h-[22px] w-[55px] rounded" />
            </div>
            <Skeleton.Box className="h-[43px] min-w-[12ch] gap-x-2 rounded-full px-4 py-2.5" />
          </div>
          <div className="mt-6 grid max-w-2xl grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((__, idx) => (
              <div className="flex flex-col items-center gap-2" key={idx}>
                <Skeleton.Box className="size-11 rounded-full" />
                <Skeleton.Text characterCount={8} className="rounded text-xs" />
              </div>
            ))}
          </div>
          <div className={clsx('mt-6 flex items-center gap-1.5 border-t pt-4', borderClassName)}>
            {Array.from({ length: 3 }).map((__, idx) => (
              <Skeleton.Box className="size-11 rounded-lg" key={idx} />
            ))}
          </div>
        </div>
      ))}
    </Skeleton.Root>
  );
}

function OrderListEmptyState({
  emptyStateTitle,
  emptyStateActionLabel,
  emptyStateActionHref = '/',
}: Pick<OrderListProps, 'emptyStateTitle' | 'emptyStateActionLabel' | 'emptyStateActionHref'>) {
  return (
    <div className="@container">
      <div className="py-20">
        <header className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="text-center text-lg font-semibold text-[var(--order-list-empty-state-title,hsl(var(--foreground)))]">
            {emptyStateTitle}
          </h2>
          <ButtonLink className="w-fit" href={emptyStateActionHref} size="small">
            {emptyStateActionLabel}
          </ButtonLink>
        </header>
      </div>
    </div>
  );
}
