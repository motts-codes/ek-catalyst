import { themeToCssVars } from './to-css';

export const colors = {
  primary: '356 89% 57%',
  accent: '96 100% 88%',
  background: '0 0% 100%',
  foreground: '0 0% 7%',
  success: '116 78% 65%',
  // Brand red: 5.3:1 on white, so 12px field errors pass AA (the old 60% lightness was 3.5:1).
  error: '355 94% 44%',
  warning: '40 100% 60%',
  info: '220 70% 45%',
  contrast: {
    100: '0 0% 93%',
    200: '0 0% 82%',
    300: '0 0% 70%',
    // 45% (#737373) is the lightest grey that passes WCAG AA for small text on white / the tint.
    400: '0 0% 45%',
    500: '0 0% 34%',
  },
  primaryMix: {
    white: {
      75: '356 89% 89%',
    },
    black: {
      75: '356 68% 14%',
    },
  },
};

export const BaseColors = () => (
  <style data-makeswift="theme-base-colors">{`:root {
      ${themeToCssVars(colors).join('\n')}
    }
  `}</style>
);
