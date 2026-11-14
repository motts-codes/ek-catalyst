import { z } from 'zod';

// Straight-line distance between two points, for ranking the showrooms by how far they are from
// a ZIP code. Great-circle miles, as a store locator shows them; not a driving distance.

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function distanceMiles(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

// "0.8 mi", "12.3 mi", "140 mi": one decimal under ten miles, whole miles above.
export function formatMiles(miles: number): string {
  if (miles < 10) return `${miles.toFixed(1)} mi`;

  return `${Math.round(miles)} mi`;
}

// Nearest first, each with its distance from the origin.
export function rankByDistance<T extends { coords: LatLng }>(
  items: T[],
  origin: LatLng,
): Array<{ item: T; miles: number }> {
  return items
    .map((item) => ({ item, miles: distanceMiles(origin, item.coords) }))
    .sort((x, y) => x.miles - y.miles);
}

/** Beyond this the ZIP is outside our showroom area and the list says so. */
export const FAR_AWAY_MILES = 75;

/** Where a search came from, for the "Nearest to 06511" line. */
export interface SearchOrigin extends LatLng {
  /** "06511" or "your location". */
  label: string;
  /** The town Mapbox put the ZIP in, when it gave one ("New Haven, CT"). */
  place?: string;
  /** The same town and state apart ("New Haven", "CT"), for an address. */
  town?: string;
  state?: string;
}

const US_ZIP = /^\d{5}$/;

export const isUsZip = (value: string) => US_ZIP.test(value.trim());

const GeocodeResponse = z.object({
  features: z
    .array(
      z.object({
        properties: z.object({
          name: z.string().optional(),
          coordinates: z.object({ longitude: z.number(), latitude: z.number() }).optional(),
          context: z
            .object({
              place: z.object({ name: z.string().optional() }).optional(),
              region: z.object({ region_code: z.string().optional() }).optional(),
              country: z.object({ country_code: z.string().optional() }).optional(),
            })
            .optional(),
        }),
      }),
    )
    .optional(),
});

// A ZIP code to a point, through Mapbox's forward geocoder, US postcodes only. Resolves to null
// when Mapbox doesn't know the ZIP; throws on a network or token problem.
export async function geocodeZip(zip: string, token: string): Promise<SearchOrigin | null> {
  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');

  url.searchParams.set('q', zip);
  url.searchParams.set('country', 'us');
  url.searchParams.set('types', 'postcode');
  url.searchParams.set('limit', '1');
  url.searchParams.set('access_token', token);

  const response = await fetch(url.toString());

  if (!response.ok) throw new Error(`Geocoding failed (${response.status})`);

  const data = GeocodeResponse.parse(await response.json());
  const feature = data.features?.[0];
  const coordinates = feature?.properties.coordinates;

  // Mapbox can answer a nearby postcode for a ZIP it doesn't have; only take an exact match.
  if (!coordinates || feature.properties.name !== zip) return null;

  const town = feature.properties.context?.place?.name;
  const state = feature.properties.context?.region?.region_code;

  return {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
    label: zip,
    place: town ? [town, state].filter(Boolean).join(', ') : undefined,
    town,
    state,
  };
}

export type ReverseGeocodeResult =
  { status: 'ok'; origin: SearchOrigin } | { status: 'outside-us' } | { status: 'unknown' };

// A point to its US ZIP, through Mapbox's reverse geocoder: the "use my location" path. Only the
// ZIP (and its town/state) leaves this function; the coordinates are never stored. A point outside
// the US is reported as such so the UI can say so.
export async function reverseGeocodeZip(
  coords: LatLng,
  token: string,
): Promise<ReverseGeocodeResult> {
  const url = new URL('https://api.mapbox.com/search/geocode/v6/reverse');

  url.searchParams.set('longitude', String(coords.lng));
  url.searchParams.set('latitude', String(coords.lat));
  url.searchParams.set('types', 'postcode');
  url.searchParams.set('limit', '1');
  url.searchParams.set('access_token', token);

  const response = await fetch(url.toString());

  if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status})`);

  const data = GeocodeResponse.parse(await response.json());
  const feature = data.features?.[0];

  if (!feature) return { status: 'unknown' };

  const countryCode = feature.properties.context?.country?.country_code?.toUpperCase();

  if (countryCode && countryCode !== 'US') return { status: 'outside-us' };

  const zip = feature.properties.name;

  if (!zip || !isUsZip(zip)) return { status: 'unknown' };

  const town = feature.properties.context?.place?.name;
  const state = feature.properties.context?.region?.region_code;

  return {
    status: 'ok',
    origin: {
      lat: coords.lat,
      lng: coords.lng,
      label: zip,
      place: town ? [town, state].filter(Boolean).join(', ') : undefined,
      town,
      state,
    },
  };
}
