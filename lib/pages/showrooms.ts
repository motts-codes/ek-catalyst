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

const pmNamed = (showroom: string, name: string): ProjectManager => ({
  name,
  role: 'Project Manager & Design Consultant',
  photo: pmPhoto(showroom, name),
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
    coords: { lat: 41.433247, lng: -73.410702 },
    phone: '(203) 546-7290',
    hours: TUE_SAT,
    towns: ['Danbury', 'Bethel', 'Newtown', 'New Milford', 'New Fairfield', 'Ridgefield'],
    pm: pmNamed('brookfield', 'Dan Czernicki'),
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
    ],
    pm: pmNamed('newington', 'Chris Jones'),
    secondPm: pmNamed('newington', 'Ulrike Robinson'),
  },
  {
    slug: 'orange',
    name: 'Orange',
    image: showroomImage('orange', 'A row of cabinet vignettes in seven finishes'),
    address: '303 Boston Post Road, Orange, CT 06477',
    coords: { lat: 41.265782, lng: -73.003126 },
    phone: '(203) 283-4909',
    hours: TUE_SAT,
    towns: ['New Haven', 'Milford', 'West Haven', 'Woodbridge', 'Hamden', 'Derby', 'Shelton'],
    pm: pmNamed('orange', 'Staci Caporuscio'),
  },
  {
    slug: 'stamford',
    name: 'Stamford',
    image: showroomImage('stamford', 'A wall of handles and knobs above a run of white drawers'),
    address: '1011 Hope Street, Stamford, CT 06907',
    coords: { lat: 41.093579, lng: -73.517536 },
    phone: '(203) 721-6190',
    hours: TUE_SAT,
    towns: ['Greenwich', 'Darien', 'Norwalk', 'New Canaan', 'Westport', 'Wilton'],
    pm: pmNamed('stamford', 'Richard Cruz'),
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
      'Wolcott',
      'Terryville',
      'Burlington',
    ],
    pm: pmNamed('bristol', 'Laurie Praprotnik'),
    secondPm: pmNamed('bristol', 'Annette Morales'),
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
