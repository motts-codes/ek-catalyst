'use client';

import 'mapbox-gl/dist/mapbox-gl.css';

import { clsx } from 'clsx';
import { Clock, MapPin, Phone } from 'lucide-react';
import type { Map as MapboxMap, Marker } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Link } from '~/components/link';
import { directionsHref, type Showroom, showroomHref } from '~/lib/pages/showrooms';

interface Props {
  showrooms: Showroom[];
  /** A Mapbox public token. Without one the list still renders, beside a placeholder. */
  token?: string;
  kicker?: string;
  title?: string;
  description?: string;
  id?: string;
}

const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';
const SELECTED_ZOOM = 13;
const FIT_PADDING = 64;
const FIT_MAX_ZOOM = 10;
const FLY_MS = 1200;

// "Where to find us": the six showrooms on a Mapbox map with a list beside it. Pick a card or a
// pin and the map flies there (jumps, with reduced motion); the chosen card and pin are marked.
// Built after Osmo Supply's store locator, in the site's own markup and look.
export function ShowroomLocator({
  showrooms,
  token,
  kicker = 'On the map',
  title = 'Six showrooms across Connecticut',
  description,
  id = 'locations',
}: Props) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [active, setActive] = useState<string | null>(null);
  // Marker elements, once the map has made them, so React can draw the pin icons into them.
  const [pins, setPins] = useState<Array<{ slug: string; element: HTMLButtonElement }>>([]);

  useEffect(() => {
    const container = mapNode.current;

    if (!token || !container) return;

    let map: MapboxMap | undefined;
    let markers: Marker[] = [];
    let cancelled = false;
    // The box can still be settling when the map is made (and it changes shape between phone and
    // desktop layouts), so the map is told whenever its box changes size.
    const observer = new ResizeObserver(() => map?.resize());

    observer.observe(container);

    void import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (cancelled) return;

      mapboxgl.accessToken = token;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const first = showrooms[0];

      const created = new mapboxgl.Map({
        container,
        style: MAP_STYLE,
        center: first ? [first.coords.lng, first.coords.lat] : [-72.7, 41.5],
        zoom: 7.5,
        attributionControl: false,
        cooperativeGestures: true,
      });

      map = created;
      mapRef.current = created;

      created.addControl(new mapboxgl.AttributionControl({ compact: true }));
      created.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      const made = showrooms.map((showroom) => {
        const element = document.createElement('button');

        element.type = 'button';
        element.setAttribute('aria-label', `Show ${showroom.name} on the map`);
        element.className =
          'group/pin flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[var(--button-primary-background,#d90716)] text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/0.5)] transition-transform hover:scale-110 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 data-[active=true]:scale-125 data-[active=true]:ring-2 data-[active=true]:ring-[var(--button-primary-background,#d90716)] data-[active=true]:ring-offset-2';
        element.dataset.active = 'false';
        element.addEventListener('click', () => setActive(showroom.slug));

        const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
          .setLngLat([showroom.coords.lng, showroom.coords.lat])
          .addTo(created);

        // Mapbox labels the element as an image; it is a button.
        element.setAttribute('role', 'button');

        return { slug: showroom.slug, element, marker };
      });

      markers = made.map((m) => m.marker);
      setPins(made.map(({ slug, element }) => ({ slug, element })));

      const bounds = new mapboxgl.LngLatBounds();

      showrooms.forEach((s) => bounds.extend([s.coords.lng, s.coords.lat]));

      created.on('load', () => {
        created.resize();
        created.fitBounds(bounds, {
          padding: FIT_PADDING,
          maxZoom: FIT_MAX_ZOOM,
          duration: reducedMotion ? 0 : 700,
        });
      });
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      markers.forEach((m) => m.remove());
      map?.remove();
      mapRef.current = null;
    };
  }, [token, showrooms]);

  // The chosen showroom: mark its card and pin, and fly the map there.
  useEffect(() => {
    pins.forEach((pin) => {
      pin.element.dataset.active = String(pin.slug === active);
      pin.element.setAttribute('aria-pressed', String(pin.slug === active));
    });

    const showroom = showrooms.find((s) => s.slug === active);
    const map = mapRef.current;

    if (!showroom || !map) return;

    const center: [number, number] = [showroom.coords.lng, showroom.coords.lat];
    const camera = { center };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) map.jumpTo({ ...camera, zoom: SELECTED_ZOOM });
    else map.flyTo({ ...camera, zoom: SELECTED_ZOOM, duration: FLY_MS, essential: false });
  }, [active, pins, showrooms]);

  const chosen = showrooms.find((s) => s.slug === active);

  return (
    <HomeSection description={description} id={id} kicker={kicker} title={title}>
      <div className="grid gap-4 @3xl:h-[36rem] @3xl:grid-cols-[22rem_1fr] @3xl:gap-6">
        {/* The map: 3:2 on phones, above the list; the full height beside it from tablet width. */}
        <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-contrast-100 @3xl:order-last @3xl:aspect-auto @3xl:h-full">
          {token ? (
            // Mapbox's own stylesheet makes its container `position: relative`; this wins.
            <div className="!absolute inset-0" ref={mapNode} />
          ) : (
            <MediaPlaceholder label="Map of our showrooms" />
          )}
          {/* The pin icons, drawn into the marker buttons Mapbox placed on the map. */}
          {pins.map((pin) =>
            createPortal(<MapPin aria-hidden size={20} strokeWidth={2.25} />, pin.element),
          )}
        </div>
        {/* The list: a row you can swipe through on phones, a column that scrolls on desktop. */}
        <ol
          aria-label="Our showrooms"
          className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 @3xl:mx-0 @3xl:h-full @3xl:flex-col @3xl:overflow-y-auto @3xl:px-0 @3xl:pb-0 @3xl:pr-1"
        >
          {showrooms.map((showroom) => {
            const isActive = showroom.slug === active;

            return (
              // The card selects on click, except on its links, which keep working as links.
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- the name is a button that does the same for keyboards
              <li
                className={clsx(
                  'w-[18rem] shrink-0 snap-start rounded-3xl border bg-white p-5 transition-[border-color,box-shadow] @3xl:w-auto',
                  isActive
                    ? 'border-[var(--button-primary-background,#d90716)] shadow-[0_0_0_1px_var(--button-primary-background,#d90716)]'
                    : 'border-contrast-100 hover:border-contrast-300',
                )}
                data-active={isActive}
                key={showroom.slug}
                onClick={(event) => {
                  if (event.target instanceof Element && event.target.closest('a, button')) return;
                  setActive(showroom.slug);
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-contrast-500">
                  Showroom
                </p>
                <h3 className="mt-1 font-heading text-lg font-bold leading-tight">
                  <button
                    aria-pressed={isActive}
                    className="text-left text-[var(--button-primary-background,#d90716)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
                    onClick={() => setActive(showroom.slug)}
                    type="button"
                  >
                    {showroom.name}
                  </button>
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-contrast-500">
                  <li className="flex gap-2.5">
                    <MapPin aria-hidden className="mt-0.5 shrink-0 text-contrast-400" size={15} />
                    <span>{showroom.address}</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Clock aria-hidden className="mt-0.5 shrink-0 text-contrast-400" size={15} />
                    <span>
                      {showroom.hours[0]
                        ? `${showroom.hours[0].days}: ${showroom.hours[0].time}`
                        : ''}
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <Phone aria-hidden className="mt-0.5 shrink-0 text-contrast-400" size={15} />
                    <a
                      className="text-foreground"
                      href={`tel:${showroom.phone.replace(/\D/g, '')}`}
                    >
                      {showroom.phone}
                    </a>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                  <a
                    className="text-foreground underline underline-offset-4"
                    href={directionsHref(showroom.address)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Get directions
                  </a>
                  <Link
                    className="text-foreground underline underline-offset-4"
                    href={showroomHref(showroom.slug)}
                  >
                    Showroom page
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <p aria-live="polite" className="sr-only">
        {chosen ? `Showing ${chosen.name} on the map.` : ''}
      </p>
    </HomeSection>
  );
}
