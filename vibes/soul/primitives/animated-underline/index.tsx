import { clsx } from 'clsx';

export interface AnimatedUnderlineProps {
  children: string;
  className?: string;
}

/**
 * The animated red underline hover effect as a bare className, so it can be applied to any link/text
 * element (not just the AnimatedUnderline wrapper) for a consistent hover across the app — e.g. the
 * PDP trust links, the "Shop brand" link, breadcrumbs, "Write a review". The underline grows from 0
 * to full width on hover, using the theme's primary (red). Apply to an element that also has
 * `position` in normal flow; combine with your own color/size classes.
 */
export const animatedUnderlineClassName =
  'bg-[linear-gradient(0deg,var(--animated-underline-hover,hsl(var(--primary))),var(--animated-underline-hover,hsl(var(--primary))))] bg-[length:0_1px] bg-[position:left_bottom] bg-no-repeat transition-[background-size,color] duration-300 hover:bg-[length:100%_1px] hover:text-foreground';

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --animated-underline-hover: hsl(var(--primary));
 *   --animated-underline-text: hsl(var(--foreground));
 *   --animated-underline-font-family: var(--font-family-body);
 * }
 * ```
 */
export function AnimatedUnderline({ className, children }: AnimatedUnderlineProps) {
  return (
    <span
      className={clsx(
        'origin-left font-[family-name:var(--animated-underline-font-family,var(--font-family-body))] font-semibold leading-normal text-[var(--animated-underline-text,hsl(var(--foreground)))] transition-[background-size,color] duration-300 [background:linear-gradient(0deg,var(--animated-underline-hover,hsl(var(--primary))),var(--animated-underline-hover,hsl(var(--primary))))_no-repeat_left_bottom_/_0_1px] hover:bg-[size:100%_1px] hover:!text-foreground group-focus/underline:bg-[size:100%_1px]',
        className,
      )}
    >
      {children}
    </span>
  );
}
