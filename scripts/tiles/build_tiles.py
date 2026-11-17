# EK backsplash tiles rework: 30 live MSI tiles (category 615) -> renamed single-SKU pages with filter fields.
# SKUs, prices, costs, UPCs unchanged. One page per tile: the pattern is the product, so nothing is merged into variants.
import csv, json, re, html, os, collections
HERE = os.path.dirname(os.path.abspath(__file__))
COLS = json.load(open('/home/claude/coll/_out_cols.json'))
SRC = json.load(open(os.path.join(HERE, '_tiles_src.json')))
CATEGORY = '890'   # sandbox ID of "Backsplash Tile" - fill in when known
def orig(u):
    m = re.match(r'^(https://cdn\d+\.bigcommerce\.com/s-[^/]+)/products/(\d+)/images/(\d+)/(.+?)\.(\d+)\.\d+\.\d+\.(\w+)(\?.*)?$', u)
    if not m: return u
    host, pid, iid, fn, ts, ext, q = m.groups()
    return f'{host}/images/stencil/original/products/{pid}/{iid}/{fn}.{ts}.{ext}{q or ""}'
def slug(s): return '/' + re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', 'and')).strip('-') + '/'
def cf_json(cfs): return json.dumps([{'name': n, 'value': v.replace('"', '&quot;')} for n, v in cfs], ensure_ascii=False, separators=(',', ':'))
MB, PB = 'Marble', 'Natural Stone Pebble'
# sku: (collection, pattern, finish, material, type, tile size, thickness)
T = {
 'SMOT-ATHGOL-CHEVH': ('Athena Gold', 'Chevron', 'Honed', MB, 'Mosaic Tile', '', ''),
 'SMOT-ATHGOL-LOLP': ('Athena Gold', 'Lola', 'Polished', MB, 'Mosaic Tile', '', ''),
 'SMOT-ATHGOL-PENRDH': ('Athena Gold', 'Penny Round', 'Honed', MB, 'Mosaic Tile', '', ''),
 'SMOT-ARA-HBH': ('Arabescato Carrara', 'Herringbone', 'Honed', MB, 'Mosaic Tile', '', ''),
 'SMOT-ARA-2HEXH': ('Arabescato Carrara', 'Hexagon', 'Honed', MB, 'Mosaic Tile', '2 in.', ''),
 'SMOT-ARAVEN-ARGH': ('Arabescato Venato White', 'Argyle', 'Honed', MB, 'Mosaic Tile', '', ''),
 'SMOT-ARAVEN-2HEXH': ('Arabescato Venato White', 'Hexagon', 'Honed', MB, 'Mosaic Tile', '2 in.', ''),
 'SMOT-BIANDOL-DOTP': ('Bianco Dolomite', 'Dotty', 'Polished', MB, 'Mosaic Tile', '', ''),
 'SMOT-BIANDOL-CEMDOTP': ('Bianco Dolomite', 'Crema Dotty', 'Polished', MB, 'Mosaic Tile', '', ''),
 'SMOT-BIANDOL-GEOP': ('Bianco Dolomite', 'Geometrica', 'Polished', MB, 'Mosaic Tile', '', ''),
 'SMOT-ANGORA-2X6P': ('Angora', 'Subway', 'Polished', MB, 'Mosaic Tile', '2 x 6 in.', ''),
 'SMOT-ANGORA-GEOP': ('Angora', 'Geometric', 'Polished', MB, 'Mosaic Tile', '', ''),
 'SMOT-ANGORA-FRM10MM': ('Angora', 'Framework', 'Polished', MB, 'Mosaic Tile', '', '10 mm'),
 'SMOT-CAPBLU-2X6H': ('Capri Blue', 'Subway', 'Honed', MB, 'Mosaic Tile', '2 x 6 in.', ''),
 'SMOT-AZULA-HATHWRKP': ('Azula', 'Hatchwork', 'Polished', MB, 'Mosaic Tile', '', ''),
 'SMOT-HENLEY-2HEX': ('Henley', 'Hexagon', '', MB, 'Mosaic Tile', '2 in.', ''),
 'SMOT-CECILY-POL10MM': ('Cecily', '', 'Polished', MB, 'Mosaic Tile', '', '10 mm'),
 'SMOT-GRE-1HEXP': ('Greecian White', 'Hexagon', 'Polished', MB, 'Mosaic Tile', '1 in.', ''),
 'TWHITOAK412H': ('White Oak', 'Subway', 'Honed', MB, 'Subway Tile', '4 x 12 in.', ''),
 'SMOT-SMTL-VERGOL8MM': ('Verona Gold', '', '', 'Marble & Metal', 'Mosaic Tile', '', '8 mm'),
 'SMOT-SMTL-LUXKOGOL8MM': ('Luxor Kona Gold', '', '', 'Stone & Metal', 'Mosaic Tile', '', '8 mm'),
 'SMOT-SGLSIL-SNOCAP4MM': ('Snowcap Blend', 'Interlocking', '', 'Glass & Stone', 'Mosaic Tile', '', '4 mm'),
 'SMOT-GLSST-ICEBE8MM': ('Ice', 'Bevel Subway', '', 'Glass', 'Mosaic Tile', '', '8 mm'),
 'SMOT-PT-RETBIA-1X6STM': ('White', 'Stack', 'Matte', 'Porcelain', 'Mosaic Tile', '1 x 6 in.', ''),
 'SMOT-CLAHB-NOBRED2.25X7.5': ('Noble Red', 'Herringbone', '', 'Clay Brick', 'Mosaic Tile', '2-1/4 x 7-1/2 in.', ''),
 'SMOT-CLABRI-NOBRED2.25X7.5': ('Noble Red', 'Brick', '', 'Clay Brick', 'Mosaic Tile', '2-1/4 x 7-1/2 in.', ''),
 'SMOT-CLATIL-ALPWHI2.25X7.5': ('Alpine White', 'Brick', '', 'Clay Brick', 'Loose Tile', '2-1/4 x 7-1/2 in.', ''),
 'SMOT-PEB-WHT': ('White Pebbles', 'Pebble', 'Tumbled', 'Marble Pebble', 'Mosaic Tile', '', '10 mm'),
 'THDW1-SH-PEB': ('Black and White Pebbles', 'Pebble', 'Tumbled', PB, 'Mosaic Tile', '', ''),
 'SMOT-PEB-TRUFFLE': ('Truffle Sliced Pebble', 'Pebble', 'Tumbled', PB, 'Mosaic Tile', '', ''),
}
def title(c, pat, fin, mat, typ, size):
    if mat == 'Clay Brick':
        return f"MSI {c} Clay Brick {'Herringbone ' if pat == 'Herringbone' else ''}{typ}, {size}"
    if 'Pebble' in mat: return f"MSI {c} {fin} {'Marble' if mat.startswith('Marble') else 'Stone'} {typ}"
    core = ' '.join(x for x in (c, size if pat in ('Subway', 'Hexagon', 'Stack') else '', pat, fin, mat) if x)
    if typ == 'Subway Tile': core = ' '.join(x for x in (c, size, fin, mat) if x)
    return f'MSI {core} {typ}'
items = []; cur = None
for r in SRC:
    if r['Item'] == 'Product': cur = dict(p=r, imgs=[]); items.append(cur)
    elif r['Item'] == 'Image': cur['imgs'].append(r)
out = []; report = []
for it in items:
    p = it['p']
    if p.get('Is Visible') != 'TRUE': continue
    sku = p['SKU'].strip(); c, pat, fin, mat, typ, size, thick = T[sku]
    m = re.search(r'BOX of (\d+) \(([\d.]+) Sqft Per Box', p['Name']); pcs, cov = m.group(1), m.group(2)
    cov_l = '2' if cov == '1.998' else cov
    name = f'{title(c, pat, fin, mat, typ, size)}, {cov_l} sq. ft. Box'
    live_cf = [(d['name'], html.unescape(d.get('value') or '')) for d in json.loads(p.get('Custom Fields') or '[]')]
    cfs = [(n, v) for n, v in live_cf if n in ('Stock Status', 'Price Range', '__badge', 'Shipping')] + [('Brand', 'MSI'), ('Collection', c)]
    cfs += [(n, v) for n, v in (('Pattern', pat), ('Finish', fin), ('Material', mat), ('Tile Size', size), ('Thickness', thick)) if v]
    cfs += [('Coverage per Box', f'{cov_l} sq. ft.'), ('Pieces per Box', pcs), ('Sold By', 'Box')]
    unit = 'loose tiles' if typ in ('Loose Tile', 'Subway Tile') else 'sheets'
    P = {k: '' for k in COLS}
    P.update({'Item': 'Product', 'Name': name, 'Type': 'physical', 'SKU': sku, 'Inventory Tracking': 'none', 'Price': p['Price'], 'Cost Price': p.get('Cost Price', ''), 'Categories': CATEGORY,
              'Description': f'<p>Sold by the box. Each box contains {pcs} {unit} and covers {cov_l} sq. ft.</p>', 'Custom Fields': cf_json(cfs),
              'Page Title': f'{name} | Express Kitchens', 'Product URL': slug(name), 'UPC/EAN': p.get('UPC/EAN', ''), 'Global Trade Number': p.get('Global Trade Number', ''),
              'Manufacturer Part Number': p.get('Manufacturer Part Number', ''), 'Free Shipping': 'FALSE', 'Weight': p.get('Weight', ''), 'Width': p.get('Width', ''), 'Height': p.get('Height', ''), 'Depth': p.get('Depth', ''),
              'Is Visible': 'TRUE', 'Is Featured': 'FALSE', 'Tax Class': '0', 'Product Condition': 'New', 'Show Product Condition': 'FALSE'})
    rows = [P]
    for i, im in enumerate(it['imgs']):
        I = {k: '' for k in COLS}; I.update({'Item': 'Image', 'Image URL (Import)': orig(im['Internal Image URL (Export)']), 'Image Description': name, 'Image is Thumbnail': 'TRUE' if i == 0 else 'FALSE', 'Image Sort Order': str(i)}); rows.append(I)
    out.append(rows); report.append(dict(sku=sku, name=name, old=p['Name'], price=p['Price'], cov=cov_l, pcs=pcs, ppsf=round(float(p['Price']) / float(cov), 2), mat=mat, pat=pat, fin=fin))
out.sort(key=lambda rows: rows[0]['Name'])
assert len({r[0]['Name'] for r in out}) == len(out) == 30
def write(fn, blocks):
    with open(os.path.join(HERE, fn), 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); [w.writerows(b) for b in blocks]
write('backsplash-tiles.csv', out)
SAMPLE = ['SMOT-ARA-HBH', 'SMOT-ATHGOL-PENRDH', 'SMOT-GLSST-ICEBE8MM', 'SMOT-CLATIL-ALPWHI2.25X7.5', 'SMOT-PEB-WHT', 'TWHITOAK412H', 'SMOT-SMTL-VERGOL8MM', 'SMOT-PT-RETBIA-1X6STM']
write('backsplash-tiles-sample.csv', [b for b in out if b[0]['SKU'] in SAMPLE])
json.dump(report, open(os.path.join(HERE, '_tiles_report.json'), 'w'))
if __name__ == '__main__':
    for r in sorted(report, key=lambda r: r['name']): print(f"{r['name']}  | ${r['price']} | ${r['ppsf']}/sf | {r['old'][:60]}")
    for k in ('mat', 'pat', 'fin'): print(k, collections.Counter(r[k] for r in report))
