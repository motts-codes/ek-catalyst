import { type Field } from '@/vibes/soul/form/dynamic-form/schema';

// Shared "talk to us" form for the Multifamily and Commercial pages. Rows pair related fields so
// the card stays short.
export const industryFields = (scopeLabel: string): Array<Field | Field[]> => [
  [
    { type: 'text', name: 'company', label: 'Company', required: true },
    { type: 'text', name: 'name', label: 'Your name', required: true },
  ],
  [
    { type: 'email', name: 'email', label: 'Email', required: true },
    { type: 'tel', name: 'phone', label: 'Phone', required: true },
  ],
  [
    { type: 'text', name: 'scope', label: scopeLabel, required: true },
    { type: 'text', name: 'timeline', label: 'Timeline' },
  ],
  // Values are the exact labels of the "Project Type (Commercial)" dropdown on the monday.com
  // WF28 board, so the lead maps straight across.
  {
    type: 'select',
    name: 'projectType',
    label: 'Project type',
    options: [
      'Apartment Complex',
      'Mixed-Use Development',
      'Student Housing',
      'Government / HUD',
      'Multi-Family Renovation',
      'Other Commercial',
    ].map((label) => ({ label, value: label })),
  },
];
