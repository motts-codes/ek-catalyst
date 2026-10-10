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
