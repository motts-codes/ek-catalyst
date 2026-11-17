"""
EK cabinets — size-as-product import builder (generic, any single-finish collection).

    python3 build_collection.py <collection>      e.g. rochelle | barcelona | derry | avon

Generalised from the approved Avon pilot builder (build_avon_v3.py). Same rules:
  * Name:  {Collection} {Cabinet Type} {size} in {Finish} – {Assembled | Ready To Assemble} ({code})
  * Size by type: base/sink = W; wall/tall/linen = W x H; 24"-deep wall = W x D x H;
    vanity = W x D; ADA = W x H. Always W x D x H order, every size labelled.
  * One page per size; build options are button rows (Door Style / Roll-Out Trays / Hinge);
    multi-size accessories = one product with a Size dropdown.
  * ADA ("HA" codes): own products, "ADA" in the name, true height, ADA = Yes field.
  * Full live photo sets at original resolution; identical re-uploads shown once.

Input : _src_<collection>.json  (visible products + custom fields + image rows, cut from the
        master BigCommerce export), optional _dead_<collection>.txt / _overrides_<collection>.json
Output: <collection>-size-as-product.csv, _products_<collection>.json, _report_<collection>.json
"""
import csv, json, re, html, sys, os, itertools
from collections import defaultdict, Counter

COLL = sys.argv[1]
# Prism collections: one collection, many finishes. Each finish is built as its own run (same rules),
# every product gets a `Finish` custom field, and the finish is in the name, URL and Group Key.
PRISM_AVON = {'stratus': 'Painted Stratus', 'hurricane': 'Hurricane', 'cappuccino': 'Cappuccino', 'chantilly': 'Chantilly',
              'forest': 'Forest', 'french-vanilla': 'French Vanilla', 'lakehouse': 'Lakehouse', 'olive': 'Olive',
              'midnight': 'Midnight', 'charcoal': 'Charcoal'}
CFG_ALL = {f'prism-avon-{k}': dict(name='Prism Avon', finish=v, category='863;911', finish_field=True) for k, v in PRISM_AVON.items()}
CFG = CFG_ALL.get(COLL) or {
    'avon':      dict(name='Avon',      finish='Painted White',   category='864'),
    'rochelle':  dict(name='Rochelle',  finish='Bordeaux',        category='867'),
    'derry':     dict(name='Derry',     finish='Painted Stratus', category='868'),
    'barcelona': dict(name='Barcelona', finish='Painted White',   category='869'),
}[COLL]
CNAME, FINISH = CFG['name'], CFG['finish']
FINISH_FIELD = CFG.get('finish_field', False)
SRC = json.load(open(f'_src_{COLL}.json'))
COLS = json.load(open('_out_cols.json'))
OUT = f'{COLL}-size-as-product.csv'
report = {'collection': CNAME, 'notes': [], 'data_issues': [], 'naming_decisions': [], 'duplicates': []}

# ---------------------------------------------------------------- helpers
def num(v):
    m = re.search(r'\d+(?:\.\d+)?', str(v or ''))
    return float(m.group()) if m else None

def fin(x):
    return (str(int(x)) if float(x).is_integer() else ('%g' % x)) + ' in.'

def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def parse(sku):
    m = re.match(r'^(.*?)\s+-\s+(.+)$', sku) if FINISH_FIELD else re.match(r'^(.*?)\s*-\s+([^-]*)$', sku)   # Prism: "B18 (RT2) - PRISM-AVON CHANTILLY"
    stem = (m.group(1) if m else sku).strip()
    stem = re.sub(r'\s*\(RTA\)', '', stem)
    prog = 'RTA' if sku.upper().rstrip().endswith('RTA') else 'ASM'
    m = re.search(r'\(RT(\d)(?:L/(\d)R)?\)', stem)
    rt, per_side = 0, 0
    if m:
        if m.group(2):
            per_side = int(m.group(1)); rt = per_side + int(m.group(2))
        else:
            rt = int(m.group(1))
    base = re.sub(r'\s*\(RT\d(?:L/\dR)?\)', '', stem).strip()
    hinge = None
    m = re.search(r'-(L|R)$', base)
    if m:
        hinge, base = m.group(1), base[:-2]
    spo = base.endswith('-SPO')
    if spo:
        base = base[:-4]
    fs = base.endswith('-FS')
    fh = bool(re.search(r'\dB?FH$', base))
    return dict(sku=sku, stem=stem, base=base, prog=prog, rt=rt, per_side=per_side, hinge=hinge,
                spo=spo, fs=fs, fh=fh, ada=base.startswith('HA'))

def code_dims(base):
    """Width / height / depth that the SKU code itself states (None where the code doesn't say)."""
    b = base.split('-')[0]
    mm = re.match(r'[A-Z]+', b)
    if not mm:
        return None, None, None
    pre = mm.group(0); rest = b[len(pre):]
    W = H = D = None
    if pre in ('W', 'GDFW', 'WEA', 'WDC', 'GDFWC', 'GDFIW', 'GDFIWC', 'OC', 'HAOC', 'MS', 'WSC', 'WR', 'MC', 'WC', 'MR'):
        m = re.match(r'(\d{2})(\d{2})', rest)
        if m: W, H = float(m.group(1)), float(m.group(2))
    elif pre in ('UC', 'LC', 'HAUC'):
        m = re.match(r'(\d{2})X(\d{2})', rest)
        if m: W, H = float(m.group(1)), float(m.group(2))
    elif pre == 'BLW':
        m = re.match(r'(\d{2})/\d{2}(\d{2})', rest)
        if m: W, H = float(m.group(1)), float(m.group(2))
    elif pre in ('B', 'SB', 'DB', 'BMW', 'BWB', 'BTC', 'HAB', 'HADB', 'VDB', 'HAVDB', 'LS', 'CSB', 'BOC', 'DD', 'HALS', 'HASB', 'V'):
        m = re.match(r'(\d{2})', rest)
        if m: W = float(m.group(1))
    return W, H, D

def prefix(base):
    m = re.match(r'[A-Z]+', base)
    return m.group(0) if m else base

# ---- cabinet type wording, by SKU prefix (Avon-approved wording + new types found in other collections)
CAB_DESC = {
    'B': 'Base Cabinet', 'HAB': 'Base Cabinet',
    'BMW': 'Base Microwave Cabinet',
    'BWB': 'Pull-out Wastebasket Base Cabinet with Soft Close',
    'BTC': 'Base Transitional Cabinet',
    'BLB': 'Blind Corner Base Cabinet', 'HABLB': 'Blind Corner Base Cabinet',
    'CSB': 'Diagonal Corner Sink Base Cabinet',
    'DB': 'Drawer Base Cabinet', 'HADB': 'Drawer Base Cabinet',
    'LS': 'Lazy Susan Corner Base Cabinet', 'HALS': 'Lazy Susan Corner Base Cabinet',
    'SB': 'Sink Base Cabinet', 'HASB': 'Sink Base Cabinet',
    'OC': 'Oven Tall Cabinet', 'HAOC': 'Oven Tall Cabinet',
    'UC': 'Tall Cabinet', 'HAUC': 'Tall Cabinet',
    'V': 'Vanity Cabinet', 'VDB': 'Vanity Drawer Base', 'HAVDB': 'Vanity Drawer Base',
    'LC': 'Vanity Linen Cabinet',
    'BLW': 'Blind Corner Wall Cabinet',
    'GDFWC': 'Frosted Glass Door Diagonal Corner Wall Cabinet',
    'GDFW': 'Frosted Glass Door Wall Cabinet',
    'W': 'Wall Cabinet', 'WDC': 'Diagonal Corner Wall Cabinet', 'WEA': 'Wall End Cabinet',
    # ---- new types (not in Avon) — wording proposed, listed in the workbook for EK to confirm
    'BOC': 'Oven Base Cabinet',
    'DD': 'Knee Drawer',
    'GDFIW': 'Glass Door Wall Cabinet with Finished Interior',
    'GDFIWC': 'Glass Door Diagonal Corner Wall Cabinet with Finished Interior',
    'MS': 'Microwave Wall Cabinet with Shelf',
    'WCUBE': 'Wall Spice Drawer Cabinet',
    'WSC': 'Wine Storage Cube Wall Cabinet',
    'WR': 'Wine Rack Wall Cabinet',
    'WES': 'Wall End Shelf',
    'MC': 'Medicine Cabinet',
    'WC': 'Vanity Wall Cabinet',
    'MR': 'Vanity Mirror',
}
NEW_CAB = {'BOC', 'DD', 'GDFIW', 'GDFIWC', 'MS', 'WCUBE', 'WSC', 'WR', 'WES', 'MC', 'WC', 'MR', 'HALS', 'HASB', 'HAUC'}
TRIM_DESC = {
    'RT': 'Roll-out Tray', 'VDE': 'Vanity Decorative Door', 'VAL': 'Arched Valance',
    'BDE': 'Base Decorative Door', 'BEP': 'Base End Panel', 'BF': 'Base Filler', 'BAT': 'Batten Molding',
    'BP': 'Back Panel', 'CV': 'Cove Crown Molding', 'CM': 'Crown Molding', 'DS': 'Door Sample',
    'DWR': 'Dishwasher Panel with Return', 'FBM': 'Furniture Base Molding', 'ICM': 'Inside Corner Molding',
    'LR': 'Light Rail Molding', 'OCM': 'Outside Corner Molding', 'QRM': 'Quarter Round Molding',
    'QDS': 'Quarter Cut Door Sample', 'REP': 'Refrigerator End Panel', 'UREP': 'Refrigerator End Panel',
    'RCM': 'Royal Crown Molding', 'SCRIBE': 'Scribe Molding', 'TDE': 'Tall Decorative Door',
    'TEP': 'Tall End Panel', 'TF': 'Tall Filler', 'TK': 'Toe Kick Cover', 'TUKIT': 'Touch-Up Kit',
    'VEP': 'Vanity End Panel', 'WDE': 'Wall Decorative Door', 'WEP': 'Wall End Panel', 'WF': 'Wall Filler',
    # ---- new accessories
    'BB': 'Bar Bracket', 'DFS': 'Door with Drawer Front Sample', 'DM': 'Dentil Molding',
    'RM': 'Rope Molding', 'PLY': 'Plywood Panel Finished One Side',
}
# accessory variants told apart by a code suffix
TRIM_RULES = [(r'^WF\d+X\d+-F$', 'Wall Fluted Filler'), (r'^WF\d+X\d+-O$', 'Wall Filler Overlay'),
              (r'^BP-B$', 'Beaded Back Panel')]
# accessories sold in two styles: one product, Style buttons
TRIM_STYLE = {'CORBEL-M': ('Corbel', 'Mission Style'), 'CORBEL-T': ('Corbel', 'Traditional Style'),
              'DL3-M': ('Decorative Leg', 'Mission Style'), 'DL3-T': ('Decorative Leg', 'Traditional Style')}
TRIM_PREFIXES = set(TRIM_DESC) | {'CORBEL', 'DL'}

def trim_desc(base):
    if base in TRIM_STYLE:
        return TRIM_STYLE[base][0]
    for pat, d in TRIM_RULES:
        if re.match(pat, base):
            return d
    return TRIM_DESC.get(prefix(base))

SIZE_LABEL_FIXED = {
    'VAL36': '36 in. W', 'VAL48': '48 in. W',
    'BF3': '3 in. W', 'BF6': '6 in. W',
    'DWR3': '3 in. Return', 'DWR6': '6 in. Return',
    'UREP96': '30 in. D (no return)', 'REP396': '24 in. D with 3 in. Return',
    'TF3X96': '3 in. W x 96 in. H', 'TF6X96': '6 in. W x 96 in. H',
    'WDE30': 'For 30 in. Wall Cabinet', 'WDE36': 'For 36 in. Wall Cabinet',
    'WEP1530': '30 in. H x 14.25 in. D', 'WEP1536': '36 in. H x 14.25 in. D',
    'WEP1542': '42 in. H x 14.25 in. D', 'WEP30': '30 in. H x 11.25 in. D',
    'WEP42': '42 in. H x 11.25 in. D', 'WEP36': '36 in. H x 11.25 in. D',
    'WF3X30': '3 in. W x 30 in. H', 'WF3X42': '3 in. W x 42 in. H', 'WF3X36': '3 in. W x 36 in. H',
    'WF6X30': '6 in. W x 30 in. H', 'WF6X42': '6 in. W x 42 in. H', 'WF6X36': '6 in. W x 36 in. H',
}

def size_sort(label):
    return [float(x) for x in re.findall(r'\d+(?:\.\d+)?', label)] or [0]

# ---------------------------------------------------------------- images
def orig(u):
    m = re.match(r'^(https://cdn\d+\.bigcommerce\.com/s-[^/]+)/products/(\d+)/images/(\d+)/(.+?)\.(\d+)\.\d+\.\d+\.(\w+)(\?.*)?$', u)
    if not m:
        return u
    host, pid, iid, fn, ts, ext, q = m.groups()
    return f'{host}/images/stencil/original/products/{pid}/{iid}/{fn}.{ts}.{ext}{q or ""}'

def ckey(u):
    fn = u.split('/')[-1].split('?')[0]
    fn = re.sub(r'^[a-z]_\d+_', '', fn)
    return fn.split('__')[0].lower()

OVR = json.load(open(f'_overrides_{COLL}.json')) if os.path.exists(f'_overrides_{COLL}.json') else {}
DEAD = set(l.strip() for l in open(f'_dead_{COLL}.txt')) if os.path.exists(f'_dead_{COLL}.txt') else set()

# ---------------------------------------------------------------- load live rows
MEMBER_FIELDS = ['SKU', 'Price', 'Cost Price', 'UPC/EAN', 'Global Trade Number', 'Weight', 'Width',
                 'Height', 'Depth', 'Bin Picking Number', 'Manufacturer Part Number']
members = []
for x in SRC:
    p = x['p']
    sku = p['SKU'].strip()
    m = {k: (p.get(k) or '').strip() for k in MEMBER_FIELDS}
    m['SKU'] = sku
    m['Free Shipping'] = 'FALSE'
    m.update(parse(sku))
    m['live_name'] = p['Name']; m['live_url'] = p['Product URL']
    m['live_desc_text'] = html.unescape(re.sub(r'<[^>]+>', ' ', p.get('Description') or ''))
    m['cf'] = [{'name': d['name'], 'value': html.unescape(d.get('value') or '')} for d in json.loads(p['Custom Fields'] or '[]')]
    m['cfd'] = {}
    for d in m['cf']:
        m['cfd'].setdefault(d['name'], d['value'])
    lst = []
    for d in x['images']:
        u = d.get('exp') or d.get('imp')
        if u:
            lst.append((d.get('thumb') != 'TRUE', int(d.get('sort') or 99), u))
    lst.sort()
    raw = [orig(u) for _, _, u in lst]
    m['imgs_raw'] = raw
    m['imgs'] = list(OVR[sku]) if sku in OVR else [u for u in raw if u not in DEAD]
    m['ptype'] = m['cfd'].get('Product Type', '')
    members.append(m)

dup = Counter(m['SKU'] for m in members)
assert all(v == 1 for v in dup.values()), [k for k, v in dup.items() if v > 1]

def drawers(m):
    mm = re.search(r'(\d+)\s*Drawer', m['cfd'].get('door_shelf_drawer', ''))
    if not mm and FINISH_FIELD:      # Prism has no door_shelf_drawer field; its description says "(3) Drawer" / "3 Drawer"
        mm = re.search(r'\(?(\d+)\)?\s*Drawer', m.get('live_desc_text', ''))
    return int(mm.group(1)) if mm else None

def name_dims(n):
    mm = re.search(r'([\d.]+) in\. W x ([\d.]+) in\. H x ([\d.]+) in\. D', n)
    return tuple(float(g) for g in mm.groups()) if mm else (None, None, None)

def live_desc(n):
    """Fallback descriptor from EK's live name (used only for prefixes we have no wording for)."""
    s = re.sub(rf'^{CNAME}\s+', '', n, flags=re.I)
    s = re.sub(r'^(Assembled|Ready to Assemble)\s+', '', s, flags=re.I)
    s = re.sub(r'[\d.]+ in\. W x [\d.]+ in\. H x [\d.]+ in\. D\s*', '', s)
    s = re.sub(r'^Plywood\s+(\d+"\s*)?', '', s)
    s = re.sub(rf'\s+in\s+{FINISH}.*$', '', s, flags=re.I)
    return s.strip()

# ---------------------------------------------------------------- descriptor + grouping
for m in members:
    pre = prefix(m['base'])
    is_trim = pre in TRIM_PREFIXES or (m['ptype'] == 'TRIM & DECORATIVE' and pre not in CAB_DESC)
    if is_trim:
        d = trim_desc(m['base'])
        if m['ptype'] != 'TRIM & DECORATIVE':
            report['data_issues'].append(f"{m['SKU']}: Product Type field says {m['ptype'] or '(blank)'} — it is an accessory; set to TRIM & DECORATIVE in this file.")
            m['ptype'] = 'TRIM & DECORATIVE'
            for d_ in m['cf']:
                if d_['name'] == 'Product Type':
                    d_['value'] = 'TRIM & DECORATIVE'
            if not any(d_['name'] == 'Product Type' for d_ in m['cf']):
                m['cf'].append({'name': 'Product Type', 'value': 'TRIM & DECORATIVE'})
    else:
        d = CAB_DESC.get(pre)
    if not d:
        d = live_desc(m['live_name'])
        report['naming_decisions'].append(f"No wording rule for prefix {pre} ({m['SKU']}) — used the live wording: {d!r}")
    if m['fs']:
        d = 'Farm Sink Base Cabinet'
    if pre == 'BWB' and not m['base'].endswith('-SC'):
        d = 'Pull-out Wastebasket Base Cabinet'      # only the -SC codes are soft close
    m['is_trim'] = is_trim
    m['desc0'] = d
    if is_trim:
        m['family'] = d
    else:
        m['family'] = re.sub(r'FH$', '', m['base'])

groups = defaultdict(list)
for m in members:
    groups[(m['prog'], m['is_trim'], m['family'])].append(m)

# ---------------------------------------------------------------- build products
out_products = []
for (prog, is_trim, family), mem in groups.items():
    mem.sort(key=lambda m: (m['fh'], m['rt'], m['spo'], m['hinge'] == 'R', m['SKU']))
    rep = mem[0]
    sku = rep['SKU']
    ptype = rep['ptype'] or ('TRIM & DECORATIVE' if is_trim else '')
    if not rep['ptype']:
        report['data_issues'].append(f'{sku}: no Product Type custom field.')
    prog_word = 'Ready To Assemble' if prog == 'RTA' else 'Assembled'
    prog_slug = 'rta' if prog == 'RTA' else 'assembled'
    ada = rep['ada']
    multi_size = is_trim and len(mem) > 1
    pre = prefix(rep['base'])
    split = ''
    if ptype == 'WALL CABINET' and re.search(r'X24B?$', rep['base']):
        split = 'D24'
    mv = re.match(r'V\d{2}(18|21)B?$', rep['base'])
    if ptype == 'VANITY CABINET' and mv:
        split = 'VD' + mv.group(1)

    desc = rep['desc0']
    if is_trim and len(mem) == 1 and rep['base'] in TRIM_STYLE:
        desc += ' ' + TRIM_STYLE[rep['base']][1]
    if desc == 'Drawer Base Cabinet':
        n = drawers(rep)
        desc = f'{n}-Drawer Base Cabinet' if n else desc
    if desc == 'Vanity Drawer Base':
        n = drawers(rep)
        desc = f'{n}-Drawer Vanity Cabinet' if n else 'Drawer Vanity Cabinet'
    if ada:
        desc = 'ADA ' + desc

    # ---- true dimensions: Cabinets custom fields, else live name, else Dimensions fields
    W = num(rep['cfd'].get('Cabinets Width')); H = num(rep['cfd'].get('Cabinets Height')); D = num(rep['cfd'].get('Cabinets Depth'))
    lw, lh, ld = name_dims(rep['live_name'])
    W, H, D = W or lw or num(rep['Width']), H or lh or num(rep['Height']), D or ld or num(rep['Depth'])
    for mm in mem:      # Dimensions fields that hold the nominal / host-cabinet size
        if re.match(r'(BLB|RT)\d', mm['base']):
            nw, nh, ndp = name_dims(mm['live_name'])      # real size: Cabinets fields, else the live name
            for fld, cfn, nv in (('Width', 'Cabinets Width', nw), ('Height', 'Cabinets Height', nh), ('Depth', 'Cabinets Depth', ndp)):
                v = num(mm['cfd'].get(cfn)) or nv
                if v and abs(v - float(mm[fld] or 0)) > 0.01:
                    report['data_issues'].append(f"{mm['SKU']}: Dimensions {fld} {mm[fld]} is the nominal/host size — using the real {v:g}.")
                    mm[fld] = f'{v:.2f}'
    cf_fix = {}
    if not is_trim:
        kw, kh, _ = code_dims(rep['base'])
        if kw and W and abs(kw - W) > 0.01:
            report['data_issues'].append(f'{sku}: Cabinets Width field says {W:g}" but the SKU code says {kw:g}" — using {kw:g}".')
            W = kw; cf_fix['Cabinets Width'] = f'{kw:g}"'
        if kh and H and abs(kh - H) > 0.01 and not ada:
            report['data_issues'].append(f'{sku}: Cabinets Height field says {H:g}" but the SKU code says {kh:g}" — using {kh:g}".')
            H = kh; cf_fix['Cabinets Height'] = f'{kh:g}"'
        for mm in mem:          # Dimensions fields (shipping) that disagree with the code
            mw, mh, _ = code_dims(mm['base'])
            for fld, kv in (('Width', mw), ('Height', mh)):
                if kv and mm[fld] and abs(float(mm[fld]) - kv) > 0.01 and not (fld == 'Height' and mm['ada']):
                    report['data_issues'].append(f"{mm['SKU']}: Dimensions {fld} {float(mm[fld]):g} but the SKU code says {kv:g} — using {kv:g}.")
                    mm[fld] = f'{kv:.2f}'
    if ada:
        ph = num(rep['Height'])
        if ph:
            H = ph
    if split == 'D24':
        if D != 24:
            report['data_issues'].append(f'{sku}: Cabinets Depth field says {D}" but it is a 24"-deep wall cabinet — corrected to 24".')
        D = 24.0
    if split.startswith('VD'):
        D = float(split[2:])

    # ---- size string + slug parts
    size, sslug = '', []
    bad_trim_dims = is_trim and W == 12 and H == 34.5 and D == 24 and pre not in ('DWR',)
    if bad_trim_dims and not multi_size:
        report['data_issues'].append(f'{sku}: accessory carries a base cabinet\'s size (12 × 34.5 × 24) in every field — name left without a size until EK confirms the real one.')
    if is_trim:
        if not multi_size and not bad_trim_dims and W and H and D:
            size = f'{fin(W)} W x {fin(D)} D x {fin(H)} H'
    elif ptype in ('BASE CABINET', 'SINK BASE CABINET'):
        if ada:
            size = f'{fin(W)} W x {fin(H)} H'; sslug = [f'{W:g}in', f'{H:g}in']
        else:
            size = f'{fin(W)} W'; sslug = [f'{W:g}in']
    elif ptype == 'WALL CABINET':
        if split == 'D24':
            size = f'{fin(W)} W x {fin(D)} D x {fin(H)} H'; sslug = [f'{W:g}in', f'{D:g}in-deep', f'{H:g}in']
        else:
            size = f'{fin(W)} W x {fin(H)} H'; sslug = [f'{W:g}in', f'{H:g}in']
    elif ptype == 'TALL CABINET':
        size = f'{fin(W)} W x {fin(H)} H'; sslug = [f'{W:g}in', f'{H:g}in']
    elif ptype == 'VANITY CABINET':
        if ada or desc.endswith('Linen Cabinet') or pre in ('MC', 'WC', 'MR'):
            size = f'{fin(W)} W x {fin(H)} H'; sslug = [f'{W:g}in', f'{H:g}in']
        elif desc == 'Vanity Cabinet':
            size = f'{fin(W)} W x {fin(D)} D'; sslug = [f'{W:g}in', f'{D:g}in-deep']
        else:
            size = f'{fin(W)} W'; sslug = [f'{W:g}in']
    else:
        size = f'{fin(W)} W x {fin(H)} H' if W and H else ''
        sslug = [f'{W:g}in', f'{H:g}in'] if W and H else []

    code = rep['base']
    if is_trim:
        if multi_size:
            name = f'{CNAME} {desc} in {FINISH} – {prog_word}'
        else:
            mid = f' {size}' if size else ''
            name = f'{CNAME} {desc}{mid} in {FINISH} – {prog_word} ({code})'
        url_slug = slug(f'{CNAME} {FINISH if FINISH_FIELD else ""} {desc} {prog_slug}')
    else:
        name = f'{CNAME} {desc} {size} in {FINISH} – {prog_word} ({code})'
        url_slug = slug(' '.join([CNAME] + ([FINISH] if FINISH_FIELD else []) + [desc] + sslug + [prog_slug]))

    # ---- variant labels (combined label = used for photo alt text / workbook)
    has_fh = any(m['fh'] for m in mem)
    has_std = any(not m['fh'] for m in mem)
    std_has_drawer = any((drawers(m) or 0) > 0 for m in mem if not m['fh'])
    if multi_size:      # size label: fixed wording where we have it, else the dimensions that differ
        dims = [(num(m['cfd'].get('Cabinets Width')) or num(m['Width']), num(m['cfd'].get('Cabinets Depth')) or num(m['Depth']),
                 num(m['cfd'].get('Cabinets Height')) or num(m['Height'])) for m in mem]
        vary = [i for i in range(3) if len({d[i] for d in dims}) > 1]
    for i, m in enumerate(mem):
        if multi_size and m['base'] in TRIM_STYLE:
            m['opt'] = ('Style', TRIM_STYLE[m['base']][1])
            continue
        if multi_size:
            mr = re.match(r'RT(\d+)$', m['base'])
            lab = f'For {mr.group(1)} in. Cabinet' if mr else SIZE_LABEL_FIXED.get(m['base'])
            mw = re.match(r'WDE(\d+)$', m['base'])
            if mw:
                lab = f'For {mw.group(1)} in. Wall Cabinet'
            mw = re.match(r'WF(\d+)X(\d+)-[FO]$', m['base'])
            if mw:                                   # size from the code (some recorded heights are off)
                lab = f'{mw.group(1)} in. W x {mw.group(2)} in. H'
                if dims[i][2] and abs(dims[i][2] - float(mw.group(2))) > 0.01:
                    report['data_issues'].append(f"{m['SKU']}: height recorded as {dims[i][2]:g} but the code says {mw.group(2)} — label uses {mw.group(2)}; EK to confirm.")
            if prefix(m['base']) == 'WEP' and dims[i][2] and dims[i][1]:
                lab = f'{fin(dims[i][2])} H x {fin(dims[i][1])} D'
            if not lab:
                lab = ' x '.join(f"{fin(dims[i][j])} {'WDH'[j]}" for j in (vary or [0]) if dims[i][j]) or m['base']
            m['opt'] = ('Size', lab)
            continue
        if m['hinge']:
            m['opt'] = ('Hinge', 'Left Hinge' if m['hinge'] == 'L' else 'Right Hinge')
            continue
        if m['fh']:
            door = 'Full-Height Door (no drawer)'
        elif has_fh and has_std and std_has_drawer:
            door = 'Standard (door + drawer)'
        else:
            door = 'Standard'
        extras = []
        if m['rt']:
            t = f"+{m['rt']} Roll-Out Tray" + ('s' if m['rt'] > 1 else '')
            if m['per_side']:
                t += f" ({m['per_side']} per side)"
            extras.append(t)
        if m['spo']:
            extras.append('+ Spice Pull-Out')
        lab = ', '.join(extras) if (door == 'Standard' and extras and not has_fh) else ', '.join([door] + extras)
        m['opt'] = ('Configuration', lab)
    if multi_size:
        mem.sort(key=lambda m: size_sort(m['opt'][1]))

    # ---- storefront options
    any_spo = any(m['spo'] for m in mem)
    any_extra = any(m['rt'] or m['spo'] for m in mem)
    any_hinge = any(m['hinge'] for m in mem)
    for m in mem:
        if multi_size:
            m['opts'] = [(m['opt'][0], m['opt'][1], 'Rectangle' if m['opt'][0] == 'Style' else 'Dropdown')]
            continue
        opts = []
        if has_fh and has_std:
            door = 'Full-Height Door (no drawer)' if m['fh'] else ('Standard (door + drawer)' if std_has_drawer else 'Standard')
            opts.append(('Door Style', door, 'Rectangle'))
        if any_extra:
            if m['spo']:
                v = 'Spice Pull-Out'
            elif m['rt']:
                n = m['rt']
                v = (f'{n} Roll-Out Tray' if any_spo else f'{n} Tray') + ('s' if n > 1 else '')
                if m['per_side']:
                    v += f" ({m['per_side']} per side)"
            else:
                v = 'None'
            opts.append(('Interior' if any_spo else 'Roll-Out Trays', v, 'Rectangle'))
        if any_hinge:
            opts.append(('Hinge', {'L': 'Left Hinge', 'R': 'Right Hinge'}.get(m['hinge'], 'Not handed'), 'Rectangle'))
        m['opts'] = opts
        if any_hinge and len(opts) > 1:      # combined label must stay unique for alt text
            m['opt'] = ('Configuration', ' · '.join(v for _, v, _ in opts))
    if len(mem) > 1:
        combos = [tuple(v for _, v, _ in m['opts']) for m in mem]
        if not all(combos) or len(combos) != len(set(combos)):
            # same build listed twice on the live site: keep the first as the product's variant, park the rest
            seen, keep = {}, []
            for m, c in zip(mem, combos):
                if c in seen or not c:
                    report['duplicates'].append(f"{m['SKU']} is the same build as {seen.get(c, mem[0])['SKU'] if c in seen else mem[0]['SKU']} ({name}) — left out; EK to confirm which SKU is live.")
                else:
                    seen[c] = m; keep.append(m)
            mem = keep
            combos = [tuple(v for _, v, _ in m['opts']) for m in mem]
        if len(mem) > 1:
            axes = [sorted({c[i] for c in combos}) for i in range(len(combos[0]))]
            n_all = 1
            for ax in axes:
                n_all *= len(ax)
            if n_all != len(combos):
                missing = sorted(set(itertools.product(*axes)) - set(combos))
                report.setdefault('missing_combos', []).append({'product': name, 'missing': [' + '.join(c) for c in missing]})
    if len(mem) == 1:
        mem[0]['opts'] = []
    labels = [m['opt'][1] for m in mem]
    assert len(labels) == len(set(labels)), (name, labels)

    # ---- custom fields
    cfs = [dict(d) for d in rep['cf'] if d['name'] not in ('Program', 'Width', 'Height', 'Depth', 'Group Key', 'ADA', 'Finish')]
    if FINISH_FIELD:
        cfs.insert(0, {'name': 'Finish', 'value': FINISH})
    for d in cfs:
        if ada and d['name'] == 'Cabinets Height' and H:
            if num(d['value']) != H:
                report['data_issues'].append(f'{sku}: Cabinets Height field says {d["value"]} — ADA height is {H:g}" (corrected in this file).')
            d['value'] = f'{H:g}"'
        if d['name'] in cf_fix:
            d['value'] = cf_fix[d['name']]
        if split == 'D24' and d['name'] == 'Cabinets Depth':
            d['value'] = '24"'
        if split.startswith('VD') and d['name'] == 'Cabinets Depth':
            d['value'] = f'{D:g}"'
    cfs.append({'name': 'Program', 'value': 'RTA' if prog == 'RTA' else 'Assembled'})
    if W: cfs.append({'name': 'Width', 'value': f'{W:g}'})
    if H: cfs.append({'name': 'Height', 'value': f'{H:g}'})
    if D: cfs.append({'name': 'Depth', 'value': f'{D:g}'})
    cfs.append({'name': 'Group Key', 'value': f'{slug(CNAME)}-{slug(FINISH)}-{prog_slug}'})
    if ada:
        cfs.append({'name': 'ADA', 'value': 'Yes'})

    # ---- gallery: every member's photos, standard build first, identical re-uploads once
    gallery, seen = [], set()
    for m in mem:
        for u in m['imgs']:
            k = ckey(u)
            if k in seen:
                continue
            seen.add(k)
            gallery.append([u, m['opt'][1] if len(mem) > 1 else ''])

    out_products.append(dict(name=name, slug=url_slug, code=code, ptype=ptype, prog=prog_word, ada=ada,
                             split=split, desc=desc, W=W, H=H, D=D, members=mem, cfs=cfs, gallery=gallery,
                             rep=rep, multi=multi_size, is_trim=is_trim, new_type=(pre in NEW_CAB)))

# stable, readable order: type, program, descriptor, width, height
TYPE_ORDER = ['BASE CABINET', 'SINK BASE CABINET', 'WALL CABINET', 'TALL CABINET', 'VANITY CABINET', 'TRIM & DECORATIVE']
out_products.sort(key=lambda p: (TYPE_ORDER.index(p['ptype']) if p['ptype'] in TYPE_ORDER else 9, p['prog'], p['ada'],
                                 p['desc'], p['W'] or 0, p['H'] or 0, p['D'] or 0, p['code']))

def cf_json(cfs):
    return json.dumps([{'name': d['name'], 'value': d['value'].replace('"', '&quot;')} for d in cfs],
                      ensure_ascii=False, separators=(',', ':'))

# ---------------------------------------------------------------- unique slugs / names
cnt = Counter(p['slug'] for p in out_products)
for p in out_products:
    if cnt[p['slug']] > 1:
        p['slug'] = p['slug'] + '-' + slug(p['code'])
cnt = Counter(p['slug'] for p in out_products)
assert all(v == 1 for v in cnt.values()), [k for k, v in cnt.items() if v > 1]
names = Counter(p['name'] for p in out_products)
assert all(v == 1 for v in names.values()), [k for k, v in names.items() if v > 1]

# ---------------------------------------------------------------- write CSV
def blank():
    return {c: '' for c in COLS}

VAR_FIELDS = ['Price', 'Cost Price', 'UPC/EAN', 'Global Trade Number', 'Weight', 'Width', 'Height', 'Depth',
              'Free Shipping', 'Bin Picking Number', 'Manufacturer Part Number']
out_rows, problems = [], []
for p in out_products:
    mem, rep = p['members'], p['rep']
    pr = blank()
    pr.update({'Item': 'Product', 'Type': 'physical', 'Name': p['name'], 'Page Title': p['name'],
               'Product URL': f"/{p['slug']}/", 'Custom Fields': cf_json(p['cfs']),
               'Categories': CFG['category'], 'Is Visible': 'TRUE', 'Is Featured': 'FALSE', 'Tax Class': '0',
               'Product Condition': 'New', 'Show Product Condition': 'FALSE', 'Free Shipping': 'FALSE',
               'Inventory Tracking': 'none'})
    if len(mem) == 1:
        m = mem[0]
        pr['SKU'] = m['SKU']
        for k in VAR_FIELDS:
            pr[k] = m.get(k, '') or pr.get(k, '')
    else:
        pr['Price'] = rep.get('Price', '')
        pr['Weight'] = rep.get('Weight', '')
    out_rows.append(pr)
    gal = p['gallery']
    if not gal:
        problems.append(f"NO IMAGE: {p['name']}")
    for i, (u, lab) in enumerate(gal):
        ir = blank()
        ir.update({'Item': 'Image', 'Image URL (Import)': u, 'Image is Thumbnail': 'TRUE' if i == 0 else 'FALSE',
                   'Image Sort Order': str(i), 'Image Description': p['name'] + (f' – {lab}' if lab else '')})
        out_rows.append(ir)
    if len(mem) > 1:
        for m in mem:
            vr = blank()
            vr['Item'] = 'Variant'
            vr['SKU'] = m['SKU']
            vr['Options'] = ''.join(f"Type={t}|Name={n}|Value={v}" for n, v, t in m['opts'])
            for k in VAR_FIELDS:
                vr[k] = m.get(k, '')
            vr['Variant Image URL'] = m['imgs'][0] if m['imgs'] else (gal[0][0] if gal else '')
            if not m['imgs']:
                problems.append(f"variant uses product image: {m['SKU']}")
            out_rows.append(vr)

with open(OUT, 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=COLS)
    w.writeheader()
    w.writerows(out_rows)

report['image_problems'] = problems
report['counts'] = {'live_skus': len(members), 'products': len(out_products),
                    'skus': sum(len(p['members']) for p in out_products),
                    'with_variants': sum(1 for p in out_products if len(p['members']) > 1),
                    'image_rows': sum(1 for r in out_rows if r['Item'] == 'Image'),
                    'variant_rows': sum(1 for r in out_rows if r['Item'] == 'Variant'),
                    'ada_products': sum(1 for p in out_products if p['ada'])}
slim = lambda m: {k: v for k, v in m.items() if k not in ('cf', 'cfd', 'imgs_raw')}
json.dump([{**{k: v for k, v in p.items() if k not in ('members', 'rep')}, 'members': [slim(m) for m in p['members']],
            'rep': slim(p['rep'])} for p in out_products], open(f'_products_{COLL}.json', 'w'), default=str)
json.dump(report, open(f'_report_{COLL}.json', 'w'), indent=1)
print(CNAME, report['counts'], '| image problems:', len(problems), '| duplicates:', len(report['duplicates']),
      '| naming decisions:', len(report['naming_decisions']), '| data issues:', len(report['data_issues']))
