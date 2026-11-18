import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { LeadFormCard } from '@/vibes/soul/sections/lead-form-card';
import { PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';
import { submitSupportLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    "We're working toward WCAG 2.2 AA across this site. If something gets in your way, call or text 860-247-1000 or tell us online, and we'll fix it or help you another way.",
};

const FIELDS: Array<Field | Field[]> = [
  [
    { type: 'text', name: 'name', label: 'Your name', required: true },
    { type: 'text', name: 'contact', label: 'Email or phone', required: true },
  ],
  { type: 'text', name: 'page', label: 'The page or feature' },
  { type: 'textarea', name: 'message', label: 'What happened', required: true },
];

export default async function Accessibility({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Accessibility', href: '/accessibility' }]} />
      <PageHero
        actions={[{ label: 'Report a barrier', href: '#report', primary: true }]}
        description="You should be able to shop and plan a kitchen here, whatever device, browser or assistive technology you use. We're working toward the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA. If anything gets in your way, tell us and we'll fix it, or help you another way."
        image={{
          src: '/images/pages/accessibility/hero-wcag-checklist.webp',
          alt: 'Hands typing on a laptop beside a printed WCAG 2.2 AA checklist with every box ticked, on a red desk',
        }}
        kicker="Accessibility statement"
        note="Last updated November 2026."
        title="This site should work for everyone"
      />
      {/* Contact details to confirm with EK: the dedicated address (else their main one) and the
          3-business-day reply time. */}
      <CategoryPoints
        points={[
          { icon: 'tag', label: 'accessibility@expresskitchens.com' },
          { icon: 'phone', label: 'Call or text 860-247-1000, any time' },
          { icon: 'clock', label: 'We reply within 3 business days' },
        ]}
      />
      {/* Only claims the build backs up. Re-check keyboard, contrast and motion cards against the
          live build before launch; captions/transcripts and real-text cards were dropped because
          the videos sit on YouTube without transcripts and the offer banners are images. */}
      <CardsRow
        cards={[
          {
            title: 'Text for every image',
            description:
              'Product photos, door samples and offer banners have descriptive alt text, so a screen reader describes the cabinet, not the file name.',
          },
          {
            title: 'Works from the keyboard',
            description:
              'Menus, filters, forms and checkout work with Tab, Enter and the arrow keys, and you can always see where you are.',
          },
          {
            title: 'Readable contrast',
            description: 'Text and buttons are designed to meet WCAG contrast ratios.',
          },
          {
            title: 'Clear structure',
            description: 'Headings in order, labeled form fields and clear error messages.',
          },
          {
            title: 'Motion you control',
            description:
              "Slideshows pause when you hover or focus on them, and follow your device's reduced-motion setting.",
          },
          {
            title: 'Zoom without breaking',
            description: 'The site works at 200% zoom and on a phone without sideways scrolling.',
          },
        ]}
        columns={3}
        hideImages
        kicker="What we do"
        tint
        title="How the site is built to be usable"
      />
      <Prose
        body={[
          "Some parts of the site come from partners: the payment step, the embedded maps and the YouTube videos. Each partner's own accessibility statement covers those parts.",
          'Our offer banners are images. Each one has full alt text, and the offer details are written out in plain text below it.',
          "Need a spec sheet, a quote or anything else in another format? Ask us, and we'll send it in a format that works for you.",
        ]}
        kicker="Known limitations"
        title="What we're still working on"
      />
      <LeadFormCard
        action={submitSupportLead}
        description="Tell us which page and what happened. We'll reply within 3 business days."
        fields={FIELDS}
        id="report"
        image={{
          src: '/images/pages/accessibility/form-accessibility-icon.jpg',
          alt: 'A red clay disc with the white accessibility figure, a cursor arrow and a button beside it',
        }}
        kicker="Tell us what isn't working"
        submitLabel="Send"
        title="Report a barrier"
      />
    </>
  );
}
