// The six Connecticut showrooms. Addresses, phones and hours from expresskitchens.com/showrooms;
// Project Manager names from Arun, 29 Oct 2026 (bios still to come for all but Lanaisha).

export interface Hours {
  days: string;
  time: string;
}

export interface ProjectManager {
  name: string;
  role: string;
  /** Headshot, square. */
  photo?: { src: string; alt: string };
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
  /** Geocoded from the address (Mapbox, Oct 2026), for the locator map. */
  coords: { lat: number; lng: number };
  phone: string;
  hours: Hours[];
  parking?: string;
  towns: string[];
  /** A local-landmark line for the "Who we serve" section, e.g. "Visiting Mohegan Sun…?". */
  landmarks?: string;
  /** The last line of the search copy at the foot of the page (a default is used if absent). */
  seoClosing?: string;
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

// Headshots live in public/images/showrooms/pm as {showroom}_{first-last}.webp (900px square).
const pmPhoto = (showroom: string, name: string) => ({
  src: `/images/showrooms/pm/${showroom}_${name.toLowerCase().replace(/\s+/g, '-')}.webp`,
  alt: `${name}, Project Manager`,
});

const pmNamed = (
  showroom: string,
  name: string,
  rest: Omit<ProjectManager, 'name' | 'role' | 'photo'> = {},
): ProjectManager => ({
  name,
  role: 'Project Manager & Design Consultant',
  photo: pmPhoto(showroom, name),
  ...rest,
});

// The five steps the two-manager showrooms share.
const TEAM_STEPS = [
  { title: 'Understand your space and budget', description: 'Honest guidance from day one.' },
  { title: 'Plan the cabinets', description: 'Storage and flow for how you actually live.' },
  { title: 'Choose your finish', description: 'Every door style and color we make, in person.' },
  { title: 'Check every detail', description: 'Every cabinet and measurement, before you order.' },
  {
    title: 'Stay with you',
    description: "RTA ships in 2 weeks, assembled in 3, and we're here throughout.",
  },
];

export const SHOWROOMS: Showroom[] = [
  {
    slug: 'brookfield',
    name: 'Brookfield',
    image: showroomImage(
      'brookfield',
      'Granite and quartz slabs on a white wall beside a quartz sample island',
    ),
    address: '67 Federal Road, Brookfield, CT 06804',
    coords: { lat: 41.433247, lng: -73.410702 },
    phone: '(203) 546-7290',
    hours: TUE_SAT,
    towns: [
      'Danbury',
      'Bethel',
      'Newtown',
      'New Fairfield',
      'Ridgefield',
      'New Milford',
      'Southbury',
      'Woodbury',
      'Oxford',
      'Watertown',
      'Seymour',
      'Naugatuck',
      'Patterson, NY',
      'Brewster, NY',
      'Mahopac, NY',
    ],
    seoClosing:
      'Visit Express Kitchens in Brookfield, CT, to explore our range of kitchen cabinets, countertops and appliances.',
    pm: pmNamed('brookfield', 'Dan Czernicki', {
      phone: '(203) 826-8812',
      email: 'dczernicki@expresskitchens.com',
      intro:
        "Hi, I'm Dan. I've been designing kitchens with Express Kitchens for over 6 years, and I listen more than I talk.",
      bio: "Put your trust in me and I'll plan a kitchen built around your space, your family and how you live.",
      steps: [
        { title: 'Understand your needs', description: 'Your needs come first, always.' },
        {
          title: 'Plan the cabinets',
          description: 'Built around your space, your family and your life.',
        },
        {
          title: 'Choose your finish',
          description: 'From open-plan islands to traditional details, in person.',
        },
        {
          title: 'Check every detail',
          description: 'Every cabinet and measurement, before you order.',
        },
        { title: 'Stay with you', description: "I'm here to help, even after your kitchen is in." },
      ],
      offDuty:
        "When I'm not at the showroom, I'm hiking with my dog, fishing, paddleboarding or longboarding.",
    }),
  },
  {
    slug: 'new-london',
    name: 'New London',
    image: showroomImage(
      'new-london',
      'Navy and white vanities around a white-brick column, door samples on the wall',
    ),
    address: '254 South Frontage Road, New London, CT 06320',
    coords: { lat: 41.367647, lng: -72.116995 },
    phone: '(860) 471-8874',
    hours: TUE_SAT,
    parking: 'Free parking in a large lot with direct access to the showroom.',
    towns: [
      'Groton',
      'Waterford',
      'East Lyme',
      'North Lyme',
      'Mystic',
      'Stonington',
      'Norwich',
      'Old Saybrook',
      'Madison',
      'Clinton',
      'Colchester',
      'Montville',
      'Uncasville',
      'Westerly, RI',
      'Hopkinton, RI',
    ],
    landmarks:
      'Visiting Mohegan Sun, Foxwoods or the Mystic Aquarium? Stop by and see our kitchens.',
    seoClosing:
      "Whether you're visiting the casinos at Mohegan Sun or Foxwoods, or exploring the Mystic Aquarium, stop by our showroom and see our kitchens.",
    pm: {
      name: 'Lanaisha Rodrigues',
      role: 'Project Manager & Design Consultant',
      photo: pmPhoto('new-london', 'Lanaisha Rodrigues'),
      phone: '(860) 471-8875',
      email: 'LRodrigues@expresskitchens.com',
      intro:
        "Hi, I'm Lanaisha. I love meeting customers every day and helping families in New London get the kitchen they've always wanted.",
      bio: 'I bring creativity, attention to detail and practical answers to every kitchen, from the first idea to the final order.',
      steps: [
        {
          title: 'Understand your kitchen',
          description: 'Your style, your family and your budget.',
        },
        {
          title: 'Plan the cabinets',
          description: 'What your room needs, matched to how you cook and live.',
        },
        {
          title: 'Choose your finish',
          description: 'Every door style and color we make, in person.',
        },
        {
          title: 'Check every detail',
          description: 'Every cabinet and measurement, before you order.',
        },
        {
          title: 'Stay with you',
          description: "RTA ships in 2 weeks, assembled in 3, and I'm here throughout.",
        },
      ],
      offDuty:
        "When I'm not at the showroom, I'm out with my family, exploring the outdoors, or working on home projects of my own.",
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
    coords: { lat: 41.65768, lng: -72.72546 },
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
      'Cromwell',
      'Middletown',
      'Farmington',
      'Elmwood',
      'Griswoldville',
      'Meriden',
    ],
    seoClosing:
      "When you're driving down the Berlin Turnpike to visit Stew Leonard's or grab a snack at the Olympia Diner, stop by our showroom to see our kitchens.",
    pm: pmNamed('newington', 'Chris Jones', {
      phone: '(860) 785-2281',
      email: 'cjones@expresskitchens.com',
      steps: TEAM_STEPS,
    }),
    secondPm: pmNamed('newington', 'Ulrike Robinson', {
      phone: '(860) 956-5672',
      email: 'urobinson@expresskitchens.com',
    }),
  },
  {
    slug: 'orange',
    name: 'Orange',
    image: showroomImage('orange', 'A row of cabinet vignettes in seven finishes'),
    address: '303 Boston Post Road, Orange, CT 06477',
    coords: { lat: 41.265782, lng: -73.003126 },
    phone: '(203) 283-4909',
    hours: TUE_SAT,
    towns: [
      'New Haven',
      'West Haven',
      'East Haven',
      'Milford',
      'Woodbridge',
      'Hamden',
      'Derby',
      'Ansonia',
      'Shelton',
      'Monroe',
      'Branford',
      'Guilford',
    ],
    seoClosing: "We're conveniently located right across from Party City on Boston Post Road.",
    pm: pmNamed('orange', 'Staci Caporuscio', {
      email: 'SCaporuscio@expresskitchens.com',
      intro:
        "Hi, I'm Staci. I've been a kitchen designer for almost 15 years, 6 of them with Express Kitchens.",
      bio: "I've worked in several of our showrooms, and the kitchen really is the heart of the home, so helping customers get the one they want never gets old.",
      steps: [
        {
          title: 'Listen to what you want',
          description: 'What would make you happiest in your kitchen? I listen to every word.',
        },
        {
          title: 'Plan the best kitchen for you',
          description: "Everything you've told me, within your budget.",
        },
        {
          title: 'Choose your style',
          description: 'Every door style and color we make, in person.',
        },
        {
          title: 'Check every detail',
          description: 'Every cabinet and measurement, before you order.',
        },
        {
          title: 'Stay with you',
          description: "I'll work closely with you right through to the final result.",
        },
      ],
      offDuty:
        "When I'm not at the showroom, I'm with my family, playing tennis, or skiing when there's snow.",
    }),
  },
  {
    slug: 'stamford',
    name: 'Stamford',
    image: showroomImage('stamford', 'A wall of handles and knobs above a run of white drawers'),
    address: '1011 Hope Street, Stamford, CT 06907',
    coords: { lat: 41.093579, lng: -73.517536 },
    phone: '(203) 721-6190',
    hours: TUE_SAT,
    towns: [
      'Greenwich',
      'Darien',
      'New Canaan',
      'Norwalk',
      'Westport',
      'Wilton',
      'Fairfield',
      'Bridgeport',
      'Ridgefield',
      'Trumbull',
    ],
    seoClosing:
      'Visit us at 1011 Hope Street, just a few miles away, to explore our kitchen cabinets, countertops and appliances.',
    pm: pmNamed('stamford', 'Richard Cruz', {
      phone: '(203) 721-6279',
      email: 'rcruz@expresskitchens.com',
      intro: "Hi, I'm Richard. I've been designing kitchens with Express Kitchens for 12 years.",
      bio: 'I blend creativity with practicality, so every kitchen fits the way my customers live.',
      steps: [
        {
          title: 'Listen to your goals',
          description: 'Your lifestyle, your taste and your budget.',
        },
        {
          title: 'Plan your kitchen',
          description: 'Practical and personal, built around your space.',
        },
        {
          title: 'Choose your finish',
          description: 'Every door style and color we make, in person.',
        },
        {
          title: 'Check every detail',
          description: 'Every cabinet and measurement, before you order.',
        },
        { title: 'Stay with you', description: "I'm your point of contact from start to finish." },
      ],
      offDuty:
        "When I'm not at the showroom, I unwind with a good movie and keep up with the news.",
    }),
  },
  {
    slug: 'bristol',
    name: 'Bristol',
    image: showroomImage(
      'bristol',
      'A design table laid with door and countertop samples, a display kitchen behind',
    ),
    address: '18 Main Street, Bristol, CT 06010',
    coords: { lat: 41.669172, lng: -72.94105 },
    phone: '(860) 866-4901',
    hours: MON_SAT,
    towns: [
      'Plainville',
      'Southington',
      'Farmington',
      'Plymouth',
      'Terryville',
      'Wolcott',
      'Burlington',
      'Waterbury',
      'Watertown',
      'Woodbury',
      'Canton',
      'New Hartford',
      'Winsted',
      'Litchfield',
      'Goshen',
      'Cornwall',
    ],
    seoClosing:
      "Come and see our newly renovated showroom, in the same plaza as BJ's Wholesale Club.",
    pm: pmNamed('bristol', 'Laurie Praprotnik', {
      phone: '(860) 866-4831',
      email: 'LPraprotnik@expresskitchens.com',
      steps: TEAM_STEPS,
    }),
    secondPm: pmNamed('bristol', 'Annette Morales', {
      phone: '(860) 969-8691',
      email: 'amorales@expresskitchens.com',
    }),
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
  hours: 'Tuesday – Saturday, 9 AM – 5 PM ET',
};

export const showroomHref = (slug: string) => `/showrooms/${slug}`;

// "Lanaisha" from "Lanaisha Rodrigues"; "your Project Manager" for a placeholder.
export const pmFirstName = (pm: ProjectManager) =>
  pm.name.startsWith('[') ? 'your Project Manager' : (pm.name.split(' ')[0] ?? pm.name);

// "Madison, Clinton and Westerly, RI".
export const joinTowns = (towns: string[]) =>
  towns.length <= 1
    ? (towns[0] ?? '')
    : `${towns.slice(0, -1).join(', ')} and ${towns[towns.length - 1] ?? ''}`;

export const directionsHref = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

// The showroom's place on Google Maps (the pin and its card, not a route to it).
export const mapsHref = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Express Kitchens, ${address}`)}`;

export const getShowroom = (slug: string) => SHOWROOMS.find((s) => s.slug === slug);

// ---- Open or closed right now (Eastern time) ------------------------------------------------

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// "Tuesday – Saturday" → [2, 3, 4, 5, 6]; "Sunday" → [0]; "Sunday – Monday" wraps.
function daysOf(label: string): number[] {
  const [from, to = from] = label.split(/\s[–-]\s/).map((d) => DAY_NAMES.indexOf(d.trim()));

  if (from == null || from < 0 || to == null || to < 0) return [];

  const days: number[] = [];

  for (let d = from; ; d = (d + 1) % 7) {
    days.push(d);
    if (d === to) break;
  }

  return days;
}

// "9:00 AM" → minutes since midnight.
function minutesOf(time: string): number {
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(time);

  if (!match) return Number.NaN;

  const hour = Number(match[1]) % 12;
  const minute = Number(match[2]);
  const pm = (match[3] ?? '').toUpperCase() === 'PM';

  return (pm ? hour + 12 : hour) * 60 + minute;
}

// The opening window for each weekday, from the hours table.
function windowsOf(hours: Hours[]): Array<{ open: number; close: number; label: string } | null> {
  const windows: Array<{ open: number; close: number; label: string } | null> = Array.from(
    { length: 7 },
    () => null,
  );

  hours.forEach((row) => {
    const [openAt, closeAt] = row.time.split(/\s[–-]\s/);
    const open = minutesOf(openAt ?? '');
    const close = minutesOf(closeAt ?? '');

    if (Number.isNaN(open) || Number.isNaN(close)) return;

    daysOf(row.days).forEach((day) => {
      windows[day] = { open, close, label: `${openAt} – ${closeAt}` };
    });
  });

  return windows;
}

// The wall clock in Connecticut: weekday index and minutes since midnight.
function easternNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = DAY_NAMES.indexOf(get('weekday'));
  const minutes = (Number(get('hour')) % 24) * 60 + Number(get('minute'));

  return { day: day < 0 ? 0 : day, minutes };
}

const shortTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;

  return `${hour12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

export interface OpenStatus {
  open: boolean;
  /** "Open until 6 PM", "Opens 9 AM" (later today), or "Closed" on a day it doesn't open. */
  label: string;
}

// Whether a showroom is open at `now`, with a short line to print. Eastern time, from the hours
// table. Holidays are not known here, so a closed day just reads "Closed", never an opening time.
export function openStatus(hours: Hours[], now: Date = new Date()): OpenStatus {
  const windows = windowsOf(hours);
  const { day, minutes } = easternNow(now);
  const today = windows[day];

  if (!today) return { open: false, label: 'Closed' };
  if (minutes < today.open) return { open: false, label: `Opens ${shortTime(today.open)}` };
  if (minutes < today.close) return { open: true, label: `Open until ${shortTime(today.close)}` };

  return { open: false, label: 'Closed' };
}

// ---- Hours, printed ----------------------------------------------------------------------------

export interface DayHours {
  day: string;
  /** "9:00 AM – 6:00 PM" or "Closed". */
  label: string;
  closed: boolean;
}

// The hours table as seven rows, Monday first, for the store-hours box.
export function weeklyHours(hours: Hours[]): DayHours[] {
  const windows = windowsOf(hours);

  return [1, 2, 3, 4, 5, 6, 0].map((day) => {
    const window = windows[day];

    return {
      day: DAY_NAMES[day] ?? '',
      label: window ? window.label : 'Closed',
      closed: !window,
    };
  });
}

// Today's weekday index in Connecticut (0 = Sunday), for marking the row in the hours box.
export const easternDay = (now: Date = new Date()) => easternNow(now).day;

// ---- Search copy -------------------------------------------------------------------------------

export interface SeoCopy {
  title: string;
  intro: string;
  body: string[];
}

// "Residents of Groton, CT, Waterford, CT, … and Montville, CT": towns outside Connecticut
// already carry their state.
const seoTowns = (towns: string[]) => {
  const named = towns.map((town) => (town.includes(',') ? town : `${town}, CT`));
  const last = named.pop();

  return named.length > 0 ? `${named.join(', ')} and ${last ?? ''}` : (last ?? '');
};

// The search copy at the foot of a showroom page (EK's wording, Oct 2026), with the town, the
// nearby towns and the closing line filled in per showroom.
export function seoCopy(showroom: Showroom): SeoCopy {
  const place = `${showroom.name}, CT`;

  return {
    title: `Welcome to Express Kitchens for Top-Quality Kitchen Cabinets in ${place}`,
    intro: `Discover the finest kitchen cabinets, countertops, handles, sinks, faucets, appliances, windows and more in ${place} at Express Kitchens. Our ${showroom.name} store offers a wide range of stylish and durable cabinets designed to enhance your kitchen's functionality and aesthetic appeal. Visit us today to find the perfect cabinets for your dream kitchen.`,
    body: [
      `Your journey to your dream kitchen starts at Express Kitchens in ${place}, your destination for top-quality kitchen cabinetry and kitchen renovation solutions. If you're searching for "kitchen remodel near me," "countertops near me," "appliances near ${place}," "replacement windows" or "kitchen cabinets near me," our ${showroom.name} store offers a wide selection of stylish and durable kitchen cabinets to meet your needs.`,
      "At Express Kitchens, we specialize in kitchen cabinets made in our own factory, in styles and sizes to fit your space. Whether you're planning a full kitchen remodel or updating a few elements, our team is here to help you create your dream kitchen, with cabinets in a range of designs and finishes.",
      'Alongside our cabinets, we offer a wide range of countertops to complete your kitchen: quartz, known for its durability and low maintenance; granite, for its timeless beauty and strength; and laminate, a budget-friendly option.',
      'We also offer kitchen appliances to complement your new cabinets and countertops, from refrigerators and ovens to dishwashers and microwaves.',
      "Our experienced team also helps with bathrooms, with vanities, countertops and cabinetry to fit your style. Whether it's a complete bathroom makeover or a few updates, we'll work closely with you to bring your vision to life.",
      `Residents of ${seoTowns(showroom.towns)} are all within easy reach of our showroom. ${showroom.seoClosing ?? 'Stop by our showroom and see our kitchens.'}`,
    ],
  };
}
