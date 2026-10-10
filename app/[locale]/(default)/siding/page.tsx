import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import {
  CategoryHero,
  CategoryPoints,
  SubcategoryTiles,
} from '@/vibes/soul/sections/category-hero';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { FormCard, PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { submitQuoteLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Siding',
  description:
    'Vinyl clapboard, Dutch lap, board and batten and shake, new at Express Kitchens. Quoted by the square; tell us the elevation and we price it.',
};

const FIELDS: Field[] = [
  { type: 'text', name: 'name', label: 'Your name', required: true },
  { type: 'email', name: 'email', label: 'Email', required: true },
  { type: 'text', name: 'phone', label: 'Phone', required: true },
  { type: 'text', name: 'zip', label: 'ZIP code', required: true },
  {
    type: 'select',
    name: 'type',
    label: 'Siding type',
    options: [
      { label: 'Clapboard', value: 'clapboard' },
      { label: 'Dutch lap', value: 'dutch-lap' },
      { label: 'Board and batten', value: 'board-batten' },
      { label: 'Shake', value: 'shake' },
      { label: 'Not sure yet', value: 'unsure' },
    ],
  },
  { type: 'text', name: 'squares', label: 'Approximate squares, or the house size' },
  { type: 'textarea', name: 'notes', label: 'Colour, timing, anything else' },
];

export default async function Siding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Building Materials', href: '#' },
          { label: 'Siding', href: '/siding' },
        ]}
      />
      <CategoryHero
        actions={[{ label: 'Get a siding quote', href: '#quote' }]}
        description="Siding is new at Express Kitchens: vinyl clapboard, Dutch lap, board and batten and shake, in the colours people actually ask for. It's quoted by the square, so tell us the elevation or the house size and we'll price it within 24 hours, with a free elevation review if you'd like a second pair of eyes on the quantities."
        imageLabel="Clapboard siding on a house, close"
        title="Siding"
      />
      <CategoryPoints
        fine="Lead times to be confirmed."
        points={[
          { icon: 'clock', label: 'Quote back within 24 hours' },
          { icon: 'stock', label: 'Stock colours ready in [X] days' },
          { icon: 'returns', label: 'Free elevation review' },
        ]}
      />
      <SubcategoryTiles
        items={[
          { name: 'Clapboard', href: '#quote' },
          { name: 'Dutch lap', href: '#quote' },
          { name: 'Board & batten', href: '#quote' },
          { name: 'Shake', href: '#quote' },
          { name: 'Trim & accessories', href: '#quote' },
        ]}
        title="Shop by siding type"
      />
      <SubcategoryTiles
        items={['White', 'Gray', 'Sand', 'Charcoal', 'Cedar', 'Navy'].map((name) => ({
          name,
          href: '#quote',
        }))}
        title="Shop by colour"
      />
      <HomeSection
        description="A rough size is fine; we confirm quantities before anything ships."
        id="quote"
        kicker="Get a siding quote"
        tint
        title="Tell us about the house"
      >
        <FormCard>
          <DynamicFormSection
            action={submitQuoteLead}
            fields={FIELDS}
            submitLabel="Request my quote"
          />
        </FormCard>
      </HomeSection>
    </>
  );
}
