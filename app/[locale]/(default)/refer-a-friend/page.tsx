import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { submitReferralLead } from '~/lib/forms/submit-lead';
import { FREE_DESIGN_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Refer a Friend',
  description:
    'Know someone planning a kitchen? Send them to us. They get $[X] off their first order; you get $[X] when it ships. No limit.',
};

const FIELDS: Field[] = [
  { type: 'text', name: 'name', label: 'Your name', required: true },
  { type: 'email', name: 'email', label: 'Your email', required: true },
  {
    type: 'email',
    name: 'friendEmail',
    label: "Your friend's email, if you'd like us to send the link for you (optional)",
  },
];

export default async function ReferAFriend({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Refer a friend', href: '/refer-a-friend' }]} />
      <PageHero
        actions={[{ label: 'Get my link', href: '#link', primary: true }]}
        description="If someone you know is planning a kitchen, send them our way and you'll both do well out of it. They get $[X] off their first order over $[X], and you get $[X] when it ships, as a credit toward your next order or a gift card, whichever you prefer. There's no limit on how many friends you refer, and nothing for your friend to fill in."
        imageLabel="Two neighbours in a finished kitchen"
        kicker="Refer a friend"
        title="Give $[X]. Get $[X]."
      />
      <CategoryPoints
        fine="Reward amounts and minimum order to be confirmed."
        points={[
          { icon: 'gift', label: 'Your friend: $[X] off their first order' },
          { icon: 'price', label: 'You: $[X] credit or gift card when it ships' },
          { icon: 'zap', label: 'No limit — refer as many as you like' },
        ]}
      />
      <CardsRow
        cards={[
          {
            title: 'Share your link',
            description:
              "Enter your details below and get a personal link. Text it, email it or post it, or give us your friend's email and we send it for you.",
            imageLabel: 'Step 1',
          },
          {
            title: 'They order',
            description:
              'Your friend uses the link, or simply gives your name at a showroom. Their $[X] comes off at checkout on any order over $[X].',
            imageLabel: 'Step 2',
          },
          {
            title: 'You get paid',
            description:
              'When their order ships, your $[X] arrives by email, as a credit toward your next order or a gift card. Your choice, every time.',
            imageLabel: 'Step 3',
          },
        ]}
        hideImages
        kicker="How it works"
        tint
        title="Three steps, no forms for your friend"
      />
      <HomeSection
        description="Two fields for you, and optionally your friend's email if you'd like us to send the link."
        id="link"
        kicker="Get your link"
        title="Start referring"
      >
        <div className="rounded-3xl border border-contrast-100 bg-white p-6 @xl:p-10">
          <DynamicFormSection
            action={submitReferralLead}
            fields={FIELDS}
            submitLabel="Get my link"
          />
        </div>
      </HomeSection>
      <Prose
        actions={[{ label: 'Pro Program', href: '/pro' }]}
        body={[
          'Contractors can refer a homeowner, or another contractor. Pro Program members earn the same reward on homeowner referrals, and $[X] when a contractor they refer places a first trade order.',
        ]}
        kicker="Also for the trade"
        tint
        title="Contractors earn too"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about referrals',
          items: [
            {
              q: 'Who can I refer?',
              a: "Anyone who hasn't ordered from Express Kitchens before, in Connecticut or anywhere we deliver. Family counts.",
            },
            {
              q: 'When do I get my reward?',
              a: "When your friend's order ships, usually within [X] days of their order. You'll get an email.",
            },
            {
              q: 'Credit or gift card?',
              a: 'Your choice, each time. Credit applies to anything on the site or in a showroom.',
            },
            {
              q: 'Does it work in the showroom?',
              a: 'Yes. Your friend just gives your name at the desk and the Project Manager applies it.',
            },
            {
              q: 'Can the discount be combined with a sale or financing?',
              a: 'It stacks with 0% financing. It cannot be combined with other discount codes on the same order. (To confirm.)',
            },
          ],
        }}
      />
      <FinePrint>
        Program terms (eligibility, minimum order, reward form and timing, exclusions, how referrals
        are tracked, and the right to end the program) are to be supplied and approved by Express
        Kitchens.
      </FinePrint>
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
