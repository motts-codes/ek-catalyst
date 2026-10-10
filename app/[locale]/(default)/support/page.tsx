import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import {
  FormCard,
  LinkCards,
  PageBreadcrumbs,
  PageHero,
  Prose,
} from '@/vibes/soul/sections/page-kit';
import { ShowroomBand } from '@/vibes/soul/sections/showroom-band';
import { submitSupportLead } from '~/lib/forms/submit-lead';
import { SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Phone, showroom contacts or a form. Order status, changes, pickups, and the policies that answer most questions.',
};

const FIELDS: Field[] = [
  { type: 'text', name: 'name', label: 'Your name', required: true },
  { type: 'email', name: 'email', label: 'Email', required: true },
  { type: 'text', name: 'orderNumber', label: 'Order number, if you have one' },
  { type: 'textarea', name: 'message', label: 'How can we help?', required: true },
];

export default async function Support({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Support', href: '/support' }]} />
      <PageHero
        actions={[
          { label: 'Call 860-247-1000', href: 'tel:+18602471000', primary: true },
          { label: 'Send a message', href: '#message' },
        ]}
        description="Whether you're checking on an order, changing a delivery date, arranging a pickup or just not sure who to ask, start here. The quickest route is the phone, Monday to Saturday 9 AM to 6 PM Eastern; otherwise send us a message and the right person will reply within one business day. Most questions are already answered on the four pages below."
        kicker="Support"
        textOnly
        title="How can we help?"
      />
      <LinkCards
        cards={[
          {
            title: 'FAQ',
            description:
              'Ordering, delivery, RTA vs assembled, materials, measuring, samples and more.',
            href: '/faq',
            linkLabel: 'Read the FAQ',
          },
          {
            title: 'Shipping & pickup',
            description: 'How each thing gets to you, what it costs and how long it takes.',
            href: '/shipping-policy',
            linkLabel: 'Shipping & pickup',
          },
          {
            title: 'Returns',
            description: 'What can come back, the restocking fee, and how to get authorization.',
            href: '/returns-policy',
            linkLabel: 'Returns',
          },
          {
            title: 'Warranty',
            description: "What's covered, for how long, and what counts as a defect.",
            href: '/warranty',
            linkLabel: 'Warranty',
          },
          {
            title: 'Price match',
            description: "Bring a competitor's quote and we'll beat it, or pay you $500.",
            href: '/price-match-guarantee',
            linkLabel: 'Price match',
          },
          {
            title: 'Secure shopping',
            description: 'How your payment and your details are protected.',
            href: '/secure-shopping',
            linkLabel: 'Secure shopping',
          },
        ]}
        columns={3}
        kicker="Policies"
        tint
        title="The pages that answer most questions"
      />
      <Prose
        body={[
          'For order status, changes to an order placed in the last 72 hours, or to arrange a pickup from Bristol, call 860-247-1000 with your order number to hand. Changes after 72 hours may not be possible without additional fees, so the sooner you call, the better.',
        ]}
        kicker="Order help"
        title="Status, changes and pickups"
      />
      <HomeSection id="message" kicker="Send a message" tint title="Tell us what you need">
        <FormCard>
          <DynamicFormSection action={submitSupportLead} fields={FIELDS} submitLabel="Send" />
        </FormCard>
      </HomeSection>
      <ShowroomBand
        kicker="Or talk to someone in person"
        showrooms={SHOWROOMS}
        title="Six showrooms across Connecticut"
      />
    </>
  );
}
