# Category FAQ source

The FAQ metafields seeded by `scripts/seed-categories-and-faqs.py` (data in
`scripts/category-faqs.json` and `scripts/cabinet-rta-faq.json`) were captured verbatim from the
live expresskitchens.com category pages on 10 October 2026, as supplied by the client. Doors and
Assembled cabinets had no FAQ block on the live site.

Mapping: Bath → /bath; Sinks → /sinks-faucets/kitchen-sinks; Faucets → /sinks-faucets/kitchen-faucets
(its two bathroom-faucet questions also go to /bath/bathroom-faucets); the Sinks & Faucets parent
gets the kitchen sink + kitchen faucet questions; Countertops, Appliances, Windows → their
categories; Ready To Assemble (13) → the Cabinets category's `faq.by_program.rta`.

Policy statements inside these answers (5-day concealed-damage window, 30% restocking fee,
5–10 business day RTA ship time) are the live site's wording and differ from the wireframe's
shipping/returns pages (30 days, 2 weeks). The business must reconcile before launch; see
docs/CONTENT-PAGES.md.

## SEO copy (`seo.content`)

`scripts/category-seo.json` holds the long-form copy at the foot of each category and subcategory
page (34 pages), written in the site's customer voice from the wireframe's FS blocks with the
`[X]` placeholders resolved or dropped. One correction to the wireframe: it described countertops
as "supplied and installed"; Express Kitchens does not install anything, so the copy says
"measured to your cabinets" and "installation is not included". Prices quoted: granite from
$49.99 and quartz from $59.99 per sq ft (per the business). Re-run the seeder to update.
