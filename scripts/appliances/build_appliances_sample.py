"""Appliances sample import (Model B: one page per model, Finish = variant).
Inputs : _appl_sample_src.csv  (live Product + Image rows cut from the master export)
         _appl_sample_rewrite.json (rows from EK-Appliances-Rewrite-ModelB-1.xlsx, keyed by SKU)
Output : appliances-sample.csv (BigCommerce import), _appl_sample_report.json"""
import csv, json, re, html, collections
csv.field_size_limit(10**9)
COLS = json.load(open('/home/claude/coll/_out_cols.json'))
SRC = list(csv.DictReader(open('_appl_sample_src.csv', newline='')))
RW = json.load(open('_appl_sample_rewrite.json'))

# sample picks: (test bucket, workbook group # or accessory SKU)
PICKS = [('Refrigerators', 136), ('Refrigerators', 97), ('Freezers', 108), ('Freezers', 131),
         ('Range Hoods', 182), ('Range Hoods', 181), ('Ranges', 215), ('Ranges', 206),
         ('Dishwashers', 64), ('Dishwashers', 61), ('Microwaves', 171), ('Microwaves', 170),
         ('Washers', 269), ('Washers', 246), ('Dryers', 271), ('Dryers', 260),
         ('Air Conditioning', 33), ('Air Conditioning', 40), ('Garbage Disposals', 163), ('Garbage Disposals', 167),
         ('Wall Ovens', 235), ('Wall Ovens', 237), ('Accessories', '5304522751'), ('Accessories', 'IM117000')]
ACC = {'5304522751': 'Frigidaire Air Conditioner Through the Wall Sleeve',
       'IM117000': 'Frigidaire Top Mount Refrigerator Ice Maker Kit'}
NAME_FIX = {61: 'GE 24 in. Stainless Steel Interior Dishwasher with Sanitize Cycle, ENERGY STAR (ADA Compliant)'}
FINISH_FIX = {'PTW700BPTDG': 'Diamond Gray', 'PTD70EBPTDG': 'Diamond Gray'}   # workbook had no finish
FIN_ORDER = ['Stainless Steel', 'Fingerprint Resistant Stainless Steel', 'White', 'Black']

def orig(u):
    m = re.match(r'^(https://cdn\d+\.bigcommerce\.com/s-[^/]+)/products/(\d+)/images/(\d+)/(.+?)\.(\d+)\.\d+\.\d+\.(\w+)(\?.*)?$', u)
    if not m: return u
    host, pid, iid, fn, ts, ext, q = m.groups()
    return f'{host}/images/stencil/original/products/{pid}/{iid}/{fn}.{ts}.{ext}{q or ""}'
def ckey(u):
    fn = u.split('/')[-1].split('?')[0]
    return re.sub(r'__\d+\.\d+\.\w+$', '', fn).lower()
def slug(s):
    return '/' + re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', 'and')).strip('-') + '/'
def clean(s):
    return re.sub(r'\s+', ' ', re.sub(r'[\x00-\x1f\x7f-\x9f™®]', ' ', s)).strip()
def cf_json(cfs):
    return json.dumps([{'name': d['name'], 'value': d['value'].replace('"', '&quot;')} for d in cfs],
                      ensure_ascii=False, separators=(',', ':'))

live = {}; cur = None
for r in SRC:
    if r['Item'] == 'Product':
        cur = r['SKU'].strip(); live[cur] = dict(p=r, imgs=[])
    elif r['Item'] == 'Image' and cur:
        live[cur]['imgs'].append(r)
for v in live.values():
    v['imgs'].sort(key=lambda r: (r['Image is Thumbnail'] != 'TRUE', int(r['Image Sort Order'] or 0)))
    seen = set(); urls = []
    for r in v['imgs']:
        u = orig(r['Internal Image URL (Export)'])
        if ckey(u) not in seen: seen.add(ckey(u)); urls.append(u)
    v['urls'] = urls

groups = collections.defaultdict(list)
for sku, w in RW.items():
    if w: groups[w['Group #']].append(w)

out = []; report = []; slugs = set(); names = set()
def blank(): return {c: '' for c in COLS}
for bucket, key in PICKS:
    if isinstance(key, str):
        members = [dict(SKU=key, Finish='—', Role='Standalone')]; h1 = ACC[key]
    else:
        members = groups[key]; h1 = NAME_FIX.get(key) or clean(next(m for m in members if m['Role'] != 'Variant')['Product Name (H1)'])
    for m in members:
        f = FINISH_FIX.get(m['SKU'], m['Finish']); m['fin'] = '' if f in ('—', None) else f
    default = next(m for m in members if m['Role'] != 'Variant')
    multi = len(members) > 1
    members.sort(key=lambda m: (m is not default, FIN_ORDER.index(m['fin']) if m['fin'] in FIN_ORDER else 9, m['fin']))
    if multi: assert all(m['fin'] for m in members) and len({m['fin'] for m in members}) == len(members), key
    dp = live[default['SKU']]['p']
    assert h1 not in names and slug(h1) not in slugs; names.add(h1); slugs.add(slug(h1))
    cfs = [{'name': d['name'], 'value': html.unescape(d.get('value') or '')} for d in json.loads(dp['Custom Fields'] or '[]')]
    if not multi and default['fin']: cfs.append({'name': 'Finish', 'value': default['fin']})
    P = blank()
    P.update({'Item': 'Product', 'Name': h1, 'Type': 'physical', 'Inventory Tracking': 'none', 'Price': dp['Price'],
              'Description': dp['Description'] if len(dp['Description']) > 150 else '',   # short live descriptions are just the old name 'Custom Fields': cf_json(cfs),
              'Page Title': f"{h1} ({default['SKU']}) | Express Kitchens", 'Product URL': slug(h1),
              'Free Shipping': 'FALSE', 'Weight': dp['Weight'], 'Is Visible': 'TRUE', 'Is Featured': 'FALSE',
              'Tax Class': '0', 'Product Condition': 'New', 'Show Product Condition': 'FALSE'})
    if not multi:
        for k in ('SKU', 'Cost Price', 'UPC/EAN', 'Global Trade Number', 'Manufacturer Part Number', 'Width', 'Height', 'Depth'):
            P[k] = dp[k].strip()
    out.append(P)
    # gallery: default model's photos, then the main photo of each other finish
    gallery = [(u, default['fin']) for u in live[default['SKU']]['urls']]
    have = {ckey(u) for u, _ in gallery}
    for m in members:
        if m is default: continue
        us = live[m['SKU']]['urls']
        if us and ckey(us[0]) not in have: gallery.append((us[0], m['fin'])); have.add(ckey(us[0]))
    for i, (u, fin) in enumerate(gallery):
        I = blank()
        I.update({'Item': 'Image', 'Image URL (Import)': u, 'Image Description': h1 + (f' – {fin}' if multi and fin else ''),
                  'Image is Thumbnail': 'TRUE' if i == 0 else 'FALSE', 'Image Sort Order': str(i)})
        out.append(I)
    if multi:
        for m in members:
            lp = live[m['SKU']]['p']; V = blank()
            V.update({'Item': 'Variant', 'SKU': m['SKU'], 'Options': f"Type=Rectangle|Name=Finish|Value={m['fin']}",
                      'Price': lp['Price'], 'Cost Price': lp['Cost Price'], 'UPC/EAN': lp['UPC/EAN'],
                      'Global Trade Number': lp['Global Trade Number'], 'Manufacturer Part Number': lp['Manufacturer Part Number'],
                      'Free Shipping': 'FALSE', 'Weight': lp['Weight'], 'Width': lp['Width'], 'Height': lp['Height'], 'Depth': lp['Depth'],
                      'Variant Image URL': (live[m['SKU']]['urls'] or [''])[0]})
            out.append(V)
    report.append(dict(bucket=bucket, name=h1, url=slug(h1), default=default['SKU'], images=len(gallery),
                       members=[dict(sku=m['SKU'], finish=m['fin'], price=live[m['SKU']]['p']['Price'],
                                     old_name=live[m['SKU']]['p']['Name'], old_url=live[m['SKU']]['p']['Product URL'],
                                     nimg=len(live[m['SKU']]['urls'])) for m in members]))
with open('appliances-sample.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(out)
json.dump(report, open('_appl_sample_report.json', 'w'), indent=1)
c = collections.Counter(r['Item'] for r in out)
print(c, 'SKUs', sum(len(r['members']) for r in report))
for r in report:
    print(f"{r['bucket']:18} {r['name']}  [{r['images']} img]")
    for m in r['members']: print(f"      {m['sku']:14} {m['finish'] or '-':40} ${m['price']}  imgs {m['nimg']}")
