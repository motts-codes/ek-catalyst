import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';
import { AUDIENCE_OPTIONS } from '~/lib/forms/fields';
import { submitContactLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Contact Express Kitchens',
  description:
    'A question about an order, a product or a project? Send it here and the right person replies within one business day. Or call or text 860-247-1000, 24/7.',
};

// Three short steps instead of one long form: what it's about, who you are, how to reach you.
// Every field stays mounted across steps, so the same submit action receives the same names.
const FIELDS: Array<Field | Field[]> = [
  {
    type: 'select',
    name: 'topic',
    label: 'This is about',
    options: [
      { label: 'A product question', value: 'product' },
      { label: 'An existing order', value: 'order' },
      { label: 'Delivery or pickup', value: 'delivery' },
      { label: 'Damage or a warranty claim', value: 'warranty' },
      { label: 'A design appointment', value: 'design' },
      { label: 'Trade / Pro Program', value: 'pro' },
      { label: 'Something else', value: 'other' },
    ],
  },
  { type: 'text', name: 'orderNumber', label: 'Order number, if you have one' },
  { type: 'textarea', name: 'message', label: 'Your message', required: true },
  { type: 'select', name: 'audience', label: 'I am a…', options: AUDIENCE_OPTIONS },
  [
    { type: 'text', name: 'firstName', label: 'First name', required: true },
    { type: 'text', name: 'lastName', label: 'Last name', required: true },
  ],
  { type: 'text', name: 'zip', label: 'ZIP code' },
  [
    { type: 'email', name: 'email', label: 'Email', required: true },
    { type: 'tel', name: 'phone', label: 'Phone' },
  ],
  {
    type: 'checkbox',
    name: 'smsConsent',
    label:
      'I agree to receive text messages from Express Kitchens at the number above. Message frequency may vary; data rates may apply. Text HELP to 860-247-1000 for help, STOP to opt out.',
  },
];

const STEPS = [
  { title: 'Your question', names: ['topic', 'orderNumber', 'message'] },
  { title: 'About you', names: ['audience', 'firstName', 'lastName', 'zip'] },
  { title: 'How to reach you', names: ['email', 'phone', 'smsConsent'] },
];

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Contact', href: '/contact' }]} />
      <PageHero
        actions={[
          { label: 'Call or text 860-247-1000', href: 'tel:+18602471000', primary: true },
          { label: 'Read the FAQ', href: '/faq' },
        ]}
        description="Whether it's a question about an order, a product you're weighing up or a project you're planning, send it here and the right person will reply within one business day. If it can't wait, call or text us any time, day or night. And if you're wondering about delivery, returns or how samples work, the FAQ may already have your answer."
        image={{
          src: '/images/pages/contact/bristol-factory-exterior.jpg',
          alt: 'The factory and outlet building from outside',
        }}
        imageLabel="The Bristol factory and outlet, wide"
        kicker="Contact"
        title="Talk to Express Kitchens"
      />
      <LeadFormCard
        action={submitContactLead}
        description="We reply within one business day."
        fields={FIELDS}
        fine={
          <>
            By sending this you agree to our{' '}
            <Link className="underline" href="#">
              Terms
            </Link>{' '}
            and{' '}
            <Link className="underline" href="#">
              Privacy Policy
            </Link>
            , and to be contacted using the details you&apos;ve given.
          </>
        }
        id="message"
        image={{
          src: '/images/pages/measuring/designer-customer-screen.jpg',
          alt: 'A designer and a customer looking at a kitchen plan on a showroom screen',
        }}
        kicker="Send a message"
        steps={STEPS}
        submitLabel="Send message"
        title="Tell us what you need"
      />
    </>
  );
}
