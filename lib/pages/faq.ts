import { type CabinetFaqItem } from '@/vibes/soul/sections/cabinet-faq';

export interface FaqGroup {
  id: string;
  title: string;
  items: CabinetFaqItem[];
}

// Site-wide FAQ. Answers marked "(to confirm)" in the wireframe keep a [confirm] note for the
// business; everything else is as the current policies state it.
export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'ordering',
    title: 'Ordering & payment',
    items: [
      {
        q: 'How can I pay?',
        a: 'We take MasterCard, Visa, Discover and American Express, and you can also apply for 0% financing on qualifying orders, subject to approval.',
      },
      {
        q: 'Do you charge sales tax?',
        a: 'Sales tax is charged on orders shipped to Connecticut and Massachusetts.',
      },
      {
        q: 'What if I need to cancel or change my order?',
        a: "Call us on (860) 247-1000 within 72 hours of placing it and we'll change or cancel it with no fee. After 72 hours the order may already be in production, so changes and cancellations may not be possible without additional fees.",
      },
      {
        q: 'When is my card charged?',
        a: 'When you place the order. A card authorization is required to submit it.',
      },
      {
        q: 'What happens if something on my order is out of stock?',
        a: "We'll let you know, tell you when it will be available, and leave the choice with you: ship the in-stock items now and the rest later (additional shipping may apply), wait and have everything arrive together, or swap for an in-stock alternative.",
      },
      {
        q: 'Do you have discounts or promotions?',
        a: 'Yes. Current offers are on the Promotions page: the $179.99 replacement window, seasonal collection sales, 0% financing and free door samples. Sign up to the newsletter to hear about new ones first. [confirm]',
      },
      {
        q: 'Do you price match?',
        a: "Yes. If you find the same cabinet cheaper from an authorized seller, we'll match it. The Price Match Guarantee page explains how. [confirm]",
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery, pickup & timing',
    items: [
      {
        q: 'When will my order ship?',
        a: 'Ready-to-assemble cabinets ship in about two weeks and assembled cabinets in about three. Closets ship from stock in [X] days. Windows and appliances are ready for pickup in two days. [confirm]',
      },
      {
        q: 'How long does transit take once it ships?',
        a: 'Most orders take a further 7–10 business days to reach your local freight terminal.',
      },
      {
        q: 'How is my order shipped?',
        a: "Larger cabinet and full-kitchen orders travel with a common freight carrier, and you'll get the carrier and tracking details with your shipment confirmation. Smaller items and accessories ship by FedEx or UPS Ground.",
      },
      {
        q: 'What is a curbside, end-of-truck delivery?',
        a: 'At a residential address the truck delivers to the curb or your driveway, wherever the driver judges safest. End-of-truck means the driver moves the pallet to the end of the truck; unloading it piece by piece from there is up to you. Many cabinets weigh over 100 lb, so we strongly recommend having one or two helpers on hand.',
      },
      {
        q: 'Do I need to be home?',
        a: 'Yes. Someone aged 18 or over needs to be there to accept and sign for the delivery.',
      },
      {
        q: 'Which states do you ship to?',
        a: 'The 48 contiguous states. Sample doors ship free to all of them. [confirm]',
      },
      {
        q: 'Can I pick up from the warehouse?',
        a: "Yes. Any cabinet order can be collected from the Bristol factory outlet, Monday to Friday 8–6 and Saturday 8–5. We'll tell you when it's ready. [confirm]",
      },
      {
        q: 'Which products are pickup only?',
        a: 'Windows and appliances are pickup only, from Bristol, usually within two days.',
      },
      {
        q: 'Is there a faster option?',
        a: 'Some collections are marked "Ships next day" on their page. Order before [X] PM for next-business-day dispatch. [confirm]',
      },
    ],
  },
  {
    id: 'rta',
    title: 'RTA vs assembled',
    items: [
      {
        q: 'What is the difference, and which is right for me?',
        a: "It's the same cabinet either way: the same box, door, finish and warranty. Ready-to-assemble arrives flat-packed for you to build; assembled arrives built. RTA suits handy homeowners and tighter budgets; assembled suits anyone who would rather have it done, and contractors working to a schedule.",
      },
      { q: 'How much do I save with RTA?', a: 'About [X]% on the cabinet price. [confirm]' },
      {
        q: 'How long does a cabinet take to assemble?',
        a: 'About [X] minutes each with a screwdriver and a mallet. A typical 10×10 kitchen is an afternoon. [confirm]',
      },
      {
        q: 'What tools do I need?',
        a: 'A Phillips screwdriver or drill, a rubber mallet and a square. Every part is cut, drilled and finished; nothing needs cutting. [confirm]',
      },
      {
        q: 'Glue or cam locks?',
        a: 'Cam locks and dowels, with glue on the dowels for a rigid box. Full instructions and a video come with every cabinet. [confirm]',
      },
      {
        q: 'Is it the same quality as assembled?',
        a: 'Yes. Identical parts from the same line; assembled cabinets are simply put together in our shop rather than in your kitchen.',
      },
    ],
  },
  {
    id: 'installation',
    title: 'Installation',
    items: [
      {
        q: 'Do you install?',
        a: "No. Installation isn't included on anything we sell. We deliver, or you collect, and you or your installer fit it.",
      },
      {
        q: 'Can you recommend an installer?',
        a: 'We can point you to a directory of local contractors; see Find an installer in the footer. Pro Program members in your area are listed there too. [confirm]',
      },
      {
        q: 'Do I need a pro to assemble RTA cabinets?',
        a: 'No. Most customers build them themselves, and the videos walk through every cabinet type step by step.',
      },
      {
        q: 'Does using my own installer affect the warranty?',
        a: "No. The warranty covers the cabinet, not the installation, so damage caused during installation isn't covered. [confirm]",
      },
    ],
  },
  {
    id: 'products',
    title: 'Products, materials & construction',
    items: [
      {
        q: 'What are the cabinets made of?',
        a: 'All-plywood boxes: ¾-inch plywood sides, top and bottom, with no particle board. [confirm]',
      },
      {
        q: 'Is it all-plywood on every line?',
        a: 'Yes. Star, Prism, Euro Max and Euro Value all use the plywood box; the lines differ in door construction and finish. [confirm]',
      },
      {
        q: 'Are they strong enough for granite or quartz?',
        a: 'Yes. The plywood box and ¾-inch top rails are built to carry stone, and we cut and fit granite and quartz on our own cabinets every week.',
      },
      {
        q: 'Are the sides and insides finished?',
        a: 'The interior is a matching finished surface, and exposed ends get a finished end panel. See "Do I need end panels?" [confirm]',
      },
      {
        q: 'Do cabinets come with knobs and pulls?',
        a: 'No. Hardware is sold separately so one style can run through the whole kitchen; thousands of handles are in stock.',
      },
      {
        q: 'Dovetail drawers? Soft-close?',
        a: 'Yes to both: solid-wood dovetail drawer boxes, soft-close hinges and full-extension undermount glides, all fitted. [confirm]',
      },
      {
        q: 'Full overlay or ¾ overlay?',
        a: 'The framed lines (Star, Prism) are full overlay, and the frameless lines (Euro Max, Euro Value) are full overlay by construction. [confirm]',
      },
      {
        q: 'Do I need end panels?',
        a: 'Only where a cabinet side will be visible: the end of a run, beside a window, on an island. Your designer marks them on the plan.',
      },
      {
        q: 'Do I need toe kick?',
        a: 'Yes. Base cabinets ship with a recessed toe space and the toe-kick molding covers it. It is included in the 10×10 price. [confirm]',
      },
      {
        q: 'Are the cabinets KCMA certified? CARB compliant?',
        a: '[Certification and emissions compliance to confirm.]',
      },
      {
        q: 'Can I buy just doors or replacement parts?',
        a: 'Yes: doors, drawer fronts, hinges and glides for any current collection. Call us or ask your Project Manager. [confirm]',
      },
      {
        q: 'Do you sell countertops?',
        a: 'Yes: granite, quartz and laminate. Countertops are quoted rather than added to a cart; see the Countertops page or call us to order.',
      },
    ],
  },
  {
    id: 'measuring',
    title: 'Sizing & measuring',
    items: [
      {
        q: 'What are the standard cabinet sizes?',
        a: 'Base cabinets are 24 in. deep and 34½ in. high; wall cabinets 12 in. deep and 30, 36 or 42 in. high; tall cabinets 84, 90 or 96 in. Widths run from 9 to 48 in. in 3-inch steps. Vanities are 21 in. deep. [confirm]',
      },
      {
        q: 'How much space between the countertop and wall cabinets?',
        a: '18 inches is standard.',
      },
      {
        q: 'How do I measure my kitchen?',
        a: "Three numbers per wall and the position of anything that can't move. The measuring guide has the six steps and a printable template, and a designer checks every measurement before anything is ordered.",
      },
      {
        q: 'What is a 10×10 kitchen?',
        a: 'The industry standard for comparing prices: two 10-foot walls in an L, 20 feet of cabinets. Every "from" price on this site is that kitchen in that collection. See "What is a 10×10 kitchen" for exactly what is in ours.',
      },
    ],
  },
  {
    id: 'samples',
    title: 'Samples & design',
    items: [
      {
        q: 'Can I get door samples?',
        a: 'Yes: quarter, half or full doors in any collection and finish, from the Samples page or any product page.',
      },
      {
        q: 'Are samples free?',
        a: 'Your first two quarter-door samples are free with the code FREESAMPLES at checkout. Further quarter doors, and all half and full doors, are priced per sample. Samples ship free to the 48 states. [confirm]',
      },
      {
        q: 'Do you offer design help?',
        a: 'Yes, and it is free. A Project Manager plans your kitchen with you, in a showroom, at your home or on a video call, and gives you an itemized price. No deposit.',
      },
      {
        q: 'Do I need a showroom appointment?',
        a: 'No, walk-ins are welcome. Booking a visit reserves a Project Manager for the full 60–90 minutes.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & cancellations',
    items: [
      {
        q: 'What is the return window?',
        a: 'Contact customer service within 5 days of delivery. Items must be in their original, unopened packaging. [confirm]',
      },
      { q: 'Is there a restocking fee?', a: 'Yes, 30% on all returned items.' },
      {
        q: "What can't be returned?",
        a: 'Decorative hardware (knobs and pulls); ready-to-assemble cabinets that have been assembled; glass doors or inserts; moldings, fillers, panels, corbels, feet, legs, valances and other trim and accessories; and all special-order items.',
      },
      {
        q: 'Who pays return shipping?',
        a: 'The customer. Customer service issues a return authorization and the address.',
      },
      {
        q: 'I mis-measured. Can I return a cabinet?',
        a: "Yes, if it's in the original unopened packaging and isn't a non-returnable item. A 30% restocking fee applies; contact customer service for a return authorization.",
      },
      {
        q: "I don't like the finish. Can I return the order?",
        a: 'Only unopened items, with the restocking fee, which is why we recommend ordering door samples first. The first two are free.',
      },
      {
        q: 'Do returns differ by category?',
        a: "Windows and appliances follow the manufacturer's policy; closets and cabinets follow the policy above; countertops are cut to your kitchen and cannot be returned. [confirm]",
      },
      {
        q: 'Can I cancel after it has shipped?',
        a: "Yes, but the order has to come back to the warehouse: you pay the return freight, the original shipping charge and a 30% restocking fee, and we refund the balance once it's back.",
      },
    ],
  },
  {
    id: 'damage',
    title: 'Damage & claims',
    items: [
      {
        q: 'It arrived damaged. What do I do?',
        a: "Don't refuse it. Note the damage on the driver's Bill of Lading, have the driver sign it, keep a copy, then call (860) 247-1000. Damage not noted on the BOL cannot be claimed from the carrier.",
      },
      {
        q: 'How long do I have to check for hidden damage?',
        a: '5 days from delivery to open every box and inspect.',
      },
      {
        q: 'What happens next?',
        a: 'Send us photos of the whole item with your order number. We review claims within 2 business days and ship replacement parts first. If three replacements fail to fix it, we refund the cabinet.',
      },
    ],
  },
];
