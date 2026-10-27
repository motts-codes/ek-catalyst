import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { contactRows, SHOWROOM_OPTIONS } from '~/lib/forms/fields';
import { submitDesignLead } from '~/lib/forms/submit-lead';
import { HOME_REVIEWS, SAMPLES_HREF } from '~/lib/home/home-content';
import { getAudienceMode } from '~/lib/navigation/audience-mode';

export const metadata: Metadata = {
  title: 'Free Kitchen Design Consult',
  description:
    'A Project Manager plans your kitchen with you, prices every cabinet both ways and gives you a delivery date. Free, no deposit, no obligation.',
};

const FIELDS: Array<Field | Field[]> = [
  ...contactRows(),
  {
    type: 'checkbox-group',
    name: 'rooms',
    label: 'Which rooms are you planning?',
    required: true,
    options: [
      { label: 'Kitchen', value: 'kitchen' },
      { label: 'Bath', value: 'bath' },
      { label: 'Closets', value: 'closets' },
      { label: 'Windows and doors', value: 'windows-doors' },
    ],
  },
  {
    type: 'radio-group',
    name: 'layout',
    label: 'Your layout, if you know it',
    options: [
      { label: 'L-shaped', value: 'l' },
      { label: 'Straight', value: 'straight' },
      { label: 'U-shaped', value: 'u' },
      { label: 'Galley', value: 'galley' },
      { label: 'With an island', value: 'island' },
      { label: "I'm not sure yet", value: 'unsure' },
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
    label: 'Anything else you want the designer to know?',
  },
  {
    type: 'radio-group',
    name: 'format',
    label: 'How would you like to meet?',
    required: true,
    options: [
      {
        label: 'In a showroom — walk the displays and leave with a plan and a price',
        value: 'showroom',
      },
      {
        label: 'At my home — the designer measures and plans in your kitchen (Connecticut)',
        value: 'home',
      },
      {
        label: 'On a video call — send photos and measurements first, plan it on screen',
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

// The design consult request: who you are, what you're planning, how you'd like to meet. One
// form rather than the wireframe's three steps, so nothing is hidden behind a Next button.
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
        actions={[{ label: 'Book my consult', href: '#request', primary: true }]}
        chips={['A full layout', 'An itemized quote', 'A delivery date', 'Free, no obligation']}
        description={
          pro
            ? "Send us the job and a designer will lay it out, price every cabinet both ways and give you a delivery date you can put in front of your client — under your name if you want it. You close the job; we supply it. There's no charge and no deposit."
            : "Tell us a little about your kitchen and a Project Manager will plan it with you: a layout drawn for your room, every cabinet priced both ways, and a delivery date you can plan around. It's free, there's no deposit, and you keep the plan whether you buy from us or not. Meet in a showroom, at your home or on a call — whichever is easier for you."
        }
        image={{
          src: '/images/pages/design-consult/plan-and-quote.jpg',
          alt: 'A printed kitchen plan and quote on a table',
        }}
        imageLabel="A printed plan and quote on a table"
        kicker={pro ? 'Free design & quote for the trade' : 'Free design consult'}
        title={
          pro
            ? 'We design it. You win the job.'
            : 'Plan your kitchen with someone who does it every day'
        }
      />
      <LeadFormCard
        action={submitDesignLead}
        description="Only your contact details and the rooms are required."
        fields={pro ? PRO_FIELDS : FIELDS}
        fine={
          <>
            A designer will call within one business day to confirm the day, time and format.
            You&apos;ll speak to a designer, not a call center. No deposit, no obligation.
          </>
        }
        id="request"
        kicker="Request your consult"
        submitLabel="Request my free consult"
        title="Tell us about your project"
      />
      <CardsRow
        cards={[
          {
            title: 'Bring a photo',
            description:
              'Any angle, from your phone. It tells the designer more about your room than a sketch ever could.',
            image: {
              src: '/images/pages/design-consult/phone-photo.jpg',
              alt: 'A hand photographing a kitchen with a phone',
            },
            imageLabel: 'A phone photo of a kitchen',
          },
          {
            title: 'Rough wall lengths help',
            description:
              'A tape measure, corner to corner. Twenty minutes of your time, and rough is absolutely fine.',
            image: {
              src: '/images/pages/design-consult/tape-measure-wall.jpg',
              alt: 'A tape measure stretched along a kitchen wall',
            },
            imageLabel: 'A tape measure along a wall',
          },
          {
            title: 'Or bring nothing at all',
            description:
              "If all you have is a feeling about what you want, that's a perfectly good place to start. We'll take it from there.",
            image: {
              src: '/images/pages/design-consult/saved-screenshots.jpg',
              alt: 'A phone showing saved kitchen photos',
            },
            imageLabel: 'Saved kitchen screenshots on a phone',
          },
        ]}
        kicker="Before you meet"
        title="Three things that make the consult even better"
      />
      <ReviewMarquee
        reviews={HOME_REVIEWS}
        summary="4.5 · 360+ Google reviews"
        tint
        title="What the consult was like for other people"
      />
      <HomeSection
        action={{ label: 'Order free samples', href: SAMPLES_HREF }}
        compact
        title="Want to hold a door first?"
      >
        <p className="max-w-2xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
          Your first two quarter-door samples are free with the code FREESAMPLES. Order them now and
          they&apos;ll be with you before your consult.
        </p>
      </HomeSection>
    </>
  );
}
