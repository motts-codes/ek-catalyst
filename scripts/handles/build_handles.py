"""Cabinet handles rework: one page per design (Amerock collection + type, Richelieu model + type),
with Size and Finish as button options. Visible products only; SKUs, prices, costs, UPCs unchanged.
Input : _handles_src.json (Product + Image rows of Cabinets > Handles from the master export)
Output: handles-pulls.csv, handles-knobs.csv, handles-appliance-pulls.csv, handles-backplates-accessories.csv, _handles_report.json"""
import csv, json, re, html, collections, sys, os
COLS = json.load(open('/home/claude/coll/_out_cols.json'))
SRC = json.load(open('_handles_src.json'))
CATEGORY = {'pulls': '889', 'knobs': '889', 'appliance': '889', 'accessories': '889'}       # sandbox category IDs - fill in when known
FILES = {'pulls': 'handles-pulls.csv', 'knobs': 'handles-knobs.csv', 'appliance': 'handles-appliance-pulls.csv', 'accessories': 'handles-backplates-accessories.csv'}
KEEP_CF = ('Stock Status', 'Price Range', '__badge', 'Shipping')
FIN_RANK = ['Satin Nickel', 'Brushed Nickel', 'Polished Nickel', 'Polished Chrome', 'Chrome', 'Matte Black', 'Stainless Steel', 'Champagne Bronze', 'Golden Champagne', 'Oil-Rubbed Bronze']
RICH_CODE = {'195': 'Brushed Nickel', '900': 'Matte Black', '140': 'Chrome', 'CHBRZ': 'Champagne Bronze', '143': 'Antique Nickel', 'BORB': 'Brushed Oil-Rubbed Bronze',
             '170': 'Stainless Steel', '160': 'Satin Brass', '180': 'Polished Nickel', 'HBRZ': 'Honey Bronze', '158': 'Brushed Aurum Gold', '990': 'Brushed Black',
             'AE': 'Antique English', '166': 'Satin Gold', '142': 'Pewter', '191': 'Polished Copper', '192': 'Rose Gold', '165': 'Brushed Gold', '174': 'Matte Chrome',
             '184': 'Matte Nickel', '169': 'Black Stainless Steel', '162': 'Royal Gold', '908': 'Natural Iron', 'BB': 'Burnished Brass', 'ORB': 'Oil-Rubbed Bronze',
             '145': 'Satin Chrome', '130': 'Brass', '171': 'Polished Stainless Steel', 'CBRZ': 'Chocolate Bronze', 'OBRZ': 'Oriental Bronze', '193': 'Antique Copper', '163': 'Oxidized Brass'}
STD_CTC = [16, 32, 64, 76, 96, 102, 128, 160, 192, 200, 203, 224, 256, 288, 304, 305, 320, 352, 384, 416, 448, 457, 480, 610]
STYLES = ('Modern', 'Traditional', 'Transitional', 'Eclectic', 'Contemporary', 'Functional', 'Classic')
DEAD = set(l.strip() for l in open('_dead.txt')) if os.path.exists('_dead.txt') else set()

def orig(u):
    m = re.match(r'^(https://cdn\d+\.bigcommerce\.com/s-[^/]+)/products/(\d+)/images/(\d+)/(.+?)\.(\d+)\.\d+\.\d+\.(\w+)(\?.*)?$', u)
    if not m: return u
    host, pid, iid, fn, ts, ext, q = m.groups()
    return f'{host}/images/stencil/original/products/{pid}/{iid}/{fn}.{ts}.{ext}{q or ""}'
def ckey(u): return re.sub(r'__\d+\.\d+\.\w+$', '', u.split('/')[-1].split('?')[0]).lower()
def slug(s): return '/' + re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', 'and')).strip('-') + '/'
def cf_json(cfs): return json.dumps([{'name': n, 'value': v.replace('"', '&quot;')} for n, v in cfs], ensure_ascii=False, separators=(',', ':'))
def num(v):
    try: return float(v)
    except Exception: return 0.0
def frac(v, den=16):
    w = int(v); f = round((v - w) * den)
    if f == den: w += 1; f = 0
    if f == 0: return str(w)
    from math import gcd
    g = gcd(f, den); return (f"{w}-" if w else '') + f"{f // g}/{den // g}"
def mm_label(mm): return f"{frac(mm / 25.4)} in. ({int(round(mm))} mm)"
def fin_norm(f):
    f = re.sub(r'\s+', ' ', f).strip().strip(',')
    if f.upper() in ('N/A', 'N / A', 'OTHERS'): return ''
    f = re.sub(r'^CMatte', 'Matte', f).replace('Oil Rubbed', 'Oil-Rubbed')
    return ' / '.join(p.strip() for p in f.split('/')) if '/' in f else f
def family(f):
    fl = f.lower()
    for fam, keys in (('Black', ('black', 'graphite', 'gunmetal', 'iron', 'anthracite')), ('Bronze', ('bronze',)), ('Gold & Brass', ('gold', 'brass', 'champagne')),
                      ('Nickel', ('nickel', 'pewter')), ('Chrome', ('chrome',)), ('Stainless Steel', ('stainless', 'aluminum')), ('Copper', ('copper',)), ('White', ('white',))):
        if any(k in fl for k in keys): return fam
    return 'Other'
def fin_key(f): return (FIN_RANK.index(f) if f in FIN_RANK else 99, f)

items = []; cur = None
for r in SRC:
    if r['Item'] == 'Product': cur = dict(p=r, imgs=[]); items.append(cur)
    elif r['Item'] == 'Image': cur['imgs'].append(r)
VIS = [it for it in items if it['p'].get('Is Visible') == 'TRUE']
for it in VIS:
    p = it['p']; it['sku'] = p['SKU'].strip()
    it['name'] = re.sub(r'\s+', ' ', re.sub(r'[\x00-\x1f\x7f-\x9f]', '', p['Name'])).strip()
    it['rest'] = it['name'][len(it['sku']):].strip(' -') if it['name'].startswith(it['sku']) else it['name']
    it['cf'] = [(d['name'], html.unescape(d.get('value') or '')) for d in json.loads(p.get('Custom Fields') or '[]')]
    it['cfd'] = {}
    for n, v in it['cf']: it['cfd'].setdefault(n, v)
    it['urls'] = []; seen = set()
    for i in sorted(it['imgs'], key=lambda i: (i.get('Image is Thumbnail') != 'TRUE', int(i.get('Image Sort Order') or 0))):
        u = orig(i['Internal Image URL (Export)'])
        if ckey(u) not in seen and u not in DEAD: seen.add(ckey(u)); it['urls'].append(u)
    it['desc'] = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html.unescape(p.get('Description', '')))).strip()
    dims = sorted([num(p.get('Width')), num(p.get('Height')), num(p.get('Depth'))]); it['len_in'] = dims[-1]; it['dims'] = dims

TYPE_LABEL = {'Pull': 'Cabinet Pull', 'Knob': 'Cabinet Knob', 'Appliance Pull': 'Appliance Pull', 'Edge Pull': 'Edge Pull', 'Cup Pull': 'Cup Pull', 'Finger Pull': 'Finger Pull',
              'Pendant': 'Pendant Pull', 'Latch': 'Cabinet Latch', 'Template': 'Installation Template', 'Recessed Pull': 'Recessed Pull', 'Backplate': 'Backplate',
              'Wardrobe Knob': 'Wardrobe Knob'}
def kind_of(t): return 'knobs' if t in ('Knob', 'Wardrobe Knob') else 'appliance' if t == 'Appliance Pull' else 'accessories' if t in ('Backplate', 'Latch', 'Template') else 'pulls'
def rich_type(d):
    dl = d.lower()
    for k, t in (('wardrobe knob', 'Wardrobe Knob'), ('backplate', 'Backplate'), ('appliance pull', 'Appliance Pull'), ('edge pull', 'Edge Pull'), ('cup pull', 'Cup Pull'),
                 ('recessed', 'Recessed Pull'), ('knob', 'Knob'), ('pull', 'Pull')):
        if k in dl: return t
    return ''

# ------------------------------------------------------------------ parse every SKU
for it in VIS:
    rest, c = it['rest'], it['cfd']; it['size_mm'] = None; it['size_kind'] = ''
    ctc = re.match(r'^(\d+(?:\.\d+)?) ?mm$', c.get('Center to Center', '').strip())
    m4 = re.match(r'^(.+?) Collection ([\d /-]+) in\. \((\d+) ?mm\) (Knob|Pull), (.+)$', rest)
    if m4: rest = f"{m4.group(1)} Collection {m4.group(2).replace('-', ' ')}-inch ({m4.group(3)} mm) {m4.group(5)} Finish {m4.group(4)}"
    m3 = re.match(r'^(.+?) Collection ([\d /-]+)-inch \((\d+) mm\) (.+?) (Modern|Traditional|Transitional|Contemporary|Eclectic) (.+)$', rest) if ' Finish ' not in rest else None
    m = re.match(r'^(.*?) Collection (.*?) Finish (.+)$', rest)
    m2 = re.search(r'\s*[-?]\s*([A-Za-z0-9&][A-Za-z0-9& ]{0,13})$', rest)
    if m:
        it['brand'] = 'Amerock'; it['coll'] = m.group(1); it['type'] = m.group(3)
        dm = re.match(r'^([\d /-]+)-inch \((\d+) mm\) (.*)$', m.group(2)); it['finish'] = fin_norm(dm.group(3) if dm else m.group(2))
        if it['type'] == 'Knob':
            if dm: it['size_mm'] = float(dm.group(2)); it['size_kind'] = 'dia'
        elif ctc: it['size_mm'] = float(ctc.group(1)); it['size_kind'] = 'ctc'
        elif it['len_in']: it['size_mm'] = it['len_in'] * 25.4; it['size_kind'] = 'len'
        it['key'] = ('Amerock', it['coll'], it['type']); it['style'] = ''; it['descr'] = ''
        it['proj'] = dm.group(1).strip() if dm and it['type'] != 'Knob' else ''
    else:
        it['brand'] = 'Richelieu'
        d = rest[:m2.start()].strip() if (m2 and re.search(r'\d', m2.group(1))) else rest
        it['model'] = m2.group(1).strip() if (m2 and re.search(r'\d', m2.group(1))) else ''
        sm = re.search(r'\b(' + '|'.join(STYLES) + r')\b', d)
        prefix = d[:sm.start()].strip(' -,') if sm else ''
        it['descr'] = re.sub(r'\bknob\b', 'Knob', d[sm.start():] if sm else '').strip()
        if not sm:      # no style word: an older listing. Describe it from its fields instead of its shorthand name
            mat = c.get('Product Material', '')
            it['legacy_mat'] = mat if mat in ('Metal', 'Aluminum', 'Steel', 'Stainless Steel', 'Plastic', 'Wood', 'Brass', 'Ceramic', 'Glass', 'Zinc', 'Zamak') else ''
            fpre = next((f for f in sorted(set(RICH_CODE.values()), key=len, reverse=True) if d.lower().startswith(f.lower())), '')
            prefix = prefix or fpre
        it['style'] = sm.group(1) if sm else ''
        it['type'] = rich_type(d)
        if c.get('Type', '') in ('Appliance Pull', 'Appliance Pulls') and it['type'] == 'Pull': it['type'] = 'Appliance Pull'
        fin = c.get('Product Finish', '') or prefix
        if not fin or fin == 'Antique':
            for code in sorted(RICH_CODE, key=len, reverse=True):
                if it['sku'].endswith(code): fin = RICH_CODE[code]; break
        it['finish'] = fin_norm(fin)
        if it['type'] in ('Knob', 'Wardrobe Knob'):
            if ctc and 8 <= float(ctc.group(1)) <= 90: it['size_mm'] = float(ctc.group(1)); it['size_kind'] = 'dia'
            elif it['dims'][1] and abs(it['dims'][1] - it['dims'][2]) < 0.06 and 0.4 <= it['dims'][2] <= 3.5: it['size_mm'] = round(it['dims'][2] * 25.4); it['size_kind'] = 'dia'
        elif it['type'] != 'Backplate' or ctc:
            if ctc: it['size_mm'] = float(ctc.group(1)); it['size_kind'] = 'ctc'
            else:   # centre-to-centre missing: accept a standard size written in the SKU if the overall length fits it
                digits = re.sub(r'(' + '|'.join(sorted(RICH_CODE, key=len, reverse=True)) + r')$', '', it['sku'])
                L = it['len_in'] * 25.4
                for s in sorted(STD_CTC, reverse=True):
                    if digits.endswith(str(s)) and (not L or s + 4 <= L <= s + 110): it['size_mm'] = float(s); it['size_kind'] = 'ctc'; it['ctc_from_sku'] = True; break
        it['key'] = (('Richelieu', it['model'], it['type']) if (it['model'] and it['type']) else ('Richelieu', '~d:' + it['descr'], it['type']) if (sm and it['type']) else ('Richelieu', '~' + it['sku'], it['type'] or 'Pull'))
        if not it['type']: it['type'] = 'Knob' if '521' in it['p'].get('Categories', '').split(';') else 'Pull'
        if m3:   # Richelieu listings written as "X Collection 5 1/16-inch (128 mm) Finish Style Shape Cabinet Pull"
            it['coll'] = m3.group(1); it['style'] = m3.group(5); it['descr'] = f"{m3.group(1)} {m3.group(5)} {m3.group(6)}"; it['model'] = ''
            it['type'] = rich_type(m3.group(6)) or 'Pull'; it['finish'] = fin_norm(m3.group(4))
            it['size_mm'] = float(m3.group(3)); it['size_kind'] = 'dia' if it['type'] == 'Knob' else 'ctc'
            it['key'] = ('Richelieu', '~c:' + it['descr'], it['type'])
    if it['size_mm'] is not None and it['size_kind'] in ('ctc', 'dia') and abs(it['size_mm'] - round(it['size_mm'])) < 0.3: it['size_mm'] = float(round(it['size_mm']))
    it['size'] = (mm_label(it['size_mm']) if it['size_kind'] in ('ctc', 'dia') else f"{frac(it['size_mm'] / 25.4)} in. long") if it['size_mm'] else ''

# ------------------------------------------------------------------ group into pages; anything that would clash becomes its own page
# item stem = SKU without its finish code (one stem = one physical item in several finishes).
# Amerock: letters after the item number are the finish code; Polished Chrome is the numeric code 26.
# Richelieu: the code is learned per finish as the longest ending shared by at least 60% of that finish's SKUs.
rc = collections.defaultdict(list)
for it in VIS:
    if it['brand'] == 'Richelieu' and it['finish']: rc[it['finish']].append(it['sku'])
R_CODE = {}
for fin, skus in rc.items():
    if len(skus) < 3: continue
    for n in range(6, 1, -1):
        c = collections.Counter(s[-n:] for s in skus if len(s) > n + 2)
        if c and c.most_common(1)[0][1] >= 0.6 * len(skus): R_CODE[fin] = c.most_common(1)[0][0]; break
for c, f in RICH_CODE.items(): R_CODE.setdefault(fin_norm(f), c)
def stem(it):
    s = it['sku']
    if it['brand'] == 'Amerock':
        m = re.match(r'^(BP\d+)([A-Z].*)?$', s)
        if not m: return s
        st, code = m.group(1), m.group(2) or ''
        if it['finish'].startswith('Polished Chrome') and st.endswith('26') and len(st) > 6: st = st[:-2]
        return st
    c = R_CODE.get(it['finish'], '')
    return s[:-len(c)] if c and s.endswith(c) and len(s) > len(c) + 2 else s
for it in VIS: it['stem'] = stem(it)
# same item code = same size: fill a missing size from a sibling finish; legacy-named Richelieu SKUs join the model their item code belongs to
by_stem = collections.defaultdict(list)
for it in VIS: by_stem[(it['brand'], it['stem'])].append(it)
for ms in by_stem.values():
    src = next((m for m in ms if m['size'] and m['size_kind'] != 'len'), None)
    ref = next((m for m in ms if m['brand'] == 'Richelieu' and m.get('model')), None)
    for m in ms:
        if src and (not m['size'] or m['size_kind'] == 'len'): m['size'], m['size_mm'], m['size_kind'], m['size_filled'] = src['size'], src['size_mm'], src['size_kind'], True
        if ref and m['brand'] == 'Richelieu' and not m.get('model') and m['type'] == ref['type']:
            m['model'], m['descr'], m['style'], m['key'], m['adopted'] = ref['model'], ref['descr'], ref['style'], ref['key'], True
groups = collections.OrderedDict()
for it in VIS: groups.setdefault(it['key'], []).append(it)
pages = []
for key, mem in groups.items():
    stems = collections.OrderedDict()
    for it in sorted(mem, key=lambda i: i['sku']): stems.setdefault(it['stem'], []).append(it)
    owner = {}; main = []; side = []
    # largest items first so the main page keeps the fullest range
    for st, ms in sorted(stems.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        sizes = {m['size'] for m in ms}; fk = [(m['size'], m['finish']) for m in ms]
        ok = all(m['finish'] for m in ms) and len(set(fk)) == len(fk) and not any(sz in owner for sz in sizes)
        if ok and owner and ('' in sizes or '' in owner): ok = False      # a size-less item cannot share a size picker
        if ok and '' in sizes and len(sizes) > 1: ok = False
        if ok:
            for sz in sizes: owner[sz] = st
            main += ms
        else: side.append((st, ms))
    if main: pages.append(dict(key=key, mem=main, solo=False, code=''))
    for st, ms in side:
        fk = [(m['size'], m['finish']) for m in ms]
        if all(m['finish'] for m in ms) and len(set(fk)) == len(fk) and len(ms) > 1: pages.append(dict(key=key, mem=ms, solo=False, code=st))
        else:
            for m in ms: pages.append(dict(key=key, mem=[m], solo=True, code=''))

def base_name(it):
    if it['brand'] == 'Amerock':
        coll = it['coll'] + (' Collection' if re.search(r'Pull|Knob|Steel|Tool|Classics|Heritage|Inspirations', it['coll']) else '')
        return f"Amerock {coll} {TYPE_LABEL.get(it['type'], it['type'])}"
    d = it['descr'] or ' '.join(x for x in (it.get('legacy_mat', '').replace('Zamak', 'Metal').replace('Zinc', 'Metal'), TYPE_LABEL.get(it['type'], it['type'])) if x)
    d = re.sub(r'\bPull\b', 'Cabinet Pull', d) if it['type'] == 'Pull' and 'Cabinet' not in d else d
    d = re.sub(r'\bKnob\b', 'Cabinet Knob', d) if it['type'] == 'Knob' and 'Cabinet' not in d and 'Wardrobe' not in d else d
    if it['type'] == 'Appliance Pull' and 'Appliance' not in d: d = re.sub(r'\b(Cabinet )?Pull\b', 'Appliance Pull', d)
    return f"Richelieu {d}"
for pg in pages:
    mem = pg['mem']; it = mem[0]
    sizes = sorted({m['size_mm'] for m in mem if m['size']}); fins = sorted({m['finish'] for m in mem}, key=fin_key)
    kinds = {m['size_kind'] for m in mem if m['size']}
    pg['opt_size'] = ('Center to Center' if kinds == {'ctc'} else 'Diameter' if kinds == {'dia'} else 'Size') if len(sizes) > 1 else None
    pg['opt_fin'] = 'Finish' if len(fins) > 1 else None
    name = base_name(it)
    if not pg['opt_size'] and it['size']: name += f", {it['size']}" + (' Center to Center' if it['size_kind'] == 'ctc' else '')
    if not pg['opt_fin'] and it['finish']: name += f" in {fins[0]}"
    code = pg['code'] or (it['sku'] if (pg['solo'] or (len(mem) == 1 and (it['brand'] == 'Amerock' or not it.get('model')))) else (it.get('model', '') if it['brand'] == 'Richelieu' else ''))
    if code: name += f" ({code})"
    pg['name'] = name; pg['kind'] = kind_of(it['type'])
cnt = collections.Counter(p['name'] for p in pages)
for pg in pages:
    if cnt[pg['name']] > 1: pg['name'] += f" ({pg['mem'][0]['sku']})"
cnt = collections.Counter(p['name'] for p in pages); assert max(cnt.values()) == 1, [n for n, c in cnt.items() if c > 1][:5]

out = {k: [] for k in FILES}; report = []
def blank(): return {c: '' for c in COLS}
for pg in pages:
    mem, name, kind = pg['mem'], pg['name'], pg['kind']
    opts = [o for o in (pg['opt_size'], pg['opt_fin']) if o]
    for m in mem: m['opt'] = dict(([(pg['opt_size'], m['size'])] if pg['opt_size'] else []) + ([('Finish', m['finish'])] if pg['opt_fin'] else []))
    mem.sort(key=lambda m: (m['size_mm'] or 0, fin_key(m['finish'])))
    assert len({tuple(m['opt'].values()) for m in mem}) == len(mem), name
    d = mem[0]; dp = d['p']
    cfs = [(n, v) for n, v in d['cf'] if n in KEEP_CF] + [('Brand', d['brand'])]
    cfs += [('Collection', d['coll'])] if d['brand'] == 'Amerock' else ([('Model', d['model'])] if d.get('model') else [])
    cfs += [('Hardware Type', TYPE_LABEL.get(d['type'], d['type']))] + ([('Style', d['style'])] if d['style'] else [])
    mat = d['cfd'].get('Product Material', '').replace('Zamac', 'Zamak')
    if mat and mat != 'Others': cfs.append(('Material', mat))
    lab = 'Diameter' if kind == 'knobs' else 'Center to Center'
    cfs += [(lab, s) for s in dict.fromkeys(m['size'] for m in mem if m['size'] and m['size_kind'] in ('ctc', 'dia'))]
    cfs += [('Finish', f) for f in dict.fromkeys(m['finish'] for m in mem if m['finish'])]
    cfs += [('Finish Family', f) for f in dict.fromkeys(family(m['finish']) for m in mem if m['finish'])]
    desc = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', dp.get('Description', ''))
    if len(d['desc']) < 150: desc = ''
    P = blank()
    P.update({'Item': 'Product', 'Name': name, 'Type': 'physical', 'Inventory Tracking': 'none', 'Price': dp['Price'], 'Categories': CATEGORY[kind],
              'Description': desc, 'Custom Fields': cf_json(cfs), 'Page Title': f'{name} | Express Kitchens', 'Product URL': slug(name),
              'Free Shipping': 'FALSE', 'Weight': dp.get('Weight', ''), 'Is Visible': 'TRUE', 'Is Featured': 'FALSE', 'Tax Class': '0',
              'Product Condition': 'New', 'Show Product Condition': 'FALSE'})
    if not opts:
        for k in ('SKU', 'Cost Price', 'UPC/EAN', 'Global Trade Number', 'Manufacturer Part Number', 'Width', 'Height', 'Depth'): P[k] = dp.get(k, '').strip()
    rows = [P]
    gallery = [(u, d) for u in d['urls']]; have = {ckey(u) for u, _ in gallery}; seenfin = {d['finish']}
    for m in mem[1:]:      # one extra photo per finish, not per size
        if m['finish'] in seenfin or not m['urls'] or ckey(m['urls'][0]) in have: continue
        seenfin.add(m['finish']); gallery.append((m['urls'][0], m)); have.add(ckey(m['urls'][0]))
    for i, (u, m) in enumerate(gallery):
        I = blank()
        I.update({'Item': 'Image', 'Image URL (Import)': u, 'Image Description': name + (f" – {m['finish']}" if pg['opt_fin'] else ''),
                  'Image is Thumbnail': 'TRUE' if i == 0 else 'FALSE', 'Image Sort Order': str(i)})
        rows.append(I)
    if opts:
        for m in mem:
            lp = m['p']; V = blank()
            V.update({'Item': 'Variant', 'SKU': m['sku'], 'Options': ''.join(f"Type=Rectangle|Name={o}|Value={v}" for o, v in m['opt'].items()),
                      'Price': lp['Price'], 'Cost Price': lp.get('Cost Price', ''), 'UPC/EAN': lp.get('UPC/EAN', ''), 'Global Trade Number': lp.get('Global Trade Number', ''),
                      'Manufacturer Part Number': lp.get('Manufacturer Part Number', ''), 'Free Shipping': 'FALSE', 'Weight': lp.get('Weight', ''),
                      'Width': lp.get('Width', ''), 'Height': lp.get('Height', ''), 'Depth': lp.get('Depth', ''),
                      'Variant Image URL': (m['urls'] or [gallery[0][0] if gallery else ''])[0]})
            rows.append(V)
    out[kind] += rows
    grid = (len({m['size'] for m in mem}) * len({m['finish'] for m in mem})) if len(opts) == 2 else len(mem)
    report.append(dict(kind=kind, brand=d['brand'], side=bool(pg['code']), name=name, url=slug(name), options=opts, images=len(gallery), solo=pg['solo'], n=len(mem), grid=grid,
                       sizes=list(dict.fromkeys(m['size'] for m in mem)), finishes=list(dict.fromkeys(m['finish'] for m in mem)), type=d['type'],
                       members=[dict(sku=m['sku'], size=m['size'], kind=m['size_kind'], finish=m['finish'], price=m['p']['Price'], old_name=m['name'],
                                     from_sku=bool(m.get('ctc_from_sku')), nimg=len(m['urls'])) for m in mem]))
for k, fn in FILES.items():
    with open(fn, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(out[k])
json.dump(report, open('_handles_report.json', 'w'))
if __name__ == '__main__':
    print('SKUs', len(VIS), 'pages', len(pages))
    for k in FILES:
        c = collections.Counter(r['Item'] for r in out[k]); print(' ', k, dict(c), 'SKUs', sum(r['n'] for r in report if r['kind'] == k))
    print(collections.Counter((r['brand'], 'solo' if r['solo'] else ('side:' if r['side'] else '') + ('+'.join(r['options']) or 'single')) for r in report))
    print('no size:', sum(1 for r in report for m in r['members'] if not m['size']), '| size from length:', sum(1 for r in report for m in r['members'] if m['kind'] == 'len'),
          '| ctc read from SKU:', sum(1 for r in report for m in r['members'] if m['from_sku']), '| size filled from sibling finish:', sum(1 for it in VIS if it.get('size_filled')), '| legacy joined to model:', sum(1 for it in VIS if it.get('adopted')), '| no finish:', sum(1 for r in report for m in r['members'] if not m['finish']))
    print('max variants', max(r['n'] for r in report), '| incomplete grids', sum(1 for r in report if r['grid'] > r['n']), '| max name', max(len(r['name']) for r in report))
