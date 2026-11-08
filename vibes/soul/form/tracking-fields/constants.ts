// Attribution keys carried from the landing URL into every lead, as the old Stencil landing page
// did (sessionStorage so they survive navigation before the visitor submits).
export const TRACKING_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const;

export type TrackingKey = (typeof TRACKING_KEYS)[number];

/** Hidden input carrying the URL of the page the form was submitted from. */
export const PAGE_URL_FIELD = 'page_url';

export const TRACKING_STORAGE_KEY = 'ek_tracking';
