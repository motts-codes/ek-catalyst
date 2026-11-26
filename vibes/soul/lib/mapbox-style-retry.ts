import type { Map as MapboxMap } from 'mapbox-gl';

// A map whose style fetch failed (Mapbox answered 503 during EK's audit, 26 Nov 2026) sits blank
// and grey until the visitor reloads. This asks for the style once more, two seconds later, the
// first time a server-side error arrives before the style has loaded; after that it stays quiet.
export function retryStyleOnce(map: MapboxMap, style: string, isCancelled: () => boolean) {
  let retried = false;

  map.on('error', (event: { error?: unknown }) => {
    if (retried || isCancelled() || map.isStyleLoaded()) return;

    if (!hasServerErrorStatus(event.error)) return;

    retried = true;
    window.setTimeout(() => {
      if (!isCancelled()) map.setStyle(style);
    }, 2000);
  });
}

// mapbox-gl attaches the HTTP status to the error it raises for a failed fetch.
function hasServerErrorStatus(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('status' in error)) return false;

  const { status } = error;

  return typeof status === 'number' && status >= 500;
}
