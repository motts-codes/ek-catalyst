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

import { MSHomeHeroSplit } from './client';

// Button colors — chosen per slide/offer to suit whatever background marketing sets.
const CTA_COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
] as const;

runtime.registerComponent(MSHomeHeroSplit, {
  type: 'home-hero-split',
  label: 'Home / Hero Split',
  icon: 'carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Photo slides (left)',
      type: Group({
        label: 'Slide',
        props: {
          title: TextArea({
            label: 'Headline (one line per row)',
            defaultValue: 'Your whole kitchen.\nMade in Connecticut.',
          }),
          imageSrc: Image({ label: 'Photo' }),
          imageAlt: TextInput({ label: 'Photo alt text', defaultValue: 'Kitchen' }),
          link: Link({ label: 'Link' }),
          showCta: Checkbox({ label: 'Show button', defaultValue: true }),
          ctaLabel: TextInput({ label: 'Button text', defaultValue: 'Shop now' }),
          ctaColor: Select({
            label: 'Button color',
            options: CTA_COLOR_OPTIONS,
            defaultValue: 'white',
          }),
        },
      }),
      getItemLabel(slide) {
        return slide?.title.split('\n')[0] || 'Slide';
      },
    }),
    offers: List({
      label: 'Offer cards (right)',
      type: Group({
        label: 'Offer',
        props: {
          kicker: TextInput({ label: 'Kicker', defaultValue: 'Replacement windows' }),
          headline: TextInput({
            label: 'Headline',
            defaultValue: '$179.99 any size up to 101 united inches',
          }),
          description: TextArea({ label: 'Description', defaultValue: 'Pick up from Bristol.' }),
          link: Link({ label: 'Link' }),
          showCta: Checkbox({ label: 'Show button', defaultValue: true }),
          ctaLabel: TextInput({ label: 'Button text', defaultValue: 'See the offer' }),
          ctaColor: Select({
            label: 'Button color',
            options: CTA_COLOR_OPTIONS,
            defaultValue: 'red',
          }),
        },
      }),
      getItemLabel(offer) {
        return offer?.kicker || 'Offer';
      },
    }),
    slideInterval: Number({ label: 'Photo rotation', defaultValue: 15, suffix: 's' }),
    offerInterval: Number({ label: 'Offer rotation', defaultValue: 8, suffix: 's' }),
  },
});
