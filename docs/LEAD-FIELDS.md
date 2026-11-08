# Lead forms: fields captured, for the monday.com board

Status: 8 Nov 2026. Every form below posts through `lib/forms/submit-lead.ts` and, once
`MONDAY_API_TOKEN` and `MONDAY_BOARD_ID` are set, lands on the monday.com board as one item
(`lib/leads/monday.ts`). Account creation is not a lead and goes to BigCommerce only.

## How a lead arrives on the board

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
| Book                           | /book                                                 | `showroom` select, required · `format` (in showroom / video), required · `date` · `time` slot, required · `rooms` multi (kitchen, bath, closet…), required · `notes`                                                                                                        |
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

## Suggested board columns

A single "Website leads" board with groups per form works well with the mapping above:

| Column       | Type      | Mapped from                                                                      |
| ------------ | --------- | -------------------------------------------------------------------------------- |
| Form         | Status    | `form`                                                                           |
| Name         | Text      | `name` (Contact sends `firstName`/`lastName`; map both or rely on the item name) |
| Email        | Email     | `email`                                                                          |
| Phone        | Phone     | `phone`                                                                          |
| ZIP          | Text      | `zip`                                                                            |
| Showroom     | Dropdown  | `showroom`                                                                       |
| Company      | Text      | `company`                                                                        |
| Order number | Text      | `orderNumber`                                                                    |
| Message      | Long Text | `message` (or `notes` / `items` / `scope`)                                       |
| Source       | Text      | `source`                                                                         |

Everything else (layout, budget, cut-outs, dates, consent and so on) is visible in the item's
first update, and can be promoted to a column later by adding it to `MONDAY_COLUMN_MAP` without
a code change.

## What we need from Express Kitchens

1. A monday.com API token (Admin, API) for a user with write access to the board.
2. The board id (from the board URL) and, if leads should land in a specific group, the group id.
3. Either the column ids for the mapping above, or read access so we can list them with the API.
4. A decision on whether Contact's SMS consent should be a checkbox column (it is a legal record;
   a column makes it filterable).
