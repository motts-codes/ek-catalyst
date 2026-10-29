import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { MetricsTicker } from '@/vibes/soul/sections/why-us-scroll';
import { FREE_DESIGN_HREF, HOME_REVIEWS, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description:
    'Over 110 years, thousands of homeowners have planned, ordered and lived with Express Kitchens cabinets. What they say about our designers, delivery, prices and the cabinets themselves.',
};

const BEST_SELLERS = { label: 'See our best-selling kitchens', href: '/inspiration/best-sellers' };

export default async function Reviews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Inspiration', href: '/inspiration/best-sellers' },
          { label: 'Reviews', href: '/reviews' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Book a free design consult', href: FREE_DESIGN_HREF, primary: true },
          { ...BEST_SELLERS, style: 'outline' },
        ]}
        description="Over 110 years, thousands of homeowners have planned, ordered and lived with Express Kitchens cabinets. Here's what they say about our designers, delivery, prices and the cabinets themselves."
        image={{
          src: '/images/pages/reviews/hero-finished-kitchen.jpg',
          alt: 'A finished white kitchen with a grey island, rattan pendants and French doors open to the garden',
        }}
        kicker="Reviews"
        title="5,000+ reviews from people who've lived with our kitchens"
      />
      <MetricsTicker
        metrics={[
          { icon: 'star', value: '5,000+', label: 'Happy customer reviews' },
          { icon: 'package', value: '50,000+', label: 'Assembled cabinets, ready to ship' },
          { icon: 'design', value: '100K+', label: 'Kitchens designed' },
          { icon: 'pin', value: '6', label: 'Showrooms to visit' },
          { icon: 'shield', value: 'A+', label: 'BBB rating' },
        ]}
      />
      <ReviewMarquee reviews={HOME_REVIEWS} summary="4.5 · 360+ Google reviews" />
      <ClosingBand
        description="A designer will go through your kitchen with you, in a showroom or on a video call, and give you an itemized quote. Free, with no obligation to buy."
        primary={{ label: 'Book a free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Ready to start your kitchen?"
      />
    </>
  );
}
