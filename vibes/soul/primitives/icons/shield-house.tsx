import { type SVGProps } from 'react';

// A Lucide-style "shield with a house" mark for CARB2 compliance (safe-for-the-home emissions).
// The installed Lucide set has no shield-house icon, so this composes Lucide's shield outline
// with a small house glyph at the same 24-unit grid, stroke and caps, so it sits beside the real
// icons without looking different.
export function ShieldHouse({
  size = 24,
  strokeWidth = 2,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }) {
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M8.5 12.5 12 9.5l3.5 3" />
      <path d="M9.5 11.7V16h5v-4.3" />
    </svg>
  );
}
