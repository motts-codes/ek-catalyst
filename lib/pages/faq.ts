import { type CabinetFaqItem } from '@/vibes/soul/sections/cabinet-faq';
import type { PageAction } from '@/vibes/soul/sections/page-kit';

import { EXPLAINER_V2_HREF } from '../cabinets/explainer-v2-content';
import { ESTIMATOR_HREF, FREE_DESIGN_HREF, SAMPLES_HREF } from '../home/home-content';

import { CABINET_GLOSSARY_HREF } from './cabinet-glossary';

/**
 * The site-wide FAQ at /faq (Arun's final copy, 25 Oct 2026), built on the client's policy page,
 * the RTA / assembled content and the answers already on the site, revised 28 Oct 2026. The nine
 * groups follow the customer's journey: plan, choose, order, delivery, after the sale. Installation
 * is deliberately not mentioned anywhere on the site. Answers take
 * inline `[label](href)` links. Anything still pending with EK is marked; the list is
 * at the end of this file.
 */

export type FaqIcon =
  | 'pencil-ruler'
  | 'package-open'
  | 'layers'
  | 'credit-card'
  | 'truck'
  | 'hammer'
  | 'rotate-ccw'
  | 'shield-alert'
  | 'shield-check'
  | 'store';

export interface FaqGroup {
  id: string;
  title: string;
  icon: FaqIcon;
  items: CabinetFaqItem[];
}

export const FAQ_HERO = {
  kicker: 'Help',
  title: 'Questions, answered',
  description:
    "Most of what people ask us before and after they order is answered here, from how delivery works to what to do if a box arrives damaged. Pick a topic, and if your question isn't covered, call or text us at 860-247-1000, any time, and a real person will answer.",
  actions: [
    { label: 'Call or text 860-247-1000', href: 'tel:+18602471000', primary: true },
    { label: 'Send us a message', href: '/contact', style: 'outline' },
  ] satisfies PageAction[],
  // Decorative: two speech bubbles, one with a question mark, on white.
  image: { src: '/images/faq/questions.png', alt: '' },
};

export const FAQ_META_DESCRIPTION =
  'Answers on design help, RTA vs assembled, materials, ordering, financing, shipping, returns, damage claims and the 1-year warranty.';

const q = (question: string, answer: string): CabinetFaqItem => ({ q: question, a: answer });

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'planning-and-design',
    title: 'Planning & design',
    icon: 'pencil-ruler',
    items: [
      q(
        'Do you offer design help?',
        `Yes, and it's free. A designer goes through your kitchen with you, in a showroom or on a video call, and gives you an itemized quote. There's no deposit and no obligation to buy. [Book a free design consult](${FREE_DESIGN_HREF})`,
      ),
      q(
        'Do I need a showroom appointment?',
        'No, walk-ins are welcome. Booking a visit means a designer is ready for you, for the full 60–90 minutes. [Book a visit](/book)',
      ),
      q(
        "I'm not in Connecticut. Can I still get design help?",
        'Yes. Video consults are available in every state, Tuesday – Saturday, 9 AM – 5 PM ET. Send us your measurements and photos, and a designer will go through it with you and quote it.',
      ),
      q(
        'How do I measure my kitchen?',
        "You need three numbers per wall, and the position of anything that can't move, such as windows, doors and plumbing. The measuring guide has six steps and a printable template. The more accurate your numbers, the more accurate your quote. [Measuring guide](/resources/measuring-guide)",
      ),
      q(
        'Do you measure my kitchen for me?',
        'In Connecticut and greater-CT zip codes, yes. After your showroom visit, we can send someone to measure your kitchen for $85, so your quote is exact. The fee is separate from your order. Everywhere else, the measuring guide walks you through it in about 20 minutes. [How to measure](/resources/measuring-guide)',
      ),
      q(
        'I already know what I want. Can you check my list?',
        'Yes. Send it to us and a designer will check it for the fillers, end panels and trim that are easy to miss. [Send us your list](/contact)',
      ),
      q(
        "What's a 10×10 kitchen?",
        `The industry's standard sample kitchen for comparing prices: two 10-foot walls in an L shape, cabinets only. Every "from" price on this site is that kitchen in that collection. Your own kitchen will be a different size, so its price will be different. [What's in a 10×10](/resources/ten-by-ten-kitchen)`,
      ),
      q(
        'Can I get door samples?',
        `Yes, in any collection and finish, from the Samples page or any product page. [Order samples](${SAMPLES_HREF})`,
      ),
      q(
        'Are samples free?',
        'Your first two quarter-door samples are free with the code FREESAMPLES at checkout. After that, samples are priced per door. Samples ship free.',
      ),
    ],
  },
  {
    id: 'rta-vs-assembled',
    title: 'RTA vs assembled',
    icon: 'package-open',
    items: [
      q(
        "What's the difference?",
        `It's the same cabinet either way. RTA (ready to assemble) arrives flat in boxes for you to build. Assembled arrives built in our factory, ready to install. RTA saves money. Assembled saves time. [Read about RTA](${EXPLAINER_V2_HREF.rta}) · [Read about assembled](${EXPLAINER_V2_HREF.assembled})`,
      ),
      q('Which lines come RTA?', 'Star and Euro Max. Prism and Euro Value come assembled only.'),
      // EK's figure is a median of 53% across the Star lines sold both ways. The Avon 10×10 prices
      // in the workbook and the collection data show only a 5–10% gap, so spot-check a few
      // collections before this goes live.
      q(
        'How much do I save with RTA?',
        'About half. Across the Star cabinets we sell both ways, RTA is typically around 50% less than assembled. Each collection page shows both prices.',
      ),
      q(
        'How long does an RTA cabinet take to build?',
        '30 minutes or less per cabinet. A 10×10 kitchen (13 cabinets) takes about 6 hours.',
      ),
      q(
        'What tools do I need?',
        "A cordless drill or screwdriver, a rubber mallet and a tape measure. Every part is cut, drilled and finished, so there's nothing to cut.",
      ),
      q(
        'Glue or cam locks?',
        "Cam locks and dowels. Full instructions come with every cabinet, and there's a video for every cabinet type. [Watch the assembly videos](/resources/how-to-videos)",
      ),
      q(
        'Is RTA the same quality as assembled?',
        'Yes. The parts are identical and come from the same factory. Assembled cabinets are simply built in our factory instead of in your kitchen.',
      ),
      q(
        'Do I need a pro to build RTA cabinets?',
        "No. Most customers build them themselves. But if you'd pay someone to build them, most of the saving goes, so assembled is usually the better deal.",
      ),
      q(
        'Can I mix RTA and assembled in one kitchen?',
        'Yes, on lines offered both ways. The box, door and finish match.',
      ),
      q(
        'Does assembled mean installed?',
        'No. Assembled means the cabinet is built. Installing (fixing it to your wall and floor, leveling and joining) is a separate step.',
      ),
    ],
  },
  {
    id: 'cabinets-and-construction',
    title: 'Cabinets & construction',
    icon: 'layers',
    items: [
      q(
        'What are the cabinets made of?',
        'Star, Prism and Euro Max have ¾" plywood boxes, not particleboard or MDF. Euro Value has an engineered furniture board box, at a lower price. Star has solid birch face frames, with painted HDF or birch veneer doors depending on the style.',
      ),
      q(
        "What's the difference between framed and frameless?",
        "Framed cabinets (Star and Prism) have a solid wood frame around the front, for traditional and shaker looks. Frameless cabinets (Euro Max and Euro Value) have no frame, so the doors cover the whole front and there's a little more room inside, for a modern look.",
      ),
      q(
        'Dovetail drawers? Soft-close?',
        'Yes. Solid-wood dovetail drawer boxes and soft-close hinges come on every cabinet. Soft-close, full-extension drawer glides are standard.',
      ),
      q(
        'Are they strong enough for granite or quartz?',
        'Yes. Our cabinets are tested to ANSI/KCMA A161.1 standards: doors and drawers are opened and closed 25,000 times, wall cabinets carry a 600 lb load, and shelves hold weight for 7 days without sagging.',
      ),
      q('Are the cabinets CARB compliant?', 'Yes, CARB2 compliant for formaldehyde emissions.'),
      q(
        'Do cabinets come with knobs and pulls?',
        'No. Handles are sold separately, so you can run one style through the whole kitchen. We keep thousands in stock. [Shop handles](/cabinet-hardware/handles-knobs)',
      ),
      q(
        'Do I need end panels?',
        'Only where the side of a cabinet will show: at the end of a run, beside a window, or on an island. Your designer marks them on the plan.',
      ),
      q(
        'What are fillers, and do I need them?',
        'Fillers are strips that close the gap between a cabinet and a wall or appliance. Walls are rarely perfectly square, so most kitchens need a few. Your designer adds them to your list.',
      ),
      q(
        'What are the standard cabinet sizes?',
        'Base cabinets are 24" deep and 34½" high. Wall cabinets are 12" deep and 30", 36" or 42" high. Tall cabinets are 84", 90" or 96" high. Widths run from 9" to 48" in 3" steps. Vanities are 21" deep.',
      ),
      q(
        'How much space should be between the countertop and the wall cabinets?',
        '18 inches is standard.',
      ),
      q(
        'Do you have glass-door cabinets?',
        'Yes. Frosted glass wall cabinets come in widths from 15" to 36" and heights of 30", 36" or 42". Glass doors with a finished interior are available in Rochelle, Derry and Barcelona.',
      ),
      q(
        'Can I buy just doors or replacement parts?',
        'Yes: doors, drawer fronts, hinges and glides for any current collection. Call us or ask your designer.',
      ),
      q(
        'Do you sell countertops?',
        'Yes: granite, quartz and laminate. Countertops are quoted rather than added to a cart. [See countertops](/countertops)',
      ),
      q(
        'Where can I learn the terms?',
        `Our cabinet glossary explains every term you'll come across, from toe kicks to undermount glides. [See the glossary](${CABINET_GLOSSARY_HREF})`,
      ),
    ],
  },
  {
    id: 'ordering-and-payment',
    title: 'Ordering & payment',
    icon: 'credit-card',
    items: [
      q(
        'How can I pay?',
        'We take MasterCard, Visa, Discover and American Express. Most customers pay in full, and your card is charged when you place the order. In our showrooms, you can also finance through GreenSky, with a deposit of about 20%.',
      ),
      q(
        'Can I finance my kitchen?',
        "Yes, in any of our showrooms, through GreenSky. Your designer can help you apply. Fixed-rate plans start at 9.99% APR, and some plans waive the interest if you pay in full within the promo period. Financing isn't available on online orders or at our Factory Outlet. [See financing plans](/financing)",
      ),
      q(
        'Do you price match?',
        "Yes, in our showrooms. Bring a current written quote for the same Star Cabinetry cabinets or countertops to any showroom, and we'll match it. Price match doesn't apply to online orders, other cabinet lines or the Factory Outlet. [How price match works](/price-match-guarantee)",
      ),
      q('Do you charge sales tax?', 'Yes, on orders shipped to Connecticut and Massachusetts.'),
      q(
        'Can I change or cancel my order?',
        "Call us at (860) 247-1000 within 72 hours of placing it, and we'll change or cancel it with no fee. After that, your order may already be in production, so changes may not be possible, or may cost extra.",
      ),
      q(
        'What if something on my order is out of stock?',
        "We'll tell you when it will be available, and you choose: ship what's in stock now and the rest later (extra shipping may apply), wait and get everything together, or swap for an in-stock alternative.",
      ),
      q(
        'Do you have current offers?',
        'Yes. See the Promotions page for current sales, the $179.99 double hung window and free door samples. Sign up for the newsletter to hear about new offers first. [Current promotions](/promotions)',
      ),
      q(
        'How long is a quote good for?',
        "As long as the prices don't change. If a price changes before you order, we'll update your quote.",
      ),
    ],
  },
  {
    id: 'shipping-and-delivery',
    title: 'Shipping & delivery',
    icon: 'truck',
    items: [
      q(
        'When will my order ship?',
        'Each collection page shows its own ship time. Star RTA: 2 weeks. Star assembled: 3 weeks. Euro Max RTA and Euro assembled: 4 weeks. Tribeca Shaker: 2 weeks. Prism painted colors: 8 weeks. Windows and appliances are ready for pickup in 2 days.',
      ),
      q('How long is transit once it ships?', 'Usually 7–10 days more.'),
      q(
        'Which states do you ship to?',
        "Cabinets ship to the 48 contiguous states. We can't ship cabinets to Alaska or Hawaii. Closets ship nationwide. Door samples ship free.",
      ),
      q(
        'How much is delivery?',
        'Free on orders over $2,500. Below that, your designer includes delivery in your quote. [Shipping policy](/shipping-policy)',
      ),
      q(
        'How is my order shipped?',
        "Cabinet and full-kitchen orders travel by freight carrier, on pallets. You'll get the carrier and tracking details in your shipping confirmation. Smaller items and accessories ship by FedEx or UPS Ground.",
      ),
      q(
        'Where is it delivered?',
        "To the ground floor. At a house, the truck delivers to the curb or your driveway, wherever the driver judges safest. Moving it inside or upstairs is up to you. Delivery inside your home and assembly aren't included unless you add them to your order.",
      ),
      q(
        'What does end-of-truck delivery mean?',
        'The driver moves the pallet to the back of the truck. Unloading it from there is up to you. Many cabinets weigh over 100 lb, so have one or two helpers ready.',
      ),
      q(
        'Do I need to be home?',
        'Yes. Someone 18 or over needs to be there to accept and sign for the delivery.',
      ),
      q(
        'Can I pick up my order?',
        "Yes. Any cabinet order can be picked up from Bristol, Monday to Friday 8–6 and Saturday 8–5. We'll tell you when it's ready.",
      ),
      q(
        "What's pickup only?",
        "Windows and appliances, from Bristol, usually ready in 2 days. They're for Connecticut customers.",
      ),
    ],
  },
  {
    id: 'returns-and-cancellations',
    title: 'Returns & cancellations',
    icon: 'rotate-ccw',
    items: [
      q(
        'Can I return something?',
        "Yes, if it's unopened and we approve the return first. Returns must reach us within 30 days of purchase, and a 30% restocking fee applies. [Read the returns policy](/returns-policy)",
      ),
      q(
        'How do I start a return?',
        "Call or email us first. We'll give you a return authorization. Returns sent without one aren't accepted.",
      ),
      q('Who pays return shipping?', 'You do. Returns go to 18 Main Street, Bristol, CT 06010.'),
      q(
        "What can't be returned?",
        'Assembled cabinets, and RTA cabinets that have been put together. Decorative hardware (knobs and pulls). Glass doors and inserts. Moldings, fillers, panels, corbels and brackets, feet, posts and legs, valances, and other trim and accessories. Special-order items.',
      ),
      q(
        'I mis-measured. Can I return a cabinet?',
        "Yes, if it's unopened, within 30 days, and isn't on the list above. The 30% restocking fee applies, so double-check your measurements before you order.",
      ),
      q(
        "I don't like the finish. Can I return my order?",
        'Only unopened items, with the restocking fee. Order door samples first, and your first two are free.',
      ),
      q(
        "What if a returned item can't be resold?",
        "We can't refund items that come back damaged or unsellable.",
      ),
      q(
        'Can I cancel after it has shipped?',
        "Yes, but the order has to come back to our warehouse. You pay the return freight, the original shipping charge and the 30% restocking fee, and we refund the rest once it's back.",
      ),
      q(
        'Do returns work the same for every product?',
        "Windows and appliances follow the manufacturer's policy. Countertops are cut to your kitchen and can't be returned.",
      ),
    ],
  },
  {
    id: 'damage-and-claims',
    title: 'Damage & claims',
    icon: 'shield-alert',
    items: [
      q(
        'It arrived damaged. What do I do?',
        "Don't refuse the delivery. Write the damage on the driver's delivery receipt (the Bill of Lading), have the driver sign it and keep a copy. Then file a claim with the carrier that delivered your order. Once you've done that, call us at 860-247-1000 and we'll help with the rest.",
      ),
      q(
        'How long do I have to check for hidden damage?',
        'Check every box as soon as it arrives, before you build anything, and report any damage to the carrier straight away. Returns must reach us within 30 days of purchase.',
      ),
      q(
        'Do I pay a restocking fee on damaged items?',
        'No. The 30% restocking fee and return shipping apply to regular returns, not to items damaged in transit.',
      ),
      q(
        "Who's responsible once it leaves your warehouse?",
        "Once your order is with the carrier, the carrier is responsible for loss or damage in transit. That's why checking and noting damage at delivery matters.",
      ),
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty',
    icon: 'shield-check',
    items: [
      q(
        "What's the warranty?",
        '1 year from the date of purchase, on every cabinet we make or supply, against defects in materials and workmanship. [Read the full warranty](/warranty)',
      ),
      q(
        "Who's covered?",
        'The original buyer, with proof of purchase. The warranty covers cabinets only, not other products.',
      ),
      q(
        "What isn't covered?",
        "Normal wear, accidents, misuse, dirt and water damage, tampering, improper installation, repairs by anyone we haven't authorized, modified cabinets, and commercial use.",
      ),
      q(
        'How do I make a claim?',
        "Write to us with a description of the defect, and photos if you can. We'll repair it, send replacement parts, or replace the cabinet with an equivalent one. [Contact us](/contact)",
      ),
      q(
        'What if my style has been discontinued?',
        "We'll replace the part with the same style, or the closest style we currently make. Replacement finishes may not exactly match cabinets that have aged in your kitchen.",
      ),
      q(
        'Who pays for removal and reinstallation?',
        'We cover the parts. Removal, transport and reinstallation are on you.',
      ),
      q(
        'Does a replacement get a new warranty?',
        'No. A repaired or replaced cabinet keeps the time left on the original warranty.',
      ),
      q(
        'Does installation affect the warranty?',
        "The warranty covers the cabinet, not the installation. Damage caused by improper installation isn't covered.",
      ),
    ],
  },
  {
    id: 'showrooms-and-factory-outlet',
    title: 'Showrooms & Factory Outlet',
    icon: 'store',
    items: [
      q(
        'Where are your showrooms?',
        'Six showrooms across Connecticut, each with full kitchens on display. [Find a showroom](/showrooms)',
      ),
      q(
        "What's the Factory Outlet?",
        "Our outlet at 18 Main Street, Bristol. It sells clearance and brand-new products at a discount: quick-ship cabinets (Eden, Madison, Avon and Derry), discontinued and clearance cabinets, closets, in-stock appliances, windows, vanities, countertops, siding and interior doors. It isn't a showroom, so price match and financing aren't available there.",
      ),
      q(
        "What can I do in a showroom that I can't do online?",
        'See and touch full kitchens, go through your kitchen with a designer, use price match on Star cabinets and countertops, and apply for financing. Walk-ins are welcome.',
      ),
      q('Can I call or text you?', 'Yes. Call or text 860-247-1000. Phones are answered 24/7.'),
    ],
  },
];

export const FAQ_CLOSING = {
  title: 'Still have a question?',
  description:
    "If it isn't answered above, tell us what you're trying to do and we'll point you the right way.",
  primary: { label: 'Send us a message', href: '/contact' },
  secondary: { label: 'Free design consult', href: FREE_DESIGN_HREF },
};

export { ESTIMATOR_HREF };

/*
 * Still to confirm with EK (each is marked in the answer above):
 *  1. Soft-close, full-extension glides: standard or upgrade? EK's copy says standard; the Avon
 *     spec says upgrade.
 *  2. Free shipping over $2,500: the conditions.
 *  3. Pickup hours in Bristol: Mon–Fri 8–6 and Sat 8–5?
 *  4. Return rules by product: windows, appliances and countertops.
 * Before publishing: the "about half" RTA saving is EK's median (53%); the Avon 10×10 prices show
 * a 5–10% gap, so spot-check a few collections.
 */
