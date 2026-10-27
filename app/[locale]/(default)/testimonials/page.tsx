import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ReviewGrid, VideoGrid } from '@/vibes/soul/sections/page-kit/media';
import { FREE_DESIGN_HREF, HOME_REVIEWS, SHOWROOMS } from '~/lib/home/home-content';
import type { Video } from '~/lib/pages/projects';

export const metadata: Metadata = {
  title: 'Video Testimonials',
  description:
    'Real customers, filmed in the kitchens we built for them. No script: what they wanted, what they worried about and how it turned out.',
};

// EK's YouTube testimonials (Oct 2026). Names and towns are as the video titles give them.
const FEATURED = {
  youtubeId: '4ec_4LOe35s',
  title: 'Express Kitchens customers share their stories',
};

const VIDEOS: Video[] = [
  { youtubeId: 'OiWm6wUUNVk', title: 'Lisa McAndrews', meta: 'Madison, CT' },
  { youtubeId: 'mmx59J3k_yA', title: 'Karen & Gene Ballone', meta: 'Stratford, CT' },
  { youtubeId: 'Z5GYxli0jCU', title: 'Patrick Lacovino', meta: 'Waterbury, CT' },
  { youtubeId: 'FTHO4LIvgEU', title: 'Rui Carvalho', meta: 'New Hartford, CT' },
  { youtubeId: 'IvTY7_4KPQw', title: 'Oksana Chernata', meta: 'Stratford, CT' },
  { youtubeId: 'QJ_7iOLzNFI', title: 'Irene & Steve Dacosta', meta: 'Newington, CT' },
  { youtubeId: 'lVNoZ8CWOO0', title: 'David & Kathy Sokolowski', meta: 'Danbury, CT' },
  { youtubeId: '4JU0mLgvrN4', title: 'Bill & Judy Zimmerman', meta: 'Express Kitchens customers' },
  { youtubeId: 'Rmlrs6jq_Dw', title: 'Dawyn Cloud-Alter', meta: 'Bethlehem, CT' },
  { youtubeId: 'jcdyZ02oB44', title: 'Tina Weldon', meta: 'Seymour, CT' },
  { youtubeId: 'SrZKgMT9pLk', title: 'Alexandria Wong', meta: 'Shelton, CT' },
  { youtubeId: 'wtitI8FFKUY', title: 'Carmelo Longo', meta: 'Terryville, CT' },
  { youtubeId: 'SCb0RsnUQKI', title: 'Suzanne Bennett', meta: 'Express Kitchens customer' },
  { youtubeId: 'vmdyG-5bVnU', title: 'Karen', meta: 'Express Kitchens customer' },
  { youtubeId: 'uCXCiFqh_XQ', title: 'Patricio', meta: 'Express Kitchens customer' },
  { youtubeId: '8_nWdtEefNU', title: 'Alliant Properties', meta: 'Property management' },
  {
    youtubeId: 'YbtxFCtUurY',
    title: 'The first customers at the Peabody showroom',
    meta: 'Peabody, MA',
  },
  { youtubeId: 'ul0WzjxQVHo', title: 'A happy client', meta: 'Express Kitchens customer' },
  { youtubeId: 'D4_T6gGPvxs', title: 'Another happy client', meta: 'Express Kitchens customer' },
  { youtubeId: '0y_GymgqACs', title: 'A client testimonial', meta: 'Express Kitchens customer' },
  { youtubeId: '3DQu5M7qalk', title: 'A client testimonial', meta: 'Express Kitchens customer' },
  { youtubeId: 'f0Gr4r2bu5k', title: 'A happy customer, new kitchen cabinets', meta: 'Short' },
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
        image={{
          src: '/images/pages/testimonials/customer-kitchen.jpg',
          alt: 'A homeowner at the counter of their finished white kitchen',
        }}
        imageLabel="A customer in their finished kitchen, mid-sentence"
        kicker="Testimonials"
        title="In their own words, on camera"
      />
      <HomeSection
        description="Customers from across Connecticut on what they wanted, what they worried about and how it turned out."
        id="featured"
        kicker="Featured"
        tint
        title={FEATURED.title}
      >
        <div className="mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-3xl bg-black shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]">
          <iframe
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            loading="lazy"
            src={`https://www.youtube-nocookie.com/embed/${FEATURED.youtubeId}?rel=0`}
            title={FEATURED.title}
          />
        </div>
      </HomeSection>
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
