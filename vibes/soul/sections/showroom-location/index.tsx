'use client';

import 'mapbox-gl/dist/mapbox-gl.css';

import { clsx } from 'clsx';
import { Clock, ExternalLink, MapPin } from 'lucide-react';
import type { Map as MapboxMap, Marker } from 'mapbox-gl';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import {
  easternDay,
  mapsHref,
  openStatus,
  type Showroom,
  weeklyHours,
} from '~/lib/pages/showrooms';

interface Props {
  showroom: Showroom;
  /** A Mapbox public token. Without one the map box shows a placeholder. */
  token?: string;
  id?: string;
}

const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';
const ZOOM = 13.5;

const telHref = (phone: string) => `tel:${phone.replace(/\D/g, '')}`;

// The showroom's address, hours and map in three boxes at the foot of its page: contact on the
// deep red, hours on the cream (today's row marked, "Open now" while it is), and a Mapbox
// map with one pin and an "Open in Maps" card that opens the showroom's place in Google Maps.
export function ShowroomLocation({ showroom, token, id = 'location' }: Props) {
  return (
    <HomeSection id={id}>
      <div className="grid gap-5 @3xl:grid-cols-3">
        <Box icon={<MapPin aria-hidden size={18} />} title="Location & contact" tone="red">
          <Rows
            onRed
            rows={[
              ['Address', showroom.address],
              [
                'Phone',
                <a
                  className="font-semibold text-white underline-offset-4 hover:underline"
                  href={telHref(showroom.phone)}
                  key="phone"
                >
                  {showroom.phone}
                </a>,
              ],
              ['Parking', showroom.parking ?? 'Free parking by the door.'],
              ['Walk-ins', 'Always welcome. No appointment needed.'],
            ]}
          />
        </Box>
        <Box icon={<Clock aria-hidden size={18} />} title="Showroom hours" tone="light">
          <HoursTable showroom={showroom} />
          {showroom.outlet && (
            <p className="mt-4 text-xs leading-relaxed text-contrast-500">
              {showroom.outlet.name}:{' '}
              {showroom.outlet.hours.map((h) => `${h.days} ${h.time}`).join(', ')}. Call{' '}
              {showroom.outlet.phone}. Not a showroom: price match and financing aren't available at
              the outlet.
            </p>
          )}
        </Box>
        <ShowroomMap showroom={showroom} token={token} />
      </div>
    </HomeSection>
  );
}

function Box({
  tone,
  icon,
  title,
  children,
}: {
  tone: 'red' | 'light';
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  const red = tone === 'red';

  return (
    <div
      className={clsx(
        'rounded-3xl p-6 @xl:p-7',
        red ? 'bg-[#9f3632] text-white' : 'bg-[#f6ebd6] text-foreground',
      )}
    >
      <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
        <span
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            red
              ? 'bg-white/15 text-white'
              : 'bg-white text-[var(--button-primary-background,#d90716)]',
          )}
        >
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

// Label / value rows with a hairline between them.
function Rows({ rows, onRed = false }: { rows: Array<[string, ReactNode]>; onRed?: boolean }) {
  return (
    <dl className="text-sm">
      {rows.map(([label, value]) => (
        <div
          className={clsx(
            'grid grid-cols-[5.5rem_1fr] gap-3 border-b py-3 first:pt-0 last:border-b-0 last:pb-0',
            onRed ? 'border-white/20' : 'border-[#1a1a1a]/10',
          )}
          key={label}
        >
          <dt className="font-semibold">{label}</dt>
          <dd className={clsx('leading-relaxed', onRed ? 'text-white/85' : 'text-[#404040]')}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Seven rows, Monday first. Today is marked once the page is on the client (the day depends on
// the clock in Connecticut, so the server renders no mark and the browser adds it).
function HoursTable({ showroom }: { showroom: Showroom }) {
  const [today, setToday] = useState<{ day: number; open: boolean } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();

      setToday({ day: easternDay(now), open: openStatus(showroom.hours, now).open });
    };

    update();

    const timer = window.setInterval(update, 60_000);

    return () => window.clearInterval(timer);
  }, [showroom.hours]);

  const days = weeklyHours(showroom.hours);

  return (
    <dl className="text-sm">
      {days.map((row, index) => {
        // weeklyHours is Monday-first; the clock's weekday index is Sunday-first.
        const isToday = (index + 1) % 7 === today?.day;
        const openNow = today != null && isToday && today.open;

        return (
          <div
            className={clsx(
              'flex items-center justify-between gap-3 border-b border-[#1a1a1a]/10 py-2.5 first:pt-0 last:border-b-0 last:pb-0',
              openNow && 'font-semibold text-[#15692e]',
              isToday && !openNow && 'font-semibold',
            )}
            key={row.day}
          >
            <dt className="flex items-center gap-2">
              {row.day}
              {isToday && (
                <span
                  className={clsx(
                    'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                    openNow
                      ? 'border-[#15692e]/30 bg-white text-[#15692e]'
                      : 'border-contrast-200 bg-white text-contrast-500',
                  )}
                >
                  {openNow ? 'Open now' : 'Today'}
                </span>
              )}
            </dt>
            <dd className={clsx(!isToday && 'text-[#404040]')}>{row.label}</dd>
          </div>
        );
      })}
    </dl>
  );
}

// One pin on a light map, with the showroom's name and address in a card and a link to it in
// Google Maps.
function ShowroomMap({ showroom, token }: { showroom: Showroom; token?: string }) {
  const mapNode = useRef<HTMLDivElement>(null);
  const [pin, setPin] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mapNode.current;

    if (!token || !container) return;

    let map: MapboxMap | undefined;
    let marker: Marker | undefined;
    let cancelled = false;
    const observer = new ResizeObserver(() => map?.resize());

    observer.observe(container);
    if (container.parentElement) observer.observe(container.parentElement);

    void import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (cancelled) return;

      mapboxgl.accessToken = token;

      const created = new mapboxgl.Map({
        container,
        style: MAP_STYLE,
        center: [showroom.coords.lng, showroom.coords.lat],
        zoom: ZOOM,
        attributionControl: false,
        cooperativeGestures: true,
      });

      map = created;
      // The address card sits top-left over the map, so the pin is pushed below it.
      created.setPadding({ top: 150, left: 0, right: 0, bottom: 0 });
      created.jumpTo({ center: [showroom.coords.lng, showroom.coords.lat] });
      requestAnimationFrame(() => created.resize());
      created.once('idle', () => created.resize());
      created.addControl(new mapboxgl.AttributionControl({ compact: true }));
      created.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

      const element = document.createElement('div');

      element.className =
        'flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[var(--button-primary-background,#d90716)] text-white shadow-[0_6px_16px_-6px_rgb(0_0_0/0.5)]';
      element.setAttribute('aria-label', `Express Kitchens ${showroom.name}`);

      marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
        .setLngLat([showroom.coords.lng, showroom.coords.lat])
        .addTo(created);

      setPin(element);
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      marker?.remove();
      map?.remove();
    };
  }, [token, showroom]);

  return (
    <div className="relative min-h-[20rem] overflow-hidden rounded-3xl bg-contrast-100">
      {token ? (
        <div className="!absolute inset-0" ref={mapNode} />
      ) : (
        <MediaPlaceholder className="absolute inset-0" label={`Map: ${showroom.name}`} />
      )}
      {pin != null && createPortal(<MapPin aria-hidden size={20} strokeWidth={2.25} />, pin)}
      <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-2xl bg-white p-4 text-sm shadow-[0_12px_32px_-16px_rgb(0_0_0/0.35)]">
        <p className="font-heading text-base font-bold leading-tight">
          Express Kitchens: {showroom.name}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-[#404040]">{showroom.address}</p>
        <a
          className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-[var(--button-primary-background,#d90716)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#9f3632] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
          href={mapsHref(showroom.address)}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden size={14} strokeWidth={2.25} />
          Open in Maps
        </a>
      </div>
    </div>
  );
}
