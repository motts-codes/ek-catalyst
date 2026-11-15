import { clsx } from 'clsx';
import { CircleCheck, LucideIcon, Package, ShoppingBag, Store, Truck } from 'lucide-react';

export interface OrderProgressStep {
  label: string;
  icon: 'placed' | 'processing' | 'shipped' | 'pickup' | 'completed';
}

export interface OrderProgressProps {
  steps: OrderProgressStep[];
  /** Index of the current step; steps before it are done, after it still to come. */
  current: number;
  /** Accessible name for the list ("Order progress"). */
  label?: string;
  className?: string;
}

const ICONS: Record<OrderProgressStep['icon'], LucideIcon> = {
  placed: ShoppingBag,
  processing: Package,
  shipped: Truck,
  pickup: Store,
  completed: CircleCheck,
};

const stateOf = (i: number, current: number) => {
  if (i < current) return 'done';

  return i === current ? 'current' : 'todo';
};

// The order's journey as discs on a line: done steps in light red, the current one solid red,
// the rest outlined. Reads at a glance where the order is, with the step names beneath.
export function OrderProgress({
  steps,
  current,
  label = 'Order progress',
  className,
}: OrderProgressProps) {
  return (
    <ol aria-label={label} className={clsx('grid grid-cols-4', className)}>
      {steps.map((step, i) => {
        const Icon = ICONS[step.icon];
        const state = stateOf(i, current);

        return (
          <li
            aria-current={state === 'current' ? 'step' : undefined}
            className="relative flex flex-col items-center gap-2 text-center"
            key={step.label}
          >
            {i > 0 && (
              // The connector runs from the previous disc's centre to this one's.
              <span
                aria-hidden
                className={clsx(
                  'absolute left-[-50%] top-[21px] h-0.5 w-full',
                  state === 'todo'
                    ? 'bg-contrast-100'
                    : 'bg-[var(--button-primary-background,#d90716)]',
                )}
              />
            )}
            <span
              className={clsx(
                'relative z-10 flex size-11 items-center justify-center rounded-full border transition-colors',
                state === 'done' &&
                  'border-[#fcb6bb] bg-[#fdf3f5] text-[var(--button-primary-background,#d90716)]',
                state === 'current' &&
                  'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white',
                state === 'todo' && 'border-contrast-200 bg-white text-contrast-400',
              )}
            >
              <Icon aria-hidden size={20} strokeWidth={1.75} />
            </span>
            <span
              className={clsx(
                'text-xs leading-tight @sm:text-sm',
                state === 'current' &&
                  'font-semibold text-[var(--button-primary-background,#d90716)]',
                state === 'done' && 'font-medium text-foreground',
                state === 'todo' && 'text-contrast-400',
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
