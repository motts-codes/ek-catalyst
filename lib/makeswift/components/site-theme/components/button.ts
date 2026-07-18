import { Color, Group } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    background: string;
    backgroundHover: string;
    foreground: string;
    border: string;
  },
) =>
  Group({
    label,
    preferredLayout: Group.Layout.Inline,
    props: {
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      backgroundHover: Color({ label: 'Background hover', defaultValue: defaults.backgroundHover }),
      foreground: Color({ label: 'Text', defaultValue: defaults.foreground }),
      border: Color({ label: 'Border', defaultValue: defaults.border }),
    },
  });

export const button = Group({
  label: 'Button',
  preferredLayout: Group.Layout.Popover,
  props: {
    fontFamily: FontFamily({ label: 'Font', defaultValue: FontFamily.Body }),
    // Brand button colors (Add to Cart = primary; Buy Now uses tertiary).
    // NOTE: these defaults are overridden at runtime by the Makeswift theme snapshot, so the
    // authoritative values are ALSO set with !important in globals.css. Keep both in sync.
    primary: colorGroup('Primary', {
      background: '#D90716',
      backgroundHover: '#B80613',
      foreground: '#FFFFFF',
      border: '#D90716',
    }),
    secondary: colorGroup('Secondary', {
      background: hsl(colors.foreground),
      backgroundHover: hsl(colors.background),
      foreground: hsl(colors.background),
      border: hsl(colors.foreground),
    }),
    tertiary: colorGroup('Tertiary', {
      background: '#96050F',
      backgroundHover: '#6B040B',
      foreground: '#FFFFFF',
      border: '#96050F',
    }),
    ghost: colorGroup('Ghost', {
      background: 'transparent',
      backgroundHover: hsl(colors.foreground, 0.05),
      foreground: hsl(colors.foreground),
      border: 'transparent',
    }),
    focus: Color({ label: 'Focus', defaultValue: hsl(colors.primary) }),
  },
});
