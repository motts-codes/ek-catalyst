import { type Field } from '@/vibes/soul/form/dynamic-form/schema';

// Field sets shared by the lead forms. Names are what the server action receives.

export const CONTACT_FIELDS: Field[] = [
  { type: 'text', name: 'name', label: 'Your name', required: true },
  { type: 'email', name: 'email', label: 'Email', required: true },
  { type: 'text', name: 'phone', label: 'Phone', required: true },
  { type: 'text', name: 'zip', label: 'ZIP code', required: true },
];

export const SHOWROOM_OPTIONS = [
  { label: 'Brookfield', value: 'brookfield' },
  { label: 'New London', value: 'new-london' },
  { label: 'Newington', value: 'newington' },
  { label: 'Orange', value: 'orange' },
  { label: 'Stamford', value: 'stamford' },
  { label: 'Bristol (factory outlet)', value: 'bristol' },
];

export const AUDIENCE_OPTIONS = [
  { label: 'Homeowner', value: 'homeowner' },
  { label: 'Contractor or remodeler', value: 'contractor' },
  { label: 'Interior designer', value: 'designer' },
  { label: 'Property manager or multifamily', value: 'multifamily' },
  { label: 'Builder or commercial', value: 'commercial' },
  { label: 'Dealer or wholesale', value: 'wholesale' },
  { label: 'Something else', value: 'other' },
];
