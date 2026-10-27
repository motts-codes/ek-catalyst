import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { FinePrint, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: '0% Financing from $299 a Month',
  description:
    'Buy your kitchen now and pay for it monthly. 0% APR for qualified buyers, a decision in seconds, and checking your rate will not affect your credit score.',
};

const CHECK_RATE_HREF = '#';

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
          { label: 'Check my rate — no credit impact', href: CHECK_RATE_HREF, primary: true },
          { label: 'See what a kitchen costs per month', href: '#monthly' },
        ]}
        chips={[
          '0% APR for qualified buyers',
          'Decision in seconds',
          'No hidden fees, no prepayment penalty',
          'First payment after your order ships',
        ]}
        description="You don't have to wait until you've saved every dollar to have the kitchen you want. With 0% financing from $299 a month, you can order now and spread the cost over a term that suits you, on qualifying orders and subject to approval. Checking your rate takes about two minutes and won't touch your credit score, so there's no risk in finding out. Wherever you see an “as low as” monthly figure on this site, this is where it comes from."
        image={{
          src: '/images/pages/financing/family-kitchen.jpg',
          alt: 'A family at the island of their finished white kitchen',
        }}
        imageLabel="A family in a finished kitchen"
        kicker="0% financing from $299 a month"
        title="Buy the kitchen now. Pay for it monthly."
      />
      <CardsRow
        cards={[
          {
            title: 'Transparent',
            description:
              "You'll see the total you'll pay before you commit, and that number never goes up afterwards.",
          },
          {
            title: 'Simple',
            description:
              "Five pieces of information and you'll have a decision in seconds. It's a soft check, so your credit score isn't affected.",
          },
          {
            title: 'Fair',
            description:
              "No late fees, no hidden fees, and no penalty if you'd like to pay it off early.",
          },
        ]}
        hideImages
        tint
      />
      <CardsRow
        cards={[
          {
            title: 'Check your rate',
            description:
              "Enter a few details and you'll get a real-time decision. It's a soft check only, with no impact on your credit score.",
            imageLabel: 'Step 1',
          },
          {
            title: 'Choose your plan',
            description:
              'Pick the term that fits your budget, from [X] to [X] months, with 0% APR options for qualified buyers.',
            imageLabel: 'Step 2',
          },
          {
            title: 'Order your kitchen',
            description:
              "Check out as you normally would. Your first payment isn't due until after your order ships.",
            imageLabel: 'Step 3',
          },
        ]}
        hideImages
        kicker="How it works"
        title="Three steps, and the kitchen is yours"
      />
      <DeliveryLadder
        columns={[
          'Kitchen price',
          '12 months · 0% APR',
          '24 months · 0% APR',
          '48 months · [X]% APR',
        ]}
        description="These are real kitchen prices rather than a $1,000 example. Your own figure will depend on approval, the term you choose and the APR, so treat these as a guide: the exact payment is shown before you commit."
        footnote="Examples only. Loan maximum $[X]. The exact payment is shown before you commit."
        rows={[
          ['!$5,000', '$417 / mo', '$208 / mo', '$[X] / mo'],
          ['!$9,000', '$750 / mo', '$375 / mo', '$[X] / mo'],
          ['!$15,000', '$1,250 / mo', '$625 / mo', '$[X] / mo'],
          ['!$25,000', '$2,083 / mo', '$1,042 / mo', '$[X] / mo'],
        ]}
        tint
        title="What a kitchen costs per month"
      />
      <CardsRow
        cards={[
          {
            title: 'Keep your savings where they are',
            description:
              'Remodels have a way of turning up surprises — a floor, a wall, a pipe. Keeping cash in hand while you spread the cost of the cabinets is the safe way to do it.',
          },
          {
            title: '0% APR options',
            description:
              'For qualified buyers, the kitchen costs exactly the same spread over [X] months as it does paid up front. You simply pay it in pieces.',
          },
          {
            title: 'Pay it off whenever you like',
            description:
              "There's no penalty for paying early. Clear it when a bonus lands or the sale goes through, and keep the interest.",
          },
          {
            title: 'At your own pace',
            description:
              'Terms from [X] to [X] months, with the monthly figure fixed from day one, so you always know where you stand.',
          },
        ]}
        columns={4}
        hideImages
        kicker="Why finance a kitchen?"
        title="A few good reasons"
      />
      <CabinetFaq
        data={{
          headline: 'Questions people ask about financing',
          items: [
            {
              q: 'Does checking my rate affect my credit score?',
              a: 'No. Checking your rate is a soft check and has no impact on your score. A hard check happens only if you accept a plan.',
            },
            {
              q: 'What do I need to apply?',
              a: "Your name, address, date of birth, phone number and the last four digits of your Social Security number. It's a soft check, so nothing is reported unless you go ahead.",
            },
            {
              q: 'When is my first payment?',
              a: "After your order ships. You aren't paying for a kitchen you don't have yet.",
            },
            { q: 'Can I pay it off early?', a: 'Yes, at any time, with no penalty.' },
            {
              q: 'Can I return something I financed?',
              a: 'Yes. The normal returns policy applies, and the refund goes back against your plan.',
            },
            {
              q: "I'm a contractor. Is there something for trade accounts?",
              a: 'Yes. Pro Program members can ask their trade rep about account terms; see the Pro Program page.',
            },
          ],
        }}
      />
      <FinePrint>
        <strong>Disclosures.</strong> [Required lender disclosure — APR range, example payment per
        $1,000, term range, loan minimum and maximum, lender name and issuing bank. To be supplied
        by the lender and approved by Express Kitchens.]
      </FinePrint>
      <ClosingBand
        primary={{ label: 'Check my rate', href: CHECK_RATE_HREF }}
        secondary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Ready to see what your kitchen would cost a month?"
      />
    </>
  );
}
