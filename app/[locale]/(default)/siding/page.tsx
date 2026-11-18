import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import {
  CategoryHero,
  CategoryPoints,
  SubcategoryTiles,
} from '@/vibes/soul/sections/category-hero';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { CODE_PAGE_HERO_IMAGES } from '~/lib/category/category-content';
import { submitQuoteLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Siding',
  description:
    'Vinyl clapboard, Dutch lap, board and batten and shake, new at Express Kitchens. Quoted by the square; tell us the elevation and we price it.',
};

const FIELDS: Array<Field | Field[]> = [
  [
    { type: 'text', name: 'name', label: 'Your name', required: true },
    { type: 'email', name: 'email', label: 'Email', required: true },
  ],
  [
    { type: 'tel', name: 'phone', label: 'Phone', required: true },
    { type: 'text', name: 'zip', label: 'ZIP code', required: true },
  ],
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

const COLOURS = [
  { name: 'White', slug: 'white' },
  { name: 'Gray', slug: 'gray' },
  { name: 'Sand', slug: 'sand' },
  { name: 'Charcoal', slug: 'charcoal' },
  { name: 'Cedar', slug: 'cedar' },
  { name: 'Navy', slug: 'navy' },
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
        description="Vinyl clapboard, Dutch lap, board and batten and shake, quoted by the square from your elevation."
        image={CODE_PAGE_HERO_IMAGES.siding}
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
          {
            name: 'Clapboard',
            href: '#quote',
            image: {
              src: '/images/pages/siding/clapboard.jpg',
              alt: 'Clapboard vinyl siding, close up',
            },
          },
          {
            name: 'Dutch lap',
            href: '#quote',
            image: {
              src: '/images/pages/siding/dutch-lap.jpg',
              alt: 'Dutch lap vinyl siding, close up',
            },
          },
          {
            name: 'Board & batten',
            href: '#quote',
            image: {
              src: '/images/pages/siding/board-and-batten.jpg',
              alt: 'Board & batten vinyl siding, close up',
            },
          },
          {
            name: 'Shake',
            href: '#quote',
            image: { src: '/images/pages/siding/shake.jpg', alt: 'Shake vinyl siding, close up' },
          },
          {
            name: 'Trim & accessories',
            href: '#quote',
            image: {
              src: '/images/pages/siding/trim.jpg',
              alt: 'Trim & accessories vinyl siding, close up',
            },
          },
        ]}
        title="Shop by siding type"
      />
      {/* Swatches are the clapboard texture tinted to each stock colour (scripts: PIL colorize),
          stand-ins until EK supplies manufacturer swatches. */}
      <SubcategoryTiles
        items={COLOURS.map(({ name, slug }) => ({
          name,
          href: '#quote',
          image: {
            src: `/images/pages/siding/colour-${slug}.jpg`,
            alt: `${name} clapboard vinyl siding, close up`,
          },
        }))}
        title="Shop by colour"
      />
      <LeadFormCard
        action={submitQuoteLead}
        description="A rough size is fine; we confirm quantities before anything ships."
        fields={FIELDS}
        id="quote"
        image={{
          src: '/images/pages/siding/quote-building.jpg',
          alt: 'Looking up a building clad in grey corrugated metal siding with large windows, against a blue sky',
        }}
        kicker="Get a siding quote"
        submitLabel="Request my quote"
        title="Tell us about the house"
      />
    </>
  );
}
