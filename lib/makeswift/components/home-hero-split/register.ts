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

import { HERO_SPLIT_TYPE } from '../section-types';

import { MSHomeHeroSplit } from './client';

// Button colors — chosen per slide/offer to suit whatever background marketing sets.
const CTA_COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
] as const;

runtime.registerComponent(MSHomeHeroSplit, {
  type: HERO_SPLIT_TYPE,
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
            defaultValue: 'red',
          }),
          textPosition: Select({
            label: 'Text position',
            options: [
              { label: 'Bottom (headline left, button right)', value: 'bottom' },
              { label: 'Top (headline and button top-left)', value: 'top' },
            ],
            defaultValue: 'bottom',
          }),
          imagePosition: Select({
            label: 'Photo anchor (when cropped)',
            options: [
              { label: 'Centre', value: 'center' },
              { label: 'Left', value: 'left' },
              { label: 'Right', value: 'right' },
            ],
            defaultValue: 'center',
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
          kicker: TextInput({ label: 'Kicker', defaultValue: 'Kitchens @$299/month' }),
          headline: TextArea({
            label: 'Headline (one line per row)',
            defaultValue: 'FREE APPLIANCE\nwith every kitchen',
          }),
          description: TextArea({
            label: 'Description',
            defaultValue: '+ up to 4 Bonus gifts: Roll-out trays, organizers, handle, faucet',
          }),
          imageSrc: Image({ label: 'Photo (optional; bake in any darkening the text needs)' }),
          imageAlt: TextInput({ label: 'Photo alt text', defaultValue: 'Offer' }),
          link: Link({ label: 'Link' }),
          showCta: Checkbox({ label: 'Show button', defaultValue: true }),
          ctaLabel: TextInput({ label: 'Button text', defaultValue: 'View offer' }),
          ctaColor: Select({
            label: 'Button color',
            options: CTA_COLOR_OPTIONS,
            defaultValue: 'white',
          }),
        },
      }),
      getItemLabel(offer) {
        return offer?.kicker || 'Offer';
      },
    }),
    slideInterval: Number({ label: 'Photo rotation', defaultValue: 6, suffix: 's' }),
  },
});
