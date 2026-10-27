import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { contactRows, SHOWROOM_OPTIONS } from '~/lib/forms/fields';
import { submitBookingLead } from '~/lib/forms/submit-lead';
import { getShowroom } from '~/lib/pages/showrooms';

export const metadata: Metadata = {
  title: 'Book a Showroom Appointment',
  description:
    'Pick a showroom, a day and a time, and a Project Manager will plan and price your kitchen with you. About 60–90 minutes, no deposit, no obligation.',
};

// Appointment slots are 90 minutes, from opening to the last slot that finishes by 6 PM.
const TIME_OPTIONS = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'].map(
  (t) => ({ label: `${t} ET`, value: t }),
);

const today = () => new Date().toISOString().slice(0, 10);

function fields(showroom: string | undefined): Array<Field | Field[]> {
  return [
    {
      type: 'select',
      name: 'showroom',
      label: 'Which showroom?',
      required: true,
      options: SHOWROOM_OPTIONS,
      defaultValue: showroom,
    },
    {
      type: 'radio-group',
      name: 'format',
      label: 'Where would you like to meet?',
      required: true,
      options: [
        { label: 'In the showroom', value: 'showroom' },
        { label: 'On a video call', value: 'video' },
      ],
    },
    { type: 'date', name: 'date', label: 'Pick a date', required: true, minDate: today() },
    {
      type: 'select',
      name: 'time',
      label: 'Pick a time (each slot is 90 minutes)',
      required: true,
      options: TIME_OPTIONS,
    },
    ...contactRows(),
    {
      type: 'checkbox-group',
      name: 'rooms',
      label: 'What are you planning?',
      required: true,
      options: [
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Bath', value: 'bath' },
        { label: 'Closets', value: 'closets' },
        { label: 'Windows', value: 'windows' },
      ],
    },
    {
      type: 'textarea',
      name: 'notes',
      label: 'Anything your Project Manager should know?',
    },
  ];
}

// One form in three steps: where (showroom, how you'd like to meet), when (date, time), then your
// details. The showroom is preselected when you arrive from a showroom page.
export default async function Book({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ showroom?: string }>;
}) {
  const [{ locale }, { showroom }] = await Promise.all([params, searchParams]);

  setRequestLocale(locale);

  const chosen = showroom ? getShowroom(showroom) : undefined;

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Showrooms', href: '/showrooms' },
          { label: 'Book an appointment', href: '/book' },
        ]}
      />
      <PageHero
        actions={[{ label: 'Pick a time', href: '#book', primary: true }]}
        chipStyle="checks"
        chips={['60–90 minutes', 'No deposit', 'No obligation', 'Confirmed within two hours']}
        description={
          chosen
            ? `Book time with ${chosen.pm.name.startsWith('[') ? 'the Project Manager' : chosen.pm.name} at our ${chosen.name} showroom. You'll walk the displays together, plan the room and leave with a layout and a price. It takes about an hour and a half, there's no deposit, and you're under no obligation to buy.`
            : "Every showroom has a Project Manager who plans and prices your kitchen with you. Pick the showroom, a day and a time that suit you, and you'll walk the displays together, plan the room and leave with a layout and a price. It takes about an hour and a half, there's no deposit, and you're under no obligation to buy."
        }
        image={{
          src: '/images/book/hero-door-samples-table.jpg',
          alt: 'A designer in a red top and a customer at a table, comparing door samples in white, sage, navy and walnut',
        }}
        imageStyle="plain"
        kicker="Schedule a showroom appointment"
        title={chosen ? `Book a visit to ${chosen.name}` : 'Sit down with a designer, in person'}
      />
      <LeadFormCard
        action={submitBookingLead}
        description="Your Project Manager confirms by text and email within two hours. Times are Eastern."
        fields={fields(chosen?.slug)}
        fine={
          <>
            Showrooms are closed on Sundays, and some on Mondays. If the slot you choose turns out
            to be taken, your Project Manager will offer the nearest one when they confirm.
          </>
        }
        id="book"
        image={{
          src: '/images/showrooms/book.webp',
          alt: 'A showroom aisle between a marble waterfall island and a navy island, display kitchens beyond',
        }}
        kicker="Your appointment"
        spacing="tight"
        steps={[
          { title: 'Where', names: ['showroom', 'format'] },
          { title: 'When', names: ['date', 'time'] },
          { title: 'About you', names: ['name', 'email', 'phone', 'zip', 'rooms', 'notes'] },
        ]}
        submitLabel="Book my appointment"
        title="Pick a day and a time"
      />
      <CardsRow
        cards={[
          {
            title: 'Bring a photo',
            description:
              'Any angle, from your phone. It tells the designer more about your room than a sketch ever could.',
            image: {
              src: '/images/book/photo.webp',
              alt: 'Someone photographing their current kitchen on a phone',
            },
            imageLabel: 'A phone photo of a kitchen',
          },
          {
            title: 'Rough measurements help',
            description:
              'Corner to corner along each wall, and the ceiling height. Rough is absolutely fine; we check everything before you order.',
            image: {
              src: '/images/book/measure.webp',
              alt: 'A tape measure held along a wall, a sketch on a notepad below',
            },
            imageLabel: 'A tape measure along a wall',
          },
          {
            title: 'Or bring nothing at all',
            description:
              "If all you have is a feeling about what you want, that's a perfectly good place to start.",
            image: {
              src: '/images/book/inspiration.webp',
              alt: 'A phone showing a grid of saved kitchen photos',
            },
            imageLabel: 'Saved kitchen screenshots on a phone',
          },
        ]}
        imageStyle="plain"
        kicker="Before you come"
        title="Three things that make the visit better"
      />
    </>
  );
}
