import { Group, List, Number, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSProductTabs } from './client';

runtime.registerComponent(MSProductTabs, {
  type: 'home-product-tabs',
  label: 'Home / Product Tabs',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({ label: 'Title', defaultValue: "Shop what's moving." }),
    tabs: List({
      label: 'Tabs',
      type: Group({
        label: 'Tab',
        props: {
          label: TextInput({ label: 'Tab label', defaultValue: 'Trending' }),
          collection: Select({
            label: 'Product collection',
            options: [
              { value: 'featured', label: 'Featured' },
              { value: 'newest', label: 'Newest' },
              { value: 'best-selling', label: 'Best selling' },
            ],
            defaultValue: 'featured',
          }),
          limit: Number({ label: 'Max items', defaultValue: 12 }),
        },
      }),
      getItemLabel(tab) {
        return tab?.label || 'Tab';
      },
    }),
    aspectRatio: Select({
      label: 'Card image aspect ratio',
      options: [
        { value: '1:1', label: 'Square' },
        { value: '5:6', label: '5:6' },
        { value: '3:4', label: '3:4' },
      ],
      defaultValue: '1:1',
    }),
  },
});
