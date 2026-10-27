import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { SHOWROOM_OPTIONS } from '~/lib/forms/fields';
import { submitProProgramLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Contractor Program',
  description:
    'Two tiers, real discounts. Silver from your first $5,000 invoice, Diamond at $50,000 a year. Contractor-only support, free design and sales-tax exemption.',
  // Hidden at the client's request (27 Oct 2026): no nav, footer or sitemap links, not indexed.
  robots: { index: false },
};

const FIELDS: Array<Field | Field[]> = [
  [
    { type: 'text', name: 'company', label: 'Company', required: true },
    { type: 'text', name: 'name', label: 'Your name', required: true },
  ],
  [
    { type: 'tel', name: 'phone', label: 'Phone', required: true },
    { type: 'email', name: 'email', label: 'Email', required: true },
  ],
  {
    type: 'text',
    name: 'license',
    label: 'Trade license or resale certificate number',
    required: true,
  },
  { type: 'select', name: 'showroom', label: 'Nearest showroom', options: SHOWROOM_OPTIONS },
];

export default async function ProProgram({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Contractor Program', href: '/pro-program' }]} />
      <PageHero
        actions={[
          { label: 'Join — two-minute form', href: '#join', primary: true },
          { label: 'See the discounts', href: '#tiers' },
        ]}
        description="If you fit kitchens for a living, you should be buying them at a contractor's price from people who know your jobs. The Contractor Program gives you that: Silver from your first $5,000 invoice, Diamond once you reach twenty invoices or $50,000 in a year, and in both tiers a text-enabled support line only contractors have, free design on every job and sales-tax exemption with your form on file. Fill in the two-minute form and your showroom sets the account up."
        image={{
          src: '/images/pages/pro/contractor-will-call.jpg',
          alt: 'A contractor signing for boxed cabinets at the will-call counter',
        }}
        imageLabel="A contractor collecting at will-call"
        kicker="The Contractor Program"
        title="Trade pricing, dates you can quote, and a rep who picks up"
      />
      <CategoryPoints
        points={[
          { icon: 'price', label: '10–15% off in-stock Star cabinets' },
          { icon: 'zap', label: '15–25% off quick-ship' },
          { icon: 'returns', label: 'Measurement fees waived' },
          { icon: 'phone', label: 'Text-enabled support line' },
        ]}
      />
      <div id="tiers" />
      <DeliveryLadder
        columns={['', 'Silver', 'Diamond']}
        description="Measured over the trailing twelve months. You start at Silver on your first qualifying invoice and move up automatically."
        footnote="Discounts apply to in-stock items and cannot be combined with other offers."
        rows={[
          [
            '!To qualify',
            '1 invoice over $5,000 · $5,000 net revenue',
            '20 invoices over $5,000 · $50,000 net revenue',
          ],
          ['!In-stock Star cabinets', '10% off', '15% off'],
          ['!Quick-ship cabinet SKUs', '15% off', '25% off'],
          ['!In-stock sinks, faucets, hardware', '10% off', '15% off'],
          ['!In-stock Star stone', '5% off', '10% off'],
          ['!Sink cut-outs', '10% off', '30% off'],
          ['!Measurement fees', 'Waived', 'Waived'],
          ['!Rush — 10-day SKUs', '50% off the rush fee', 'Rush fee waived'],
          ['!Rush — 5-day SKUs', '—', '50% off the rush fee'],
          ['!Delivery', '25% off', '50% off'],
          ['!Services performed by EK', '5% off', '10% off'],
        ]}
        tint
        title="Silver or Diamond"
      />
      <CardsRow
        cards={[
          {
            title: 'A contractor-only support line',
            description:
              'Text-enabled, and not the retail number. The people on it know your account and your open orders.',
          },
          {
            title: 'Free design and design audits',
            description:
              "We plan the job, or check the plan you already have, and put it under your name if you'd like.",
          },
          {
            title: 'Sales-tax exemption',
            description: 'With your exemption form on file, applied automatically to every order.',
          },
          {
            title: 'Contractor of the Month',
            description:
              'Spotlighted on our social channels. Diamond adds a quarterly Winners Circle prize and the holiday grand-prize raffle.',
          },
        ]}
        columns={4}
        hideImages
        kicker="Both tiers get"
        title="More than a discount"
      />
      <CardsRow
        cards={[
          {
            title: 'Fill in the form',
            description:
              'Two minutes: company, contact, and your trade license or resale certificate number.',
            imageLabel: 'Step 1',
          },
          {
            title: 'Your showroom calls',
            description:
              'Our trade team verifies the license and sets up your account and tax exemption, usually within [X] business days.',
            imageLabel: 'Step 2',
          },
          {
            title: 'Order at your price',
            description:
              "Online or in the showroom. Silver from your first $5,000 invoice; Diamond kicks in automatically. There's no self-serve portal: our trade team is the account, on purpose.",
            imageLabel: 'Step 3',
          },
        ]}
        hideImages
        kicker="How joining works"
        tint
        title="Three steps"
      />
      <LeadFormCard
        action={submitProProgramLead}
        description="You can order at retail pricing while the account is being set up."
        fields={FIELDS}
        id="join"
        kicker="Join"
        submitLabel="Send my application"
        title="Send your application"
      />
    </>
  );
}
