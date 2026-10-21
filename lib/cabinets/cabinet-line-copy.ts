// One line per product line, shown next to the "Filter by line" pills on the Assembled / RTA
// listings for whichever line is selected. Keyed by the line's slug ("all" for no selection).
// Copy from Arun, Oct 22 2026.
const SHARED = {
  star: 'Classic framed cabinets in 11 shaker, traditional and transitional styles.',
  prism: 'Star door styles, fully assembled and painted in 11 colors.',
  'euro-value': 'Sleek frameless look with an engineered board box, at a lower price.',
  'euro-max': 'Sleek frameless look with a plywood box, built for busy kitchens.',
};

// "All" differs per program; the line copy is shared.
export const CABINET_LINE_COPY: Record<'assembled' | 'rta', Record<string, string>> = {
  assembled: {
    all: 'Four lines, framed and frameless, assembled and checked before they ship.',
    ...SHARED,
  },
  rta: {
    all: 'Flat-packed cabinets you put together. Same doors and finish as assembled, for less.',
    ...SHARED,
  },
};
