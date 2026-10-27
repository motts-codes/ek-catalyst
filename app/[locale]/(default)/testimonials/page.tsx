import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { VideoGrid } from '@/vibes/soul/sections/page-kit/media';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';
import type { Video } from '~/lib/pages/projects';

export const metadata: Metadata = {
  title: 'Video Testimonials',
  description:
    'Real customers, filmed in the kitchens we built for them. No script: what they wanted, what they worried about and how it turned out.',
};

// The featured film is EK's own "Happiness is crafted" (self-hosted, Oct 2026); the rest are
// EK's YouTube testimonials. Names and towns are as the video titles give them.
const FEATURED = {
  src: '/images/testimonials/happiness-is-crafted.mp4',
  poster: '/images/testimonials/happiness-is-crafted-poster.jpg',
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
          { label: 'Inspiration', href: '/inspiration/best-sellers' },
          { label: 'Testimonials', href: '/testimonials' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Watch the featured film', href: '#featured', primary: true },
          { label: 'Read written reviews', href: '/reviews', style: 'outline' },
        ]}
        description="We asked customers to tell their story on camera, in the kitchens we built for them, with no script. What they wanted, what they worried about before they ordered, and how it turned out. If you're weighing the same decision, these are the people to hear from."
        image={{
          src: '/images/pages/testimonials/hero-couple-floor.jpg',
          alt: 'A couple sitting on the floor of their white kitchen, laughing with mugs of tea',
        }}
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
        <div className="mx-auto aspect-[1200/626] w-full max-w-4xl overflow-hidden rounded-3xl bg-black shadow-[0_24px_48px_-28px_rgb(0_0_0/0.3)]">
          {/* Captions still to come: the film has speech, so WCAG 1.2.2 needs a track. */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- caption file pending from EK */}
          <video
            className="h-full w-full"
            controls
            playsInline
            poster={FEATURED.poster}
            preload="metadata"
            title={FEATURED.title}
          >
            <source src={FEATURED.src} type="video/mp4" />
          </video>
        </div>
      </HomeSection>
      <VideoGrid columns={3} title="More stories" videos={VIDEOS} />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
