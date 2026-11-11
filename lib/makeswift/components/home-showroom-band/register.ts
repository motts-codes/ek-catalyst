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
    kicker: TextInput({ label: 'Kicker', defaultValue: 'Six showrooms across Connecticut' }),
    title: TextInput({ label: 'Title', defaultValue: 'Open the drawers before you buy them.' }),
    description: TextArea({
      label: 'Description',
      defaultValue:
        'Bring your Pinterest saves, your measurements, or just an idea. See the real colours in real light, feel the finishes, test the soft-close, and sit down with a Project Manager who’ll price your kitchen, free.',
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
    tint: Checkbox({ label: 'Tinted background', defaultValue: false }),
  },
});
