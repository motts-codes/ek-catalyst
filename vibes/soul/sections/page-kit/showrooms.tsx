import { Clock, Mail, MapPin, Phone, User } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { directionsHref, type Showroom, showroomHref } from '~/lib/pages/showrooms';

// One card per showroom: photo, name, address with directions, hours, phone and the Project
// Manager, with a link to the showroom's own page.
export function ShowroomCards({
  showrooms,
  title,
  description,
  bookHref,
  tint,
}: {
  showrooms: Showroom[];
  title?: string;
  description?: string;
  bookHref: string;
  tint?: boolean;
}) {
  return (
    <HomeSection description={description} id="locations" tint={tint} title={title}>
      <ul className="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
        {showrooms.map((showroom) => (
          <li
            // Same lift-and-shadow hover as the category tiles, with a slow zoom on the photo.
            className="group flex flex-col overflow-hidden rounded-3xl border border-contrast-100 bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]"
            key={showroom.slug}
          >
            <div className="relative aspect-[16/9] bg-contrast-100">
              <Image
                alt={showroom.image.alt}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                fill
                sizes="(min-width: 64rem) 33vw, (min-width: 36rem) 50vw, 100vw"
                src={showroom.image.src}
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-heading text-xl font-bold leading-tight">
                {showroom.name}
                {showroom.outlet != null && (
                  <span className="ml-2 rounded-full bg-[#fbe7e7] px-2.5 py-0.5 align-middle text-[11px] font-semibold uppercase tracking-wide text-[#96050f]">
                    Factory outlet
                  </span>
                )}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-contrast-500">
                <li className="flex gap-3">
                  <MapPin aria-hidden className="mt-0.5 shrink-0 text-contrast-400" size={16} />
                  <span>
                    <span className="sr-only">Address: </span>
                    {showroom.address}
                    <br />
                    <a
                      className="font-semibold text-foreground underline underline-offset-4"
                      href={directionsHref(showroom.address)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Get directions
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Clock aria-hidden className="mt-0.5 shrink-0 text-contrast-400" size={16} />
                  <span>
                    <span className="sr-only">Hours: </span>
                    {showroom.hours.map((h) => (
                      <span className="block" key={h.days}>
                        {h.days}: {h.time}
                      </span>
                    ))}
                  </span>
                </li>
                <li className="flex gap-3">
                  <Phone aria-hidden className="mt-0.5 shrink-0 text-contrast-400" size={16} />
                  <span>
                    <span className="sr-only">Phone: </span>
                    <a
                      className="text-foreground"
                      href={`tel:${showroom.phone.replace(/\D/g, '')}`}
                    >
                      {showroom.phone}
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <User aria-hidden className="mt-0.5 shrink-0 text-contrast-400" size={16} />
                  <span>
                    <span className="sr-only">Project Manager: </span>
                    {showroom.pm.name}
                  </span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-2.5 pt-1">
                <ButtonLink
                  href={showroomHref(showroom.slug)}
                  shape="pill"
                  size="small"
                  variant="secondary"
                >
                  Visit the showroom page
                </ButtonLink>
                <ButtonLink
                  href={`${bookHref}?showroom=${showroom.slug}`}
                  shape="pill"
                  size="small"
                  variant="primary"
                >
                  Book a visit
                </ButtonLink>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

// The Project Manager panel on a showroom page: portrait, their words, how they work.
export function ProjectManagerPanel({
  showroom,
  bookHref,
}: {
  showroom: Showroom;
  bookHref: string;
}) {
  const { pm } = showroom;
  const firstName = pm.name.startsWith('[') ? 'your Project Manager' : pm.name.split(' ')[0];

  return (
    <HomeSection kicker="Your Project Manager" title={`Meet ${pm.name}`}>
      <div className="grid gap-8 @3xl:grid-cols-[1fr_1.4fr] @3xl:gap-14">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-contrast-100">
            <MediaPlaceholder label={`${pm.name}, in the showroom`} />
          </div>
          <p className="mt-4 text-sm text-contrast-500">{pm.role}</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {Boolean(pm.phone) && (
              <li className="flex items-center gap-2">
                <Phone aria-hidden className="text-contrast-400" size={15} />
                <a href={`tel:${(pm.phone ?? '').replace(/\D/g, '')}`}>{pm.phone}</a>
              </li>
            )}
            {Boolean(pm.email) && (
              <li className="flex items-center gap-2">
                <Mail aria-hidden className="text-contrast-400" size={15} />
                <a className="break-all" href={`mailto:${pm.email}`}>
                  {pm.email}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          {Boolean(pm.intro) && (
            <p className="font-heading text-xl font-semibold leading-snug @xl:text-2xl">
              {pm.intro}
            </p>
          )}
          {Boolean(pm.bio) && (
            <p className="mt-4 text-sm leading-relaxed text-contrast-500 @xl:text-base">{pm.bio}</p>
          )}
          {pm.steps != null && pm.steps.length > 0 && (
            <ol className="mt-7 space-y-4">
              {pm.steps.map((step, index) => (
                <li className="flex gap-4" key={step.title}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-contrast-500">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {Boolean(pm.offDuty) && (
            <p className="mt-6 text-sm italic leading-relaxed text-contrast-500">{pm.offDuty}</p>
          )}
          <div className="mt-8">
            <ButtonLink href={bookHref} shape="pill" size="small" variant="primary">
              Plan your kitchen with {firstName}
            </ButtonLink>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}

// Address, hours, phone and parking for a showroom page, plus the towns it serves.
export function ShowroomDetails({ showroom }: { showroom: Showroom }) {
  return (
    <HomeSection compact tint>
      <div className="grid gap-5 @xl:grid-cols-2 @4xl:grid-cols-4">
        <Detail icon={<MapPin aria-hidden size={18} />} title="Where to find us">
          <p>{showroom.address}</p>
          <a
            className="mt-2 inline-block font-semibold text-foreground underline underline-offset-4"
            href={directionsHref(showroom.address)}
            rel="noreferrer"
            target="_blank"
          >
            Get directions
          </a>
          {Boolean(showroom.parking) && <p className="mt-2">{showroom.parking}</p>}
        </Detail>
        <Detail icon={<Clock aria-hidden size={18} />} title="Showroom hours">
          {showroom.hours.map((h) => (
            <p key={h.days}>
              {h.days}: {h.time}
            </p>
          ))}
        </Detail>
        <Detail icon={<Phone aria-hidden size={18} />} title="Call or text">
          <a
            className="font-semibold text-foreground"
            href={`tel:${showroom.phone.replace(/\D/g, '')}`}
          >
            {showroom.phone}
          </a>
          <p className="mt-1">
            Or the main line, 24/7:{' '}
            <a
              className="font-semibold text-foreground underline underline-offset-4"
              href="tel:+18602471000"
            >
              860-247-1000
            </a>
          </p>
        </Detail>
        {showroom.outlet ? (
          <Detail icon={<Clock aria-hidden size={18} />} title={showroom.outlet.name}>
            {showroom.outlet.hours.map((h) => (
              <p key={h.days}>
                {h.days}: {h.time}
              </p>
            ))}
            <p className="mt-1">{showroom.outlet.phone}</p>
          </Detail>
        ) : (
          <Detail icon={<MapPin aria-hidden size={18} />} title="Serving">
            <p>{showroom.towns.join(', ')}</p>
          </Detail>
        )}
      </div>
    </HomeSection>
  );
}

function Detail({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-contrast-100 bg-white p-5">
      <p className="flex items-center gap-2 font-semibold">
        <span className="text-[var(--button-primary-background,#d90716)]">{icon}</span>
        {title}
      </p>
      <div className="mt-3 text-sm leading-relaxed text-contrast-500">{children}</div>
    </div>
  );
}

// Nearby showrooms strip (the other five).
export function OtherShowrooms({ showrooms }: { showrooms: Showroom[] }) {
  return (
    <HomeSection compact title="Nearer to you?">
      <ul className="flex flex-wrap gap-2.5">
        {showrooms.map((s) => (
          <li key={s.slug}>
            <Link
              className="inline-flex items-center rounded-full border border-contrast-200 bg-white px-4 py-2 text-sm font-medium text-contrast-500 transition-colors hover:border-foreground hover:text-foreground"
              href={showroomHref(s.slug)}
            >
              {s.name}
              {s.outlet != null && (
                <span className="ml-1.5 text-[11px] text-contrast-400">· factory outlet</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
