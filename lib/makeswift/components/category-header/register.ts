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

import { CATEGORY_HEADER_TYPE } from '../section-types';

import { MSCategoryHeader } from './client';

const ICON_OPTIONS = [
  { value: 'stock', label: 'In stock (box)' },
  { value: 'truck', label: 'Shipping (truck)' },
  { value: 'returns', label: 'Returns (arrow)' },
  { value: 'pickup', label: 'Pickup (pin)' },
  { value: 'clock', label: 'Time (clock)' },
  { value: 'price', label: 'Price (dollar)' },
] as const;

runtime.registerComponent(MSCategoryHeader, {
  type: CATEGORY_HEADER_TYPE,
  label: 'Category / Header',
  icon: 'layout',
  props: {
    className: Style(),
    // Every field is optional: empty = keep the BigCommerce value / the page default.
    title: TextInput({ label: 'Headline (empty = category name)' }),
    description: TextArea({ label: 'Paragraph (empty = category description)' }),
    imageSrc: Image({ label: 'Photo (empty = category image)' }),
    imageAlt: TextInput({ label: 'Photo alt text' }),
    ctaLabel: TextInput({ label: 'Button text (empty = "Shop all …")' }),
    link: Link({ label: 'Button link (empty = jump to products)' }),
    showPoints: Checkbox({ label: 'Show points row', defaultValue: true }),
    points: List({
      label: 'Points (empty = page default)',
      type: Group({
        label: 'Point',
        props: {
          icon: Select({ label: 'Icon', options: ICON_OPTIONS, defaultValue: 'stock' }),
          label: TextInput({ label: 'Text', defaultValue: 'In stock' }),
        },
      }),
      getItemLabel(point) {
        return point?.label || 'Point';
      },
    }),
    fine: TextInput({ label: 'Small print (right of the points)' }),
    showTiles: Checkbox({ label: 'Show subcategory tiles', defaultValue: true }),
    subTitle: TextInput({ label: 'Tiles heading (empty = "Shop by type")' }),
  },
});
