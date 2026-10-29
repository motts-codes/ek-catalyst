// The six Connecticut showrooms. Addresses, phones and hours from expresskitchens.com/showrooms;
// Project Manager names from Arun, 29 Oct 2026 (bios still to come for all but Lanaisha).

export interface Hours {
  days: string;
  time: string;
}

export interface ProjectManager {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  intro?: string;
  bio?: string;
  steps?: Array<{ title: string; description: string }>;
  offDuty?: string;
}

export interface Showroom {
  slug: string;
  name: string;
  /** The showroom photo (shared with the home page band). */
  image: { src: string; alt: string };
  address: string;
  phone: string;
  hours: Hours[];
  parking?: string;
  towns: string[];
  /** The lead Project Manager (the one with the profile on the showroom page). */
  pm: ProjectManager;
  /** A second Project Manager at the same showroom, named alongside the first. */
  secondPm?: ProjectManager;
  outlet?: { name: string; phone: string; hours: Hours[] };
}

const TUE_SAT: Hours[] = [
  { days: 'Tuesday – Saturday', time: '9:00 AM – 6:00 PM' },
  { days: 'Sunday – Monday', time: 'Closed' },
];
const MON_SAT: Hours[] = [
  { days: 'Monday – Saturday', time: '9:00 AM – 6:00 PM' },
  { days: 'Sunday', time: 'Closed' },
];

// Showroom photos live with the home page band (public/images/home/showrooms) and are reused here.
const showroomImage = (file: string, alt: string) => ({
  src: `/images/home/showrooms/${file}.webp`,
  alt,
});

const pmNamed = (name: string): ProjectManager => ({
  name,
  role: 'Project Manager & Design Consultant',
});

export const SHOWROOMS: Showroom[] = [
  {
    slug: 'brookfield',
    name: 'Brookfield',
    image: showroomImage(
      'brookfield',
      'Granite and quartz slabs on a white wall beside a quartz sample island',
    ),
    address: '67 Federal Road, Brookfield, CT 06804',
    phone: '(203) 546-7290',
    hours: TUE_SAT,
    towns: ['Danbury', 'Bethel', 'Newtown', 'New Milford', 'New Fairfield', 'Ridgefield'],
    pm: pmNamed('Dan Czernicki'),
  },
  {
    slug: 'new-london',
    name: 'New London',
    image: showroomImage(
      'new-london',
      'Navy and white vanities around a white-brick column, door samples on the wall',
    ),
    address: '254 South Frontage Road, New London, CT 06320',
    phone: '(860) 471-8874',
    hours: TUE_SAT,
    parking: 'Free parking in a large lot with direct access to the showroom.',
    towns: [
      'Madison',
      'Clinton',
      'East Lyme',
      'Mystic',
      'Uncasville',
      'Groton',
      'Waterford',
      'Stonington',
      'Norwich',
      'Old Saybrook',
      'Colchester',
      'Montville',
      'Westerly, RI',
    ],
    pm: {
      name: 'Lanaisha Rodrigues',
      role: 'Project Manager & Design Consultant',
      phone: '(860) 471-8875',
      email: 'LRodrigues@expresskitchens.com',
      intro:
        "Hi, I'm Lanaisha. What I enjoy most is working alongside dedicated professionals and meeting amazing customers every single day.",
      bio: "Each project is a new chance to learn, grow and be part of a team that takes pride in delivering quality results. I bring creativity, attention to detail and practical solutions to every kitchen I take on, and I genuinely love helping families in New London create the kitchen they've always dreamed of.",
      steps: [
        {
          title: 'Understand your vision',
          description:
            'I take the time to really understand what you want: your style, your family and your budget.',
        },
        {
          title: 'Design your kitchen',
          description:
            'I create a layout that is beautiful, functional and matched to how you live at home.',
        },
        {
          title: 'Choose cabinets and finishes',
          description:
            'With 30+ door styles and every finish we make, I help you find the look that makes the kitchen feel like yours.',
        },
        {
          title: 'Review every detail together',
          description:
            'Every cabinet and measurement is checked before ordering, so there are no surprises on install day.',
        },
        {
          title: 'Deliver and follow through',
          description:
            'RTA ships in two weeks, assembled in three, and I stay available every step of the way.',
        },
      ],
      offDuty:
        "When I'm not helping customers, I'm making memories with my family, exploring the outdoors and working on home-improvement projects of my own.",
    },
  },
  {
    slug: 'newington',
    name: 'Newington',
    image: showroomImage(
      'newington',
      'A bright white display kitchen with a grey island and rattan pendants',
    ),
    address: '3311 Berlin Turnpike, Newington, CT 06111',
    phone: '(860) 436-3686',
    hours: MON_SAT,
    towns: [
      'Hartford',
      'West Hartford',
      'Wethersfield',
      'Rocky Hill',
      'Berlin',
      'New Britain',
      'Glastonbury',
    ],
    pm: pmNamed('Chris Jones'),
    secondPm: pmNamed('Ulrike Robinson'),
  },
  {
    slug: 'orange',
    name: 'Orange',
    image: showroomImage('orange', 'A row of cabinet vignettes in seven finishes'),
    address: '303 Boston Post Road, Orange, CT 06477',
    phone: '(203) 283-4909',
    hours: TUE_SAT,
    towns: ['New Haven', 'Milford', 'West Haven', 'Woodbridge', 'Hamden', 'Derby', 'Shelton'],
    pm: pmNamed('Staci Caporuscio'),
  },
  {
    slug: 'stamford',
    name: 'Stamford',
    image: showroomImage('stamford', 'A wall of handles and knobs above a run of white drawers'),
    address: '1011 Hope Street, Stamford, CT 06907',
    phone: '(203) 721-6190',
    hours: TUE_SAT,
    towns: ['Greenwich', 'Darien', 'Norwalk', 'New Canaan', 'Westport', 'Wilton'],
    pm: pmNamed('Richard Cruz'),
  },
  {
    slug: 'bristol',
    name: 'Bristol',
    image: showroomImage(
      'bristol',
      'A design table laid with door and countertop samples, a display kitchen behind',
    ),
    address: '18 Main Street, Bristol, CT 06010',
    phone: '(860) 866-4901',
    hours: MON_SAT,
    towns: [
      'Plainville',
      'Southington',
      'Farmington',
      'Plymouth',
      'Wolcott',
      'Terryville',
      'Burlington',
    ],
    pm: pmNamed('Laurie Praprotnik'),
    secondPm: pmNamed('Annette Morales'),
    outlet: {
      name: 'Express Kitchens Factory Outlet',
      phone: '(860) 247-1000',
      hours: [
        { days: 'Monday – Friday', time: '8:00 AM – 6:00 PM' },
        { days: 'Saturday', time: '8:00 AM – 5:00 PM' },
        { days: 'Sunday', time: 'Closed' },
      ],
    },
  },
];

export const VIRTUAL_CONSULT = {
  phone: '(860) 247-1000',
  hours: 'Tuesday – Saturday, 9 AM – 6 PM ET',
};

export const showroomHref = (slug: string) => `/showrooms/${slug}`;

export const directionsHref = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

export const getShowroom = (slug: string) => SHOWROOMS.find((s) => s.slug === slug);
