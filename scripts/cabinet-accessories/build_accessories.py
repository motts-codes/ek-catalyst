# EK cabinet accessories rework: 519 live SKUs -> grouped, renamed pages in nine categories.
# Source: _acc_src.json (Product + Image rows of live category 27, Cabinets > Accessories).
# SKUs, prices, costs, UPCs are never changed. Hidden products are left out.
import csv, json, re, html, collections, os
HERE = os.path.dirname(os.path.abspath(__file__))
COLS = json.load(open('/home/claude/coll/_out_cols.json'))
SRC = json.load(open(os.path.join(HERE, '_acc_src.json')))
DEAD = set(l.strip() for l in open(os.path.join(HERE, '_dead.txt'))) if os.path.exists(os.path.join(HERE, '_dead.txt')) else set()
KEEP_CF = ('Stock Status', 'Price Range', '__badge', 'Shipping', 'Offer Product')

CATS = {  # key: (label, file, sandbox category id - fill in when known)
    'base':   ('Base Cabinet Organizers', 'acc-base-cabinet-organizers.csv', '891'),
    'waste':  ('Waste Containers', 'acc-waste-containers.csv', '891'),
    'corner': ('Lazy Susans & Corner Organizers', 'acc-lazy-susans-corner.csv', '891'),
    'drawer': ('Drawer Organizers', 'acc-drawer-organizers.csv', '891'),
    'sink':   ('Sink Base Organizers', 'acc-sink-base-organizers.csv', '891'),
    'wall':   ('Wall & Pantry Organizers', 'acc-wall-pantry-organizers.csv', '891'),
    'vanity': ('Vanity & Closet Organizers', 'acc-vanity-closet-organizers.csv', '891'),
    'light':  ('Cabinet Lighting', 'acc-cabinet-lighting.csv', '891'),
    'hard':   ('Hinges, Slides & Hardware', 'acc-hinges-slides-hardware.csv', '891'),
    'supply': ('Installation Supplies', 'acc-installation-supplies.csv', '891'),
    'lam':    ('Laminate End Caps & Splashes', 'laminate-end-caps-splashes.csv', '891'),   # proposed under Countertops > Laminate
}
BRAND = {'49': 'Rev-A-Shelf', '46': 'Star Cabinetry', '52': 'Hartson-Kennedy', '47': 'Richelieu', '57': 'Grass', '59': 'Architectural Depot', '53': 'Brothers Tech USA'}

def orig(u):
    m = re.match(r'^(https://cdn\d+\.bigcommerce\.com/s-[^/]+)/products/(\d+)/images/(\d+)/(.+?)\.(\d+)\.\d+\.\d+\.(\w+)(\?.*)?$', u)
    if not m: return u
    host, pid, iid, fn, ts, ext, q = m.groups()
    return f'{host}/images/stencil/original/products/{pid}/{iid}/{fn}.{ts}.{ext}{q or ""}'
def ckey(u): return re.sub(r'__\d+\.\d+\.\w+$', '', u.split('/')[-1].split('?')[0]).lower()
def slug(s): return '/' + re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', 'and')).strip('-') + '/'
def cf_json(cfs): return json.dumps([{'name': n, 'value': v.replace('"', '&quot;')} for n, v in cfs], ensure_ascii=False, separators=(',', ':'))
def clean(s): return re.sub(r'\s+', ' ', re.sub(r'[\x00-\x1f\x7f-\x9f]|Â', '', s)).strip()

items = []; cur = None
for r in SRC:
    if r['Item'] == 'Product': cur = dict(p=r, imgs=[]); items.append(cur)
    elif r['Item'] == 'Image': cur['imgs'].append(r)
VIS = [it for it in items if it['p'].get('Is Visible') == 'TRUE']
BY = {}
for it in VIS:
    p = it['p']; it['sku'] = p['SKU'].strip(); assert it['sku'] not in BY; BY[it['sku']] = it
    it['name'] = clean(p['Name'])
    it['cf'] = [(d['name'], html.unescape(d.get('value') or '')) for d in json.loads(p.get('Custom Fields') or '[]')]
    it['cfd'] = {}
    for n, v in it['cf']: it['cfd'].setdefault(n, v)
    it['urls'] = []; seen = set()
    for i in sorted(it['imgs'], key=lambda i: (i.get('Image is Thumbnail') != 'TRUE', int(i.get('Image Sort Order') or 0))):
        u = orig(i['Internal Image URL (Export)'])
        if ckey(u) not in seen and u not in DEAD: seen.add(ckey(u)); it['urls'].append(u)
    it['desc'] = clean(re.sub(r'<[^>]+>', ' ', html.unescape(p.get('Description', ''))))
    it['brand'] = BRAND.get(p.get('Brand ID'), '')

# ---------------------------------------------------------------- grouped pages (curated)
PAGES = []   # dict(cat, name, opts, mem=[(sku, {opt: value})], brand)
def inch(v): return f'{v} in.'
def G(cat, title, model, opts, members, brand='Rev-A-Shelf'):
    PAGES.append(dict(cat=cat, name=f'{brand} {title} ({model})' if model else f'{brand} {title}'.strip(), opts=list(opts),
                      mem=[(m[0], dict(zip(opts, m[1:]))) for m in members], brand=brand))
def W(prefix, sizes, suffix, fmt='{}'):   # helper: [(sku, 'N in.')]; sizes are (code, label) or plain ints
    return [(f'{prefix}{fmt.format(c)}{suffix}', inch(l)) for c, l in ((s if isinstance(s, tuple) else (s, s)) for s in sizes)]

# --- Base cabinet organizers
G('base', 'Wood Base Filler Pull-Out with Adjustable Shelves', '432-BF', ['Width'], [('432-BF-3C', '3 in.'), ('432-BF-6C', '6 in.')])
G('base', 'Wood Base Filler Pull-Out with Blum Soft-Close Slides', '432-BFSC', ['Width'], [('432BFSC3C', '3 in.'), ('432BFSC6C', '6 in.')])
G('base', 'Wood Pull-Out Base Organizer', '438-BC', ['Width'], [('438BC3C', '3 in.'), ('438BC6C', '6 in.')])
G('base', 'Wood Pull-Out Foil & Wrap Organizer with Ball-Bearing Soft-Close Slides', '447-BCBBSC', ['Width'], [('447-BCBBSC-5C', '5 in.'), ('447BCBBSC8C', '8 in.')])
G('base', 'Wood Pull-Out Foil & Wrap Organizer with Blum Soft-Close Slides', '447-BCSC', ['Width'], [('447BCSC5C', '5 in.'), ('447BCSC6C', '6-1/2 in.'), ('447BCSC8C', '8 in.'), ('447BCSC9C', '9-1/2 in.')])
G('base', 'Wood Pull-Out Base Organizer with Adjustable Shelves', '448-BC', ['Width'], [('448BC5C', '5 in.'), ('448BC6C', '6-1/2 in.'), ('448BC8C', '8 in.'), ('448-BC-11C', '11 in.'), ('448BC14C', '14 in.')])
G('base', 'Wood Pull-Out Base Organizer with Ball-Bearing Soft-Close Slides', '448-BCBBSC', ['Width'], [('448BCBBSC5C', '5 in.'), ('448BCBBSC8C', '8 in.')])
G('base', 'Wood Pull-Out Base Organizer with Blum Soft-Close Slides', '448-BCSC', ['Width'], [('448BCSC5C', '5 in.'), ('448BCSC6C', '6-1/2 in.'), ('448BCSC8C', '8 in.'), ('448BCSC9C', '9-1/2 in.'), ('448BCSC11C', '11 in.'), ('448BCSC14C', '14 in.')])
G('base', 'Wood Pull-Out Organizer for Door/Drawer Base Cabinets with Blum Soft-Close', '448-BDDSC', ['Width'], [('448BDDSC8C', '8 in.'), ('448BDDSC11C', '11 in.')])
G('base', 'Wood Pull-Out Knife Block Base Organizer with Blum Soft-Close', '448KB-BCSC', ['Width'], [('448KBBCSC5C', '5 in.'), ('448KBBCSC8C', '8 in.'), ('448KBBCSC11C', '11 in.')])
G('base', 'Wood Pull-Out Paper Towel Holder Base Organizer with Blum Soft-Close', '448PTH-BCSC', ['Width'], [('448PTHBCSC6C', '6-1/8 in.'), ('448PTHBCSC8C', '8 in.')])
G('base', 'Wood Pull-Out Swivel Shelf Base Organizer with Blum Soft-Close', '448SW-BCSC', ['Width'], [('448SWBCSC5C', '5 in.'), ('448SWBCSC8C', '8 in.')])
G('base', 'Wood Pull-Out Utensil Base Organizer with Blum Soft-Close', '448UT-BCSC', ['Width'], [('448UT-BCSC-5C', '5 in.'), ('448UTBCSC8C', '8 in.'), ('448UTBCSC9C', '9-1/2 in.'), ('448UTBCSC11C', '11 in.')])
G('base', 'Wood Side-Mount Pull-Out Base Organizer for Face Frame Cabinets with Soft-Close', '449-BCSC', ['Width'], [('449BCSC5C', '5 in.'), ('449BCSC8C', '8 in.')])
G('base', 'Wood Side-Mount Pull-Out Utensil Base Organizer with Soft-Close', '449UT-BCSC', ['Width'], [('449UTBCSC5C', '5 in.'), ('449UTBCSC8C', '8 in.'), ('449UTBCSC10C', '10 in.')])
G('base', 'Wood Two-Tier Cookware Organizer with Soft-Close', '4CW2', ['Cabinet Width'], [('4CW218SC1', '18 in.'), ('4CW224SC1', '24 in.')])
G('base', 'Wood Food Storage Container Organizer with Soft-Close', '4FSCO', ['Cabinet Width'], [('4FSCO18SC1', '18 in.'), ('4FSCO24SC1', '24 in.')])
G('base', 'Two-Tier Wire Pull-Out Base Organizer with Blum Soft-Close', '5322-BCSC', ['Width', 'Finish'],
  [('5322BCSC5GR', '5 in.', 'Gray'), ('5322BCSC5MP', '5 in.', 'Maple'), ('5322BCSC6FOG', '6-1/2 in.', 'Orion Gray'), ('5322BCSC8GR', '8 in.', 'Gray'), ('5322BCSC8MP', '8 in.', 'Maple'), ('5322BCSC11GR', '11 in.', 'Gray'), ('5322BCSC11MP', '11 in.', 'Maple')])
G('base', 'Two-Tier Knife & Utensil Pull-Out Base Organizer with Blum Soft-Close', '5322KB-BCSC', ['Width', 'Finish'],
  [('5322KBBCSC8GR', '8 in.', 'Gray'), ('5322KBBCSC8MP', '8 in.', 'Maple'), ('5322KBBCSC9MP', '9-1/2 in.', 'Maple'), ('5322KBBCSC11GR', '11 in.', 'Gray'), ('5322KBBCSC11MP', '11 in.', 'Maple')])
G('base', 'Two-Tier Utensil Pull-Out Base Organizer with Blum Soft-Close, 8 in.', '5322UT-BCSC-8', ['Finish'], [('5322UTBCSC8GR', 'Gray'), ('5322UTBCSC8MP', 'Maple')])
G('base', 'Solid-Bottom Pull-Out Basket with Soft-Close', '5330-BCSC', ['Width', 'Finish'], [(f'5330{n}BCSC{c}', inch(n), f) for n in (12, 15, 21, 33) for c, f in (('GR', 'Gray'), ('MP', 'Maple'))])
G('base', 'Chrome Wire Pull-Out Basket with Soft-Close', '5730', ['Width'], W('5730', (12, 15, 21, 33), 'CR'))
G('base', 'Chrome Wire U-Shaped Pull-Out Basket with Soft-Close', '5786', ['Width'], W('5786', (30, 33), 'CR'))
G('base', 'Chrome Two-Tier Cookware Organizer', '5CW2', ['Width', 'Slides'], [('5CW21222CR', '12 in.', 'Standard'), ('5CW21222SCCR', '12 in.', 'Soft-Close'), ('5CW22122CR', '21 in.', 'Standard'), ('5CW22122SCCR', '21 in.', 'Soft-Close')])
G('base', 'Chrome Wire Single-Tier Pull-Out Basket, 22 in. Deep', '5WB1', ['Width'], W('5WB1', (12, 15, 18, 21, 24), '22CR1'))
G('base', 'Chrome Wire Two-Tier Pull-Out Baskets, 22 in. Deep', '5WB2', ['Width'], [('5WB20922CR1', '9 in.'), ('5WB21222CR1', '12 in.'), ('5WB21522CR1', '15 in.'), ('5WB21822CR1', '18 in.'), ('5WB22122CR', '21 in.'), ('5WB22422CR1', '24 in.')])
G('base', 'Chrome Bakeware & Tray Divider', 'LD-597', ['Size'], [('LD59712CR1', '12 in.'), ('LD59718CR1', '18 in.')])
# --- Wall & pantry
G('wall', 'Stemware Holder in Oil-Rubbed Bronze', '3150', ['Length'], [('3150-16ORB', '16 in.'), ('3150-18ORB', '18 in.')])
G('wall', 'Wood Wall Cabinet Pull-Out Organizer with Soft-Close', '448-BBSCWC', ['Width'], [('448BBSCWC5C', '5 in.'), ('448BBSCWC6C', '6-1/2 in.'), ('448BBSCWC8C', '8 in.')])
G('wall', 'Wood Pull-Out Organizer for 36 in. Tall Wall Cabinets with Soft-Close', '448-BBSCWC36', ['Width'], [('448BBSCWC365C', '5 in.'), ('448BBSCWC368C', '8 in.')])
G('wall', 'Wood Door-Mount Adjustable Spice Rack', '4ASR', ['Cabinet Width'], [('4ASR18', '18 in.'), ('4ASR21', '21 in.')])
G('wall', 'Wood Vertical Foil & Wrap Holder', '4WFR', ['Cabinet Width'], [('4WFR151', '15 in.'), ('4WFR181', '18 in.'), ('4WFR211', '21 in.')])
G('wall', 'Door-Mount Mail & Key Organizer for 18 in. Wall Cabinets', '4MR-18', ['Finish'], [('4MR181', 'Natural Maple'), ('4MR18W1', 'White')])
G('wall', 'Chrome Pull-Down Shelf for Wall Cabinets', '5PD', ['Cabinet Width'], [('5PD24CRN', '24 in.'), ('5PD36CRN', '36 in.')])
G('wall', 'Wood Door-Mount Pantry Unit', '4WDP18', ['Height'], [('4WDP1851', '51 in.'), ('4WDP1857', '57 in.')])
# --- Drawer
G('drawer', 'Wood K-Cup Coffee Drawer Insert', '4CDI-KCUP', ['Cabinet Width'], [('4CDI18KCUP1', '18 in.'), ('4CDI24KCUP1', '24 in.')])
G('drawer', 'Gray Vinyl Drawer Peg Board, 21 in. Deep, No Pegs', '4DPBG', ['Width'], [('4DPBG24211', '24 in.'), ('4DPBG30211', '30 in.'), ('4DPBG39211', '39 in.')])
G('drawer', 'Wood Knife Organizer & Cutting Board Drawer with Soft-Close', '4KCB', ['Cabinet Width'], [('4KCB18SC1', '18 in.'), ('4KCB21HSC1', '21 in.'), ('4KCB24SC1', '24 in.')])
G('drawer', 'Wood Tiered Spice Drawer Insert', '4SDI', ['Width'], [('4SDI24', '22 in.'), ('4SDI361', '33-1/8 in.')])
G('drawer', 'Wood Tiered Double Cutlery Drawer with Soft-Close', '4WTCD', ['Cabinet Width'], [(f'4WTCD{n}HSC1', inch(n)) for n in (15, 18, 21, 24, 30, 36)])
G('drawer', 'Wood Divider for Drawer Organizers', '4WD-22', ['Height'], [('4WD22SH1', '2-3/8 in.'), ('4WD221', '2-7/8 in.')])
G('drawer', 'Wood Utility Tray Insert, 2-3/8 in. Deep', '4WUT-SH', ['Width'], [('4WUT1SH', '18-1/2 in.'), ('4WUT3SH', '24 in.')])
G('drawer', 'Wood Utility Tray Insert', '4WUT', ['Width'], [('4WUT3', '24 in.'), ('4WUT361', '36 in.')])
# --- Lazy susans & corner
G('corner', 'Wood Full-Circle Lazy Susan Shelf with Bearing', '4WLS001', ['Diameter'], W('4WLS001', (10, 18, 20, 28, 32), 'B52'))
G('corner', 'Wood Full-Circle Lazy Susan, 2-Shelf Set', '4WLS072', ['Diameter'], W('4WLS072', (18, 20, 22, 28, 32), '52'))
G('corner', 'Wood Full-Circle Lazy Susan, 3-Shelf Set with 36 in. Shaft', '4WLS073', ['Diameter'], W('4WLS073', (18, 20), '536'))
G('corner', 'Wood D-Shape Lazy Susan, 2-Shelf Set', '4WLS272', ['Diameter'], W('4WLS272', (22, 31), '52'))
G('corner', 'Wood Half-Moon Blind Corner Shelves, 2-Shelf Set', '4WLS882', ['Size'], W('4WLS882', (32, 35), '570'))
G('corner', 'Natural Wood Half-Moon Blind Corner Shelves, 2-Shelf Set', 'LD-4NW-882', ['Size'], [('LD4NW882321', '32 in.'), ('LD4NW882351', '35 in.'), ('LD-4NW-882-38-1', '38 in.')])
G('corner', 'Wood Two-Tier Girasolo Corner Organizer for 12 in. Opening', '4WLS871', ['Door Side'], [('4WLS8712L', 'Left'), ('4WLS8712R', 'Right')])
G('corner', 'Banded Wood D-Shape Lazy Susan, 20 in.', 'LD-4BW', ['Configuration'], [('LD4BW20120SBS1', 'Single Shelf with Bearing'), ('LD4BW262201', '2-Shelf Set'), ('LD4BW26320361', '3-Shelf Set with 36 in. Shaft')])
G('corner', 'Polymer Full-Circle Lazy Susan, 2-Shelf Set', '6012', ['Diameter', 'Color'], [('6012181152', '18 in.', 'White'), ('6012201152', '20 in.', 'White'), ('6012201552', '20 in.', 'Almond'), ('6012241152', '24 in.', 'White'), ('6012281152', '28 in.', 'White'), ('6012281552', '28 in.', 'Almond')])
G('corner', 'Polymer Full-Circle Lazy Susan, 3-Shelf Set with 36 in. Shaft', '6013', ['Diameter', 'Color'], [('60131811526', '18 in.', 'White'), ('60132011526', '20 in.', 'White'), ('60132015526', '20 in.', 'Almond')])
G('corner', 'Cloud Two-Shelf Blind Corner Organizer in Orion Gray', '5372-FOG', ['Cabinet Opening', 'Hand'], [('537215FOGL', '15 in.', 'Left-Hand'), ('537215FOGR', '15 in.', 'Right-Hand'), ('537218FOGL', '18 in.', 'Left-Hand')])
G('corner', 'Cloud Two-Shelf Blind Corner Organizer in Maple', '5372-MP', ['Cabinet Opening', 'Hand'], [('537215MPL', '15 in.', 'Left-Hand'), ('537215MPR', '15 in.', 'Right-Hand'), ('537218MPL', '18 in.', 'Left-Hand'), ('537221MPL', '21 in.', 'Left-Hand'), ('537221MPR', '21 in.', 'Right-Hand')])
G('corner', 'Cloud Single-Shelf Blind Corner Organizer in Maple for 15 in. Opening', '5371-15-MP', ['Hand'], [('537115MPL', 'Left-Hand'), ('537115MPR', 'Right-Hand')])
G('corner', 'Two-Tier Maple Blind Corner Organizer', '599-18', ['Hand'], [('59918LMP', 'Left-Hand'), ('59918RMP', 'Right-Hand')])
G('corner', 'Chrome Blind Corner Optimizer for 18 in. Opening', '5PSP-18', ['Slides'], [('5PSP18CR', 'Standard'), ('5PSP18SCCR', 'Soft-Close')])
# --- Sink base
G('sink', 'Sink Base Drip Tray', 'SBDT', ['Cabinet Size', 'Color'], [('SBDT2730A1', '27–30 in.', 'Almond'), ('SBDT2730S1', '27–30 in.', 'Silver'), ('SBDT3336A1', '33–36 in.', 'Almond'), ('SBDT3336S1', '33–36 in.', 'Silver')])
G('sink', 'Slim Line Stainless Steel Tip-Out Tray with Hinges', '6541', ['Length'], [('654111170', '11-1/4 in.'), ('654114170', '14-1/4 in.'), ('65412252', '22 in.')])
G('sink', 'White Polymer Tip-Out Trays with Hinges', '6572', ['Length'], [('65721130', '11 in.'), ('65721430', '14 in.')])
# --- Waste
G('waste', 'Waste Container Lid', 'RV-LID', ['Capacity', 'Color'], [('RV35LID1', '35 qt.', 'White'), ('RV35LID171', '35 qt.', 'Silver'), ('RV35LID181', '35 qt.', 'Black'), ('RV35LIDG1', '35 qt.', 'Green (Recycle Logo)'),
                                                                 ('RV50LID1', '50 qt.', 'White'), ('RV50LID171', '50 qt.', 'Silver'), ('RV50LIDG1', '50 qt.', 'Green (Recycle Logo)')])
LBF = (('OGMP', '113', 'Orion Gray with Maple'), ('OGWN', '113', 'Orion Gray with Walnut'), ('SSBL', '118', 'Stainless with Black'))
LB = [(f'5LB{c}{f}{n}{s[2]}' if 0 else f'5LB{c}{f}{n}{s}', lab, fl) for c, n, lab in (('1230', '1', 'Single 30 qt. – 12 in. Cabinet'), ('1535', '1', 'Single 35 qt. – 15 in. Cabinet'), ('1550', '1', 'Single 50 qt. – 15 in. Cabinet'),
      ('1835', '2', 'Double 35 qt. – 18 in. Cabinet'), ('1850', '2', 'Double 50 qt. – 18 in. Cabinet')) for f, s, fl in ((a, b[1:], c_) for a, b, c_ in LBF)]
G('waste', 'Legrabox Pull-Out Waste Container', '5LB', ['Configuration', 'Finish'], [m for m in LB if m[0] in BY])
G('waste', 'Wood Bottom-Mount Pull-Out Waste Container with Blum Soft-Close', '4WCSC', ['Configuration'], [('4WCSC1535DM1', 'Single 35 qt. – 15 in. Cabinet'), ('4WCSC1550DM1', 'Single 50 qt. – 15 in. Cabinet'), ('4WCSC1527DM2', 'Double 27 qt. – 15 in. Cabinet'),
    ('4WCSC1835DM2', 'Double 35 qt. – 18 in. Cabinet'), ('4WCSC2135DM2', 'Double 35 qt. – 21 in. Cabinet'), ('4WCSC2150DM2', 'Double 50 qt. – 21 in. Cabinet'), ('4WCSC2432DM2', 'Double 32 qt. – 24 in. Cabinet')])
G('waste', 'Wood Bottom-Mount Pull-Out Waste Container', '4WCBM', ['Configuration'], [('4WCBM15DM1', 'Single 35 qt.'), ('4WCBM18DM2', 'Double 35 qt.'), ('4WCBM2150DM2', 'Double 50 qt.')])
G('waste', 'Walnut Bottom-Mount Pull-Out Waste Container with Blum Soft-Close', '4WC-WN', ['Configuration'], [('4WCWN15DM1SC', 'Single 35 qt.'), ('4WCWN1550DM1SC', 'Single 50 qt.'), ('4WCWN18DM2SC', 'Double 35 qt.')])
G('waste', 'Wood Top-Mount Pull-Out Waste Container with Rev-A-Motion', '4WCTM-RM', ['Configuration'], [('4WCTMRM1835DM1', 'Single 35 qt.'), ('4WCTM-RM-1850DM-1', 'Single 50 qt.'), ('4WCTMRM2135DM2', 'Double 35 qt.'), ('4WCTM-RM-2150DM-2', 'Double 50 qt.')])
G('waste', 'Walnut Top-Mount Pull-Out Waste Container with Rev-A-Motion', '4WCTM-WNRM', ['Configuration'], [('4WCTMWNRM1850DM1', 'Single 50 qt.'), ('4WCTMWNRM2150DM2', 'Double 50 qt.')])
G('waste', 'Short Wood Top-Mount Single 35 qt. Waste Container with 16 in. Slides', '4WCTM-16', ['Cabinet Width'], [('4WCTM1516DM1', '15 in.'), ('4WCTM1816DM1', '18 in.')])
G('waste', 'Wood Door-Mount Pull-Out Waste Container', '4WC', ['Configuration'], [('4WC15DM1', 'Single – 15 in. Cabinet'), ('4WC18DM2', 'Double – 18 in. Cabinet')])
# --- Vanity & closet, lighting
G('vanity', 'Glossy White Base Cabinet Cosmetic Tray with Rolling Tray', 'COSK', ['Width'], [('COSK18', '18 in.'), ('COSK22', '22 in.')])
G('light', 'FineLine 2.0 12V LED Light Bar, Warm White', 'LSTKH', ['Length'], [('LSTKH08WNI', '8 in.'), ('LSTKH012WNI', '12 in.'), ('LSTKH022WNI', '22 in.'), ('LSTKH034WNI', '34 in.')], brand='Tresco')
# --- Hardware & supplies (other brands)
G('hard', 'Square Drive Type 17 Cabinet Screws with Nibs, Zinc, Box of 1,000', 'FKCN17Z', ['Length'], [('FKCN17Z8114PRM1', '1-1/4 in.'), ('FKCN17Z82PRM1', '2 in.'), ('FKCN17Z8212PRM1', '2-1/2 in.'), ('FKCN17Z83PRM1', '3 in.')], brand='Richelieu')
G('hard', 'Cantilever Support Brackets, White, 1 Pair', '9910', ['Size'], [('9910121830', '12 x 18 in.'), ('9910181830', '18 x 18 in.')], brand='Richelieu')
G('hard', 'Dynapro 2D Front Locking Device', 'F134.108', ['Side'], [('F134.108.950.233', 'Left'), ('F134.108.951.233', 'Right')], brand='Grass')

# --- Star Cabinetry bamboo drawer organizers: loose vs installed is one page
INST = ['Installation']
kits = sorted(s[6:] for s in BY if s.startswith('DOKIT-') and '(' not in s)
for k in kits:
    a, b = BY[f'DOKIT-{k}'], BY[f'DOKIT-{k} (Installed)']
    m = re.search(r'recommended for (\d+"(?:\s*-\s*\d+")?) wide', a['desc'] + ' ' + b['desc'], re.I)
    rng = m.group(1).replace('"', '').replace(' ', '').replace('-', '–') if m else ''
    G('drawer', f'{k} Bamboo Drawer Organizer Kit' + (f' for {rng} in. Drawers' if rng else ''), f'DOKIT-{k}', INST, [(f'DOKIT-{k}', 'Not Installed'), (f'DOKIT-{k} (Installed)', 'Installed')], brand='Star Cabinetry')
for code, title in (('CTO10', 'Bamboo Component Tray Organizer, 10 in. W'), ('CTO30', 'Bamboo Cutlery Tray Organizer, 25-1/8 in. W'), ('OSI13', 'Bamboo Open Side Insert for Deep Drawers, 13 in. W'),
                    ('PBO30', 'Bamboo Peg Board Organizer, 25 in. W'), ('UTO15', 'Bamboo Utensil Organizer, 10 in. W')):
    G('drawer', title, code, INST, [(code, 'Not Installed'), (f'{code} (Installed)', 'Installed')], brand='Star Cabinetry')
G('drawer', 'Bamboo Tiered Cutlery Drawer Organizer for 18 in. Drawers', 'TCD18', ['Configuration'], [('TCD18 (BOX)', 'Organizer Box Only'), ('TCD18', 'With Soft-Close Glides'), ('TCD18 (Installed)', 'With Soft-Close Glides, Installed')], brand='Star Cabinetry')

# --- Hartson-Kennedy laminate end caps and endsplashes: colour x side on one page
COLOR_FIX = {'Sand Crystall': 'Sand Crystal', 'Travetine': 'Travertine'}
for code, title in (('UC', 'Laminate Universal End Cap with Glue'), ('ETASP', 'Laminate E2000 Contoured Full-Wrap Endsplash, 25 in. Kitchen'), ('AEK', 'Laminate Ultra-Top Waterfall Adjustable Endsplash, 25 in. Kitchen')):
    mem = []
    for s in BY:
        m = re.match(rf'^\(({code})([LR])G?\)\s*(.+?)\s*#([\d-]+)$', s)
        if m: c = COLOR_FIX.get(m.group(3), m.group(3)); mem.append((s, f'{c} {m.group(4)}', 'Left' if m.group(2) == 'L' else 'Right'))
    G('lam', title, code, ['Color', 'Side'], sorted(mem, key=lambda m: (m[1], m[2])), brand='Hartson-Kennedy')

# ---------------------------------------------------------------- single pages
SINGLE = {  # sku: (cat, full name)  - hand-written where the live name is unusable
    # other brands
    '12044': ('supply', 'Alex Plus Caulk, White, 10.1 oz. (12044)'), '12607': ('supply', 'Alex Plus Caulk, Clear, 10.1 oz. (12607)'),
    '1590272': ('supply', 'Loctite Power Grab Heavy Duty Construction Adhesive, 9 oz. (1590272)'), '1590801': ('supply', 'Gorilla All Purpose Construction Adhesive, 9 oz. (1590801)'),
    '5395751': ('supply', 'Backer Rod, 3/8 in. x 20 ft., Gray (5395751)'), 'Clear Glass': ('supply', 'Clear Glass Panel for Glass-Door Cabinets'),
    'Light Bar 12" 3224128': ('light', 'Xenon Under-Cabinet Light Bar, 12 in. (3224128)'), 'hockey puck 3224025': ('light', 'Puck Light for Glass-Door Cabinets (3224025)'),
    '2x3-8’': ('supply', '2 x 3 x 8 ft. SPF Stud'), '2x6-8': ('supply', '2 x 6 x 8 ft. Douglas Fir Stud'),
    '1/4"-4`x8` Plywood (Nat Birch)': ('supply', 'Birch Plywood, 1/4 in., 4 x 8 ft., Natural Finish One Side'),
    'F0714043': ('supply', 'DuPont StoneTech BulletProof Stone Sealer, 1 Pint (F0714043)'),
    '24 EZ-DW Bracket': ('hard', 'E-Z Dishwasher Bracket with Mounting Screws, 24 in. (EZ-DW)'),
    '7950.VE300': ('hard', 'Grass Rear Mounting Bracket for 12–21 in. Glides (7950.VE300)'),
    'F130.135.019.204U': ('hard', 'Grass Dynapro 16 2D Full-Extension Soft-Close Undermount Drawer Glide Set, 21 in. (F130.135.019.204U)'),
    'FO-RESTRICTORHINGE': ('hard', 'Full Overlay Face Frame Soft-Close Hinge with Limiter, 1-1/4 in. (FO-RESTRICTORHINGE)'),
    'BKTM03X12LOSS': ('hard', 'Logan Hidden Support Steel Bracket, 3 in. W x 12 in. D, Stainless Steel (BKTM03X12LOSS)'),
    'FKCN17BP8158PRM': ('hard', 'Richelieu Square Drive Type 17 Cabinet Screws with Nibs, 1-5/8 in., Black, Box of 1,000 (FKCN17BP8158PRM)'),
    'PWK17Z83PR': ('hard', 'Richelieu #8 x 3 in. Square Drive Washer Head Screws, Zinc, Box of 1,500 (PWK17Z83PR)'),
    'CWPR30142': ('vanity', 'Rev-A-Shelf Wood Pull-Out Pants Rack, 30 in., Holds 18 Pairs (CWPR-3014-2)'),
    # Star Cabinetry
    'CNO12': ('drawer', 'Star Cabinetry Bamboo Canister Organizer for Deep Drawers, 12 in. W (CNO12)'), 'DBO12': ('drawer', 'Star Cabinetry Bamboo Divided Box Organizer for Deep Drawers, 12 in. W (DBO12)'),
    'DVI6': ('drawer', 'Star Cabinetry Bamboo Divided Insert, 5-7/16 in. W (DVI6)'), 'KCI6': ('drawer', 'Star Cabinetry Bamboo K-Cup Insert, 6 in. W (KCI6)'),
    'LKI6': ('drawer', 'Star Cabinetry Bamboo Large Knife Block Insert, 5-7/16 in. W (LKI6)'), 'SKI6': ('drawer', 'Star Cabinetry Bamboo Small Knife Block Insert, 5-7/16 in. W (SKI6)'),
    'SHI6': ('drawer', 'Star Cabinetry Bamboo Spice Holder Insert, 5-7/16 in. W (SHI6)'), 'PLO13': ('drawer', 'Star Cabinetry Bamboo Pan & Lid Organizer for Deep Drawers, 13 in. W (PLO13)'),
    'EH89': ('hard', 'Star Cabinetry Face Frame Hinge Angle Restrictor (EH89)'),
    'NRG (24" DEPTH)': ('hard', 'Star Cabinetry Undermount Drawer Glides with Nylon Rollers for 24 in. Deep Cabinets (NRG)'),
    'SCG (24" DEPTH)': ('hard', 'Star Cabinetry Full-Extension Soft-Close Undermount Drawer Glides for 24 in. Deep Cabinets (SCG)'),
}
RAS = {}   # Rev-A-Shelf singles: sku -> (cat, description without brand/model); filled from _ras_singles.py
exec(open(os.path.join(HERE, '_ras_singles.py')).read())

used = collections.Counter(s for pg in PAGES for s, _ in pg['mem'])
for pg in PAGES:
    for s, _ in pg['mem']: assert s in BY, (pg['name'], s)
assert max(used.values()) == 1, [s for s, c in used.items() if c > 1]
def model_of(it):   # dashed model from the live name when it matches the SKU
    t = it['name'].split(' ')[0]
    return t if re.sub(r'[^A-Z0-9]', '', t.upper()) == re.sub(r'[^A-Z0-9]', '', it['sku'].upper()) and len(t) >= len(it['sku']) else it['sku']
missing = []
for it in VIS:
    s = it['sku']
    if s in used: continue
    if clean(s) in SINGLE: cat, name = SINGLE[clean(s)]; brand = it['brand'] if name.startswith(it['brand'] or '~') else ('Rev-A-Shelf' if name.startswith('Rev-A-Shelf') else '')
    elif s in RAS:
        cat, d = RAS[s]; brand = 'Tresco' if cat == 'light' else 'Rev-A-Shelf'; name = f'{brand} {d} ({model_of(it)})'
    else: missing.append(s); continue
    PAGES.append(dict(cat=cat, name=name, opts=[], mem=[(s, {})], brand=brand))
assert not missing, missing
assert sum(len(pg['mem']) for pg in PAGES) == len(VIS)
cnt = collections.Counter(pg['name'] for pg in PAGES); assert max(cnt.values()) == 1, [n for n, c in cnt.items() if c > 1]
cnt = collections.Counter(slug(pg['name']) for pg in PAGES); assert max(cnt.values()) == 1

FIN_FIX = {'Light Brown': 'Natural Maple', 'Dark Brown': 'Walnut', 'Wood': 'Natural Maple', 'Natural': 'Natural Maple', 'Chrome/Maple': 'Chrome / Maple', 'Gray/Chrome': 'Gray / Chrome'}
TYPE = {'base': 'Base Cabinet Organizer', 'waste': 'Waste Container', 'corner': 'Lazy Susan / Corner Organizer', 'drawer': 'Drawer Organizer', 'sink': 'Sink Base Organizer', 'wall': 'Wall / Pantry Organizer',
        'vanity': 'Vanity / Closet Organizer', 'light': 'Cabinet Lighting', 'hard': 'Hardware', 'supply': 'Installation Supply', 'lam': 'Laminate End Cap / Splash'}
out = {k: [] for k in CATS}; report = []
def blank(): return {c: '' for c in COLS}
for pg in PAGES:
    mem = [(BY[s], o) for s, o in pg['mem']]; name, cat, opts = pg['name'], pg['cat'], pg['opts']
    assert len({tuple(o.values()) for _, o in mem}) == len(mem), name
    d = mem[0][0]; dp = d['p']
    cfs = [(n, v) for n, v in d['cf'] if n in KEEP_CF]
    if pg['brand']: cfs.append(('Brand', pg['brand']))
    cfs.append(('Accessory Type', TYPE[cat]))
    for n in dict.fromkeys(m['cfd'].get('Material', '') for m, _ in mem):
        if n: cfs.append(('Material', n.replace('/', ' / ')))
    fins = [o['Finish'] for _, o in mem] if 'Finish' in opts else [o['Color'].rsplit(' ', 1)[0] if cat == 'lam' else o['Color'] for _, o in mem] if 'Color' in opts else [FIN_FIX.get(m['cfd'].get('Product Finish', ''), m['cfd'].get('Product Finish', '')) for m, _ in mem]
    cfs += [('Finish', f) for f in dict.fromkeys(fins) if f]
    for o in opts:
        if o not in ('Finish', 'Color', 'Installation', 'Configuration', 'Side', 'Hand', 'Door Side', 'Slides'): cfs += [(o, v) for v in dict.fromkeys(oo[o] for _, oo in mem)]
    descs = {m['desc'] for m, _ in mem}
    desc = clean(dp.get('Description', '')) if (len(descs) == 1 and len(d['desc']) >= 150) or (cat == 'drawer' and pg['brand'] == 'Star Cabinetry' and len(d['desc']) >= 150 and 'Installation' in opts) else ''
    P = blank()
    P.update({'Item': 'Product', 'Name': name, 'Type': 'physical', 'Inventory Tracking': 'none', 'Price': dp['Price'], 'Categories': CATS[cat][2],
              'Description': desc, 'Custom Fields': cf_json(cfs), 'Page Title': f'{name} | Express Kitchens', 'Product URL': slug(name),
              'Free Shipping': 'FALSE', 'Weight': dp.get('Weight', ''), 'Is Visible': 'TRUE', 'Is Featured': 'FALSE', 'Tax Class': '0',
              'Product Condition': 'New', 'Show Product Condition': 'FALSE'})
    if not opts:
        for k in ('SKU', 'Cost Price', 'UPC/EAN', 'Global Trade Number', 'Manufacturer Part Number', 'Width', 'Height', 'Depth'): P[k] = dp.get(k, '').strip()
    rows = [P]
    gallery = list(d['urls']); have = {ckey(u) for u in gallery}
    for m, _ in mem[1:]:
        if m['urls'] and ckey(m['urls'][0]) not in have and len(gallery) < 12: gallery.append(m['urls'][0]); have.add(ckey(m['urls'][0]))
    if not gallery:   # default variant has no photo: borrow the first sibling photo
        for m, _ in mem:
            if m['urls']: gallery = [m['urls'][0]]; break
    for i, u in enumerate(gallery):
        I = blank(); I.update({'Item': 'Image', 'Image URL (Import)': u, 'Image Description': name, 'Image is Thumbnail': 'TRUE' if i == 0 else 'FALSE', 'Image Sort Order': str(i)}); rows.append(I)
    if opts:
        for m, o in mem:
            lp = m['p']; V = blank()
            V.update({'Item': 'Variant', 'SKU': m['sku'], 'Options': ''.join(f"Type=Rectangle|Name={k}|Value={v}" for k, v in o.items()),
                      'Price': lp['Price'], 'Cost Price': lp.get('Cost Price', ''), 'UPC/EAN': lp.get('UPC/EAN', ''), 'Global Trade Number': lp.get('Global Trade Number', ''),
                      'Manufacturer Part Number': lp.get('Manufacturer Part Number', ''), 'Free Shipping': 'FALSE', 'Weight': lp.get('Weight', ''),
                      'Width': lp.get('Width', ''), 'Height': lp.get('Height', ''), 'Depth': lp.get('Depth', ''), 'Variant Image URL': (m['urls'] or gallery or [''])[0]})
            rows.append(V)
    out[cat] += rows
    grid = 1
    for o in opts: grid *= len({oo[o] for _, oo in mem})
    report.append(dict(cat=cat, name=name, url=slug(name), brand=pg['brand'], options=opts, n=len(mem), grid=grid if opts else 1, images=len(gallery), has_desc=bool(desc),
                       members=[dict(sku=m['sku'], opt=o, price=m['p']['Price'], cost=m['p'].get('Cost Price', ''), old_name=m['name'], old_url=m['p'].get('Product URL', ''), nimg=len(m['urls'])) for m, o in mem]))
for k, (label, fn, cid) in CATS.items():
    with open(os.path.join(HERE, fn), 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(out[k])
json.dump(report, open(os.path.join(HERE, '_acc_report.json'), 'w'))
if __name__ == '__main__':
    print('SKUs', len(VIS), 'pages', len(PAGES))
    for k, (label, fn, cid) in CATS.items():
        rs = [r for r in report if r['cat'] == k]
        print(f"  {label:34} pages {len(rs):4}  SKUs {sum(r['n'] for r in rs):4}  grouped pages {sum(1 for r in rs if r['options']):3}  no photo {sum(1 for r in rs if not r['images'])}")
    print('incomplete grids', [(r['name'], r['n'], r['grid']) for r in report if r['grid'] > r['n']])
    print('max name', max(len(r['name']) for r in report), '| with description', sum(1 for r in report if r['has_desc']))
