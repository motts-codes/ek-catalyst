import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { DeliveryLadder } from '@/vibes/soul/sections/delivery-ladder';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { FormCard, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { CONTACT_FIELDS } from '~/lib/forms/fields';
import { submitReturnLead } from '~/lib/forms/submit-lead';
import { SAMPLES_HREF } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Returns',
  description:
    'Unopened items can come back within 30 days with a 30% restocking fee. Damaged, faulty or wrong items are replaced free. Here is exactly what qualifies and how to do it.',
};

const FIELDS: Field[] = [
  ...CONTACT_FIELDS.filter((f) => f.name !== 'zip'),
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
          { label: 'Report damage instead', href: '/warranty' },
        ]}
        description="Changed your mind, or measured a wall wrong? Unopened items can come back to us within 30 days, with a 30% restocking fee. If something arrived damaged, faulty or simply not what you ordered, that's not a return at all: we replace it free, with no fee and no return shipping. Here is exactly what qualifies and how to do it."
        imageLabel="An unopened cabinet box on a pallet at the Bristol dock"
        kicker="Returns"
        title="If it's not right, here's how to put it right"
      />
      <CategoryPoints
        fine="Return shipping is paid by the customer."
        points={[
          { icon: 'clock', label: '30 days from purchase' },
          { icon: 'stock', label: 'Original, unopened packaging' },
          { icon: 'price', label: '30% restocking fee' },
          { icon: 'phone', label: 'Authorization first — 860-247-1000' },
        ]}
      />
      <DeliveryLadder
        columns={['Item', 'Returnable?', 'Condition', 'Fee']}
        footnote="Any returned product found unsellable on inspection receives no credit or refund. Free-shipping orders are refunded less the actual outbound shipping cost. (To confirm.)"
        rows={[
          [
            '!Ready-to-assemble cabinets, still boxed',
            'Yes, within 30 days',
            'Original, unopened packaging',
            '30% restocking',
          ],
          ['!RTA cabinets you have assembled', 'No', '—', '—'],
          ['!Assembled cabinets', 'No', '—', '—'],
          [
            '!Closet components, boxed',
            'Yes, within 30 days',
            'Original, unopened packaging',
            '30% restocking',
          ],
          [
            '!Sinks and faucets, boxed',
            'Yes, within 30 days',
            'Original, unopened packaging',
            '30% restocking',
          ],
          ['!Decorative hardware (knobs and pulls)', 'No', '—', '—'],
          ['!Glass doors or inserts', 'No', '—', '—'],
          ['!Moldings, fillers, panels, trim and accessories', 'No', '—', '—'],
          ['!Special-order items', 'No', '—', '—'],
          ['!Countertops', 'No — cut to your kitchen', '—', '—'],
          ['!Windows and appliances', "Manufacturer's policy (to confirm)", '—', '—'],
          ['!Door samples', '[X] (to confirm)', '—', '—'],
        ]}
        tint
        title="What can come back"
      />
      <CardsRow
        cards={[
          {
            title: 'Get authorization',
            description:
              'Call 860-247-1000 or use the form below within 30 days of purchase. Every return must be authorized before it ships; unauthorized returns are refused.',
            imageLabel: 'Step 1',
          },
          {
            title: 'Send it, or bring it',
            description:
              'Ship it at your cost, or drop it at 18 Main Street, Bristol, CT 06010. It must reach us within the 30 days, in the original unopened packaging, with the authorization number on the box.',
            imageLabel: 'Step 2',
          },
          {
            title: 'Inspection and refund',
            description:
              'We check that it can be sold as new, then refund the item price less the 30% restocking fee to your original payment method within [X] business days.',
            imageLabel: 'Step 3',
          },
        ]}
        hideImages
        kicker="How to return"
        title="Three steps"
      />
      <HomeSection
        description="We reply within one business day with your authorization number and the return address."
        id="request"
        kicker="Request a return authorization"
        tint
        title="Tell us what's coming back"
      >
        <FormCard>
          <DynamicFormSection
            action={submitReturnLead}
            fields={FIELDS}
            submitLabel="Request authorization"
          />
        </FormCard>
      </HomeSection>
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
      <Prose
        actions={[{ label: 'Report damage', href: '/warranty', primary: true }]}
        body={[
          "If something arrived damaged, faulty or not what you ordered, we replace it free. That's a claim, not a return, so there's no restocking fee and no return shipping. Note visible damage on the driver's paperwork, send us photos of the whole item within 5 days for concealed damage, and please don't assemble a damaged cabinet. Replacement parts ship first, and if three replacements fail to fix it, we refund the cabinet.",
        ]}
        imageLabel="A replacement door being unwrapped"
        kicker="Not a return"
        tint
        title="Damaged, faulty or wrong? We replace it"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about returns',
          items: [
            {
              q: 'Does the 30 days start at purchase or delivery?',
              a: 'At purchase, under the current policy. [Recommended: from delivery. To confirm.]',
            },
            {
              q: 'Can I return part of an order?',
              a: 'Yes, any returnable item on its own. The restocking fee applies to the items you return.',
            },
            {
              q: 'I opened the box to check it. Can I still return it?',
              a: 'Only if it is repacked in the original packaging with all its parts and can be sold as new. Once a cabinet has been assembled it cannot come back.',
            },
            {
              q: 'Who pays return shipping?',
              a: 'You do, unless the item was damaged, faulty or wrong, in which case we replace it free.',
            },
          ],
        }}
      />
    </>
  );
}
