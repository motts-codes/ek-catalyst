import { clsx } from 'clsx';
import { Minus, Plus } from 'lucide-react';

export interface PlusMinusProps {
  /** Whether the thing this sign controls is open: `−` when open, `+` when closed. */
  open: boolean;
  /** `md` for question rows (20px from tablet), `lg` for group headings (28px from tablet). */
  size?: 'md' | 'lg';
  className?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * The bare `+` / `−` expand sign every FAQ-style toggle on the site uses (FAQ page groups,
 * glossary groups, the CabinetFaq rows on category, policy and offer pages). No ring: just the
 * glyph, grey at rest, red while the parent `group` is hovered and while open. 16px on phones.
 * Put `group` on the owning button so the hover colour follows the whole row.
 */
export function PlusMinus({ open, size = 'md', className }: PlusMinusProps) {
  const Icon = open ? Minus : Plus;

  return (
    <Icon
      aria-hidden
      className={clsx(
        'shrink-0 transition-colors duration-200',
        { md: 'size-4 @md:size-5', lg: 'size-4 @md:size-7' }[size],
        // Literal class strings so Tailwind can see them.
        open
          ? 'text-[var(--button-primary-background,#d90716)]'
          : 'text-contrast-500 group-hover:text-[var(--button-primary-background,#d90716)]',
        className,
      )}
      strokeWidth={2.25}
    />
  );
}
