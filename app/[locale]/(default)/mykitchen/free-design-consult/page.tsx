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
    'A designer goes through your kitchen with you and gives you an itemized quote, priced RTA and assembled. In a showroom or on a video call from any state. Free, no deposit, no obligation.',
};

// Arun's brief of 27 Oct 2026 (revised the same day: quote-led copy, same-day reply, the $85
// Connecticut measuring visit). To confirm with EK: the one review figure used across the site.
const HOW_IT_WORKS = [
  {
    title: 'We get back to you the same day.',
    description: "A designer contacts you to set up a time and how you'd like to meet.",
  },
  {
    title: 'You go through it together.',
    description:
      'In a showroom (walk-ins welcome) or on a video call, weekdays 9 AM–5 PM ET. Bring a photo, your measurements, or just an idea.',
  },
  {
    title: 'You get your quote.',
    description:
      'An itemized price for your kitchen, RTA or assembled, so you know exactly what it costs before you order.',
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
      { label: 'In a showroom: see the displays and leave with a quote', value: 'showroom' },
      {
        label:
          'On a video call (9 AM–5 PM ET): send photos and measurements, and go through it on screen',
        value: 'video',
      },
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
        chips={[
          'An itemized quote',
          'Priced RTA and assembled',
          'Video consults in every state',
          'Free, no obligation',
        ]}
        description={
          pro
            ? 'Send us your plans or measurements and a designer will price every cabinet, RTA and assembled, so you can put a number in front of your client. No charge, no deposit. Ask about special pricing for contractors.'
            : "Tell us about your kitchen and a designer will go through it with you: the style, the cabinets your room needs, and an itemized quote, priced both RTA and assembled. Meet in one of our showrooms, or on a video call from any state. It's free, with no deposit and no obligation to buy."
        }
        image={{
          src: '/images/pages/design-consult/hero-designer-couple-3.jpg',
          alt: 'A designer in a red top drawing a kitchen plan at a table with a smiling couple, door samples beside them',
        }}
        imageStyle="plain"
        kicker={pro ? 'Free quote for the trade' : 'Free design consult'}
        title={
          pro
            ? "Send us the job. We'll price it."
            : 'Plan and price your kitchen with a designer, free'
        }
      />
      <StepsRow className="bg-[#fdf3f5]" steps={HOW_IT_WORKS} title="How it works" />
      <LeadFormCard
        action={submitDesignLead}
        description="Two minutes. Only how you'd like to meet and your contact details are required."
        fields={pro ? PRO_FIELDS : FIELDS}
        fine={
          <>
            We&apos;ll get back to you the same day. You&apos;ll talk to a real designer, not a call
            center. No deposit, no obligation. Prefer to call? Call or text 860-247-1000, any time.
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
            title: 'Your measurements',
            description:
              'Wall lengths corner to corner, plus windows, doors and appliances. The more accurate they are, the more accurate your quote.',
            ctaLabel: 'How to measure',
            href: '/resources/measuring-guide',
            image: {
              src: '/images/book/measure.webp',
              alt: 'A tape measure held along a wall, a sketch on a notepad below',
            },
          },
          {
            title: 'In Connecticut? We can measure for you',
            description:
              "For $85, in CT and greater-CT zip codes, we'll measure your kitchen after your showroom visit, so your quote is exact. The fee is separate from your order.",
            image: {
              src: '/images/pages/measuring/tape-across-wall.jpg',
              alt: 'A tape measure across an empty kitchen wall',
            },
          },
          {
            title: 'A photo of the room',
            description: "Any angle, from your phone. It shows your designer what numbers can't.",
            image: {
              src: '/images/book/photo.webp',
              alt: 'Someone photographing their current kitchen on a phone',
            },
          },
          {
            title: "Ideas you've saved",
            description: "A screenshot, a color, a kitchen you liked. It's a good starting point.",
            image: {
              src: '/images/book/inspiration.webp',
              alt: 'A phone showing a grid of saved kitchen photos',
            },
          },
        ]}
        columns={4}
        imageStyle="plain"
        kicker="Before you meet"
        title="What helps us quote accurately"
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
