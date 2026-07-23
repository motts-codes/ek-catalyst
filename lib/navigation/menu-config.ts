// Audience-mode navigation menus (Homeowner / Pro).
//
// This is a DEVELOPER-EDITED config — the nav is intentionally decoupled from the BigCommerce
// category tree, so it does NOT auto-populate. Edit the trees below to change the menu.
//
// All `href` values are placeholders (`#`) for now. Swap them for real category/page paths
// (e.g. '/cabinets/', '/windows/replacement/') as those pages come online. See docs/AUDIENCE-MODE-SPEC.md.
//
// Shape matches the Navigation primitive's `Link` type:
//   { label, href, groups?: [{ label?, href?, links: [{ label, href }] }] }
//   L1 item ─────────┘        └─ dropdown column header  └─ dropdown link

export type AudienceMode = 'homeowner' | 'pro';

export interface MenuLink {
  label: string;
  href: string;
}

export interface MenuGroup {
  label?: string;
  href?: string;
  links: MenuLink[];
}

export interface MenuItem {
  label: string;
  href: string;
  groups?: MenuGroup[];
}

// ---------------------------------------------------------------------------
// HOMEOWNER (default) — discovery-led. L1 clicks eventually route to landing
// pages; for now everything is `#`.
// ---------------------------------------------------------------------------
const homeownerMenu: MenuItem[] = [
  {
    label: 'Cabinets',
    href: '#',
    groups: [
      {
        label: 'Shop by Construction',
        links: [
          { label: 'RTA', href: '#' },
          { label: 'Assembled', href: '#' },
          { label: "What's the difference?", href: '#' },
        ],
      },
      {
        label: 'Shop by',
        links: [
          { label: 'Color', href: '#' },
          { label: 'Style', href: '#' },
          { label: 'Best Sellers', href: '#' },
        ],
      },
      {
        label: 'More',
        links: [
          { label: 'Hardware & Handles', href: '#' },
          { label: 'Tiles & Backsplash', href: '#' },
          { label: 'Accessories', href: '#' },
          { label: 'Clearance', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Appliances',
    href: '#',
    groups: [
      {
        links: [
          { label: 'Ranges & Cooktops', href: '#' },
          { label: 'Fridges', href: '#' },
          { label: 'Dishwashers', href: '#' },
          { label: 'Microwaves', href: '#' },
          { label: 'Range Hoods', href: '#' },
          { label: 'Wall Ovens', href: '#' },
          { label: 'Washers & Dryers', href: '#' },
          { label: 'All Appliances', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Windows',
    href: '#',
    groups: [
      {
        label: 'Replacement',
        links: [
          { label: 'Double Hung', href: '#' },
          { label: 'Slider', href: '#' },
          { label: 'Hopper', href: '#' },
        ],
      },
      {
        links: [
          { label: 'New Construction', href: '#' },
          { label: 'Accessories', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Kitchen & Bath',
    href: '#',
    groups: [
      {
        // Countertops is call-to-order (not shoppable online), so it lives here rather than as a
        // shop L1. Its pages/PDP will use a "Call to place order" CTA instead of Add to Cart.
        label: 'Countertops',
        links: [
          { label: 'Granite', href: '#' },
          { label: 'Quartz', href: '#' },
          { label: 'Laminate', href: '#' },
          { label: 'Prefabricated', href: '#' },
        ],
      },
      {
        label: 'Sinks',
        links: [
          { label: 'Single', href: '#' },
          { label: 'Double', href: '#' },
          { label: 'Farmhouse', href: '#' },
          { label: 'Workstation', href: '#' },
        ],
      },
      {
        label: 'Bath',
        links: [
          { label: 'Vanity Tops', href: '#' },
          { label: 'Basins', href: '#' },
          { label: 'Bath Faucets', href: '#' },
        ],
      },
      {
        links: [
          { label: 'Faucets', href: '#' },
          { label: 'Garbage Disposals', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Inspiration',
    href: '#',
    groups: [
      {
        links: [
          { label: 'Gallery / Featured Projects', href: '#' },
          { label: 'Best-Selling Designs', href: '#' },
          { label: 'Reviews', href: '#' },
          { label: 'Blog', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    href: '#',
    groups: [
      {
        links: [
          { label: 'How It Works', href: '#' },
          { label: 'Free Samples', href: '#' },
          { label: 'Financing', href: '#' },
          { label: 'Measuring Guide', href: '#' },
          { label: 'FAQs', href: '#' },
          { label: 'About Us', href: '#' },
          { label: 'Guarantee', href: '#' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// PRO — transactional. RTA & Assembled promoted to L1 (replacing Cabinets);
// Inspiration → Clearance; Resources → Pro Program. L1 clicks go straight to
// category pages (no landing pages). All `#` for now.
// ---------------------------------------------------------------------------
const proMenu: MenuItem[] = [
  {
    label: 'RTA',
    href: '#',
    groups: [
      {
        label: 'Shop RTA',
        links: [
          { label: 'By Door Style', href: '#' },
          { label: 'By Color', href: '#' },
          { label: 'In-Stock / Quick-Ship', href: '#' },
        ],
      },
      {
        label: 'Hardware & Accessories',
        links: [
          { label: 'Handles', href: '#' },
          { label: 'Tiles', href: '#' },
          { label: 'Accessories', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Assembled',
    href: '#',
    groups: [
      {
        label: 'Shop Assembled',
        links: [
          { label: 'By Door Style', href: '#' },
          { label: 'By Color', href: '#' },
          { label: 'In-Stock / Quick-Ship', href: '#' },
        ],
      },
      {
        label: 'Hardware & Accessories',
        links: [
          { label: 'Handles', href: '#' },
          { label: 'Tiles', href: '#' },
          { label: 'Accessories', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Appliances',
    href: '#',
    groups: [
      {
        links: [
          { label: 'Ranges & Cooktops', href: '#' },
          { label: 'Fridges', href: '#' },
          { label: 'Dishwashers', href: '#' },
          { label: 'Range Hoods', href: '#' },
          { label: 'All Appliances', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Windows',
    href: '#',
    groups: [
      {
        label: 'Replacement',
        links: [
          { label: 'Double Hung', href: '#' },
          { label: 'Slider', href: '#' },
          { label: 'Hopper', href: '#' },
        ],
      },
      {
        links: [{ label: 'New Construction', href: '#' }],
      },
    ],
  },
  {
    label: 'Kitchen & Bath',
    href: '#',
    groups: [
      {
        // Countertops is call-to-order (not shoppable online) — see the homeowner menu note.
        label: 'Countertops',
        links: [
          { label: 'Granite', href: '#' },
          { label: 'Quartz', href: '#' },
          { label: 'Laminate', href: '#' },
          { label: 'Prefabricated', href: '#' },
        ],
      },
      {
        links: [
          { label: 'Sinks', href: '#' },
          { label: 'Faucets', href: '#' },
          { label: 'Bath', href: '#' },
        ],
      },
    ],
  },
  {
    label: 'Clearance',
    href: '#',
  },
  {
    label: 'Pro Program',
    href: '#',
    groups: [
      {
        links: [
          { label: 'Program & Tiers', href: '#' },
          { label: 'Spec Sheets & Downloads', href: '#' },
          { label: 'Catalogs', href: '#' },
          { label: 'Delivery & Lead Times', href: '#' },
          { label: 'Purchase Orders', href: '#' },
          { label: 'Showrooms', href: '#' },
          { label: 'Support', href: '#' },
        ],
      },
    ],
  },
];

export const AUDIENCE_MENUS: Record<AudienceMode, MenuItem[]> = {
  homeowner: homeownerMenu,
  pro: proMenu,
};

/** The persistent header CTA differs per audience (Free Design Consult vs Get a Quote). */
export const AUDIENCE_CTA: Record<AudienceMode, { label: string; href: string }> = {
  homeowner: { label: 'Free Design Consult', href: '#' },
  pro: { label: 'Get a Quote', href: '#' },
};

export function getMenu(mode: AudienceMode): MenuItem[] {
  return AUDIENCE_MENUS[mode];
}
