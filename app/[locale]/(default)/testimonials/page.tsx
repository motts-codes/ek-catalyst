import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ReviewGrid, VideoGrid } from '@/vibes/soul/sections/page-kit/media';
import { FREE_DESIGN_HREF, HOME_REVIEWS, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Video Testimonials',
  description:
    'Real customers, filmed in the kitchens we built for them. No script: what they wanted, what they worried about and how it turned out.',
};

const VIDEOS = [
  {
    title: '“We built it ourselves over a weekend.”',
    meta: '[Name] · Orange · full kitchen · RTA',
    duration: '1:45',
  },
  {
    title: '“Shopped three places. Nobody was close on price.”',
    meta: '[Name] · New London · cabinets only',
    duration: '1:20',
  },
  {
    title: '“Changed my mind twice. Dan just went with it.”',
    meta: '[Name] · Brookfield · full kitchen · assembled',
    duration: '2:05',
  },
  {
    title: '“Everything was in stock. Two weeks, like they said.”',
    meta: '[Name] · Stamford · kitchen and bath',
    duration: '1:50',
  },
  {
    title: '“I do six kitchens a month from here.”',
    meta: '[Name], contractor · Newington · trade account',
    duration: '1:30',
  },
  { title: '“Six parts, one afternoon.”', meta: '[Name] · Bristol · closets', duration: '1:10' },
];

export default async function Testimonials({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Inspiration', href: '/inspiration' },
          { label: 'Testimonials', href: '/testimonials' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Watch the featured film', href: '#featured', primary: true },
          { label: 'Read written reviews', href: '/reviews' },
        ]}
        description="We asked customers to tell their story on camera, in the kitchens we built for them, with no script. What they wanted, what they worried about before they ordered, and how it turned out. If you're weighing the same decision, these are the people to hear from."
        imageLabel="A customer in their finished kitchen, mid-sentence"
        kicker="Testimonials"
        title="In their own words, on camera"
      />
      <div id="featured" />
      <VideoGrid
        columns={3}
        description="“[One line pulled from the featured film — the sentence that sums it up.]” — [Name], [Town], CT"
        kicker="Featured"
        tint
        title="[Name], [Town] · full kitchen, Avon in white, assembled"
        videos={[
          {
            title: 'Featured — [Name], [Town]',
            meta: 'Full kitchen · Avon in white · assembled',
            duration: '2:10',
          },
        ]}
      />
      <VideoGrid columns={3} title="More stories" videos={VIDEOS} />
      <ReviewGrid
        action={{ label: 'Read all reviews', href: '/reviews' }}
        reviews={HOME_REVIEWS.slice(0, 3)}
        tint
        title="Written reviews"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
