// Default (fallback) content for the home page bands, taken from the wireframe (Option B,
// "E-commerce first"). Each band on the home page is a Makeswift slot whose fallback renders this
// content, so the page is complete before marketing edits anything in the builder.
//
// `href: '#'` = page not built yet (see lib/navigation/menu-config.ts for the same convention).
// "[X]" figures from the wireframe have been replaced with neutral copy until numbers are supplied.

import { type RowCard } from '@/vibes/soul/sections/cards-row';
import { type CategoryTile } from '@/vibes/soul/sections/category-carousel';
import { type HeroOffer, type HeroSlide } from '@/vibes/soul/sections/home-hero-split';
import { type ProgramCard } from '@/vibes/soul/sections/program-cards';
import { type CustomerReview } from '@/vibes/soul/sections/review-carousel';
import { type Showroom } from '@/vibes/soul/sections/showroom-band';
import { type Metric } from '@/vibes/soul/sections/why-us-scroll';

export const FREE_DESIGN_HREF = '/mykitchen/free-design-consult';
export const SAMPLES_HREF = '/samples';

// The looping clip in the samples callout (home, consult, samples page).
export const SAMPLES_VIDEO = {
  webm: '/images/home/samples/samples.webm',
  mp4: '/images/home/samples/samples.mp4',
  poster: '/images/home/samples/samples-poster.jpg',
};
export const ESTIMATOR_HREF = '/mykitchen/price-my-kitchen';

// The scrolling proof strip shared by the Why EK and About pages.
export const EK_METRICS: Metric[] = [
  { icon: 'package', value: '50,000+', label: 'Assembled cabinets, ready to ship' },
  { icon: 'star', value: '5,000+', label: 'Happy customer reviews' },
  { icon: 'design', value: '100K+', label: 'Kitchens designed' },
  { icon: 'pin', value: '6', label: 'Showrooms to visit' },
  { icon: 'shield', value: 'A+', label: 'BBB rating' },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    title: 'A kitchen built\nright around you.',
    image: {
      src: '/images/home/hero/kitchen-built-around-you.webp',
      alt: 'A white shaker kitchen with a dark stone island, in evening light',
    },
    href: '/why-express-kitchens',
    ctaLabel: 'See how',
  },
  {
    title: 'Your kitchen,\ndesigned free.\nIn a showroom\nor online.',
    image: {
      src: '/images/home/hero/designed-free.webp',
      alt: 'A designer and a homeowner on a red sofa, choosing cabinet styles on a screen',
    },
    mobileImage: {
      src: '/images/home/hero/designed-free-mobile.webp',
      alt: 'A designer and a homeowner on a red sofa, choosing cabinet styles on a screen',
    },
    href: FREE_DESIGN_HREF,
    ctaLabel: 'Book free consult',
    // The photo's background is brand red, so the button is white. The scene sits centre-right;
    // keeping the left of the photo leaves the headline on plain red.
    ctaColor: 'white',
    imagePosition: 'left',
  },
  {
    title: 'Made in Connecticut.\nDelivered across the US.',
    image: {
      src: '/images/home/hero/made-in-connecticut.webp',
      alt: 'Robotic sprayers finishing navy cabinet doors on the factory line',
    },
    href: '/cabinets/assembled-cabinets',
    ctaLabel: 'Shop cabinets',
  },
];

// One stationary card beside the slides. Only the first entry is rendered (the right side no
// longer rotates), so keep this list to the live offer.
export const HERO_OFFERS: HeroOffer[] = [
  {
    kicker: 'Kitchens @$299/month',
    headline: 'FREE APPLIANCE\nwith every kitchen',
    description: '+ up to 4 Bonus gifts: Roll-out trays, organizers, handle, faucet',
    href: '/promotions',
    ctaLabel: 'View offer',
    image: {
      src: '/images/home/offers/free-appliance.webp',
      alt: 'A stainless-steel refrigerator and gas range, each tied with a red gift bow',
    },
  },
];

// One base list; the hook line under each category differs per audience (homeowner: choice and
// ease, pro: stock, price and speed). Photos and links are shared.
const tile = (file: string, alt: string) => ({ src: `/images/home/categories/${file}.webp`, alt });

const CATEGORY_BASE: Array<{
  name: string;
  href: string;
  homeowner: string;
  pro: string;
  image: { src: string; alt: string };
}> = [
  {
    name: 'Kitchen cabinets',
    href: '/cabinets',
    homeowner: '100+ styles, 30+ colors',
    pro: '50,000 in stock',
    image: tile(
      'cabinets',
      'White shaker base cabinets with black handles under a grey countertop',
    ),
  },
  {
    name: 'Closets',
    href: '/closets',
    homeowner: 'Newly launched',
    pro: 'Ships from stock',
    image: tile('closets', 'A white closet with hanging rail, shelves and a dressing table'),
  },
  {
    name: 'Windows',
    href: '/windows',
    homeowner: 'Best price, any size',
    pro: 'Factory-direct pricing',
    image: tile('windows', 'A double-hung window over a window seat'),
  },
  {
    name: 'Appliances',
    href: '/appliances',
    homeowner: 'Pick up in 2 days',
    pro: 'Priced below retail',
    image: tile('appliances', 'A stainless refrigerator and wall ovens in oak cabinets'),
  },
  {
    name: 'Handles',
    href: '/cabinet-hardware/handles-knobs',
    homeowner: 'Every finish we make doors in',
    pro: 'Ships next day',
    image: tile('handles', 'A drawer cabinet with brass pulls against white tile'),
  },
  {
    name: 'Countertops',
    href: '/countertops',
    homeowner: 'Granite from $49.99/sq ft',
    pro: 'Granite $49.99 · Quartz $59.99/sq ft',
    image: tile('countertops', 'A white quartz countertop on a green island'),
  },
  {
    name: 'Sinks & faucets',
    href: '/sinks-faucets',
    homeowner: 'Sized for our sink bases',
    pro: 'Ships in 2 days',
    image: tile('kitchen-sink', 'A farmhouse sink with a brass faucet'),
  },
  {
    name: 'Bath',
    href: '/bath',
    homeowner: 'Tops, sinks and faucets to match',
    pro: 'Ships in 2 days',
    image: tile(
      'bath-faucet-sink',
      'An oak vanity with a white top, black faucet and round mirror',
    ),
  },
  {
    name: 'Doors',
    href: '/doors',
    homeowner: 'In stock in Bristol',
    pro: 'Primed, ships in 2 days',
    image: tile('doors', 'A white interior door in a hallway'),
  },
  {
    name: 'Siding',
    href: '/siding',
    homeowner: 'New: quoted by the square',
    pro: 'Quote back in 24 hours',
    image: tile('siding', 'Grey clapboard siding on a house with a porch'),
  },
];

/** Homeowner home page tiles. */
export const CATEGORY_TILES: CategoryTile[] = CATEGORY_BASE.map(
  ({ name, href, homeowner, image }) => ({ name, href, subtitle: homeowner, image }),
);

/** Pro home page tiles ("Everything for the job"). */
export const PRO_CATEGORY_TILES: CategoryTile[] = CATEGORY_BASE.map(
  ({ name, href, pro, image }) => ({ name, href, subtitle: pro, image }),
);

export const PROGRAM_CARDS: ProgramCard[] = [
  {
    title: 'Assembled cabinets',
    tag: 'We build them',
    points: [
      'Arrives built and ready to hang. No parts to sort, no lost weekend',
      'Built and checked by our team in Connecticut',
      'Ships in 3 weeks',
    ],
    ctaLabel: 'Shop assembled',
    href: '/cabinets/assembled-cabinets',
    image: {
      src: '/images/home/programs/assembled.webp',
      alt: 'A finished kitchen in sage-green shaker cabinets with a white quartz island and black pendants',
    },
  },
  {
    title: 'RTA cabinets',
    tag: 'You build them',
    points: [
      'For you to put together or a contractor',
      'Same cabinet, lower price. You keep what assembly would cost',
      'Ships in two weeks, a week sooner than assembled',
    ],
    ctaLabel: 'Shop RTA',
    href: '/cabinets/rta-cabinets',
    image: {
      src: '/images/home/programs/rta.webp',
      alt: 'A kitchen in dark grey shaker cabinets',
    },
  },
];

export const PROGRAM_FOOTNOTE =
  'Every cabinet we sell is the same box, the same door and the same finish, built in Connecticut. The only choice is whether it arrives flat-packed for you to build, or already built.';

export const THREE_WAYS: RowCard[] = [
  {
    title: 'I want to picture it',
    description:
      'Try door styles and colours on a kitchen like yours, and swap them until it looks right.',
    ctaLabel: 'Visualize my kitchen',
    href: '/mykitchen/visualize-my-kitchen',
    image: {
      src: '/images/home/ways/visualizer.webp',
      alt: 'A homeowner holding a tablet up to her kitchen, trying sage-green doors on it',
    },
    imageLabel: 'A kitchen on a tablet, swapping door colours',
  },
  {
    title: 'I want a number',
    description:
      'Pick a shape, a line, a door style and a color, and see the 10×10 price. No email, no sales call.',
    ctaLabel: 'Price my kitchen',
    href: ESTIMATOR_HREF,
    image: {
      src: '/images/home/ways/estimator.webp',
      alt: 'A couple at their kitchen island, checking a price range on a phone',
    },
    imageLabel: 'Estimator on a phone',
  },
  {
    title: 'I want a person',
    description:
      'A designer plans your layout with you, in a showroom or on a video call. Free, with no obligation to buy.',
    ctaLabel: 'Book a free consult',
    href: FREE_DESIGN_HREF,
    primary: true,
    image: {
      src: '/images/home/ways/design-consult.webp',
      alt: 'A designer on a video call with a couple, their kitchen plan and door samples on her laptop',
    },
    imageLabel: 'Designer with a homeowner',
  },
];

// Real Google reviews, chosen for what they answer — the designer, the in-stock promise, the
// after-sale follow-up, no pressure, budget, the installer.
export const HOME_REVIEWS: CustomerReview[] = [
  {
    stars: 5,
    quote:
      'Jeremiah was extremely friendly and exceptionally patient. He helped us realize a different design than what we currently have. His layout was so much more functional, and he explained why he was suggesting the changes.',
    name: 'Scott B.',
    location: 'Newington',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'It was great to know everything was in stock and would be installed at once. The quality of the cabinets really exceeded my expectations.',
    name: 'Cari W.',
    location: 'Stamford',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'They stand by their products and provide excellent customer service. Frank even kept in touch after the completed project to make sure we were still happy with our new kitchen.',
    name: 'Debra E.',
    location: 'New London',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'No selling involved, just information for you to make your decision. For value I did shop 3 competitors and they were not close.',
    name: 'George M.',
    location: 'New London',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'Not only did we stay on budget, but we also got fantastic advice throughout. In a household with three young kids, having a new kitchen start to finish in just two weeks was a huge plus.',
    name: 'Rebecca C.',
    location: 'Orange',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'Dan in the Brookfield office is a saint. I completely changed my mind about the whole cabinet and countertop style two weeks after we put the plan together, and he just went with it.',
    name: 'Cathy D.',
    location: 'Brookfield',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'He was so quiet that my baby was able to sleep through install. Our kitchen came out beautiful.',
    name: 'Fay Lynn W.',
    location: 'Newington',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'Could not have been more pleased with our kitchen project from start to finish! Super clean and great communication. Thank you Omar for installing and Dan for designing.',
    name: 'Karen T.',
    location: 'Brookfield',
    source: 'Google',
  },
  {
    stars: 5,
    quote:
      'Reasonable price. A wonderful experience with Uli in New London. Very knowledgeable and worked at our own pace. Great value!',
    name: 'Linda K.',
    location: 'New London',
    source: 'Google',
  },
];

const showroomImage = (file: string, alt: string) => ({
  src: `/images/home/showrooms/${file}.webp`,
  alt,
});

export const SHOWROOMS: Showroom[] = [
  {
    name: 'Brookfield',
    href: '/showrooms/brookfield',
    image: showroomImage(
      'brookfield',
      'Granite and quartz slabs on a white wall beside a quartz sample island',
    ),
  },
  {
    name: 'New London',
    href: '/showrooms/new-london',
    image: showroomImage(
      'new-london',
      'Navy and white vanities around a white-brick column, door samples on the wall',
    ),
  },
  {
    name: 'Newington',
    href: '/showrooms/newington',
    image: showroomImage(
      'newington',
      'A bright white display kitchen with a grey island and rattan pendants',
    ),
  },
  {
    name: 'Orange',
    href: '/showrooms/orange',
    image: showroomImage('orange', 'A row of cabinet vignettes in seven finishes'),
  },
  {
    name: 'Stamford',
    href: '/showrooms/stamford',
    image: showroomImage('stamford', 'A wall of handles and knobs above a run of white drawers'),
  },
  {
    name: 'Bristol',
    href: '/showrooms/bristol',
    image: showroomImage(
      'bristol',
      'A design table laid with door and countertop samples, a display kitchen behind',
    ),
  },
];

export const STORY = {
  kicker: 'Since 1916',
  title: "100,000 kitchens later, we're still the ones who make them.",
  description:
    "Built in our own Connecticut factory with robotic precision, and sold straight to you at factory-direct prices. Doors that line up, no middleman's cut, and a date we control because the factory is ours.",
  actions: [
    { label: 'Why Express Kitchens', href: '/why-express-kitchens', primary: true },
    { label: 'Our story', href: '/about-us' },
  ],
  imageLabel: 'The Bristol factory line',
  video: {
    src: '/images/home/story/heritage-ad.mp4',
    webm: '/images/home/story/heritage-ad.webm',
    poster: '/images/home/story/heritage-ad-poster.jpg',
    title: 'Express Kitchens: 110 years of craft',
    width: 1556,
    height: 642,
  },
  chapters: [
    { label: '110+ years legacy', start: 0 },
    { label: "How it's made", start: 9 },
    { label: 'Robotic precision', start: 15 },
    { label: '100K+ kitchens delivered', start: 21 },
  ],
};
