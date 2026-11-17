"""Kitchen > Sinks & Faucets rework: Kitchen Faucets, Kitchen Sinks, Sink & Faucet Accessories.
Input : _sf_src.json (Product + Image rows for the live Faucets / Sinks / Bath trees, from the master export)
Output: kitchen-faucets.csv, kitchen-sinks.csv, sink-faucet-accessories.csv, _kitchen_report.json
Visible products only. SKUs, prices, costs, UPCs are never changed."""
import csv, json, re, html, collections, sys
COLS = json.load(open('/home/claude/coll/_out_cols.json'))
SRC = json.load(open('_sf_src.json'))
CATEGORY = {'faucets': '886', 'sinks': '885', 'accessories': '887'}     # sandbox category IDs - fill in when known
BRAND = {'113': 'Oakland', '42': 'Fine Fixtures', '43': 'MSI', '40': 'Paani', '44': 'Majestic'}
FAU = set('19 527 610 528 486 489 483 487 377'.split()); SNK = set('20 381 383 388 382 384 389 386 380 385 387 609 360'.split())
FINISH = {'C': 'Polished Chrome', 'CH': 'Chrome', 'BN': 'Brushed Nickel', 'MB': 'Matte Black', 'SG': 'Satin Gold', 'RB': 'Oil Rubbed Bronze'}
FIN_ORDER = ['Polished Chrome', 'Chrome', 'Brushed Nickel', 'Stainless Steel', 'Matte Black', 'Satin Gold', 'Oil Rubbed Bronze', 'White', 'Grey', 'Black']
KEEP_CF = ('Stock Status', 'Price Range', '__badge', 'Shipping')

def orig(u):
    m = re.match(r'^(https://cdn\d+\.bigcommerce\.com/s-[^/]+)/products/(\d+)/images/(\d+)/(.+?)\.(\d+)\.\d+\.\d+\.(\w+)(\?.*)?$', u)
    if not m: return u
    host, pid, iid, fn, ts, ext, q = m.groups()
    return f'{host}/images/stencil/original/products/{pid}/{iid}/{fn}.{ts}.{ext}{q or ""}'
def ckey(u): return re.sub(r'__\d+\.\d+\.\w+$', '', u.split('/')[-1].split('?')[0]).lower()
def slug(s): return '/' + re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', 'and')).strip('-') + '/'
def cf_json(cfs):
    return json.dumps([{'name': n, 'value': v.replace('"', '&quot;')} for n, v in cfs], ensure_ascii=False, separators=(',', ':'))
def num(v):
    try: return float(v)
    except Exception: return 0.0
DEAD = set(l.strip() for l in open('_dead.txt')) if __import__('os').path.exists('_dead.txt') else set()

items = []; cur = None
for r in SRC:
    if r['Item'] == 'Product': cur = dict(p=r, imgs=[]); items.append(cur)
    elif r['Item'] == 'Image': cur['imgs'].append(r)
for it in items:
    p = it['p']; it['sku'] = p['SKU'].strip(); it['name'] = re.sub(r'\s+', ' ', re.sub(r'[\x00-\x1f\x7f-\x9f]', '', p['Name'])).strip()
    it['rest'] = it['name'][len(it['sku']):].strip(' -') if it['name'].upper().startswith(it['sku'].upper()) else it['name']
    it['cats'] = set(p.get('Categories', '').split(';'))
    it['cf'] = [(d['name'], html.unescape(d.get('value') or '')) for d in json.loads(p.get('Custom Fields') or '[]')]
    it['cfd'] = {}
    for n, v in it['cf']: it['cfd'].setdefault(n, v)
    it['urls'] = []; seen = set()
    for i in sorted(it['imgs'], key=lambda i: (i.get('Image is Thumbnail') != 'TRUE', int(i.get('Image Sort Order') or 0))):
        u = orig(i['Internal Image URL (Export)'])
        if ckey(u) not in seen and u not in DEAD: seen.add(ckey(u)); it['urls'].append(u)
    md = p.get('Meta Description', '').split(' - ')
    it['brand'] = BRAND.get(p.get('Brand ID', ''), '')
VIS = [it for it in items if it['p'].get('Is Visible') == 'TRUE']

# ------------------------------------------------------------------ classification
BATH_SINK = re.compile(r'^(LV[UT]|DAX-BSN|H-1813|L-PU|L-UB|SIN-POR-(UND|VUR)|UM\d|2445910|4362620)')
def classify(it):
    s = it['sku'].upper(); n = it['name'].lower()
    if it['cats'] & FAU:
        if s.startswith(('KSB', 'KBDP', 'KSPOP')): return 'bath'
        if s.startswith(('KSSD', 'SD-', 'KKDP', 'PULLOUT')): return 'accessories'
        return 'faucets'
    if it['cats'] & SNK:
        if BATH_SINK.match(s) or s.startswith('KSPOP'): return 'bath'
        if it['cats'] & {'381', '382', '383', '384', '388', '389'}: return 'accessories'
        return 'sinks'
    return 'bath'
for it in VIS: it['kind'] = classify(it)

# ------------------------------------------------------------------ faucets
PAANI = {'KF110': 'Chatham', 'KF130': 'Charlotte', 'KF150': 'Pembroke', 'KF160': 'Halifax', 'KF170': 'St. Charles', 'KFT210': 'Shenandoah'}
EIGHT = {'KSK8238': '8 in. Centerset ', 'KSK8131': '8 in. ', 'KSK8239': '8 in. '}
def faucet_key(it):
    s = it['sku'].replace(' ', '')
    m = re.match(r'^(KSK\d+|KSPF\d+|KFT?\d+|FF\d+)-?(WS-?)?(BN|MB|RB|SG|CH|C)(-WS)?$', s)
    if m: return m.group(1), FINISH[m.group(3)], 'With' if (m.group(2) or m.group(4)) else 'Without'
    return s, it['cfd'].get('Product Finish', ''), 'Without'
def faucet_name(model, mem):
    txt = ' | '.join(m['name'] for m in mem).lower()
    brand = mem[0]['brand'] or ('Oakbrook Essentials' if 'oakbrook' in txt else '')
    handles = 'Two-Handle' if re.search(r'two handles|double handle', txt) else 'Single-Handle'
    hm = re.search(r'(\d+(?:\.\d+)?)\W{0,3}high', txt)
    height = f", {hm.group(1)} in. High" if hm else ''
    if 'pot filler' in txt: core = 'Pot Filler Faucet'
    else:
        typ = 'Pull-Down ' if re.search(r'pull[- ]down', txt) else 'Pull-Out ' if re.search(r'pull[- ]out', txt) else ''
        touch = 'Touch ' if 'touch on/off' in txt else ''
        side = ' with Side Sprayer' if 'side sprayer included' in txt else ''
        core = f"{EIGHT.get(model, '')}{typ}{touch}Kitchen Faucet{side}"
    coll = PAANI.get(model, '')
    return re.sub(r'\s+', ' ', f"{brand} {coll} {handles} {core}{height} ({model})").strip(), dict(
        Handles=handles.replace('-Handle', ''), Type=('Pot Filler' if 'pot filler' in txt else 'Pull-Down' if re.search(r'pull[- ]down', txt) else 'Pull-Out' if re.search(r'pull[- ]out', txt) else 'Standard'), Brand=brand)

# ------------------------------------------------------------------ sinks
WIDTH_FIX = {'SIN-16-SINBWL-WEL-2318': 23}     # Dimensions field says 21 x 16; the code and the matching grid say 23 x 18
WIDTH_FIX_RUN = {}   # MSI sinks: overall width from the Dimensions field (their code holds the bowl size)
def sink_attrs(it):
    s = it['sku'].upper(); n = it['name']; nl = n.lower(); rest = it['rest']
    a = {}
    a['ws'] = s.startswith('WS')
    a['mount'] = ('Farmhouse Apron-Front' if (re.search(r'apron|farmhouse|farm sink', nl) or s.startswith(('KSF', 'KPF', 'WSF')) or 'FSAF' in s or '386' in it['cats'])
                  else 'Drop-In' if (re.search(r'top ?mount|drop-in', nl) or s.startswith('KST') or it['cfd'].get('Product Style') == 'Top Mount') else 'Undermount')
    a['bowls'] = ('Triple' if s.endswith('TR') else 'Double' if (re.search(r'double|duble|dblbwl|dbwl', nl + s.lower()) or '380' in it['cats'] or re.search(r'\d(D|BS)$', s.split(' ')[0])) else 'Single')
    sp = re.search(r'(\d0)\s?/\s?(\d0)', s + ' ' + n) or (re.search(r'-(\d0)(\d0)-', s))
    a['split'] = ''
    if a['bowls'] == 'Double':
        if sp: a['split'] = f'{sp.group(1)}/{sp.group(2)}'
        elif 'equal' in nl: a['split'] = '50/50'
        elif 'offset' in nl: a['split'] = 'Offset'
    a['material'] = ('Granite Composite' if s.startswith('KGU') or 'granite composite' in nl else 'Quartz Composite' if 'QTZ' in s or 'quartz' in nl
                     else 'Fireclay' if (s.startswith('FC') or 'fireclay' in nl or 'SIN-POR' in s) else 'Porcelain' if 'porcelain' in nl else 'Stainless Steel')
    g_name = re.search(r'(\d\d)\s?-?\s?(?:gauge|guage|ga\b|g\b)', nl)
    g_cf = re.search(r'(\d\d) GA', it['cfd'].get('Product Material', ''))
    g_sku = re.match(r'SIN-(1[68])-', s)
    a['gauge_sources'] = {k: v.group(1) for k, v in (('name', g_name), ('field', g_cf), ('sku', g_sku)) if v}
    a['gauge'] = (g_sku or g_name or g_cf).group(1) if (g_sku or g_name or g_cf) and a['material'] == 'Stainless Steel' else ''
    a['bar'] = bool(re.search(r'\bbar\b', nl))
    a['ada'] = 'ADA' in s or bool(re.search(r'\bada\b', nl))
    a['shape'] = 'D-Shape ' if re.search(r'd[- ]shape', nl) else 'Round ' if re.search(r'\bround\b(?! bottom)', nl) else 'Square ' if 'square' in nl else 'Small-Radius ' if 'small radius' in nl else ''
    a['hand'] = bool(re.search(r'hand ?made|handcrafted|fabricated', nl))
    lead = re.match(r'^(\d+)(?:-\d/\d)?\s?["″]?\s?(?:x\s?[\d.]+)?(?![\dg])', rest.lower())
    wf = num(it['p'].get('Width')); a['w_field'] = wf
    code = (re.search(r'-(\d\d)(\d\d)(?:S|FSAF|-[A-Z]+)?$', s) if s.startswith('SIN-') else
            re.match(r'^(?:KS[UHFT]|KGU|KPF|WS[FH] ?|FC)(\d\d)', s))
    ov = re.search(r'overall(?: dimensions)?:?\s*(\d+)', nl)
    if s.startswith('SIN-') and wf and s not in WIDTH_FIX: WIDTH_FIX_RUN[s] = int(wf + 0.45)
    a['w'] = (WIDTH_FIX[s] if s in WIDTH_FIX else WIDTH_FIX_RUN[s] if s in WIDTH_FIX_RUN else int(code.group(1)) if code else int(lead.group(1)) if (lead and 10 <= int(lead.group(1)) <= 60)
              else int(ov.group(1)) if ov else int(wf + 0.45) if wf else 0)
    a['d'] = num(it['p'].get('Height'))      # bowl depth sits in the Height field
    hm = re.search(r'-(\d)$', s) if s.startswith('KST') else re.search(r'(\d)[- ]?hole', nl)
    a['holes'] = hm.group(1) if hm else ''
    return a
def sink_key(it):
    s = it['sku']
    for pat, opt, vals in ((r'^(KGU\d+)(BK|WT)$', 'Color', {'BK': 'Black', 'WT': 'White'}),
                           (r'^(SIN-QTZ-.*)-(BLK|GRY|WHT)\s*$', 'Color', {'BLK': 'Black', 'GRY': 'Grey', 'WHT': 'White'}),
                           (r'^(WS[FH] \d+)(MB|SS)$', 'Finish', {'MB': 'Matte Black', 'SS': 'Stainless Steel'}),
                           (r'^(KST\d+[BT]?)-(\d)$', 'Faucet Holes', {str(i): f'{i}-Hole' for i in range(1, 6)})):
        m = re.match(pat, s)
        if m: return m.group(1), opt, vals[m.group(2)]
    return s, None, None
def sink_name(code, mem, opt):
    a = mem[0]['a']
    brand = mem[0]['brand'] or ('Elkay' if 'elkay' in mem[0]['name'].lower() else 'Dax' if mem[0]['sku'].startswith('DAX') else '')
    mount = a['mount'] + (' Workstation' if a['ws'] else '')
    hand = 'Handmade ' if a['hand'] and not a['ws'] else ''
    bowls = f"{a['split']} {a['bowls']} Bowl".strip()
    mat = (f"{a['gauge']}-Gauge " if a['gauge'] and len({m['a']['gauge'] for m in mem}) == 1 else '') + a['material']
    kind = 'Bar Sink' if a['bar'] else 'Kitchen Sink'
    holes = f", {a['holes']}-Hole" if a['holes'] and opt != 'Faucet Holes' and a['mount'] == 'Drop-In' else ''
    ada = ', ADA' if a['ada'] else ''
    w = f"{a['w']} in. " if a['w'] else ''
    disp = re.sub(r'\s*\(.*\)$', '', code).split(' ')[0] if not code.startswith('WS') else code
    base = re.sub(r'\s+', ' ', f"{brand} {w}{mount} {hand}{a['shape']}{bowls} {mat} {kind}{holes}{ada}").strip()
    return base, disp, brand

# ------------------------------------------------------------------ accessories
# grid 'fits' the live name does not state (taken from the grid's own code) or states with a typo
GRID_FITS = {'KSBGH321910BS': 'KSH321910BS', 'GFC2418UW': 'FC2418UW', 'KSBGH3219R': 'KSH321910R'}
def acc_name(code, mem):
    it = mem[0]; s = it['sku']; r = it['rest']; rl = r.lower(); b = it['brand']
    def P(x): return re.sub(r'\s+', ' ', f"{b} {x}").strip()
    if 'grid' in rl or s.startswith(('G6', 'GFC')):
        f = GRID_FITS.get(s)
        if f is None:
            m = re.search(r'bottom grid\s*-\s*(.+)$', r, re.I) or re.search(r'\bfor\s+(.+?)(?:\s+sink)?\)?$', r, re.I)
            f = m.group(1) if m else ''
            f = re.split(r'\s+-\s+|\s*\(|\s+w/b', f, flags=re.I)[0]
            f = re.sub(r'\s*,\s*', ', ', f.replace(' L / R / S', 'L/R/S')).strip(' -,').upper()
            if not re.search(r'\d', f): f = ''
        fin = 'Chrome' if 'chrome' in rl else 'Stainless Steel'
        return P(f"{fin} Sink Bottom Grid" + (f" for {f}" if f else '')), 'Bottom Grid'
    if s.startswith('KCLP'):
        t = re.sub(r'\bpack of\b', 'Pack of', r.title().replace('"C" Shape', 'C-Shape').replace('"L" Shape', 'L-Shape'), flags=re.I)
        t = re.sub(r'\s+Pack of', ', Pack of', t).replace(' With ', ' with ').replace(' And ', ' and ').replace('Under Mount', 'Undermount').replace('Top Mount', 'Drop-In')
        return P(t), 'Mounting Hardware'
    if s.startswith('KSSD') or s.startswith('SD-'): return P('Kitchen Sink Soap Dispenser'), 'Soap Dispenser'
    if s.startswith('KKDP'): return P('Kitchen Faucet Deck Plate, 3-Hole'), 'Deck Plate'
    if s.upper().startswith('PULLOUT'): return P('Kitchen Faucet Pull-Out Sprayer Head'), 'Faucet Part'
    if 'hole cover' in rl: return P('1-3/4 in. Sink Hole Cover in Chrome'), 'Sink Part'
    if s == 'KSS-01': return P('3-1/2 in. Kitchen Sink Drain'), 'Strainer & Drain'
    if s == 'KSS-03': return P('3-1/2 in. Kitchen Sink Strainer with Basket'), 'Strainer & Drain'
    if s == 'SIN-SINKSTRAINER': return P('Standard Kitchen Sink Basket Strainer'), 'Strainer & Drain'
    if s == 'MT300-BRS': return P('3-1/2 in. Deluxe Stemball Kitchen Sink Strainer in Brushed Stainless'), 'Strainer & Drain'
    return P(r.title()), 'Accessory'
def acc_key(it):
    s = it['sku']
    m = re.match(r'^(KSSD)-(02|04|05|07)$', s)
    if m: return 'KSSD', 'Finish', {'02': 'Polished Chrome', '04': 'Brushed Nickel', '05': 'Matte Black', '07': 'Satin Gold'}[m.group(2)]
    m = re.match(r'^(SD|KKDP)-(BN|CH|MB|SG|C)$', s)
    if m: return m.group(1), 'Finish', FINISH[m.group(2)]
    return s, None, None

# ------------------------------------------------------------------ assemble pages
pages = collections.OrderedDict()   # (kind, key) -> dict
for it in VIS:
    k = it['kind']
    if k == 'faucets':
        model, fin, spray = faucet_key(it); it['opt'] = {'Finish': fin, 'Side Spray': spray}; key = model
    elif k == 'sinks':
        it['a'] = sink_attrs(it); key, on, ov = sink_key(it); it['opt'] = {on: ov} if on else {}
    elif k == 'accessories':
        key, on, ov = acc_key(it); it['opt'] = {on: ov} if on else {}
    else: continue
    pages.setdefault((k, key), []).append(it)

out = {'faucets': [], 'sinks': [], 'accessories': []}; report = []
def blank(): return {c: '' for c in COLS}
def fin_rank(v): return FIN_ORDER.index(v) if v in FIN_ORDER else 50
built = []
for (kind, key), mem in pages.items():
    opts = [o for o in ({k for m in mem for k in m['opt']})]
    if kind == 'faucets':
        opts = ['Finish'] + (['Side Spray'] if len({m['opt']['Side Spray'] for m in mem}) > 1 else [])
        if len(mem) == 1: opts = []
        name, attrs = faucet_name(key, mem); cfx = [('Brand', attrs['Brand']), ('Faucet Type', attrs['Type']), ('Handles', attrs['Handles'])]
        single_fin = mem[0]['opt']['Finish'] if len(mem) == 1 else ''
    elif kind == 'sinks':
        opts = [o for o in opts if len(mem) > 1]
        base, disp, brand = sink_name(key, mem, opts[0] if opts else None); a = mem[0]['a']
        name = base; mem_disp = disp
        cfx = [('Brand', brand), ('Sink Type', 'Bar Sink' if a['bar'] else 'Kitchen Sink'), ('Mount', a['mount']), ('Bowls', a['bowls']), ('Material', a['material'])] + \
              ([('Gauge', f"{g}-Gauge") for g in sorted({m['a']['gauge'] for m in mem if m['a']['gauge']})]) + ([('Width', f"{a['w']} in.")] if a['w'] else []) + \
              ([('Workstation', 'Yes')] if a['ws'] else []) + ([('ADA', 'Yes')] if a['ada'] else [])
        single_fin = ''
    else:
        opts = [o for o in opts if len(mem) > 1]
        base, typ = acc_name(key, mem); name = base if key.upper().startswith('PULLOUT') else f"{base} ({key})"; cfx = [('Brand', mem[0]['brand']), ('Accessory Type', typ)]
        single_fin = ''
    built.append(dict(kind=kind, key=key, mem=mem, opts=opts, name=name, cfx=cfx, single_fin=single_fin, disp=locals().get('mem_disp') if kind == 'sinks' else key))
# sinks: add bowl depth where two pages would otherwise read the same, then the code
grp = collections.defaultdict(list)
for b in built:
    if b['kind'] == 'sinks': grp[b['name']].append(b)
for same in grp.values():
    codes = {b['disp'] for b in same}
    depths = [round(b['mem'][0]['a']['d'] * 2) / 2 for b in same]
    use_depth = len(same) > 1 and all(4 <= d <= 12 for d in depths) and len(set(depths)) > 1
    for b, d in zip(same, depths):
        if b['disp'].endswith('R') and b['disp'][:-1] in codes: b['name'] += ', Reverse Bowl'
        elif use_depth and not any(c + 'R' in codes for c in codes): b['name'] += f", {d:g} in. Deep"
        b['name'] += f" ({b['disp']})"
names = collections.Counter(b['name'] for b in built); assert max(names.values()) == 1, [n for n, c in names.items() if c > 1]

for b in built:
    kind, mem, opts, name = b['kind'], b['mem'], b['opts'], b['name']
    mem.sort(key=lambda m: tuple((fin_rank(m['opt'].get(o, '')) if o in ('Finish', 'Color') else {'Without': 0, 'With': 1}.get(m['opt'].get(o, ''), m['opt'].get(o, ''))) for o in (['Side Spray'] if 'Side Spray' in opts else []) + [o for o in opts if o != 'Side Spray']))
    if opts: assert len({tuple(m['opt'][o] for o in opts) for m in mem}) == len(mem), name
    if len(opts) > 1: assert len(mem) == len({m['opt'][opts[0]] for m in mem}) * len({m['opt'][opts[1]] for m in mem}), name
    d = mem[0]; dp = d['p']
    cfs = [(n, v) for n, v in d['cf'] if n in KEEP_CF] + [(n, v) for n, v in b['cfx'] if v]
    for o in opts:
        if o != 'Side Spray': cfs += [(o, v) for v in dict.fromkeys(m['opt'][o] for m in mem)]
    if b['single_fin']: cfs.append(('Finish', b['single_fin']))
    desc = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', dp.get('Description', ''))
    if kind == 'faucets' and len(mem) > 1 and len(desc) < 200: desc = ''
    P = blank()
    P.update({'Item': 'Product', 'Name': name, 'Type': 'physical', 'Inventory Tracking': 'none', 'Price': dp['Price'], 'Categories': CATEGORY[kind],
              'Description': desc, 'Custom Fields': cf_json(cfs), 'Page Title': f'{name} | Express Kitchens', 'Product URL': slug(name),
              'Free Shipping': 'FALSE', 'Weight': dp.get('Weight', ''), 'Is Visible': 'TRUE', 'Is Featured': 'FALSE', 'Tax Class': '0',
              'Product Condition': 'New', 'Show Product Condition': 'FALSE'})
    if not opts:
        for k in ('SKU', 'Cost Price', 'UPC/EAN', 'Global Trade Number', 'Manufacturer Part Number', 'Width', 'Height', 'Depth'): P[k] = dp.get(k, '').strip()
    rows = [P]
    gallery = [(u, d) for u in d['urls']]; have = {ckey(u) for u, _ in gallery}
    for m in mem[1:]:
        if m['urls'] and ckey(m['urls'][0]) not in have: gallery.append((m['urls'][0], m)); have.add(ckey(m['urls'][0]))
    for i, (u, m) in enumerate(gallery):
        I = blank(); lab = ' – '.join(m['opt'][o] for o in opts if o != 'Side Spray' and o != 'Faucet Holes')
        I.update({'Item': 'Image', 'Image URL (Import)': u, 'Image Description': name + (f' – {lab}' if lab else ''),
                  'Image is Thumbnail': 'TRUE' if i == 0 else 'FALSE', 'Image Sort Order': str(i)})
        rows.append(I)
    if opts:
        for m in mem:
            lp = m['p']; V = blank()
            V.update({'Item': 'Variant', 'SKU': m['sku'], 'Options': ''.join(f"Type=Rectangle|Name={o}|Value={m['opt'][o]}" for o in opts),
                      'Price': lp['Price'], 'Cost Price': lp.get('Cost Price', ''), 'UPC/EAN': lp.get('UPC/EAN', ''), 'Global Trade Number': lp.get('Global Trade Number', ''),
                      'Manufacturer Part Number': lp.get('Manufacturer Part Number', ''), 'Free Shipping': 'FALSE', 'Weight': lp.get('Weight', ''),
                      'Width': lp.get('Width', ''), 'Height': lp.get('Height', ''), 'Depth': lp.get('Depth', ''),
                      'Variant Image URL': (m['urls'] or [gallery[0][0] if gallery else ''])[0]})
            rows.append(V)
    out[kind] += rows
    report.append(dict(kind=kind, name=name, url=slug(name), options=opts, images=len(gallery),
                       attrs=({k: v for k, v in mem[0]['a'].items()} if kind == 'sinks' else {}),
                       members=[dict(sku=m['sku'], opt={o: m['opt'][o] for o in opts}, price=m['p']['Price'], old_name=m['name'], old_url=m['p'].get('Product URL', ''),
                                     cats=m['p'].get('Categories', ''), gauge=(m.get('a') or {}).get('gauge_sources')) for m in mem]))
FILES = {'faucets': 'kitchen-faucets.csv', 'sinks': 'kitchen-sinks.csv', 'accessories': 'sink-faucet-accessories.csv'}
for k, fn in FILES.items():
    with open(fn, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(out[k])
json.dump(report, open('_kitchen_report.json', 'w'), indent=1)
if __name__ == '__main__':
    print(collections.Counter(it['kind'] for it in VIS))
    for k in FILES:
        c = collections.Counter(r['Item'] for r in out[k]); print(k, dict(c), 'SKUs', sum(len(r['members']) for r in report if r['kind'] == k))
    want = sys.argv[1] if len(sys.argv) > 1 else ''
    for r in report:
        if r['kind'] == want:
            print(r['name'], '|', r['images'], '|', ' ; '.join(m['sku'] + ('=' + '/'.join(m['opt'].values()) if m['opt'] else '') for m in r['members']))
