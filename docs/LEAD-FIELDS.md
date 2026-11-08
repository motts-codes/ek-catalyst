# Lead forms: fields captured, for the monday.com board

Status: 8 Nov 2026. Every form below posts through `lib/forms/submit-lead.ts` and, once
`MONDAY_API_TOKEN` and `MONDAY_BOARD_ID` are set, lands on the monday.com board as one item
(`lib/leads/monday.ts`). Account creation is not a lead and goes to BigCommerce only.

## How the old landing page did it (and what we copy)

The Stencil page `/shop-assembled-cabinets-lp/` never called monday.com itself. Its form posted
one flat JSON payload to a **Pabbly Connect** webhook, which maps the keys onto monday.com
columns, and a second copy to a **Google Apps Script** that logs a sheet. The payload was:
`name, email, phone, preference, source, page_url, date, timestamp` plus any of
`utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid` captured from the
landing URL and kept in sessionStorage.

The new site does the same from the server (`lib/leads/webhook.ts`, URLs in
`LEAD_WEBHOOK_URLS`, comma-separated), so the webhook URLs are no longer visible in page source,
BotID and the honeypot run first, and the Pabbly mapping stays where it is. Every lead form
carries the same attribution fields (`vibes/soul/form/tracking-fields`). The payload keeps the old
keys and adds the rest of the form:

| Key                                                                        | Value                                                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `name`                                                                     | the Name field, or first + last name joined                           |
| `email`, `phone`, `zip`, and every other field of that form, by field name | as typed; multi-selects joined with ", "; empty fields omitted        |
| `form`, `form_label`                                                       | short id (`contact`) and label (`Contact`)                            |
| `source`                                                                   | `EK Website – <Form label>` (the old page sent `EK Landing Page – …`) |
| `page_url`                                                                 | URL of the page the form was on                                       |
| `date`, `timestamp`                                                        | `11/8/2026` (US Eastern) and ISO 8601                                 |
| `utm_source` … `fbclid`                                                    | only when present                                                     |

**Mapping work for the client (or us, if we own the Pabbly account):** the existing workflow maps
the old page's handful of keys. New forms send more keys, listed below per form. In Pabbly, each
new key either maps to an existing monday column, or a new column is created on the board first
and then mapped. Keys that stay unmapped are simply ignored by Pabbly, so nothing breaks while the
mapping grows. Suggest routing by `form_label` (one Pabbly router step) so each form can map to
its own group or columns.

The direct monday.com integration below remains available as an alternative or a second channel.

## How a lead arrives on the board (direct monday.com integration)

- **Item name:** `<Form> · <Name>` (falls back to the email, then "Website lead").
- **First update on the item:** every submitted field as `Field: value`, plus the form name.
  Nothing is lost even if the board has no matching column.
- **Columns:** filled only for fields listed in `MONDAY_COLUMN_MAP`
  (`{"<field>": "<column id>"}`). Email and phone columns receive their proper shapes, `message`
  goes to a Long Text column, everything else to Text. Two extra keys are available: `form` (the
  form's label, good for a Status or Dropdown column) and `source` (always "website").

So the client does not strictly need a column per field. The practical minimum is a column each
for form, name, email, phone, ZIP and message, and the rest stays readable in the update.

## Fields by form

Shared contact fields (used by most forms): `name` text, `email` email, `phone` tel, `zip` text.

| Form (label on the board)      | Page(s)                                               | Fields beyond the shared ones                                                                                                                                                                                                                                               |
| ------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contact                        | /contact                                              | `topic` select (product, order, delivery, return, warranty, design, pro, other) · `orderNumber` · `message` textarea, required · `audience` select (homeowner / pro) · `firstName` + `lastName` instead of `name` · `smsConsent` checkbox. `phone` and `zip` optional here. |
| Free design consult            | /mykitchen/free-design-consult                        | `layout` (L, U, galley, island…) · `island` yes/no · `timing` (when to start) · `budget` select · `format` (showroom / video / phone), required · `showroom` select · `days` multi · `time` (morning / afternoon / evening) · `company` when the visitor is a pro           |
| Book                           | /book                                                 | `showroom` select, required · `format` (in showroom / video), required · `appointmentDate` · `time` slot, required · `rooms` multi (kitchen, bath, closet…), required · `notes`                                                                                             |
| Quote request (countertops)    | /countertops, every category page, every product page | `material` (granite / quartz / laminate / prefab / unsure) · `sqft` · `cutouts` (sink / cooktop / both / none) · `notes` · `product` hidden, the product the visitor was on (product pages only)                                                                            |
| Quote request (siding)         | /siding                                               | `type` select · `squares` · `notes`                                                                                                                                                                                                                                         |
| Commercial / multifamily       | /industry/commercial, /industry/multifamily           | `company`, required · `scope` text, required ("Project: scope" or "Project: number of units") · `timeline`. No `zip`.                                                                                                                                                       |
| Pro Program                    | /pro-program                                          | `company`, required · `license` (trade license or resale certificate), required · `showroom` select. No `zip`.                                                                                                                                                              |
| Support                        | /support                                              | `orderNumber` · `message`, required. No `phone`, no `zip`.                                                                                                                                                                                                                  |
| Support (accessibility report) | /accessibility                                        | `contact` (email or phone in one box) · `page` · `message`, required. No `email`/`phone` split.                                                                                                                                                                             |
| Return                         | /returns-policy                                       | `orderNumber`, required · `items` textarea, required. No contact fields on the form itself.                                                                                                                                                                                 |
| Referral                       | /refer-a-friend (page not linked yet)                 | `name` · `email` only                                                                                                                                                                                                                                                       |

Defined but not yet on any page: Price match, Kitchen estimate ("email me this estimate").

## Union of field names

`audience, budget, company, contact, cutouts, date, days, email, firstName, format, island,
items, lastName, layout, license, material, message, name, notes, orderNumber, page, phone,
product, rooms, scope, showroom, smsConsent, sqft, squares, time, timeline, timing, topic,
type, zip`, plus the two synthetic keys `form` and `source`.

## Mapping to the WF28 board

The target is the existing monday.com board **WF28 Online Nurturing Funnel** (board 5532533891),
89 columns, listed with types by monday AI on 8 Nov 2026. The full key-by-key mapping is the
workbook `docs/EK-lead-fields-monday.xlsx` (sheets: Mapping, Columns to create, Board columns,
Fields by form, Read me). In short:

- **Maps to existing columns:** name → Name, lastName → Last name, email → Customer Primary
  Email Address, phone → Customer Primary Number, zip → Zip Code, company → Company Name
  (Commercial), page_url (+ source) → Lead Source Detail, utm_source/medium/campaign/content →
  the four Utm columns, gclid/fbclid → Ad codes, layout / timing / budget → the three
  questionnaire Text columns, format → Preference, island → Plan, rooms → What type of project
  are you considering?, message / notes / items → Message, smsConsent → SMS Opt-in, showroom →
  Store, appointmentDate → Preffered Date for Appointment, time + days → Preffered Time for
  Appointment, scope (units) → Unit Count (Commercial), timeline → Delivery Timeline (Commercial),
  date → Entry Date.
- **Fixed values set in Pabbly:** Lead Source = Website, Platform = Website.
- **New columns needed:** Web Form (Status, from form_label), Contact Topic (Status), Customer
  Type (Status), Order Number (Text), Trade License / Resale No (Text), Product of Interest (Text),
  Utm Term (Text, low priority). Optional, or fold into Message: Countertop Material (Status),
  Approx. Sq Ft (Text), Cut-outs (Status).
- **Status columns only accept their existing labels**, so the payload also carries ready-made
  keys in the board's own wording (labels read from the board on 8 Nov 2026): `store`
  (CT - BROOKFIELD, CT - NEW LONDON, CT - NEWINGTON, CT - ORANGE, CT - STAMFORD, CT-BRISTOL),
  `design_option` (In-Store / Virtual, for Kitchen Design options), `preference` (Showroom Consult /
  Virtual Consult), `sms_opt_in` (IN / OUT) and `state` (CT or MA / NY / NJ, from the ZIP). The
  Commercial and Multifamily forms gained an optional Project type dropdown whose values are the
  board's six Project Type (Commercial) options. Lead Source has "Website" and "Website – Contact
  Us" labels; Platform has only fb / ig. The "Status labels" sheet of the workbook lists every
  label of the relevant columns.

## What we need from Express Kitchens

1. A monday.com API token (Admin, API) for a user with write access to the board.
2. The board id (from the board URL) and, if leads should land in a specific group, the group id.
3. Either the column ids for the mapping above, or read access so we can list them with the API.
4. A decision on whether Contact's SMS consent should be a checkbox column (it is a legal record;
   a column makes it filterable).
