import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSCardRow, MSTileRow } from './client';

runtime.registerComponent(MSTileRow, {
  type: 'category-tile-row',
  label: 'Category / Tile Row',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({ label: 'Heading', defaultValue: 'Shop by finish' }),
    tiles: List({
      label: 'Tiles',
      type: Group({
        label: 'Tile',
        props: {
          name: TextInput({ label: 'Name', defaultValue: 'Matte black' }),
          imageSrc: Image({ label: 'Photo' }),
          imageAlt: TextInput({ label: 'Photo alt text' }),
          link: Link({ label: 'Link' }),
        },
      }),
      getItemLabel(tile) {
        return tile?.name || 'Tile';
      },
    }),
  },
});

runtime.registerComponent(MSCardRow, {
  type: 'category-card-row',
  label: 'Category / Card Row',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({ label: 'Heading', defaultValue: 'Shop by problem' }),
    description: TextInput({ label: 'One line under the heading' }),
    cards: List({
      label: 'Cards',
      type: Group({
        label: 'Card',
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'The corner that swallows things' }),
          description: TextArea({
            label: 'Description',
            defaultValue: 'Blind-corner pull-outs and lazy susans.',
          }),
          ctaLabel: TextInput({ label: 'Button text (empty = no button)' }),
          imageSrc: Image({ label: 'Photo' }),
          imageAlt: TextInput({ label: 'Photo alt text' }),
          link: Link({ label: 'Link' }),
        },
      }),
      getItemLabel(card) {
        return card?.title || 'Card';
      },
    }),
    columns: Select({
      label: 'Cards per row',
      options: [
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
      defaultValue: '3',
    }),
    tint: Checkbox({ label: 'Tinted background', defaultValue: false }),
  },
});
