import {
  Checkbox,
  Group,
  Link,
  List,
  Number,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSReviewCarousel } from './client';

runtime.registerComponent(MSReviewCarousel, {
  type: 'home-review-carousel',
  label: 'Home / Review Carousel',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({ label: 'Title', defaultValue: 'What it was like, in their words' }),
    summary: TextInput({ label: 'Summary line', defaultValue: '4.5 · 360+ Google reviews' }),
    reviews: List({
      label: 'Reviews',
      type: Group({
        label: 'Review',
        props: {
          stars: Number({ label: 'Stars (1–5)', defaultValue: 5 }),
          quote: TextArea({ label: 'Quote', defaultValue: '' }),
          name: TextInput({ label: 'Name', defaultValue: '' }),
          location: TextInput({ label: 'Town / showroom', defaultValue: '' }),
          source: TextInput({ label: 'Source', defaultValue: 'Google' }),
        },
      }),
      getItemLabel(review) {
        return review?.name || 'Review';
      },
    }),
    actionLabel: TextInput({ label: 'Button text', defaultValue: 'Read all reviews' }),
    actionLink: Link({ label: 'Button link' }),
    tint: Checkbox({ label: 'Tinted background', defaultValue: true }),
    layout: Select({
      label: 'Layout',
      options: [
        { value: 'marquee', label: 'Three drifting columns (pause on hover)' },
        { value: 'carousel', label: 'Row carousel' },
      ],
      defaultValue: 'marquee',
    }),
  },
});
