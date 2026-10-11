import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { CATEGORY_TILES } from '~/lib/home/home-content';
import { runtime } from '~/lib/makeswift/runtime';

import { CATEGORY_CAROUSEL_TYPE } from '../section-types';

import { MSCategoryCarousel } from './client';
import { categoryKey, CUSTOM_CATEGORY } from './merge-tiles';

interface CategoryOption {
  value: string;
  label: string;
}

// The default categories (same names on the homeowner and Pro pages), then "custom". Typed as a
// non-empty tuple because the Select control requires at least one option.
const customOption: CategoryOption = { value: CUSTOM_CATEGORY, label: 'Custom (add a new tile)' };
const [firstOption = customOption, ...otherOptions] = CATEGORY_TILES.map(
  (tile): CategoryOption => ({ value: categoryKey(tile.name), label: tile.name }),
);
const CATEGORY_OPTIONS: [CategoryOption, ...CategoryOption[]] = [
  firstOption,
  ...otherOptions,
  customOption,
];

runtime.registerComponent(MSCategoryCarousel, {
  type: CATEGORY_CAROUSEL_TYPE,
  label: 'Home / Category Carousel',
  icon: 'carousel',
  props: {
    className: Style(),
    // No default: an empty title falls back to the page's own heading (home vs Pro differ).
    title: TextInput({ label: 'Title' }),
    // Each item OVERRIDES one category; categories without an item keep the page's defaults.
    categories: List({
      label: 'Category overrides',
      type: Group({
        label: 'Category',
        props: {
          category: Select({ label: 'Category', options: CATEGORY_OPTIONS }),
          subtitle: TextInput({ label: 'Hook line (empty = keep default)' }),
          imageSrc: Image({ label: 'Photo' }),
          imageAlt: TextInput({ label: 'Photo alt text' }),
          link: Link({ label: 'Link (empty = keep default)' }),
          hide: Checkbox({ label: 'Hide this category', defaultValue: false }),
          name: TextInput({ label: 'Name (custom tiles only)' }),
        },
      }),
      getItemLabel(item) {
        const option = CATEGORY_OPTIONS.find(({ value }) => value === item?.category);

        if (item?.category === CUSTOM_CATEGORY) return item.name || 'Custom tile';

        return option?.label ?? item?.name ?? 'Category';
      },
    }),
    tint: Checkbox({ label: 'Tinted background', defaultValue: false }),
  },
});
