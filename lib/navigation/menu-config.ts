// Main navigation menu — ONE shared tree for both audience modes (Homeowner / Pro).
//
// Source of truth: the interactive wireframe (CatalystSandbox/wireframe-mockup.html, `MENU`,
// Sept 2026 client menu flow). Same L1/L2 structure for both audiences; the only per-audience
// differences are (a) links tagged `audience` (e.g. the homeowner-only "All Cabinets" guided
// link) and (b) the header CTA label (AUDIENCE_CTA below). RTA and Assembled go STRAIGHT to
// their listing pages for everyone — no guided-first routing.
//
// This is a DEVELOPER-EDITED config, intentionally decoupled from the BigCommerce category tree;
// it does not auto-populate. `href: '#'` marks a page that does not exist yet — swap it for the
// real category/page path as each page comes online.
//
// Shape matches the Navigation primitive's `Link` type:
//   { label, href, group, groups?: [{ label?, href?, links: [{ label, href }] }] }
//   L1 item ───────────┘         └─ dropdown column header    └─ dropdown link
// `group: 'shop' | 'content'` splits the nav row into two clusters (the "│" in the wireframe).

export type AudienceMode = 'homeowner' | 'pro';

// Mega-menu tile photos: 320×320 webp files in public/images/nav (originals in design-assets/).
const nav = (file: string, alt: string) => ({ src: `/images/nav/${file}.webp`, alt });

export interface MenuLink {
  label: string;
  href: string;
  /** Show this link to ONE audience only. Omit for both. */
  audience?: AudienceMode;
  /** Extra space before this link — starts a new cluster inside the row. */
  spaceBefore?: boolean;
  /** Square tile photo in the desktop mega menu (a soft placeholder shows until set). */
  image?: { src: string; alt: string };
}

export interface MenuGroup {
  label?: string;
  href?: string;
  /** Take the whole line in the mega menu (both columns) — for groups with many tiles. */
  fullRow?: boolean;
  links: MenuLink[];
}

// Visual grouping in the nav bar: 'shop' items (categories) and 'content' items (Inspiration,
// Resources) render as separate clusters with space between them.
export type MenuItemGroup = 'shop' | 'content';

export interface MenuItem {
  label: string;
  href: string;
  group: MenuItemGroup;
  groups?: MenuGroup[];
}

// Pages that exist today (used more than once below).
const CABINETS = '/cabinets';
const RTA_LISTING = '/cabinets/rta-cabinets';
const ASSEMBLED_LISTING = '/cabinets/assembled-cabinets';

const menu: MenuItem[] = [
  // ── Kitchen: exactly three columns. Cabinets is the hero — it carries the two programs,
  //    hardware, tiles and clearance. ─────────────────────────────────────────────────────────
  {
    label: 'Kitchen',
    href: '#',
    group: 'shop',
    groups: [
      {
        label: 'Cabinets',
        href: CABINETS,
        links: [
          // The column heading links to the Cabinets hub (/cabinets); no separate "All" row.
          {
            label: 'Assembled',
            href: ASSEMBLED_LISTING,
            image: nav('assembled', 'Assembled kitchen cabinets'),
          },
          { label: 'RTA', href: RTA_LISTING, image: nav('rta', 'Ready-to-assemble cabinets') },
          { label: 'Quick Ship', href: '#', image: nav('quick-ship', 'Quick-ship cabinets') },
        ],
      },
      {
        label: 'Cabinet Hardware',
        href: '#',
        links: [
          { label: 'Handles', href: '#', image: nav('handles', 'Cabinet door with a handle') },
          { label: 'Tiles', href: '#', image: nav('tiles', 'Backsplash tiles') },
          { label: 'Accessories', href: '#', image: nav('accessories', 'Drawer organizer') },
        ],
      },
      {
        // Countertops: no Add to Cart — customers request a quote (form) or phone to order.
        // EK supplies only; it does not fit or install.
        label: 'Countertops',
        href: '#',
        links: [
          { label: 'Granite', href: '#', image: nav('granite', 'Granite countertop') },
          { label: 'Laminate', href: '#', image: nav('laminate', 'Laminate countertop') },
          { label: 'Quartz', href: '#', image: nav('quartz', 'Quartz countertop') },
          {
            label: 'Prefabricated',
            href: '#',
            image: nav('prefabricated', 'Prefabricated countertop'),
          },
        ],
      },
      {
        label: 'Sale',
        href: '#',
        links: [
          { label: 'Clearance', href: '#', image: nav('clearance', 'Clearance cabinets') },
          { label: 'Promotions', href: '#', image: nav('promo', 'Current promotions') },
        ],
      },
      {
        label: 'Sinks & Faucets',
        links: [
          { label: 'Kitchen Sinks', href: '#', image: nav('kitchen-sinks', 'Kitchen sink') },
          { label: 'Kitchen Faucets', href: '#', image: nav('kitchen-faucets', 'Kitchen faucet') },
          {
            label: 'Accessories',
            href: '#',
            image: nav('sink-faucet-accessories', 'Sink and faucet accessories'),
          },
        ],
      },
    ],
  },
  {
    label: 'Bath',
    href: '#',
    group: 'shop',
    groups: [
      {
        links: [
          { label: 'Vanity Tops', href: '#', image: nav('vanity-tops', 'Bathroom vanity top') },
          { label: 'Side Splashes', href: '#', image: nav('side-splashes', 'Vanity side splash') },
          { label: 'Bathroom Sinks', href: '#', image: nav('bathroom-sinks', 'Bathroom sink') },
          {
            label: 'Bathroom Faucets',
            href: '#',
            image: nav('bathroom-faucets', 'Bathroom faucet'),
          },
          {
            label: 'Drains & Accessories',
            href: '#',
            image: nav('drains-accessories', 'Drain and accessories'),
          },
        ],
      },
    ],
  },
  // Closets — plain link, no dropdown.
  { label: 'Closets', href: '/closets', group: 'shop' },
  {
    // Ordered by turnover. Pickup-only category — stated on the landing, not at checkout.
    label: 'Appliances',
    href: '/appliances',
    group: 'shop',
    groups: [
      {
        // Single-category menu: no heading tiles, the rows stand on their own.
        fullRow: true,
        links: [
          {
            label: 'Fridges & Freezers',
            href: '#',
            image: nav('fridges-freezers', 'Refrigerator'),
          },
          { label: 'Ranges & Cooktops', href: '#', image: nav('ranges-cooktops', 'Range') },
          { label: 'Dishwashers', href: '#', image: nav('dishwashers', 'Dishwasher') },
          { label: 'Microwaves', href: '#', image: nav('microwaves', 'Microwave') },
          { label: 'Wall Ovens', href: '#', image: nav('wall-ovens', 'Wall oven') },
        ],
      },
      {
        // No heading on the second row — the slot stays empty so the tiles line up.
        fullRow: true,
        links: [
          { label: 'Range Hoods', href: '#', image: nav('range-hoods', 'Range hood') },
          {
            label: 'Washers & Dryers',
            href: '#',
            image: nav('washers-dryers', 'Washer and dryer'),
          },
          {
            label: 'Garbage Disposals',
            href: '#',
            image: nav('garbage-disposals', 'Garbage disposal'),
          },
          {
            label: 'Air Conditioning',
            href: '#',
            image: nav('air-conditioning', 'Air conditioner'),
          },
          {
            label: 'Accessories',
            href: '#',
            image: nav('appliance-accessories', 'Appliance accessories'),
          },
        ],
      },
    ],
  },
  {
    // "Building Materials" for both audiences, per the client. Siding and Doors are new lines,
    // live from site launch. Windows carries the $179.99 / 101 united-inch offer.
    label: 'Building Materials',
    href: '#',
    group: 'shop',
    groups: [
      {
        label: 'Windows',
        href: '/windows',
        links: [
          {
            label: 'Replacement',
            href: '#',
            image: nav('windows-replacement', 'Replacement window'),
          },
          {
            label: 'New Construction',
            href: '#',
            image: nav('windows-new-construction', 'New-construction window in a framed wall'),
          },
          {
            label: 'Accessories',
            href: '#',
            image: nav('windows-accessories', 'Window accessories'),
          },
        ],
      },
      {
        label: 'Siding',
        href: '#',
        links: [{ label: 'All Siding', href: '#', image: nav('siding', 'House siding') }],
      },
      {
        label: 'Doors',
        href: '#',
        links: [{ label: 'All Doors', href: '#', image: nav('doors', 'Entry door') }],
      },
    ],
  },
  // ── Content cluster (rendered after the "│" divider) ─────────────────────────────────────
  {
    label: 'Inspiration',
    href: '#',
    group: 'content',
    groups: [
      {
        label: 'See it',
        links: [
          { label: 'Best-Selling Designs', href: '#' },
          { label: 'Finished Kitchens', href: '#' },
          { label: 'Projects', href: '#' },
        ],
      },
      {
        label: 'Hear it',
        links: [
          { label: 'Reviews', href: '#' },
          { label: 'Video Testimonials', href: '#' },
        ],
      },
    ],
  },
  {
    // Every guide is also linked from the page where the question comes up — this menu is the
    // index, not the only door.
    label: 'Resources',
    href: '#',
    group: 'content',
    groups: [
      {
        label: 'Getting Started',
        links: [
          { label: 'Measuring Guide', href: '#' },
          { label: 'What Is a 10×10 Kitchen', href: '#' },
          { label: 'Order Samples', href: '#' },
          { label: 'Kitchen Estimator', href: '#' },
        ],
      },
      {
        label: 'Guides',
        links: [
          { label: 'Cabinet Care', href: '#' },
          { label: 'How-To Videos', href: '#' },
          { label: 'Blog', href: '/blog' },
        ],
      },
      {
        label: 'Downloads & Policies',
        links: [
          { label: 'Download Brochure', href: '#' },
          { label: 'Financing', href: '#' },
          { label: 'Warranty', href: '#' },
          { label: 'FAQ', href: '#' },
        ],
      },
    ],
  },
  // Pro Program is NOT a nav item — the /pro homepage carries the details and the join button.
  // Company (About / Showrooms / Careers / Contact) lives in the footer.
];

/** The persistent header CTA differs per audience (label only; both share the brand-blue style). */
export const AUDIENCE_CTA: Record<AudienceMode, { label: string; href: string }> = {
  homeowner: { label: 'Free Design Consult', href: '#' },
  pro: { label: 'Free Design & Quote', href: '#' },
};

// The menu for one audience: the shared tree with audience-tagged links filtered to `mode`
// (read from the ek_audience cookie), and the `audience` tag stripped so the result matches the
// Navigation primitive's `Link` shape. Groups left with no links are dropped.
export function getMenu(mode: AudienceMode): MenuItem[] {
  return menu.map((item) => {
    if (!item.groups) {
      return item;
    }

    const groups = item.groups
      .map((group) => ({
        ...group,
        links: group.links
          .filter((link) => link.audience === undefined || link.audience === mode)
          .map(({ label, href, spaceBefore, image }) => ({ label, href, spaceBefore, image })),
      }))
      .filter((group) => group.links.length > 0);

    return { ...item, groups };
  });
}
