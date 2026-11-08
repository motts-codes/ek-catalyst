// Browser-side store for campaign attribution (client modules only; uses sessionStorage).

import { TRACKING_KEYS, TRACKING_STORAGE_KEY, type TrackingKey } from './constants';

export type StoredTracking = Partial<Record<TrackingKey, string>>;

export function readStoredTracking(): StoredTracking {
  try {
    const raw = sessionStorage.getItem(TRACKING_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

// Merges utm_* / gclid / fbclid from the current URL into sessionStorage and returns the result.
// Call on page load; later pages read the stored values even when their own URL has none.
export function captureTracking(): StoredTracking {
  const params = new URLSearchParams(window.location.search);
  const merged: StoredTracking = { ...readStoredTracking() };

  TRACKING_KEYS.forEach((key) => {
    const value = params.get(key);

    if (value) {
      merged[key] = value.slice(0, 200);
    }
  });

  try {
    sessionStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Storage blocked: the current URL's values still apply to this page.
  }

  return merged;
}
