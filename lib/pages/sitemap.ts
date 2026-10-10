export interface SitemapGroup {
  title: string;
  links: Array<{ label: string; href: string }>;
}

// The human-readable sitemap at /sitemap. Catalog categories come from BigCommerce and are
// linked by their storefront paths; everything else is a code page. Keep in step with
// lib/navigation/menu-config.ts and footer-config.ts when pages are added.
export const SITEMAP: SitemapGroup[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Cabinets', href: '/cabinets' },
      { label: 'Assembled cabinets', href: '/cabinets/assembled-cabinets' },
      { label: 'Ready-to-assemble cabinets', href: '/cabinets/rta-cabinets' },
      { label: 'Quick Ship cabinets', href: '/quick-ship-cabinets' },
      { label: 'Cabinet hardware', href: '/cabinet-hardware' },
      { label: 'Sinks & faucets', href: '/sinks-faucets' },
      { label: 'Countertops', href: '/countertops' },
      { label: 'Bath', href: '/bath' },
      { label: 'Closets', href: '/closets' },
      { label: 'Appliances', href: '/appliances' },
      { label: 'Windows', href: '/windows' },
      { label: 'Doors', href: '/doors' },
      { label: 'Siding', href: '/siding' },
      { label: 'Sale', href: '/sale' },
      { label: 'Clearance', href: '/clearance-sale' },
      { label: 'Promotions', href: '/promotions' },
    ],
  },
  {
    title: 'Plan your kitchen',
    links: [
      { label: 'Explore', href: '/mykitchen' },
      { label: 'How ready-to-assemble works', href: '/mykitchen/cabinets/rta' },
      { label: 'How assembled works', href: '/mykitchen/cabinets/assembled' },
      { label: 'Kitchen estimator', href: '/mykitchen/calculator' },
      { label: 'Visualizer', href: '/mykitchen/visualizer' },
      { label: 'Free design consult', href: '/free-design' },
      { label: 'Book a showroom appointment', href: '/book' },
      { label: 'Order samples', href: '/samples' },
      { label: 'Financing', href: '/financing' },
    ],
  },
  {
    title: 'Inspiration',
    links: [
      { label: 'Inspiration', href: '/inspiration' },
      { label: 'Best-selling designs', href: '/inspiration/best-sellers' },
      { label: 'Finished kitchens', href: '/inspiration/projects' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Resources', href: '/resources' },
      { label: 'Measuring guide', href: '/resources/measuring-guide' },
      { label: 'What is a 10×10 kitchen', href: '/resources/ten-by-ten-kitchen' },
      { label: 'How-to videos', href: '/resources/how-to-videos' },
      { label: 'Cabinet care', href: '/resources/cabinet-care' },
      { label: 'Compare cabinet companies', href: '/compare-cabinet-companies' },
      { label: 'Find an installer', href: '/find-a-pro' },
    ],
  },
  {
    title: 'For the trade',
    links: [
      { label: 'Pro', href: '/pro' },
      { label: 'Pro Program', href: '/pro-program' },
      { label: 'Industries', href: '/industry' },
      { label: 'Multifamily', href: '/industry/multifamily' },
      { label: 'Commercial', href: '/industry/commercial' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Why Express Kitchens', href: '/why-express-kitchens' },
      { label: 'Showrooms', href: '/showrooms' },
      { label: 'Careers', href: '/careers' },
      { label: 'Refer a friend', href: '/refer-a-friend' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Support', href: '/support' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping & pickup', href: '/shipping-policy' },
      { label: 'Returns', href: '/returns-policy' },
      { label: 'Warranty', href: '/warranty' },
      { label: 'Price match guarantee', href: '/price-match-guarantee' },
      { label: 'Secure shopping', href: '/secure-shopping' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Cart', href: '/cart' },
      { label: 'Search', href: '/search' },
    ],
  },
];
