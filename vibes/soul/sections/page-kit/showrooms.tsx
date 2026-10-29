import { clsx } from 'clsx';
import { CalendarDays, Clock, Mail, MapPin, Phone, Quote, User } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { OUTLINE_BUTTON } from '@/vibes/soul/sections/page-kit';
import { StepsTimeline } from '@/vibes/soul/sections/page-kit/steps-timeline';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import {
  directionsHref,
  pmFirstName,
  type ProjectManager,
  type Showroom,
  showroomHref,
} from '~/lib/pages/showrooms';

// One card per showroom: photo, name, address with directions, hours, phone and the Project
// Manager, with a link to the showroom's own page.
export function ShowroomCards({
  showrooms,
  title,
  description,
  bookHref,
  tint,
  id = 'locations',
}: {
  showrooms: Showroom[];
  title?: string;
  description?: string;
  bookHref: string;
  tint?: boolean;
  id?: string;
}) {
  return (
    <HomeSection description={description} id={id} tint={tint} title={title}>
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
              <h3 className="font-heading text-xl font-bold leading-tight text-[var(--button-primary-background,#d90716)]">
                {showroom.name}
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
                    <span className="sr-only">
                      {showroom.secondPm ? 'Project Managers: ' : 'Project Manager: '}
                    </span>
                    {[showroom.pm, showroom.secondPm]
                      .filter(Boolean)
                      .map((pm) => pm?.name)
                      .join(' and ')}
                  </span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-2.5 pt-1">
                <ButtonLink
                  href={`${bookHref}?showroom=${showroom.slug}`}
                  shape="pill"
                  size="small"
                  variant="primary"
                >
                  Book a visit
                </ButtonLink>
                <ButtonLink
                  className={OUTLINE_BUTTON}
                  href={showroomHref(showroom.slug)}
                  shape="pill"
                  size="small"
                  variant="ghost"
                >
                  Visit the showroom page
                </ButtonLink>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

// The Project Manager panel on a showroom page: a dark card (portrait, name, the booking button,
// email / hours / address) beside their words and how they work.
export function ProjectManagerPanel({
  showroom,
  bookHref,
}: {
  showroom: Showroom;
  bookHref: string;
}) {
  const { pm } = showroom;
  const firstName = pmFirstName(pm);
  const team = [pm, showroom.secondPm].filter((p): p is ProjectManager => p != null);

  return (
    <HomeSection
      kicker={team.length > 1 ? 'Your Project Managers' : 'Your Project Manager'}
      title={`Meet ${team.map((member) => member.name).join(' and ')}`}
    >
      <div
        className={clsx(
          'grid gap-8 @3xl:items-stretch @3xl:gap-14',
          // On desktop the cards share the height of the copy beside them: the photo gives way.
          team.length > 1
            ? '@3xl:grid-cols-[1fr_1fr_1.2fr] @3xl:gap-8'
            : '@3xl:grid-cols-[1fr_1.4fr]',
        )}
      >
        {team.map((member) => (
          <ProjectManagerCard
            bookHref={bookHref}
            key={member.name}
            pm={member}
            showroom={showroom}
          />
        ))}
        <div>
          {Boolean(pm.intro) && (
            <p className="font-heading text-xl font-semibold leading-snug @xl:text-2xl">
              {pm.intro}
            </p>
          )}
          {Boolean(pm.bio) && (
            <p className="mt-4 text-sm leading-relaxed text-contrast-500 @xl:text-base">{pm.bio}</p>
          )}
          {!pm.intro && !pm.bio && (
            <p className="font-heading text-xl font-semibold leading-snug @xl:text-2xl">
              {firstName} will walk you through our kitchens, go through yours with you, and price
              it while you're here. Free, and walk-ins are welcome.
            </p>
          )}
          {pm.steps != null && pm.steps.length > 0 && (
            <StepsTimeline className="mt-8" steps={pm.steps} />
          )}
          {Boolean(pm.offDuty) && (
            <figure className="mt-8 flex gap-3">
              <Quote
                aria-hidden
                className="mt-0.5 shrink-0 -scale-x-100 text-[var(--button-primary-background,#d90716)]"
                fill="currentColor"
                size={22}
                strokeWidth={0}
              />
              <blockquote className="font-heading text-base italic leading-relaxed text-foreground @xl:text-lg">
                {pm.offDuty}
              </blockquote>
            </figure>
          )}
        </div>
      </div>
    </HomeSection>
  );
}

// The dark card: square portrait with the team badge, name and role, a full-width booking
// button, then email and direct line. On desktop those unfold over the foot of the photo when
// the card is hovered or anything in it has focus; on phones they sit under the button.
function ProjectManagerCard({
  pm,
  showroom,
  bookHref,
}: {
  pm: ProjectManager;
  showroom: Showroom;
  bookHref: string;
}) {
  const firstName = pmFirstName(pm);

  return (
    <div className="group/card flex flex-col overflow-hidden rounded-3xl bg-[#151515] text-white @3xl:h-full @3xl:min-h-0">
      <div className="relative aspect-square overflow-hidden bg-contrast-100 @3xl:aspect-auto @3xl:min-h-[16rem] @3xl:flex-1">
        {pm.photo ? (
          <Image
            alt={pm.photo.alt}
            className="object-cover object-[center_20%]"
            fill
            sizes="(min-width: 56rem) 33vw, 100vw"
            src={pm.photo.src}
          />
        ) : (
          <MediaPlaceholder label={`${pm.name}, in the showroom`} />
        )}
        <span className="absolute bottom-4 left-4 rounded-lg bg-[var(--button-primary-background,#d90716)] px-3.5 py-1.5 text-sm font-semibold">
          {showroom.name} Team
        </span>
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-[#151515]/90 p-5 opacity-0 backdrop-blur-sm transition-[transform,opacity] duration-300 ease-out group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100 @3xl:block motion-reduce:transition-none">
          <ContactRows pm={pm} />
        </div>
      </div>
      <div className="p-6 @xl:p-7">
        <h3 className="font-heading text-2xl font-bold leading-tight">{pm.name}</h3>
        <p className="mt-1.5 flex items-center gap-2 text-sm text-white/70">
          <span
            aria-hidden
            className="inline-block h-0.5 w-4 bg-[var(--button-primary-background,#d90716)]"
          />
          {pm.role}
        </p>
        <Link
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--button-primary-background,#d90716)] px-5 text-base font-semibold text-white transition-colors hover:bg-[#b8050f] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#151515]"
          href={bookHref}
        >
          <CalendarDays aria-hidden size={18} strokeWidth={2} />
          Book with {firstName}
        </Link>
        <div className="mt-4 rounded-2xl bg-white/[0.07] p-5 @3xl:hidden">
          <ContactRows pm={pm} />
        </div>
      </div>
    </div>
  );
}

function ContactRows({ pm }: { pm: ProjectManager }) {
  return (
    <dl className="space-y-4">
      {Boolean(pm.email) && (
        <CardRow icon={<Mail aria-hidden size={15} />} label="Email">
          <a
            className="break-all text-[#fcb6bb] underline-offset-4 hover:underline"
            href={`mailto:${pm.email}`}
          >
            {pm.email}
          </a>
        </CardRow>
      )}
      {Boolean(pm.phone) && (
        <CardRow icon={<Phone aria-hidden size={15} />} label="Direct line">
          <a
            className="underline-offset-4 hover:underline"
            href={`tel:${(pm.phone ?? '').replace(/\D/g, '')}`}
          >
            {pm.phone}
          </a>
        </CardRow>
      )}
    </dl>
  );
}

function CardRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
        <span className="text-[var(--button-primary-background,#d90716)]">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 pl-8 text-[15px] leading-snug">{children}</dd>
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
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
