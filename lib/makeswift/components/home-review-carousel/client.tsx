'use client';

import { ReviewCarousel } from '@/vibes/soul/sections/review-carousel';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { HOME_REVIEWS } from '~/lib/home/home-content';

interface Review {
  stars: number;
  quote: string;
  name: string;
  location: string;
  source: string;
}

interface Props {
  className: string;
  title: string;
  summary: string;
  reviews: Review[];
  actionLabel: string;
  actionLink?: { href?: string; target?: string };
  tint: boolean;
  layout: 'marquee' | 'carousel';
}

export function MSReviewCarousel({
  className,
  title,
  summary,
  reviews,
  actionLabel,
  actionLink,
  tint,
  layout,
}: Props) {
  const shared = {
    // No link set in Makeswift: the button goes to the reviews page, never to '#'.
    action: actionLabel ? { label: actionLabel, href: actionLink?.href ?? '/reviews' } : undefined,
    className,
    reviews:
      reviews.length > 0
        ? reviews.map((review) => ({
            ...review,
            stars: Math.min(5, Math.max(1, Math.round(review.stars))),
          }))
        : HOME_REVIEWS,
    summary,
    tint,
    title,
  };

  return layout === 'carousel' ? <ReviewCarousel {...shared} /> : <ReviewMarquee {...shared} />;
}
