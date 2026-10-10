# Kitchen estimator — how the number is calculated

The estimator at `/mykitchen/calculator` gives a visitor a price range for their kitchen in four
steps: layout, measurements, package, estimate. The wireframe specified the flow but not the maths;
this document is the maths. All constants live in `lib/estimator/config.ts`; the calculation is a
pure function in `lib/estimator/estimate.ts` with unit tests in `lib/estimator/estimate.test.ts`.

## The approach (and why)

Every cabinet estimator on the market — CliqStudios, Lowe's, the big RTA sellers — works the same
way: turn the kitchen into **linear feet of cabinet run**, multiply by a **price per linear foot**,
and show a **range** because door style and finish move the number. The industry anchor for the
rate is the **10×10 kitchen**: two 10-foot walls in an L, 20 linear feet of cabinets. A seller's
10×10 price divided by 20 is their price per linear foot.

Express Kitchens already publishes a 10×10 price on every collection, so the estimator scales
**EK's own live prices** rather than a generic rate. That keeps the estimator honest: the number on
the estimator and the number on the collection card come from the same place.

## Inputs

| Step | Input | Values |
| --- | --- | --- |
| 1 | Layout | `l` (two walls), `straight` (one wall), `u` (three walls), `galley` (two facing walls) |
| 2 | Wall lengths, ft | A; A+B for L and galley; A+B+C for U. Each 3–40 ft |
| 2 | Ceiling height, ft | 8, 9, 10+ |
| 2 | Island | yes / no |
| 3 | Package | `essentials`, `premium`, `luxe` |

## Calculation

1. **Linear feet of run (LF).** Sum of the walls, minus 2 ft per inside corner (a corner cabinet
   serves both walls): L −2, U −4, straight and galley 0. Clamped to a minimum of 6 ft.
2. **Cabinet price per foot.** `rate = package10x10 / 20`, where `package10x10` is the 10×10 price
   of the collections in that package, taken from the live assembled collection data:
   - Essentials = the lowest 10×10 price in the catalog
   - Premium = the median
   - Luxe = the highest
   Fallbacks (used when the catalog has fewer than two priced collections) are in the config.
3. **Cabinets.** `cabinets = LF × rate × ceilingFactor`. Ceiling factor: 8 ft → 1.00 (30 in. wall
   cabinets, as in the 10×10); 9 ft → 1.08 (36 in.); 10 ft+ → 1.15 (42 in.).
4. **Island.** Adds `6 ft × rate × 0.6`: a typical island is about six feet of base cabinets, and
   base cabinets are roughly 60% of the per-foot cost (no wall cabinets above them).
5. **Countertop.** `sqft = LF × 2.1` (a 25-inch-deep counter) `+ 18` if there is an island.
   Priced per square foot by package: Essentials laminate, Premium and Luxe quartz. The granite and
   quartz rates are EK's published prices ($49.99 / $59.99); the laminate rate is a placeholder.
6. **Extras by package.** Essentials: standard handles. Premium: sink & faucet. Luxe: sink &
   faucet, handles, and an appliance bundle (range, hood, dishwasher, fridge). Handle count is
   `LF × 1.6` (about one knob or pull per 7–8 in. of run).
7. **Total and range.** `total = cabinets + island + countertop + extras`.
   `low = total × 0.90`, `high = total × 1.15`: collections inside a package band sit a little
   either side of the band's reference price, and finishes add on top.
8. **RTA saving.** Shown as a line, not a second estimate: `cabinets × (1 − rtaRatio)`, where
   `rtaRatio` is the live Avon RTA 10×10 divided by Avon assembled (about 0.91 in the sandbox).

**Excluded, and said so on screen:** installation (EK never installs), delivery and tax.

## The breakdown table

Cabinets are split for display only: wall cabinets 40%, base cabinets 50%, trim and fillers 10%
of the cabinet figure. Quantities are shown as feet of run, not cabinet counts, to avoid false
precision. Countertop shows square feet; sink/faucet and the appliance bundle show as one line each.

## Constants to confirm with the business

In `lib/estimator/config.ts`, marked `// confirm`:

- Laminate countertop rate per sq ft (placeholder $19.99)
- Sink & faucet allowance (placeholder $450)
- Handle price (placeholder $6 standard, $9 Luxe)
- Appliance bundle (placeholder $4,500)
- Fallback 10×10 prices when the catalog is empty (Essentials $2,800, Premium $3,300, Luxe $4,100)
- The range factors (0.90 / 1.15), the ceiling factors and the island rule

Everything else comes from the live collection data and EK's published countertop prices.

## Worked example

L-shaped, walls 10 ft and 12 ft, 8 ft ceiling, no island, Premium (Avon-level 10×10 = $3,289.55):

- LF = 10 + 12 − 2 = 20 ft; rate = 3,289.55 / 20 = $164.48/ft
- cabinets = 20 × 164.48 × 1.00 = $3,290
- countertop = 20 × 2.1 = 42 sq ft × $59.99 = $2,520
- sink & faucet = $450
- total = $6,259 → **range $5,630 – $7,200** (range rounded to $10)
- RTA would save about $300 on the cabinets

## Sources

- CliqStudios estimator (linear-foot averaging, range output): https://www.cliqstudios.com/kitchen-cabinet-estimator-tool/
- 10×10 scaling rule (10×10 price ÷ 20 = per-foot rate): https://www.prefinishedcabinets.com/understandingbasic10x10kitchenprici
- Industry per-linear-foot bands for context: https://kitchencabinetkings.com/guides/kitchen-cabinet-costs
