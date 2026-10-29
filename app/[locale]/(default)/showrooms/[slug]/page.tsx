import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CategoryHero } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { ShowroomStatusPill } from '@/vibes/soul/sections/page-kit/showroom-status-pill';
import { ProjectManagerPanel } from '@/vibes/soul/sections/page-kit/showrooms';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { SeoProse } from '@/vibes/soul/sections/seo-prose';
import { ShowroomLocation } from '@/vibes/soul/sections/showroom-location';
import { HOME_REVIEWS } from '~/lib/home/home-content';
import {
  directionsHref,
  getShowroom,
  pmFirstName,
  seoCopy,
  type Showroom,
  SHOWROOMS,
} from '~/lib/pages/showrooms';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return SHOWROOMS.map(({ slug }) => ({ slug }));
}

const telHref = (phone: string) => `tel:${phone.replace(/\D/g, '')}`;

// "Lanaisha", or "Chris or Ulrike" where a showroom has two Project Managers.
function pmNames(showroom: Showroom): string {
  const first = pmFirstName(showroom.pm);

  return showroom.secondPm ? `${first} or ${pmFirstName(showroom.secondPm)}` : first;
}

// "meet Project Manager Lanaisha Rodrigues" / "meet Project Managers Chris Jones and Ulrike
// Robinson", for the meta description.
function pmMeta(showroom: Showroom): string {
  if (showroom.pm.name.startsWith('[')) return 'meet our Project Managers';

  return showroom.secondPm
    ? `meet Project Managers ${showroom.pm.name} and ${showroom.secondPm.name}`
    : `meet Project Manager ${showroom.pm.name}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const showroom = getShowroom((await params).slug);

  if (!showroom) return {};

  const street = showroom.address.split(',')[0] ?? showroom.address;

  return {
    title: `Kitchen Cabinet Showroom in ${showroom.name}, CT`,
    description: `Visit Express Kitchens in ${showroom.name}, CT, at ${street}. See full kitchens, ${pmMeta(showroom)}, and get your kitchen priced. Walk-ins welcome.`,
  };
}

// One template for the six showrooms (Arun's brief of 29 Oct 2026, finalized on New London):
// who you'll plan with, reviews, a short FAQ, then where it is and when it's open.
export default async function ShowroomPage({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const showroom = getShowroom(slug);

  if (!showroom) return notFound();

  const bookHref = `/book?showroom=${showroom.slug}`;
  const who = pmNames(showroom);
  // The call button: the Project Manager's direct line, else the showroom's.
  const phone = showroom.pm.phone ?? showroom.phone;

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Showrooms', href: '/showrooms' },
          { label: showroom.name, href: `/showrooms/${slug}` },
        ]}
      />
      {/* The same deep-red panel as the Assembled listing: copy inside the box, the showroom
          photo on the right (Arun, Oct 29 2026). */}
      <CategoryHero
        actions={[
          { label: 'Book a visit', href: bookHref },
          { label: 'Get directions', href: directionsHref(showroom.address) },
        ]}
        description={`Walk through full kitchens, hold the doors, and sit down with ${who}, who'll go through your kitchen and price it while you're here. Free, and walk-ins are welcome.`}
        eyebrowSlot={<ShowroomStatusPill hours={showroom.hours} name={showroom.name} />}
        image={showroom.image}
        imageLabel={`${showroom.name} showroom floor, wide`}
        promises={[
          { icon: 'design', label: 'Free design consult' },
          { icon: 'door', label: 'Full kitchens on display' },
          { icon: 'walk', label: 'Walk-ins welcome' },
          ...(showroom.outlet
            ? [{ icon: 'store' as const, label: 'Factory Outlet here too' }]
            : []),
        ]}
        promisesLayout="row"
        tall
        title={`Your kitchen starts in ${showroom.name}`}
        tone="deep-red"
      />
      <ProjectManagerPanel bookHref={bookHref} showroom={showroom} />
      <ReviewMarquee
        action={{ label: 'Read all reviews', href: '/reviews' }}
        reviews={HOME_REVIEWS}
        summary="4.5 · 360+ Google reviews"
        tint
      />
      <CabinetFaq
        data={{
          headline: 'Before you visit',
          items: [
            {
              q: 'Do I need an appointment?',
              a: `No, walk-ins are welcome. Booking a visit means ${who} is ready for you.`,
            },
            {
              q: 'How long does a design consult take?',
              a: "About an hour. You'll leave with an itemized quote, priced RTA and assembled. Free, with no obligation.",
            },
            {
              q: 'Should I bring measurements?',
              a: 'Yes, if you have them. If not, we can measure your kitchen for $85 (CT and greater-CT zip codes).',
            },
            {
              q: "Can't make it in?",
              a: 'Book a video consult, 9 AM–5 PM ET, and get the same itemized quote.',
            },
          ],
        }}
      />
      <ShowroomLocation showroom={showroom} token={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} />
      <ClosingBand
        description={`Walk in any time, or book a visit with ${who}.`}
        phone={{ label: `Call ${phone}`, href: telHref(phone) }}
        primary={{ label: 'Book a visit', href: bookHref }}
        title={`Ready to plan your kitchen in ${showroom.name}?`}
      />
      <SeoProse {...seoCopy(showroom)} />
    </>
  );
}
