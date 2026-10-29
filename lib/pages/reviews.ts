import { type SpotlightReview } from '@/vibes/soul/sections/review-spotlight';

// The five reviews from EK's assembled-cabinets landing page (expresskitchens.com/
// shop-assembled-cabinets-lp, Oct 2026), photos and all. The quotes are the page's excerpts.
export const SPOTLIGHT_REVIEWS: SpotlightReview[] = [
  {
    name: 'Elizabeth M.',
    stars: 5,
    headline: 'Exactly what I wanted!',
    quote:
      "I am so very pleased with Express Kitchen!! I can't say enough great things about Susan!! She is so kind and so very knowledgeable…",
    image: {
      src: '/images/pages/reviews/spotlight-elizabeth.jpg',
      alt: 'Elizabeth, smiling in her kitchen',
    },
  },
  {
    name: 'Lauren F.',
    stars: 5,
    headline: 'Collaboration was amazing',
    quote:
      "I had such a great experience. This being the first time I've ever done a kitchen remodel I appreciated Deb Wolak's ability…",
    image: { src: '/images/pages/reviews/spotlight-lauren.jpg', alt: 'Lauren, in her kitchen' },
  },
  {
    name: 'Brad',
    stars: 5,
    headline: 'Top-notch customer service',
    quote:
      'This was a great buying experience. Sharmin and Raffi are to be commended for their top-notch customer service…',
    image: {
      src: '/images/pages/reviews/spotlight-brad.jpg',
      alt: 'Brad, with his dog, in his kitchen',
    },
  },
  {
    name: 'Maria S.',
    stars: 5,
    headline: 'Dream kitchen delivered!',
    quote:
      'The whole process from design to delivery was seamless. The team made it so easy and stress-free. Absolutely love the result…',
    image: { src: '/images/pages/reviews/spotlight-maria.jpg', alt: 'Maria, in her kitchen' },
  },
  {
    name: 'James T.',
    stars: 5,
    headline: 'Worth every penny',
    quote:
      'Skeptical about ordering cabinets online, but Express Kitchens exceeded every expectation. Quality is truly outstanding…',
    image: { src: '/images/pages/reviews/spotlight-james.jpg', alt: 'James, in his kitchen' },
  },
];
