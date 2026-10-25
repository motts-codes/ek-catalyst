# Kitchen estimator — how the number is calculated

The estimator at `/mykitchen/price-my-kitchen` shows the price of a **standard 10×10 kitchen** in the
cabinet line, door style and color the visitor picks. Version 1 (client brief, 25 Oct 2026) prices
nothing larger than the 10×10 and nothing but cabinets. The visitor sees three figures: the 10×10
price, the price per linear foot, and an "as low as $X/month" GreenSky payment, then a button to
book a free design.

## Where the numbers come from

EK's workbook `EK_10x10_Pricing_AllPrograms.xlsx` (Oct 2026) has three tabs that matter:

- **Source Pricing (DB)** — one row per program × door style × color with the SalesPrice of each of
  the 13 cabinets in the 10×10 BOM (columns G–R, the W2130 wall cabinet counted twice via the
  quantity row). Some rows are group-fills (`=R27` style references to another row). The APR, term
  and linear feet live in B3–B5.
- **Active 10x10** — the rows the estimator may offer, with a formula pointing at the Source row.
- **Estimator** — the maths: `10x10 = SUMPRODUCT(qty, prices)`, `per ft = 10x10 / 20`,
  `monthly = PMT(APR/12, term, 10x10)`.

`scripts/build-ten-by-ten-prices.py` reads the workbook, resolves the references, applies the
SUMPRODUCT and writes **`lib/estimator/ten-by-ten-prices.ts`** (generated, committed): 668 rows of
`{ program, door, color, tier, code, price }` plus `TEN_BY_TEN_APR`, `TEN_BY_TEN_TERM_MONTHS` and
`TEN_BY_TEN_LINEAR_FEET`. Re-run it when EK sends a new workbook:

```bash
python3 scripts/build-ten-by-ten-prices.py ~/Downloads/"Kichen estimator"/EK_10x10_Pricing_AllPrograms.xlsx
```

The output was checked against the from-prices in EK's one-page blurb
(`EK_10x10_Estimator_Blurb.pdf`) and matches to the cent.

## The picks

| Step | Pick                                                    | Effect on price                                                                                       |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1    | Shape: L, U, galley, single wall                        | **None.** Swaps the kitchen render only; every shape uses the same 13-cabinet mix.                    |
| 2    | Line: Star, Prism, Euro, then a build or tier inside it | Sets the workbook program (see below).                                                                |
| 3    | Door style                                              | Sets the price, with the program.                                                                     |
| 4    | Color                                                   | **None** within a door style, except Prism, where three premium colors use the Prism Premium program. |

Line → workbook program:

- **Star** → `Framed Star Assembled` or `Framed Star RTA` (12 door styles).
- **Prism** → `Framed Prism` for the seven standard colors, `Framed Prism Premium` for Charcoal,
  Hurricane and Midnight (7 door styles).
- **Euro** → `Frameless Euro Value`, `Frameless Euro Max`, `Frameless Euro Max Custom` or
  `Frameless Euro Max RTA` (7 door styles; RTA is Eden only).

A door style that comes in a single finish (most stained Star doors) skips the color step: the one
finish is chosen for the visitor and the panel reads "Standard finish".

## The maths (`lib/estimator/ten-by-ten.ts`)

```
price    = TEN_BY_TEN_ROWS row for (program, door, color).price
perFoot  = price / 20                                   # TEN_BY_TEN_LINEAR_FEET
r        = 11.99 / 1200                                  # TEN_BY_TEN_APR, monthly rate
monthly  = price · r(1+r)^180 / ((1+r)^180 − 1)          # TEN_BY_TEN_TERM_MONTHS, GreenSky plan 1519
```

Both derived figures are rounded to the cent; the 10×10 price is shown in whole dollars. The "from
$X" badge on each line card is the lowest row in that line's programs.

## What the 10×10 is

13 cabinets, about 20 linear feet: three base cabinets (12", 15", 18"), a 36" sink base, a blind
corner base, four wall cabinets (12", two 21", 39"), a diagonal corner wall, two bridge cabinets
(over the hood and the fridge) and a 3" filler. `TEN_BY_TEN_CABINETS` lists these on the page.

## Fine print

`TEN_BY_TEN_FINE_PRINT` is the PDF's disclaimer: cabinets only, no countertops / appliances /
hardware / delivery / installation; GreenSky at 11.99% APR for 180 months, subject to credit
approval, showrooms only; final pricing after a free design consultation; prices as of 16 Oct 2026.
Update the date when the workbook is refreshed.

## Not in v1 (parked)

Room measurements, ceiling height, islands, countertops and the old low/high range. The previous
linear-foot estimator (`lib/estimator/config.ts`, `estimate.ts`, `kitchen-estimator` section) was
removed in Oct 2026; its approach is in git history if a bigger-than-10×10 mode is ever wanted.
