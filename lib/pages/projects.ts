// Finished-kitchen projects for the Inspiration pages. Placeholder content until the business
// supplies real projects: one worked example (Hartford galley) and bracketed stand-ins.

export interface ProjectProduct {
  name: string;
  meta: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  town: string;
  collection: string;
  finish: string;
  program: 'RTA' | 'Assembled';
  industry: 'Residential' | 'Multifamily' | 'Commercial';
  meta: string;
  cost: string;
  summary: string;
  story: string[];
  products: ProjectProduct[];
  quote?: { text: string; name: string };
  /** The project's photo; the label stands in until one is set. */
  image?: { src: string; alt: string };
  imageLabel: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'hartford-avon-galley',
    title: 'A galley kitchen in Hartford',
    town: 'Hartford',
    collection: 'Avon',
    finish: 'White',
    program: 'RTA',
    industry: 'Residential',
    meta: 'Avon · White · RTA',
    cost: '$[X] · 2 weeks',
    summary: 'Full kitchen replacement, [X] cabinets, assembled by the homeowner over one weekend.',
    story: [
      'The old kitchen was a 1960s galley: two runs of cabinets facing each other across a narrow floor, dark doors, and not a single drawer that closed properly. The homeowners wanted it bright, wanted more drawers, and wanted to do as much of it themselves as they could.',
      'They chose Avon in white, ready to assemble, and built all [X] cabinets over a single weekend with a screwdriver and a mallet. [Installer] hung them the following week. Total time from order to first dinner: just under three weeks.',
    ],
    products: [
      {
        name: 'Avon kitchen cabinets',
        meta: 'White · RTA · 10×10 from $[X]',
        href: '/cabinets/avon?program=rta',
      },
      { name: 'Brushed nickel pulls', meta: '$[X] each', href: '#' },
      { name: 'Quartz countertop: [colour]', meta: 'From $59.99/sq ft', href: '#' },
      { name: 'Workstation sink, 30 in.', meta: '$[X]', href: '#' },
    ],
    quote: {
      text: '[Homeowner quote, ideally about assembly or the two-week promise.]',
      name: '[Name], Hartford',
    },
    imageLabel: 'After: the finished Avon galley',
  },
  {
    slug: 'island-kitchen',
    title: '[Town] island kitchen',
    town: '[Town]',
    collection: 'Derry Stratus',
    finish: 'Walnut',
    program: 'Assembled',
    industry: 'Residential',
    meta: 'Derry Stratus · Walnut · Assembled',
    cost: '$[X] · 3 weeks',
    summary: '[One line about the project.]',
    story: ['[Project story to come.]'],
    products: [],
    imageLabel: '[Town] island kitchen',
  },
  {
    slug: 'l-shape',
    title: '[Town] L-shape',
    town: '[Town]',
    collection: 'Dover',
    finish: 'Navy',
    program: 'Assembled',
    industry: 'Residential',
    meta: 'Dover · Navy · Assembled',
    cost: '$[X]',
    summary: '[One line about the project.]',
    story: ['[Project story to come.]'],
    products: [],
    imageLabel: '[Town] L-shape kitchen',
  },
  {
    slug: 'farmhouse',
    title: '[Town] farmhouse',
    town: '[Town]',
    collection: 'Beacon Hill',
    finish: 'Natural oak',
    program: 'RTA',
    industry: 'Residential',
    meta: 'Beacon Hill · Natural oak · RTA',
    cost: '$[X]',
    summary: '[One line about the project.]',
    story: ['[Project story to come.]'],
    products: [],
    imageLabel: '[Town] farmhouse kitchen',
  },
  {
    slug: 'bath',
    title: '[Town] bath',
    town: '[Town]',
    collection: 'Avon',
    finish: 'White vanity',
    program: 'Assembled',
    industry: 'Residential',
    meta: 'Avon · White vanity',
    cost: '$[X]',
    summary: '[One line about the project.]',
    story: ['[Project story to come.]'],
    products: [],
    imageLabel: '[Town] bath',
  },
  {
    slug: 'walk-in-closet',
    title: '[Town] walk-in closet',
    town: '[Town]',
    collection: 'Closet organizers',
    finish: 'White',
    program: 'RTA',
    industry: 'Residential',
    meta: 'Closet organizers · White',
    cost: '$[X]',
    summary: '[One line about the project.]',
    story: ['[Project story to come.]'],
    products: [],
    imageLabel: '[Town] walk-in closet',
  },
  {
    slug: 'development',
    title: '[Development], [Town]',
    town: '[Town]',
    collection: 'Avon',
    finish: 'White',
    program: 'Assembled',
    industry: 'Multifamily',
    meta: 'Multifamily · 120 units · Avon White · Assembled',
    cost: '$[X] per unit · phased over [X] months',
    summary: '[One line about the project.]',
    story: ['[Project story to come.]'],
    products: [],
    image: {
      src: '/images/pages/industry/multifamily-kitchen.jpg',
      alt: 'A compact apartment kitchen with grey shaker cabinets',
    },
    imageLabel: 'A multifamily kitchen, one of many',
  },
  {
    slug: 'offices',
    title: '[Company] offices, [Town]',
    town: '[Town]',
    collection: 'Barcelona',
    finish: 'White',
    program: 'Assembled',
    industry: 'Commercial',
    meta: 'Commercial · 3 break rooms · Barcelona · Assembled',
    cost: '$[X] · delivered to schedule',
    summary: '[One line about the project.]',
    story: ['[Project story to come.]'],
    products: [],
    image: {
      src: '/images/pages/industry/office-break-room.jpg',
      alt: 'An office break room with white slab cabinets',
    },
    imageLabel: 'An office break room',
  },
  {
    slug: 'hotel',
    title: '[Hotel], [Town]',
    town: '[Town]',
    collection: 'Derry Stratus',
    finish: 'Walnut',
    program: 'Assembled',
    industry: 'Commercial',
    meta: 'Commercial · 60 kitchenettes · Derry · Assembled',
    cost: '$[X] per unit',
    summary: '[One line about the project.]',
    story: ['[Project story to come.]'],
    products: [],
    image: {
      src: '/images/pages/industry/hotel-kitchenette.jpg',
      alt: 'A hotel kitchenette with light oak cabinets',
    },
    imageLabel: 'A hotel kitchenette',
  },
];

export const projectHref = (slug: string) => `/inspiration/projects/${slug}`;
export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);

export interface Video {
  title: string;
  meta?: string;
  /** Shown as a badge on the tile when known. */
  duration?: string;
  href?: string;
  /** A YouTube video: the tile shows its thumbnail and plays it in a dialog. */
  youtubeId?: string;
}
