import { type CabinetProgramContent } from '@/vibes/soul/sections/cabinet-program-content';

/**
 * The long-form content at the foot of the Assembled / RTA listings (styles, build quality, why
 * buy from Express Kitchens, how to choose, why this program). Copy is Arun's; icons are Lucide
 * names resolved in the section.
 */
export const CABINET_PROGRAM_CONTENT: Record<'assembled' | 'rta', CabinetProgramContent | null> = {
  assembled: {
    styles: {
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
    build: {
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
          icon: 'badge-check',
          lead: 'KCMA tested.',
          detail:
            'Every cabinet is tested to Kitchen Cabinet Manufacturers Association (KCMA) standards before it ships.',
        },
        {
          icon: 'check-check',
          lead: 'Same quality on every order.',
          detail: 'One cabinet or a full kitchen, it’s built to the same standard.',
        },
      ],
    },
    why: {
      title: 'Why buy assembled cabinets from Express Kitchens',
      intro:
        'We make the cabinets and design the kitchen, so you’re not juggling vendors or wondering who’s responsible for what.',
      reasons: [
        {
          icon: 'badge-dollar-sign',
          title: 'Factory-direct pricing',
          detail:
            'We make our own cabinets, so there’s no middleman’s markup. Customers typically save 30–50% compared with big-box stores.',
        },
        {
          icon: 'gem',
          title: 'Premium construction, standard',
          detail:
            'Every order comes with plywood boxes, dovetail drawers, soft-close hinges and full-extension glides, at no extra cost.',
        },
        {
          icon: 'truck',
          title: 'Ships across 45 states',
          span: 'tall',
          detail:
            'Whether you’re in Delaware, Maryland, Virginia, Florida, Pennsylvania, North Carolina, South Carolina or Georgia, or any of the 45 states we serve, order online and we’ll ship your assembled cabinets to your door. In-stock styles ship within 1–3 business days and usually arrive in 1–2 weeks. Help is available by phone or video call wherever you are.',
        },
        {
          icon: 'award',
          title: 'KCMA-certified construction',
          detail:
            '¾" plywood boxes, not particleboard or MDF, made with robotic precision and tested to Kitchen Cabinet Manufacturers Association standards.',
        },
        {
          icon: 'percent',
          title: '0% interest financing',
          note: 'Available for showroom purchases',
          detail:
            'Flexible 0% APR payment plans through GreenSky, so a better kitchen doesn’t mean a bigger upfront cost.',
        },
        {
          icon: 'warehouse',
          title: '50,000+ cabinets in stock',
          detail: 'Ready to ship, along with countertops, cabinet hardware and organizers.',
        },
        {
          icon: 'pencil-ruler',
          title: 'Free design consultation',
          detail:
            'A designer plans your whole kitchen with you, by phone, video call or in a showroom, with clear pricing and no cost or obligation.',
        },
        {
          icon: 'shield-check',
          title: '1-year warranty',
          detail:
            'Every assembled cabinet is covered for one year against defects in materials and workmanship.',
        },
      ],
    },
    choose: {
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
    program: {
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
  },
  rta: null,
};
