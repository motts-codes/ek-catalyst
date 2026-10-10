import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { FormCard, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { submitCareersLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Careers at Express Kitchens',
  description:
    'Build a career making kitchens people live in. Showrooms, factory, countertops, delivery and office roles across Connecticut.',
};

const FIELDS: Field[] = [
  { type: 'text', name: 'name', label: 'Your name', required: true },
  { type: 'email', name: 'email', label: 'Email', required: true },
  { type: 'text', name: 'phone', label: 'Phone' },
  {
    type: 'select',
    name: 'team',
    label: 'The team you are interested in',
    options: [
      { label: 'Showroom & design', value: 'showroom' },
      { label: 'Factory', value: 'factory' },
      { label: 'Warehouse & delivery', value: 'delivery' },
      { label: 'Countertops', value: 'countertops' },
      { label: 'Office', value: 'office' },
    ],
  },
  {
    type: 'textarea',
    name: 'about',
    label: 'A few lines about you, and a link to your résumé if you have one online',
    required: true,
  },
];

const ROLES: string[][] = [
  ['!Project Manager & Design Consultant', 'Showroom & design', 'Orange', 'Full-time'],
  ['!Cabinet Assembler', 'Factory', 'Bristol', 'Full-time · 2 shifts'],
  ['!CNC Operator', 'Factory', 'Bristol', 'Full-time'],
  ['!Stone Fabricator / Polisher', 'Countertops', 'Hartford', 'Full-time'],
  ['!Delivery Driver — CDL B', 'Warehouse & delivery', 'Bristol', 'Full-time'],
  ['!Showroom Associate', 'Showroom & design', 'Stamford', 'Part-time'],
  ['!Trade Account Manager', 'Office', 'Hartford', 'Full-time'],
];

export default async function Careers({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Careers', href: '/careers' }]} />
      <PageHero
        actions={[
          { label: 'See open roles', href: '#roles', primary: true },
          { label: 'Send us your details', href: '#apply' },
        ]}
        description="Every job here touches a real kitchen that a family will cook in for the next twenty years. We design kitchens with people in six showrooms, build the cabinets in our own Bristol factory, cut the countertops in Hartford and deliver it all ourselves, and we've been doing it in Connecticut since 1916. If you'd like work you can point to, this is it."
        imageLabel="The team on the factory floor"
        kicker="Careers"
        title="Build a career making kitchens people live in"
      />
      <div id="roles" />
      <DeliveryLadder
        columns={['Role', 'Team', 'Location', 'Type']}
        description="To apply for any of these, send us your details below and tell us which role you mean. We hire for the showrooms and the factory all year, so if nothing here fits, send your details anyway."
        rows={ROLES}
        tint
        title="Open roles"
      />
      <CardsRow
        cards={[
          {
            title: 'You can see what you made',
            description:
              "Design it, build it, cut it or deliver it; the kitchen ends up in a family's home in Connecticut, and you can drive past it.",
            imageLabel: 'A delivery crew at a finished kitchen',
          },
          {
            title: 'Family-owned since 1989',
            description:
              "The Kothari family runs the company. Decisions are made here, by people you'll meet, not in another state.",
            imageLabel: 'The Kothari family on the shop floor',
          },
          {
            title: 'Learn the whole trade',
            description:
              'Showroom staff spend time in the factory and factory staff see the showrooms. Most Project Managers started somewhere else in the building.',
            imageLabel: 'A showroom associate at the factory line',
          },
          {
            title: 'Stable, and growing',
            description:
              '110 years, six showrooms, a new factory line and a new range of windows and doors. Steady work with room to move up.',
            imageLabel: 'The new robotic line',
          },
          {
            title: 'Local',
            description:
              'Every job is in Connecticut. No relocation, and no travel unless you want it.',
            imageLabel: 'A Connecticut showroom exterior',
          },
          {
            title: 'Customers who name you',
            description:
              'Read the reviews: customers name the people who helped them more than anything else about us.',
            imageLabel: 'A customer with their Project Manager',
          },
        ]}
        columns={3}
        kicker="Why Express Kitchens"
        title="Four generations. One roof."
      />
      <Prose
        body={[
          'Competitive pay, with performance incentives for showroom and trade roles. Health, dental and vision insurance. A 401(k) with company match (to confirm). Paid time off and company holidays. Employee pricing on cabinets, countertops, appliances and windows. Training on the product, the factory and the design software. And a paid referral bonus when you bring someone good in.',
          "The people who do well here care whether the customer's kitchen turns out right, like learning how things are made, and would rather solve the problem than pass it on.",
        ]}
        kicker="Benefits and perks"
        tint
        title="What you get, and who does well here"
      />
      <HomeSection
        description="Tell us a little about yourself and which team or role interests you. We reply to everyone."
        id="apply"
        kicker="Apply"
        title="Send us your details"
      >
        <FormCard>
          <DynamicFormSection
            action={submitCareersLead}
            fields={FIELDS}
            submitLabel="Send my details"
          />
        </FormCard>
      </HomeSection>
    </>
  );
}
