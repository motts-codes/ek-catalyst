import {
  type CabinetProgramContent,
  type ContentBlock,
} from '@/vibes/soul/sections/cabinet-program-content';

/**
 * The long-form content at the foot of the Assembled / RTA listings, as typed blocks (see the
 * section for the block shapes). Copy is Arun's; icons are Lucide names resolved in the section;
 * text fields take inline `[label](href)` links and `**bold**`.
 */

// Shared "Why buy from Express Kitchens" reasons; the two programs differ only in shipping and
// the warranty wording.
const WHY_INTRO =
  'We make the cabinets and design the kitchen, so you’re not juggling vendors or wondering who’s responsible for what.';

const whyReasons = (program: 'assembled' | 'rta') => [
  {
    icon: 'circle-dollar-sign' as const,
    title: 'Factory-direct pricing',
    detail:
      'We make our own cabinets, so there’s no middleman’s markup. Customers typically save 30–50% compared with big-box stores.',
  },
  {
    icon: 'gem' as const,
    title: 'Premium construction, standard',
    detail:
      'Every order comes with plywood boxes, dovetail drawers, soft-close hinges and full-extension glides, at no extra cost.',
  },
  program === 'assembled'
    ? {
        icon: 'truck' as const,
        title: 'Ships across 45 states',
        span: 'tall' as const,
        detail:
          'Whether you’re in Delaware, Maryland, Virginia, Florida, Pennsylvania, North Carolina, South Carolina or Georgia, or any of the 45 states we serve, order online and we’ll ship your assembled cabinets to your door. In-stock styles ship within 1–3 business days and usually arrive in 1–2 weeks. Help is available by phone or video call wherever you are.',
      }
    : {
        icon: 'truck' as const,
        title: 'Ships across 45 states',
        span: 'tall' as const,
        detail:
          'Order online from anywhere we ship and we’ll send your flat-packed cabinets to your door. RTA orders ship in 5–10 business days. Help is available by phone or video call wherever you are.',
      },
  program === 'assembled'
    ? {
        icon: 'award' as const,
        title: 'KCMA-certified construction',
        detail:
          '¾" plywood boxes, not particleboard or MDF, made with robotic precision and tested to Kitchen Cabinet Manufacturers Association standards.',
      }
    : {
        icon: 'award' as const,
        title: 'KCMA-tested construction',
        detail:
          'Every cabinet box is ¾" plywood, not particleboard or MDF, with parts precision-made for a consistent fit and tested to Kitchen Cabinet Manufacturers Association standards.',
      },
  {
    icon: 'percent' as const,
    title: '0% interest financing',
    note: 'Available for showroom purchases',
    detail:
      'Flexible 0% APR payment plans through GreenSky, so a better kitchen doesn’t mean a bigger upfront cost.',
  },
  {
    icon: 'warehouse' as const,
    title: '50,000+ cabinets in stock',
    detail: 'Ready to ship, along with countertops, cabinet hardware and organizers.',
  },
  {
    icon: 'pencil-ruler' as const,
    title: 'Free design consultation',
    detail:
      'A designer plans your whole kitchen with you, by phone, video call or in a showroom, with clear pricing and no cost or obligation.',
  },
  program === 'assembled'
    ? {
        icon: 'shield-check' as const,
        title: '1-year warranty',
        detail:
          'Every assembled cabinet is covered for one year against defects in materials and workmanship.',
      }
    : {
        icon: 'shield-check' as const,
        title: '1-year warranty',
        detail:
          'Every RTA cabinet is covered for one year on the cabinet box, against defects in materials and workmanship.',
      },
];

/** The assembled listing's "Build quality" red panel; the assembled explainer shows it too. */
export const ASSEMBLED_BUILD_BLOCK: Extract<ContentBlock, { type: 'build' }> = {
  type: 'build',
  title: 'Build quality',
  points: [
    {
      icon: 'layers',
      lead: 'Solid plywood construction.',
      detail:
        'Every cabinet box is built from ¾" plywood, not particleboard or MDF, so it holds up to daily use, moisture and weight for years.',
    },
    {
      icon: 'blocks',
      lead: 'True dovetail drawers.',
      detail: 'Dovetail joints are stronger than glued or stapled drawer boxes.',
    },
    {
      icon: 'move-horizontal',
      lead: 'Full-extension glides.',
      detail:
        'Drawers slide all the way out, so you can reach everything inside, not just the front few inches.',
    },
    {
      icon: 'volume-x',
      lead: 'Soft-close, standard.',
      detail: 'Every door and drawer closes quietly, at no extra cost. It’s not an upgrade.',
    },
    {
      icon: 'bot',
      lead: 'Robotic manufacturing.',
      detail: 'Robots cut and finish every part for a precise, consistent fit.',
    },
    {
      icon: 'check-check',
      lead: 'Same quality on every order.',
      detail: 'One cabinet or a full kitchen, it’s built to the same standard.',
    },
    {
      icon: 'badge-check',
      lead: 'KCMA tested.',
      detail:
        'Every cabinet is tested to Kitchen Cabinet Manufacturers Association (KCMA) standards before it ships.',
    },
  ],
};

/** The "Why buy assembled cabinets" bento; the Cabinets hub shows the same cards. */
export const ASSEMBLED_WHY_BLOCK: Extract<ContentBlock, { type: 'why' }> = {
  type: 'why',
  title: 'Why buy assembled cabinets from Express Kitchens',
  intro: WHY_INTRO,
  reasons: whyReasons('assembled'),
};

// Collection links for the RTA copy (carrying the program so the collection opens on RTA).
const rta = (slug: string) => `/cabinets/${slug}?program=rta`;

export const CABINET_PROGRAM_CONTENT: Record<'assembled' | 'rta', CabinetProgramContent | null> = {
  assembled: {
    blocks: [
      {
        type: 'lines',
        title: 'Available cabinet styles',
        intro:
          'Assembled cabinets come in the same looks as custom cabinetry, with 300+ cabinet sizes and types in every door style.',
        lines: [
          {
            name: 'Star',
            construction: 'Framed',
            summary: 'Framed cabinets in a wide range of finishes.',
          },
          { name: 'Prism', construction: 'Framed', summary: 'Custom-painted framed cabinets.' },
          {
            name: 'Euro Max',
            construction: 'Frameless',
            summary: 'Frameless cabinets with ¾" plywood boxes.',
          },
          {
            name: 'Euro Value',
            construction: 'Frameless',
            summary: 'Frameless cabinets built for everyday durability.',
          },
        ],
        looksTitle: 'Or choose by look',
        looks: [
          {
            icon: 'square',
            name: 'Shaker',
            summary:
              'Clean lines and a recessed center panel, at home in traditional and modern kitchens.',
          },
          {
            icon: 'sparkles',
            name: 'Modern',
            summary: 'Sleek high-gloss finishes for minimalist kitchens.',
          },
          {
            icon: 'crown',
            name: 'Traditional',
            summary: 'More detailed molding and framing for a classic look.',
          },
        ],
        outro:
          'Base, wall and pantry cabinets come in framed or frameless styles, in paint colors, wood stains and textures to match your floors and countertops.',
      },
      ASSEMBLED_BUILD_BLOCK,
      ASSEMBLED_WHY_BLOCK,
      {
        type: 'choose',
        title: 'How to choose the right assembled cabinets',
        intro: 'Choosing cabinets is about more than color. Think about these first:',
        rows: [
          {
            icon: 'layout-grid',
            factor: 'Layout',
            advice:
              'Measure carefully and think about how you use your kitchen. The right layout improves storage and workflow.',
          },
          {
            icon: 'door-open',
            factor: 'Style',
            advice:
              'Choose a door style that suits your home and your taste, whether modern, classic or in between.',
          },
          {
            icon: 'archive',
            factor: 'Storage',
            advice:
              'Plan for deep drawers, pantry cabinets, pull-outs and corner storage to use every inch.',
          },
          {
            icon: 'palette',
            factor: 'Finish and color',
            advice: 'Light finishes make small kitchens feel bigger. Darker finishes add warmth.',
          },
          {
            icon: 'clock',
            factor: 'Long-term value',
            advice: 'Plywood boxes and solid construction last through years of daily use.',
          },
          {
            icon: 'wallet',
            factor: 'Budget',
            advice:
              'Cabinets are usually the biggest cost in a kitchen remodel, so set a range early to narrow your choices.',
          },
        ],
      },
      {
        type: 'checklist',
        title: 'Why choose assembled cabinets?',
        intro:
          'Assembled cabinets arrive built and ready to install. No flat-pack boxes, hardware bags or instructions, wherever you are in the US.',
        points: [
          {
            lead: 'Ready to install.',
            detail:
              'Nothing to build between delivery and installation, so your project moves faster.',
          },
          {
            lead: 'Factory-built quality.',
            detail:
              'Built in a controlled setting for tighter joints, consistent alignment and fewer defects than cabinets put together on site.',
          },
          {
            lead: 'Saves installation time.',
            detail:
              'Installers go straight to mounting and leveling, which keeps your remodel on schedule.',
          },
          {
            lead: 'Stronger construction.',
            detail: 'Factory fastening goes beyond what’s practical with hand tools at home.',
          },
          {
            lead: 'Aligned before it ships.',
            detail:
              'Doors, drawers and face frames are adjusted before the cabinet leaves the factory.',
          },
          {
            lead: 'Less work for you.',
            detail: 'No manuals, no hardware bags, no trial and error.',
          },
        ],
      },
    ],
  },
  rta: {
    blocks: [
      {
        type: 'compare',
        title: 'Star vs. Euro Max',
        columns: ['Star (framed)', 'Euro Max (frameless)'],
        rows: [
          [
            'A face frame runs across the front of the cabinet box.',
            'European style, with no face frame and full access to the inside.',
          ],
          [
            'Solid birch face frames, with painted HDF or birch veneer doors depending on the style.',
            'A full ¾" plywood box carries the structure, since there’s no frame to help.',
          ],
          [
            'Traditional and shaker looks: the classic end of the range.',
            'Slab doors built around texture rather than paint color, for a clean, modern look.',
          ],
        ],
      },
      {
        type: 'build',
        title: 'Build quality',
        intro:
          'Every RTA cabinet we sell, Star or Euro Max, is built the same way under the finish.',
        points: [
          {
            icon: 'layers',
            lead: 'Plywood boxes.',
            detail:
              'Not particleboard, not MDF, on either line. Plywood holds screws tighter and resists moisture better, right where cheaper boxes fail first: under the sink and next to the dishwasher.',
          },
          {
            icon: 'badge-check',
            lead: 'Tested to ANSI/KCMA A161.1.',
            detail:
              'Doors and drawers are opened and closed 25,000 times, wall cabinets carry a 600 lb load, and shelves hold weight for 7 days straight without sagging or the joints pulling apart.',
          },
          {
            icon: 'blocks',
            lead: 'Dovetail drawers with full-extension glides.',
            detail: 'No stapled corners.',
          },
          {
            icon: 'volume-x',
            lead: 'Soft-close, standard.',
            detail:
              'Soft-close hinges and drawers on every door and every style. Nothing to upgrade.',
          },
          {
            icon: 'scissors',
            lead: 'Precision cut.',
            detail:
              'Star panels are CNC cut in our Connecticut factory, so every cabinet fits the next one.',
          },
          {
            icon: 'shield-house',
            lead: 'CARB2 compliant',
            detail: 'for formaldehyde emissions.',
          },
          {
            icon: 'shield-check',
            lead: '1-year warranty',
            detail: 'on the cabinet box.',
          },
        ],
      },
      {
        type: 'groups',
        title: 'Styles, finishes and textures',
        items: [
          {
            lead: 'Painted shaker, white or cream:',
            text: `flat recessed-panel doors in [Avon](${rta('avon')}), [Barcelona](${rta('barcelona')}), [Cambridge](${rta('cambridge')}) and [Mero](${rta('mero')}). The same profile in gray: [Derry](${rta('derry-stratus')}) and [Edinburgh](${rta('edinburgh')}).`,
          },
          {
            lead: 'Raised or detailed panel, more traditional:',
            text: `[Beacon Hill](${rta('beacon-hill')}) in white, [Lexington](${rta('lexington')}) in French vanilla.`,
          },
          {
            lead: 'Stained birch, real wood grain:',
            text: `[Birmingham](${rta('birmingham')}) in driftwood gray, [Dover](${rta('dover')}) in caramel, [Dublin](${rta('dublin')}) in espresso, [LaSalle](${rta('lasalle')}) and [Rochelle](${rta('rochelle')}) in bordeaux.`,
          },
          {
            lead: 'Euro Max frameless slab, built around texture:',
            text: `[EM Eden](${rta('euro-max-eden')}) has a natural, sleek finish; [EM Madison](${rta('euro-max-madison')}) has a deeper, matte texture. Both resist stains, scratches and scuffs.`,
          },
        ],
      },
      {
        type: 'why',
        title: 'Why buy RTA cabinets from Express Kitchens',
        intro: WHY_INTRO,
        reasons: whyReasons('rta'),
      },
      {
        type: 'prose',
        tint: true,
        title: 'RTA or assembled: which fits you?',
        paragraphs: [
          'RTA cabinets ship flat, and you put them together. That takes real time: plan on 45 minutes or more per cabinet, depending on its size and how comfortable you are with a drill. In exchange, you pay less, because you’re doing the work a factory would otherwise charge for.',
          'If that doesn’t fit your schedule, our [assembled cabinets](/cabinets/assembled-cabinets) arrive built, with doors on and drawers in, ready to install. They cost more, but there’s nothing to assemble. Both come from the same Bristol, CT factory and ship on the same nationwide network. The real difference is how much of the last step you want to do yourself.',
        ],
      },
      {
        type: 'prose',
        title: 'Framed vs. frameless kitchen cabinets',
        paragraphs: [
          `**Star cabinets are framed.** A face frame runs across the front of the box. It’s the more traditional way to build a cabinet, and it suits shaker, raised-panel and traditional door styles. Explore [Avon](${rta('avon')}), [Barcelona](${rta('barcelona')}), [Beacon Hill](${rta('beacon-hill')}), [Cambridge](${rta('cambridge')}), [Derry](${rta('derry-stratus')}), [Dublin](${rta('dublin')}), [Edinburgh](${rta('edinburgh')}), [LaSalle](${rta('lasalle')}), [Lexington](${rta('lexington')}) and [Rochelle](${rta('rochelle')}).`,
          `**Euro Max cabinets are frameless.** European style, with full access and no face frame, suited to slab doors and a cleaner, modern look. Explore [EM Eden](${rta('euro-max-eden')}) and [EM Madison](${rta('euro-max-madison')}).`,
        ],
      },
    ],
  },
};
