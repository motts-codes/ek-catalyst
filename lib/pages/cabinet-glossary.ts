/**
 * The kitchen cabinet glossary at /help/cabinet-glossary (Arun's brief, 25 Oct 2026). Every term
 * a shopper meets on a product page or in a quote, in plain English, grouped the way a kitchen
 * comes together. Terms are shown A–Z inside each group; every term has its own anchor so
 * product pages, tooltips and FAQs can link straight to it.
 *
 * Before launch: remove any term EK doesn't sell (inset doors, Lazy Susan cabinet, trash
 * pull-out, undermount glides and so on), so the glossary doesn't promise options that don't
 * exist.
 */

export const CABINET_GLOSSARY_HREF = '/help/cabinet-glossary';

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface GlossaryGroup {
  /** Anchor id for the group's jump link. */
  id: string;
  title: string;
  terms: GlossaryTerm[];
}

// Anchor id for a term: "Undermount glides" -> "undermount-glides".
export function termId(term: string): string {
  return term
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/\//g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const t = (term: string, definition: string): GlossaryTerm => ({ term, definition });

export const CABINET_GLOSSARY: GlossaryGroup[] = [
  {
    id: 'buying-and-delivery',
    title: 'Buying and delivery',
    terms: [
      t(
        '10×10 price',
        'The price of a standard sample kitchen (an L shape with two 10-foot walls), cabinets only. It’s for comparing collections. It isn’t the price of your kitchen.',
      ),
      t('Assembled', 'Built in our factory and shipped whole, ready to install.'),
      t(
        'Custom cabinets',
        'Built to order to any size or design. The most choice, the highest price and the longest wait.',
      ),
      t(
        'Delivery receipt',
        'The paper you sign when your order arrives. Write any damage on it before you sign.',
      ),
      t(
        'Door sample',
        'A full-size door in the finish you’re considering, so you can see the color in your own light.',
      ),
      t(
        'Installed',
        'Fixed to your wall and floor, leveled and joined together. A separate step from assembly.',
      ),
      t(
        'Restocking fee',
        'The share of the price kept when unopened items are returned (30% at Express Kitchens).',
      ),
      t(
        'RTA (ready to assemble)',
        'Shipped flat in boxes, with finished parts and hardware. You build each cabinet before it’s installed.',
      ),
      t(
        'Semi-custom cabinets',
        'Standard cabinets with some choice of sizes, finishes and add-ons.',
      ),
      t(
        'Ships in',
        'How long it takes us to get your order ready to leave our warehouse. Transit time comes after.',
      ),
      t(
        'SKU',
        'The code for one exact cabinet: its type, size and door style. A quote is a list of SKUs.',
      ),
      t(
        'Stock cabinets',
        'Cabinets made ahead in standard sizes and kept ready to ship. Faster and less expensive.',
      ),
    ],
  },
  {
    id: 'kitchen-layouts',
    title: 'Kitchen layouts',
    terms: [
      t(
        'Galley',
        'Two parallel runs of cabinets with a walkway between them. Also called a corridor kitchen.',
      ),
      t(
        'Island',
        'A freestanding block of base cabinets in the middle of the room, open on all sides.',
      ),
      t(
        'L-shape',
        'Cabinets along two walls that meet at a corner. The layout used for 10×10 pricing.',
      ),
      t(
        'Peninsula',
        'A run of cabinets that sticks out from a wall or another run, open on three sides.',
      ),
      t('Run', 'A continuous line of cabinets along one wall.'),
      t('Single wall', 'Every cabinet along one wall. Common in small kitchens and apartments.'),
      t('U-shape', 'Cabinets along three walls.'),
      t(
        'Work triangle',
        'The path between sink, stove and fridge. Keeping it short makes a kitchen easier to cook in.',
      ),
    ],
  },
  {
    id: 'types-of-cabinet',
    title: 'Types of cabinet',
    terms: [
      t(
        'Base cabinet',
        'Sits on the floor and holds up the countertop. Usually 24" deep and 34½" tall.',
      ),
      t(
        'Base end cabinet / end shelf',
        'A cabinet or open shelf that finishes the end of a run with a rounded or angled edge.',
      ),
      t(
        'Blind corner cabinet',
        'A corner cabinet where part of the box is hidden behind the next cabinet.',
      ),
      t('Bridge cabinet', 'A short, wide wall cabinet above the fridge or range hood.'),
      t('Corner sink base', 'A sink cabinet that fits in a corner.'),
      t(
        'Diagonal corner cabinet',
        'A corner cabinet with an angled front, so the door faces into the room.',
      ),
      t('Drawer base', 'A base cabinet with drawers instead of a door.'),
      t('Lazy Susan cabinet', 'A corner base cabinet with rotating shelves inside.'),
      t('Microwave cabinet', 'A wall or tall cabinet with an open shelf sized for a microwave.'),
      t('Oven cabinet', 'A tall cabinet with an opening for one or two built-in wall ovens.'),
      t(
        'Sink base',
        'A base cabinet with an open back and no drawer box, so there’s room for plumbing.',
      ),
      t('Tall cabinet', 'A floor-to-ceiling unit, used as a pantry or to hold ovens.'),
      t('Vanity', 'A bathroom base cabinet, usually lower and shallower than a kitchen base.'),
      t('Wall cabinet', 'Fixed to the wall above the countertop. Usually 12" deep.'),
    ],
  },
  {
    id: 'parts-of-a-cabinet',
    title: 'Parts of a cabinet',
    terms: [
      t('Back', 'The panel at the rear of the box.'),
      t('Bottom', 'The floor of the box.'),
      t('Cabinet box', 'The body of the cabinet, behind the door. Also called the carcass.'),
      t(
        'Center stile / mullion',
        'A vertical strip that divides the front of a wide cabinet, or a glass door, into sections.',
      ),
      t('Drawer box', 'The part of a drawer that holds your things.'),
      t('Drawer front', 'The visible panel on the front of the drawer box.'),
      t(
        'Face frame',
        'A solid wood frame fixed to the front of the box on framed cabinets. Doors hinge onto it.',
      ),
      t('Rail', 'A horizontal piece of a face frame or door frame.'),
      t('Shelf', 'A horizontal surface inside the box.'),
      t('Sides', 'The two panels that form the ends of the box.'),
      t('Stile', 'A vertical piece of a face frame or door frame.'),
      t(
        'Toe kick',
        'The recessed strip at the bottom of a base cabinet, so you can stand close to the counter without stubbing your toes.',
      ),
    ],
  },
  {
    id: 'fillers-panels-and-trim',
    title: 'Fillers, panels and trim',
    terms: [
      t('Build-up', 'Strips added behind molding to raise it or give it more depth.'),
      t('Corbel', 'A decorative bracket under a countertop overhang or a shelf.'),
      t('Crown molding', 'Decorative trim along the top of wall cabinets.'),
      t(
        'Dishwasher end panel',
        'A finished panel beside the dishwasher, so the opening looks neat and the countertop is supported.',
      ),
      t(
        'Filler',
        'A strip that closes the gap between a cabinet and a wall or appliance. Walls are rarely perfectly square, so most kitchens need a few.',
      ),
      t(
        'Finished end panel',
        'A panel that covers the exposed side of a cabinet at the end of a run. Also called a skin.',
      ),
      t('Light rail molding', 'Trim under wall cabinets that hides under-cabinet lights.'),
      t(
        'Scribe molding',
        'Thin, flexible trim that covers small gaps where cabinets meet uneven walls or floors.',
      ),
      t('Soffit', 'A boxed-in section between the top of the wall cabinets and the ceiling.'),
      t('Toe kick cover', 'A finished strip that covers the toe kick so it matches the cabinets.'),
      t('Valance', 'A decorative panel between two wall cabinets, often above the sink.'),
    ],
  },
  {
    id: 'materials',
    title: 'Materials',
    terms: [
      t('Birch', 'A hardwood with a fine, even grain. Used for face frames and veneered doors.'),
      t(
        'Engineered board',
        'A board made from wood fibers or particles pressed together with resin. Costs less than plywood.',
      ),
      t(
        'HDF (high-density fiberboard)',
        'A dense, smooth board that takes paint well. Used for painted doors.',
      ),
      t('Laminate', 'A hard-wearing printed surface layer, bonded onto a board.'),
      t(
        'MDF (medium-density fiberboard)',
        'A smooth board made from fine wood fibers. Stable, and good for painted finishes.',
      ),
      t(
        'Particleboard',
        'A board made of wood chips and glue. The least expensive, and the most easily damaged by water.',
      ),
      t(
        'Plywood',
        'Thin layers of wood glued together with the grain crossing. Strong, holds screws well and handles moisture better than particleboard.',
      ),
      t('Solid wood', 'Wood cut straight from the tree, with no layers.'),
      t('Thermofoil', 'A vinyl film heat-bonded onto a door, for a smooth, wipeable finish.'),
      t('Veneer', 'A thin layer of real wood over a board, so you get real grain at a lower cost.'),
    ],
  },
  {
    id: 'how-its-built',
    title: 'How it’s built',
    terms: [
      t('Butt joint', 'Two pieces simply joined end to end. The simplest and weakest joint.'),
      t('Cam lock', 'A round fitting that pulls two RTA panels tightly together when you turn it.'),
      t(
        'Dado',
        'A groove cut into one panel so another panel slots into it. Makes a box stronger.',
      ),
      t(
        'Dovetail',
        'Interlocking cuts that join the corners of a drawer box. The strongest common drawer joint.',
      ),
      t('Framed', 'Cabinets with a face frame. Traditional and shaker looks.'),
      t(
        'Frameless',
        'Cabinets with no face frame. Doors fix to the sides, cover the whole front and leave more room inside. A European, modern look.',
      ),
      t(
        'French dovetail',
        'A single sliding dovetail, often used to join a drawer front to the drawer box.',
      ),
      t(
        'Mortise and tenon',
        'A tongue (tenon) that fits into a matching slot (mortise). A strong joint for door frames.',
      ),
      t('Rabbet', 'A step cut along a panel’s edge, so another panel sits into it.'),
    ],
  },
  {
    id: 'hinges-drawers-and-hardware',
    title: 'Hinges, drawers and hardware',
    terms: [
      t('Adjustable shelves', 'Shelves that rest on pegs, so you can move them up or down.'),
      t(
        'Ball-bearing glides',
        'Drawer glides that run on steel ball bearings. Smooth, and they carry heavy loads.',
      ),
      t(
        'Bumper pad',
        'A small soft pad inside the door or drawer front that cushions it as it closes.',
      ),
      t(
        'Center-to-center',
        'The distance between the two screw holes on a pull. You need it to choose replacement pulls.',
      ),
      t(
        'Concealed hinge',
        'A hinge hidden inside the cabinet when the door is closed. Also called a European hinge.',
      ),
      t('Drawer glides', 'The runners a drawer slides on. Also called slides.'),
      t(
        'Epoxy roller glides',
        'Basic side-mount glides with coated rollers. The drawer opens about three-quarters of the way.',
      ),
      t(
        'Exposed hinge',
        'A hinge you can see on the outside of the closed door. A traditional look.',
      ),
      t(
        'Full-extension glides',
        'Glides that let a drawer come all the way out, so you can reach the back.',
      ),
      t('Knob', 'A single-point handle, often used on doors.'),
      t('Pull', 'A bar or handle fixed at two points, often used on drawers.'),
      t('Self-close', 'Hinges or glides that pull a door or drawer shut once it’s nearly closed.'),
      t(
        'Side-mount glides',
        'Glides fixed to the sides of the drawer box, visible when the drawer is open.',
      ),
      t(
        'Soft-close',
        'Hinges and glides that slow a door or drawer down so it closes quietly, without slamming.',
      ),
      t(
        'Undermount glides',
        'Glides hidden under the drawer box, so you can’t see them when the drawer is open. Smooth and quiet.',
      ),
    ],
  },
  {
    id: 'storage-add-ons',
    title: 'Storage add-ons',
    terms: [
      t(
        'Blind corner pull-out',
        'Shelves that swing or slide out of a blind corner cabinet, so you can reach the back.',
      ),
      t('Cutlery insert', 'A tray that divides a drawer for knives, forks and utensils.'),
      t('Lazy Susan', 'Rotating shelves in a corner cabinet.'),
      t(
        'Roll-out tray',
        'A shelf on glides inside a base cabinet, so you’re not reaching into the back.',
      ),
      t(
        'Sink tilt-out tray',
        'A narrow tray behind the false front of a sink base, for sponges and brushes.',
      ),
      t('Spice pull-out', 'A narrow pull-out for jars and bottles, often beside the range.'),
      t('Trash pull-out', 'A pull-out frame that holds one or two bins inside a base cabinet.'),
      t(
        'Wine rack',
        'Open cubbies, usually in a wall cabinet or at the end of a run, for storing bottles.',
      ),
    ],
  },
  {
    id: 'doors-and-styles',
    title: 'Doors and styles',
    terms: [
      t('Beadboard', 'A panel with narrow vertical grooves. A cottage or farmhouse look.'),
      t('Cathedral door', 'A door with an arched top on its center panel. A traditional look.'),
      t('Contemporary', 'Clean lines, little or no detail, often slab doors.'),
      t(
        'Full overlay',
        'Doors that cover almost the whole front of the cabinet, with small even gaps between them.',
      ),
      t(
        'Glass-front door',
        'A door with a glass panel, used on wall cabinets to show what’s inside.',
      ),
      t('Inset', 'Doors that sit inside the face frame, flush with it. A furniture-like look.'),
      t(
        'Partial overlay',
        'Doors that cover part of the face frame, leaving some of it showing around each door.',
      ),
      t('Raised panel', 'A center panel that’s raised, with a shaped edge.'),
      t(
        'Recessed panel',
        'A center panel that sits lower than the frame around it. The basis of a shaker door.',
      ),
      t(
        'Shaker',
        'A recessed flat panel inside a plain square frame. The most popular cabinet door in America.',
      ),
      t('Slab', 'One flat piece, with no frame or panel. Also called a flat-panel door.'),
      t('Traditional', 'Detailed doors, molding and trim, often raised panel.'),
      t(
        'Transitional',
        'A mix of traditional and modern, such as a shaker door with simple hardware.',
      ),
    ],
  },
  {
    id: 'finishes',
    title: 'Finishes',
    terms: [
      t(
        'Color variation',
        'Natural differences in color and grain between pieces of wood. Normal in stained finishes.',
      ),
      t(
        'Finish',
        'The protective and decorative coat on a cabinet, such as paint, stain or a clear coat.',
      ),
      t('Grain', 'The pattern of lines in wood. Shows through stain, hidden by paint.'),
      t('Painted finish', 'Solid color that covers the grain.'),
      t('Stain', 'Color that soaks into the wood, so the grain still shows.'),
    ],
  },
  {
    id: 'countertops-and-sinks',
    title: 'Countertops and sinks',
    terms: [
      t(
        'Backsplash',
        'The wall surface between the countertop and the wall cabinets, often tiled.',
      ),
      t('Butcher block', 'A countertop made from strips of wood glued together.'),
      t('Drop-in sink', 'A sink set into a hole in the countertop, with its rim resting on top.'),
      t('Farmhouse sink', 'A deep sink with an exposed front. Needs a matching sink base.'),
      t('Granite', 'A natural stone countertop. Every slab is different.'),
      t(
        'Overhang',
        'How far the countertop sticks out past the cabinets. Islands with seating need more.',
      ),
      t('Quartz', 'An engineered stone countertop. Consistent in color and low on maintenance.'),
      t('Solid surface', 'A man-made countertop with no visible seams.'),
      t('Undermount sink', 'A sink fixed under the countertop, so there’s no rim on top.'),
    ],
  },
  {
    id: 'standards-and-testing',
    title: 'Standards and testing',
    terms: [
      t(
        'ANSI/KCMA A161.1',
        'The industry test for kitchen cabinets. Doors and drawers are opened and closed thousands of times, and shelves and boxes are load-tested.',
      ),
      t('CARB2', 'A California standard that limits formaldehyde emissions from wood products.'),
      t(
        'KCMA',
        'The Kitchen Cabinet Manufacturers Association, which runs the main US cabinet testing program.',
      ),
    ],
  },
];
