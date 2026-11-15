import { clsx } from 'clsx';

/** The four brand hues (plus a quiet grey for closed-out orders). */
export type OrderStatusTone = 'red' | 'cream' | 'blue' | 'green' | 'grey';

export interface OrderStatusPillProps {
  children: string;
  tone?: OrderStatusTone;
  className?: string;
}

// Light tint behind deep text of the same family, all comfortably past AA for small text
// (red 5.7:1, cream 8.9:1, blue 11.6:1, green 7.8:1, grey 7.6:1). A dot in the text colour
// carries the hue for anyone who can't rely on the tint alone.
const TONE_CLASS: Record<OrderStatusTone, string> = {
  red: 'bg-[#fde3e5] text-[#9f3632]',
  cream: 'bg-[#f6ebd6] text-[#6b4f22]',
  blue: 'bg-[#e4ecf9] text-[#1e3461]',
  green: 'bg-[#dcf5e3] text-[#166534]',
  grey: 'bg-[#efefef] text-[#4a4a4a]',
};

// The order's status as a proper pill: brand tint, sentence-case label, a dot in the hue.
export function OrderStatusPill({ children, tone = 'grey', className }: OrderStatusPillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
        TONE_CLASS[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
