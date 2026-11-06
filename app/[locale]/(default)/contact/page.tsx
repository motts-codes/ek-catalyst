import { Mail, MapPin, Phone, Store } from 'lucide-react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow, type RowCard } from '@/vibes/soul/sections/cards-row';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';
import { Link } from '~/components/link';
import { AUDIENCE_OPTIONS } from '~/lib/forms/fields';
import { submitContactLead } from '~/lib/forms/submit-lead';
import { FACTORY_OUTLET_URL } from '~/lib/home/pro-content';

export const metadata: Metadata = {
  title: 'Contact Express Kitchens',
  description:
    'Call or text 860-247-1000 any time, day or night, email us, visit a showroom or the Bristol outlet, or send a message and the right person gets back to you.',
};

// The customer email is still to be confirmed by EK; support@ is the address the site uses
// elsewhere (secure shopping).
const CONTACT_EMAIL = 'support@expresskitchens.com';

// One row of four: the outlet gets its own card, separate from the showrooms (EK's request).
const WAYS: RowCard[] = [
  {
    icon: Phone,
    title: 'Call or text',
    description: '860-247-1000, answered 24/7.',
    ctaLabel: 'Call or text',
    href: 'tel:+18602471000',
  },
  {
    icon: Mail,
    title: 'Email',
    description: CONTACT_EMAIL,
    ctaLabel: 'Email us',
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: MapPin,
    title: 'Visit a showroom',
    description: 'Six across Connecticut, and walk-ins are welcome.',
    ctaLabel: 'Find a showroom',
    href: '/showrooms',
  },
  {
    icon: Store,
    title: 'Factory Outlet',
    description:
      '18 Main Street, Bristol. Clearance and in-stock cabinets, closets, appliances, windows and doors.',
    ctaLabel: 'Visit the outlet ↗',
    href: FACTORY_OUTLET_URL,
  },
];

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
      { label: 'A return', value: 'return' },
      { label: 'Damage or a warranty claim', value: 'warranty' },
      { label: 'A design appointment', value: 'design' },
      { label: 'Contractor or trade pricing', value: 'pro' },
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
      <CardsRow
        cardTone="alternate"
        cards={WAYS}
        columns={4}
        ctaStyle="outline"
        description="Call or text us any time, day or night, or send a message below."
        hideImages
        kicker="Get in touch"
        opensPage
        title="Talk to a real person"
      />
      <LeadFormCard
        action={submitContactLead}
        description="Tell us what you need and the right person will get back to you."
        fields={FIELDS}
        fine={
          <>
            By sending this you agree to our{' '}
            <Link className="underline" href="/terms">
              Terms
            </Link>{' '}
            and{' '}
            <Link className="underline" href="/privacy">
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
        kicker="Contact form"
        steps={STEPS}
        submitLabel="Send message"
        title="Send us a message"
      />
    </>
  );
}
