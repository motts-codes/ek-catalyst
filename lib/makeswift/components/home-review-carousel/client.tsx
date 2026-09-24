'use client';

import { ReviewCarousel } from '@/vibes/soul/sections/review-carousel';
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
}

export function MSReviewCarousel({
  className,
  title,
  summary,
  reviews,
  actionLabel,
  actionLink,
  tint,
}: Props) {
  return (
    <ReviewCarousel
      action={actionLabel ? { label: actionLabel, href: actionLink?.href ?? '#' } : undefined}
      className={className}
      reviews={
        reviews.length > 0
          ? reviews.map((review) => ({
              ...review,
              stars: Math.min(5, Math.max(1, Math.round(review.stars))),
            }))
          : HOME_REVIEWS
      }
      summary={summary}
      tint={tint}
      title={title}
    />
  );
}
