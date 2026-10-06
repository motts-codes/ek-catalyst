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

export interface MenuLink {
  label: string;
  href: string;
  /** Show this link to ONE audience only. Omit for both. */
  audience?: AudienceMode;
  /** Extra space above this link — starts a new cluster inside the column. */
  spaceBefore?: boolean;
}

export interface MenuGroup {
  label?: string;
  href?: string;
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
          // Guided landing (styles → lines → RTA-or-assembled). Homeowner only; pros skip it.
          { label: 'All Cabinets', href: CABINETS, audience: 'homeowner' },
          { label: 'Ready to Assemble (RTA)', href: RTA_LISTING },
          { label: 'Assembled Cabinets', href: ASSEMBLED_LISTING },
          { label: 'Quick Ship Cabinets', href: '#' },
          { label: 'Handles', href: '#', spaceBefore: true },
          { label: 'Tiles', href: '#' },
          { label: 'Accessories', href: '#' },
          { label: 'Clearance Sale', href: '#', spaceBefore: true },
        ],
      },
      {
        // Countertops: no Add to Cart — customers request a quote (form) or phone to order.
        // EK supplies only; it does not fit or install.
        label: 'Countertops',
        href: '#',
        links: [
          { label: 'Granite', href: '#' },
          { label: 'Laminate', href: '#' },
          { label: 'Quartz', href: '#' },
          { label: 'Prefabricated', href: '#' },
        ],
      },
      {
        label: 'Sinks & Faucets',
        links: [
          { label: 'Kitchen Sinks', href: '#' },
          { label: 'Kitchen Faucets', href: '#' },
          { label: 'Sink & Faucet Accessories', href: '#' },
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
          { label: 'Vanity Tops', href: '#' },
          { label: 'Side Splashes', href: '#' },
          { label: 'Bathroom Sinks', href: '#' },
          { label: 'Bathroom Faucets', href: '#' },
          { label: 'Drains & Accessories', href: '#' },
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
        links: [
          { label: 'Fridges & Freezers', href: '#' },
          { label: 'Ranges & Cooktops', href: '#' },
          { label: 'Dishwashers', href: '#' },
          { label: 'Microwaves', href: '#' },
          { label: 'Wall Ovens', href: '#' },
        ],
      },
      {
        links: [
          { label: 'Range Hoods', href: '#' },
          { label: 'Washers & Dryers', href: '#' },
          { label: 'Garbage Disposals', href: '#' },
          { label: 'Air Conditioning', href: '#' },
          { label: 'Accessories', href: '#' },
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
          { label: 'Replacement', href: '#' },
          { label: 'New Construction', href: '#' },
          { label: 'Accessories', href: '#' },
        ],
      },
      {
        label: 'Siding',
        href: '#',
        links: [{ label: 'All Siding', href: '#' }],
      },
      {
        label: 'Doors',
        href: '#',
        links: [{ label: 'All Doors', href: '#' }],
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
          .map(({ label, href, spaceBefore }) => ({ label, href, spaceBefore })),
      }))
      .filter((group) => group.links.length > 0);

    return { ...item, groups };
  });
}
