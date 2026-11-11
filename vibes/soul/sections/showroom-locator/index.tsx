'use client';

import 'mapbox-gl/dist/mapbox-gl.css';

import { clsx } from 'clsx';
import { MapPin, Phone } from 'lucide-react';
import type { Map as MapboxMap, Marker } from 'mapbox-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { animatedUnderlineClassName } from '@/vibes/soul/primitives/animated-underline';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Link } from '~/components/link';
import {
  FAR_AWAY_MILES,
  formatMiles,
  rankByDistance,
  type SearchOrigin,
} from '~/lib/pages/showroom-distance';
import {
  directionsHref,
  type OpenStatus,
  openStatus,
  type Showroom,
  showroomHref,
} from '~/lib/pages/showrooms';

import { ZipSearch } from './zip-search';

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
// After a ZIP search the map frames the ZIP and the nearest showroom together.
const RESULT_MAX_ZOOM = 12;
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
  // Where a ZIP search (or the browser's location) put the visitor; null until they search.
  const [origin, setOrigin] = useState<SearchOrigin | null>(null);
  const originMarker = useRef<Marker | null>(null);
  const listNode = useRef<HTMLOListElement>(null);
  // Open or closed right now, worked out in the browser so the server markup never goes stale.
  const [status, setStatus] = useState<Record<string, OpenStatus>>({});
  const cardNodes = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    const update = () => {
      const now = new Date();

      setStatus(Object.fromEntries(showrooms.map((s) => [s.slug, openStatus(s.hours, now)])));
    };

    update();

    const timer = window.setInterval(update, 60_000);

    return () => window.clearInterval(timer);
  }, [showrooms]);

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
    if (container.parentElement) observer.observe(container.parentElement);

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

      // Belt and braces: measure again on the next frame and once the first tiles are in, in
      // case the box was still settling when the map was made.
      requestAnimationFrame(() => created.resize());
      created.once('idle', () => created.resize());

      created.addControl(new mapboxgl.AttributionControl({ compact: true }));
      created.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      const made = showrooms.map((showroom) => {
        const element = document.createElement('button');

        element.type = 'button';
        element.setAttribute('aria-label', `Show ${showroom.name} on the map`);
        element.className =
          'group/pin flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[var(--button-primary-background,#d90716)] text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/0.5)] transition-transform hover:scale-110 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 data-[active=true]:scale-125 data-[active=true]:ring-2 data-[active=true]:ring-[var(--button-primary-background,#d90716)] data-[active=true]:ring-offset-2';
        element.dataset.active = 'false';
        element.addEventListener('click', () => {
          setActive(showroom.slug);
          // Bring the matching card into view in the list (the list scrolls, not the page).
          cardNodes.current[showroom.slug]?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'auto'
              : 'smooth',
          });
        });

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

  // The visitor's point: a dark dot on the map, and the map framed on it and the nearest showroom.
  useEffect(() => {
    const map = mapRef.current;

    originMarker.current?.remove();
    originMarker.current = null;

    if (!origin) return;

    // The list has re-sorted nearest first; start it from the top.
    listNode.current?.scrollTo({ top: 0, left: 0 });

    if (!map) return;

    let cancelled = false;

    void import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (cancelled) return;

      const element = document.createElement('span');

      element.className =
        'block h-4 w-4 rounded-full border-[3px] border-white bg-foreground shadow-[0_0_0_2px_rgb(0_0_0/0.15)]';
      element.setAttribute('aria-hidden', 'true');

      originMarker.current = new mapboxgl.Marker({ element })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);

      const closest = rankByDistance(showrooms, origin)[0]?.item;

      if (!closest) return;

      const bounds = new mapboxgl.LngLatBounds()
        .extend([origin.lng, origin.lat])
        .extend([closest.coords.lng, closest.coords.lat]);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      map.fitBounds(bounds, {
        // Room for a pin above its point (and the zoom control) at the top.
        padding: {
          top: FIT_PADDING + 40,
          bottom: FIT_PADDING,
          left: FIT_PADDING,
          right: FIT_PADDING,
        },
        maxZoom: RESULT_MAX_ZOOM,
        duration: reducedMotion ? 0 : FLY_MS,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [origin, showrooms]);

  const locate = useCallback(
    (next: SearchOrigin) => {
      const closest = rankByDistance(showrooms, next)[0]?.item;

      setOrigin(next);
      if (closest) setActive(closest.slug);
    },
    [showrooms],
  );

  const reset = useCallback(() => {
    setOrigin(null);
    setActive(null);

    const map = mapRef.current;

    if (!map) return;

    void import('mapbox-gl').then(({ default: mapboxgl }) => {
      const bounds = new mapboxgl.LngLatBounds();

      showrooms.forEach((s) => bounds.extend([s.coords.lng, s.coords.lat]));
      map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration: 700 });
    });
  }, [showrooms]);

  const results = origin ? rankByDistance(showrooms, origin) : null;
  const nearest = results?.[0];
  const ranked: Array<{ item: Showroom; miles: number | undefined }> =
    results ?? showrooms.map((item) => ({ item, miles: undefined }));
  const chosen = showrooms.find((s) => s.slug === active);
  let announcement = '';

  if (nearest && origin) {
    announcement = `Nearest showroom to ${origin.label} is ${nearest.item.name}, ${formatMiles(nearest.miles)} away.`;
  } else if (chosen) {
    announcement = `Showing ${chosen.name} on the map.`;
  }

  return (
    <HomeSection description={description} id={id} kicker={kicker} title={title}>
      {/* Phones: search, then the map, then the list as a swipe row. From tablet width: search
          and list in the left column, the map the full height on the right. */}
      <div className="grid gap-4 @3xl:h-[36rem] @3xl:grid-cols-[23.5rem_1fr] @3xl:grid-rows-[auto_minmax(0,1fr)] @3xl:gap-5">
        <div className="@3xl:col-start-1 @3xl:row-start-1">
          <ZipSearch onLocate={locate} token={token} />
          {nearest && origin ? (
            <ResultsHeader
              farAway={nearest.miles > FAR_AWAY_MILES}
              onReset={reset}
              origin={origin}
            />
          ) : null}
        </div>
        {/* The map: 3:2 on phones; the full height beside the list from tablet width. */}
        <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-contrast-100 @3xl:col-start-2 @3xl:row-span-2 @3xl:row-start-1 @3xl:aspect-auto @3xl:h-full">
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
          aria-label={origin ? `Our showrooms, nearest to ${origin.label} first` : 'Our showrooms'}
          className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-3 overflow-x-auto px-6 pb-2 [overflow-anchor:none] @3xl:col-start-1 @3xl:row-start-2 @3xl:mx-0 @3xl:h-full @3xl:min-h-0 @3xl:flex-col @3xl:overflow-y-auto @3xl:px-0 @3xl:pb-0 @3xl:pr-4 @3xl:[scrollbar-gutter:stable]"
          ref={listNode}
        >
          {ranked.map(({ item: showroom, miles }) => {
            const isActive = showroom.slug === active;

            return (
              // The card selects on click, except on its links, which keep working as links.
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- the name is a button that does the same for keyboards
              <li
                className={clsx(
                  'w-[18rem] shrink-0 snap-start rounded-2xl border px-4 py-3.5 transition-colors @3xl:w-auto',
                  // Chosen: the deep brand red (#9F3632) with white copy, 6.9:1.
                  isActive
                    ? 'border-[#9f3632] bg-[#9f3632] text-white'
                    : 'border-[#fcb6bb] bg-white hover:border-[var(--button-primary-background,#d90716)]',
                )}
                data-active={isActive}
                key={showroom.slug}
                onClick={(event) => {
                  if (event.target instanceof Element && event.target.closest('a, button')) return;
                  setActive(showroom.slug);
                }}
                ref={(node) => {
                  cardNodes.current[showroom.slug] = node;
                }}
              >
                {/* Name (and distance, after a search) left; the open status right, dropping to its
                    own line in a narrow card. */}
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <h3 className="font-heading text-lg font-bold leading-tight">
                    <button
                      aria-pressed={isActive}
                      className={clsx(
                        'text-left focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-offset-2',
                        isActive
                          ? 'text-white focus-visible:ring-white focus-visible:ring-offset-[#9f3632]'
                          : 'text-[var(--button-primary-background,#d90716)] focus-visible:ring-[var(--button-primary-background,#d90716)]',
                      )}
                      onClick={() => setActive(showroom.slug)}
                      type="button"
                    >
                      {showroom.name}
                    </button>
                    {miles !== undefined && (
                      <span
                        className={clsx(
                          'ml-2 inline-block translate-y-[-2px] whitespace-nowrap rounded-full px-2 py-0.5 font-sans text-xs font-semibold tabular-nums',
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#fdf3f5] text-[var(--button-primary-background,#d90716)]',
                        )}
                      >
                        {formatMiles(miles)}
                      </span>
                    )}
                  </h3>
                  {Boolean(status[showroom.slug]) && (
                    <p
                      className={clsx(
                        'ml-auto flex items-start gap-1.5 whitespace-nowrap pt-1 text-right text-[11px] font-medium leading-tight',
                        isActive ? 'text-white/85' : 'text-contrast-500',
                      )}
                    >
                      <span
                        aria-hidden
                        className={clsx('mt-[3px] inline-block h-2 w-2 shrink-0 rounded-full', {
                          'bg-[#1a7f37]': status[showroom.slug]?.open && !isActive,
                          'bg-[#7ee2a0]': status[showroom.slug]?.open && isActive,
                          'bg-contrast-400': !status[showroom.slug]?.open && !isActive,
                          'bg-white/60': !status[showroom.slug]?.open && isActive,
                        })}
                      />
                      {status[showroom.slug]?.label}
                    </p>
                  )}
                </div>
                <ul
                  className={clsx(
                    'mt-2 space-y-1 text-[13px]',
                    isActive ? 'text-white/85' : 'text-contrast-500',
                  )}
                >
                  <li className="flex gap-2.5">
                    <MapPin
                      aria-hidden
                      className={clsx(
                        'mt-0.5 shrink-0',
                        isActive ? 'text-white/70' : 'text-contrast-400',
                      )}
                      size={15}
                    />
                    <span>{showroom.address}</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Phone
                      aria-hidden
                      className={clsx(
                        'mt-0.5 shrink-0',
                        isActive ? 'text-white/70' : 'text-contrast-400',
                      )}
                      size={15}
                    />
                    <a
                      className={isActive ? 'text-white' : 'text-foreground'}
                      href={`tel:${showroom.phone.replace(/\D/g, '')}`}
                    >
                      {showroom.phone}
                    </a>
                  </li>
                </ul>
                <div
                  className={clsx(
                    // Links sit plain; the site's growing underline (as on the breadcrumbs)
                    // appears on hover: red, or white on the red card.
                    'mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold',
                    isActive
                      ? 'text-white [--animated-underline-hover:white] [&_a:hover]:!text-white'
                      : 'text-foreground',
                  )}
                >
                  <a
                    className={clsx(animatedUnderlineClassName, 'pb-0.5')}
                    href={directionsHref(showroom.address)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Get directions
                  </a>
                  <Link
                    className={clsx(animatedUnderlineClassName, 'pb-0.5')}
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
        {announcement}
      </p>
    </HomeSection>
  );
}

// "Nearest to 06511 · New Haven, CT" above the ranked list, with a way back to all six, and a
// line for ZIPs outside our area that points at what we can still do for them.
function ResultsHeader({
  origin,
  farAway,
  onReset,
}: {
  origin: SearchOrigin;
  farAway: boolean;
  onReset: () => void;
}) {
  return (
    <div className="mt-3 rounded-2xl bg-[#fdf3f5] px-4 py-3 text-[13px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-foreground">
          <span className="font-semibold">Nearest to {origin.label}</span>
          {origin.place ? <span className="text-contrast-500"> · {origin.place}</span> : null}
        </p>
        <button
          className={clsx(
            animatedUnderlineClassName,
            'pb-0.5 font-semibold text-[var(--button-primary-background,#d90716)] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2',
          )}
          onClick={onReset}
          type="button"
        >
          Show all six
        </button>
      </div>
      {farAway ? (
        <p className="mt-1.5 text-contrast-500">
          Our showrooms are all in Connecticut. We ship cabinets to the 48 states, and a designer
          can price your kitchen on a{' '}
          <Link
            className="font-semibold text-foreground underline underline-offset-2"
            href="/mykitchen/free-design-consult"
          >
            video call
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
