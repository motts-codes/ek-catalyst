import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSShowroomBand } from './client';

runtime.registerComponent(MSShowroomBand, {
  type: 'home-showroom-band',
  label: 'Home / Showroom Band',
  icon: 'layout',
  props: {
    className: Style(),
    kicker: TextInput({ label: 'Kicker', defaultValue: 'Your local design studio' }),
    title: TextInput({ label: 'Title', defaultValue: 'Six showrooms across Connecticut.' }),
    description: TextArea({
      label: 'Description',
      defaultValue:
        'A showroom visit turns a saved photo into something you can see, feel, and make your own. Our specialists are ready when you are.',
    }),
    showrooms: List({
      label: 'Showrooms',
      type: Group({
        label: 'Showroom',
        props: {
          name: TextInput({ label: 'Name', defaultValue: 'Brookfield' }),
          badge: TextInput({ label: 'Badge (e.g. factory outlet)', defaultValue: '' }),
          link: Link({ label: 'Showroom page' }),
          imageSrc: Image({ label: 'Interior photo' }),
          imageAlt: TextInput({ label: 'Photo alt text', defaultValue: '' }),
        },
      }),
      getItemLabel(showroom) {
        return showroom?.name || 'Showroom';
      },
    }),
    interval: Number({ label: 'Cycle every', defaultValue: 3.5, suffix: 's' }),
    tint: Checkbox({ label: 'Tinted background', defaultValue: true }),
  },
});
