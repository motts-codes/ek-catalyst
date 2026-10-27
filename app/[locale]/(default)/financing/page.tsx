import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import {
  FinePrint,
  PageBreadcrumbs,
  PageHero,
  SplitCardGrid,
  StepsRow,
} from '@/vibes/soul/sections/page-kit';
import { Image } from '~/components/image';
import { FREE_DESIGN_HREF } from '~/lib/home/home-content';
import { FINANCING_PLANS, monthlyExample } from '~/lib/pages/financing';

export const metadata: Metadata = {
  title: 'Kitchen Financing through GreenSky',
  description:
    'Spread the cost of your kitchen with GreenSky financing: fixed rates from 9.99% APR, promo plans that waive interest, terms up to 180 months. Apply in any Express Kitchens showroom.',
};

const SHOWROOMS_HREF = '/showrooms';

// Financing per EK's policy (Arun's brief of 27 Oct 2026): no 0% plan, no online financing, no
// rate check. Four GreenSky plans, applied for in a showroom with a designer. The full GreenSky
// disclosure (lender names) is still to come; until then one line: subject to credit approval.
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
        actions={[{ label: 'Find a showroom', href: SHOWROOMS_HREF, primary: true }]}
        actionsAside={
          <Image
            alt="GreenSky"
            className="h-9 w-auto"
            height={152}
            src="/images/pages/financing/greensky-logo.png"
            width={565}
          />
        }
        chipStyle="checks"
        chips={[
          'Fixed rates from 9.99% APR',
          'Promo plans that waive interest',
          'Terms up to 180 months',
          'About 20% deposit',
        ]}
        description="Spread the cost of your kitchen with financing through GreenSky. Apply in any Express Kitchens showroom, and your designer will help you pick the plan that fits your budget."
        image={{
          src: '/images/pages/financing/hero-couple-cabinets-3.jpg',
          alt: 'A couple holding white cabinet drawers above a base cabinet, a red piggy bank at their feet',
        }}
        imageStyle="plain"
        kicker="Financing"
        note="Financing is available in our showrooms only. It isn't available on online orders or at our Factory Outlet."
        title="Pay for your kitchen over time"
      />
      <SplitCardGrid
        cards={FINANCING_PLANS.map((plan) => ({
          title: plan.title,
          meta: monthlyExample(plan),
          description: `${plan.what} Plan ${plan.plan}.`,
        }))}
        description="Plans start with a deposit of about 20%, and you finance the rest. Monthly examples are for $10,000 financed (for example, a $12,500 kitchen with a 20% deposit). Your designer will show you the exact figures for your order."
        footnote="*Once you're approved, you have 6 months to use your credit line, so you can plan your kitchen without rushing. Subject to credit approval by GreenSky."
        kicker="The plans"
        tint
        title="Four ways to pay"
      />
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
            description:
              'Pay a deposit of about 20%, and your designer helps you apply with GreenSky for the rest and choose a plan.',
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
              q: 'Do I need a deposit?',
              a: 'Yes, about 20% of your order. The rest is financed over the plan you choose.',
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
      <FinePrint variant="plain">Financing subject to credit approval.</FinePrint>
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
