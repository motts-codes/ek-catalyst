import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs, PageHero, StepsRow } from '@/vibes/soul/sections/page-kit';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { SamplesCallout } from '@/vibes/soul/sections/samples-callout';
import { SHAPES } from '~/lib/estimator/ten-by-ten';
import { contactRows, SHOWROOM_OPTIONS } from '~/lib/forms/fields';
import { submitDesignLead } from '~/lib/forms/submit-lead';
import { HOME_REVIEWS, SAMPLES_HREF } from '~/lib/home/home-content';
import { getAudienceMode } from '~/lib/navigation/audience-mode';

export const metadata: Metadata = {
  title: 'Free Kitchen Design Consult',
  description:
    'A designer plans your kitchen with you: a layout for your room, every cabinet priced RTA and assembled, and a ship date. Free, no deposit, no obligation.',
};

// Arun's brief of 27 Oct 2026. To confirm with EK: that design changes are free and unlimited,
// how soon the first design arrives (the measuring guide says about 2 business days), home
// visits (removed until confirmed) and the one review figure used across the site.
const HOW_IT_WORKS = [
  {
    title: 'We call you.',
    description:
      "Within 1 business day, a designer calls to set up a day, a time and how you'd like to meet.",
  },
  {
    title: 'You plan it together.',
    description:
      'In a showroom or on a video call, usually 60–90 minutes. Bring a photo, rough measurements, or just an idea.',
  },
  {
    title: 'You get your design and price.',
    description:
      "A 3D layout of your kitchen with an itemized price, RTA or assembled. Changes are free until it's right.",
  },
];

const FIELDS: Array<Field | Field[]> = [
  ...contactRows(),
  {
    type: 'picture-radio-group',
    name: 'layout',
    label: 'Your layout, if you know it',
    columns: 5,
    options: [
      ...SHAPES.map((shape) => ({
        value: shape.id,
        label: shape.label,
        image: { src: shape.image.src, alt: '' },
      })),
      { value: 'unsure', label: 'Not sure yet' },
    ],
  },
  {
    type: 'radio-group',
    name: 'island',
    label: 'Do you want an island?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not sure', value: 'unsure' },
    ],
  },
  {
    type: 'radio-group',
    name: 'timing',
    label: 'When would you like to start?',
    options: [
      { label: 'This month', value: 'now' },
      { label: 'In one to three months', value: 'soon' },
      { label: 'Later', value: 'later' },
    ],
  },
  {
    type: 'select',
    name: 'budget',
    label: 'Budget, if you have one in mind',
    options: [
      { label: "I'd rather not say", value: 'na' },
      { label: 'Under $5,000', value: 'lt5' },
      { label: '$5,000 – $10,000', value: '5-10' },
      { label: '$10,000 – $20,000', value: '10-20' },
      { label: 'Over $20,000', value: 'gt20' },
    ],
  },
  {
    type: 'textarea',
    name: 'notes',
    label: "Anything else you'd like the designer to know?",
    placeholder: 'Your style, appliances you’re keeping, a link to a kitchen you love…',
  },
  {
    type: 'radio-group',
    name: 'format',
    label: 'How would you like to meet?',
    required: true,
    options: [
      { label: 'Virtual video call', value: 'video' },
      { label: 'Showroom', value: 'showroom' },
    ],
  },
  { type: 'select', name: 'showroom', label: 'Nearest showroom', options: SHOWROOM_OPTIONS },
  {
    type: 'checkbox-group',
    name: 'days',
    label: 'Days that suit you',
    options: [
      { label: 'Weekdays', value: 'weekdays' },
      { label: 'Saturday', value: 'saturday' },
    ],
  },
  {
    type: 'radio-group',
    name: 'time',
    label: 'Time of day',
    options: [
      { label: 'Morning', value: 'am' },
      { label: 'Afternoon', value: 'pm' },
      { label: 'Evening', value: 'eve' },
    ],
  },
];

const PRO_FIELDS: Array<Field | Field[]> = [
  ...contactRows(),
  { type: 'text', name: 'company', label: 'Company', required: true },
  ...FIELDS.slice(contactRows().length),
];

// The design consult request: hero, a compact "how it works" row, then the form second on the
// page (photo left, like the countertop quote) in four steps (your kitchen, details, how to
// meet, about you) so nobody faces every field at once; then what to bring, reviews, samples.
// Kitchens only: EK's consults are kitchen remodels, so there's no "which rooms" question.
export default async function FreeDesign({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const audience = await getAudienceMode();
  const pro = audience === 'pro';

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          {
            label: pro ? 'Free design & quote' : 'Free design consult',
            href: '/mykitchen/free-design-consult',
          },
        ]}
      />
      <PageHero
        actions={[{ label: 'Book my free consult', href: '#request', primary: true }]}
        chipStyle="checks"
        chips={['A full layout', 'An itemized price', 'A ship date', 'Free, no obligation']}
        description={
          pro
            ? 'Send us the job and a designer will lay it out, price every cabinet both ways, and give you a ship date you can put in front of your client. No charge, no deposit. Ask about special pricing for contractors.'
            : "Tell us a little about your kitchen and a designer will plan it with you: a layout drawn for your room, every cabinet priced both ways (RTA and assembled), and a ship date you can plan around. Meet in one of our showrooms, or on a video call from anywhere we ship. It's free, there's no deposit, and the plan is yours to keep whether you buy from us or not."
        }
        image={{
          src: '/images/pages/design-consult/hero-designer-couple.jpg',
          alt: 'A designer in a red top drawing a kitchen plan at a table with a smiling couple, door samples beside them',
        }}
        imageStyle="plain"
        kicker={pro ? 'Free design and quote for the trade' : 'Free design consult'}
        title={pro ? 'We design it. You win the job.' : 'Plan your kitchen with a designer, free'}
      />
      <StepsRow className="bg-[#fdf3f5]" steps={HOW_IT_WORKS} title="How it works" />
      <LeadFormCard
        action={submitDesignLead}
        description="Two minutes. Only how you'd like to meet and your contact details are required."
        fields={pro ? PRO_FIELDS : FIELDS}
        fine={
          <>
            A designer will call you within 1 business day. You&apos;ll talk to a real designer, not
            a call center. No deposit, no obligation.
          </>
        }
        id="request"
        image={{
          src: '/images/pages/design-consult/form-kitchen-island.jpg',
          alt: 'A modern kitchen with a white quartz island, two stools and light oak cabinets',
        }}
        kicker="Request your consult"
        steps={[
          { title: 'Your kitchen', names: ['layout', 'island'] },
          { title: 'Details', names: ['timing', 'budget', 'notes'] },
          { title: 'How to meet', names: ['format', 'showroom', 'days', 'time'] },
          { title: 'About you', names: ['name', 'email', 'phone', 'zip', 'company'] },
        ]}
        submitLabel="Request my free consult"
        title="Tell us about your kitchen"
      />
      <CardsRow
        cards={[
          {
            title: 'Bring a photo',
            description:
              'Any angle, from your phone. It tells your designer more about your room than a sketch can.',
            image: {
              src: '/images/pages/design-consult/phone-photo.jpg',
              alt: 'A hand photographing a kitchen with a phone',
            },
            imageLabel: 'A phone photo of a kitchen',
          },
          {
            title: 'Rough wall lengths',
            description: 'Corner to corner with a tape measure. Twenty minutes, and rough is fine.',
            ctaLabel: 'How to measure',
            href: '/resources/measuring-guide',
            image: {
              src: '/images/pages/design-consult/tape-measure-wall.jpg',
              alt: 'A tape measure stretched along a kitchen wall',
            },
            imageLabel: 'A tape measure along a wall',
          },
          {
            title: 'Or just bring an idea',
            description:
              "A screenshot, a color, a kitchen you liked. That's a good place to start.",
            image: {
              src: '/images/pages/design-consult/saved-screenshots.jpg',
              alt: 'A phone showing saved kitchen photos',
            },
            imageLabel: 'Saved kitchen screenshots on a phone',
          },
        ]}
        imageStyle="plain"
        kicker="Before you meet"
        title="Three things that help (all optional)"
      />
      <ReviewMarquee
        reviews={HOME_REVIEWS}
        summary="4.5 · 360+ Google reviews"
        tint
        title="What other people said about their consult"
      />
      <HomeSection compact>
        <SamplesCallout
          cta={{ label: 'Order free samples', href: SAMPLES_HREF }}
          description="Your first two door samples are free with the code FREESAMPLES. Order now and they'll arrive before your consult."
          video={{
            webm: '/images/home/samples/samples.webm',
            mp4: '/images/home/samples/samples.mp4',
            poster: '/images/home/samples/samples-poster.jpg',
          }}
        />
      </HomeSection>
    </>
  );
}
