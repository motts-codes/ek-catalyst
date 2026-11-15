import * as Toggle from '@radix-ui/react-toggle';

import { Heart } from '@/vibes/soul/primitives/favorite/heart';

export interface FavoriteProps {
  label?: string;
  checked?: boolean;
  setChecked?: (liked: boolean) => void;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --favorite-focus: hsl(var(--primary));
 *   --favorite-border: hsl(var(--contrast-100));
 *   --favorite-icon: hsl(var(--foreground));
 *   --favorite-on-background: #ffffff;
 *   --favorite-on-border: #fcb6bb;
 *   --favorite-on-icon: var(--button-primary-background, #d90716);
 *   --favorite-off-border: hsl(var(--contrast-200));
 * }
 * ```
 */
// Saved state: white disc, light red outline, red heart — a kept item, not a pressed grey button.
export const Favorite = ({ checked = false, setChecked, label = 'Favorite' }: FavoriteProps) => {
  return (
    <Toggle.Root
      className="group relative flex h-[50px] w-[50px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--favorite-border,hsl(var(--contrast-100)))] text-[var(--favorite-icon,hsl(var(--foreground)))] ring-[var(--favorite-focus,hsl(var(--primary)))] transition-[colors,transform] duration-300 focus-within:outline-none focus-within:ring-2 data-[state=on]:border-[var(--favorite-on-border,#fcb6bb)] data-[state=on]:bg-[var(--favorite-on-background,#ffffff)] data-[state=on]:text-[var(--favorite-on-icon,var(--button-primary-background,#d90716))] data-[state=off]:hover:border-[var(--favorite-off-border,hsl(var(--contrast-200)))]"
      onPressedChange={setChecked}
      pressed={checked}
    >
      <Heart filled={checked} title={label} />
    </Toggle.Root>
  );
};
