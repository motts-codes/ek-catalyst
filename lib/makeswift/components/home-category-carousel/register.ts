import { Checkbox, Group, Image, Link, List, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSCategoryCarousel } from './client';

runtime.registerComponent(MSCategoryCarousel, {
  type: 'home-category-carousel',
  label: 'Home / Category Carousel',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({ label: 'Title', defaultValue: 'Shop by category.' }),
    categories: List({
      label: 'Categories',
      type: Group({
        label: 'Category',
        props: {
          name: TextInput({ label: 'Name', defaultValue: 'Kitchen cabinets' }),
          subtitle: TextInput({ label: 'One-line hook', defaultValue: '50,000 in stock' }),
          link: Link({ label: 'Link' }),
          imageSrc: Image({ label: 'Photo' }),
          imageAlt: TextInput({ label: 'Photo alt text', defaultValue: '' }),
        },
      }),
      getItemLabel(tile) {
        return tile?.name || 'Category';
      },
    }),
    tint: Checkbox({ label: 'Tinted background', defaultValue: true }),
  },
});
