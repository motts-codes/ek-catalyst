import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import {
  OtherShowrooms,
  ProjectManagerPanel,
  ShowroomDetails,
} from '@/vibes/soul/sections/page-kit/showrooms';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { FREE_DESIGN_HREF, HOME_REVIEWS, SAMPLES_HREF } from '~/lib/home/home-content';
import { getShowroom, SHOWROOMS } from '~/lib/pages/showrooms';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return SHOWROOMS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const showroom = getShowroom((await params).slug);

  if (!showroom) return {};

  return {
    title: `${showroom.name} Kitchen Showroom`,
    description: `Visit Express Kitchens in ${showroom.name}, Connecticut: ${showroom.address}. Full kitchens on display and free design help from a Project Manager.`,
  };
}

// One template for the six showrooms: where it is, when it's open, who you'll plan with, and
// the reviews from people who did.
export default async function ShowroomPage({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const showroom = getShowroom(slug);

  if (!showroom) return notFound();

  const reviews = HOME_REVIEWS.filter((r) => r.location === showroom.name);
  const others = SHOWROOMS.filter((s) => s.slug !== slug);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Showrooms', href: '/showrooms' },
          { label: showroom.name, href: `/showrooms/${slug}` },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Book a visit', href: FREE_DESIGN_HREF, primary: true },
          { label: 'Order a sample door', href: SAMPLES_HREF },
        ]}
        chips={[
          'Free design and quote',
          'Full kitchens on display',
          'Walk-ins welcome',
          ...(showroom.outlet ? ['Factory outlet on site'] : []),
        ]}
        description={`Whether you're starting with a photo you saved or a kitchen you've been living with for too long, this is the place to turn it into a plan. Walk through full-size kitchens, hold the doors and finishes in your hands, and sit down with ${showroom.pm.name.startsWith('[') ? 'our Project Manager' : showroom.pm.name}, who will design your layout and price it while you're here. Free, with no deposit and no obligation.`}
        imageLabel={`${showroom.name} showroom floor, wide`}
        kicker={`Express Kitchens · ${showroom.name}, Connecticut`}
        title={`Your kitchen starts in ${showroom.name}`}
      />
      <ShowroomDetails showroom={showroom} />
      <ProjectManagerPanel bookHref={FREE_DESIGN_HREF} showroom={showroom} />
      <Prose
        body={[
          `People come to us in ${showroom.name} from ${showroom.towns.slice(0, -1).join(', ')} and ${showroom.towns[showroom.towns.length - 1]}. If you're anywhere nearby, we're an easy visit, and if you'd rather we came to you, ask about an at-home appointment when you book.`,
        ]}
        kicker="Who we serve"
        tint
        title="Serving the towns around us"
      />
      {reviews.length > 0 && (
        <ReviewMarquee
          reviews={[...reviews, ...HOME_REVIEWS.filter((r) => r.location !== showroom.name)]}
          summary={`Starting with ${showroom.name}`}
          tint
          title="What it was like, in their words"
        />
      )}
      <OtherShowrooms showrooms={others} />
      <ClosingBand
        primary={{ label: 'Book a visit', href: FREE_DESIGN_HREF }}
        tint
        title={`Ready to plan your kitchen in ${showroom.name}?`}
      />
    </>
  );
}
