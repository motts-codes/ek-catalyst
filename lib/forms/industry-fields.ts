import { type Field } from '@/vibes/soul/form/dynamic-form/schema';

// Shared "talk to us" form for the Multifamily and Commercial pages.
export const industryFields = (scopeLabel: string): Field[] => [
  { type: 'text', name: 'company', label: 'Company', required: true },
  { type: 'text', name: 'name', label: 'Your name', required: true },
  { type: 'email', name: 'email', label: 'Email', required: true },
  { type: 'text', name: 'phone', label: 'Phone', required: true },
  { type: 'text', name: 'scope', label: scopeLabel, required: true },
  { type: 'text', name: 'timeline', label: 'Timeline' },
];
