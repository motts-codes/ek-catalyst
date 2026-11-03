// The public brand name, used wherever the site names itself (title bar, copyright, receipts).
// Deliberately not the BigCommerce store name: the sandbox store is called "Express Kitchens -
// Sandbox", and the pages should read as the live site regardless of which store they run on.
export const BRAND_NAME = 'Express Kitchens';

// The nav and footer wordmark ships with the code rather than the store's logo setting, so it
// renders the same on every channel (the store-uploaded PNG carries heavy transparent padding).
export const BRAND_LOGO = { src: '/images/brand/ek-logo-nav.svg', alt: 'Express Kitchens' };
