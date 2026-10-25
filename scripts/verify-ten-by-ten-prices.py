#!/usr/bin/env python3
"""Check the generated 10x10 price table against EK's workbook.

Run after scripts/build-ten-by-ten-prices.py, with the same workbook:

    python3 scripts/verify-ten-by-ten-prices.py ~/Downloads/"Kichen estimator"/EK_10x10_Pricing_AllPrograms.xlsx

It confirms that every Active 10x10 row is in lib/estimator/ten-by-ten-prices.ts at the workbook's
price, that no Discontinued row leaked in, that each Program|Door lookup matches the Source tab's
10x10 Total, and that the site's per-foot and monthly maths (ROUND(total/20, 2) and the amortised
GreenSky payment) reproduce the workbook's cached columns H and I for every row.
"""
import re
import sys
from decimal import ROUND_HALF_UP, Decimal

import openpyxl

if len(sys.argv) < 2:
    sys.exit(__doc__)

wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
src = wb["Source Pricing (DB)"]
APR = Decimal(str(src["B3"].value))
N = int(src["B4"].value)
LF = Decimal(str(src["B5"].value))

ts = open("lib/estimator/ten-by-ten-prices.ts").read()
rows = re.findall(
    r"program: '([^']*)',\s*door: '([^']*)',\s*color: '([^']*)',\s*tier: '([^']*)',\s*code: (?:\d+|null),\s*price: ([\d.]+)",
    ts,
)
gen = {(p, d, c): Decimal(price) for p, d, c, _tier, price in rows}
print(f"generated rows: {len(gen)}")

r = APR / Decimal(1200)
xround = lambda x: x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)  # Excel ROUND


def site_maths(price):
    per_foot = xround(price / LF)
    monthly = xround(price * (r * (1 + r) ** N) / ((1 + r) ** N - 1))
    return per_foot, monthly


problems = 0
active = wb["Active 10x10"]
n = 0
for row in active.iter_rows(min_row=5, values_only=True):
    _n, program, door, _code, color, _tier, price, per_foot, emi = (row + (None,) * 9)[:9]
    if not program or not door:
        continue
    n += 1
    key = (program.strip(), door.strip(), (color or "").strip())
    if key not in gen:
        problems += 1
        print(f"  MISSING on site: {key}")
        continue
    if abs(gen[key] - Decimal(str(price))) > Decimal("0.005"):
        problems += 1
        print(f"  PRICE DIFF {key}: site {gen[key]} workbook {price}")
    pf, mo = site_maths(gen[key])
    if per_foot is not None and (abs(pf - Decimal(str(per_foot))) > Decimal("0.005") or abs(mo - Decimal(str(emi))) > Decimal("0.005")):
        problems += 1
        print(f"  MATHS DIFF {key}: site {pf}/{mo} workbook {per_foot}/{emi}")
print(f"active rows: {n} checked")
if n != len(gen):
    problems += 1
    print(f"  COUNT DIFF: workbook has {n} active rows, site has {len(gen)}")

lists = wb["Lists"]
keys = 0
for lrow in lists.iter_rows(min_row=2, min_col=3, max_col=4, values_only=True):
    key, source_row = lrow
    if not key:
        continue
    keys += 1
    total = src.cell(row=int(source_row), column=19).value
    program, door = key.split("|")
    prices = {v for (p, d, _c), v in gen.items() if p == program and d == door}
    if total is None or len(prices) != 1 or abs(next(iter(prices)) - Decimal(str(total))) > Decimal("0.005"):
        problems += 1
        print(f"  SOURCE TOTAL DIFF {key}: workbook {total} site {prices}")
print(f"lookup keys: {keys} checked against Source totals")

disc = wb["Discontinued 10x10"]
leaked = 0
for row in disc.iter_rows(min_row=5, values_only=True):
    _n, program, door, _code, color = (row + (None,) * 5)[:5]
    if program and door and (program.strip(), door.strip(), (color or "").strip()) in gen:
        leaked += 1
        print(f"  DISCONTINUED on site: {program} | {door} | {color}")
problems += leaked
print(f"discontinued rows leaked: {leaked}")

print("OK: site matches the workbook" if problems == 0 else f"{problems} problem(s)")
sys.exit(1 if problems else 0)
