// Footer link columns, per the wireframe. Developer-edited (like menu-config.ts); Makeswift can
// append links to a column (same title) or add columns via the Site Footer component.
// A link without `href` renders as a sub-heading inside the column ("Offers", "Industries").
// `href: '#'` = page not built yet.

import { type Section } from '@/vibes/soul/sections/footer';

export const FOOTER_SECTIONS: Section[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Cabinets', href: '/cabinets' },
      { label: 'Closets', href: '/closets' },
      { label: 'Countertops', href: '/countertops' },
      { label: 'Appliances', href: '/appliances' },
      { label: 'Windows', href: '/windows' },
      { label: 'Doors', href: '/doors' },
      { label: 'Siding', href: '/siding' },
      { label: 'Bath', href: '/bath' },
      { label: 'Cabinet hardware', href: '/cabinet-hardware' },
      { label: 'Sinks & faucets', href: '/sinks-faucets' },
      { label: 'Offers' },
      { label: 'Sale', href: '/sale' },
      { label: 'Clearance', href: '/clearance-sale' },
      { label: 'Promotions', href: '/promotions' },
    ],
  },
  {
    title: 'Inspiration',
    links: [
      { label: 'Best-selling designs', href: '/inspiration/best-sellers' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Testimonials', href: '/testimonials' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Free design consult', href: '/mykitchen/free-design-consult' },
      { label: 'Kitchen estimator', href: '/mykitchen/price-my-kitchen' },
      { label: 'Blog', href: '/blog' },
      { label: 'Order samples', href: '/samples' },
      { label: 'Financing', href: '/financing' },
      { label: 'Download brochure', href: '#' },
      { label: 'Measuring guide', href: '/resources/measuring-guide' },
      { label: 'What is a 10×10 kitchen', href: '/resources/ten-by-ten-kitchen' },
      { label: 'How-to videos', href: '/resources/how-to-videos' },
      { label: 'Cabinet care', href: '/resources/cabinet-care' },
      { label: 'Cabinet glossary', href: '/help/cabinet-glossary' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about-us' },
      { label: 'Why Express Kitchens', href: '/why-express-kitchens' },
      { label: 'Compare cabinet companies', href: '/compare-cabinet-companies' },
      { label: 'Showrooms', href: '/showrooms' },
      { label: 'Pro', href: '/pro' },
      { label: 'Industries' },
      { label: 'Commercial', href: '/industry/commercial' },
      { label: 'Multifamily', href: '/industry/multifamily' },
      {
        label: 'Factory outlet ↗',
        href: 'https://expresskitchensfactoryoutlet.com/',
        target: '_blank',
      },
      { label: 'Wholesale ↗', href: 'https://kunalkitchens.com/', target: '_blank' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping & pickup', href: '/shipping-policy' },
      { label: 'Returns', href: '/returns-policy' },
      { label: 'Warranty', href: '/warranty' },
      { label: 'Price match', href: '/price-match-guarantee' },
      {
        label: 'Find an installer ↗',
        href: 'https://www.contractors.com/g/contractor-search/?category=Additions+and+Remodels&subcategory=Remodel%20-%20Multiple%20Rooms',
        target: '_blank',
      },
    ],
  },
];

export const FOOTER_CONTACT = {
  // Two lines: the question, then the offer (rendered with the line break kept).
  title: 'Have a question?\nCall or text us 24/7',
  phone: { label: '860-247-1000', href: 'tel:+18602471000' },
  hoursTitle: 'Working hours',
  hours: ['Vary by showroom', 'Mon – Sat: 9 AM to 6 PM (Eastern)', 'Sunday: Closed'],
  showroomsTitle: 'Find a showroom',
};

export const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Sitemap', href: '/sitemap' },
];

export const FOOTER_NEWSLETTER = {
  title: 'Subscribe to our newsletter',
  description:
    'Design trends, new collections, showroom events and offers, once a month, in one email.',
  placeholder: 'Your email',
  submitLabel: 'Subscribe',
};

export const FOOTER_BRAND_DESCRIPTION =
  'Express Kitchens excels at delivering affordable kitchen remodeling solutions for residential and commercial clients.';
