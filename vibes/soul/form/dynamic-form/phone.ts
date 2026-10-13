// US phone formatting for the tel field: "(860) 247-1000" as you type. Only digits are kept; a
// leading 1 (country code) is dropped so pasted "+1 860…" numbers format the same way.
export function formatUsPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');

  if (digits.length > 10 && digits.startsWith('1')) digits = digits.slice(1);

  digits = digits.slice(0, 10);

  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Accepts the formatted value, plain digits, or a pasted "+1 860-247-1000".
export const US_PHONE_PATTERN = /^(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
