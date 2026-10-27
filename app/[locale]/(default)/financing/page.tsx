import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { FinePrint, PageBreadcrumbs, PageHero, StepsRow } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF } from '~/lib/home/home-content';
import { FINANCING_PLANS, monthlyExample } from '~/lib/pages/financing';

export const metadata: Metadata = {
  title: 'Kitchen Financing through GreenSky',
  description:
    'Spread the cost of your kitchen with GreenSky financing: fixed rates from 9.99% APR, promo plans that waive interest, terms up to 180 months. Apply in any Express Kitchens showroom.',
};

const SHOWROOMS_HREF = '/showrooms';

// Financing per EK's policy (Arun's brief of 27 Oct 2026): no 0% plan, no online financing, no
// rate check. Four GreenSky plans, applied for in a showroom with a designer. Disclosure text
// still to come from GreenSky / EK.
export default async function Financing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Resources', href: '/resources' },
          { label: 'Financing', href: '/financing' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Find a showroom', href: SHOWROOMS_HREF, primary: true },
          { label: 'Book a free design consult', href: FREE_DESIGN_HREF },
        ]}
        chipStyle="checks"
        chips={[
          'Fixed rates from 9.99% APR',
          'Promo plans that waive interest',
          'Terms up to 180 months',
          'Apply in-store with your designer',
        ]}
        description="Spread the cost of your kitchen with financing through GreenSky. Apply in any Express Kitchens showroom, and your designer will help you pick the plan that fits your budget."
        image={{
          src: '/images/pages/financing/family-kitchen.jpg',
          alt: 'A family at the island of their finished white kitchen',
        }}
        imageLabel="A family in a finished kitchen"
        kicker="Financing"
        note="Financing is available in our showrooms only. It isn't available on online orders or at our Factory Outlet."
        title="Pay for your kitchen over time"
      />
      <CardsRow
        cards={FINANCING_PLANS.map((plan) => ({
          title: plan.title,
          meta: monthlyExample(plan),
          description: `${plan.what} Plan ${plan.plan}.`,
        }))}
        columns={4}
        description="Monthly examples are for a $10,000 kitchen. Your designer will show you the exact figures for your order."
        hideImages
        kicker="The plans"
        tint
        title="Four ways to pay"
      />
      <FinePrint variant="plain">
        Once you&apos;re approved, you have 6 months to use your credit line, so you can plan your
        kitchen without rushing. Subject to credit approval by GreenSky.
      </FinePrint>
      <StepsRow
        className="bg-[#fdf3f5]"
        steps={[
          {
            title: 'Plan your kitchen.',
            description:
              'Visit a showroom, or start on a video call. Your designer prices your kitchen.',
          },
          {
            title: 'Apply in the showroom.',
            description: 'Your designer helps you apply with GreenSky and choose a plan.',
          },
          {
            title: "Order when you're ready.",
            description: "Once you're approved, you have 6 months to use your credit line.",
          },
        ]}
        title="How it works"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about financing',
          items: [
            {
              q: 'Can I finance an online order?',
              a: "No. Financing is available in our showrooms only. If you've planned your kitchen online, bring your quote to a showroom and apply there.",
            },
            {
              q: 'Can I use financing at the Factory Outlet?',
              a: "No. The Factory Outlet isn't a showroom, so financing isn't available there.",
            },
            {
              q: 'Which plan should I choose?',
              a: "If you can pay it all off within 12 or 18 months, a promo plan waives the interest. If you'd rather keep monthly payments low, a fixed-rate plan spreads it over 10 or 15 years. Your designer will compare them for your order.",
            },
            {
              q: 'How long is my approval good for?',
              a: 'You have 6 months from approval to use your credit line.',
            },
            {
              q: 'Why does the estimator show a monthly payment?',
              a: "It's an example based on Plan 1519 (11.99% APR for 180 months), to give you a feel for the monthly cost. Your actual payment depends on the plan you choose and on approval.",
            },
          ],
        }}
      />
      <FinePrint>
        <strong>Disclosures.</strong> Financing for GreenSky® consumer loan programs is provided by
        [lender/bank names]. Subject to credit approval. [Full disclosure text to come from GreenSky
        / Express Kitchens.]
      </FinePrint>
      <ClosingBand
        description="Visit a showroom and your designer will price your kitchen and walk you through the plans."
        primary={{ label: 'Find a showroom', href: SHOWROOMS_HREF }}
        secondary={{ label: 'Book a free design consult', href: FREE_DESIGN_HREF }}
        tint
        title="Ready to talk numbers?"
      />
    </>
  );
}
