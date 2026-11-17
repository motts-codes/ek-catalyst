"""Bath rework: Vanity Tops, Side Splashes, Bathroom Sinks, Bathroom Faucets, Drains & Accessories.
Input : _sf_src.json via build_kitchen.py (same loader, classification and helpers)
Output: vanity-tops.csv, side-splashes.csv, bathroom-sinks.csv, bathroom-faucets.csv, bath-drains-accessories.csv, _bath_report.json
Visible products only. SKUs, prices, costs, UPCs are never changed."""
import csv, json, re, html, collections, sys, importlib.util
_argv = sys.argv; sys.argv = ['x']
spec = importlib.util.spec_from_file_location('bk', 'build_kitchen.py'); bk = importlib.util.module_from_spec(spec); spec.loader.exec_module(bk)
sys.argv = _argv
COLS, slug, cf_json, ckey, num, FINISH, KEEP_CF = bk.COLS, bk.slug, bk.cf_json, bk.ckey, bk.num, bk.FINISH, bk.KEEP_CF
CATEGORY = {'tops': '879', 'splashes': '880', 'sinks': '881', 'faucets': '882', 'drains': '883'}     # sandbox category IDs - fill in when known
FILES = {'tops': 'vanity-tops.csv', 'splashes': 'side-splashes.csv', 'sinks': 'bathroom-sinks.csv', 'faucets': 'bathroom-faucets.csv', 'drains': 'bath-drains-accessories.csv'}
ORDER = ['Polished Chrome', 'Brushed Nickel', 'Matte Black', 'Satin Gold', 'Oil Rubbed Bronze', 'White', 'Biscuit', 'Black', 'Left', 'Right']
B = [it for it in bk.VIS if it['kind'] == 'bath']
def desc_text(it): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html.unescape(re.sub(r'[\x00-\x1f\x7f-\x9f]', '', it['p'].get('Description', ''))))).strip()
def frac(v):
    w = int(v); f = round((v - w) * 8)
    if f == 8: w += 1; f = 0
    return str(w) if f == 0 else f"{w}-{ {1:'1/8',2:'1/4',3:'3/8',4:'1/2',5:'5/8',6:'3/4',7:'7/8'}[f] }"

STONE = {'BP': ('Black Pearl', 'Granite'), 'CW': ('Carrara White', 'Marble'), 'GF': ('Giallo Fiorito', 'Granite'), 'SC': ('Santa Cecelia Light', 'Granite'),
         'AB': ('Absolute Black', 'Granite'), 'BW': ('Burlywood', 'Granite'), 'TS': ('Tiger Skin', 'Granite'), 'WT': ('Wheat', 'Granite')}
STONE['CGTCW'] = ('Cara White', 'Granite')
# six pop-up drains exist twice on live under two SKU spellings (same price and cost): the clean code is kept
POP_TWIN = {'KSPOP-01': 'KSPOP-01 Overflow', 'KSPOP-02': 'KSPOP-02 W/O O/F', 'KSPOP-03': 'KSPOP-03 Overflow', 'KSPOP-04': 'KSPOP-04 W/O O/F', 'KSPOP-05': 'KSPOP-05 Overflow', 'KSPOP-07': 'KSPOP-07 Overflow'}
POP = {'KSPOP-01': ('Polished Chrome', 'with'), 'KSPOP-02': ('Polished Chrome', 'without'), 'KSPOP-03': ('Brushed Nickel', 'with'), 'KSPOP-04': ('Brushed Nickel', 'without'),
       'KSPOP-05': ('Matte Black', 'with'), 'KSPOP-07': ('Satin Gold', 'with')}
BYSKU = {it['sku']: it for it in B}
dups = []; pages = collections.OrderedDict()

def page(kind, key): return pages.setdefault((kind, key), dict(kind=kind, key=key, mem=[], opts=[], cfx=[], name=''))
for it in B:
    s = it['sku']; su = s.upper(); d = desc_text(it); dl = d.lower(); it['opt'] = {}
    # ---------------- pop-up drains / deck plates
    if su.startswith('KSPOP'):
        if s not in POP: dups.append(it); continue
        fin, ov = POP[s]; it['opt'] = {'Finish': fin}
        tw = BYSKU.get(POP_TWIN[s])
        if tw: it['urls'] = it['urls'] + [u for u in tw['urls'] if ckey(u) not in {ckey(x) for x in it['urls']}]
        pg = page('drains', 'KSPOP-' + ov); pg['mem'].append(it); pg['opts'] = ['Finish']
        pg['name'] = f"Oakland Push Pop-Up Bathroom Sink Drain {ov} Overflow (KSPOP)"; pg['cfx'] = [('Brand', 'Oakland'), ('Accessory Type', 'Pop-Up Drain'), ('Overflow', 'With Overflow' if ov == 'with' else 'Without Overflow')]
        continue
    if su.startswith('KBDP'):
        it['opt'] = {'Finish': FINISH[s.split('-')[1]]}
        pg = page('drains', 'KBDP'); pg['mem'].append(it); pg['opts'] = ['Finish']
        pg['name'] = 'Oakland Bathroom Faucet Deck Plate, 3-Hole (KBDP)'; pg['cfx'] = [('Brand', 'Oakland'), ('Accessory Type', 'Deck Plate')]
        continue
    # ---------------- faucets
    m = re.match(r'^(KSB\d+)(BN|MB|RB|SG|C)$', su)
    if m:
        model = m.group(1); it['opt'] = {'Finish': FINISH[m.group(2)]}
        digits = model[3:]; handles = 'Two-Handle' if digits[1] == '2' else 'Single-Handle'
        nl = it['name'].lower()
        typ = ('8 in. Widespread ' if 'wide spread' in nl else '4 in. Centerset ' if digits[0] == '4' else 'Vessel ' if 'vessel' in nl else '')
        pg = page('faucets', model); pg['mem'].append(it); pg['opts'] = ['Finish']
        pg['name'] = f"Oakland {handles} {typ}Bathroom Faucet with Pop-Up Drain ({model})"
        pg['cfx'] = [('Brand', 'Oakland'), ('Faucet Type', typ.strip().replace('8 in. ', '').replace('4 in. ', '') or 'Standard'), ('Handles', handles.replace('-Handle', ''))]
        if 'vessel' in nl: pg['vessel'] = True
        continue
    # ---------------- side splashes
    if '365' in it['cats']:
        m = re.match(r'^VT([A-Z]{2})-SS$', su)
        if m:
            stone, mat = STONE[m.group(1)]; pg = page('splashes', s)
            pg['name'] = f"{stone} {mat} Side Splash 21-1/4 in. x 3 in. ({s})"; pg['cfx'] = [('Material', mat), ('Color', stone), ('Fits', 'Left or Right')]
        else:
            m = re.match(r'^CGT([A-Z]{2})-SDSP-([LR])$', su); stone, mat = STONE.get('CGT' + m.group(1), STONE[m.group(1)])
            it['opt'] = {'Side': 'Left' if m.group(2) == 'L' else 'Right'}; pg = page('splashes', f'CGT{m.group(1)}-SDSP'); pg['opts'] = ['Side']
            pg['name'] = f"{stone} {mat} Side Splash 22 in. x 4 in. (CGT{m.group(1)}-SDSP)"; pg['cfx'] = [('Material', mat), ('Color', stone)]
        pg['mem'].append(it); continue
    # ---------------- vanity tops
    if '366' in it['cats'] or s == '2445910':
        spread = re.search(r'(\d)\s?[”"″]?\s?(?:oc|cc|faucet spread)', dl)
        sp = f", {spread.group(1)} in. Faucet Spread" if spread else ''
        w, dp = int(num(it['p'].get('Width'))), int(num(it['p'].get('Depth')))
        size = f"{w} in. W x {dp} in. D"
        m = re.match(r'^VT([A-Z]{2})(\d{4})-(BIS|WHT)', su); m2 = re.match(r'^CGT([A-Z]{2})-(\d{4})(D?)$', su)
        if m:
            stone, mat = STONE[m.group(1)]; code = f'VT{m.group(1)}{m.group(2)}'; it['opt'] = {'Bowl Color': 'Biscuit' if m.group(3) == 'BIS' else 'White'}
            pg = page('tops', code); pg['opts'] = ['Bowl Color']
            pg['name'] = f"{stone} {mat} Vanity Top {size}{sp} ({code})"
            pg['cfx'] = [('Material', mat), ('Color', stone), ('Width', f'{w} in.'), ('Bowls', 'Single'), ('Faucet Spread', f"{spread.group(1)} in." if spread else ''),
                         ('Bowl Shape', 'Rectangular' if 'rectangular bowl' in dl else 'Oval'), ('Edge', 'Contour' if 'contour' in su.lower() else 'Straight')]
        elif m2:
            stone, mat = STONE.get('CGT' + m2.group(1), STONE[m2.group(1)]); dbl = bool(m2.group(3)); pg = page('tops', s)
            pg['name'] = f"{stone} {mat} Vanity Top {size}{', Double Bowl' if dbl else ''}{sp} ({s})"
            pg['cfx'] = [('Material', mat), ('Color', stone), ('Width', f'{w} in.'), ('Bowls', 'Double' if dbl else 'Single'), ('Faucet Spread', f"{spread.group(1)} in." if spread else ''), ('Bowl Color', 'White'), ('Bowl Shape', 'Oval')]
        elif su.startswith('MT'):
            pg = page('tops', s); pg['name'] = f"Fine Fixtures Cultured Marble Vanity Top {size} in White{sp} ({s})"
            pg['cfx'] = [('Brand', 'Fine Fixtures'), ('Material', 'Cultured Marble'), ('Color', 'White'), ('Width', f'{w} in.'), ('Bowls', 'Single'), ('Faucet Spread', f"{spread.group(1)} in." if spread else '')]
        else:
            pg = page('tops', s); pg['name'] = f"Aristokraft Cotton White Vanity Top {size} with Center Bowl{sp} ({s})"
            pg['cfx'] = [('Brand', 'Aristokraft'), ('Color', 'Cotton White'), ('Width', f'{w} in.'), ('Bowls', 'Single'), ('Faucet Spread', f"{spread.group(1)} in." if spread else '')]
        pg['mem'].append(it); continue
    # ---------------- bathroom sinks
    nl = (it['name'] + ' ' + d).lower()
    shape = 'Oval' if 'oval' in nl else 'Rectangular' if re.search(r'rectang', nl) else 'Round' if re.search(r'\bround\b(?! bottom)', nl) else ''
    mount = 'Drop-In' if (su.startswith('LVT') or 'drop in' in nl or 'drop-in' in nl) else 'Undermount' if (su.startswith(('LVU', 'UM', 'SIN-', 'DAX', 'H-', 'L-')) or 'undermount' in nl) else ''
    ada = 'ADA' in su
    m = re.match(r'^(LV[UT])(\d\d)(\d\d)(BK|SS|W|B)(.*)$', su)
    if m:
        col = {'W': 'White', 'B': 'Biscuit', 'BK': 'Black', 'SS': ''}[m.group(4)]; suf = m.group(5).strip(' -')
        mat = 'Stainless Steel' if m.group(4) == 'SS' else 'Ceramic'
        base = f'{m.group(1)}{m.group(2)}{m.group(3)}'; key = base + ('SS' if m.group(4) == 'SS' else '') + (f'-{suf}' if suf else '')
        disp = (f'{base}W-{suf}' if suf else key); brand = 'Oakland'; size = f'{int(m.group(2))} x {int(m.group(3))} in.'
        if col: it['opt'] = {'Color': col}
        it['shape_key'] = base
    elif su.startswith('SIN-POR'):
        m = re.match(r'^SIN-POR-(UNDOVL|UNDREC|VUR)(BISQ|WHT|WH)-(\d\d)(\d\d)(FL)?$', su)
        col = 'Biscuit' if m.group(2) == 'BISQ' else 'White'; mat = 'Porcelain'; brand = 'MSI'; size = f'{int(m.group(3))} x {int(m.group(4))} in.'
        key = f'SIN-POR-{m.group(1)}-{m.group(3)}{m.group(4)}{m.group(5) or ""}'; disp = key; it['opt'] = {'Color': col}
        shape = 'Oval' if m.group(1) == 'UNDOVL' else 'Rectangular'; it['flat'] = bool(m.group(5))
    elif su.startswith('UM'):
        m = re.match(r'^UM(\d\d)(\d\d)BI', su); col = 'Biscuit'; mat = 'Porcelain'; brand = 'Fine Fixtures'; size = f'{int(m.group(1))} x {int(m.group(2))} in.'
        key = disp = s.split(' ')[0]; it['fixed_color'] = col
    else:
        col = 'White'; mat = 'Porcelain' if 'porcelain' in nl else 'Ceramic' if 'ceramic' in nl else ''; brand = 'Dax' if su.startswith('DAX') else ''
        w, dp = num(it['p'].get('Width')), num(it['p'].get('Depth'))
        size = f'{frac(w)} in.' if shape == 'Round' else f'{frac(w)} x {frac(dp)} in.'; key = disp = s; it['fixed_color'] = col
    pg = page('sinks', key); pg['mem'].append(it)
    pg.update(brand=brand, size=size, shape=shape or pg.get('shape', ''), mount=mount, mat=mat, ada=ada, disp=disp, flat=it.get('flat', False))
    if it['opt']: pg['opts'] = ['Color']

# sink names (after grouping, so a single-colour page can say its colour); shape borrowed from a same-size sibling when the live name omits it
shape_by = {p['mem'][0].get('shape_key'): p['shape'] for p in pages.values() if p['kind'] == 'sinks' and p['shape'] and p['mem'][0].get('shape_key')}
for pg in pages.values():
    if pg['kind'] != 'sinks': continue
    if not pg['shape']: pg['shape'] = shape_by.get(pg['mem'][0].get('shape_key'), '')
    cols = list(dict.fromkeys(m['opt'].get('Color') or m.get('fixed_color', '') for m in pg['mem']))
    if len(pg['mem']) == 1:
        pg['opts'] = []; pg['disp'] = re.sub(r'\s*-\s*', '-', pg['mem'][0]['sku'].split(' -UNDER')[0]).strip()
    incol = f" in {cols[0]}" if len(pg['mem']) == 1 and cols[0] else ''
    core = ' '.join(x for x in (pg['brand'], pg['size'], pg['shape'], pg['mount'], pg['mat'], 'Bathroom Sink') if x)
    pg['name'] = f"{core}{incol}{', Flat Bottom' if pg['flat'] else ''}{', ADA' if pg['ada'] else ''} ({pg['disp']})"
    pg['cfx'] = [('Brand', pg['brand']), ('Mount', pg['mount']), ('Shape', pg['shape']), ('Material', pg['mat'])] + ([('ADA', 'Yes')] if pg['ada'] else []) + \
                ([('Color', cols[0])] if len(pg['mem']) == 1 and cols[0] else [])
for pg in pages.values():
    if len(pg['mem']) == 1 and pg['kind'] != 'sinks':
        o = pg['mem'][0]['opt']
        if pg['kind'] in ('faucets', 'tops') and o: pg['cfx'] = pg['cfx'] + [(k, v) for k, v in o.items()]
        pg['opts'] = []
names = collections.Counter(p['name'] for p in pages.values()); assert max(names.values()) == 1, [n for n, c in names.items() if c > 1]

out = {k: [] for k in FILES}; report = []
def blank(): return {c: '' for c in COLS}
def rank(v): return ORDER.index(v) if v in ORDER else 50
for pg in pages.values():
    kind, mem, opts, name = pg['kind'], pg['mem'], pg['opts'], pg['name']
    mem.sort(key=lambda m: tuple(rank(m['opt'].get(o, '')) for o in opts))
    if opts: assert len({tuple(m['opt'][o] for o in opts) for m in mem}) == len(mem), name
    d = mem[0]; dp = d['p']
    cfs = [(n, v) for n, v in d['cf'] if n in KEEP_CF] + [(n, v) for n, v in pg['cfx'] if v]
    for o in opts: cfs += [(o, v) for v in dict.fromkeys(m['opt'][o] for m in mem)]
    desc = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', dp.get('Description', ''))
    if kind in ('faucets', 'drains') and len(mem) > 1 and len(desc) < 200: desc = ''
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
        I = blank(); lab = ' – '.join(m['opt'][o] for o in opts)
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
                       members=[dict(sku=m['sku'], opt={o: m['opt'][o] for o in opts}, price=m['p']['Price'], old_name=m['name'], old_url=m['p'].get('Product URL', ''), nimg=len(m['urls'])) for m in mem]))
for k, fn in FILES.items():
    with open(fn, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(out[k])
json.dump(dict(pages=report, duplicates=[d['sku'] for d in dups]), open('_bath_report.json', 'w'), indent=1)
if __name__ == '__main__':
    print(len(B), 'bath SKUs;', len(dups), 'duplicates left out')
    for k in FILES:
        c = collections.Counter(r['Item'] for r in out[k]); print(k, dict(c), 'SKUs', sum(len(r['members']) for r in report if r['kind'] == k))
    for r in report:
        print(r['kind'][:6].ljust(7), r['name'], '|', r['images'], '|', ' ; '.join(m['sku'] + ('=' + '/'.join(m['opt'].values()) if m['opt'] else '') for m in r['members']))
