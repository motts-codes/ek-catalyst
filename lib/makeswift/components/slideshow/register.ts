import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSSlideshow } from './client';

runtime.registerComponent(MSSlideshow, {
  type: 'section-slideshow',
  label: 'Sections / Slideshow',
  icon: 'carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Slides',
      type: Group({
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'Slide title' }),
          redTitle: Checkbox({ label: 'Red headline', defaultValue: false }),
          showDescription: Checkbox({ label: 'Show description', defaultValue: true }),
          description: TextArea({ label: 'Description', defaultValue: 'Slide description' }),
          imageSrc: Image(),
          imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Slide image' }),
          showButton: Checkbox({ label: 'Show button', defaultValue: true }),
          buttonText: TextInput({ label: 'Button text', defaultValue: 'Shop all' }),
          buttonLink: Link({ label: 'Button link' }),
          buttonColor: Select({
            label: 'Button color',
            options: [
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'tertiary', label: 'Tertiary' },
              { value: 'ghost', label: 'Ghost' },
            ],
            defaultValue: 'primary',
          }),
          // Optional second button (off by default) — turn on per slide, e.g. only the first.
          showButton2: Checkbox({ label: 'Show 2nd button', defaultValue: false }),
          button2Text: TextInput({ label: '2nd button text', defaultValue: 'Learn more' }),
          button2Link: Link({ label: '2nd button link' }),
          button2Color: Select({
            label: '2nd button color',
            options: [
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'tertiary', label: 'Tertiary' },
              { value: 'ghost', label: 'Ghost' },
            ],
            defaultValue: 'secondary',
          }),
        },
      }),
      getItemLabel(slide) {
        return slide?.title || 'Slide title';
      },
    }),
    autoplay: Checkbox({ label: 'Autoplay', defaultValue: true }),
    interval: Number({ label: 'Duration', defaultValue: 5, suffix: 's' }),
  },
});
