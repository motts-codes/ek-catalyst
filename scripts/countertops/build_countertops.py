"""Countertops rework: one page per colour + material; Fabrication (Slab / Pre-Fabricated) and
Finish (Polished / Honed / Matte / Concrete) become button options. Visible products only.
Input : _ct_src.json (Product + Image rows for categories 42/43/94-98 from the master export)
Output: countertops.csv (BigCommerce import), _ct_report.json"""
import csv, json, re, collections
COLS = json.load(open('/home/claude/coll/_out_cols.json'))
SRC = json.load(open('_ct_src.json'))
CATEGORY = {'Quartz': '872', 'Granite': '871', 'Laminate': '876'}      # sandbox IDs (parent Countertops 870, Pre-Fabricated 873)
PREFAB_CATEGORY = {'Quartz': '874', 'Granite': '875'}
SAMPLES_CATEGORY = '877'
FINISHES = ('Honed', 'Matte', 'Concrete')
SPECIAL = {  # SKU -> (colour, suffix after "Countertop", note)
    'White Valley Sample': ('White Valley', ' Sample', 'sample'),
    'Vena Carbona Sample': ('Vena Carbona', ' Sample', 'sample'),
    'Argento Romano Sample': ('Argento Romano', ' Sample', 'sample'),
    'Ice White Washington Village only': ('Ice White', ' – Washington Village Only', 'project'),
}
DEAD = {'NewVenetianGold-Granite__49520.1628878674__29197'}   # image missing on live too (404)
def orig(u):
    m = re.match(r'^(https://cdn\d+\.bigcommerce\.com/s-[^/]+)/products/(\d+)/images/(\d+)/(.+?)\.(\d+)\.\d+\.\d+\.(\w+)(\?.*)?$', u)
    if not m: return u
    host, pid, iid, fn, ts, ext, q = m.groups()
    return f'{host}/images/stencil/original/products/{pid}/{iid}/{fn}.{ts}.{ext}{q or ""}'
def ckey(u): return re.sub(r'__\d+\.\d+\.\w+$', '', u.split('/')[-1].split('?')[0]).lower()
def slug(s): return '/' + re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') + '/'
def cf_json(cfs):
    return json.dumps([{'name': n, 'value': v.replace('"', '&quot;')} for n, v in cfs], ensure_ascii=False, separators=(',', ':'))
def tcase(s): return ' '.join(w[:1].upper() + w[1:] if w[:1].islower() else w for w in s.split())

items = []; cur = None
for r in SRC:
    if r['Item'] == 'Product':
        cur = dict(p=r, imgs=[]); items.append(cur)
    elif r['Item'] == 'Image':
        cur['imgs'].append(r)
hidden = []; groups = collections.OrderedDict()
for it in items:
    p = it['p']; sku = p['SKU'].strip(); cats = p['Categories'].split(';')
    mat = 'Quartz' if '94' in cats else 'Granite' if '43' in cats else 'Laminate'
    fab = 'Pre-Fabricated' if re.search(r'\(\s*Pre-F[ae]b\s*\)', sku, re.I) else 'Slab'
    colour = re.sub(r'\(\s*Pre-F[ae]b\s*\)', '', sku, flags=re.I).strip(); finish = 'Polished'; suffix = ''; note = ''
    if sku in SPECIAL: colour, suffix, note = SPECIAL[sku]
    m = re.search(r'\((\w+)\)$', colour)
    if m and m.group(1) in FINISHES: finish = m.group(1); colour = colour[:m.start()].strip()
    colour = tcase(re.sub(r'\s+', ' ', re.sub(r'\((Light|Dark)\)', r'\1', colour)))
    if colour == 'Ubatuba': colour = 'Uba Tuba'
    it.update(sku=sku, mat=mat, fab=fab, finish=finish, colour=colour, suffix=suffix, note=note,
              urls=[orig(i['Internal Image URL (Export)']) for i in sorted(it['imgs'], key=lambda i: (i['Image is Thumbnail'] != 'TRUE', int(i['Image Sort Order'] or 0))) if not any(d in i['Internal Image URL (Export)'] for d in DEAD)])
    if p['Is Visible'] != 'TRUE': hidden.append(it); continue
    groups.setdefault((mat, re.sub(r'[^a-z]', '', colour.lower()), suffix), []).append(it)

out = []; report = []; seen = set()
def blank(): return {c: '' for c in COLS}
for (mat, _, suffix), mem in sorted(groups.items(), key=lambda kv: (['Quartz', 'Granite', 'Laminate'].index(kv[0][0]), kv[0][1], kv[0][2])):
    mem.sort(key=lambda m: (m['fab'] != 'Slab', m['finish'] != 'Polished', m['finish']))
    colour = next((m['colour'] for m in mem if m['fab'] == 'Slab'), mem[0]['colour'])
    name = f'{colour} {mat} Countertop{suffix}'
    assert name not in seen, name; seen.add(name)
    fabs = list(dict.fromkeys(m['fab'] for m in mem)); fins = list(dict.fromkeys(m['finish'] for m in mem))
    assert len(mem) == len({(m['fab'], m['finish']) for m in mem}), name
    # options: Finish only when the colour really has more than one; Fabrication whenever a pre-fab SKU is involved
    use_fin = len(fins) > 1; use_fab = 'Pre-Fabricated' in fabs
    if use_fin and use_fab: assert len(mem) == len(fabs) * len(fins), name
    d = mem[0]['p']
    cfs = [('Material', mat)] + ([('Fabrication', f) for f in fabs] if mat != 'Laminate' else []) + ([('Finish', f) for f in fins] if use_fin else [])
    P = blank()
    P.update({'Item': 'Product', 'Name': name, 'Type': 'physical', 'Inventory Tracking': 'none', 'Price': d['Price'],
              'Categories': SAMPLES_CATEGORY if suffix == ' Sample' else ';'.join([CATEGORY[mat]] + ([PREFAB_CATEGORY[mat]] if use_fab else [])), 'Custom Fields': cf_json(cfs),
              'Description': '<p><a href="tel:+1%20860-247-1000">Please call 860-247-1000 for pricing</a></p>',
              'Page Title': f'{name} | Express Kitchens', 'Product URL': slug(name),
              'Search Keywords': f'{mat}, Countertop, Kitchen Top' + ('' if mat == 'Laminate' else ', Stone Top'),
              'Free Shipping': 'FALSE', 'Weight': d['Weight'], 'Is Visible': 'TRUE', 'Is Featured': 'FALSE',
              'Tax Class': '0', 'Product Condition': 'New', 'Show Product Condition': 'FALSE'})
    single = not (use_fin or use_fab)
    if single: P.update({'SKU': mem[0]['sku'], 'Cost Price': d['Cost Price']})
    out.append(P)
    gallery = []; have = set()
    for m in mem:
        for u in m['urls']:
            if ckey(u) not in have: have.add(ckey(u)); gallery.append((u, m))
    for i, (u, m) in enumerate(gallery):
        I = blank(); lab = ' – '.join(x for x in ([m['finish']] if use_fin else []) if x)
        I.update({'Item': 'Image', 'Image URL (Import)': u, 'Image Description': name + (f' – {lab}' if lab else ''),
                  'Image is Thumbnail': 'TRUE' if i == 0 else 'FALSE', 'Image Sort Order': str(i)})
        out.append(I)
    if not single:
        for m in mem:
            opts = ([f"Type=Rectangle|Name=Fabrication|Value={m['fab']}"] if use_fab else []) + ([f"Type=Rectangle|Name=Finish|Value={m['finish']}"] if use_fin else [])
            V = blank(); lp = m['p']
            V.update({'Item': 'Variant', 'SKU': m['sku'], 'Options': ''.join(opts), 'Price': lp['Price'], 'Cost Price': lp['Cost Price'],
                      'Free Shipping': 'FALSE', 'Weight': lp['Weight'], 'Variant Image URL': (m['urls'] or [gallery[0][0] if gallery else ''])[0]})
            out.append(V)
    report.append(dict(material=mat, name=name, url=slug(name), images=len(gallery), note=mem[0]['note'],
                       options=(['Fabrication'] if use_fab else []) + (['Finish'] if use_fin else []),
                       members=[dict(sku=m['sku'], fab=m['fab'], finish=m['finish'], price=m['p']['Price'], old_name=m['p']['Name'],
                                     old_url=m['p']['Product URL'], cats=m['p']['Categories']) for m in mem]))
with open('countertops.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(out)
json.dump(dict(pages=report, hidden=[dict(sku=h['sku'], mat=h['mat'], fab=h['fab'], price=h['p']['Price']) for h in hidden]), open('_ct_report.json', 'w'), indent=1)
if __name__ == '__main__':
    c = collections.Counter(r['Item'] for r in out)
    print(c, 'visible SKUs', sum(len(r['members']) for r in report), 'hidden', len(hidden))
    print(collections.Counter((r['material'], '+'.join(r['options']) or 'single') for r in report))
    for r in report:
        if r['options'] or r['note'] or r['images'] == 0:
            print(r['name'], r['images'], '|', [(m['sku'], m['fab'], m['finish'], m['price']) for m in r['members']])
