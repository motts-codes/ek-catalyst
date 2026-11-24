// The site-wide button hover: a fill that slides in from the left, the same motion the Button and
// ButtonLink primitives use. For the few buttons that cannot be a primitive (a link in a map
// popup, a submit tucked inside an input, a pill in a card), compose these with the fill colour
// as an `after:bg-*` class and the element's own radius as `after:rounded-*`. A plain
// `hover:bg-*` colour swap is not the house hover.
const layers =
  'isolate z-0 overflow-hidden after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:transition-transform after:duration-300 after:ease-[cubic-bezier(0,0.25,0,1)]';

export const slideFill = `relative ${layers} hover:after:translate-x-0`;

// For an element that is already positioned (`absolute`, `fixed`): no `relative` to fight it.
export const slideFillPositioned = `${layers} hover:after:translate-x-0`;

// The same fill, driven by a hovered `group` ancestor (a whole card that is the link).
export const groupSlideFill = `relative ${layers} group-hover:after:translate-x-0`;
