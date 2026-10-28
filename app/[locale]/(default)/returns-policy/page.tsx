import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import {
  CheckTable,
  PageBreadcrumbs,
  PageHero,
  Prose,
  StepsRow,
} from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';
import { contactRows } from '~/lib/forms/fields';
import { submitReturnLead } from '~/lib/forms/submit-lead';
import { SAMPLES_HREF } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Returns',
  description:
    "Unopened items can come back within 30 days of purchase with a 30% restocking fee, once we've approved the return. What qualifies, how to do it, and what to do if something arrived damaged.",
};

const PHONE_HREF = 'tel:+18602471000';

// EK's returns policy (the policy page and the old site, the source of truth, plus EK's answers
// of 27 Oct 2026): approval first; received within 30 days of purchase at 18 Main Street,
// Bristol; unopened; 30% restocking fee; the customer pays return shipping; nothing unsellable
// is credited; and the non-returnable list. Transit damage is a carrier claim, then a call to
// EK; the fee and return shipping don't apply to it, and there's no separate damage window.
// Nothing here that EK hasn't said: no refund timing, no payment-method line, no countertop,
// window, appliance or sample rows until EK confirms them.

const FIELDS: Array<Field | Field[]> = [
  ...contactRows({ zip: false }),
  { type: 'text', name: 'orderNumber', label: 'Order number', required: true },
  {
    type: 'textarea',
    name: 'items',
    label: 'Which items you want to return, and why',
    required: true,
  },
];

export default async function ReturnsPolicy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Support', href: '/support' },
          { label: 'Returns', href: '/returns-policy' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Start a return', href: '#request', primary: true },
          { label: 'Arrived damaged?', href: '#damaged', style: 'outline' },
        ]}
        description="Changed your mind, or measured a wall wrong? Unopened items can come back within 30 days of purchase, with a 30% restocking fee, as long as we've approved the return first. Here's what qualifies, and how to do it."
        image={{
          src: '/images/pages/returns/unopened-box-dock.jpg',
          alt: 'An unopened cabinet box on a pallet at the loading dock',
        }}
        imageLabel="An unopened cabinet box on a pallet at the Bristol dock"
        kicker="Returns"
        title="Returns, in plain English"
      />
      <CategoryPoints
        fine="You pay return shipping."
        points={[
          { icon: 'clock', label: '30 days from purchase' },
          { icon: 'stock', label: 'Original, unopened packaging' },
          { icon: 'price', label: '30% restocking fee' },
          { icon: 'phone', label: 'Authorization first — 860-247-1000' },
        ]}
      />
      <HomeSection title="What can come back">
        <div className="grid gap-8 @xl:grid-cols-2 @xl:gap-12">
          <CheckTable
            items={[
              'Any item in its original, unopened packaging, received by us within 30 days of purchase, apart from the items listed here',
            ]}
            title="Can be returned"
          />
          <CheckTable
            items={[
              { text: 'Assembled cabinets', no: true },
              { text: 'RTA cabinets that have been put together', no: true },
              { text: 'Decorative hardware (knobs and pulls)', no: true },
              { text: 'Glass doors and inserts', no: true },
              {
                text: 'Moldings, fillers, panels, corbels and brackets, feet, posts and legs, valances, and other trim and accessories',
                no: true,
              },
              { text: 'Special-order items', no: true },
            ]}
            title="Can't be returned"
          />
        </div>
        <p className="mt-6 text-xs text-contrast-400">
          Items we can't resell as new aren't refunded or credited.
        </p>
      </HomeSection>
      <StepsRow
        actions={[{ label: 'Start a return', href: '#request', primary: true }]}
        kicker="How to return"
        steps={[
          {
            title: 'Get approval first',
            description:
              "Call or text 860-247-1000, or use the form below. Every return has to be approved before you send it. Returns we haven't approved aren't accepted.",
          },
          {
            title: 'Send it, or bring it',
            description:
              'Ship it at your cost, or drop it at 18 Main Street, Bristol, CT 06010. It must reach us within the 30 days, in the original unopened packaging, with the authorization number on the box.',
          },
          {
            title: 'Inspection and refund',
            description:
              'We check that it can be sold as new, then refund the price, less the 30% restocking fee.',
          },
        ]}
        tint
        title="Three steps"
      />
      <LeadFormCard
        action={submitReturnLead}
        description="We'll get back to you with your return authorization. Prefer to talk? Call or text 860-247-1000, any time."
        fields={FIELDS}
        id="request"
        kicker="Request a return authorization"
        submitLabel="Request authorization"
        title="Tell us what's coming back"
      />
      <CardsRow
        cards={[
          {
            title: 'Changed your mind within 72 hours?',
            description: "Just call. That's a free cancellation, not a return.",
          },
          {
            title: 'Shipped but not delivered yet?',
            description:
              'It can be turned around, but return freight, the original shipping and the 30% fee apply.',
          },
          {
            title: 'Mis-measured?',
            description:
              "Order the replacement first so your kitchen isn't held up, then return the wrong one within the window.",
          },
          {
            title: 'Not sure about a finish?',
            description:
              'Your first two quarter-door samples are free. Hold the door before you buy and you may never need this page.',
            ctaLabel: 'Order samples',
            href: SAMPLES_HREF,
          },
        ]}
        columns={4}
        hideImages
        kicker="Before you return"
        title="Four things worth knowing"
      />
      <div className="scroll-mt-24" id="damaged" />
      <Prose
        actions={[
          { label: 'Call 860-247-1000', href: PHONE_HREF, primary: true },
          {
            label: 'What to check on delivery day',
            href: '/shipping-policy#delivery-day',
            style: 'outline',
          },
        ]}
        body={[
          "If something was damaged on the way to you, don't return it. Note the damage on the delivery receipt before the driver leaves, then file a claim with the carrier that delivered your order. Once you've done that, call us at 860-247-1000 and we'll help with the rest.",
          "The 30% restocking fee and return shipping don't apply to items damaged in transit. Please don't assemble a damaged cabinet.",
        ]}
        image={{
          src: '/images/pages/returns/replacement-door-unwrapped.jpg',
          alt: 'A replacement cabinet door being unwrapped',
        }}
        kicker="Not a return"
        tint
        title="Arrived damaged? That's not a return"
      >
        <p className="mt-6 text-sm text-contrast-500">
          Found a defect later?{' '}
          <Link
            className="font-semibold text-foreground underline underline-offset-4"
            href="/warranty"
          >
            See the warranty
          </Link>
        </p>
      </Prose>
      <CabinetFaq
        data={{
          headline: 'Questions about returns',
          items: [
            {
              q: 'Does the 30 days start at purchase or delivery?',
              a: 'At purchase. Returns must reach us within 30 days of the date you bought the items.',
            },
            {
              q: 'Can I return part of an order?',
              a: 'Yes, any returnable item on its own. The restocking fee applies to the items you return.',
            },
            {
              q: 'I opened the box to check it. Can I still return it?',
              a: "No. Returns have to be in their original, unopened packaging. If you need to check a cabinet, keep it in its box until you're sure you need it. Once a cabinet has been put together, it can't come back.",
            },
            {
              q: 'Who pays return shipping?',
              a: 'You do. The exception is items damaged in transit, which go through a carrier claim, not a return.',
            },
          ],
        }}
      />
    </>
  );
}
