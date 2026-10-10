# Content pages — review links

Every page built from the wireframe (Oct 2026), grouped the way the wireframe grouped them. Links
are for the local dev server (`pnpm run dev`, Node 24). Swap `http://localhost:3000` for the
preview host when one exists.

Legend: **form** = has a lead form (logs server-side only; no CRM yet) · **live** = pulls prices
or data from BigCommerce · **[X]** = page still has placeholders the business must fill.

## Home and shop entry points

| Page | Link | Notes |
| --- | --- | --- |
| Home | http://localhost:3000/ | Option B e-commerce homepage |
| Pro home | http://localhost:3000/pro | Audience-mode variant |
| Cabinets hub | http://localhost:3000/cabinets | Guided landing: styles → lines → program → comparison |
| Assembled cabinets listing | http://localhost:3000/cabinets/assembled-cabinets | live |
| RTA cabinets listing | http://localhost:3000/cabinets/rta-cabinets | live |
| Quick Ship cabinets | http://localhost:3000/quick-ship-cabinets | |
| Cabinet hardware | http://localhost:3000/cabinet-hardware | Shop landing; tiles link to search until BC categories exist |
| Sinks & faucets | http://localhost:3000/sinks-faucets | Shop landing |
| Bath | http://localhost:3000/bath | Shop landing |
| Countertops | http://localhost:3000/countertops | Quote form / phone; no cart (EK doesn't install) |
| Doors | http://localhost:3000/doors | |
| Siding | http://localhost:3000/siding | |
| Sale | http://localhost:3000/sale | |
| Clearance | http://localhost:3000/clearance-sale | |
| Promotions | http://localhost:3000/promotions | |

## Plan your kitchen (`/mykitchen`)

| Page | Link | Notes |
| --- | --- | --- |
| Explore hub | http://localhost:3000/mykitchen | Four paths; live lowest 10×10 prices |
| How RTA works | http://localhost:3000/mykitchen/cabinets/rta | Guided explainer |
| How assembled works | http://localhost:3000/mykitchen/cabinets/assembled | Guided explainer |
| Kitchen estimator | http://localhost:3000/mykitchen/calculator | live · form (email me) · logic in `docs/ESTIMATOR-LOGIC.md` |
| Visualizer | http://localhost:3000/mykitchen/visualizer | Placeholder until a third-party embed is chosen |

## Get help

| Page | Link | Notes |
| --- | --- | --- |
| Free design consult | http://localhost:3000/free-design | form |
| └ confirmation | http://localhost:3000/free-design/confirmed | |
| Book a showroom appointment | http://localhost:3000/book | form · date + 90-min slots |
| └ preselected showroom | http://localhost:3000/book?showroom=newington | |
| └ confirmation | http://localhost:3000/book/confirmed | |
| Showrooms | http://localhost:3000/showrooms | |
| └ Brookfield | http://localhost:3000/showrooms/brookfield | [X] Project Manager |
| └ New London | http://localhost:3000/showrooms/new-london | [X] Project Manager |
| └ Newington | http://localhost:3000/showrooms/newington | |
| └ Orange | http://localhost:3000/showrooms/orange | [X] Project Manager |
| └ Stamford | http://localhost:3000/showrooms/stamford | [X] Project Manager |
| └ Bristol (factory outlet) | http://localhost:3000/showrooms/bristol | |
| Order samples | http://localhost:3000/samples | FREESAMPLES code |
| Financing | http://localhost:3000/financing | |
| Contact | http://localhost:3000/contact | form |
| └ confirmation | http://localhost:3000/contact/confirmed | |
| Find an installer | http://localhost:3000/find-a-pro | EK doesn't install |

## Inspiration

| Page | Link | Notes |
| --- | --- | --- |
| Inspiration | http://localhost:3000/inspiration | |
| Best-selling designs | http://localhost:3000/inspiration/best-sellers | |
| Finished kitchens | http://localhost:3000/inspiration/projects | |
| └ example project | http://localhost:3000/inspiration/projects/hartford-avon-galley | |
| Reviews | http://localhost:3000/reviews | |
| Testimonials | http://localhost:3000/testimonials | |
| Blog | http://localhost:3000/blog | BigCommerce blog (not rebuilt) |

## Resources

| Page | Link | Notes |
| --- | --- | --- |
| Resources | http://localhost:3000/resources | |
| Measuring guide | http://localhost:3000/resources/measuring-guide | |
| What is a 10×10 kitchen | http://localhost:3000/resources/ten-by-ten-kitchen | `/resources/10x10-kitchen` redirects here |
| How-to videos | http://localhost:3000/resources/how-to-videos | |
| Cabinet care | http://localhost:3000/resources/cabinet-care | |
| Compare cabinet companies | http://localhost:3000/compare-cabinet-companies | live EK column · [X] competitor cells on purpose |

## For the trade

| Page | Link | Notes |
| --- | --- | --- |
| Pro Program | http://localhost:3000/pro-program | form |
| └ confirmation | http://localhost:3000/pro-program/confirmed | |
| Industries | http://localhost:3000/industry | form |
| └ Multifamily | http://localhost:3000/industry/multifamily | form |
| └ Commercial | http://localhost:3000/industry/commercial | form |
| Quote confirmation | http://localhost:3000/quote/confirmed | |

## Company

| Page | Link | Notes |
| --- | --- | --- |
| About | http://localhost:3000/about | |
| Why Express Kitchens | http://localhost:3000/why-express-kitchens | |
| Careers | http://localhost:3000/careers | form |
| Refer a friend | http://localhost:3000/refer-a-friend | form |
| └ confirmation | http://localhost:3000/refer-a-friend/confirmed | |

## Support and legal

| Page | Link | Notes |
| --- | --- | --- |
| Support | http://localhost:3000/support | form |
| FAQ | http://localhost:3000/faq | |
| Shipping & pickup | http://localhost:3000/shipping-policy | Return-window conflict noted (30 vs 5 days) |
| Returns | http://localhost:3000/returns-policy | form |
| Warranty | http://localhost:3000/warranty | |
| Price match guarantee | http://localhost:3000/price-match-guarantee | form |
| Secure shopping | http://localhost:3000/secure-shopping | |
| Accessibility | http://localhost:3000/accessibility | |
| Privacy | http://localhost:3000/privacy | |
| Terms | http://localhost:3000/terms | |
| Sitemap | http://localhost:3000/sitemap | Human-readable, every page |

## Not built (by decision)

- `/myclosets` — closets are direct shopping, few products; the category page is enough.
- Blog article and author pages — BigCommerce blog through the proxy.
- One-row dropdown filter bar on listings — parked for the last stage.

## Still pointing at `#`

Subcategories that need BigCommerce categories first: Countertop types (Granite / Laminate /
Quartz / Prefabricated), Appliances and Windows subcategories; and the "Download brochure" PDF.
Bath, Cabinet hardware and Sinks & faucets subcategory tiles link to site search in the meantime.
